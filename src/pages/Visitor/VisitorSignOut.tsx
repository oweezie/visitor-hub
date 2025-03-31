
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/axios";
import { FileCheck, LogOut, MapPin, Clock, Info, AlertCircle } from "lucide-react";

interface VisitorInfo {
  id: string;
  first_name: string;
  last_name: string;
  check_in_time: string;
  premise_name: string;
}

const VisitorSignOut = () => {
  const [searchParams] = useSearchParams();
  const premiseId = searchParams.get("premiseId");
  const premiseName = searchParams.get("premiseName") || "Unknown Premise";
  
  const [visitorInfo, setVisitorInfo] = useState<VisitorInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { toast } = useToast();
  
  useEffect(() => {
    const identifyVisitor = async () => {
      if (!premiseId) {
        setError("Missing premise information. Please scan the QR code again.");
        setIsLoading(false);
        return;
      }
      
      try {
        // In a real implementation, this would call an API that identifies the visitor
        // based on IP address, device, or other criteria handled by the backend
        // const response = await api.get(`/visitors/identify?premise_id=${premiseId}`);
        
        // Mock data for demonstration
        setTimeout(() => {
          setVisitorInfo({
            id: "visitor123",
            first_name: "John",
            last_name: "Doe",
            check_in_time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
            premise_name: premiseName
          });
          setIsLoading(false);
        }, 1000);
        
      } catch (error) {
        console.error("Error identifying visitor:", error);
        setError("Unable to identify your visit. Please contact the front desk.");
        setIsLoading(false);
      }
    };
    
    identifyVisitor();
  }, [premiseId, premiseName]);
  
  const handleSignOut = async () => {
    if (!visitorInfo) return;
    
    try {
      setIsSubmitting(true);
      
      // In a real implementation, this would call the sign-out API
      // await api.post(`/visitors/${visitorInfo.id}/signout/`);
      
      // Mock successful sign-out
      setTimeout(() => {
        setIsSuccess(true);
        toast({
          title: "Sign-out successful",
          description: "Thank you for your visit!",
        });
      }, 1000);
      
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Sign-out failed",
        description: "An error occurred while processing your sign-out",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Identifying Visit</CardTitle>
            <CardDescription>
              Please wait while we retrieve your visit information
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-6">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto bg-red-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl">Unable to Process</CardTitle>
            <CardDescription>
              We encountered an issue with your sign-out
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground">{error}</p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button variant="outline" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  // Success state
  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto bg-green-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
              <FileCheck className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Signed Out Successfully</CardTitle>
            <CardDescription>
              Thank you for your visit!
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg border">
              <div className="flex items-center mb-2">
                <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                <span className="font-medium">{visitorInfo?.premise_name}</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2 text-gray-500" />
                <span>{new Date().toLocaleString()}</span>
              </div>
            </div>
            <p className="font-medium">
              We hope to see you again soon!
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Normal sign-out state
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Visitor Sign-Out</CardTitle>
          <CardDescription>
            Please confirm your details to sign out
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg border space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Visitor:</span>
              <span className="font-medium">{`${visitorInfo?.first_name} ${visitorInfo?.last_name}`}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Premise:</span>
              <span>{visitorInfo?.premise_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Check-in Time:</span>
              <span>{new Date(visitorInfo?.check_in_time || "").toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Duration:</span>
              <span>
                {(() => {
                  const checkInTime = new Date(visitorInfo?.check_in_time || "").getTime();
                  const now = Date.now();
                  const diffMs = now - checkInTime;
                  const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
                  const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                  return `${diffHrs}h ${diffMins}m`;
                })()}
              </span>
            </div>
          </div>
          
          <div className="flex items-center p-4 rounded-lg border border-yellow-200 bg-yellow-50">
            <Info className="h-5 w-5 text-yellow-500 mr-3 flex-shrink-0" />
            <p className="text-sm text-yellow-700">
              Please ensure you have all your belongings before signing out.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => window.history.back()}>
            Cancel
          </Button>
          <Button 
            onClick={handleSignOut}
            disabled={isSubmitting}
            className="bg-green-600 hover:bg-green-700"
          >
            {isSubmitting ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2"></div>
                <span>Processing...</span>
              </div>
            ) : (
              <>
                <LogOut className="mr-2 h-4 w-4" />
                Confirm Sign-Out
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default VisitorSignOut;
