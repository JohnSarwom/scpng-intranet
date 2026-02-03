import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { UserAsset } from '@/types'; // Assuming UserAsset type is defined here
import { formatDate } from '@/lib/utils'; // Assuming formatDate is here
import { cn } from '@/lib/utils'; // Import cn for conditional classes

interface FullAssetInfoModalProps {
  asset: UserAsset | null;
  isOpen: boolean;
  onClose: () => void;
}

// Helper to display N/A for nullish values
const displayValue = (value: string | number | null | undefined, prefix = '', suffix = '') => {
  if (value === null || typeof value === 'undefined' || value === '') {
    return <span className="text-muted-foreground">N/A</span>;
  }
  return `${prefix}${value}${suffix}`;
};

// Helper function for condition badge styling (can be moved to utils if needed elsewhere)
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

const FullAssetInfoModal: React.FC<FullAssetInfoModalProps> = ({ asset, isOpen, onClose }) => {
  if (!asset) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {/* Ensure padding is on DialogContent, allow scrolling, use flex column */}
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto p-6 flex flex-col">

        {/* Top Section: Image Container - prevent shrinking */}
        <div className="w-full aspect-video bg-muted overflow-hidden flex flex-shrink-0 items-center justify-center rounded-lg mb-6">
          {asset.image_url ? (
            <img
              src={asset.image_url}
              alt={asset.name || 'Asset'}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-6xl font-semibold text-muted-foreground">
              {asset.name?.charAt(0).toUpperCase() || 'A'}
            </span>
          )}
        </div>

        {/* Wrapper for all content BELOW the image - allow growing and scrolling */}
        <div className="flex-grow overflow-y-auto">
          {/* Name and Status (below image) */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold mb-2">{displayValue(asset.name)}</h2>
            {asset.condition && (
              <Badge variant="outline" className={cn("font-medium", getConditionBadgeClass(asset.condition))}>
                {asset.condition}
              </Badge>
            )}
          </div>

          {/* Grid for Asset Details (below name/status) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4 text-sm mb-6">
              {/* Grouping related info */}
              {/* Use md:col-span-3 for headers on medium screens */}
              <div className="space-y-1 col-span-1 sm:col-span-2 md:col-span-3 border-t pt-3 font-semibold">Assignment & Location</div>
              <div><strong>Assigned To:</strong> {displayValue(asset.assigned_to)}</div>
              <div><strong>Email:</strong> {displayValue(asset.assigned_to_email)}</div>
              <div><strong>Unit:</strong> {displayValue(asset.unit)}</div>
              <div><strong>Division:</strong> {displayValue(asset.division)}</div>
              <div><strong>Assigned Date:</strong> {formatDate(asset.assigned_date)}</div>

              <div className="space-y-1 col-span-1 sm:col-span-2 md:col-span-3 border-t pt-3 mt-3 font-semibold">Purchase & Warranty</div>
              <div><strong>Vendor:</strong> {displayValue(asset.vendor)}</div>
              <div><strong>Purchase Date:</strong> {formatDate(asset.purchase_date)}</div>
              <div><strong>Purchase Cost:</strong> {displayValue(asset.purchase_cost, '$')}</div>
              <div><strong>Warranty Expiry:</strong> {formatDate(asset.warranty_expiry_date)}</div>
              <div><strong>Asset Expiry Date:</strong> {formatDate(asset.expiry_date)}</div>

              <div className="space-y-1 col-span-1 sm:col-span-2 md:col-span-3 border-t pt-3 mt-3 font-semibold">Financials & Usage</div>
              <div><strong>Life Expectancy:</strong> {displayValue(asset.life_expectancy_years, '', ' Years')}</div>
              <div><strong>Depreciated Value:</strong> {displayValue(asset.depreciated_value, '$')}</div>
              <div><strong>YTD Usage:</strong> {displayValue(asset.ytd_usage)}</div>

              <div className="space-y-1 col-span-1 sm:col-span-2 md:col-span-3 border-t pt-3 mt-3 font-semibold">References & Metadata</div>
              <div><strong>Invoice URL:</strong> {asset.invoice_url ? <a href={asset.invoice_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">{asset.invoice_url}</a> : displayValue(null)}</div>
              <div><strong>Barcode URL:</strong> {asset.barcode_url ? <a href={asset.barcode_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">{asset.barcode_url}</a> : displayValue(null)}</div>
              <div><strong>Last Updated:</strong> {formatDate(asset.last_updated, true)} by {displayValue(asset.last_updated_by)}</div>
              <div><strong>Created At:</strong> {formatDate(asset.created_at, true)}</div>

              {/* Notes and Admin Comments */}
              <div className="col-span-1 sm:col-span-2 md:col-span-3 border-t pt-3 mt-3 space-y-2">
                <div className="font-semibold">Notes:</div>
                <p className="text-muted-foreground whitespace-pre-wrap text-xs bg-secondary/30 p-2 rounded">{displayValue(asset.notes)}</p>
                <div className="font-semibold">Admin Comments:</div>
                <p className="text-muted-foreground whitespace-pre-wrap text-xs bg-secondary/30 p-2 rounded">{displayValue(asset.admin_comments)}</p>
              </div>
            </div>
        </div> {/* End wrapper for content below image */}

        {/* Footer (below grid) - prevent shrinking */}
        <DialogFooter className="pt-6 sm:justify-end border-t mt-auto flex-shrink-0"> {/* Use mt-auto to push to bottom if content is short */}
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FullAssetInfoModal; 