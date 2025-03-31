
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { LogIn, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { RecentActivity as RecentActivityType } from "@/types";

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

interface RecentActivityProps {
  activities: RecentActivityType[];
}

const RecentActivityComponent: React.FC<RecentActivityProps> = ({ activities }) => {
  const navigate = useNavigate();
  
  return (
    <Card className="lg:col-span-2">
      <CardHeader className="pb-2">
        <CardTitle>Recent Visitor Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities && activities.length > 0 ? (
            activities.map((activity) => (
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
  );
};

export default RecentActivityComponent;
