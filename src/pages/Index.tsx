import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Redirects to the proper entry point
const Index = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check if there's a premise ID in the URL (from QR code scan)
    const urlParams = new URLSearchParams(window.location.search);
    const premiseId = urlParams.get('premiseId');
    
    if (premiseId) {
      // If we have a premise ID, redirect to visitor sign-in
      const premiseName = urlParams.get('premiseName') || '';
      navigate(`/visitor/signin?premiseId=${premiseId}&premiseName=${premiseName}`);
    } else {
      // Otherwise, check auth status
      const token = localStorage.getItem("access_token");
      if (token) {
        navigate("/dashboard");
      } else {
        navigate("/login");
      }
    }
  }, [navigate]);
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  );
};

export default Index;
