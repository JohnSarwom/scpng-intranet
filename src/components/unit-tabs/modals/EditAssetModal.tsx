import React, { useState, useEffect, useCallback } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Popover, 
  PopoverTrigger, 
  PopoverContent 
} from "@/components/ui/popover";
import { 
  Command, 
  CommandInput, 
  CommandEmpty, 
  CommandGroup, 
  CommandItem, 
  CommandList
} from "@/components/ui/command";
import { UserAsset, Division as TypeDivision } from '@/types';
import { Unit } from '@/data/units';
import { StaffMember } from '@/data/divisions';
import { toast } from "@/components/ui/use-toast";
import DatePicker from '@/components/DatePicker';
import FileUpload from '@/components/FileUpload';
import { Upload, Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const conditionOptions = ["New", "Good", "Fair", "Poor", "Needs Repair", "For Disposal"];

interface EditAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit: (asset: Partial<UserAsset>) => void;
  onDelete: () => void;
  asset: UserAsset;
  divisions: TypeDivision[];
  units: Unit[]; 
  staffMembers: StaffMember[]; 
  existingNames: string[]; 
  existingTypes: string[]; 
  existingVendors: string[]; 
}

const formatDateForInput = (date: string | Date | null | undefined): string => {
  if (!date) return '';
  if (typeof date === 'string') return date;
  try {
    return date.toISOString().split('T')[0];
  } catch {
    return '';
  }
};

const EditAssetModal: React.FC<EditAssetModalProps> = ({
  isOpen,
  onClose,
  onEdit,
  onDelete,
  asset,
  divisions,
  units,
  staffMembers,
  existingNames,
  existingTypes,
  existingVendors
}) => {
  const [editedAsset, setEditedAsset] = useState<Partial<UserAsset>>({});
  const [showInvoiceUpload, setShowInvoiceUpload] = useState(false);
  const [isAssigneePopoverOpen, setIsAssigneePopoverOpen] = useState(false); 
  const [isNamePopoverOpen, setIsNamePopoverOpen] = useState(false); 
  const [isTypePopoverOpen, setIsTypePopoverOpen] = useState(false); 
  const [isVendorPopoverOpen, setIsVendorPopoverOpen] = useState(false);

  useEffect(() => {
    if (asset) {
      setEditedAsset({
        ...asset,
        image_url: asset.image_url,
        purchase_date: formatDateForInput(asset.purchase_date),
        purchase_cost: asset.purchase_cost,
        warranty_expiry_date: formatDateForInput(asset.warranty_expiry_date),
        expiry_date: formatDateForInput(asset.expiry_date),
        assigned_date: formatDateForInput(asset.assigned_date)
      });
    }
  }, [asset]);

  const handleSaveChanges = () => {
    if (!editedAsset.name || !editedAsset.assigned_to) {
        toast({ title: "Validation Error", description: "Asset name and Assigned To are required", variant: "destructive" });
        return;
    }
    onEdit(editedAsset);
    onClose();
  };
  
  const handleClose = () => {
      setIsAssigneePopoverOpen(false); 
      setIsNamePopoverOpen(false); 
      setIsTypePopoverOpen(false);
      setIsVendorPopoverOpen(false);
      onClose();
  }

  const handleChange = useCallback((field: keyof Partial<UserAsset>, value: any) => {
    setEditedAsset(prev => {
      let updatedAsset = { ...prev };

      if (field === 'purchase_cost') {
        const numValue = value === '' ? null : parseFloat(value);
        updatedAsset = { ...prev, purchase_cost: isNaN(numValue) ? null : numValue };
      }
      else if (field === 'assigned_to') {
        const selectedStaffName = value;
        const staffMember = staffMembers.find(s => s.name === selectedStaffName);
        
        if (staffMember) {
          updatedAsset.assigned_to_email = staffMember.email;
          updatedAsset.unit = staffMember.department || ''; 
          const division = divisions.find(d => d.id === staffMember.divisionId);
          updatedAsset.division = division ? division.name : ''; 
        } else {
          if (!selectedStaffName) { 
            updatedAsset.assigned_to_email = '';
            updatedAsset.unit = '';
            updatedAsset.division = '';
          }
        }
      } else {
         updatedAsset = { ...prev, [field]: value };
      }
      
      return updatedAsset;
    });
  }, [staffMembers, divisions]);

  const handleDateChange = (field: keyof Partial<UserAsset>, date: Date | null | undefined) => {
     handleChange(field, date ? formatDateForInput(date) : null);
  };

  if (!isOpen || !asset) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Edit Asset</DialogTitle>
          <DialogDescription>
            Make changes to the asset details below.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-asset-name">Asset Name <span className="text-destructive">*</span></Label>
               <Popover open={isNamePopoverOpen} onOpenChange={setIsNamePopoverOpen}>
                 <PopoverTrigger asChild>
                   <Button variant="outline" role="combobox" aria-expanded={isNamePopoverOpen} className="w-full justify-between font-normal text-left">
                     {editedAsset.name || "Select or type name..."}
                     <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                   </Button>
                 </PopoverTrigger>
                 <PopoverContent className="w-[--radix-popover-trigger-width] max-h-[--radix-popover-content-available-height] p-0">
                   <Command>
                     <CommandInput placeholder="Search or type name..." value={editedAsset.name || ''} onValueChange={(value) => handleChange('name', value)}/>
                     <CommandList>
                       <CommandEmpty>No matching name found.</CommandEmpty>
                       <CommandGroup>
                         {existingNames.map((name, index) => (
                           <CommandItem key={index} value={String(index)} onSelect={(currentValue) => { const idx=parseInt(currentValue,10); const selName=existingNames[idx]; handleChange('name', selName === editedAsset.name ? "" : selName); setIsNamePopoverOpen(false); }}>
                             <Check className={cn("mr-2 h-4 w-4", editedAsset.name === name ? "opacity-100" : "opacity-0")} /> {name}
                           </CommandItem>
                         ))}
                       </CommandGroup>
                     </CommandList>
                   </Command>
                 </PopoverContent>
               </Popover>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-asset-type">Type</Label>
               <Popover open={isTypePopoverOpen} onOpenChange={setIsTypePopoverOpen}>
                 <PopoverTrigger asChild>
                   <Button variant="outline" role="combobox" aria-expanded={isTypePopoverOpen} className="w-full justify-between font-normal text-left">
                     {editedAsset.type || "Select or type type..."}
                     <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                   </Button>
                 </PopoverTrigger>
                 <PopoverContent className="w-[--radix-popover-trigger-width] max-h-[--radix-popover-content-available-height] p-0">
                   <Command>
                     <CommandInput placeholder="Search or type type..." value={editedAsset.type || ''} onValueChange={(value) => handleChange('type', value)} />
                     <CommandList>
                       <CommandEmpty>No matching type found.</CommandEmpty>
                       <CommandGroup>
                         {existingTypes.map((type, index) => (
                           <CommandItem key={index} value={String(index)} onSelect={(currentValue) => { const idx=parseInt(currentValue,10); const selType=existingTypes[idx]; handleChange('type', selType === editedAsset.type ? "" : selType); setIsTypePopoverOpen(false); }}>
                             <Check className={cn("mr-2 h-4 w-4", editedAsset.type === type ? "opacity-100" : "opacity-0")} /> {type}
                           </CommandItem>
                         ))}
                       </CommandGroup>
                     </CommandList>
                   </Command>
                 </PopoverContent>
               </Popover>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-asset-unit">Unit</Label>
              <Select value={editedAsset.unit || ''} onValueChange={(value) => handleChange('unit', value)}>
                <SelectTrigger id="edit-asset-unit"><SelectValue placeholder="Select Unit (auto-filled)" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Select Unit</SelectItem>
                  {units.map((unit) => (<SelectItem key={unit.id} value={unit.name}>{unit.name}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-asset-division">Division</Label>
              <Select value={editedAsset.division || ''} onValueChange={(value) => handleChange('division', value)}>
                <SelectTrigger id="edit-asset-division"><SelectValue placeholder="Select Division (auto-filled)" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Select Division</SelectItem>
                  {divisions.map((division) => (<SelectItem key={division.id} value={division.name}>{division.name}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-asset-assigned-to">Assigned To <span className="text-destructive">*</span></Label>
               <Popover open={isAssigneePopoverOpen} onOpenChange={setIsAssigneePopoverOpen}>
                 <PopoverTrigger asChild>
                   <Button variant="outline" role="combobox" aria-expanded={isAssigneePopoverOpen} className="w-full justify-between font-normal text-left">
                     {editedAsset.assigned_to || "Select Staff Member..."}
                     <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                   </Button>
                 </PopoverTrigger>
                 <PopoverContent className="w-[--radix-popover-trigger-width] max-h-[--radix-popover-content-available-height] p-0">
                   <Command>
                     <CommandInput placeholder="Search staff member..." />
                     <CommandList>
                       <CommandEmpty>No staff member found.</CommandEmpty>
                       <CommandGroup>
                         {staffMembers.map((staff) => (
                           <CommandItem key={staff.id} value={staff.name} onSelect={(currentValue) => { handleChange('assigned_to', currentValue === editedAsset.assigned_to ? "" : staff.name); setIsAssigneePopoverOpen(false); }}>
                             <Check className={cn("mr-2 h-4 w-4", editedAsset.assigned_to === staff.name ? "opacity-100" : "opacity-0")} /> {staff.name} ({staff.email})
                           </CommandItem>
                         ))}
                       </CommandGroup>
                     </CommandList>
                   </Command>
                 </PopoverContent>
               </Popover>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-asset-assigned-email">Assigned Email</Label>
              <Input id="edit-asset-assigned-email" value={editedAsset.assigned_to_email || ''} readOnly disabled className="bg-muted/50" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-asset-assigned-date">Assigned Date</Label>
              <DatePicker date={editedAsset.assigned_date ? new Date(editedAsset.assigned_date) : undefined} setDate={(date) => handleDateChange('assigned_date', date)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-asset-purchase-date">Purchase Date</Label>
              <DatePicker date={editedAsset.purchase_date ? new Date(editedAsset.purchase_date) : undefined} setDate={(date) => handleDateChange('purchase_date', date)} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-asset-purchase-cost">Purchase Cost</Label>
               <div className="relative">
                 <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">K</span>
                <Input 
                  id="edit-asset-purchase-cost" 
                  type="number" 
                  step="0.01" 
                  placeholder="e.g., 1200.50" 
                  className="pl-7" 
                  value={editedAsset.purchase_cost ?? ''} 
                  onChange={(e) => handleChange('purchase_cost', e.target.value)}
                />
               </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-asset-condition">Condition</Label>
              <Select value={editedAsset.condition || ''} onValueChange={(value) => handleChange('condition', value)}>
                 <SelectTrigger id="edit-asset-condition"><SelectValue placeholder="Select Condition" /></SelectTrigger>
                 <SelectContent>
                   <SelectItem value="">Select Condition</SelectItem>
                   {conditionOptions.map((option) => (<SelectItem key={option} value={option}>{option}</SelectItem>))}
                 </SelectContent>
               </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="grid gap-2">
              <Label htmlFor="edit-asset-warranty">Warranty Expiry Date</Label>
              <DatePicker date={editedAsset.warranty_expiry_date ? new Date(editedAsset.warranty_expiry_date) : undefined} setDate={(date) => handleDateChange('warranty_expiry_date', date)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-asset-expiry-date">Expiry Date (e.g., Software)</Label>
              <DatePicker date={editedAsset.expiry_date ? new Date(editedAsset.expiry_date) : undefined} setDate={(date) => handleDateChange('expiry_date', date)} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="grid gap-2">
               <Label htmlFor="edit-asset-life">Life Expectancy (Years)</Label>
               <Input id="edit-asset-life" type="number" placeholder="e.g., 3" value={editedAsset.life_expectancy_years ?? ''} onChange={(e) => handleChange('life_expectancy_years', e.target.value ? parseInt(e.target.value, 10) : undefined)} />
             </div>
             <div className="grid gap-2">
                <Label htmlFor="edit-asset-ytd-usage">YTD Usage</Label>
                <Input id="edit-asset-ytd-usage" placeholder="e.g., 50 hours, 1000km" value={editedAsset.ytd_usage || ''} onChange={(e) => handleChange('ytd_usage', e.target.value)} />
             </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="grid gap-2">
               <Label htmlFor="edit-asset-invoice-url">Invoice URL or Upload</Label>
               <div className="flex items-center gap-2">
                 <Input 
                   id="edit-asset-invoice-url" 
                   placeholder="https://... or click upload" 
                   value={editedAsset.invoice_url || ''} 
                   onChange={(e) => {
                      handleChange('invoice_url', e.target.value);
                      setShowInvoiceUpload(false);
                   }}
                 />
                 <Button 
                   variant="outline" 
                   size="icon" 
                   onClick={() => setShowInvoiceUpload(true)} 
                   title="Upload Invoice"
                 >
                   <Upload className="h-4 w-4" />
                 </Button>
               </div>
               {showInvoiceUpload && (
                  <div className="mt-2">
                    <FileUpload 
                      onFileUpload={(url) => { 
                        handleChange('invoice_url', url); 
                        setShowInvoiceUpload(false);
                      }}
                    />
                  </div>
               )}
             </div>
             <div className="grid gap-2">
               <Label htmlFor="edit-asset-barcode-url">Barcode URL</Label>
               <Input id="edit-asset-barcode-url" placeholder="https://..." value={editedAsset.barcode_url || ''} onChange={(e) => handleChange('barcode_url', e.target.value)} />
             </div>
           </div>

          <div className="grid gap-2">
            <Label htmlFor="edit-asset-notes">Notes</Label>
            <Textarea id="edit-asset-notes" placeholder="Additional notes about the asset" value={editedAsset.notes || ''} onChange={(e) => handleChange('notes', e.target.value)} />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="edit-asset-admin-comments">Admin Comments</Label>
            <Textarea id="edit-asset-admin-comments" placeholder="Internal comments" value={editedAsset.admin_comments || ''} onChange={(e) => handleChange('admin_comments', e.target.value)} />
          </div>

          <div className="grid gap-2">
             <Label htmlFor="edit-asset-image">Asset Image</Label>
             <FileUpload 
               onFileUpload={(url) => handleChange('image_url', url)}
               currentImage={editedAsset.image_url}
             />
          </div>

          {/* Description */}
          <div className="grid gap-2">
            <Label htmlFor="description">Description / Specifications</Label>
            <Textarea
              id="description"
              placeholder="Enter asset description or specs..."
              value={editedAsset.description || ''}
              onChange={(e) => handleChange('description', e.target.value)}
              className="min-h-[80px]"
            />
          </div>
        </div>
        <DialogFooter className="justify-between sm:justify-between">
           <Button variant="destructive" onClick={onDelete}>Delete Asset</Button>
           <div>
             <Button variant="outline" onClick={handleClose} className="mr-2">Cancel</Button>
             <Button onClick={handleSaveChanges}>Save Changes</Button>
           </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditAssetModal; 