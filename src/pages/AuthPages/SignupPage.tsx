
import { Link } from "react-router-dom";
import SignupForm from "@/components/forms/SignupForm";
import { QrCode, Shield, Lock, UserPlus } from "lucide-react";

const SignupPage = () => {
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
            Create an account to start managing your visitors efficiently and securely.
          </p>
          
          <div className="space-y-6 mt-8">
            <div className="flex items-center space-x-4 bg-white/10 p-4 rounded-lg text-left">
              <UserPlus className="h-8 w-8 flex-shrink-0" />
              <div>
                <h3 className="font-semibold">Easy Registration</h3>
                <p className="text-sm opacity-90">Set up your account in minutes and start managing visitors immediately</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 bg-white/10 p-4 rounded-lg text-left">
              <Shield className="h-8 w-8 flex-shrink-0" />
              <div>
                <h3 className="font-semibold">Enhanced Security</h3>
                <p className="text-sm opacity-90">Keep track of everyone entering and leaving your premises</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 bg-white/10 p-4 rounded-lg text-left">
              <Lock className="h-8 w-8 flex-shrink-0" />
              <div>
                <h3 className="font-semibold">Data Protection</h3>
                <p className="text-sm opacity-90">Your information is securely stored and protected</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right side - Signup form */}
      <div className="p-8 flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="w-full max-w-md">
          <SignupForm />
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Already have an account?{" "}
              <Link to="/login" className="text-primary hover:underline">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
