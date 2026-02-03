import { useState, useCallback, useEffect } from 'react';
import { useMsal } from '@azure/msal-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AssetsSharePointService, Asset } from '@/services/assetsSharePointService';
import { getGraphClient } from '@/services/graphService';
import { useToast } from '@/hooks/use-toast';
import { useRoleBasedAuth } from '@/hooks/useRoleBasedAuth';

export function useAssetsSharePoint() {
  const { instance: msalInstance, accounts } = useMsal();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Keep service in state as it maintains connection details
  const [service, setService] = useState<AssetsSharePointService | null>(null);

  // Get current user info and role
  const { user: roleUser, isAdmin } = useRoleBasedAuth();
  const currentUser = accounts[0];
  const userEmail = currentUser?.username || currentUser?.email;

  /**
   * Initialize the SharePoint service
   */
  const initializeService = useCallback(async () => {
    // If already initialized, return it (though this function re-creates if dependencies change)
    if (service) return service;

    try {
      console.log('🔄 [useAssetsSharePoint] Initializing SharePoint service...');
      const graphClient = await getGraphClient(msalInstance);

      if (!graphClient) {
        throw new Error('Failed to initialize Graph client. Please ensure you are logged in.');
      }

      const assetsService = new AssetsSharePointService(graphClient);
      await assetsService.initialize();

      setService(assetsService);
      return assetsService;
    } catch (err: unknown) {
      console.error('❌ [useAssetsSharePoint] Service initialization failed:', err);
      const error = err instanceof Error ? err : new Error('Unknown error');
      toast({
        title: 'SharePoint Connection Error',
        description: error.message || 'Failed to connect to SharePoint. Please try again.',
        variant: 'destructive',
      });
      throw error;
    }
  }, [msalInstance, service, toast]);

  // Ensure service is initialized
  useEffect(() => {
    if (!service && msalInstance) {
      initializeService().catch(console.error);
    }
  }, [initializeService, service, msalInstance]);

  /**
   * React Query: Fetch Assets
   */
  const {
    data: assets = [],
    isLoading: loading,
    error,
    refetch: refreshAssets
  } = useQuery({
    queryKey: ['assets', userEmail, isAdmin],
    queryFn: async () => {
      console.log('📥 [useAssetsSharePoint] Fetching assets via React Query...');
      let currentService = service;
      if (!currentService) {
        currentService = await initializeService();
      }
      return currentService.getAssets(userEmail, isAdmin);
    },
    // Only fetch when we have user info. Service will be init'd on demand if needed.
    enabled: !!userEmail && (!!roleUser || !isAdmin),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  /**
   * React Query: Add Asset Mutation
   */
  const addAssetMutation = useMutation({
    mutationFn: async (assetData: Partial<Asset>) => {
      let currentService = service;
      if (!currentService) {
        currentService = await initializeService();
      }

      const assetToCreate = {
        ...assetData,
        created_by: assetData.created_by || userEmail,
        last_updated_by: assetData.last_updated_by || userEmail,
      };

      return currentService.addAsset(assetToCreate);
    },
    onSuccess: (newAsset) => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      toast({
        title: 'Asset Created',
        description: `${newAsset.name} has been added successfully.`,
      });
    },
    onError: (err: unknown) => {
      const error = err instanceof Error ? err : new Error('Unknown error');
      toast({
        title: 'Error Creating Asset',
        description: error.message || 'Failed to create asset.',
        variant: 'destructive',
      });
    }
  });

  /**
   * React Query: Update Asset Mutation
   */
  const updateAssetMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Asset> }) => {
      let currentService = service;
      if (!currentService) {
        currentService = await initializeService();
      }

      const updatesToApply = {
        ...updates,
        last_updated_by: userEmail,
      };

      return currentService.updateAsset(id, updatesToApply);
    },
    onSuccess: (updatedAsset) => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      toast({
        title: 'Asset Updated',
        description: `${updatedAsset.name} has been updated successfully.`,
      });
    },
    onError: (err: unknown) => {
      const error = err instanceof Error ? err : new Error('Unknown error');
      toast({
        title: 'Error Updating Asset',
        description: error.message || 'Failed to update asset.',
        variant: 'destructive',
      });
    }
  });

  /**
   * React Query: Delete Asset Mutation
   */
  const deleteAssetMutation = useMutation({
    mutationFn: async (id: string) => {
      let currentService = service;
      if (!currentService) {
        currentService = await initializeService();
      }
      return currentService.deleteAsset(id, userEmail!);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      toast({
        title: 'Asset Deleted',
        description: 'Asset has been deleted successfully.',
      });
    },
    onError: (err: unknown) => {
      const error = err instanceof Error ? err : new Error('Unknown error');
      toast({
        title: 'Error Deleting Asset',
        description: error.message || 'Failed to delete asset.',
        variant: 'destructive',
      });
    }
  });

  /**
   * React Query: Restore Asset Mutation
   */
  const restoreAssetMutation = useMutation({
    mutationFn: async (id: string) => {
      let currentService = service;
      if (!currentService) {
        currentService = await initializeService();
      }
      return currentService.restoreAsset(id);
    },
    onSuccess: (restoredAsset) => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      toast({
        title: 'Asset Restored',
        description: `${restoredAsset.name} has been restored successfully.`,
      });
    },
    onError: (err: unknown) => {
      const error = err instanceof Error ? err : new Error('Unknown error');
      toast({
        title: 'Error Restoring Asset',
        description: error.message || 'Failed to restore asset.',
        variant: 'destructive',
      });
    }
  });

  // Wrappers to match original interface
  const addAsset = useCallback((assetData: Partial<Asset>) => addAssetMutation.mutateAsync(assetData), [addAssetMutation]);
  const updateAsset = useCallback((id: string, updates: Partial<Asset>) => updateAssetMutation.mutateAsync({ id, updates }), [updateAssetMutation]);
  const deleteAsset = useCallback((id: string) => deleteAssetMutation.mutateAsync(id), [deleteAssetMutation]);
  const restoreAsset = useCallback((id: string) => restoreAssetMutation.mutateAsync(id), [restoreAssetMutation]);

  return {
    // Data
    assets,
    loading,
    error: error as Error | null,

    // Operations
    add: addAsset,
    update: updateAsset,
    remove: deleteAsset,
    restore: restoreAsset,
    refresh: refreshAssets,

    // Service instance (for advanced usage if needed)
    service,
  };
}
