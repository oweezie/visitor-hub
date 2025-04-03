
import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Users, QrCode } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface DashboardHeaderProps {
  username: string | undefined;
  onRefresh: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ username, onRefresh }) => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-2"> {/* Added margin-bottom instead of relying on parent spacing */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {username}! Here's what's happening today.</p>
      </div>
      <div className="flex space-x-2 mt-3 md:mt-0"> {/* Reduced top margin on mobile */}
        <Button 
          variant="outline" 
          onClick={onRefresh}
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
  );
};

export default DashboardHeader;
