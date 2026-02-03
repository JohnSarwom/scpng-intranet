/**
 * useApps Hook
 * React hook for fetching and managing applications from SharePoint
 */

import { useState, useEffect } from 'react';
import { useMsal } from '@azure/msal-react';
import { Client } from '@microsoft/microsoft-graph-client';
import { AppsSharePointService, SharePointApp } from '@/services/appsSharePointService';

interface UseAppsReturn {
  apps: SharePointApp[];
  categories: string[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  getAppsByCategory: (category: string) => SharePointApp[];
  getAppById: (appId: string) => SharePointApp | undefined;
}

export const useApps = (): UseAppsReturn => {
  const { instance, accounts } = useMsal();
  const [apps, setApps] = useState<SharePointApp[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchApps = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get access token
      const account = accounts[0];
      if (!account) {
        throw new Error('No account found. Please sign in.');
      }

      const response = await instance.acquireTokenSilent({
        scopes: ['Sites.Read.All'],
        account: account,
      });

      // Initialize Graph client
      const client = Client.init({
        authProvider: (done) => {
          done(null, response.accessToken);
        },
      });

      // Initialize service and fetch apps
      const service = new AppsSharePointService(client);
      await service.initialize();

      const fetchedApps = await service.getApplications();
      const activeApps = fetchedApps.filter(app => app.isActive !== false);

      setApps(activeApps);

      // Extract unique categories
      const uniqueCategories = Array.from(
        new Set(activeApps.map(app => app.category).filter(Boolean))
      ).sort();
      setCategories(uniqueCategories);

      console.log('✅ [useApps] Successfully fetched', activeApps.length, 'applications');
    } catch (err: any) {
      console.error('❌ [useApps] Error fetching applications:', err);
      setError(err.message || 'Failed to fetch applications');
      setApps([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
  }, [instance, accounts]);

  const getAppsByCategory = (category: string): SharePointApp[] => {
    return apps.filter(app =>
      app.category?.toLowerCase() === category.toLowerCase()
    );
  };

  const getAppById = (appId: string): SharePointApp | undefined => {
    return apps.find(app => app.appId === appId);
  };

  return {
    apps,
    categories,
    loading,
    error,
    refetch: fetchApps,
    getAppsByCategory,
    getAppById,
  };
};

export default useApps;
