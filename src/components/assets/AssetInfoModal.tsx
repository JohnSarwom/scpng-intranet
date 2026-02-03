import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { UserAsset } from '@/types';
import { cn, formatDate } from '@/lib/utils';
import { DialogFooter } from "@/components/ui/dialog";

interface AssetInfoModalProps {
  asset: UserAsset | null;
  isOpen: boolean;
  onClose: () => void;
}

// Helper function for condition badge styling (similar to AssetCard)
const getConditionBadgeClass = (condition?: string | null) => {
    if (!condition) return '';
    switch (condition.toLowerCase()) {
      case 'new':
      case 'good':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'fair':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'poor':
      case 'needs repair':
         return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
};

const AssetInfoModal: React.FC<AssetInfoModalProps> = ({ asset, isOpen, onClose }) => {
  if (!asset) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg flex flex-col max-h-[85vh]">
        <div className="relative w-full h-56 overflow-hidden rounded-xl mb-4 flex-shrink-0">
           {/* The DialogClose component that was here has been removed */}

           {asset.image_url ? (
              <img 
                 src={asset.image_url} 
                 alt={asset.name || 'Asset image'} 
                 className="w-full h-full object-cover" 
              />
           ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center rounded-xl">
                <span className="text-6xl font-semibold text-muted-foreground">
                  {asset.name?.charAt(0).toUpperCase() || 'A'}
                </span>
              </div>
           )}
        </div>

        <div className="flex-1 overflow-y-auto pr-2">
          <DialogHeader className="text-left mb-4 flex-shrink-0">
            <DialogTitle className="text-xl font-semibold mb-1">{asset.name}</DialogTitle>
            <DialogDescription>
              {asset.type}
            </DialogDescription>
            {asset.description && (
              <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">
                {asset.description}
              </p>
            )}
          </DialogHeader>
          
          <div className="grid gap-4 text-sm">
             <div className="flex items-center justify-between border-b pb-2">
               <span className="text-muted-foreground">Condition:</span>
                {asset.condition && (
                   <Badge variant="outline" className={cn("font-medium", getConditionBadgeClass(asset.condition))}>
                       {asset.condition}
                   </Badge>
                )}
             </div>
             <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                <span className="text-muted-foreground">Assigned To:</span>
                <span>{asset.assigned_to || 'N/A'}</span>
                
                <span className="text-muted-foreground">Email:</span>
                <span>{asset.assigned_to_email || 'N/A'}</span>
    
                <span className="text-muted-foreground">Unit:</span>
                <span>{asset.unit || 'N/A'}</span>
    
                <span className="text-muted-foreground">Division:</span>
                <span>{asset.division || 'N/A'}</span>
    
                <span className="text-muted-foreground">Vendor:</span>
                <span>{asset.vendor || 'N/A'}</span>

                <span className="text-muted-foreground">Brand:</span>
                <span>{asset.brand || 'N/A'}</span>

                <span className="text-muted-foreground">Model:</span>
                <span>{asset.model || 'N/A'}</span>

                <span className="text-muted-foreground">Serial Number:</span>
                <span>{asset.serial_number || 'N/A'}</span>
                
                <span className="text-muted-foreground">Purchase Date:</span>
                <span>{formatDate(asset.purchase_date)}</span>
             </div>
              {asset.notes && (
                 <div className="mt-1 pt-2 border-t">
                   <span className="text-muted-foreground">Notes:</span>
                   <p className="mt-1 text-xs whitespace-pre-wrap">{asset.notes}</p>
                 </div>
               )}

             <div className="mt-1 pt-2 border-t grid grid-cols-2 gap-x-4 gap-y-1.5">
                <span className="text-muted-foreground">Assigned Date:</span>
                <span>{formatDate(asset.assigned_date)}</span>

                <span className="text-muted-foreground">Purchase Cost:</span>
                <span>{asset.purchase_cost != null ? `$${asset.purchase_cost.toFixed(2)}` : 'N/A'}</span>

                <span className="text-muted-foreground">Depreciated Value:</span>
                <span>{asset.depreciated_value != null ? `$${asset.depreciated_value.toFixed(2)}` : 'N/A'}</span>

                <span className="text-muted-foreground">Warranty Expiry:</span>
                <span>{formatDate(asset.warranty_expiry_date)}</span>

                <span className="text-muted-foreground">Expected Expiry:</span>
                <span>{formatDate(asset.expiry_date)}</span>

                <span className="text-muted-foreground">Life Expectancy:</span>
                <span>{asset.life_expectancy_years ? `${asset.life_expectancy_years} Years` : 'N/A'}</span>

                <span className="text-muted-foreground">YTD Usage:</span>
                <span>{asset.ytd_usage || 'N/A'}</span>

                <span className="text-muted-foreground">Invoice URL:</span>
                <span className="truncate" title={asset.invoice_url}>{asset.invoice_url || 'N/A'}</span>

                <span className="text-muted-foreground">Barcode URL:</span>
                <span className="truncate" title={asset.barcode_url}>{asset.barcode_url || 'N/A'}</span>
             </div>

             {asset.admin_comments && (
                 <div className="mt-1 pt-2 border-t">
                   <span className="text-muted-foreground">Admin Comments:</span>
                   <p className="mt-1 text-xs whitespace-pre-wrap">{asset.admin_comments}</p>
                 </div>
               )}
               
             <div className="mt-1 pt-2 border-t grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
                <span>Created:</span>
                <span>{formatDate(asset.created_at, true) || 'N/A'}</span>

                <span>Last Updated:</span>
                <span>{formatDate(asset.last_updated, true) || 'N/A'}</span>

                <span>Updated By:</span>
                <span>{asset.last_updated_by || 'N/A'}</span>
             </div>
          </div>
        </div>

        <DialogFooter className="sm:justify-end">
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AssetInfoModal; 