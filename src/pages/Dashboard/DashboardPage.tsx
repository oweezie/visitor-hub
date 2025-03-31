import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  LogIn, 
  LogOut, 
  Users, 
  UserMinus,
  ArrowUpRight,
  QrCode,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { DashboardStats, RecentActivity } from "@/types";

// Colors for the pie chart
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

// Helper function to format timestamp to relative time (e.g., "2 hours ago")
const formatTimeAgo = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return `${diffInSeconds} seconds ago`;
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} ${diffInMinutes === 1 ? 'min' : 'mins'} ago`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
};

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
  const navigate = useNavigate();

  const fetchDashboardStats = async () => {
    setLoading(true);
    try {
      const response = await api.get<DashboardStats>("/stats/dashboard/");
      
      // Check if recentActivity is present; if not, attempt to fetch it separately
      if (!response.recentActivity) {
        try {
          const activityResponse = await api.get<RecentActivity[]>("/stats/recent-activity/");
          response.recentActivity = activityResponse;
        } catch (activityError) {
          console.error("Error fetching recent activity:", activityError);
        }
      }
      
      setStats(response as DashboardStats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      // Optionally show a toast error here
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
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user?.username}! Here's what's happening today.</p>
        </div>
        <div className="flex space-x-2 mt-4 md:mt-0">
          <Button 
            variant="outline" 
            onClick={fetchDashboardStats}
            className="mr-2"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh Data
          </Button>
          <Button 
            variant="outline" 
            onClick={() => navigate("/premises")}
          >
            <Users className="mr-2 h-4 w-4" />
            Manage Premises
          </Button>
          <Button onClick={() => navigate("/qrcodes")}>
            <QrCode className="mr-2 h-4 w-4" />
            QR Code Generator
          </Button>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Visitors</p>
                <h3 className="text-3xl font-bold mt-1">{stats.totalVisitors}</h3>
              </div>
              <div className="bg-primary/10 p-3 rounded-full">
                <Users className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs text-muted-foreground">
              <ArrowUpRight className="h-3 w-3 mr-1 text-green-500" />
              <span className="text-green-500 font-medium">12%</span>
              <span className="ml-1">from last month</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Visitors</p>
                <h3 className="text-3xl font-bold mt-1">{stats.activeVisitors}</h3>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <CheckCircle2 className="h-6 w-6 text-green-500" />
              </div>
            </div>
            <div className="mt-4 text-xs text-muted-foreground">
              <span>{Math.round((stats.activeVisitors / stats.totalVisitors) * 100)}% of total visitors</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg. Visit Duration</p>
                <h3 className="text-3xl font-bold mt-1">{stats.averageDuration}</h3>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Clock className="h-6 w-6 text-blue-500" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs text-muted-foreground">
              <span>Based on last 30 days</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Today's Activity</p>
                <h3 className="text-3xl font-bold mt-1">{stats.recentSignIns + stats.recentSignOuts}</h3>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <Calendar className="h-6 w-6 text-purple-500" />
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center">
                <LogIn className="h-3 w-3 mr-1 text-green-500" />
                <span><span className="font-medium">{stats.recentSignIns}</span> Sign-ins</span>
              </div>
              <div className="flex items-center">
                <LogOut className="h-3 w-3 mr-1 text-red-500" />
                <span><span className="font-medium">{stats.recentSignOuts}</span> Sign-outs</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Visitor Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Visitor History Line Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart className="h-5 w-5 mr-2 text-muted-foreground" />
              <span>Visitor Trend - Past Week</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={stats.visitorHistory}
                  margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }} 
                    tickLine={false}
                    axisLine={{ stroke: "#e5e7eb" }}
                  />
                  <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="visitors" 
                    stroke="#6366F1" 
                    strokeWidth={3}
                    dot={{ fill: "#6366F1", r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        {/* Visitor Status Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2 text-muted-foreground" />
              <span>Visitor Status Distribution</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center">
              <div className="w-full h-full flex items-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.visitorStatuses}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {stats.visitorStatuses.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {stats.visitorStatuses.map((status, index) => (
                <div key={status.name} className="flex items-center">
                  <div 
                    className="h-3 w-3 rounded-full mr-2" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-sm">
                    {status.name}: <strong>{status.value}</strong>
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Visitor Activity */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle>Recent Visitor Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentActivity && stats.recentActivity.length > 0 ? (
                stats.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-full mt-1 ${activity.activityType === 'sign_in' ? 'bg-green-100' : 'bg-red-100'}`}>
                        {activity.activityType === 'sign_in' ? 
                          <LogIn className="h-4 w-4 text-green-600" /> : 
                          <LogOut className="h-4 w-4 text-red-600" />
                        }
                      </div>
                      <div>
                        <p className="font-medium">
                          {activity.visitorName} {activity.activityType === 'sign_in' ? 'signed in' : 'signed out'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {activity.activityType === 'sign_in' 
                            ? `Arrived at ${activity.premise || 'premises'}${activity.notes ? ` for ${activity.notes}` : ''}`
                            : `Left after ${activity.duration || 'visit'}`
                          }
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatTimeAgo(activity.timestamp)}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  No recent activity to display
                </div>
              )}
            </div>
            <Button 
              variant="link" 
              className="mt-2 px-0"
              onClick={() => navigate("/activity")}
            >
              View all activity
            </Button>
          </CardContent>
        </Card>
        
        {/* Quick Actions */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start" onClick={() => navigate("/premises")}>
                <Users className="mr-2 h-4 w-4" />
                Manage Premises
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => navigate("/qrcodes")}>
                <QrCode className="mr-2 h-4 w-4" />
                Generate QR Codes
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => navigate("/visitors/pending")}>
                <Clock className="mr-2 h-4 w-4" />
                Approve Pending Visitors
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => navigate("/evacuation")}>
                <LogOut className="mr-2 h-4 w-4" />
                Generate Evacuation List
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
