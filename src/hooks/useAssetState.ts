import { useState, useCallback, useEffect } from 'react';
import { UserAsset } from '@/types';
import { useToast } from '@/components/ui/use-toast';

export interface AssetFilterState {
  type: string;
  status: string;
  department: string;
  assignedTo: string;
}

export function useAssetState(initialAssets: UserAsset[] = []) {
  const { toast } = useToast();
  const [assets, setAssets] = useState<UserAsset[]>(initialAssets);
  const [filteredAssets, setFilteredAssets] = useState<UserAsset[]>(initialAssets);
  
  // Asset filtering state
  const [assetFilters, setAssetFilters] = useState<AssetFilterState>({
    type: 'all',
    status: 'all',
    department: 'all',
    assignedTo: 'all'
  });
  
  // Modal states
  const [showAddAssetModal, setShowAddAssetModal] = useState(false);
  const [showEditAssetModal, setShowEditAssetModal] = useState(false);
  const [editingAsset, setEditingAsset] = useState<UserAsset | null>(null);
  const [showDeleteAssetModal, setShowDeleteAssetModal] = useState(false);
  const [deletingAsset, setDeletingAsset] = useState<UserAsset | null>(null);
  
  // Apply asset filters
  const applyAssetFilters = useCallback(() => {
    let filtered = [...assets];
    
    if (assetFilters.type !== 'all') {
      filtered = filtered.filter(asset => asset.type === assetFilters.type);
    }
    
    if (assetFilters.status !== 'all') {
      filtered = filtered.filter(asset => asset.status === assetFilters.status);
    }
    
    if (assetFilters.department !== 'all') {
      filtered = filtered.filter(asset => asset.department === assetFilters.department);
    }
    
    if (assetFilters.assignedTo !== 'all') {
      filtered = filtered.filter(asset => asset.assignedTo === assetFilters.assignedTo);
    }
    
    setFilteredAssets(filtered);
  }, [assets, assetFilters]);
  
  // Apply filters when assets or filters change
  useEffect(() => {
    applyAssetFilters();
  }, [assets, assetFilters, applyAssetFilters]);
  
  // Function to add an asset
  const handleAddAsset = (asset: UserAsset) => {
    setAssets([...assets, asset]);
    toast({
      title: "Asset Added",
      description: "The asset has been successfully added."
    });
  };
  
  // Function to update an asset
  const handleUpdateAsset = (updatedAsset: UserAsset) => {
    const updatedAssets = assets.map(a => a.id === updatedAsset.id ? updatedAsset : a);
    setAssets(updatedAssets);
    toast({
      title: "Asset Updated",
      description: "The asset has been successfully updated."
    });
  };
  
  // Function to delete an asset
  const handleDeleteAsset = () => {
    if (!deletingAsset) return;
    
    const updatedAssets = assets.filter(a => a.id !== deletingAsset.id);
    setAssets(updatedAssets);
    setDeletingAsset(null);
    toast({
      title: "Asset Deleted",
      description: "The asset has been successfully deleted."
    });
  };
  
  // Reset filters function
  const resetAssetFilters = () => {
    setAssetFilters({
      type: 'all',
      status: 'all',
      department: 'all',
      assignedTo: 'all'
    });
  };
  
  return {
    assets,
    setAssets,
    filteredAssets,
    assetFilters,
    setAssetFilters,
    resetAssetFilters,
    applyAssetFilters,
    
    // Modal states
    showAddAssetModal,
    setShowAddAssetModal,
    showEditAssetModal,
    setShowEditAssetModal,
    editingAsset,
    setEditingAsset,
    showDeleteAssetModal,
    setShowDeleteAssetModal,
    deletingAsset,
    setDeletingAsset,
    
    // Handler functions
    handleAddAsset,
    handleUpdateAsset,
    handleDeleteAsset
  };
} 