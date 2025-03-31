
import React from "react";
import StatCard from "./StatCard";
import { Users, CheckCircle2, Clock, Calendar, LogIn, LogOut } from "lucide-react";

interface StatsSectionProps {
  totalVisitors: number;
  activeVisitors: number;
  averageDuration: string;
  recentSignIns: number;
  recentSignOuts: number;
}

const StatsSection: React.FC<StatsSectionProps> = ({
  totalVisitors,
  activeVisitors,
  averageDuration,
  recentSignIns,
  recentSignOuts
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Total Visitors"
        value={totalVisitors}
        icon={<Users className="h-6 w-6 text-primary" />}
        trend={{ value: 12, label: "from last month" }}
      />
      
      <StatCard
        title="Active Visitors"
        value={activeVisitors}
        icon={<CheckCircle2 className="h-6 w-6 text-green-500" />}
        footer={
          <span>{Math.round((activeVisitors / totalVisitors) * 100)}% of total visitors</span>
        }
      />
      
      <StatCard
        title="Avg. Visit Duration"
        value={averageDuration}
        icon={<Clock className="h-6 w-6 text-blue-500" />}
        footer={<span>Based on last 30 days</span>}
      />
      
      <StatCard
        title="Today's Activity"
        value={recentSignIns + recentSignOuts}
        icon={<Calendar className="h-6 w-6 text-purple-500" />}
        footer={
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center">
              <LogIn className="h-3 w-3 mr-1 text-green-500" />
              <span><span className="font-medium">{recentSignIns}</span> Sign-ins</span>
            </div>
            <div className="flex items-center">
              <LogOut className="h-3 w-3 mr-1 text-red-500" />
              <span><span className="font-medium">{recentSignOuts}</span> Sign-outs</span>
            </div>
          </div>
        }
      />
    </div>
  );
};

export default StatsSection;
