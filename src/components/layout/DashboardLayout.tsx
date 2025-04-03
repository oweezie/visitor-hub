
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  Building,
  Menu,
  Users,
  LogOut,
  Home,
  QrCode,
  AlarmClock,
  User
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarItemProps {
  icon: React.ElementType;
  title: string;
  path: string;
  isActive: boolean;
}

const SidebarItem = ({ icon: Icon, title, path, isActive }: SidebarItemProps) => (
  <Link to={path}>
    <div
      className={cn(
        "flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors",
        isActive
          ? "bg-primary/10 text-primary font-medium"
          : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
      )}
    >
      <Icon className="h-5 w-5" />
      <span>{title}</span>
    </div>
  </Link>
);

const MobileHeader = ({ toggleSidebar }: { toggleSidebar: () => void }) => {
  const { user } = useAuth();
  
  return (
    <div className="bg-white dark:bg-gray-900 border-b dark:border-gray-800 h-16 flex items-center justify-between px-4 lg:hidden">
      <div className="flex items-center">
        <Button variant="ghost" size="icon" onClick={toggleSidebar}>
          <Menu className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-semibold ml-4">Visitor Hub</h1>
      </div>
      <div className="flex items-center">
        <span className="text-sm font-medium mr-2">{user?.username}</span>
        <div className="bg-primary/10 text-primary h-8 w-8 rounded-full flex items-center justify-center">
          <User className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
};

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { logout } = useAuth();
  const { user } = useAuth();
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  const navigationItems = [
    { title: "Dashboard", path: "/dashboard", icon: Home },
    { title: "Premises", path: "/premises", icon: Building },
    { title: "Visitors", path: "/visitors", icon: Users },
    { title: "QR Codes", path: "/qrcodes", icon: QrCode },
    { title: "Evacuation List", path: "/evacuation", icon: AlarmClock },
    { title: "Analytics", path: "/analytics", icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Mobile Header */}
      <MobileHeader toggleSidebar={toggleSidebar} />
      
      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 border-r dark:border-gray-800 transition-transform duration-300 ease-in-out transform lg:translate-x-0 lg:static",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Sidebar Header */}
        <div className="flex flex-col h-full">
          <div className="h-16 flex items-center px-6 border-b dark:border-gray-800">
            <h1 className="text-xl font-bold">Visitor Hub</h1>
          </div>
          
          {/* User Profile */}
          <div className="p-4 border-b dark:border-gray-800">
            <div className="flex items-center space-x-3">
              <div className="bg-primary/10 text-primary h-10 w-10 rounded-full flex items-center justify-center">
                <User className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">{user?.username}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
              </div>
            </div>
          </div>
          
          {/* Navigation */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {navigationItems.map((item) => (
              <SidebarItem
                key={item.path}
                icon={item.icon}
                title={item.title}
                path={item.path}
                isActive={location.pathname === item.path}
              />
            ))}
          </div>
          
          {/* Logout */}
          <div className="p-4 border-t dark:border-gray-800">
            <Button
              variant="ghost"
              className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
              onClick={logout}
            >
              <LogOut className="h-5 w-5 mr-3" />
              Logout
            </Button>
          </div>
        </div>
      </div>
      
      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}
      
      {/* Content */}
      <div className="lg:pl-64">
        <main className="p-0 md:p-2 max-w-7xl mx-auto mt-0"> {/* Removed all padding and top margin */}
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
