import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardStats, RecentActivity } from "@/types";

// Import our new components
import DashboardHeader from "./components/DashboardHeader";
import StatsSection from "./components/StatsSection";
import VisitorTrendChart from "./components/VisitorTrendChart";
import VisitorStatusChart from "./components/VisitorStatusChart";
import RecentActivityComponent from "./components/RecentActivity";
import QuickActions from "./components/QuickActions";

const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalVisitors: 0,
    activeVisitors: 0,
    averageDuration: "0h 0m",
    recentSignIns: 0,
    recentSignOuts: 0,
    signInsByPremise: [],
    visitorHistory: [],
    visitorStatuses: [],
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);

  const fetchDashboardStats = async () => {
    setLoading(true);
    try {
      const response = await api.get<DashboardStats>("/stats/dashboard/");
      console.log("Dashboard stats response:", response);
      
      // If the response itself is undefined or null, create a default empty stats object
      if (!response) {
        console.warn("Dashboard stats response is undefined");
        setStats({
          totalVisitors: 0,
          activeVisitors: 0,
          averageDuration: "0h 0m",
          recentSignIns: 0,
          recentSignOuts: 0,
          signInsByPremise: [],
          visitorHistory: [],
          visitorStatuses: [],
          recentActivity: []
        });
        return;
      }
      
      // Safely handle the dashboard data whether it has recentActivity or not
      const dashboardData = response.data || response; // Handle both possible response formats
      
      // Create a data object with defaults for all properties
      const normalizedData = {
        totalVisitors: dashboardData.totalVisitors || 0,
        activeVisitors: dashboardData.activeVisitors || 0,
        averageDuration: dashboardData.averageDuration || "0h 0m",
        recentSignIns: dashboardData.recentSignIns || 0,
        recentSignOuts: dashboardData.recentSignOuts || 0,
        signInsByPremise: dashboardData.signInsByPremise || [],
        visitorHistory: dashboardData.visitorHistory || [],
        visitorStatuses: dashboardData.visitorStatuses || [],
        recentActivity: dashboardData.recentActivity || []
      };
      
      // Set the normalized data to state
      setStats(normalizedData);
      
      // Only if we need to fetch activity data separately and the endpoint exists
      if (normalizedData.recentActivity.length === 0) {
        try {
          // Get activity data in a separate call
          const activityResponse = await api.get<RecentActivity[]>("/stats/recent-activity/");
          if (activityResponse && Array.isArray(activityResponse.data || activityResponse)) {
            const activityData = activityResponse.data || activityResponse;
            
            // Update state with the activity data
            setStats(prevStats => ({
              ...prevStats,
              recentActivity: activityData
            }));
          }
        } catch (activityError) {
          console.error("Error fetching recent activity:", activityError);
          // Keep the empty array for recentActivity
        }
      }
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      // Set default values in case of error
      setStats({
        totalVisitors: 0,
        activeVisitors: 0,
        averageDuration: "0h 0m",
        recentSignIns: 0,
        recentSignOuts: 0,
        signInsByPremise: [],
        visitorHistory: [],
        visitorStatuses: [],
        recentActivity: []
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 mt-0"> {/* Removed vertical padding completely, use margin-top instead */}
      {/* Dashboard Header */}
      <DashboardHeader 
        username={user?.username} 
        onRefresh={fetchDashboardStats} 
      />
      
      {/* Stats Cards */}
      <StatsSection
        totalVisitors={stats.totalVisitors}
        activeVisitors={stats.activeVisitors}
        averageDuration={stats.averageDuration}
        recentSignIns={stats.recentSignIns}
        recentSignOuts={stats.recentSignOuts}
      />
      
      {/* Visitor Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <VisitorTrendChart data={stats.visitorHistory} />
        <VisitorStatusChart data={stats.visitorStatuses} />
      </div>
      
      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RecentActivityComponent activities={stats.recentActivity || []} />
        <QuickActions />
      </div>
    </div>
  );
};

export default DashboardPage;
