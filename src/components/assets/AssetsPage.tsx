import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AssetsTable } from "@/components/assets/AssetsTable";
import { fetcher } from "@/lib/api";
import { Asset } from "@/types/asset";
import { UserAsset } from "@/types";
import { Plus, RotateCcw, Search } from "lucide-react";
import { useDivisionContext } from "@/hooks/useDivisionContext";
import { AddAssetDialog } from "@/components/assets/AddAssetDialog";
import { useToast } from "@/hooks/use-toast";
import AssetInfoModal from "@/components/assets/AssetInfoModal";

// Helper function to adapt Asset to UserAsset for the modal
const adaptAssetToUserAsset = (asset: Asset): UserAsset => {
  const nowISO = new Date().toISOString();
  return {
    id: String(asset.id), // Ensure string
    name: String(asset.name || ''), // Ensure string, default to empty
    type: String(asset.type || asset.category || ''),
    description: asset.description || undefined,
    assigned_date: String(asset.assigned_date || asset.assignedDate || nowISO),
    assigned_to: asset.assigned_to || asset.assignedTo || undefined,
    assigned_to_email: asset.email || undefined,
    unit: asset.unit || asset.department || undefined,
    division: asset.division || undefined,
    purchase_date: asset.purchase_date || asset.purchased_date || undefined,
    purchase_cost: typeof asset.value === 'number' ? asset.value : null,
    depreciated_value: null, // UserAsset expects this, provide default
    vendor: asset.vendor || undefined,
    warranty_expiry_date: asset.warranty_expiry || undefined,
    invoice_url: undefined, // UserAsset expects this
    expiry_date: undefined, // UserAsset expects this (specific to asset lifetime, not warranty)
    life_expectancy_years: undefined, // UserAsset expects this
    condition: String(asset.condition || asset.status || ''),
    ytd_usage: undefined, // UserAsset expects this
    specifications: typeof asset.specifications === 'object' && asset.specifications !== null ? asset.specifications : {},
    notes: asset.notes || undefined,
    barcode_url: undefined, // UserAsset expects this
    image_url: asset.image || undefined,
    admin_comments: undefined, // UserAsset expects this
    last_updated: asset.last_updated || asset.lastUpdated || undefined,
    last_updated_by: undefined, // UserAsset expects this
    created_at: asset.creation_date || undefined,
    checklist: undefined, // UserAsset expects this, provide default
  };
};

export function AssetsPage() {
  const { currentDivisionId } = useDivisionContext();
  const [filter, setFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [conditionFilter, setConditionFilter] = useState("all");
  const [unitFilter, setUnitFilter] = useState("all");
  const [divisionFilter, setDivisionFilter] = useState("all");
  const [vendorFilter, setVendorFilter] = useState("all");
  const [isAddAssetOpen, setIsAddAssetOpen] = useState(false);
  const [sortColumn, setSortColumn] = useState<string>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const { toast } = useToast();

  // State for View Asset Modal
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedAssetForView, setSelectedAssetForView] = useState<Asset | null>(null);

  // Fetch assets
  const { data: assets = [], refetch, isLoading } = useQuery({
    queryKey: ["assets", currentDivisionId],
    queryFn: async () => {
      try {
        const response = await fetcher(`/api/assets?division=${currentDivisionId || ''}`);
        return response.data || [];
      } catch (error) {
        console.error("Error fetching assets:", error);
        toast({
          title: "Error",
          description: "Failed to load assets. Please try again later.",
          variant: "destructive",
        });
        return [];
      }
    },
  });

  // Get unique values for filters
  const types = [...new Set(assets.map((asset: Asset) => asset.type))];
  const conditions = [...new Set(assets.map((asset: Asset) => asset.condition))];
  const units = [...new Set(assets.map((asset: Asset) => asset.unit))];
  const divisions = [...new Set(assets.map((asset: Asset) => asset.division))];
  const vendors = [...new Set(assets.map((asset: Asset) => asset.vendor).filter(Boolean))];

  // Handle sort
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  // Apply filters and sorting
  const filteredAssets = assets
    .filter((asset: Asset) => {
      const searchMatch =
        filter === "" ||
        Object.values(asset).some(
          (value) =>
            value &&
            value.toString().toLowerCase().includes(filter.toLowerCase())
        );
      
      const typeMatch = typeFilter === "all" || asset.type === typeFilter;
      const conditionMatch = conditionFilter === "all" || asset.condition === conditionFilter;
      const unitMatch = unitFilter === "all" || asset.unit === unitFilter;
      const divisionMatch = divisionFilter === "all" || asset.division === divisionFilter;
      const vendorMatch = vendorFilter === "all" || asset.vendor === vendorFilter;
      
      return searchMatch && typeMatch && conditionMatch && unitMatch && divisionMatch && vendorMatch;
    })
    .sort((a: Asset, b: Asset) => {
      const aValue = a[sortColumn as keyof Asset];
      const bValue = b[sortColumn as keyof Asset];
      
      if (!aValue && !bValue) return 0;
      if (!aValue) return 1;
      if (!bValue) return -1;
      
      const comparison = aValue.toString().localeCompare(bValue.toString());
      return sortDirection === "asc" ? comparison : -comparison;
    });

  // Reset filters
  const resetFilters = () => {
    setFilter("");
    setTypeFilter("all");
    setConditionFilter("all");
    setUnitFilter("all");
    setDivisionFilter("all");
    setVendorFilter("all");
  };

  // Handle asset addition
  const handleAssetAdded = () => {
    refetch();
    setIsAddAssetOpen(false);
    toast({
      title: "Asset Added",
      description: "The asset has been added successfully.",
    });
  };

  // Handle opening the view modal
  const handleViewAsset = (asset: Asset) => {
    setSelectedAssetForView(asset);
    setIsViewModalOpen(true);
  };

  // Handle closing the view modal
  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedAssetForView(null);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Assets</h1>
        <p className="text-muted-foreground">
          Manage and track organizational assets, equipment, and inventory.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search for events, documents, contacts etc."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="min-w-[180px]">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {types.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={conditionFilter} onValueChange={setConditionFilter}>
            <SelectTrigger className="min-w-[180px]">
              <SelectValue placeholder="All Conditions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Conditions</SelectItem>
              {conditions.map((condition) => (
                <SelectItem key={condition} value={condition}>
                  {condition}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={unitFilter} onValueChange={setUnitFilter}>
            <SelectTrigger className="min-w-[180px]">
              <SelectValue placeholder="All Units" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Units</SelectItem>
              {units.map((unit) => (
                <SelectItem key={unit} value={unit}>
                  {unit}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={divisionFilter} onValueChange={setDivisionFilter}>
            <SelectTrigger className="min-w-[200px]">
              <SelectValue placeholder="All Divisions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Divisions</SelectItem>
              {divisions.map((division) => (
                <SelectItem key={division} value={division}>
                  {division}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={vendorFilter} onValueChange={setVendorFilter}>
            <SelectTrigger className="min-w-[180px]">
              <SelectValue placeholder="All Vendors" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Vendors</SelectItem>
              {vendors.map((vendor) => (
                <SelectItem key={vendor} value={vendor}>
                  {vendor}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline" size="icon" onClick={resetFilters}>
            <RotateCcw className="h-4 w-4" />
          </Button>

          <Button
            onClick={() => setIsAddAssetOpen(true)}
            size="icon"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Add a container with appropriate height and overflow settings */}
      <div className="border rounded-md">
        <AssetsTable
          assets={filteredAssets}
          onSort={handleSort}
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          divisionId={currentDivisionId}
          onView={handleViewAsset}
        />
      </div>
      
      <div className="text-sm text-muted-foreground">
        Showing {filteredAssets.length} of {assets.length} assets
      </div>

      {/* Add Asset Dialog */}
      <AddAssetDialog
        isOpen={isAddAssetOpen}
        onClose={() => setIsAddAssetOpen(false)}
        onAssetAdded={handleAssetAdded}
        divisionId={currentDivisionId}
      />

      {/* View Asset Modal */}
      {selectedAssetForView && (
        <AssetInfoModal
          asset={selectedAssetForView}
          isOpen={isViewModalOpen}
          onClose={handleCloseViewModal}
        />
      )}
    </div>
  );
}
