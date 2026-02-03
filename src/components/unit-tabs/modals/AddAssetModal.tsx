import React, { useState, useCallback, useEffect, useRef } from 'react';
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
import { UserAsset } from '@/types';
import { toast } from "@/components/ui/use-toast";
import DatePicker from '@/components/DatePicker';
import { Upload, Check, ChevronsUpDown, Loader2, Paperclip, X } from 'lucide-react';
import { Division as TypeDivision } from '@/types';
import { Unit } from '@/data/units';
import { cn } from '@/lib/utils';
import { useMicrosoftGraph } from '@/hooks/useMicrosoftGraph.tsx';
import { useEmployees } from '@/contexts/EmployeesContext';
import { staffMembers } from '@/data/divisions';
import { ASSET_TYPES, ASSET_CONDITIONS } from '@/constants/assetChoices';
import { GlobalAssigneeSelector } from '@/components/common/GlobalAssigneeSelector';

interface AddAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (asset: Partial<Omit<UserAsset, 'id' | 'created_at' | 'last_updated'>>) => void;
  divisions?: TypeDivision[];
  units?: Unit[];
  existingNames?: string[];
  existingTypes?: string[];
  existingVendors?: string[];
}

// Note: All fields saved as text to avoid SharePoint Choice field mismatches

// Helper to format Date to YYYY-MM-DD string or return existing string/null
const formatDateForInput = (date: string | Date | null | undefined): string => {
  if (!date) return '';
  if (typeof date === 'string') return date; // Already a string
  try {
    return date.toISOString().split('T')[0];
  } catch {
    return '';
  }
};

const AddAssetModal: React.FC<AddAssetModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  divisions = [],
  units = [],
  existingNames = [],
  existingTypes = [],
  existingVendors = []
}) => {
  // Import Graph Hook
  const {
    uploadFileToSharePointLibrary,
    isLoading: isGraphLoading,
    lastError: graphLastError
  } = useMicrosoftGraph();

  // Use centralized Employees Context
  const employeesContext = useEmployees();
  const employees = employeesContext?.employees || [];
  const isLoadingEmployees = employeesContext?.isLoading || false;
  const isInitialized = employeesContext?.isInitialized || false;
  const employeesError = employeesContext?.error || null;

  // Debug: Log context state
  useEffect(() => {
    console.log('[AddAssetModal] Employees Context State:', {
      employeeCount: employees?.length || 0,
      isLoading: isLoadingEmployees,
      isInitialized,
      error: employeesError
    });
  }, [employees, isLoadingEmployees, isInitialized, employeesError]);

  // Initialize state based on UserAsset type (excluding fields set by parent)
  const [newAsset, setNewAsset] = useState<Partial<Omit<UserAsset, 'id' | 'created_at' | 'last_updated'>>>({
    name: '',
    type: '',
    brand: '',
    model: '',
    serial_number: '',
    assigned_to: '',
    assigned_to_email: '',
    description: '',
    unit: '',
    division: '',
    purchase_date: formatDateForInput(new Date()), // Default to today
    vendor: '',
    warranty_expiry_date: formatDateForInput(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)), // Default 1 year
    invoice_url: '',
    expiry_date: '',
    life_expectancy_years: undefined,
    condition: '',
    ytd_usage: '',
    specifications: {},
    notes: '',
    barcode_url: '',
    image_url: '',
    admin_comments: '',
    last_updated_by: '', // Or set this in parent if needed
    purchase_cost: null,
    // checklist: [] // Assuming not used for now
  });

  // State for Image Upload
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null); // Ref for the file input

  // State to control the visibility of the FileUpload component for invoice (Keep if needed)
  // const [showInvoiceUpload, setShowInvoiceUpload] = useState(false); 
  const [isAssigneePopoverOpen, setIsAssigneePopoverOpen] = useState(false); // Re-add state for Combobox popover
  const [isNamePopoverOpen, setIsNamePopoverOpen] = useState(false); // Re-add state for Name Combobox
  const [isTypePopoverOpen, setIsTypePopoverOpen] = useState(false); // Re-add state for Type Combobox
  const [isVendorPopoverOpen, setIsVendorPopoverOpen] = useState(false); // Re-add state for Vendor Combobox

  // Effect to handle Graph API errors during upload
  useEffect(() => {
    if (isUploading && graphLastError) {
      setUploadError(graphLastError);
      toast({ title: "Upload Error", description: graphLastError, variant: "destructive" });
      setIsUploading(false); // Reset loading state on error
      setSelectedFile(null); // Clear selected file on error
      setNewAsset(prev => ({ ...prev, image_url: '' })); // Clear potential previous URL
    }
  }, [graphLastError, isUploading, toast]);

  // Debug: Log employees when modal opens
  useEffect(() => {
    if (isOpen) {
      console.log('[AddAssetModal] Modal opened. Employees from context:', employees.length);
      console.log('[AddAssetModal] Loading:', isLoadingEmployees, 'Initialized:', isInitialized);
      if (employees.length > 0) {
        console.log('[AddAssetModal] Sample employee:', employees[0]);
      }
    }
  }, [isOpen, employees, isLoadingEmployees, isInitialized]);

  const handleAddAsset = () => {
    // Basic validation (add more as needed)
    if (!newAsset.name) {
      toast({ title: "Validation Error", description: "Asset name is required", variant: "destructive" });
      return;
    }
    if (!newAsset.assigned_to) {
      toast({ title: "Validation Error", description: "Assigned To is required", variant: "destructive" });
      return;
    }

    onAdd(newAsset);
    handleCloseAndReset();
  };

  const handleCloseAndReset = () => {
    setNewAsset({ /* Reset state fields including assignee */
      name: '', type: '', assigned_to: '', assigned_to_email: '', unit: '', division: '',
      purchase_date: formatDateForInput(new Date()),
      vendor: '', warranty_expiry_date: formatDateForInput(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)),
      invoice_url: '', expiry_date: '', life_expectancy_years: undefined, condition: '', ytd_usage: '',
      specifications: {}, notes: '', barcode_url: '', image_url: '', admin_comments: '', last_updated_by: '',
      purchase_cost: null,
      description: ''
    });
    // Reset Upload State
    setSelectedFile(null);
    setIsUploading(false);
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Clear the file input visually
    }
    setIsAssigneePopoverOpen(false); // Re-add resetting popover states
    setIsNamePopoverOpen(false);
    setIsTypePopoverOpen(false);
    setIsVendorPopoverOpen(false);
    onClose();
  }

  const handleChange = useCallback((field: keyof typeof newAsset, value: any) => {
    setNewAsset(prev => {
      let updatedAsset = { ...prev }; // Initialize with prev

      if (field === 'purchase_cost') {
        const numValue = value === '' ? null : parseFloat(value);
        updatedAsset = { ...prev, purchase_cost: isNaN(numValue) ? null : numValue };
      }
      else if (field === 'assigned_to') {
        const selectedEmployeeName = value;
        // Find the employee from the context
        const employee = employees?.find(e => e.displayName === selectedEmployeeName);

        updatedAsset = { ...prev, [field]: value }; // Need to update assigned_to first

        if (employee) {
          console.log('[AddAssetModal] Selected employee:', {
            name: employee.displayName,
            email: employee.mail,
            department: employee.department,
            jobTitle: employee.jobTitle
          });

          // Auto-populate email, unit, and division from employee data
          updatedAsset.assigned_to_email = employee.mail || '';
          updatedAsset.unit = employee.department || '';

          console.log('[AddAssetModal] Setting unit to:', employee.department);

          // Find division using the staffMembers lookup table from divisions.ts
          // This contains the department -> divisionId mapping
          if (employee.department) {
            const staffMember = staffMembers.find(s =>
              s.department.toLowerCase() === employee.department.toLowerCase()
            );

            console.log('[AddAssetModal] Staff member match:', staffMember);

            if (staffMember && staffMember.divisionId) {
              const division = divisions.find(d => d.id === staffMember.divisionId);
              updatedAsset.division = division ? division.name : '';
              console.log('[AddAssetModal] Division found:', division);
              console.log('[AddAssetModal] Setting division to:', division?.name);
            } else {
              console.warn('[AddAssetModal] No division mapping found for department:', employee.department);
            }
          }
        } else {
          if (!selectedEmployeeName) {
            updatedAsset.assigned_to_email = '';
            updatedAsset.unit = '';
            updatedAsset.division = '';
          }
        }
      } else {
        // Default update for other fields
        updatedAsset = { ...prev, [field]: value };
      }

      return updatedAsset;
    });
  }, [employees, divisions, units]);

  // Handler for date picker (assuming it returns a Date object)
  const handleDateChange = (field: keyof typeof newAsset, date: Date | null | undefined) => {
    handleChange(field, date ? formatDateForInput(date) : null);
  };

  // Image File Selection Handler
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setSelectedFile(null);
      setUploadError(null);
      setNewAsset(prev => ({ ...prev, image_url: '' })); // Clear URL if file is deselected
      return;
    }

    // Basic Validation (adjust size limit as needed)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setUploadError(`File is too large. Maximum size is ${maxSize / 1024 / 1024}MB.`);
      toast({ title: "File Error", description: `File is too large (max ${maxSize / 1024 / 1024}MB).`, variant: "destructive" });
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = ''; // Clear input
      return;
    }
    if (!file.type.startsWith('image/')) {
      setUploadError('Invalid file type. Please select an image (PNG, JPG, GIF, etc.).');
      toast({ title: "File Error", description: "Invalid file type. Please select an image.", variant: "destructive" });
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = ''; // Clear input
      return;
    }

    setSelectedFile(file);
    setUploadError(null);
    setIsUploading(true);
    setNewAsset(prev => ({ ...prev, image_url: '' })); // Clear previous URL while uploading new one

    try {
      // Use the function from the hook
      const webUrl = await uploadFileToSharePointLibrary(file);

      if (webUrl) {
        handleChange('image_url', webUrl); // Update the newAsset state with the URL
        toast({ title: "Upload Successful", description: `${file.name} uploaded.` });
      } else {
        // Error handling is partly done in the useEffect hook watching graphLastError
        // but we can add a specific message here if webUrl is null without an explicit graph error
        if (!graphLastError) { // Only show if no graph error was caught by effect
          const msg = "Upload completed, but failed to get the file URL.";
          setUploadError(msg);
          toast({ title: "Upload Issue", description: msg, variant: "destructive" });
        }
        setSelectedFile(null); // Clear selection on failure
        if (fileInputRef.current) fileInputRef.current.value = ''; // Clear input
      }
    } catch (error: any) {
      // This catch might be redundant if the hook handles errors, but good for safety
      const msg = `Upload failed: ${error.message || 'Unknown error'}`;
      console.error("Upload catch block:", error);
      setUploadError(msg);
      toast({ title: "Upload Failed", description: msg, variant: "destructive" });
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = ''; // Clear input
    } finally {
      setIsUploading(false); // Ensure loading state is cleared
    }
  };

  // Helper to clear the selected file
  const clearSelectedFile = () => {
    setSelectedFile(null);
    setUploadError(null);
    setIsUploading(false);
    setNewAsset(prev => ({ ...prev, image_url: '' })); // Clear stored URL
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Clear the file input
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleCloseAndReset()}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Add New Asset</DialogTitle>
          <DialogDescription>
            Fill in the details for the new asset. Fields marked with * are recommended.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
          {/* Row 1: Name & Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Asset Name - Simple Input Field */}
            <div className="grid gap-2">
              <Label htmlFor="asset-name">Asset Name <span className="text-destructive">*</span></Label>
              <Input
                id="asset-name"
                placeholder="e.g., Dell Latitude 5420"
                value={newAsset.name || ''}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full"
              />
            </div>
            {/* Type Input - Text field in SharePoint */}
            <div className="grid gap-2">
              <Label htmlFor="asset-type">Type <span className="text-destructive">*</span></Label>
              <Input
                id="asset-type"
                placeholder="e.g., Laptop, Desktop PC, Monitor"
                value={newAsset.type || ''}
                onChange={(e) => handleChange('type', e.target.value)}
                className="w-full"
              />
            </div>
          </div>

          {/* Row: Brand, Model, Serial Number */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="asset-brand">Brand</Label>
              <Input id="asset-brand" placeholder="e.g., Dell, Apple" value={newAsset.brand || ''} onChange={(e) => handleChange('brand', e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="asset-model">Model</Label>
              <Input id="asset-model" placeholder="e.g., Latitude 7490, MacBook Pro" value={newAsset.model || ''} onChange={(e) => handleChange('model', e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="asset-serial-number">Serial Number</Label>
              <Input id="asset-serial-number" placeholder="e.g., ABC12345" value={newAsset.serial_number || ''} onChange={(e) => handleChange('serial_number', e.target.value)} />
            </div>
          </div>

          {/* UPDATED Row: Assigned To - Combobox or Input fallback */}
          <div className="grid gap-2">
            <Label htmlFor="asset-assigned-to">Assigned To <span className="text-destructive">*</span></Label>

            {/* UPDATED Row: Assigned To - using GlobalAssigneeSelector */}
            <div className="grid gap-2">
              <Label htmlFor="asset-assigned-to">Assigned To <span className="text-destructive">*</span></Label>
              <GlobalAssigneeSelector
                selected={newAsset.assigned_to ? [{
                  id: newAsset.assigned_to_email || 'temp-id',
                  displayName: newAsset.assigned_to,
                  givenName: '',
                  surname: '',
                  mail: newAsset.assigned_to_email || ''
                }] : []}
                onChange={(selected) => {
                  const employee = selected[0]; // Single mode
                  if (employee) {
                    handleChange('assigned_to', employee.displayName);
                  } else {
                    handleChange('assigned_to', '');
                  }
                }}
                mode="single"
                placeholder="Select Staff Member..."
              />
            </div>
          </div>

          {/* Row 2: Unit & Division */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="asset-unit">Unit</Label>
              <Select
                value={newAsset.unit || ''}
                onValueChange={(value) => handleChange('unit', value)}
              >
                <SelectTrigger id="asset-unit">
                  <SelectValue placeholder="Select Unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Select Unit</SelectItem>
                  {units.map((unit) => (
                    <SelectItem key={unit.id} value={unit.name}>
                      {unit.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="asset-division">Division</Label>
              <Select
                value={newAsset.division || ''}
                onValueChange={(value) => handleChange('division', value)}
              >
                <SelectTrigger id="asset-division">
                  <SelectValue placeholder="Select Division" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Select Division</SelectItem>
                  {divisions.map((division) => (
                    <SelectItem key={division.id} value={division.name}>
                      {division.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 4: Condition & Vendor */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Condition Input - Text field in SharePoint */}
            <div className="grid gap-2">
              <Label htmlFor="asset-condition">Condition</Label>
              <Input
                id="asset-condition"
                placeholder="e.g., Excellent, Good, Fair, Poor"
                value={newAsset.condition || ''}
                onChange={(e) => handleChange('condition', e.target.value)}
              />
            </div>
            {/* Vendor Input */}
            <div className="grid gap-2">
              <Label htmlFor="asset-vendor">Vendor</Label>
              <Input
                id="asset-vendor"
                placeholder="e.g., Dell, HP, Lenovo"
                value={newAsset.vendor || ''}
                onChange={(e) => handleChange('vendor', e.target.value)}
              />
            </div>
          </div>

          {/* Row 5: Purchase Date & Purchase Cost */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="asset-purchase-date">Purchase Date</Label>
              <DatePicker date={newAsset.purchase_date ? new Date(newAsset.purchase_date) : undefined} setDate={(date) => handleDateChange('purchase_date', date)} />
            </div>
            {/* Purchase Cost Input with Visual Prefix */}
            <div className="grid gap-2">
              <Label htmlFor="asset-purchase-cost">Purchase Cost</Label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">K</span>
                <Input
                  id="asset-purchase-cost"
                  type="number"
                  step="0.01"
                  placeholder="e.g., 1200.50"
                  className="pl-7"
                  value={newAsset.purchase_cost ?? ''}
                  onChange={(e) => handleChange('purchase_cost', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Row 6: Warranty Expiry & Expiry Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="asset-warranty">Warranty Expiry Date</Label>
              <DatePicker date={newAsset.warranty_expiry_date ? new Date(newAsset.warranty_expiry_date) : undefined} setDate={(date) => handleDateChange('warranty_expiry_date', date)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="asset-expiry-date">Expiry Date (e.g., Software)</Label>
              <DatePicker date={newAsset.expiry_date ? new Date(newAsset.expiry_date) : undefined} setDate={(date) => handleDateChange('expiry_date', date)} />
            </div>
          </div>

          {/* Row 7: Life Expectancy & YTD Usage */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="asset-life">Life Expectancy (Years)</Label>
              <Input id="asset-life" type="number" placeholder="e.g., 3" value={newAsset.life_expectancy_years ?? ''} onChange={(e) => handleChange('life_expectancy_years', e.target.value ? parseInt(e.target.value, 10) : undefined)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="asset-ytd-usage">YTD Usage</Label>
              <Input id="asset-ytd-usage" placeholder="e.g., 50 hours, 1000km" value={newAsset.ytd_usage || ''} onChange={(e) => handleChange('ytd_usage', e.target.value)} />
            </div>
          </div>

          {/* Row 8: Invoice URL & Barcode URL */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Invoice URL Input + Upload Button */}
            <div className="grid gap-2">
              <Label htmlFor="asset-invoice-url">Invoice URL or Upload</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="asset-invoice-url"
                  placeholder="https://... or click upload"
                  value={newAsset.invoice_url || ''}
                  onChange={(e) => {
                    handleChange('invoice_url', e.target.value);
                  }}
                />
              </div>
            </div>
            {/* Barcode URL Input */}
            <div className="grid gap-2">
              <Label htmlFor="asset-barcode-url">Barcode URL</Label>
              <Input id="asset-barcode-url" placeholder="https://..." value={newAsset.barcode_url || ''} onChange={(e) => handleChange('barcode_url', e.target.value)} />
            </div>
          </div>

          {/* Row 9: Notes */}
          <div className="grid gap-2">
            <Label htmlFor="asset-notes">Notes</Label>
            <Textarea id="asset-notes" placeholder="Additional notes about the asset" value={newAsset.notes || ''} onChange={(e) => handleChange('notes', e.target.value)} />
          </div>

          {/* Row 10: Admin Comments */}
          <div className="grid gap-2">
            <Label htmlFor="asset-admin-comments">Admin Comments</Label>
            <Textarea id="asset-admin-comments" placeholder="Internal comments" value={newAsset.admin_comments || ''} onChange={(e) => handleChange('admin_comments', e.target.value)} />
          </div>

          {/* Row 11: Image Upload */}
          <div className="grid gap-2">
            <Label htmlFor="asset-image">Asset Image (Optional)</Label>
            <div className="flex items-center gap-2 p-3 border border-dashed rounded-md min-h-[80px]">
              {!selectedFile && !newAsset.image_url && !isUploading && (
                <label
                  htmlFor="asset-image-input"
                  className="flex flex-col items-center justify-center w-full h-full cursor-pointer text-muted-foreground hover:text-primary"
                >
                  <Upload className="h-8 w-8 mb-1" />
                  <span>Click or drag to upload</span>
                  <span className="text-xs">(PNG, JPG, GIF - Max 5MB)</span>
                  <Input
                    id="asset-image-input"
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="sr-only" // Hide the default input, use label for interaction
                    ref={fileInputRef}
                    disabled={isUploading}
                  />
                </label>
              )}
              {isUploading && (
                <div className="flex items-center justify-center w-full text-muted-foreground">
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  <span>Uploading {selectedFile?.name}...</span>
                </div>
              )}
              {!isUploading && (selectedFile || newAsset.image_url) && (
                <div className="flex items-center justify-between w-full bg-muted/50 p-2 rounded text-sm">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <Paperclip className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate" title={selectedFile?.name || newAsset.image_url}>
                      {selectedFile?.name || newAsset.image_url}
                    </span>
                  </div>
                  <Button variant="ghost" size="icon" onClick={clearSelectedFile} className="h-6 w-6" title="Remove image">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
            {uploadError && <p className="text-xs text-destructive mt-1">{uploadError}</p>}
          </div>

          {/* Description */}
          <div className="grid gap-2">
            <Label htmlFor="description">Description / Specifications</Label>
            <Textarea
              id="description"
              placeholder="Enter asset description or specs (e.g., CPU, RAM, Storage)..."
              value={newAsset.description || ''}
              onChange={(e) => handleChange('description', e.target.value)}
              className="min-h-[80px]"
            />
          </div>

        </div>

        {/* ChecklistSection removed based on schema analysis */}

        <DialogFooter>
          <Button variant="outline" onClick={handleCloseAndReset}>Cancel</Button>
          <Button onClick={handleAddAsset} disabled={isUploading}>
            {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Add Asset
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddAssetModal; 