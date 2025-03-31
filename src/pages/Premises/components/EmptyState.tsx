
import React from "react";
import { Building, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  onAddClick: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ onAddClick }) => {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center h-64">
        <Building className="h-16 w-16 text-gray-300 mb-4" />
        <h3 className="text-xl font-medium mb-2">No Premises Found</h3>
        <p className="text-muted-foreground text-center mb-6">
          You don't have any premises yet. Add your first premise to get started.
        </p>
        <Button onClick={onAddClick}>
          <Plus className="mr-2 h-4 w-4" />
          Add Premise
        </Button>
      </CardContent>
    </Card>
  );
};

export default EmptyState;
