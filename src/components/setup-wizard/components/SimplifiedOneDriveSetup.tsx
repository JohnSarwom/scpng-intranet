import React, { useState, useEffect, useCallback } from 'react';
import { PublicClientApplication, InteractionRequiredAuthError, AccountInfo } from '@azure/msal-browser';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { OneDriveConfig } from '../types';
import { Loader2, Folder, FolderPlus, RefreshCw, AlertTriangle, Trash2, ArrowUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import microsoftAuthConfig from '@/config/microsoft-auth'; // Import config

// --- Types --- (Mostly internal to this component now)
interface OneDriveItem {
  id: string;
  name: string;
  webUrl: string;
  folder?: {}; // Indicates it's a folder
  parentReference?: { path: string; id?: string }; // Ensure parentReference might have id
}

interface OneDriveFolder {
  id: string;
  name: string;
  isFolder: true;
  path?: string;
  parentId?: string; // Add parentId for navigation
}

interface FolderPathItem {
    id: string;
    name: string;
}

// Props definition remains the same
interface SimplifiedOneDriveSetupProps {
  onComplete: (config: OneDriveConfig) => void;
}

// --- MSAL Configuration --- (Directly from config file)
const msalConfig = {
  auth: {
    clientId: microsoftAuthConfig.clientId,
    authority: microsoftAuthConfig.authorityUrl,
    redirectUri: typeof window !== 'undefined' ? window.location.origin + '/' : "https://unitopia-hub.vercel.app/", // Use dynamic origin with trailing slash
  },
  cache: {
    cacheLocation: 'sessionStorage', // or 'localStorage'
    storeAuthStateInCookie: false,
  }
};

// Define the scopes needed for folder operations
const loginRequest = {
  scopes: ["User.Read", "Files.ReadWrite.All"] // Keep scopes minimal for this step
};

// --- Component --- 
const SimplifiedOneDriveSetup: React.FC<SimplifiedOneDriveSetupProps> = ({ onComplete }) => {
  const { toast } = useToast();

  // --- State for MSAL and Component Logic ---
  const [msalInstance, setMsalInstance] = useState<PublicClientApplication | null>(null);
  const [account, setAccount] = useState<AccountInfo | null>(null); // Store the logged-in account
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Start loading until MSAL initializes
  const [error, setError] = useState<string | null>(null);
  const [folders, setFolders] = useState<OneDriveFolder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<OneDriveFolder | null>(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [isDeletingFolderId, setIsDeletingFolderId] = useState<string | null>(null);
  const [isAuthInProgress, setIsAuthInProgress] = useState(false); // Prevent overlapping popups
  // State for navigation
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null); // null for root
  const [folderPath, setFolderPath] = useState<FolderPathItem[]>([]); // Breadcrumbs

  // --- MSAL Initialization Effect ---
  useEffect(() => {
    console.log("[SimplifiedOneDriveSetup] Initializing MSAL...");
    const instance = new PublicClientApplication(msalConfig);
    instance.initialize().then(() => {
      setMsalInstance(instance);
      // Check if already logged in
      const currentAccounts = instance.getAllAccounts();
      if (currentAccounts.length > 0) {
        console.log("[SimplifiedOneDriveSetup] User already logged in.");
        setAccount(currentAccounts[0]);
        setIsAuthenticated(true);
        // Fetch root folders on initial load if authenticated
        fetchFolders(null, instance, currentAccounts[0]);
      } else {
        console.log("[SimplifiedOneDriveSetup] No existing login found.");
        setIsLoading(false); // Stop loading if not logged in
      }
    }).catch(err => {
      console.error("[SimplifiedOneDriveSetup] MSAL initialization error:", err);
      setError(`MSAL initialization failed: ${err.message}`);
      setIsLoading(false);
    });

    // Handle redirect promise if needed (though we primarily use popup)
    instance.handleRedirectPromise().catch(err => {
        console.error("[SimplifiedOneDriveSetup] Redirect promise error:", err);
        setError(`Authentication redirect failed: ${err.message}`);
        setIsLoading(false);
        setIsAuthInProgress(false);
    });

  }, []); // Run only once on mount

  // --- Helper: Get Access Token --- 
  const getAccessToken = useCallback(async (instance: PublicClientApplication, currentAccount: AccountInfo): Promise<string | null> => {
    if (!instance || !currentAccount) return null;

    try {
      const response = await instance.acquireTokenSilent({
        ...loginRequest,
        account: currentAccount
      });
      return response.accessToken;
    } catch (error) {
      if (error instanceof InteractionRequiredAuthError) {
        // Fallback to popup if interaction required
        if (isAuthInProgress) {
             console.warn("[SimplifiedOneDriveSetup] Token acquisition popup already in progress.");
             return null; 
        }
        setIsAuthInProgress(true);
        try {
          const response = await instance.acquireTokenPopup(loginRequest);
          setIsAuthInProgress(false);
          return response.accessToken;
        } catch (popupError) {
          setIsAuthInProgress(false);
          console.error("[SimplifiedOneDriveSetup] Popup token acquisition failed:", popupError);
          setError(`Failed to get token interactively: ${popupError.message}`);
          return null;
        }
      } else {
        console.error("[SimplifiedOneDriveSetup] Silent token acquisition failed:", error);
        setError(`Failed to get token: ${error.message}`);
        return null;
      }
    }
  }, [isAuthInProgress]);

  // --- Core Logic Callbacks ---

  // Fetch folders (renamed and modified)
  const fetchFolders = useCallback(async (folderId: string | null = currentFolderId, instance: PublicClientApplication | null = msalInstance, currentAccount: AccountInfo | null = account) => {
    if (!instance || !currentAccount) {
      setError("Not authenticated or MSAL not ready.");
      setIsLoading(false);
      return;
    }
    const targetFolderDisplay = folderId ? `folder ID ${folderId}` : "root folder";
    console.log(`[SimplifiedOneDriveSetup] Fetching folders for ${targetFolderDisplay}...`);
    setIsLoading(true);
    setError(null);
    // Clear selection when navigating
    setSelectedFolder(null);

    const accessToken = await getAccessToken(instance, currentAccount);
    if (!accessToken) {
      setIsLoading(false);
      return;
    }

    // Determine the correct Graph API endpoint
    let endpoint = 'https://graph.microsoft.com/v1.0/me/drive/';
    if (folderId) {
      endpoint += `items/${folderId}/children?$filter=folder ne null`;
    } else {
      endpoint += 'root/children?$filter=folder ne null';
    }
    console.log(`[SimplifiedOneDriveSetup] Using Graph Endpoint: ${endpoint}`);

    try {
      const response = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      if (!response.ok) {
        throw new Error(`Graph API error fetching folders: ${response.statusText}`);
      }

      const data = await response.json();
      const oneDriveFolders: OneDriveFolder[] = (data.value || [])
        .filter((item: OneDriveItem) => item.folder)
        .map((item: OneDriveItem) => ({
          id: item.id,
          name: item.name,
          isFolder: true,
          path: item.parentReference?.path,
          parentId: item.parentReference?.id // Store parent ID if available
        }));

      console.log(`[SimplifiedOneDriveSetup] Found ${oneDriveFolders.length} folders in ${targetFolderDisplay}.`);
      setFolders(oneDriveFolders);
      // Update currentFolderId state AFTER successful fetch
      setCurrentFolderId(folderId);

    } catch (err) {
      console.error("[SimplifiedOneDriveSetup] Error fetching folders:", err);
      setError(`Failed to fetch folders: ${err.message}`);
      setFolders([]);
      // Don't reset currentFolderId on error, allow user to retry or navigate up
    } finally {
      setIsLoading(false);
    }
  }, [msalInstance, account, currentFolderId, getAccessToken]);

  // Handle authentication button click
  const handleAuthenticate = useCallback(async () => {
    if (!msalInstance || isAuthInProgress) return;

    console.log("[SimplifiedOneDriveSetup] Initiating login...");
    setIsLoading(true);
    setIsAuthInProgress(true);
    setError(null);

    try {
      const loginResponse = await msalInstance.loginPopup(loginRequest);
      if (loginResponse && loginResponse.account) {
        console.log("[SimplifiedOneDriveSetup] Login successful.");
        setAccount(loginResponse.account);
        setIsAuthenticated(true);
        setFolderPath([]); // Reset path on new login
        setCurrentFolderId(null); // Ensure we start at root
        await fetchFolders(null, msalInstance, loginResponse.account); // Fetch root folders
      } else {
        // User might have closed popup
        console.log("[SimplifiedOneDriveSetup] Login popup closed or no account returned.");
        // Don't set error if user just closed it
      }
    } catch (err) {
      console.error("[SimplifiedOneDriveSetup] Login error:", err);
      // Avoid setting error if it's just interaction in progress
      if (!(err.name === "BrowserAuthError" && err.message.includes("interaction_in_progress"))) {
           setError(`Authentication failed: ${err.message}`);
           toast({ title: "Authentication Failed", description: err.message, variant: "destructive" });
      }
    } finally {
      setIsAuthInProgress(false);
      // Don't set isLoading false here if fetchFolders was called
      if (!account) setIsLoading(false); 
    }
  }, [msalInstance, isAuthInProgress, fetchFolders, toast]);

  // Handle create folder button click
  const handleCreateFolder = useCallback(async () => {
    // Use currentFolderId for parent context
    const parentFolderId = currentFolderId;
    const parentFolderName = folderPath.length > 0 ? folderPath[folderPath.length - 1].name : "Root";

    if (!msalInstance || !account || !newFolderName.trim()) return;

    console.log(`[SimplifiedOneDriveSetup] Creating folder "${newFolderName}" in ${parentFolderName} (ID: ${parentFolderId || 'root'})`);
    setIsCreatingFolder(true);
    setError(null);

    const accessToken = await getAccessToken(msalInstance, account);
    if (!accessToken) {
      setIsCreatingFolder(false);
      return;
    }

    // Determine endpoint based on currentFolderId
    let endpoint = 'https://graph.microsoft.com/v1.0/me/drive/';
    if (parentFolderId) {
        endpoint += `items/${parentFolderId}/children`;
    } else {
        endpoint += 'root/children';
    }

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: newFolderName.trim(),
            folder: {},
            '@microsoft.graph.conflictBehavior': 'rename'
        })
      });

      if (!response.ok) {
        throw new Error(`Graph API error creating folder: ${response.statusText}`);
      }

      const newFolderData = await response.json();
      const createdFolder: OneDriveFolder = {
          id: newFolderData.id,
          name: newFolderData.name,
          isFolder: true,
          path: newFolderData.parentReference?.path,
          parentId: newFolderData.parentReference?.id
      };

      console.log("[SimplifiedOneDriveSetup] Folder created:", createdFolder);
      toast({ title: `Folder "${createdFolder.name}" created in ${parentFolderName}` });
      setNewFolderName('');
      await fetchFolders(parentFolderId); // Refresh current folder view
      // Don't auto-select when creating in a subfolder, maybe?
      // setSelectedFolder(createdFolder); // Optional: Auto-select

    } catch (err) {
      console.error("[SimplifiedOneDriveSetup] Error creating folder:", err);
      setError(`Failed to create folder: ${err.message}`);
      toast({ title: "Folder Creation Failed", description: err.message, variant: "destructive" });
    } finally {
      setIsCreatingFolder(false);
    }
  }, [msalInstance, account, newFolderName, currentFolderId, folderPath, getAccessToken, fetchFolders, toast]);

  // Handle delete folder button click
  const handleDeleteFolder = useCallback(async (folderId: string, folderName: string) => {
    if (!msalInstance || !account)
        return;
    if (!window.confirm(`Are you sure you want to delete "${folderName}"?`))
        return;
    
    console.log(`[SimplifiedOneDriveSetup] Deleting folder: ${folderName} (ID: ${folderId})`);
    setIsDeletingFolderId(folderId);
    setError(null);

    const accessToken = await getAccessToken(msalInstance, account);
    if (!accessToken) {
        setIsDeletingFolderId(null);
        return;
    }

    try {
      const response = await fetch(
        `https://graph.microsoft.com/v1.0/me/drive/items/${folderId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      if (!response.ok && response.status !== 204) { // 204 No Content is success for DELETE
        throw new Error(`Graph API error deleting folder: ${response.statusText}`);
      }

      console.log(`[SimplifiedOneDriveSetup] Folder ${folderName} deleted.`);
      toast({ title: `Folder "${folderName}" deleted` });
      if (selectedFolder?.id === folderId) {
        setSelectedFolder(null);
      }
      await fetchFolders(currentFolderId); // Refresh CURRENT folder view

    } catch (err) {
      console.error("[SimplifiedOneDriveSetup] Error deleting folder:", err);
      setError(`Failed to delete folder: ${err.message}`);
      toast({ title: "Folder Deletion Failed", description: err.message, variant: "destructive" });
    } finally {
      setIsDeletingFolderId(null);
    }
  }, [msalInstance, account, selectedFolder, currentFolderId, getAccessToken, fetchFolders, toast]);

  // --- Navigation Callbacks ---

  // Navigate into a folder (on double-click)
  const navigateToFolder = useCallback((folder: OneDriveFolder) => {
      if (!folder || !folder.id) return;
      console.log(`[SimplifiedOneDriveSetup] Navigating into: ${folder.name} (ID: ${folder.id})`);
      // Update breadcrumb path
      setFolderPath(prevPath => [...prevPath, { id: folder.id, name: folder.name }]);
      // Fetch contents of the new folder
      fetchFolders(folder.id);
  }, [fetchFolders]);

  // Navigate up one level or to a specific breadcrumb item
  const navigateToPathIndex = useCallback((index: number) => {
    if (index < -1) return; // -1 signifies root

    let targetFolderId: string | null = null;
    let newPath: FolderPathItem[] = [];

    if (index === -1) { // Navigate to Root
        console.log("[SimplifiedOneDriveSetup] Navigating to Root");
        targetFolderId = null;
        newPath = [];
    } else if (index < folderPath.length) { // Navigate to specific parent
        console.log(`[SimplifiedOneDriveSetup] Navigating to path index ${index}: ${folderPath[index].name}`);
        targetFolderId = folderPath[index].id;
        newPath = folderPath.slice(0, index + 1);
    } else {
        console.warn("[SimplifiedOneDriveSetup] Invalid path index for navigation:", index);
        return;
    }

    setFolderPath(newPath);
    fetchFolders(targetFolderId);

  }, [folderPath, fetchFolders]);

  // Handle confirm selection button click
  const handleCompleteSelection = useCallback(() => {
    // Selection confirms the SINGLE-CLICKED folder, regardless of current view
    if (!selectedFolder) {
      toast({ title: "Please select a folder first", variant: "destructive" });
      return;
    }
    console.log("[SimplifiedOneDriveSetup] Confirming selection:", selectedFolder);

    // Construct the full path for the selected folder based on current breadcrumbs
    // This assumes the selected folder is within the currently viewed folder or is the current folder itself
    // A more robust approach might store the full path with the folder item itself when fetched
    let constructedPath = '/';
    if (folderPath.length > 0) {
        constructedPath += folderPath.map(p => p.name).join('/') + '/';
    }
    // Check if the selected folder is the *current* folder being viewed
    const currentViewedFolder = folderPath.length > 0 ? folderPath[folderPath.length -1] : null;
    let finalFolderName = selectedFolder.name;
    // If selected folder IS the currently viewed folder, its name is already last in path
    if (currentViewedFolder && currentViewedFolder.id === selectedFolder.id) {
        finalFolderName = ''; // Avoid duplicating name in path
        constructedPath = '/' + folderPath.map(p => p.name).join('/');
    } else {
        constructedPath += selectedFolder.name;
    }

    console.log("[SimplifiedOneDriveSetup] Constructed Path for selected folder:", constructedPath);

    onComplete({
      folderId: selectedFolder.id,
      folderName: selectedFolder.name,
      path: constructedPath, // Use the constructed path
      isTemporary: false,
    });
  }, [selectedFolder, folderPath, onComplete, toast]);

  // Handle use local storage button click
  const continueWithLocalStorage = useCallback(() => {
    const tempFolderId = `local-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    toast({
      title: "Using Local Storage",
      description: "Your data will be stored locally for this session.",
      duration: 3000
    });
    onComplete({
        path: "Local Storage",
        folderId: tempFolderId,
        folderName: "Local Storage",
        isTemporary: true
    });
  }, [onComplete, toast]);

  // --- Render Logic ---
  const effectiveIsLoading = isLoading || isAuthInProgress;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>OneDrive Folder Selection</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Authentication Section */}
          {!isAuthenticated && !effectiveIsLoading && (
            <div className="flex flex-col items-center space-y-4 p-4 border rounded-lg">
              <p>Connect to your Microsoft account to select or create a OneDrive folder.</p>
              <Button onClick={handleAuthenticate} disabled={effectiveIsLoading}>
                {effectiveIsLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Connect to OneDrive
              </Button>
            </div>
          )}

          {/* Loading Indicator */} 
          {effectiveIsLoading && (
             <div className="flex items-center justify-center space-x-2 text-muted-foreground">
               <Loader2 className="h-5 w-5 animate-spin" />
               <span>{isLoading && !account ? 'Initializing...' : isAuthInProgress ? 'Processing Authentication...' : 'Loading OneDrive data...'}</span>
             </div>
          )}

           {/* Error Display */} 
           {error && !effectiveIsLoading && (
             <Alert variant="destructive">
               <AlertTriangle className="h-4 w-4" />
               <AlertTitle>OneDrive Error</AlertTitle>
               <AlertDescription>
                 {error}
                 <div className="mt-2">
                    <Button variant="outline" size="sm" onClick={() => fetchFolders()} disabled={effectiveIsLoading}>
                       Retry
                    </Button>
                 </div>
               </AlertDescription>
             </Alert>
           )}

          {/* Folder Selection and Creation (if authenticated) */} 
          {isAuthenticated && !effectiveIsLoading && !error && (
            <div className="space-y-4">
              {/* Navigation: Up Button and Breadcrumbs */} 
              <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                      {currentFolderId && (
                          <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigateToPathIndex(folderPath.length - 2)} // Go to parent (index before last)
                              disabled={effectiveIsLoading}
                              title="Go up one level"
                          >
                              <ArrowUp className="h-4 w-4 mr-1" /> Up
                          </Button>
                      )}
                      <Button variant="link" size="sm" className={`p-1 h-auto ${currentFolderId === null ? 'font-bold text-primary' : ''}`} onClick={() => navigateToPathIndex(-1)} disabled={effectiveIsLoading}>Root</Button>
                      {folderPath.map((folder, index) => (
                          <React.Fragment key={folder.id}>
                              <span className="mx-1">/</span>
                              <Button
                                  variant="link"
                                  size="sm"
                                  className={`p-1 h-auto ${index === folderPath.length - 1 ? 'font-bold text-primary' : ''}`}
                                  onClick={() => navigateToPathIndex(index)}
                                  disabled={effectiveIsLoading || index === folderPath.length - 1} // Disable click on current folder
                                  title={folder.name}
                              >
                                  <span className="truncate max-w-[100px]">{folder.name}</span>
                              </Button>
                          </React.Fragment>
                      ))}
                  </div>
                  {/* Refresh Button */} 
                  <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fetchFolders()} // Refresh current folder
                      disabled={effectiveIsLoading}
                      title="Refresh current folder"
                  >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Refresh
                  </Button>
              </div>

              {/* Folder List */} 
              <div className="border rounded-md max-h-60 overflow-y-auto">
                {folders.length === 0 && (
                  <p className="p-4 text-sm text-muted-foreground text-center italic">No folders found in this location.</p>
                )}
                {folders.map((folder) => (
                  <div
                    key={folder.id}
                    className={`flex items-center justify-between p-3 cursor-pointer hover:bg-gray-100 ${selectedFolder?.id === folder.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}
                    onClick={() => setSelectedFolder(folder)} // Single click selects
                    onDoubleClick={() => navigateToFolder(folder)} // Double click navigates
                    title={`Double-click to open ${folder.name}`}
                  >
                    <div className="flex items-center space-x-2 flex-grow min-w-0">
                      <Folder className="h-5 w-5 text-yellow-500 flex-shrink-0" />
                      <span className="font-medium truncate" title={folder.name}>{folder.name}</span>
                    </div>
                    <Button
                       variant="ghost"
                       size="icon"
                       className="text-gray-500 hover:text-red-500 flex-shrink-0 ml-2"
                       onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteFolder(folder.id, folder.name);
                       }}
                       disabled={isDeletingFolderId === folder.id}
                       title={`Delete folder "${folder.name}"`}
                    >
                       {isDeletingFolderId === folder.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    </Button>
                  </div>
                ))}
              </div>

              {/* Create New Folder */} 
              <div>
                <label htmlFor="new-folder-name" className="block text-sm font-medium text-gray-700 mb-1">
                    Create New Folder in "{folderPath.length > 0 ? folderPath[folderPath.length - 1].name : 'Root'}"
                </label>
                <div className="flex gap-2">
                  <Input
                    id="new-folder-name"
                    type="text"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    placeholder="Enter new folder name"
                    className="flex-grow"
                    disabled={isCreatingFolder}
                  />
                  <Button
                    onClick={handleCreateFolder}
                    disabled={effectiveIsLoading || isCreatingFolder || !newFolderName.trim()}
                    className="whitespace-nowrap"
                  >
                    {isCreatingFolder ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FolderPlus className="mr-2 h-4 w-4" />}
                    Create Folder
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */} 
      <div className="flex justify-end space-x-4">
         <Button
            variant="outline"
            onClick={continueWithLocalStorage}
            disabled={effectiveIsLoading}
         >
            Use Local Storage Instead
         </Button>
         {isAuthenticated && (
           <Button
             onClick={handleCompleteSelection}
             disabled={!selectedFolder || effectiveIsLoading}
             className="bg-blue-600 hover:bg-blue-700 text-white"
           >
             Confirm Selection
           </Button>
         )}
      </div>
    </div>
  );
};

export default SimplifiedOneDriveSetup;