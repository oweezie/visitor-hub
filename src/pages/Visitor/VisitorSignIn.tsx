
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { visitorsApi, VisitorSignInData } from "@/services/api/visitors";
import { Camera, FileCheck, Upload, X, User, Phone, MapPin, Clock, CheckCircle, Calendar, Building } from "lucide-react";

// Define the form schema with validation
const formSchema = z.object({
  first_name: z.string().min(2, "First name must be at least 2 characters"),
  second_name: z.string().min(2, "Last name must be at least 2 characters"),
  phone_number: z.string().min(10, "Phone number must be at least 10 digits"),
  person_visiting: z.string().min(2, "Person visiting must be at least 2 characters"),
  room_number: z.string().optional(),
  reason: z.string().min(5, "Reason must be at least 5 characters"),
  company: z.string().optional(),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
});

type FormValues = z.infer<typeof formSchema>;

const VisitorSignIn = () => {
  const [searchParams] = useSearchParams();
  const premiseId = searchParams.get("premiseId");
  const premiseName = searchParams.get("premiseName") || "Unknown Premise";
  
  const [step, setStep] = useState(1);
  const totalSteps = 3;
  const [progress, setProgress] = useState(33);
  
  const [idPhoto, setIdPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleString());
  
  const { toast } = useToast();
  
  // Initialize form with react-hook-form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: "",
      second_name: "",
      phone_number: "",
      person_visiting: "",
      room_number: "",
      reason: "",
      company: "",
      email: "",
    },
  });
  
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
  
  const handleNextStep = async () => {
    if (step === 1) {
      // Validate first step fields
      const result = await form.trigger(["first_name", "second_name", "phone_number", "email"]);
      if (!result) return;
    } else if (step === 2) {
      // Validate second step fields
      const result = await form.trigger(["person_visiting", "room_number", "reason", "company"]);
      if (!result) return;
    }
    
    setStep(step + 1);
    setProgress((step + 1) * (100 / totalSteps));
  };
  
  const handlePrevStep = () => {
    setStep(step - 1);
    setProgress(step * (100 / totalSteps) - (100 / totalSteps));
  };
  
  const onSubmit = async (data: FormValues) => {
    if (!premiseId) {
      toast({
        title: "Error",
        description: "Missing premise information",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Create a visitor data object that conforms to VisitorSignInData
      const visitorData: VisitorSignInData = {
        first_name: data.first_name,
        second_name: data.second_name,
        phone_number: data.phone_number,
        person_visiting: data.person_visiting,
        room_number: data.room_number || "",
        reason: data.reason,
        premise: parseInt(premiseId),
      };
      
      // Only add id_photo if it exists
      if (idPhoto) {
        visitorData.id_photo = idPhoto;
      }
      
      // Add optional fields if they exist
      if (data.company) visitorData.company = data.company;
      if (data.email) visitorData.email = data.email;
      
      await visitorsApi.visitorSignIn(visitorData);
      
      setIsSuccess(true);
      toast({
        title: "Sign-in successful",
        description: "You have been registered as a visitor",
      });
      
      // Reset form after successful submission
      setTimeout(() => {
        form.reset();
        setIdPhoto(null);
        setPhotoPreview(null);
        setStep(1);
        setProgress(33);
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 p-4">
        <Card className="w-full max-w-md border-none shadow-lg">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto bg-green-100 p-3 rounded-full w-20 h-20 flex items-center justify-center mb-4">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold">Sign-In Successful!</CardTitle>
            <CardDescription className="text-base">
              Thank you for registering your visit.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-6 pt-4">
            <div className="bg-white p-6 rounded-lg border shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <Building className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-lg">{premiseName}</span>
              </div>
              <Separator className="my-3" />
              <div className="flex items-center gap-3 mb-3">
                <User className="h-5 w-5 text-blue-600" />
                <span>{form.getValues("first_name")} {form.getValues("second_name")}</span>
              </div>
              <div className="flex items-center gap-3 mb-3">
                <Calendar className="h-5 w-5 text-blue-600" />
                <span>{currentTime}</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-blue-600" />
                <span>Room {form.getValues("room_number") || "Not specified"}</span>
              </div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <p className="font-medium text-blue-800">
                Please wait for your visit to be approved by the host.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center pt-0">
            <p className="text-xs text-muted-foreground">
              This page will automatically redirect in a few seconds.
            </p>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 p-4">
      <Card className="w-full max-w-md border-none shadow-lg">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold">Visitor Sign-In</CardTitle>
            <div className="bg-blue-100 text-blue-600 text-xs font-medium px-2.5 py-1 rounded-full">
              Step {step} of {totalSteps}
            </div>
          </div>
          <Progress value={progress} className="h-2" />
          <CardDescription className="pt-2">
            {premiseName} - Please complete this form to sign in
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {step === 1 && (
                <div className="space-y-4">
                  <h3 className="font-medium text-sm text-muted-foreground">Personal Information</h3>
                  
                  <FormField
                    control={form.control}
                    name="first_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                              <User className="h-4 w-4 text-gray-400" />
                            </div>
                            <Input {...field} className="pl-10" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="second_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="phone_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                              <Phone className="h-4 w-4 text-gray-400" />
                            </div>
                            <Input {...field} type="tel" className="pl-10" placeholder="+1234567890" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email (Optional)</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
              
              {step === 2 && (
                <div className="space-y-4">
                  <h3 className="font-medium text-sm text-muted-foreground">Visit Details</h3>
                  
                  <FormField
                    control={form.control}
                    name="person_visiting"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Person Visiting <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="room_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Room Number</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="company"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company (Optional)</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="reason"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Purpose of Visit <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Textarea {...field} rows={3} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
              
              {step === 3 && (
                <div className="space-y-4">
                  <h3 className="font-medium text-sm text-muted-foreground">ID Verification (Optional)</h3>
                  
                  <div className="space-y-2">
                    <FormLabel>ID Photo</FormLabel>
                    
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
                  
                  <div className="border rounded-md p-4 bg-blue-50">
                    <h4 className="text-sm font-medium mb-2">Visit Summary</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex justify-between">
                        <span className="text-gray-500">Name:</span>
                        <span>{form.getValues("first_name")} {form.getValues("second_name")}</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-gray-500">Phone:</span>
                        <span>{form.getValues("phone_number")}</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-gray-500">Visiting:</span>
                        <span>{form.getValues("person_visiting")}</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-gray-500">Room:</span>
                        <span>{form.getValues("room_number") || "N/A"}</span>
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </form>
          </Form>
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
          
          {step < totalSteps ? (
            <Button 
              type="button" 
              onClick={handleNextStep}
            >
              Next
            </Button>
          ) : (
            <Button 
              type="button" 
              onClick={form.handleSubmit(onSubmit)}
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700"
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
