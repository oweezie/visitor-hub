
import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { QrCode } from "lucide-react";
import { Premise } from "@/types/Premise";
import { useToast } from "@/hooks/use-toast";
import { premisesApi } from "@/services/api/premises";

interface QRCodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  premise: Premise | null;
  premises: Premise[];
  setPremises: React.Dispatch<React.SetStateAction<Premise[]>>;
}

const QRCodeDialog: React.FC<QRCodeDialogProps> = ({
  open,
  onOpenChange,
  premise,
  premises,
  setPremises,
}) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  if (!premise) return null;
  
  const handleDownloadQrCode = async () => {
    try {
      setIsLoading(true);
      const response = await premisesApi.downloadPremiseQrCode(premise.id);
      const blob = response;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `premise_qr_${premise.id}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      
      toast({
        title: 'Success',
        description: 'QR code downloaded successfully'
      });
    } catch (error) {
      console.error('Error downloading QR code:', error);
      toast({
        title: 'Error',
        description: 'Failed to download QR code. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRegenerateQrCode = async () => {
    try {
      setIsLoading(true);
      const qrCodeData = await premisesApi.getPremiseQrCode(premise.id);
      
      if (!qrCodeData || !qrCodeData.qr_code_url) {
        throw new Error("QR code URL not found in response");
      }
      
      const updatedPremises = premises.map(p => 
        p.id === premise.id 
          ? { ...p, qr_code_url: qrCodeData.qr_code_url }
          : p
      );
      
      setPremises(updatedPremises);
      
      toast({
        title: "Success",
        description: "QR code regenerated successfully"
      });
    } catch (error) {
      console.error("Error regenerating QR code:", error);
      toast({
        title: "Error",
        description: "Failed to regenerate QR code. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>QR Code for {premise.name}</DialogTitle>
          <DialogDescription>
            Visitors can scan this QR code to sign in or sign out
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center py-6">
          {premise.qr_code_url ? (
            <div className="bg-white p-6 rounded-md mb-4 border">
              <img 
                src={premise.qr_code_url} 
                alt={`QR Code for ${premise.name}`}
                className="w-48 h-48 object-contain"
                onError={(e) => {
                  console.error("Error loading QR code image:", e);
                  e.currentTarget.src = "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 24 24' fill='none' stroke='%23d1d5db' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect width='18' height='18' x='3' y='3' rx='2' ry='2'%3E%3C/rect%3E%3Cline x1='8' y1='8' x2='8' y2='8'%3E%3C/line%3E%3Cline x1='16' y1='8' x2='16' y2='8'%3E%3C/line%3E%3Cline x1='8' y1='16' x2='8' y2='16'%3E%3C/line%3E%3Cline x1='16' y1='16' x2='16' y2='16'%3E%3C/line%3E%3Cline x1='12' y1='12' x2='12' y2='12'%3E%3C/line%3E%3C/svg%3E";
                  toast({
                    title: "Warning",
                    description: "QR code image failed to load. Try regenerating it.",
                    variant: "destructive"
                  });
                }}
              />
            </div>
          ) : (
            <div className="bg-gray-100 p-6 rounded-md mb-4 flex items-center justify-center w-48 h-48">
              {isLoading ? (
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              ) : (
                <QrCode className="h-12 w-12 text-gray-400" />
              )}
            </div>
          )}
          <p className="text-center text-sm text-muted-foreground mb-4">
            This QR code contains a unique link for {premise.name}
          </p>
          <div className="flex space-x-2">
            <Button 
              variant="outline"
              onClick={handleDownloadQrCode}
              disabled={!premise.qr_code_url || isLoading}
            >
              <QrCode className="mr-2 h-4 w-4" />
              Download QR Code
            </Button>
            <Button 
              variant="secondary"
              onClick={handleRegenerateQrCode}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
              ) : (
                <QrCode className="mr-2 h-4 w-4" />
              )}
              Regenerate QR Code
            </Button>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default QRCodeDialog;
