
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface AuthGuardProps {
  children: React.ReactNode;
}

// Public routes that don't require authentication
const publicRoutes = ["/login", "/signup", "/visitor/signin", "/visitor/signout"];

const AuthGuard = ({ children }: AuthGuardProps) => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    if (!isLoading) {
      const isPublicRoute = publicRoutes.some(route => 
        location.pathname.startsWith(route)
      );
      
      // If not authenticated and trying to access a protected route
      if (!isAuthenticated && !isPublicRoute) {
        // Redirect to login
        navigate("/login", { replace: true });
      } 
      // If authenticated and trying to access login or signup
      else if (isAuthenticated && (location.pathname === "/login" || location.pathname === "/signup")) {
        // Redirect to dashboard
        navigate("/dashboard", { replace: true });
      }
    }
  }, [isAuthenticated, isLoading, location.pathname, navigate]);
  
  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return <>{children}</>;
};

export default AuthGuard;
