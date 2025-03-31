import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/axios";
import { premisesApi } from "@/services/api/premises";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { 
  Building, Edit, Trash2, Plus, QrCode, Users, MapPin, Mail, Phone, User
} from "lucide-react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Premise } from "@/types/Premise";

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
  const navigate = useNavigate();
  
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
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64">
            <Building className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-xl font-medium mb-2">No Premises Found</h3>
            <p className="text-muted-foreground text-center mb-6">
              You don't have any premises yet. Add your first premise to get started.
            </p>
            <Button onClick={() => setShowAddPremiseDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Premise
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {premises.map((premise) => (
            <Card key={premise.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{premise.name}</CardTitle>
                    <CardDescription className="flex items-center mt-1">
                      <MapPin className="h-3 w-3 mr-1" />
                      {premise.address}
                    </CardDescription>
                  </div>
                  <div className="bg-primary/10 p-2 rounded-full">
                    <Building className="h-5 w-5 text-primary" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center">
                    <Users className="h-3 w-3 mr-1 text-gray-500" />
                    <span>Capacity: {premise.capacity}</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-3 w-3 mr-1 text-gray-500" />
                    <span>Current: {premise.current_visitors}</span>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  {premise.contact_person && (
                    <div className="flex items-center">
                      <User className="h-3 w-3 mr-1 text-gray-500" />
                      <span>Contact: {premise.contact_person}</span>
                    </div>
                  )}
                  {premise.contact_email && (
                    <div className="flex items-center">
                      <Mail className="h-3 w-3 mr-1 text-gray-500" />
                      <span>{premise.contact_email}</span>
                    </div>
                  )}
                  {premise.contact_phone && (
                    <div className="flex items-center">
                      <Phone className="h-3 w-3 mr-1 text-gray-500" />
                      <span>{premise.contact_phone}</span>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4 flex justify-between">
                <div className="flex space-x-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleEditClick(premise)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200"
                    onClick={() => handleDeleteClick(premise)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
                <Button 
                  size="sm" 
                  onClick={() => handleQRCodeClick(premise)}
                >
                  <QrCode className="h-4 w-4 mr-1" />
                  QR Code
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      
      {/* Add Premise Dialog */}
      <Dialog open={showAddPremiseDialog} onOpenChange={setShowAddPremiseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Premise</DialogTitle>
            <DialogDescription>
              Fill in the details to add a new premise
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Premise Name <span className="text-red-500">*</span></Label>
              <Input
                id="name"
                name="name"
                value={formData.name || ""}
                onChange={handleInputChange}
                placeholder="Headquarters Building"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address">Address <span className="text-red-500">*</span></Label>
              <Input
                id="address"
                name="address"
                value={formData.address || ""}
                onChange={handleInputChange}
                placeholder="123 Main Street, City, Country"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="capacity">Maximum Capacity</Label>
              <Input
                id="capacity"
                name="capacity"
                type="number"
                value={formData.capacity || 50}
                onChange={handleInputChange}
                min={1}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="contact_person">Contact Person</Label>
              <Input
                id="contact_person"
                name="contact_person"
                value={formData.contact_person || ""}
                onChange={handleInputChange}
                placeholder="John Doe"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="contact_email">Contact Email</Label>
              <Input
                id="contact_email"
                name="contact_email"
                type="email"
                value={formData.contact_email || ""}
                onChange={handleInputChange}
                placeholder="john.doe@example.com"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="contact_phone">Contact Phone</Label>
              <Input
                id="contact_phone"
                name="contact_phone"
                value={formData.contact_phone || ""}
                onChange={handleInputChange}
                placeholder="+1234567890"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddPremiseDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddPremise}>
              Add Premise
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Premise Dialog */}
      <Dialog open={showEditPremiseDialog} onOpenChange={setShowEditPremiseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Premise</DialogTitle>
            <DialogDescription>
              Update the details for {selectedPremise?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Premise Name <span className="text-red-500">*</span></Label>
              <Input
                id="edit-name"
                name="name"
                value={formData.name || ""}
                onChange={handleInputChange}
                placeholder="Headquarters Building"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-address">Address <span className="text-red-500">*</span></Label>
              <Input
                id="edit-address"
                name="address"
                value={formData.address || ""}
                onChange={handleInputChange}
                placeholder="123 Main Street, City, Country"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-capacity">Maximum Capacity</Label>
              <Input
                id="edit-capacity"
                name="capacity"
                type="number"
                value={formData.capacity || 50}
                onChange={handleInputChange}
                min={1}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-contact_person">Contact Person</Label>
              <Input
                id="edit-contact_person"
                name="contact_person"
                value={formData.contact_person || ""}
                onChange={handleInputChange}
                placeholder="John Doe"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-contact_email">Contact Email</Label>
              <Input
                id="edit-contact_email"
                name="contact_email"
                type="email"
                value={formData.contact_email || ""}
                onChange={handleInputChange}
                placeholder="john.doe@example.com"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-contact_phone">Contact Phone</Label>
              <Input
                id="edit-contact_phone"
                name="contact_phone"
                value={formData.contact_phone || ""}
                onChange={handleInputChange}
                placeholder="+1234567890"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditPremiseDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdatePremise}>
              Update Premise
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirmDialog} onOpenChange={setShowDeleteConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedPremise?.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteConfirmDialog(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeletePremise}
            >
              Delete Premise
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* QR Code Dialog */}
      <Dialog open={showQRCodeDialog} onOpenChange={setShowQRCodeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>QR Code for {selectedPremise?.name}</DialogTitle>
            <DialogDescription>
              Visitors can scan this QR code to sign in or sign out
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center py-6">
            {selectedPremise?.qr_code_url ? (
              <div className="bg-white p-6 rounded-md mb-4 border">
                <img 
                  src={selectedPremise.qr_code_url} 
                  alt={`QR Code for ${selectedPremise.name}`}
                  className="w-48 h-48 object-contain"
                />
              </div>
            ) : (
              <div className="bg-gray-100 p-6 rounded-md mb-4 flex items-center justify-center w-48 h-48">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            )}
            <p className="text-center text-sm text-muted-foreground mb-4">
              This QR code contains a unique link for {selectedPremise?.name}
            </p>
            <div className="flex space-x-2">
              <Button 
                variant="outline"
                onClick={async () => {
                  if (selectedPremise) {
                    try {
                      const response = await premisesApi.downloadPremiseQrCode(selectedPremise.id);
                      const blob = response;
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `premise_qr_${selectedPremise.id}.png`;
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
                  }
                }}
                disabled={!selectedPremise?.qr_code_url}
              >
                <QrCode className="mr-2 h-4 w-4" />
                Download QR Code
              </Button>
              <Button 
                variant="secondary"
                onClick={async () => {
                  if (selectedPremise) {
                    try {
                      const qrCodeData = await premisesApi.getPremiseQrCode(selectedPremise.id);
                      
                      const updatedPremises = premises.map(p => 
                        p.id === selectedPremise.id 
                          ? { ...p, qr_code_url: qrCodeData.qr_code_url }
                          : p
                      );
                      
                      setPremises(updatedPremises);
                      setSelectedPremise({ ...selectedPremise, qr_code_url: qrCodeData.qr_code_url });
                      
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
                  }
                }}
              >
                Regenerate QR Code
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowQRCodeDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PremisesPage;
