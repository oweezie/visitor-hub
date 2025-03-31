
import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface PremiseFormData {
  name: string;
  address: string;
  capacity?: number;
  contact_person?: string;
  contact_email?: string;
  contact_phone?: string;
}

interface AddPremiseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: PremiseFormData;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
}

const AddPremiseDialog: React.FC<AddPremiseDialogProps> = ({
  open,
  onOpenChange,
  formData,
  onInputChange,
  onSubmit,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
              onChange={onInputChange}
              placeholder="Headquarters Building"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="address">Address <span className="text-red-500">*</span></Label>
            <Input
              id="address"
              name="address"
              value={formData.address || ""}
              onChange={onInputChange}
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
              onChange={onInputChange}
              min={1}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="contact_person">Contact Person</Label>
            <Input
              id="contact_person"
              name="contact_person"
              value={formData.contact_person || ""}
              onChange={onInputChange}
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
              onChange={onInputChange}
              placeholder="john.doe@example.com"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="contact_phone">Contact Phone</Label>
            <Input
              id="contact_phone"
              name="contact_phone"
              value={formData.contact_phone || ""}
              onChange={onInputChange}
              placeholder="+1234567890"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSubmit}>
            Add Premise
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddPremiseDialog;
