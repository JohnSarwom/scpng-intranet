import { useState, useCallback } from 'react';
import { useMsal } from '@azure/msal-react';
import { Client } from '@microsoft/microsoft-graph-client';
import { InteractionStatus, InteractionRequiredAuthError } from '@azure/msal-browser';
import { toast } from 'sonner';

export const useSharePointUpload = () => {
  const { instance: msalInstance, inProgress } = useMsal();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAccessToken = useCallback(async () => {
    if (inProgress !== InteractionStatus.None) {
      throw new Error('MSAL interaction is already in progress.');
    }

    if (!msalInstance) {
      throw new Error('MSAL instance not available.');
    }

    const activeAccount = msalInstance.getActiveAccount() || msalInstance.getAllAccounts()[0];
    if (!activeAccount) {
      throw new Error('No active MSAL account found.');
    }

    const scopes = ['Sites.ReadWrite.All', 'Files.ReadWrite.All'];

    try {
      const response = await msalInstance.acquireTokenSilent({
        scopes,
        account: activeAccount,
      });
      return response.accessToken;
    } catch (e) {
      if (e instanceof InteractionRequiredAuthError) {
        const response = await msalInstance.acquireTokenPopup({ scopes });
        return response.accessToken;
      }
      throw e;
    }
  }, [msalInstance, inProgress]);

  const getClient = useCallback(async () => {
    try {
      const accessToken = await getAccessToken();
      return Client.init({
        authProvider: (done) => {
          done(null, accessToken);
        },
      });
    } catch (e: any) {
      setError(`Failed to initialize Microsoft Graph client: ${e.message}`);
      toast.error(`Failed to initialize Microsoft Graph client: ${e.message}`);
      return null;
    }
  }, [getAccessToken]);

  const uploadFile = useCallback(
    async (
      file: File,
      sitePath: string, // e.g., "/sites/scpngintranet"
      libraryName: string, // e.g., "Asset Images" or "Gallery Photos"
      targetFolder?: string // Optional: subfolder within the library
    ): Promise<string | null> => {
      setIsLoading(true);
      setError(null);

      const client = await getClient();
      if (!client) {
        setIsLoading(false);
        return null;
      }

      try {
        // 1. Get Site ID
        const site = await client.api(`/sites/scpng1.sharepoint.com:${sitePath}`).get();
        if (!site || !site.id) {
          throw new Error(`Site not found at scpng1.sharepoint.com:${sitePath}`);
        }
        const siteId = site.id;

        // 2. Get Drive ID for the Document Library
        const drives = await client.api(`/sites/${siteId}/drives`).get();
        const libraryDrive = drives.value.find((d: any) => d.name === libraryName);
        if (!libraryDrive || !libraryDrive.id) {
          throw new Error(`Document library '${libraryName}' not found in site ${sitePath}`);
        }
        const driveId = libraryDrive.id;

        // 3. Construct the upload path
        let uploadPath = `/drives/${driveId}/root:`;
        if (targetFolder) {
          const cleanFolderPath = targetFolder.replace(/^\/+|\/+$/g, '');
          if (cleanFolderPath) {
            uploadPath += `/${encodeURIComponent(cleanFolderPath)}`;
          }
        }
        uploadPath += `/${encodeURIComponent(file.name)}:/content`;

        // 4. Upload the file
        const response = await client.api(uploadPath)
          .header('Content-Type', file.type || 'application/octet-stream')
          .put(file);

        if (response && response.webUrl) {
          toast.success(`File '${file.name}' uploaded successfully.`);
          return response.webUrl;
        } else {
          throw new Error('Upload completed but no webUrl was returned.');
        }
      } catch (e: any) {
        setError(`Upload failed: ${e.message}`);
        toast.error(`Upload failed: ${e.message}`);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [getClient]
  );

  const addSharePointListItem = useCallback(
    async (
      sitePath: string, // e.g., "/sites/scpngintranet"
      listName: string, // e.g., "TestformSubmission"
      itemData: { [key: string]: any } // e.g., { Name: 'John Doe', Email: 'john@example.com' }
    ): Promise<any | null> => {
      setIsLoading(true);
      setError(null);

      const client = await getClient();
      if (!client) {
        setIsLoading(false);
        return null;
      }

      try {
        // 1. Get Site ID
        const site = await client.api(`/sites/scpng1.sharepoint.com:${sitePath}`).get();
        if (!site || !site.id) {
          throw new Error(`Site not found at scpng1.sharepoint.com:${sitePath}`);
        }
        const siteId = site.id;

        // 2. Get List ID
        const lists = await client.api(`/sites/${siteId}/lists`).filter(`displayName eq '${listName}'`).get();
        const list = lists.value[0];
        if (!list || !list.id) {
          throw new Error(`List '${listName}' not found in site ${sitePath}`);
        }
        const listId = list.id;

        // 3. Create the list item
        const listItem = {
          fields: itemData,
        };

        const response = await client.api(`/sites/${siteId}/lists/${listId}/items`).post(listItem);

        if (response && response.id) {
          toast.success(`Item created successfully in '${listName}'.`);
          return response;
        } else {
          throw new Error('Item creation completed but no ID was returned.');
        }
      } catch (e: any) {
        setError(`Failed to create list item: ${e.message}`);
        toast.error(`Failed to create list item: ${e.message}`);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [getClient]
  );

  return { uploadFile, addSharePointListItem, isLoading, error };
};
