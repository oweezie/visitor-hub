
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/axios";
import { Camera, FileCheck, Upload, X, User, Phone, MapPin, Clock } from "lucide-react";

interface Premise {
  id: string;
  name: string;
}

const VisitorSignIn = () => {
  const [searchParams] = useSearchParams();
  const premiseId = searchParams.get("premiseId");
  const premiseName = searchParams.get("premiseName") || "Unknown Premise";
  
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    company: "",
    purpose: "",
    host_name: "",
    host_email: "",
    premise_id: premiseId || "",
  });
  
  const [idPhoto, setIdPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const { toast } = useToast();
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIdPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };
  
  const removePhoto = () => {
    setIdPhoto(null);
    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
      setPhotoPreview(null);
    }
  };
  
  const handleNextStep = () => {
    if (step === 1) {
      // Validate first step
      if (!formData.first_name || !formData.last_name || !formData.phone) {
        toast({
          title: "Missing information",
          description: "Please fill in all required fields",
          variant: "destructive"
        });
        return;
      }
    }
    setStep(step + 1);
  };
  
  const handlePrevStep = () => {
    setStep(step - 1);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all required fields
    if (!formData.first_name || !formData.last_name || !formData.phone || !formData.purpose) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Create FormData for file upload
      const submitData = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        submitData.append(key, value);
      });
      
      if (idPhoto) {
        submitData.append("id_photo", idPhoto);
      }
      
      const response = await api.post("/visitors/signin/", submitData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      
      setIsSuccess(true);
      toast({
        title: "Sign-in successful",
        description: "You have been registered as a visitor",
      });
      
      // Reset form after successful submission
      setTimeout(() => {
        setFormData({
          first_name: "",
          last_name: "",
          email: "",
          phone: "",
          company: "",
          purpose: "",
          host_name: "",
          host_email: "",
          premise_id: premiseId || "",
        });
        setIdPhoto(null);
        setPhotoPreview(null);
        setStep(1);
        setIsSuccess(false);
      }, 5000);
      
    } catch (error) {
      console.error("Error signing in:", error);
      toast({
        title: "Sign-in failed",
        description: "An error occurred while registering your visit",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Success screen after submission
  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto bg-green-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
              <FileCheck className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Sign-In Successful!</CardTitle>
            <CardDescription>
              Thank you for registering your visit.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              Your details have been submitted and are awaiting approval.
            </p>
            <div className="bg-gray-50 p-4 rounded-lg border">
              <div className="flex items-center mb-2">
                <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                <span className="font-medium">{premiseName}</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2 text-gray-500" />
                <span>{new Date().toLocaleString()}</span>
              </div>
            </div>
            <p className="font-medium">
              You will be notified when your visit is approved.
            </p>
          </CardContent>
          <CardFooter>
            <p className="text-xs text-muted-foreground mx-auto">
              This page will automatically redirect in a few seconds.
            </p>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Visitor Sign-In</CardTitle>
          <CardDescription>
            {premiseName} - Please complete this form to sign in as a visitor
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {step === 1 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="first_name">First Name <span className="text-red-500">*</span></Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <User className="h-4 w-4 text-gray-400" />
                    </div>
                    <Input
                      id="first_name"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="last_name">Last Name <span className="text-red-500">*</span></Label>
                  <Input
                    id="last_name"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number <span className="text-red-500">*</span></Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Phone className="h-4 w-4 text-gray-400" />
                    </div>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      className="pl-10"
                      placeholder="+1234567890"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                  />
                </div>
              </>
            )}
            
            {step === 2 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="purpose">Purpose of Visit <span className="text-red-500">*</span></Label>
                  <Textarea
                    id="purpose"
                    name="purpose"
                    value={formData.purpose}
                    onChange={handleChange}
                    rows={3}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="host_name">Person Visiting</Label>
                  <Input
                    id="host_name"
                    name="host_name"
                    value={formData.host_name}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="host_email">Contact Email of Person Visiting</Label>
                  <Input
                    id="host_email"
                    name="host_email"
                    type="email"
                    value={formData.host_email}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>ID Photo (Optional)</Label>
                  
                  {photoPreview ? (
                    <div className="mt-2 relative">
                      <img 
                        src={photoPreview} 
                        alt="ID Preview" 
                        className="w-full h-48 object-cover rounded-md border"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                        onClick={removePhoto}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <label className="flex flex-col items-center justify-center h-24 border-2 border-dashed rounded-md border-gray-300 cursor-pointer hover:bg-gray-50">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Camera className="h-8 w-8 text-gray-400 mb-1" />
                          <p className="text-xs text-gray-500">Take Photo</p>
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          capture="environment"
                          onChange={handlePhotoCapture}
                        />
                      </label>
                      
                      <label className="flex flex-col items-center justify-center h-24 border-2 border-dashed rounded-md border-gray-300 cursor-pointer hover:bg-gray-50">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="h-8 w-8 text-gray-400 mb-1" />
                          <p className="text-xs text-gray-500">Upload Photo</p>
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handlePhotoCapture}
                        />
                      </label>
                    </div>
                  )}
                </div>
              </>
            )}
          </form>
        </CardContent>
        <CardFooter className="flex justify-between">
          {step > 1 ? (
            <Button 
              type="button" 
              variant="outline" 
              onClick={handlePrevStep}
              disabled={isSubmitting}
            >
              Back
            </Button>
          ) : (
            <div></div>
          )}
          
          {step < 2 ? (
            <Button 
              type="button" 
              onClick={handleNextStep}
            >
              Next
            </Button>
          ) : (
            <Button 
              type="button" 
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2"></div>
                  <span>Submitting...</span>
                </div>
              ) : (
                "Complete Sign-In"
              )}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default VisitorSignIn;
