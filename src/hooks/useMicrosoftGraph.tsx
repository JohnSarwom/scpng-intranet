import { useState, useCallback, useRef } from 'react';
import { useSupabaseAuth } from './useSupabaseAuth';
import { toast } from 'sonner';
import { useMsal } from '@azure/msal-react';
import { getGraphClient } from '@/services/graphService';
import { Client } from '@microsoft/microsoft-graph-client';

// ... (interface definitions remain the same)

export const useMicrosoftGraph = () => {
  const { user } = useSupabaseAuth();
  const { instance: msalInstance, inProgress, accounts } = useMsal();
  const [isLoading, setIsLoading] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const [isRequestLocked, setIsRequestLocked] = useState(false);
  const [hasFetchAttempted, setHasFetchAttempted] = useState(false);
  const [client, setClient] = useState<Client | null>(null);
  const fetchTimeoutRef = useRef<any>(null);

  // Check if user is authenticated
  const isAuthenticated = accounts && accounts.length > 0;

  // getAccessToken and getClient have been removed and are now in graphService.ts

  const checkMsalAuth = useCallback(() => {
    if (inProgress !== 'none') {
      console.warn('checkMsalAuth: MSAL interaction is in progress.');
      setLastError('Authentication system busy, please wait.');
      return false;
    }
    if (!msalInstance) {
      console.error('MSAL instance not found via useMsal hook');
      setLastError('MSAL instance not found - authentication service not initialized');
      return false;
    }
    const accounts = msalInstance.getAllAccounts();
    if (accounts.length === 0) {
      console.error('No accounts found in MSAL instance.');
      return false;
    }
    if (!msalInstance.getActiveAccount() && accounts.length > 0) {
      msalInstance.setActiveAccount(accounts[0]);
    }
    return true;
  }, [msalInstance, inProgress]);

  const getOneDriveRootDocuments = useCallback(async (): Promise<Document[] | null> => {
    setIsLoading(true);
    setLastError(null);
    if (!checkMsalAuth() || !msalInstance) {
      setIsLoading(false);
      return null;
    }
    try {
      const client = await getGraphClient(msalInstance);
      if (!client) {
        setIsLoading(false);
        return null;
      }
      const response = await client.api('/me/drive/root/children').select('id,name,webUrl,lastModifiedDateTime,size,folder,parentReference').get();
      const documents: Document[] = response.value.map((item: any) => ({
        id: item.id,
        name: item.name,
        url: item.webUrl,
        lastModified: item.lastModifiedDateTime,
        size: item.size,
        isFolder: !!item.folder,
        parentReference: item.parentReference,
        source: 'OneDrive',
      }));
      setIsLoading(false);
      return documents;
    } catch (error: any) {
      setLastError(`Failed to get OneDrive documents: ${error.message || 'Unknown error'}`);
      toast.error(`Failed to fetch OneDrive documents: ${error.message}`);
      setIsLoading(false);
      return null;
    }
  }, [checkMsalAuth, msalInstance, setIsLoading, setLastError, toast]);

  /**
   * Uploads a file to the SharePoint Asset Images folder
   * @param file The file to upload
   * @returns The web URL of the uploaded file, or null if upload fails
   */
  const uploadFileToSharePointLibrary = useCallback(async (file: File): Promise<string | null> => {
    setIsLoading(true);
    setLastError(null);

    if (!checkMsalAuth() || !msalInstance) {
      setIsLoading(false);
      return null;
    }

    try {
      console.log('📤 [uploadFileToSharePointLibrary] Starting upload:', file.name);

      const client = await getGraphClient(msalInstance);
      if (!client) {
        setIsLoading(false);
        return null;
      }

      // SharePoint site configuration - dynamically get the site ID
      const siteDomain = 'scpng1.sharepoint.com';
      const sitePath = '/sites/scpngintranet';

      console.log('   🔍 Getting site ID for:', `${siteDomain}:${sitePath}`);
      const site = await client.api(`/sites/${siteDomain}:${sitePath}`).get();

      if (!site || !site.id) {
        throw new Error(`Site not found at ${siteDomain}:${sitePath}`);
      }

      const siteId = site.id;
      console.log('   ✅ Site ID obtained:', siteId);

      // Get the document library (drive) for asset images
      // First, let's try to find the "Asset Images" library
      console.log('   🔍 Looking for document library...');
      const drives = await client.api(`/sites/${siteId}/drives`).get();

      console.log('   📚 Available drives:', drives.value.map((d: any) => ({ name: d.name, id: d.id })));

      // Try to find "Asset Images" or "Documents" library
      let targetDrive = drives.value.find((d: any) => d.name === 'Asset Images' || d.name === 'AssetImages');

      if (!targetDrive) {
        // Fall back to Documents library
        targetDrive = drives.value.find((d: any) => d.name === 'Documents');
      }

      if (!targetDrive) {
        throw new Error('Could not find suitable document library for uploads. Please create an "Asset Images" library.');
      }

      const driveId = targetDrive.id;
      const folderPath = '/Assets'; // The Assets subfolder within the library

      console.log('   📍 Uploading to:', {
        site: siteId,
        drive: driveId,
        driveName: targetDrive.name,
        folder: folderPath
      });

      // Check if the Assets folder exists, if not create it
      try {
        console.log('   🔍 Checking if Assets folder exists...');
        await client.api(`/sites/${siteId}/drives/${driveId}/root:${folderPath}`).get();
        console.log('   ✅ Assets folder exists');
      } catch (folderError: any) {
        if (folderError.statusCode === 404) {
          console.log('   ⚠️  Assets folder not found, creating it...');
          try {
            await client.api(`/sites/${siteId}/drives/${driveId}/root/children`).post({
              name: 'Assets',
              folder: {},
              '@microsoft.graph.conflictBehavior': 'rename'
            });
            console.log('   ✅ Assets folder created successfully');
          } catch (createError: any) {
            console.error('   ❌ Failed to create Assets folder:', createError);
            throw new Error(`Could not create Assets folder: ${createError.message}`);
          }
        } else {
          console.error('   ❌ Error checking folder:', folderError);
          throw folderError;
        }
      }

      // Upload the file to SharePoint
      const uploadUrl = `/sites/${siteId}/drives/${driveId}/root:${folderPath}/${file.name}:/content`;

      console.log('   🔗 Upload URL:', uploadUrl);
      console.log('   📦 File size:', file.size, 'bytes');

      const uploadResponse = await client.api(uploadUrl).put(file);

      console.log('   ✅ Upload successful!');
      console.log('   📄 Response:', uploadResponse);

      const webUrl = uploadResponse.webUrl;
      console.log('   🌐 File URL:', webUrl);

      setIsLoading(false);
      return webUrl;
    } catch (error: any) {
      const errorMsg = `Failed to upload file: ${error.message || 'Unknown error'}`;
      console.error('❌ [uploadFileToSharePointLibrary] Upload failed');
      console.error('   Error:', error);
      setLastError(errorMsg);
      toast.error(errorMsg);
      setIsLoading(false);
      return null;
    }
  }, [checkMsalAuth, msalInstance]);

  const getClient = useCallback(async () => {
    if (!checkMsalAuth() || !msalInstance) return null;
    return await getGraphClient(msalInstance);
  }, [checkMsalAuth, msalInstance]);

  /**
   * Uploads a binary file to a specific SharePoint location
   */
  const uploadBinaryFileToSharePoint = useCallback(async (
    file: File,
    fileName: string,
    sitePath: string,
    libraryName: string,
    folderPath: string
  ): Promise<string | null> => {
    setIsLoading(true);
    setLastError(null);

    if (!checkMsalAuth() || !msalInstance) {
      setIsLoading(false);
      return null;
    }

    try {
      const client = await getGraphClient(msalInstance);
      if (!client) {
        setIsLoading(false);
        return null;
      }

      const siteDomain = 'scpng1.sharepoint.com';
      const site = await client.api(`/sites/${siteDomain}:${sitePath}`).get();
      const siteId = site.id;

      const drives = await client.api(`/sites/${siteId}/drives`).get();
      const targetDrive = drives.value.find((d: any) => d.name === libraryName);

      if (!targetDrive) {
        throw new Error(`Document library '${libraryName}' not found.`);
      }

      const driveId = targetDrive.id;

      // Ensure folder exists
      try {
        await client.api(`/sites/${siteId}/drives/${driveId}/root:/${folderPath}`).get();
      } catch (e: any) {
        if (e.statusCode === 404) {
          // Create folder if it doesn't exist (simplified, assumes parent exists)
          // For deep paths, recursive creation is needed, but assuming single level for now or pre-existing
          // This part can be expanded if needed.
        }
      }

      const uploadUrl = `/sites/${siteId}/drives/${driveId}/root:/${folderPath}/${fileName}:/content`;
      const uploadResponse = await client.api(uploadUrl).put(file);

      setIsLoading(false);
      return uploadResponse.webUrl;
    } catch (error: any) {
      console.error('Upload failed:', error);
      setLastError(error.message);
      setIsLoading(false);
      return null;
    }
  }, [checkMsalAuth, msalInstance]);

  /**
   * Fetches a setting value from the InternalAppSettings list
   * @param key The key (Title) of the setting to fetch
   */
  const getAppSetting = useCallback(async (key: string): Promise<string | null> => {
    // console.log(`🔍 [getAppSetting] Fetching setting for key: ${key}`);
    setLastError(null);

    // If auth not ready, we can't fetch. BUT, we shouldn't block loop if just starting.
    if (!msalInstance) return null;

    try {
      const client = await getGraphClient(msalInstance);
      if (!client) return null;

      const siteDomain = 'scpng1.sharepoint.com';
      const sitePath = '/sites/scpngintranet';

      // We need siteId. Ideally this is cached or passed in contexts, but doing a quick fetch if needed
      // Optimization: hardcode site ID if known, or fetch it once. For now, matching existing pattern.
      // NOTE: In a real optimize scenario, siteId should be in a context.
      const site = await client.api(`/sites/${siteDomain}:${sitePath}`).get();
      const siteId = site.id;

      const response = await client
        .api(`/sites/${siteId}/lists/InternalAppSettings/items`)
        .filter(`fields/Title eq '${key}'`)
        .expand('fields')
        .get();

      if (response.value && response.value.length > 0) {
        const val = response.value[0].fields.Value;
        // console.log(`✅ [getAppSetting] Found value for ${key}`);
        return val;
      } else {
        // console.warn(`⚠️ [getAppSetting] No setting found for key: ${key}`);
        return null;
      }
    } catch (error: any) {
      console.warn(`[getAppSetting] Error fetching key ${key}:`, error);
      // Don't set global error state for config fetch to avoid alerting user unnecessarily
      return null;
    }
  }, [msalInstance]);

  // Initialize client when authentication is ready
  const initializeClient = useCallback(async () => {
    if (isAuthenticated && msalInstance && !client) {
      try {
        const graphClient = await getGraphClient(msalInstance);
        setClient(graphClient);
      } catch (error) {
        console.error('Failed to initialize Graph client:', error);
      }
    }
  }, [isAuthenticated, msalInstance, client]);

  // Auto-initialize client
  if (isAuthenticated && !client && msalInstance) {
    initializeClient();
  }

  return {
    isLoading,
    lastError,
    getOneDriveDocuments: getOneDriveRootDocuments,
    uploadFileToSharePointLibrary,
    uploadBinaryFileToSharePoint,
    graphClient: client,
    client, // Add direct client access
    isAuthenticated, // Add authentication status
    getClient,
    getAppSetting,
  };
};