
import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { premisesApi } from "@/services/api/premises";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";
import { Premise } from "@/types/Premise";

// Import components
import PremiseCard from "./components/PremiseCard";
import EmptyState from "./components/EmptyState";
import AddPremiseDialog from "./components/AddPremiseDialog";
import EditPremiseDialog from "./components/EditPremiseDialog";
import DeleteConfirmDialog from "./components/DeleteConfirmDialog";
import QRCodeDialog from "./components/QRCodeDialog";

interface PremiseFormData {
  name: string;
  address: string;
  capacity?: number;
  contact_person?: string;
  contact_email?: string;
  contact_phone?: string;
}

const PremisesPage = () => {
  const [premises, setPremises] = useState<Premise[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddPremiseDialog, setShowAddPremiseDialog] = useState(false);
  const [showEditPremiseDialog, setShowEditPremiseDialog] = useState(false);
  const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false);
  const [showQRCodeDialog, setShowQRCodeDialog] = useState(false);
  const [selectedPremise, setSelectedPremise] = useState<Premise | null>(null);
  const [formData, setFormData] = useState<PremiseFormData>({
    name: "",
    address: "",
    capacity: 50,
    contact_person: "",
    contact_email: "",
    contact_phone: ""
  });
  
  const { toast } = useToast();
  
  const fetchPremises = async () => {
    try {
      setIsLoading(true);
      
      // Fetch all premises
      const premisesData = await premisesApi.getAllPremises();
      
      // For each premise, fetch the current visitor count
      const premisesWithVisitorCount = await Promise.all(
        premisesData.map(async (premise) => {
          try {
            // Get current visitors for this premise
            const visitorsResponse = await api.get(`/visitors/?premise=${premise.id}&status=signed_in`);
            const currentVisitors = visitorsResponse.data?.length || 0;
            
            return {
              ...premise,
              current_visitors: currentVisitors
            };
          } catch (error) {
            console.error(`Error fetching visitors for premise ${premise.id}:`, error);
            return {
              ...premise,
              current_visitors: 0
            };
          }
        })
      );
      
      setPremises(premisesWithVisitorCount);
      setIsLoading(false);
      setIsRefreshing(false);
    } catch (error) {
      console.error("Error fetching premises:", error);
      toast({
        title: "Error",
        description: "Failed to fetch premises",
        variant: "destructive"
      });
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };
  
  useEffect(() => {
    fetchPremises();
  }, []);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "capacity" ? Number(value) : value
    }));
  };
  
  const handleAddPremise = async () => {
    try {
      // Validate form
      if (!formData.name || !formData.address) {
        toast({
          title: "Missing information",
          description: "Please fill in all required fields",
          variant: "destructive"
        });
        return;
      }
      
      // Call the API to create a new premise
      await premisesApi.createPremise({
        name: formData.name || "",
        address: formData.address || "",
      });
      
      // Refresh the premises list
      await fetchPremises();
      setShowAddPremiseDialog(false);
      
      toast({
        title: "Success",
        description: "Premise added successfully"
      });
      
      // Reset form
      setFormData({
        name: "",
        address: "",
        capacity: 50,
        contact_person: "",
        contact_email: "",
        contact_phone: ""
      });
      
    } catch (error) {
      console.error("Error adding premise:", error);
      toast({
        title: "Error",
        description: "Failed to add premise",
        variant: "destructive"
      });
    }
  };
  
  const handleEditClick = (premise: Premise) => {
    setSelectedPremise(premise);
    setFormData({
      name: premise.name,
      address: premise.address,
      capacity: premise.capacity,
      contact_person: premise.contact_person,
      contact_email: premise.contact_email,
      contact_phone: premise.contact_phone
    });
    setShowEditPremiseDialog(true);
  };
  
  const handleUpdatePremise = async () => {
    if (!selectedPremise) return;
    
    try {
      // Validate form
      if (!formData.name || !formData.address) {
        toast({
          title: "Missing information",
          description: "Please fill in all required fields",
          variant: "destructive"
        });
        return;
      }
      
      // Call the API to update the premise
      await premisesApi.updatePremise(selectedPremise.id, {
        name: formData.name,
        address: formData.address
      });
      
      // Refresh the premises list
      await fetchPremises();
      setShowEditPremiseDialog(false);
      
      toast({
        title: "Success",
        description: "Premise updated successfully"
      });
      
    } catch (error) {
      console.error("Error updating premise:", error);
      toast({
        title: "Error",
        description: "Failed to update premise",
        variant: "destructive"
      });
    }
  };
  
  const handleDeleteClick = (premise: Premise) => {
    setSelectedPremise(premise);
    setShowDeleteConfirmDialog(true);
  };
  
  const handleDeletePremise = async () => {
    if (!selectedPremise) return;
    
    try {
      // Call the API to delete the premise
      await premisesApi.deletePremise(selectedPremise.id);
      
      // Refresh the premises list
      await fetchPremises();
      setShowDeleteConfirmDialog(false);
      
      toast({
        title: "Success",
        description: "Premise deleted successfully"
      });
      
    } catch (error) {
      console.error("Error deleting premise:", error);
      toast({
        title: "Error",
        description: "Failed to delete premise",
        variant: "destructive"
      });
    }
  };
  
  const handleQRCodeClick = async (premise: Premise) => {
    setSelectedPremise(premise);
    setShowQRCodeDialog(true);
    
    // If the premise doesn't have a QR code URL yet, fetch it
    if (!premise.qr_code_url) {
      try {
        const qrCodeData = await premisesApi.getPremiseQrCode(premise.id);
        
        // Update the premise with the QR code URL
        const updatedPremises = premises.map(p => 
          p.id === premise.id 
            ? { ...p, qr_code_url: qrCodeData.qr_code_url }
            : p
        );
        
        setPremises(updatedPremises);
        setSelectedPremise({ ...premise, qr_code_url: qrCodeData.qr_code_url });
      } catch (error) {
        console.error("Error fetching QR code:", error);
        toast({
          title: "Error",
          description: "Failed to fetch QR code",
          variant: "destructive"
        });
      }
    }
  };
  
  const handleRefreshData = () => {
    setIsRefreshing(true);
    fetchPremises();
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Premises</h1>
          <p className="text-muted-foreground">Manage all your locations in one place</p>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={handleRefreshData}
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <>
                <div className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-primary rounded-full"></div>
                Refreshing...
              </>
            ) : (
              <>
                <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 2v6h-6"></path>
                  <path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path>
                  <path d="M3 22v-6h6"></path>
                  <path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path>
                </svg>
                Refresh Data
              </>
            )}
          </Button>
          <Button onClick={() => setShowAddPremiseDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Premise
          </Button>
        </div>
      </div>
      
      {premises.length === 0 ? (
        <EmptyState onAddClick={() => setShowAddPremiseDialog(true)} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {premises.map((premise) => (
            <PremiseCard
              key={premise.id}
              premise={premise}
              onEditClick={handleEditClick}
              onDeleteClick={handleDeleteClick}
              onQRCodeClick={handleQRCodeClick}
            />
          ))}
        </div>
      )}
      
      {/* Dialogs */}
      <AddPremiseDialog
        open={showAddPremiseDialog}
        onOpenChange={setShowAddPremiseDialog}
        formData={formData}
        onInputChange={handleInputChange}
        onSubmit={handleAddPremise}
      />
      
      <EditPremiseDialog
        open={showEditPremiseDialog}
        onOpenChange={setShowEditPremiseDialog}
        premise={selectedPremise}
        formData={formData}
        onInputChange={handleInputChange}
        onSubmit={handleUpdatePremise}
      />
      
      <DeleteConfirmDialog
        open={showDeleteConfirmDialog}
        onOpenChange={setShowDeleteConfirmDialog}
        premise={selectedPremise}
        onConfirm={handleDeletePremise}
      />
      
      <QRCodeDialog
        open={showQRCodeDialog}
        onOpenChange={setShowQRCodeDialog}
        premise={selectedPremise}
        premises={premises}
        setPremises={setPremises}
      />
    </div>
  );
};

export default PremisesPage;
