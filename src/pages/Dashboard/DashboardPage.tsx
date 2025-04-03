
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
      const dashboardData = await api.get<DashboardStats>("/stats/dashboard/");
      
      // Check if we need to fetch activity data separately
      if (!dashboardData.recentActivity || dashboardData.recentActivity.length === 0) {
        try {
          // Get activity data in a separate call
          const activityData = await api.get<RecentActivity[]>("/stats/recent-activity/");
          
          // Create a new object with all properties from dashboardData plus the activity data
          setStats({
            ...dashboardData,
            recentActivity: activityData
          });
        } catch (activityError) {
          console.error("Error fetching recent activity:", activityError);
          setStats(dashboardData);
        }
      } else {
        setStats(dashboardData);
      }
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
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
    <div className="space-y-4 py-0"> {/* Reduced vertical spacing */}
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
