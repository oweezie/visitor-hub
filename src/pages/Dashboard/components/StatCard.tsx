
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowUpRight } from "lucide-react";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactElement;
  trend?: {
    value: number;
    label: string;
  };
  footer?: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, trend, footer }) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h3 className="text-3xl font-bold mt-1">{value}</h3>
          </div>
          <div className="bg-primary/10 p-3 rounded-full">
            {icon}
          </div>
        </div>
        {trend && (
          <div className="mt-4 flex items-center text-xs text-muted-foreground">
            <ArrowUpRight className="h-3 w-3 mr-1 text-green-500" />
            <span className="text-green-500 font-medium">{trend.value}%</span>
            <span className="ml-1">{trend.label}</span>
          </div>
        )}
        {footer && (
          <div className="mt-4 text-xs text-muted-foreground">
            {footer}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StatCard;
