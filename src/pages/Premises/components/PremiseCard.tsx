
import React from "react";
import { Building, Edit, Trash2, QrCode, Users, MapPin, Mail, Phone, User } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Premise } from "@/types/Premise";

interface PremiseCardProps {
  premise: Premise;
  onEditClick: (premise: Premise) => void;
  onDeleteClick: (premise: Premise) => void;
  onQRCodeClick: (premise: Premise) => void;
}

const PremiseCard: React.FC<PremiseCardProps> = ({ 
  premise, 
  onEditClick, 
  onDeleteClick, 
  onQRCodeClick 
}) => {
  return (
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
            onClick={() => onEditClick(premise)}
          >
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className="text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200"
            onClick={() => onDeleteClick(premise)}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </div>
        <Button 
          size="sm" 
          onClick={() => onQRCodeClick(premise)}
        >
          <QrCode className="h-4 w-4 mr-1" />
          QR Code
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PremiseCard;
