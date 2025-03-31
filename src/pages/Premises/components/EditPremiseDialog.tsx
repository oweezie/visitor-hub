
import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Premise } from "@/types/Premise";

interface PremiseFormData {
  name: string;
  address: string;
  capacity?: number;
  contact_person?: string;
  contact_email?: string;
  contact_phone?: string;
}

interface EditPremiseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  premise: Premise | null;
  formData: PremiseFormData;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
}

const EditPremiseDialog: React.FC<EditPremiseDialogProps> = ({
  open,
  onOpenChange,
  premise,
  formData,
  onInputChange,
  onSubmit,
}) => {
  if (!premise) return null;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Premise</DialogTitle>
          <DialogDescription>
            Update the details for {premise.name}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Premise Name <span className="text-red-500">*</span></Label>
            <Input
              id="edit-name"
              name="name"
              value={formData.name || ""}
              onChange={onInputChange}
              placeholder="Headquarters Building"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="edit-address">Address <span className="text-red-500">*</span></Label>
            <Input
              id="edit-address"
              name="address"
              value={formData.address || ""}
              onChange={onInputChange}
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
              onChange={onInputChange}
              min={1}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="edit-contact_person">Contact Person</Label>
            <Input
              id="edit-contact_person"
              name="contact_person"
              value={formData.contact_person || ""}
              onChange={onInputChange}
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
              onChange={onInputChange}
              placeholder="john.doe@example.com"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="edit-contact_phone">Contact Phone</Label>
            <Input
              id="edit-contact_phone"
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
            Update Premise
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditPremiseDialog;
