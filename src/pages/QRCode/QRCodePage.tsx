
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Download, Printer, QrCode, Share2, RefreshCw } from "lucide-react";
import { premisesApi } from "@/services/api/premises";
import { Premise } from "@/types/Premise";

const frontendBaseUrl = import.meta.env.VITE_FRONTEND_BASE_URL || window.location.origin;

const QRCodePage = () => {
  const [premises, setPremises] = useState<Premise[]>([]);
  const [selectedPremise, setSelectedPremise] = useState<string>("");
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isQrLoading, setIsQrLoading] = useState(false);
  const { toast } = useToast();

  // Fetch premises on component mount
  useEffect(() => {
    const fetchPremises = async () => {
      try {
        setIsLoading(true);
        const response = await premisesApi.getAllPremises();
        console.log("Premises fetched:", response);
        setPremises(response);
        
        // Auto-select first premise if available
        if (response.length > 0) {
          setSelectedPremise(response[0].id);
        }
      } catch (error) {
        console.error("Error fetching premises:", error);
        toast({
          title: "Error",
          description: "Failed to fetch premises. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPremises();
  }, [toast]);

  // Fetch QR code when premise is selected
  useEffect(() => {
    if (!selectedPremise) return;

    const fetchQrCode = async () => {
      try {
        setIsQrLoading(true);
        console.log("Fetching QR code for premise:", selectedPremise);
        const response = await premisesApi.getPremiseQrCode(selectedPremise);
        console.log("QR code response:", response);
        
        // Ensure we're using the correct property from the response
        if (response && response.qr_code_url) {
          // Prepend backend base URL if the returned URL is relative
          const backendBaseUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";
          let qrUrl = response.qr_code_url;
          if (qrUrl.startsWith("/")) {
            qrUrl = `${backendBaseUrl}${qrUrl}`;
          }

          // Append cache-busting parameter to force image reload
          const finalUrl = `${qrUrl}${qrUrl.includes('?') ? '&' : '?'}t=${Date.now()}`;
          console.log("Setting QR code URL to:", finalUrl);
          setQrCodeUrl(finalUrl);
        } else {
          console.error("QR code URL not found in response", response);
          toast({
            title: "Error",
            description: "The QR code URL is missing from the server response.",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error("Error fetching QR code:", error);
        toast({
          title: "Error",
          description: "Failed to fetch QR code. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsQrLoading(false);
      }
    };

    fetchQrCode();
  }, [selectedPremise, toast]);

  const handlePremiseChange = (value: string) => {
    setSelectedPremise(value);
  };

  const handleRefreshQrCode = async () => {
    if (!selectedPremise) return;
    
    try {
      setIsQrLoading(true);
      const response = await premisesApi.getPremiseQrCode(selectedPremise);
      
      // Check if the response contains a QR code URL
      if (response && response.qr_code_url) {
        // Prepend backend base URL if the returned URL is relative
        const backendBaseUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";
        let qrUrl = response.qr_code_url;
        if (qrUrl.startsWith("/")) {
          qrUrl = `${backendBaseUrl}${qrUrl}`;
        }
        
        // Append a timestamp query parameter to bypass cache
        const refreshedUrl = `${qrUrl}${qrUrl.includes('?') ? '&' : '?'}t=${Date.now()}`;
        setQrCodeUrl(refreshedUrl);
        
        toast({
          title: "Success",
          description: "QR Code has been refreshed successfully",
        });
      } else {
        console.error("QR code URL not found in response", response);
        toast({
          title: "Error",
          description: "The QR code URL is missing from the server response.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error refreshing QR code:", error);
      toast({
        title: "Error",
        description: "Failed to refresh QR code. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsQrLoading(false);
    }
  };

  const handlePrintQrCode = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const premiseName = premises.find(p => p.id === selectedPremise)?.name || "";
      const visitorSigninUrl = `${frontendBaseUrl}/visitor/signin?premise_id=${selectedPremise}&premiseName=${encodeURIComponent(premiseName)}`;
      
      printWindow.document.write(`
        <html>
          <head>
            <title>Visitor Sign-In QR Code - ${premiseName}</title>
            <style>
              body { font-family: Arial, sans-serif; text-align: center; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              img { max-width: 100%; height: auto; }
              h1 { font-size: 24px; margin-bottom: 10px; }
              p { font-size: 16px; margin-bottom: 20px; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>Scan to Sign-In as a Visitor</h1>
              <p>${premiseName}</p>
              <img src="${qrCodeUrl}" alt="Visitor Sign-In QR Code" />
              <p>Point your camera at this QR code to sign in as a visitor</p>
              <p class="text-sm">URL: ${visitorSigninUrl}</p>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    } else {
      toast({
        title: "Error",
        description: "Unable to open print window. Please check your browser settings.",
        variant: "destructive"
      });
    }
  };

  const handleDownloadQrCode = async () => {
    if (!qrCodeUrl || !selectedPremise) return;
    
    try {
      // Use the downloadPremiseQrCode API to get the blob
      const blob = await premisesApi.downloadPremiseQrCode(selectedPremise);
      
      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob);
      
      // Create a link element to download the image
      const link = document.createElement('a');
      link.href = url;
      link.download = `visitor-signin-qrcode-${selectedPremise}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the URL object
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading QR code:", error);
      toast({
        title: "Error",
        description: "Failed to download QR code. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleShareQrCode = async () => {
    if (!qrCodeUrl) return;
    
    try {
      const visitorSigninUrl = `${frontendBaseUrl}/visitor/signin?premise_id=${selectedPremise}&premiseName=${encodeURIComponent(
        premises.find(p => p.id === selectedPremise)?.name || ""
      )}`;
      
      // Check if Web Share API is available
      if (navigator.share) {
        await navigator.share({
          title: `Visitor Sign-In QR Code - ${premises.find(p => p.id === selectedPremise)?.name}`,
          text: "Scan this QR code to sign in as a visitor",
          url: visitorSigninUrl
        });
      } else {
        // Fallback if Web Share API is not available
        const tempInput = document.createElement("input");
        document.body.appendChild(tempInput);
        tempInput.value = visitorSigninUrl;
        tempInput.select();
        document.execCommand("copy");
        document.body.removeChild(tempInput);
        
        toast({
          title: "URL Copied",
          description: "Visitor sign-in URL has been copied to clipboard",
        });
      }
    } catch (error) {
      console.error("Error sharing QR code:", error);
      toast({
        title: "Error",
        description: "Failed to share QR code",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">QR Code Generator</h1>
          <p className="text-muted-foreground">
            Generate QR codes for visitor sign-in at your premises
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Settings Panel */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-xl">QR Code Settings</CardTitle>
            <CardDescription>
              Select a premise to generate its sign-in QR code
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="premise">Select Premise</Label>
              <Select 
                value={selectedPremise} 
                onValueChange={handlePremiseChange}
                disabled={isLoading || premises.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a premise" />
                </SelectTrigger>
                <SelectContent>
                  {premises.map((premise) => (
                    <SelectItem key={premise.id} value={premise.id}>
                      {premise.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {isLoading && (
                <p className="text-sm text-muted-foreground">Loading premises...</p>
              )}
              {!isLoading && premises.length === 0 && (
                <p className="text-sm text-yellow-600">
                  No premises found. Please create a premise first.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Premise Information</Label>
              {selectedPremise && (
                <div className="text-sm text-muted-foreground space-y-1 bg-gray-50 p-3 rounded-md border">
                  <p><span className="font-medium">Name:</span> {premises.find(p => p.id === selectedPremise)?.name}</p>
                  <p><span className="font-medium">Address:</span> {premises.find(p => p.id === selectedPremise)?.address}</p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Instructions</Label>
              <ol className="text-sm text-muted-foreground list-decimal pl-4 space-y-1">
                <li>Select a premise from the dropdown</li>
                <li>Print or download the QR code</li>
                <li>Display it in a visible location at your premise</li>
                <li>Visitors scan this code to sign in/out</li>
              </ol>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={handleRefreshQrCode} 
              disabled={!selectedPremise || isQrLoading}
              variant="outline"
              className="w-full"
            >
              {isQrLoading ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                  Generating...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Regenerate QR Code
                </>
              )}
            </Button>
          </CardFooter>
        </Card>

        {/* QR Code Display */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-xl">QR Code Preview</CardTitle>
            <CardDescription>
              Visitors can scan this code to sign in or out
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center">
            <div className="flex flex-col items-center p-6 mb-4 w-full max-w-sm">
              {isQrLoading ? (
                <div className="flex flex-col items-center justify-center h-64 w-64 border rounded-md bg-gray-50">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                  <p className="mt-4 text-sm text-muted-foreground">Generating QR code...</p>
                </div>
              ) : qrCodeUrl ? (
                <div className="border p-4 rounded-md shadow-sm bg-white">
                  <img 
                    src={qrCodeUrl} 
                    alt="Visitor Sign-In QR Code" 
                    className="h-64 w-64 object-contain"
                    onError={(e) => {
                      console.error("Error loading QR code image:", e);
                      e.currentTarget.classList.add("border", "border-red-500");
                      e.currentTarget.nextSibling && (e.currentTarget.nextSibling as HTMLElement).classList.remove("hidden");
                    }}
                  />
                  <p className="text-red-500 text-xs mt-2 hidden">Error loading QR code image. Please try refreshing.</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 w-64 border rounded-md bg-gray-50">
                  <QrCode className="h-12 w-12 text-gray-300" />
                  <p className="mt-4 text-sm text-muted-foreground">Select a premise to generate QR code</p>
                </div>
              )}

              {selectedPremise && qrCodeUrl && (
                <div className="mt-4 text-center">
                  <h3 className="font-medium">{premises.find(p => p.id === selectedPremise)?.name}</h3>
                  <p className="text-sm text-muted-foreground">Scan to sign in/out as a visitor</p>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-wrap justify-center gap-2">
            <Button
              variant="outline"
              onClick={handlePrintQrCode}
              disabled={!qrCodeUrl}
            >
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
            <Button
              variant="outline"
              onClick={handleDownloadQrCode}
              disabled={!qrCodeUrl}
            >
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
            <Button
              variant="outline"
              onClick={handleShareQrCode}
              disabled={!qrCodeUrl}
            >
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default QRCodePage;
