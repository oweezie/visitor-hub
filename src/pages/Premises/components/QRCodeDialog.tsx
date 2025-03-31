
import React from "react";
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
  
  if (!premise) return null;
  
  const handleDownloadQrCode = async () => {
    try {
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
    } catch (error) {
      console.error('Error downloading QR code:', error);
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        console.error('Authentication error: User may not be authorized to download QR code');
      }
      toast({
        title: 'Error',
        description: 'Failed to download QR code',
        variant: 'destructive'
      });
    }
  };
  
  const handleRegenerateQrCode = async () => {
    try {
      const qrCodeData = await premisesApi.getPremiseQrCode(premise.id);
      
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
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        console.error('Authentication error: User may not be authorized to regenerate QR code');
      }
      toast({
        title: "Error",
        description: "Failed to regenerate QR code",
        variant: "destructive"
      });
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
          {/* 
            The qr_code_url is expected to be a fully qualified absolute URL from the backend.
            The PremiseSerializer.get_qr_code_url method handles this conversion.
          */}
          {premise.qr_code_url ? (
            <div className="bg-white p-6 rounded-md mb-4 border">
              <img 
                src={premise.qr_code_url} 
                alt={`QR Code for ${premise.name}`}
                className="w-48 h-48 object-contain"
              />
            </div>
          ) : (
            <div className="bg-gray-100 p-6 rounded-md mb-4 flex items-center justify-center w-48 h-48">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          )}
          <p className="text-center text-sm text-muted-foreground mb-4">
            This QR code contains a unique link for {premise.name}
          </p>
          <div className="flex space-x-2">
            <Button 
              variant="outline"
              onClick={handleDownloadQrCode}
              disabled={!premise.qr_code_url}
            >
              <QrCode className="mr-2 h-4 w-4" />
              Download QR Code
            </Button>
            <Button 
              variant="secondary"
              onClick={handleRegenerateQrCode}
            >
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
