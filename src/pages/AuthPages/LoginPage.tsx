import { Link } from "react-router-dom";
import LoginForm from "@/components/forms/LoginForm";
import { QrCode } from "lucide-react";

const LoginPage = () => {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left side - Branding and info */}
      <div className="bg-primary text-white p-8 flex-1 flex flex-col justify-center items-center md:max-w-md lg:max-w-lg">
        <div className="max-w-md mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-white/10 p-4 rounded-full">
              <QrCode className="h-12 w-12" />
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-4">Visitor Management System</h1>
          <p className="mb-6 opacity-90">
            A secure and efficient way to manage visitors at your premises. Sign in to access your dashboard.
          </p>
          <div className="grid grid-cols-2 gap-4 mt-8">
            <div className="bg-white/10 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Visitor Tracking</h3>
              <p className="text-sm opacity-90">Real-time monitoring of all visitors</p>
            </div>
            <div className="bg-white/10 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">QR Check-In</h3>
              <p className="text-sm opacity-90">Fast and contactless visitor registration</p>
            </div>
            <div className="bg-white/10 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Premises Management</h3>
              <p className="text-sm opacity-90">Manage multiple locations easily</p>
            </div>
            <div className="bg-white/10 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Analytics</h3>
              <p className="text-sm opacity-90">Insights on visitor patterns</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right side - Login form */}
      <div className="p-8 flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="w-full max-w-md">
          <LoginForm />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
