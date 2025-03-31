
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import AuthGuard from "@/components/AuthGuard";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Index from "@/pages/Index";

// Auth Pages
import LoginPage from "@/pages/AuthPages/LoginPage";
import SignupPage from "@/pages/AuthPages/SignupPage";

// Admin Pages
import DashboardPage from "@/pages/Dashboard/DashboardPage";
import PremisesPage from "@/pages/Premises/PremisesPage";
import QRCodePage from "@/pages/QRCode/QRCodePage";

// Visitor Pages (public)
import VisitorSignIn from "@/pages/Visitor/VisitorSignIn";
import VisitorSignOut from "@/pages/Visitor/VisitorSignOut";

// Not Found Page
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AuthGuard>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              
              {/* Visitor Routes - Public but don't need auth guard checks */}
              <Route path="/visitor/signin" element={<VisitorSignIn />} />
              <Route path="/visitor/signout" element={<VisitorSignOut />} />
              
              {/* Protected Admin Routes - Using Layout */}
              <Route path="/dashboard" element={<DashboardLayout><DashboardPage /></DashboardLayout>} />
              <Route path="/premises" element={<DashboardLayout><PremisesPage /></DashboardLayout>} />
              <Route path="/qrcodes" element={<DashboardLayout><QRCodePage /></DashboardLayout>} />
              
              {/* Redirect from root */}
              <Route path="/" element={<Index />} />
              
              {/* Catch-all Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthGuard>
        </TooltipProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
