import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Risk } from '@/types';
import { AlertTriangle } from 'lucide-react';

interface DeleteRiskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  risk: Risk | null;
  onDelete: (id: string) => void;
}

const DeleteRiskModal: React.FC<DeleteRiskModalProps> = ({
  open,
  onOpenChange,
  risk,
  onDelete
}) => {
  
  const handleDelete = () => {
    if (!risk) return;
    
    onDelete(risk.id);
    
    toast({
      title: "Success",
      description: "Risk deleted successfully",
    });
    
    onOpenChange(false);
  };

  if (!risk) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            <DialogTitle>Delete Risk</DialogTitle>
          </div>
          <DialogDescription>
            Are you sure you want to delete this risk? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="bg-muted p-3 rounded-md">
            <p className="font-medium">{risk.title}</p>
            {risk.description && (
              <p className="text-sm text-muted-foreground mt-1">{risk.description}</p>
            )}
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button variant="destructive" onClick={handleDelete}>Delete Risk</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteRiskModal; 