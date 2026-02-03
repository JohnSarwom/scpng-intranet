import React, { useState, useEffect, useMemo } from 'react';
import PageLayout from '@/components/layout/PageLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Loader2, Plus, Edit, Trash2, List, LayoutGrid, Search, Download,
  RotateCcw, Rows, MoreVertical, Info, ArrowUpDown, ArrowUp, ArrowDown
} from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { logger } from '@/lib/supabaseClient'; // Keep logger if used elsewhere
import { supabase } from '@/lib/supabaseClient'; // Add import for supabase client
import { useAssetsData } from '@/hooks/useSupabaseData';
import { useAssetsSharePoint } from '@/hooks/useAssetsSharePoint';
import { Asset } from '@/services/assetsSharePointService';
import { useMsal } from '@azure/msal-react'; // <--- Import useMsal from msal-react
import { InteractionStatus } from '@azure/msal-browser'; // Import InteractionStatus if needed for loading
import { UserAsset } from '@/types';
import { divisions } from '@/data/divisions'; // Import divisions data
import { units } from '@/data/units'; // Import units data
import { useStaffMembers } from '@/hooks/useStaffMembers'; // Import staff members hook
import { formatDate } from '@/lib/utils'; // Import formatDate from utils
import { cn } from '@/lib/utils'; // Import cn utility

// Import modal components
import AddAssetModal from '@/components/unit-tabs/modals/AddAssetModal';
import EditAssetModal from '@/components/unit-tabs/modals/EditAssetModal';
import DeleteModal from '@/components/unit-tabs/modals/DeleteModal';
import AssetCard from '@/components/assets/AssetCard';
import HighlightMatch from '@/components/ui/HighlightMatch';
import AssetInfoModal from '@/components/assets/AssetInfoModal';
import { TooltipWrapper } from '@/components/ui/tooltip-wrapper';

// --- Add dropdown components ---
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
// --- End dropdown components ---

// --- Pagination Component (Optional, but good practice) ---
// import PaginationControls from '@/components/ui/PaginationControls'; // Removed import as component doesn't exist yet
// --- End Pagination Component ---

const ITEMS_PER_PAGE = 15; // Define items per page constant

interface AssetManagementProps {
  skipPageLayout?: boolean;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

const AssetManagement: React.FC<AssetManagementProps> = ({
  skipPageLayout = false,
  isFullscreen = false,
  onToggleFullscreen
}) => {
  const { instance, accounts, inProgress } = useMsal(); // <-- Use MSAL hook
  const account = useMemo(() => accounts[0], [accounts]); // Get the first (active) account
  const authLoading = useMemo(() => inProgress !== InteractionStatus.None, [inProgress]); // Determine loading state

  const { toast } = useToast();
  // Feature flag for SharePoint migration
  const USE_SHAREPOINT_ASSETS = import.meta.env.VITE_USE_SHAREPOINT_ASSETS === 'true';

  // Use SharePoint hook
  const sharePointHook = useAssetsSharePoint();

  // Use Supabase hook
  const supabaseHook = useAssetsData();

  // Select the active hook based on feature flag
  const {
    assets,
    loading: assetsLoading,
    error: assetsError,
    add: addAsset,
    update: editAsset,
    remove: deleteAsset,
    refresh: refreshAssets,
  } = USE_SHAREPOINT_ASSETS ? sharePointHook : {
    assets: supabaseHook.data,
    loading: supabaseHook.loading,
    error: supabaseHook.error,
    add: supabaseHook.add,
    update: supabaseHook.update,
    remove: supabaseHook.remove,
    refresh: supabaseHook.refresh,
  };

  // Use the staff members hook to get data from database
  // NOTE: This now uses the online 'staff_members' table instead of static data
  const {
    staffMembers,
    loading: staffLoading,
    error: staffError,
    refreshStaffMembers
  } = useStaffMembers();

  // State for managing modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<UserAsset | null>(null);

  // --- State for Info Modals ---
  const [selectedAssetForInfo, setSelectedAssetForInfo] = useState<UserAsset | null>(null); // Renamed from infoModalAsset
  const [isQuickInfoModalOpen, setIsQuickInfoModalOpen] = useState(false);

  const [viewMode, setViewMode] = useState<'table' | 'card' | 'detailed-list'>('table');
  const [filterText, setFilterText] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterCondition, setFilterCondition] = useState('all');
  const [filterUnit, setFilterUnit] = useState('all');
  const [filterDivision, setFilterDivision] = useState('all');
  const [filterVendor, setFilterVendor] = useState('all');

  // --- Pagination State ---
  const [currentPage, setCurrentPage] = useState(1);
  // --- End Pagination State ---

  // --- Sorting State ---
  const [sortColumn, setSortColumn] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  // --- End Sorting State ---

  // --- Derive unique lists for modal suggestions --- 
  const existingNames = useMemo(() =>
    Array.from(new Set(assets.map(a => a.name).filter(Boolean) as string[])).sort(),
    [assets]
  );
  const existingTypes = useMemo(() =>
    Array.from(new Set(assets.map(a => a.type).filter(Boolean) as string[])).sort(),
    [assets]
  );
  const existingVendors = useMemo(() =>
    Array.from(new Set(assets.map(a => a.vendor).filter(Boolean) as string[])).sort(),
    [assets]
  );

  // --- Derive user name for filtering directly from MSAL account ---
  // This is now mainly used for display or potentially for the 'add' action
  const userNameForFiltering = useMemo(() => account?.name || null, [account]);

  // Log the user object and the raw assets array from the hook
  // console.log('[AssetManagement] MSAL Account object:', account);
  // console.log('[AssetManagement] User Name (for display/add):', userNameForFiltering);
  // console.log('[AssetManagement] Assets array (already filtered by hook):', assets);
  // console.log('[AssetManagement] Staff Members from database (online):', staffMembers, 'Loading:', staffLoading, 'Error:', staffError);

  // --- Filtering Logic (Client-side) --- 
  // [Cursor] Updated filtering logic to include all filters
  const filteredAssets = useMemo(() => {
    return assets.filter(asset => {
      const searchTerm = filterText.toLowerCase();

      // Text search check
      const textMatch = !searchTerm || (
        (asset.name && asset.name.toLowerCase().includes(searchTerm)) ||
        (asset.id && asset.id.toLowerCase().includes(searchTerm)) ||
        (asset.type && asset.type.toLowerCase().includes(searchTerm)) ||
        (asset.condition && asset.condition.toLowerCase().includes(searchTerm)) ||
        (asset.vendor && asset.vendor.toLowerCase().includes(searchTerm)) ||
        (asset.unit && asset.unit.toLowerCase().includes(searchTerm)) ||
        (asset.division && asset.division.toLowerCase().includes(searchTerm)) ||
        (asset.assigned_to && asset.assigned_to.toLowerCase().includes(searchTerm)) ||
        (asset.notes && asset.notes.toLowerCase().includes(searchTerm)) ||
        (asset.description && asset.description.toLowerCase().includes(searchTerm))
      );

      // Dropdown filter checks
      const typeMatch = filterType === 'all' || (asset.type && asset.type === filterType);
      const conditionMatch = filterCondition === 'all' || (asset.condition && asset.condition === filterCondition);
      const unitMatch = filterUnit === 'all' || (asset.unit && asset.unit === filterUnit);
      const divisionMatch = filterDivision === 'all' || (asset.division && asset.division === filterDivision);
      const vendorMatch = filterVendor === 'all' || (asset.vendor && asset.vendor === filterVendor);

      return textMatch && typeMatch && conditionMatch && unitMatch && divisionMatch && vendorMatch;
    });
  }, [assets, filterText, filterType, filterCondition, filterUnit, filterDivision, filterVendor]); // [Cursor] Update dependencies

  // console.log(`[AssetManagement] Filters: Text="${filterText}", Type="${filterType}", Condition="${filterCondition}", Unit="${filterUnit}", Division="${filterDivision}", Vendor="${filterVendor}"`);
  // console.log('[AssetManagement] Assets array AFTER filtering:', filteredAssets);
  // --- End Filtering Logic ---

  // --- Sort Assets Function ---
  const sortedAssets = useMemo(() => {
    const sorted = [...filteredAssets].sort((a, b) => {
      const aValue = a[sortColumn as keyof UserAsset] || '';
      const bValue = b[sortColumn as keyof UserAsset] || '';

      // Handle different data types
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }

      // For dates or other types, convert to string and compare
      const aStr = String(aValue);
      const bStr = String(bValue);
      return sortDirection === 'asc'
        ? aStr.localeCompare(bStr)
        : bStr.localeCompare(aStr);
    });

    return sorted;
  }, [filteredAssets, sortColumn, sortDirection]);

  // --- Sort Indicator Component ---
  const SortIndicator = ({ column }: { column: string }) => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="h-3 w-3 ml-1 text-gray-400" />;
    }
    return sortDirection === 'asc'
      ? <ArrowUp className="h-3 w-3 ml-1 text-blue-500" />
      : <ArrowDown className="h-3 w-3 ml-1 text-blue-500" />;
  };

  // --- Pagination Logic ---
  const totalPages = useMemo(() => {
    return Math.ceil(sortedAssets.length / ITEMS_PER_PAGE);
  }, [sortedAssets]);

  const paginatedAssets = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return sortedAssets.slice(startIndex, endIndex);
  }, [sortedAssets, currentPage]);

  // Reset to page 1 when filters, sort, or source data change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterText, filterType, filterCondition, filterUnit, filterDivision, filterVendor, sortColumn, sortDirection, assets]); // Reset on filter, sort, or data change
  // --- End Pagination Logic ---

  // --- Email for filtering (derive from MSAL account) ---
  // Ensure 'account.username' holds the email address
  const loggedInUserEmail = useMemo(() => account?.username || null, [account]);
  // --- End Email for filtering ---

  // --- Modal Handlers ---

  const handleAddClick = () => {
    setIsAddModalOpen(true);
  };

  const handleEditClick = (asset: UserAsset) => {
    // console.log('Edit clicked for asset:', asset.name);
    setSelectedAsset(asset);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (asset: UserAsset) => {
    // console.log('Delete clicked for asset:', asset.name);
    setSelectedAsset(asset);
    setIsDeleteModalOpen(true);
  };

  const handleCloseModals = () => {
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    setIsDeleteModalOpen(false);
    setSelectedAsset(null);
    // --- Close both info modals and clear selected asset ---
    setSelectedAssetForInfo(null);
    setIsQuickInfoModalOpen(false);
    // --- End closing info modals ---
  };

  // [Cursor] Handler to open the QUICK info modal
  const handleInfoClick = (asset: UserAsset) => {
    // console.log('Info clicked for asset:', asset.name);
    setSelectedAssetForInfo(asset);
    setIsQuickInfoModalOpen(true);
  };

  // [Cursor] Handler to reset all filters
  const handleResetFilters = () => {
    setFilterText('');
    setFilterType('all');
    setFilterCondition('all');
    setFilterUnit('all');
    setFilterDivision('all');
    setFilterVendor('all');
    // Reset sorting as well
    setSortColumn('name');
    setSortDirection('asc');
  };

  // Handler to refresh staff members from database
  const handleRefreshStaffMembers = async () => {
    try {
      await refreshStaffMembers();
      toast({ title: "Success", description: "Staff members refreshed successfully." });
    } catch (error) {
      console.error('Error refreshing staff members:', error);
      toast({ title: "Error", description: "Failed to refresh staff members.", variant: "destructive" });
    }
  };

  // --- Sorting Handler ---
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };



  // --- Data Operation Handlers ---

  const handleSaveAdd = async (newAssetData: Partial<Omit<UserAsset, 'id' | 'created_at' | 'last_updated'>>) => {
    const today = new Date().toISOString().split('T')[0];

    // Use assignee details from modal if provided, otherwise default (though validation should prevent this)
    const completeAssetData = {
      ...newAssetData,
      assigned_to: newAssetData.assigned_to || userNameForFiltering, // Use name from modal
      assigned_to_email: newAssetData.assigned_to_email || loggedInUserEmail, // Use email from modal
      assigned_date: newAssetData.assigned_date || today, // Keep defaulting assigned_date
    } as Omit<UserAsset, 'id' | 'created_at' | 'last_updated'>;

    // Validation should now happen inside the modal, but keep a basic check here
    if (!completeAssetData.name || !completeAssetData.assigned_to) {
      toast({ title: "Error", description: "Asset name and Assigned To are required.", variant: "destructive" });
      return;
    }
    // Removed redundant check for assigned_to determination

    // --- Exclude 'specifications' before sending to Supabase ---
    const { specifications, ...dataToSend } = completeAssetData;
    // --- End exclusion ---

    try {
      // Pass the object without 'specifications'
      await addAsset(dataToSend as unknown as Asset);
      toast({ title: "Asset Added", description: "New asset has been added successfully." });
      handleCloseModals();
    } catch (err) {
      logger.error("Error adding asset:", err);
      toast({ title: "Error Adding Asset", description: err instanceof Error ? err.message : "Could not add asset.", variant: "destructive" });
    }
  };

  const handleSaveEdit = async (updatedAssetData: Partial<UserAsset>) => {
    if (!selectedAsset) return;
    try {
      const dataToSave = loggedInUserEmail ? { ...updatedAssetData, last_updated_by: loggedInUserEmail } : updatedAssetData;
      await editAsset(selectedAsset.id, dataToSave);
      toast({ title: "Asset Updated", description: "Asset details have been updated." });
      handleCloseModals();
    } catch (err) {
      logger.error("Error updating asset:", err);
      toast({ title: "Error Updating Asset", description: err instanceof Error ? err.message : "Could not update asset.", variant: "destructive" });
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedAsset) return;
    try {
      await deleteAsset(selectedAsset.id);
      toast({ title: "Asset Deleted", description: "Asset has been removed successfully." });
      handleCloseModals();
    } catch (err) {
      logger.error("Error deleting asset:", err);
      toast({ title: "Error Deleting Asset", description: err instanceof Error ? err.message : "Could not delete asset.", variant: "destructive" });
    }
  };

  // Use authLoading derived from useMsal
  if (authLoading) {
    const loadingContent = (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Initializing Authentication...</span>
      </div>
    );
    return skipPageLayout ? loadingContent : <PageLayout>{loadingContent}</PageLayout>;
  }

  // Show loading state while staff data is being fetched
  if (staffLoading) {
    const loadingContent = (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading staff members...</span>
      </div>
    );
    return skipPageLayout ? loadingContent : <PageLayout>{loadingContent}</PageLayout>;
  }

  // Handle staff loading error (but don't block the UI, just show a warning)
  if (staffError) {
    console.warn('Staff loading error:', staffError);
    // Optionally show a toast notification
    // toast({ title: "Warning", description: "Failed to load staff members from database. Using fallback data.", variant: "destructive" });
  }

  // Handle case where MSAL account is not available after loading
  if (!authLoading && !account) {
    const errorContent = (
      <div className="text-center py-10 px-4 text-destructive">
        <p>User not authenticated. Please log in.</p>
        {/* Optionally add a login button here */}
      </div>
    );
    return skipPageLayout ? errorContent : <PageLayout>{errorContent}</PageLayout>;
  }

  // --- If user is authenticated but no email, show error (or handle differently) ---
  if (!authLoading && !loggedInUserEmail) {
    const errorContent = (
      <div className="text-center py-10 px-4 text-destructive">
        <p>Could not determine your user email. Please ensure your profile is complete or contact support.</p>
      </div>
    );
    return skipPageLayout ? errorContent : <PageLayout>{errorContent}</PageLayout>;
  }
  // --- End User Email Check ---

  const mainContent = (
    <div className="space-y-6">
      {/* Header and Actions - Search on left, buttons on right */}
      <div className="flex justify-between items-center gap-4"> {/* Updated classes */}
        {/* Search Input - Moved here */}
        <div className="relative w-full max-w-sm"> {/* Adjusted width */}
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Filter by name, type, vendor..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="pl-8 w-full"
          />
        </div>
        {/* Action Buttons Container */}
        <div className="flex items-center gap-2 flex-shrink-0"> {/* Added flex-shrink-0 */}
          {/* View Mode Toggle */}
          <TooltipWrapper content="Switch between different view modes">
            <ToggleGroup
              type="single"
              value={viewMode}
              onValueChange={(value) => value && setViewMode(value as 'table' | 'card' | 'detailed-list')}
              aria-label="View mode"
              className="border rounded-md p-0.5"
            >
              <TooltipWrapper content="Table view - Display assets in a detailed table format">
                <ToggleGroupItem value="table" aria-label="Table view" className="px-2 py-1 h-auto data-[state=on]:bg-intranet-primary data-[state=on]:text-primary-foreground">
                  <List className="h-4 w-4" />
                </ToggleGroupItem>
              </TooltipWrapper>
              <TooltipWrapper content="Card view - Display assets as individual cards">
                <ToggleGroupItem value="card" aria-label="Card view" className="px-2 py-1 h-auto data-[state=on]:bg-intranet-primary data-[state=on]:text-primary-foreground">
                  <LayoutGrid className="h-4 w-4" />
                </ToggleGroupItem>
              </TooltipWrapper>
              <TooltipWrapper content="Detailed list view - Show all asset information in an expanded format">
                <ToggleGroupItem value="detailed-list" aria-label="Detailed list view" className="px-2 py-1 h-auto data-[state=on]:bg-intranet-primary data-[state=on]:text-primary-foreground">
                  <Rows className="h-4 w-4" />
                </ToggleGroupItem>
              </TooltipWrapper>
            </ToggleGroup>
          </TooltipWrapper>
          {/* Add Asset Button */}
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <TooltipWrapper content="Add a new asset to the system">
                <Button onClick={handleAddClick}>
                  <Plus className="mr-2 h-4 w-4" /> Add Asset
                </Button>
              </TooltipWrapper>
            </DialogTrigger>
            {isAddModalOpen && (
              <AddAssetModal
                isOpen={isAddModalOpen}
                onClose={handleCloseModals}
                onAdd={handleSaveAdd}
                divisions={divisions}
                units={units}
                staffMembers={staffMembers}
                existingNames={existingNames}
                existingTypes={existingTypes}
                existingVendors={existingVendors}
              />
            )}
          </Dialog>
          {/* More Options Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <TooltipWrapper content="More options - Export data and additional actions">
                <Button variant="outline" size="icon" className="h-9 w-9">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </TooltipWrapper>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </DropdownMenuItem>
              {/* Add more options here if needed */}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Filters Section - Improved Responsiveness (Search bar removed from here) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 items-center"> {/* Adjusted grid columns */}
        {/* Filter Selects - Each takes one column */}
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {[...new Set(assets.map(a => a.type).filter(Boolean))].sort().map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterCondition} onValueChange={setFilterCondition}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="All Conditions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Conditions</SelectItem>
            {[...new Set(assets.map(a => a.condition).filter(Boolean))].sort().map(cond => <SelectItem key={cond} value={cond}>{cond}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterUnit} onValueChange={setFilterUnit}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="All Units" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Units</SelectItem>
            {[...new Set(assets.map(a => a.unit).filter(Boolean))].sort().map(unit => <SelectItem key={unit} value={unit}>{unit}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterDivision} onValueChange={setFilterDivision}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="All Divisions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Divisions</SelectItem>
            {[...new Set(assets.map(a => a.division).filter(Boolean))].sort().map(div => <SelectItem key={div} value={div}>{div}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterVendor} onValueChange={setFilterVendor}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="All Vendors" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Vendors</SelectItem>
            {[...new Set(assets.map(a => a.vendor).filter(Boolean))].sort().map(vendor => <SelectItem key={vendor} value={vendor}>{vendor}</SelectItem>)}
          </SelectContent>
        </Select>

        {/* Reset Button - Positioned at the end */}
        <TooltipWrapper content="Reset all filters and sorting to default values">
          <Button
            variant="ghost"
            onClick={handleResetFilters}
            className="flex items-center gap-1 text-muted-foreground hover:text-foreground justify-self-start xl:justify-self-end"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
        </TooltipWrapper>
      </div>

      {/* Main Content Area */}
      <Card>
        <CardContent className="p-0 relative h-[70vh]"> {/* Removed overflow-auto from here */}
          <div className="overflow-auto h-full"> {/* Added scroll container */}
            {assetsLoading && (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Loading assets...</span>
              </div>
            )}
            {assetsError && (
              <div className="text-center py-10 px-4 text-destructive flex items-center justify-center h-full">
                <p>Error loading assets: {assetsError.message}</p>
              </div>
            )}
            {!assetsLoading && !assetsError && (
              <>
                {/* Table View - Enhanced with sticky headers and comprehensive tooltips */}
                {viewMode === 'table' && (
                  <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-400 sticky top-0 z-20 shadow-md">
                      <tr>
                        <th scope="col" className="px-4 py-3 bg-gray-100 dark:bg-gray-700 w-[60px] border-r border-gray-200 dark:border-gray-600">
                          <TooltipWrapper content="Asset image - Click asset row to view full details">
                            <div className="flex items-center justify-center">
                              <span>Img</span>
                            </div>
                          </TooltipWrapper>
                        </th>
                        <th scope="col" className="px-4 py-3 bg-gray-100 dark:bg-gray-700 min-w-[200px] border-r border-gray-200 dark:border-gray-600 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors" onClick={() => handleSort('name')}>
                          <TooltipWrapper content="Asset name - Click to sort alphabetically">
                            <div className="flex items-center">
                              <span>Name</span>
                              <SortIndicator column="name" />
                            </div>
                          </TooltipWrapper>
                        </th>
                        <th scope="col" className="px-4 py-3 bg-gray-100 dark:bg-gray-700 w-[50px] border-r border-gray-200 dark:border-gray-600 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors" onClick={() => handleSort('id')}>
                          <TooltipWrapper content="Unique asset identifier - Click to sort by ID">
                            <div className="flex items-center">
                              <span>ID</span>
                              <SortIndicator column="id" />
                            </div>
                          </TooltipWrapper>
                        </th>
                        <th scope="col" className="px-4 py-3 bg-gray-100 dark:bg-gray-700 min-w-[150px] border-r border-gray-200 dark:border-gray-600 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors" onClick={() => handleSort('type')}>
                          <TooltipWrapper content="Asset category/type - Click to sort by type">
                            <div className="flex items-center">
                              <span>Type</span>
                              <SortIndicator column="type" />
                            </div>
                          </TooltipWrapper>
                        </th>
                        <th scope="col" className="px-4 py-3 bg-gray-100 dark:bg-gray-700 min-w-[100px] border-r border-gray-200 dark:border-gray-600 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors" onClick={() => handleSort('condition')}>
                          <TooltipWrapper content="Current asset condition - Click to sort by condition">
                            <div className="flex items-center">
                              <span>Condition</span>
                              <SortIndicator column="condition" />
                            </div>
                          </TooltipWrapper>
                        </th>
                        <th scope="col" className="px-4 py-3 bg-gray-100 dark:bg-gray-700 min-w-[150px] border-r border-gray-200 dark:border-gray-600 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors" onClick={() => handleSort('assigned_to')}>
                          <TooltipWrapper content="Person currently assigned this asset - Click to sort by assignee">
                            <div className="flex items-center">
                              <span>Assigned To</span>
                              <SortIndicator column="assigned_to" />
                            </div>
                          </TooltipWrapper>
                        </th>
                        <th scope="col" className="px-4 py-3 bg-gray-100 dark:bg-gray-700 min-w-[200px] border-r border-gray-200 dark:border-gray-600 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors" onClick={() => handleSort('assigned_to_email')}>
                          <TooltipWrapper content="Email of assigned person - Click to sort by email">
                            <div className="flex items-center">
                              <span>Email</span>
                              <SortIndicator column="assigned_to_email" />
                            </div>
                          </TooltipWrapper>
                        </th>
                        <th scope="col" className="px-4 py-3 bg-gray-100 dark:bg-gray-700 min-w-[150px] border-r border-gray-200 dark:border-gray-600 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors" onClick={() => handleSort('unit')}>
                          <TooltipWrapper content="Organizational unit - Click to sort by unit">
                            <div className="flex items-center">
                              <span>Unit</span>
                              <SortIndicator column="unit" />
                            </div>
                          </TooltipWrapper>
                        </th>
                        <th scope="col" className="px-4 py-3 bg-gray-100 dark:bg-gray-700 min-w-[200px] border-r border-gray-200 dark:border-gray-600 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors" onClick={() => handleSort('division')}>
                          <TooltipWrapper content="Division within organization - Click to sort by division">
                            <div className="flex items-center">
                              <span>Division</span>
                              <SortIndicator column="division" />
                            </div>
                          </TooltipWrapper>
                        </th>
                        <th scope="col" className="px-4 py-3 bg-gray-100 dark:bg-gray-700 min-w-[200px] border-r border-gray-200 dark:border-gray-600 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors" onClick={() => handleSort('description')}>
                          <TooltipWrapper content="Asset description - Click to sort by description">
                            <div className="flex items-center">
                              <span>Description</span>
                              <SortIndicator column="description" />
                            </div>
                          </TooltipWrapper>
                        </th>
                        <th scope="col" className="px-4 py-3 bg-gray-100 dark:bg-gray-700 min-w-[150px] border-r border-gray-200 dark:border-gray-600 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors" onClick={() => handleSort('assigned_date')}>
                          <TooltipWrapper content="Date asset was assigned - Click to sort by assigned date">
                            <div className="flex items-center">
                              <span>Assigned Date</span>
                              <SortIndicator column="assigned_date" />
                            </div>
                          </TooltipWrapper>
                        </th>
                        <th scope="col" className="px-4 py-3 bg-gray-100 dark:bg-gray-700 min-w-[150px] border-r border-gray-200 dark:border-gray-600 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors" onClick={() => handleSort('purchase_date')}>
                          <TooltipWrapper content="Date asset was purchased - Click to sort by purchase date">
                            <div className="flex items-center">
                              <span>Purchased Date</span>
                              <SortIndicator column="purchase_date" />
                            </div>
                          </TooltipWrapper>
                        </th>
                        <th scope="col" className="px-4 py-3 bg-gray-100 dark:bg-gray-700 min-w-[150px] border-r border-gray-200 dark:border-gray-600 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors" onClick={() => handleSort('last_updated')}>
                          <TooltipWrapper content="Last modification date - Click to sort by last updated">
                            <div className="flex items-center">
                              <span>Last Updated</span>
                              <SortIndicator column="last_updated" />
                            </div>
                          </TooltipWrapper>
                        </th>
                        <th scope="col" className="sticky right-0 px-4 py-3 bg-gray-100 dark:bg-gray-700 w-[100px] text-right z-30 shadow-lg">
                          <TooltipWrapper content="Available actions for this asset">
                            <div className="flex items-center justify-end">
                              <span>Actions</span>
                            </div>
                          </TooltipWrapper>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedAssets.length > 0 ? (
                        paginatedAssets.map(asset => (
                          <tr key={asset.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                            {/* Image Cell */}
                            <td className="px-4 py-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" onClick={() => handleInfoClick(asset)}>
                              <TooltipWrapper content={`${asset.name || 'Unknown Asset'} - Click to view full details`}>
                                <Avatar className="h-9 w-9">
                                  <AvatarImage src={asset.image_url || undefined} alt={asset.name} />
                                  <AvatarFallback>{asset.name?.charAt(0).toUpperCase()}</AvatarFallback>
                                </Avatar>
                              </TooltipWrapper>
                            </td>
                            {/* Name Cell */}
                            <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap dark:text-white cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" onClick={() => handleInfoClick(asset)}>
                              <TooltipWrapper content={`Asset: ${asset.name || 'N/A'} - Click to view full details`}>
                                <HighlightMatch text={asset.name || 'N/A'} searchTerm={filterText} />
                              </TooltipWrapper>
                            </td>
                            {/* ID Cell */}
                            <td className="px-4 py-3">
                              <TooltipWrapper content={`Asset ID: ${asset.id || 'N/A'}`}>
                                <HighlightMatch text={asset.id || 'N/A'} searchTerm={filterText} />
                              </TooltipWrapper>
                            </td>
                            {/* Type Cell */}
                            <td className="px-4 py-3">
                              <TooltipWrapper content={`Asset Type: ${asset.type || 'N/A'}`}>
                                <HighlightMatch text={asset.type || 'N/A'} searchTerm={filterText} />
                              </TooltipWrapper>
                            </td>
                            {/* Condition Cell */}
                            <td className="px-4 py-3">
                              <TooltipWrapper content={`Current Condition: ${asset.condition || 'N/A'}`}>
                                <span className={cn(
                                  "px-2 py-1 rounded-full text-xs font-medium",
                                  asset.condition === 'Good' ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' :
                                    asset.condition === 'Fair' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100' :
                                      asset.condition === 'Poor' ? 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100' :
                                        'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100'
                                )}>
                                  <HighlightMatch text={asset.condition || 'N/A'} searchTerm={filterText} />
                                </span>
                              </TooltipWrapper>
                            </td>
                            {/* Assigned To Cell */}
                            <td className="px-4 py-3">
                              <TooltipWrapper content={`Assigned To: ${asset.assigned_to || 'N/A'}`}>
                                <HighlightMatch text={asset.assigned_to || 'N/A'} searchTerm={filterText} />
                              </TooltipWrapper>
                            </td>
                            {/* Email Cell */}
                            <td className="px-4 py-3">
                              <TooltipWrapper content={`Email: ${asset.assigned_to_email || 'N/A'}`}>
                                <HighlightMatch text={asset.assigned_to_email || 'N/A'} searchTerm={filterText} />
                              </TooltipWrapper>
                            </td>
                            {/* Unit Cell */}
                            <td className="px-4 py-3">
                              <TooltipWrapper content={`Unit: ${asset.unit || 'N/A'}`}>
                                <HighlightMatch text={asset.unit || 'N/A'} searchTerm={filterText} />
                              </TooltipWrapper>
                            </td>
                            {/* Division Cell */}
                            <td className="px-4 py-3">
                              <TooltipWrapper content={`Division: ${asset.division || 'N/A'}`}>
                                <HighlightMatch text={asset.division || 'N/A'} searchTerm={filterText} />
                              </TooltipWrapper>
                            </td>
                            {/* Description Cell */}
                            <td className="px-4 py-3 max-w-xs truncate">
                              <TooltipWrapper content={`Description: ${asset.description || 'No description available'}`}>
                                <HighlightMatch text={asset.description || 'N/A'} searchTerm={filterText} />
                              </TooltipWrapper>
                            </td>
                            {/* Assigned Date Cell */}
                            <td className="px-4 py-3">
                              <TooltipWrapper content={`Assigned Date: ${formatDate(asset.assigned_date) || 'N/A'}`}>
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                  {formatDate(asset.assigned_date) || 'N/A'}
                                </span>
                              </TooltipWrapper>
                            </td>
                            {/* Purchase Date Cell */}
                            <td className="px-4 py-3">
                              <TooltipWrapper content={`Purchase Date: ${formatDate(asset.purchase_date) || 'N/A'}`}>
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                  {formatDate(asset.purchase_date) || 'N/A'}
                                </span>
                              </TooltipWrapper>
                            </td>
                            {/* Last Updated Cell */}
                            <td className="px-4 py-3">
                              <TooltipWrapper content={`Last Updated: ${formatDate(asset.last_updated) || 'N/A'}`}>
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                  {formatDate(asset.last_updated) || 'N/A'}
                                </span>
                              </TooltipWrapper>
                            </td>
                            {/* Actions Cell - sticky right */}
                            <td className="sticky right-0 px-4 py-3 bg-white dark:bg-gray-800 text-right z-20 shadow-lg"> {/* Enhanced background and shadow */}
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700">
                                    <span className="sr-only">Open menu</span>
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="z-50">
                                  <DropdownMenuItem onClick={() => handleInfoClick(asset)}>
                                    <Info className="mr-2 h-4 w-4" />
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleEditClick(asset)}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleDeleteClick(asset)} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={14} className="h-24 text-center text-gray-500 dark:text-gray-400"> {/* Adjusted colSpan */}
                            {filterText || filterType !== 'all' || filterCondition !== 'all' || filterUnit !== 'all' || filterDivision !== 'all' || filterVendor !== 'all'
                              ? `No assets found matching the current filters.`
                              : "No assets were found."}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                )}
                {/* End Table View */}

                {/* Card View */}
                {viewMode === 'card' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4"> {/* Keep padding for card view */}
                    {paginatedAssets.length > 0 ? (
                      paginatedAssets.map(asset => (
                        <AssetCard
                          key={asset.id}
                          asset={asset}
                          onClick={() => handleInfoClick(asset)}
                          onEdit={() => handleEditClick(asset)}
                          onDelete={() => handleDeleteClick(asset)}
                        />
                      ))
                    ) : (
                      <div className="col-span-full text-center py-10 px-4 text-muted-foreground">
                        {filterText || filterType !== 'all' || filterCondition !== 'all' || filterUnit !== 'all' || filterDivision !== 'all' || filterVendor !== 'all'
                          ? `No assets found matching the current filters.`
                          : "No assets were found."}
                      </div>
                    )}
                  </div>
                )}
                {/* End Card View */}

                {/* Detailed List View - Enhanced with sticky headers and comprehensive tooltips */}
                {viewMode === 'detailed-list' && (
                  <table className="w-full text-xs text-left text-gray-500 dark:text-gray-400 min-w-max">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-400 sticky top-0 z-20 shadow-md">
                      <tr>
                        <th scope="col" className="sticky left-0 bg-gray-100 dark:bg-gray-700 z-10 w-[50px] h-auto py-2 px-2 border-r border-gray-200 dark:border-gray-600">
                          <TooltipWrapper content="Asset image - Click asset row to view full details">
                            <div className="flex items-center justify-center">
                              <span>Img</span>
                            </div>
                          </TooltipWrapper>
                        </th>
                        <th scope="col" className="sticky left-[50px] bg-gray-100 dark:bg-gray-700 z-10 min-w-[150px] h-auto py-2 px-2 border-r border-gray-200 dark:border-gray-600 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors" onClick={() => handleSort('name')}>
                          <TooltipWrapper content="Asset name - Click to sort alphabetically">
                            <div className="flex items-center">
                              <span>Name</span>
                              <SortIndicator column="name" />
                            </div>
                          </TooltipWrapper>
                        </th>
                        <TableHead className="sticky top-0 h-auto py-2 px-2 bg-background border-r border-border cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleSort('id')}>
                          <TooltipWrapper content="Unique asset identifier - Click to sort by ID">
                            <div className="flex items-center">
                              <span>ID</span>
                              <SortIndicator column="id" />
                            </div>
                          </TooltipWrapper>
                        </TableHead>
                        <TableHead className="sticky top-0 h-auto py-2 px-2 bg-background border-r border-border cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleSort('type')}>
                          <TooltipWrapper content="Asset category/type - Click to sort by type">
                            <div className="flex items-center">
                              <span>Type</span>
                              <SortIndicator column="type" />
                            </div>
                          </TooltipWrapper>
                        </TableHead>
                        <TableHead className="sticky top-0 h-auto py-2 px-2 bg-background border-r border-border cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleSort('brand')}>
                          <TooltipWrapper content="Asset brand/manufacturer - Click to sort by brand">
                            <div className="flex items-center">
                              <span>Brand</span>
                              <SortIndicator column="brand" />
                            </div>
                          </TooltipWrapper>
                        </TableHead>
                        <TableHead className="sticky top-0 h-auto py-2 px-2 bg-background border-r border-border cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleSort('model')}>
                          <TooltipWrapper content="Asset model - Click to sort by model">
                            <div className="flex items-center">
                              <span>Model</span>
                              <SortIndicator column="model" />
                            </div>
                          </TooltipWrapper>
                        </TableHead>
                        <TableHead className="sticky top-0 h-auto py-2 px-2 bg-background border-r border-border cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleSort('serial_number')}>
                          <TooltipWrapper content="Asset serial number - Click to sort by serial number">
                            <div className="flex items-center">
                              <span>Serial Number</span>
                              <SortIndicator column="serial_number" />
                            </div>
                          </TooltipWrapper>
                        </TableHead>
                        <TableHead className="sticky top-0 h-auto py-2 px-2 bg-background border-r border-border cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleSort('asset_id')}>
                          <TooltipWrapper content="Asset ID - Click to sort by asset ID">
                            <div className="flex items-center">
                              <span>Asset ID</span>
                              <SortIndicator column="asset_id" />
                            </div>
                          </TooltipWrapper>
                        </TableHead>
                        <TableHead className="sticky top-0 h-auto py-2 px-2 bg-background border-r border-border cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleSort('condition')}>
                          <TooltipWrapper content="Current asset condition - Click to sort by condition">
                            <div className="flex items-center">
                              <span>Condition</span>
                              <SortIndicator column="condition" />
                            </div>
                          </TooltipWrapper>
                        </TableHead>
                        <TableHead className="sticky top-0 h-auto py-2 px-2 bg-background border-r border-border cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleSort('assigned_to')}>
                          <TooltipWrapper content="Person currently assigned this asset - Click to sort by assignee">
                            <div className="flex items-center">
                              <span>Assigned To</span>
                              <SortIndicator column="assigned_to" />
                            </div>
                          </TooltipWrapper>
                        </TableHead>
                        <TableHead className="sticky top-0 h-auto py-2 px-2 bg-background border-r border-border cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleSort('assigned_to_email')}>
                          <TooltipWrapper content="Email of assigned person - Click to sort by email">
                            <div className="flex items-center">
                              <span>Email</span>
                              <SortIndicator column="assigned_to_email" />
                            </div>
                          </TooltipWrapper>
                        </TableHead>
                        <TableHead className="sticky top-0 h-auto py-2 px-2 bg-background border-r border-border cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleSort('unit')}>
                          <TooltipWrapper content="Organizational unit - Click to sort by unit">
                            <div className="flex items-center">
                              <span>Unit</span>
                              <SortIndicator column="unit" />
                            </div>
                          </TooltipWrapper>
                        </TableHead>
                        <TableHead className="sticky top-0 h-auto py-2 px-2 bg-background border-r border-border cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleSort('division')}>
                          <TooltipWrapper content="Division within organization - Click to sort by division">
                            <div className="flex items-center">
                              <span>Division</span>
                              <SortIndicator column="division" />
                            </div>
                          </TooltipWrapper>
                        </TableHead>
                        <TableHead className="sticky top-0 h-auto py-2 px-2 bg-background border-r border-border cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleSort('description')}>
                          <TooltipWrapper content="Asset description - Click to sort by description">
                            <div className="flex items-center">
                              <span>Description</span>
                              <SortIndicator column="description" />
                            </div>
                          </TooltipWrapper>
                        </TableHead>
                        <TableHead className="sticky top-0 h-auto py-2 px-2 bg-background border-r border-border cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleSort('assigned_date')}>
                          <TooltipWrapper content="Date asset was assigned - Click to sort by assigned date">
                            <div className="flex items-center">
                              <span>Assigned Date</span>
                              <SortIndicator column="assigned_date" />
                            </div>
                          </TooltipWrapper>
                        </TableHead>
                        <TableHead className="sticky top-0 h-auto py-2 px-2 bg-background border-r border-border cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleSort('purchase_date')}>
                          <TooltipWrapper content="Date asset was purchased - Click to sort by purchase date">
                            <div className="flex items-center">
                              <span>Purchase Date</span>
                              <SortIndicator column="purchase_date" />
                            </div>
                          </TooltipWrapper>
                        </TableHead>
                        <TableHead className="sticky top-0 h-auto py-2 px-2 bg-background border-r border-border cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleSort('purchase_cost')}>
                          <TooltipWrapper content="Cost of asset purchase - Click to sort by purchase cost">
                            <div className="flex items-center">
                              <span>Purchase Cost</span>
                              <SortIndicator column="purchase_cost" />
                            </div>
                          </TooltipWrapper>
                        </TableHead>
                        <TableHead className="sticky top-0 h-auto py-2 px-2 bg-background border-r border-border cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleSort('vendor')}>
                          <TooltipWrapper content="Asset vendor/supplier - Click to sort by vendor">
                            <div className="flex items-center">
                              <span>Vendor</span>
                              <SortIndicator column="vendor" />
                            </div>
                          </TooltipWrapper>
                        </TableHead>
                        <TableHead className="sticky top-0 h-auto py-2 px-2 bg-background border-r border-border cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleSort('warranty_expiry_date')}>
                          <TooltipWrapper content="Warranty expiration date - Click to sort by warranty expiry">
                            <div className="flex items-center">
                              <span>Warranty Expiry</span>
                              <SortIndicator column="warranty_expiry_date" />
                            </div>
                          </TooltipWrapper>
                        </TableHead>
                        <TableHead className="sticky top-0 h-auto py-2 px-2 bg-background border-r border-border cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleSort('expiry_date')}>
                          <TooltipWrapper content="Asset expiration date - Click to sort by expiry date">
                            <div className="flex items-center">
                              <span>Expiry Date</span>
                              <SortIndicator column="expiry_date" />
                            </div>
                          </TooltipWrapper>
                        </TableHead>
                        <TableHead className="sticky top-0 h-auto py-2 px-2 bg-background border-r border-border cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleSort('life_expectancy_years')}>
                          <TooltipWrapper content="Expected asset lifespan in years - Click to sort by life expectancy">
                            <div className="flex items-center">
                              <span>Life Exp (Yrs)</span>
                              <SortIndicator column="life_expectancy_years" />
                            </div>
                          </TooltipWrapper>
                        </TableHead>
                        <TableHead className="sticky top-0 h-auto py-2 px-2 bg-background border-r border-border cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleSort('depreciated_value')}>
                          <TooltipWrapper content="Current depreciated value - Click to sort by depreciated value">
                            <div className="flex items-center">
                              <span>Depreciated Value</span>
                              <SortIndicator column="depreciated_value" />
                            </div>
                          </TooltipWrapper>
                        </TableHead>
                        <TableHead className="sticky top-0 h-auto py-2 px-2 bg-background border-r border-border cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleSort('ytd_usage')}>
                          <TooltipWrapper content="Year-to-date usage information - Click to sort by YTD usage">
                            <div className="flex items-center">
                              <span>YTD Usage</span>
                              <SortIndicator column="ytd_usage" />
                            </div>
                          </TooltipWrapper>
                        </TableHead>
                        <TableHead className="sticky top-0 h-auto py-2 px-2 bg-background border-r border-border cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleSort('notes')}>
                          <TooltipWrapper content="Additional notes about the asset - Click to sort by notes">
                            <div className="flex items-center">
                              <span>Notes</span>
                              <SortIndicator column="notes" />
                            </div>
                          </TooltipWrapper>
                        </TableHead>
                        <TableHead className="sticky top-0 h-auto py-2 px-2 bg-background border-r border-border cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleSort('last_updated')}>
                          <TooltipWrapper content="Last modification date - Click to sort by last updated">
                            <div className="flex items-center">
                              <span>Last Updated</span>
                              <SortIndicator column="last_updated" />
                            </div>
                          </TooltipWrapper>
                        </TableHead>
                        <TableHead className="sticky top-0 h-auto py-2 px-2 bg-background border-r border-border cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleSort('last_updated_by')}>
                          <TooltipWrapper content="Person who last updated this asset - Click to sort by updated by">
                            <div className="flex items-center">
                              <span>Updated By</span>
                              <SortIndicator column="last_updated_by" />
                            </div>
                          </TooltipWrapper>
                        </TableHead>
                        <TableHead className="sticky top-0 h-auto py-2 px-2 bg-background border-r border-border cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleSort('created_at')}>
                          <TooltipWrapper content="Asset creation date - Click to sort by created at">
                            <div className="flex items-center">
                              <span>Created At</span>
                              <SortIndicator column="created_at" />
                            </div>
                          </TooltipWrapper>
                        </TableHead>
                        <TableHead className="sticky top-0 h-auto py-2 px-2 bg-background border-r border-border cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleSort('created_by')}>
                          <TooltipWrapper content="Person who created/uploaded this asset - Click to sort by created by">
                            <div className="flex items-center">
                              <span>Created By</span>
                              <SortIndicator column="created_by" />
                            </div>
                          </TooltipWrapper>
                        </TableHead>
                        <TableHead className="sticky top-0 h-auto py-2 px-2 bg-background border-r border-border cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleSort('admin_comments')}>
                          <TooltipWrapper content="Administrative comments - Click to sort by admin comments">
                            <div className="flex items-center">
                              <span>Admin Comments</span>
                              <SortIndicator column="admin_comments" />
                            </div>
                          </TooltipWrapper>
                        </TableHead>
                        <TableHead className="sticky top-0 h-auto py-2 px-2 bg-background border-r border-border cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleSort('invoice_url')}>
                          <TooltipWrapper content="Invoice document URL - Click to sort by invoice URL">
                            <div className="flex items-center">
                              <span>Invoice URL</span>
                              <SortIndicator column="invoice_url" />
                            </div>
                          </TooltipWrapper>
                        </TableHead>
                        <th scope="col" className="sticky top-0 h-auto py-2 px-2 bg-gray-100 dark:bg-gray-700 border-r border-gray-200 dark:border-gray-600 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors" onClick={() => handleSort('barcode_url')}>
                          <TooltipWrapper content="Barcode document URL - Click to sort by barcode URL">
                            <div className="flex items-center">
                              <span>Barcode URL</span>
                              <SortIndicator column="barcode_url" />
                            </div>
                          </TooltipWrapper>
                        </th>
                        <th scope="col" className="sticky right-0 bg-gray-100 dark:bg-gray-700 z-30 text-right min-w-[100px] h-auto py-2 px-2 shadow-lg">
                          <TooltipWrapper content="Available actions for this asset">
                            <div className="flex items-center justify-end">
                              <span>Actions</span>
                            </div>
                          </TooltipWrapper>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedAssets.length === 0 ? (
                        <tr>
                          <td colSpan={32} className="h-16 text-center text-muted-foreground py-1 px-2">
                            {filterText || filterType !== 'all' || filterCondition !== 'all' || filterUnit !== 'all' || filterDivision !== 'all' || filterVendor !== 'all'
                              ? `No assets found matching the current filters.`
                              : "No assets were found."}
                          </td>
                        </tr>
                      ) : (
                        paginatedAssets.map((asset) => (
                          <tr key={asset.id} className="h-auto hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors bg-white dark:bg-gray-800 border-b dark:border-gray-700">
                            {/* Image Cell */}
                            <td className="sticky left-0 bg-white dark:bg-gray-800 z-10 py-2 px-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" onClick={() => handleInfoClick(asset)}>
                              <TooltipWrapper content={`${asset.name || 'Unknown Asset'} - Click to view full details`}>
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={asset.image_url || undefined} alt={asset.name} />
                                  <AvatarFallback>{asset.name?.charAt(0).toUpperCase() || 'A'}</AvatarFallback>
                                </Avatar>
                              </TooltipWrapper>
                            </td>
                            {/* Name Cell */}
                            <TableCell className="sticky left-[50px] bg-background z-10 font-medium py-2 px-2 cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleInfoClick(asset)}>
                              <TooltipWrapper content={`Asset: ${asset.name || 'N/A'} - Click to view full details`}>
                                <HighlightMatch text={asset.name} searchTerm={filterText} />
                              </TooltipWrapper>
                            </TableCell>
                            {/* ID Cell */}
                            <TableCell className="py-2 px-2">
                              <TooltipWrapper content={`Asset ID: ${asset.id || 'N/A'}`}>
                                <HighlightMatch text={asset.id} searchTerm={filterText} />
                              </TooltipWrapper>
                            </TableCell>
                            {/* Type Cell */}
                            <TableCell className="py-2 px-2">
                              <TooltipWrapper content={`Asset Type: ${asset.type || 'N/A'}`}>
                                <HighlightMatch text={asset.type} searchTerm={filterText} />
                              </TooltipWrapper>
                            </TableCell>
                            {/* Brand Cell */}
                            <TableCell className="py-2 px-2">
                              <TooltipWrapper content={`Brand: ${asset.brand || 'N/A'}`}>
                                <HighlightMatch text={asset.brand || 'N/A'} searchTerm={filterText} />
                              </TooltipWrapper>
                            </TableCell>
                            {/* Model Cell */}
                            <TableCell className="py-2 px-2">
                              <TooltipWrapper content={`Model: ${asset.model || 'N/A'}`}>
                                <HighlightMatch text={asset.model || 'N/A'} searchTerm={filterText} />
                              </TooltipWrapper>
                            </TableCell>
                            {/* Serial Number Cell */}
                            <TableCell className="py-2 px-2">
                              <TooltipWrapper content={`Serial Number: ${asset.serial_number || 'N/A'}`}>
                                <HighlightMatch text={asset.serial_number || 'N/A'} searchTerm={filterText} />
                              </TooltipWrapper>
                            </TableCell>
                            {/* Asset ID Cell */}
                            <TableCell className="py-2 px-2">
                              <TooltipWrapper content={`Asset ID: ${asset.asset_id || 'N/A'}`}>
                                <HighlightMatch text={asset.asset_id || 'N/A'} searchTerm={filterText} />
                              </TooltipWrapper>
                            </TableCell>
                            {/* Condition Cell */}
                            <TableCell className="py-2 px-2">
                              <TooltipWrapper content={`Current Condition: ${asset.condition || 'N/A'}`}>
                                <span className={cn(
                                  "px-2 py-1 rounded-full text-xs font-medium",
                                  asset.condition === 'Good' ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' :
                                    asset.condition === 'Fair' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100' :
                                      asset.condition === 'Poor' ? 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100' :
                                        'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100'
                                )}>
                                  <HighlightMatch text={asset.condition} searchTerm={filterText} />
                                </span>
                              </TooltipWrapper>
                            </TableCell>
                            {/* Assigned To Cell */}
                            <TableCell className="py-2 px-2">
                              <TooltipWrapper content={`Assigned To: ${asset.assigned_to || 'N/A'}`}>
                                <HighlightMatch text={asset.assigned_to} searchTerm={filterText} />
                              </TooltipWrapper>
                            </TableCell>
                            {/* Email Cell */}
                            <TableCell className="py-2 px-2">
                              <TooltipWrapper content={`Email: ${asset.assigned_to_email || 'N/A'}`}>
                                <span className="text-sm">{asset.assigned_to_email || 'N/A'}</span>
                              </TooltipWrapper>
                            </TableCell>
                            {/* Unit Cell */}
                            <TableCell className="py-2 px-2">
                              <TooltipWrapper content={`Unit: ${asset.unit || 'N/A'}`}>
                                <HighlightMatch text={asset.unit} searchTerm={filterText} />
                              </TooltipWrapper>
                            </TableCell>
                            {/* Division Cell */}
                            <TableCell className="py-2 px-2">
                              <TooltipWrapper content={`Division: ${asset.division || 'N/A'}`}>
                                <HighlightMatch text={asset.division} searchTerm={filterText} />
                              </TooltipWrapper>
                            </TableCell>
                            {/* Description Cell */}
                            <TableCell className="py-2 px-2 max-w-[150px] truncate">
                              <TooltipWrapper content={`Description: ${asset.description || 'No description available'}`}>
                                <HighlightMatch text={asset.description || 'N/A'} searchTerm={filterText} />
                              </TooltipWrapper>
                            </TableCell>
                            {/* Assigned Date Cell */}
                            <TableCell className="py-2 px-2">
                              <TooltipWrapper content={`Assigned Date: ${formatDate(asset.assigned_date) || 'N/A'}`}>
                                <span className="text-sm text-muted-foreground">{formatDate(asset.assigned_date) || 'N/A'}</span>
                              </TooltipWrapper>
                            </TableCell>
                            {/* Purchase Date Cell */}
                            <TableCell className="py-2 px-2">
                              <TooltipWrapper content={`Purchase Date: ${formatDate(asset.purchase_date) || 'N/A'}`}>
                                <span className="text-sm text-muted-foreground">{formatDate(asset.purchase_date) || 'N/A'}</span>
                              </TooltipWrapper>
                            </TableCell>
                            {/* Purchase Cost Cell */}
                            <TableCell className="py-2 px-2">
                              <TooltipWrapper content={`Purchase Cost: ${asset.purchase_cost != null ? `$${asset.purchase_cost.toFixed(2)}` : 'N/A'}`}>
                                <span className="text-sm font-medium text-green-600 dark:text-green-400">
                                  {asset.purchase_cost != null ? `$${asset.purchase_cost.toFixed(2)}` : 'N/A'}
                                </span>
                              </TooltipWrapper>
                            </TableCell>
                            {/* Vendor Cell */}
                            <TableCell className="py-2 px-2">
                              <TooltipWrapper content={`Vendor: ${asset.vendor || 'N/A'}`}>
                                <HighlightMatch text={asset.vendor} searchTerm={filterText} />
                              </TooltipWrapper>
                            </TableCell>
                            {/* Warranty Expiry Cell */}
                            <TableCell className="py-2 px-2">
                              <TooltipWrapper content={`Warranty Expiry: ${formatDate(asset.warranty_expiry_date) || 'N/A'}`}>
                                <span className="text-sm text-muted-foreground">{formatDate(asset.warranty_expiry_date) || 'N/A'}</span>
                              </TooltipWrapper>
                            </TableCell>
                            {/* Expiry Date Cell */}
                            <TableCell className="py-2 px-2">
                              <TooltipWrapper content={`Expiry Date: ${formatDate(asset.expiry_date) || 'N/A'}`}>
                                <span className="text-sm text-muted-foreground">{formatDate(asset.expiry_date) || 'N/A'}</span>
                              </TooltipWrapper>
                            </TableCell>
                            {/* Life Expectancy Cell */}
                            <TableCell className="py-2 px-2">
                              <TooltipWrapper content={`Life Expectancy: ${asset.life_expectancy_years ?? 'N/A'} years`}>
                                <span className="text-sm">{asset.life_expectancy_years ?? 'N/A'}</span>
                              </TooltipWrapper>
                            </TableCell>
                            {/* Depreciated Value Cell */}
                            <TableCell className="py-2 px-2">
                              <TooltipWrapper content={`Depreciated Value: ${asset.depreciated_value != null ? `$${asset.depreciated_value.toFixed(2)}` : 'N/A'}`}>
                                <span className="text-sm font-medium text-orange-600 dark:text-orange-400">
                                  {asset.depreciated_value != null ? `$${asset.depreciated_value.toFixed(2)}` : 'N/A'}
                                </span>
                              </TooltipWrapper>
                            </TableCell>
                            {/* YTD Usage Cell */}
                            <TableCell className="py-2 px-2">
                              <TooltipWrapper content={`YTD Usage: ${asset.ytd_usage || 'N/A'}`}>
                                <span className="text-sm">{asset.ytd_usage || 'N/A'}</span>
                              </TooltipWrapper>
                            </TableCell>
                            {/* Notes Cell */}
                            <TableCell className="py-2 px-2 max-w-[150px] truncate">
                              <TooltipWrapper content={`Notes: ${asset.notes || 'No notes available'}`}>
                                <span className="text-sm text-muted-foreground">{asset.notes || 'N/A'}</span>
                              </TooltipWrapper>
                            </TableCell>
                            {/* Last Updated Cell */}
                            <TableCell className="py-2 px-2">
                              <TooltipWrapper content={`Last Updated: ${formatDate(asset.last_updated) || 'N/A'}`}>
                                <span className="text-sm text-muted-foreground">{formatDate(asset.last_updated) || 'N/A'}</span>
                              </TooltipWrapper>
                            </TableCell>
                            {/* Updated By Cell */}
                            <TableCell className="py-2 px-2">
                              <TooltipWrapper content={`Updated By: ${asset.last_updated_by || 'N/A'}`}>
                                <span className="text-sm">{asset.last_updated_by || 'N/A'}</span>
                              </TooltipWrapper>
                            </TableCell>
                            {/* Created At Cell */}
                            <TableCell className="py-2 px-2">
                              <TooltipWrapper content={`Created At: ${formatDate(asset.created_at) || 'N/A'}`}>
                                <span className="text-sm text-muted-foreground">{formatDate(asset.created_at) || 'N/A'}</span>
                              </TooltipWrapper>
                            </TableCell>
                            {/* Created By Cell */}
                            <TableCell className="py-2 px-2">
                              <TooltipWrapper content={`Created By: ${asset.created_by || 'N/A'}`}>
                                <span className="text-sm">{asset.created_by || 'N/A'}</span>
                              </TooltipWrapper>
                            </TableCell>
                            {/* Admin Comments Cell */}
                            <TableCell className="py-2 px-2 max-w-[150px] truncate">
                              <TooltipWrapper content={`Admin Comments: ${asset.admin_comments || 'No admin comments'}`}>
                                <span className="text-sm text-muted-foreground">{asset.admin_comments || 'N/A'}</span>
                              </TooltipWrapper>
                            </TableCell>
                            {/* Invoice URL Cell */}
                            <TableCell className="py-2 px-2 max-w-[150px] truncate">
                              <TooltipWrapper content={`Invoice URL: ${asset.invoice_url || 'No invoice URL'}`}>
                                <span className="text-sm text-blue-600 dark:text-blue-400">{asset.invoice_url || 'N/A'}</span>
                              </TooltipWrapper>
                            </TableCell>
                            {/* Barcode URL Cell */}
                            <TableCell className="py-2 px-2 max-w-[150px] truncate">
                              <TooltipWrapper content={`Barcode URL: ${asset.barcode_url || 'No barcode URL'}`}>
                                <span className="text-sm text-blue-600 dark:text-blue-400">{asset.barcode_url || 'N/A'}</span>
                              </TooltipWrapper>
                            </TableCell>
                            {/* Actions Cell */}
                            <TableCell className="sticky right-0 bg-background z-20 text-right py-2 px-2 shadow-lg">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700">
                                    <span className="sr-only">Open menu</span>
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="z-50">
                                  <DropdownMenuItem onClick={() => handleInfoClick(asset)}>
                                    <Info className="mr-2 h-4 w-4" />
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleEditClick(asset)}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleDeleteClick(asset)} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                )}
                {/* End Detailed List View */}
              </> /* Closing Fragment for !loading && !error */
            )}
            {/* Pagination Controls (Now directly inside CardContent, after the conditional content) */}
            {!assetsLoading && !assetsError && totalPages > 1 && (
              <div className="sticky bottom-0 bg-background flex items-center justify-between border-t p-4 flex-shrink-0 z-40"> {/* Made pagination sticky */}
                <span className="text-sm text-muted-foreground">
                  Showing {paginatedAssets.length} of {sortedAssets.length} assets
                  {sortColumn && (
                    <span className="ml-2 text-blue-600 dark:text-blue-400">
                      (sorted by {sortColumn} {sortDirection === 'asc' ? '↑' : '↓'})
                    </span>
                  )}
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm font-medium">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div> {/* Close scroll container */}
        </CardContent>
      </Card>

      {/* Modals */}
      {isEditModalOpen && selectedAsset && (
        <EditAssetModal
          isOpen={isEditModalOpen}
          onClose={handleCloseModals}
          onEdit={handleSaveEdit}
          asset={selectedAsset}
          onDelete={() => handleDeleteClick(selectedAsset)}
          divisions={divisions}
          units={units}
          staffMembers={staffMembers}
          existingNames={existingNames}
          existingTypes={existingTypes}
          existingVendors={existingVendors}
        />
      )}

      {selectedAsset && isDeleteModalOpen && (
        <DeleteModal
          open={isDeleteModalOpen}
          onOpenChange={setIsDeleteModalOpen}
          onDelete={handleConfirmDelete}
          title="Delete Asset"
          description={`Are you sure you want to delete the asset "${selectedAsset?.name || "this asset"}"? This action cannot be undone.`}
        />
      )}

      {/* --- Render Quick Asset Info Modal --- */}
      <AssetInfoModal
        asset={selectedAssetForInfo}
        isOpen={isQuickInfoModalOpen}
        onClose={() => { // Only close the quick modal here
          setIsQuickInfoModalOpen(false);
          // Optionally clear selectedAssetForInfo if you don't want the full modal to open after closing quick view directly
          // setSelectedAssetForInfo(null); 
        }}
      />
      {/* --- End Quick Asset Info Modal --- */}
    </div>
  );

  return skipPageLayout ? mainContent : <PageLayout>{mainContent}</PageLayout>;
};

export default AssetManagement; 
