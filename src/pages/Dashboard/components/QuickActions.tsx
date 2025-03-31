
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, QrCode, Clock, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

const QuickActions: React.FC = () => {
  const navigate = useNavigate();
  
  return (
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
  );
};

export default QuickActions;
