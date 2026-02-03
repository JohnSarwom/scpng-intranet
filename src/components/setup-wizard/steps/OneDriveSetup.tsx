import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { 
  Cloud, FolderPlus, FolderOpen, ChevronLeft, ChevronRight, 
  Folder, Edit2, Loader2, AlertCircle, ChevronDown, RefreshCw, 
  Plus, Edit, Trash, X, AlertTriangle, Database, Home 
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { useMicrosoftGraph, Document } from '@/hooks/useMicrosoftGraph';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

interface OneDriveSetupProps {
  onComplete: (config: any) => void;
}

export const OneDriveSetup: React.FC<OneDriveSetupProps> = ({ onComplete }) => {
  const { toast: useToastToast } = useToast();
  const { isAuthenticated, loginWithMicrosoft, msGraphConfig } = useAuth();
  const { 
    getOneDriveDocuments, 
    getFolderContents, 
    createFolder, 
    renameFolder, 
    deleteFolder,
    lastError,
    getAuthStatus
  } = useMicrosoftGraph();
  
  const [documents, setDocuments] = useState<Document[]>([]);
  const [currentPath, setCurrentPath] = useState<{ id: string; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<Document | null>(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [isRenamingFolder, setIsRenamingFolder] = useState(false);
  const [folderToRename, setFolderToRename] = useState<Document | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [showDiagnostics, setShowDiagnostics] = useState(true);
  const [authStatus, setAuthStatus] = useState<any>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [folderToDelete, setFolderToDelete] = useState<Document | null>(null);
  const [isDeletingFolder, setIsDeletingFolder] = useState(false);
  const [connectionRetryCount, setConnectionRetryCount] = useState(0);
  const [skipOneDriveAuth, setSkipOneDriveAuth] = useState(false);
  const [debugMode, setDebugMode] = useState(true);
  const [errorDetails, setErrorDetails] = useState<any>(null);
  const [fetchCount, setFetchCount] = useState(0);
  const [shouldStopFetching, setShouldStopFetching] = useState(false);
  const fetchTimeoutRef = useRef<any>(null);
  const fetchAttemptsRef = useRef(0);
  const hasInitializedRef = useRef(false);
  const [folderContents, setFolderContents] = useState<Document[]>([]);
  const [folderError, setFolderError] = useState<string | null>(null);
  const [isLoadingContents, setIsLoadingContents] = useState(false);
  const [createFolderError, setCreateFolderError] = useState<string | null>(null);

  useEffect(() => {
    if (!hasInitializedRef.current) {
      hasInitializedRef.current = true;
      updateAuthStatus();
      
      // Immediately attempt to authenticate when component loads
      if (!isAuthenticated && !isAuthenticating) {
        handleAuthenticate();
      }
    }
  }, []);

  useEffect(() => {
    const status = updateAuthStatus();
    if (!isAuthenticated && !isAuthenticating && hasInitializedRef.current) {
      const timer = setTimeout(() => {
        if (!isAuthenticated && !isAuthenticating) {
          console.log('Auto-triggering authentication...');
          handleAuthenticate();
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, isAuthenticating]);

  const updateAuthStatus = useCallback(() => {
    const status = getAuthStatus();
    setAuthStatus(status);
    return status;
  }, [getAuthStatus]);
  
  const handleAuthenticate = useCallback(async () => {
    setIsAuthenticating(true);
    setAuthError(null);
    setConnectionRetryCount(prev => prev + 1);
    setErrorDetails(null);
    
    try {
      console.log('[DEBUG] Starting Microsoft authentication...');
      console.log('[DEBUG] Auth config:', {
        msGraphConfig,
        window: typeof window !== 'undefined' ? 'exists' : 'not defined',
        msalInstance: typeof window !== 'undefined' && window.msalInstance ? 'exists' : 'not defined',
        origin: typeof window !== 'undefined' ? window.location.origin : 'unknown'
      });
      
      await loginWithMicrosoft();
      console.log('[DEBUG] Authentication initiated successfully via redirect');
      
      const status = updateAuthStatus();
      console.log('[DEBUG] Post-authentication status:', status);
      
      // Immediately try to fetch folders after authentication
      try {
        console.log('[DEBUG] Account found, fetching OneDrive documents');
        setIsLoading(true);
        const oneDriveDocs = await getOneDriveDocuments();
        
        if (oneDriveDocs) {
          console.log('[DEBUG] Post-auth document fetch successful:', oneDriveDocs);
          // Initialize both document lists - regular and folder contents
          setDocuments(oneDriveDocs);
          setFolderContents(oneDriveDocs);
          
          // Set folder selection mode active immediately after successful authentication
          if (oneDriveDocs.length > 0) {
            const folders = oneDriveDocs.filter(doc => doc.isFolder);
            if (folders.length > 0) {
              console.log('[DEBUG] Found folders, showing folder selection UI');
            } else {
              console.log('[DEBUG] No folders found, user will need to create one');
            }
          }
        } else {
          console.log('[DEBUG] getOneDriveDocuments returned null');
          setErrorDetails({
            type: 'document_fetch_null',
            status,
            timestamp: new Date().toISOString()
          });
          setAuthError("Failed to retrieve OneDrive documents (null response)");
        }
      } catch (fetchError) {
        console.error('[DEBUG] Post-auth document fetch error:', fetchError);
        setErrorDetails({
          type: 'document_fetch_error',
          error: {
            message: fetchError.message,
            stack: fetchError.stack,
            name: fetchError.name
          },
          status,
          timestamp: new Date().toISOString()
        });
        setAuthError(`Error fetching documents: ${fetchError.message}`);
      } finally {
        setIsLoading(false);
      }
    } catch (error) {
      console.error('[DEBUG] Authentication initiation error:', error);
      const errorMsg = error.message || 'Unknown auth error';
      setAuthError(`Authentication failed: ${errorMsg}`);
      setErrorDetails({
        type: 'auth_initiation_error',
        error: {
          message: error.message,
          stack: error.stack,
          name: error.name
        },
        timestamp: new Date().toISOString()
      });
      toast.error('Failed to connect to OneDrive. Please try again.');
    } finally {
      setTimeout(() => {
        setIsAuthenticating(false);
      }, 1500);
    }
  }, [loginWithMicrosoft, updateAuthStatus, getOneDriveDocuments, msGraphConfig]);

  const fetchDocuments = useCallback(async () => {
    if (!isAuthenticated) {
      console.log('fetchDocuments: Not authenticated, returning.');
      setAuthError('Not authenticated. Please sign in with Microsoft first.');
      return;
    }
    
    if (isLoading) {
      console.log('fetchDocuments: Already loading, skip duplicate request');
      return;
    }
    
    console.log('fetchDocuments: Fetching...');
    setIsLoading(true); 
    setAuthError(null);
    
    try {
      const oneDriveDocs = await getOneDriveDocuments();
      if (oneDriveDocs) {
        console.log('fetchDocuments: Successfully fetched documents.', oneDriveDocs);
        setDocuments(oneDriveDocs);
        setRetryCount(0);
        setShouldStopFetching(true);
      } else {
        console.log('fetchDocuments: getOneDriveDocuments returned null (likely an error occurred).');
        setAuthError("Couldn't retrieve OneDrive files. Please try to authenticate again.");
        
        if (retryCount < 1) {
          console.log(`Retry attempt ${retryCount + 1}/1`);
          setRetryCount(prev => prev + 1);
          // Don't auto-retry, let the user click the retry button
        } else {
          console.log('Max retry count reached, stopping automatic fetch attempts');
          setShouldStopFetching(true);
        }
      }
    } catch (error) {
      console.error('fetchDocuments: Error caught:', error);
      setAuthError(`Failed to fetch documents: ${error.message}`);
      setShouldStopFetching(true);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, getOneDriveDocuments, retryCount, isLoading]);

  useEffect(() => {
    // Only check auth status, don't do auto-fetching to avoid loops
    const status = updateAuthStatus();
    console.log('Auth status updated:', status);
    
    // Do not auto-fetch to avoid potential infinite loops
    // The user will need to click the Connect/Retry button
    
    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, [updateAuthStatus]);

  const handleFolderClick = useCallback(async (folder: Document) => {
    if (!folder.isFolder) return;
    
    setIsLoading(true);
    try {
      console.log(`Navigating to folder: ${folder.name} (${folder.id})`);
      const folderContents = await getFolderContents(folder.id, 'OneDrive');
      console.log('Folder contents:', folderContents);
      if (folderContents) {
        setDocuments(folderContents);
        setCurrentPath([...currentPath, { id: folder.id, name: folder.name }]);
        setSelectedFolder(folder);
      }
    } catch (error) {
      console.error('Error navigating to folder:', error);
      toast.error('Failed to navigate to folder');
    } finally {
      setIsLoading(false);
    }
  }, [currentPath, getFolderContents]);

  const handleNavigateUp = async () => {
    if (currentPath.length === 0) {
      await fetchDocuments();
      setCurrentPath([]);
      setSelectedFolder(null);
      return;
    }

    const newPath = [...currentPath];
    newPath.pop();
    setCurrentPath(newPath);

    if (newPath.length === 0) {
      await fetchDocuments();
      setSelectedFolder(null);
    } else {
      const parentFolder = newPath[newPath.length - 1];
      setIsLoading(true);
      try {
        const folderContents = await getFolderContents(parentFolder.id, 'OneDrive');
        if (folderContents) {
          setDocuments(folderContents);
          setSelectedFolder({
            id: parentFolder.id,
            name: parentFolder.name,
            url: '',
            lastModified: new Date().toISOString(),
            size: 0,
            isFolder: true,
            source: 'OneDrive'
          });
        }
      } catch (error) {
        console.error('Error navigating up:', error);
        toast.error('Failed to navigate up');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim() || isCreatingFolder) return;
    
    try {
      setIsCreatingFolder(true);
      setCreateFolderError(null);
      
      const currentFolderId = currentPath.length > 0 
        ? currentPath[currentPath.length - 1].id 
        : undefined; // undefined means create in root
      
      const folder = await createFolder(newFolderName, currentFolderId);
      
      if (folder) {
        toast.success(`Folder created: ${folder.name}`);
        
        // Add the new folder to the current folder contents
        setFolderContents(prev => [...prev, folder]);
        
        // Clear the input
        setNewFolderName('');
        
        // Auto-select the created folder
        setSelectedFolder(folder);
        
        // Also select this path for onComplete
        const completePath = [...currentPath, folder];
        const pathString = completePath.map(f => f.name).join('/');
        
        // Call onComplete with the selected folder
        onComplete({
          folderId: folder.id,
          path: pathString,
          folderName: folder.name
        });
      } else {
        throw new Error('Failed to create folder');
      }
    } catch (error) {
      console.error('Error creating folder:', error);
      setCreateFolderError(`Failed to create folder: ${error.message}`);
      toast.error(`Failed to create folder: ${error.message}`);
    } finally {
      setIsCreatingFolder(false);
    }
  };

  const handleRenameFolder = async () => {
    if (!newFolderName.trim() || !folderToRename) {
      toast.error('Please enter a folder name');
      return;
    }

    try {
      setIsLoading(true);
      const renamedFolder = await renameFolder(folderToRename.id, newFolderName);
      if (renamedFolder) {
        toast.success('Folder renamed successfully');
        setNewFolderName('');
        setIsRenamingFolder(false);
        setFolderToRename(null);
        if (selectedFolder) {
          const contents = await getFolderContents(selectedFolder.id, 'OneDrive');
          if (contents) {
            setDocuments(contents);
          }
        } else {
          await fetchDocuments();
        }
      }
    } catch (error) {
      console.error('Error renaming folder:', error);
      toast.error('Failed to rename folder');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteFolder = async (folder: Document) => {
    setFolderToDelete(folder);
    setIsDeletingFolder(true);
  };

  const confirmDeleteFolder = async () => {
    if (!folderToDelete) {
      toast.error('No folder selected for deletion');
      return;
    }

    try {
      setIsLoading(true);
      const success = await deleteFolder(folderToDelete.id);
      if (success) {
        toast.success('Folder deleted successfully');
        setIsDeletingFolder(false);
        setFolderToDelete(null);
        if (selectedFolder) {
          const contents = await getFolderContents(selectedFolder.id, 'OneDrive');
          if (contents) {
            setDocuments(contents);
          }
        } else {
          await fetchDocuments();
        }
      }
    } catch (error) {
      console.error('Error deleting folder:', error);
      toast.error('Failed to delete folder');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePathSelect = async () => {
    console.log('Continue button clicked');
    console.log('Current state:', {
      selectedFolder,
      isCreatingFolder,
      newFolderName,
      currentPath
    });

    if (isCreatingFolder && newFolderName) {
      console.log('Creating new folder:', newFolderName);
      try {
        setIsLoading(true);
        const parentId = selectedFolder?.id;
        console.log('Creating folder with parent ID:', parentId);
        
        const newFolder = await createFolder(newFolderName, parentId);
        console.log('New folder created:', newFolder);
        
        if (newFolder) {
          console.log('Calling onComplete with new folder');
          toast.success(`Folder created: ${newFolderName}`);
          
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          onComplete({
            path: newFolderName,
            folderId: newFolder.id,
            isNewFolder: true,
            folderName: newFolderName,
          });
          console.log('Successfully completed with new folder');
        } else {
          console.error('createFolder returned null or undefined');
          toast.error('Failed to create folder - no folder ID returned');
        }
      } catch (error) {
        console.error('Error creating folder:', error);
        console.error('Error details:', {
          message: error.message,
          stack: error.stack,
          name: error.name
        });
        toast.error('Failed to create folder');
      } finally {
        setIsLoading(false);
      }
    } else if (selectedFolder) {
      console.log('Using existing folder:', selectedFolder);
      try {
        onComplete({
          path: selectedFolder.name,
          folderId: selectedFolder.id,
          isNewFolder: false,
        });
        console.log('Successfully completed with existing folder');
      } catch (error) {
        console.error('Error in onComplete with existing folder:', error);
        toast.error('Failed to proceed with selected folder');
      }
    } else {
      console.warn('Invalid state for folder selection:', {
        selectedFolder,
        isCreatingFolder,
        newFolderName
      });
      toast.error('Please select or create a folder before continuing');
    }
  };

  const handleSkipOneDriveAuth = useCallback(() => {
    setSkipOneDriveAuth(true);
    const tempFolderId = `temp-${Date.now()}`;
    onComplete({
      path: "Temporary Folder",
      folderId: tempFolderId,
      isNewFolder: true,
      isTemporary: true
    });
    toast.warning('Proceeding with temporary setup. Some features may be limited.');
  }, [onComplete]);

  const bypassAuthForTesting = useCallback(() => {
    console.log('[DEBUG] Bypassing Microsoft authentication for testing');
    
    setShouldStopFetching(true);
    
    setAuthError(null);
    setErrorDetails({
      type: 'auth_bypassed',
      timestamp: new Date().toISOString(),
      message: 'Authentication bypassed for testing purposes'
    });
    
    const mockFolders = [
      {
        id: 'mock-folder-1',
        name: 'Mock Folder 1',
        url: '',
        lastModified: new Date().toISOString(),
        size: 0,
        isFolder: true,
        source: 'OneDrive' as const
      },
      {
        id: 'mock-folder-2',
        name: 'Unit Data',
        url: '',
        lastModified: new Date().toISOString(),
        size: 0,
        isFolder: true,
        source: 'OneDrive' as const
      }
    ];
    
    setIsLoading(true);
    setTimeout(() => {
      setDocuments(mockFolders);
      setIsLoading(false);
      toast.success('Successfully connected with mock data');
    }, 500);
    
    const updatedStatus = getAuthStatus();
    console.log('[DEBUG] Bypassed auth, status:', updatedStatus);
  }, [getAuthStatus, toast]);

  const renderDiagnostics = () => {
    const redirectUriWarning = msGraphConfig?.redirectUri !== "https://unitopia-hub.vercel.app/" 
      ? "Warning: Redirect URI doesn't match the one configured in Azure portal (should be https://unitopia-hub.vercel.app/)"
      : null;

    const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'unknown';
    const isOriginMismatch = currentOrigin !== "https://unitopia-hub.vercel.app";
    
    return (
      <Collapsible 
        className="mt-4 border border-gray-200 rounded-md p-2"
        open={showDiagnostics}
        onOpenChange={setShowDiagnostics}
      >
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="flex w-full justify-between">
            <div className="flex items-center">
              <AlertCircle className="h-4 w-4 mr-2 text-amber-500" />
              Authentication Diagnostics
            </div>
            <span>{showDiagnostics ? '▲' : '▼'}</span>
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-2 text-xs font-mono bg-gray-50 p-2 rounded overflow-auto max-h-[200px]">
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-1">
              <span className="font-semibold">Is Authenticated:</span>
              <span>{isAuthenticated ? 'Yes' : 'No'}</span>
              
              <span className="font-semibold">MSAL Initialized:</span>
              <span>{authStatus?.isInitialized ? 'Yes' : 'No'}</span>
              
              <span className="font-semibold">Has Accounts:</span>
              <span>{authStatus?.hasAccounts ? `Yes (${authStatus?.accountCount})` : 'No'}</span>
              
              <span className="font-semibold">Active Account:</span>
              <span>{authStatus?.activeAccount ? authStatus.activeAccount.username : 'None'}</span>
              
              <span className="font-semibold">Configured Redirect URI:</span>
              <span>{msGraphConfig?.redirectUri || 'Not set'}</span>
              
              <span className="font-semibold">Current Origin:</span>
              <span className={isOriginMismatch ? "text-amber-600 font-bold" : ""}>{currentOrigin}</span>
              
              <span className="font-semibold">Last Error:</span>
              <span className="text-red-500">{lastError || 'None'}</span>
            </div>
            
            {(redirectUriWarning || isOriginMismatch) && (
              <div className="bg-amber-50 border border-amber-200 p-2 rounded text-amber-800">
                {redirectUriWarning && <p>⚠️ {redirectUriWarning}</p>}
                {isOriginMismatch && (
                  <p>⚠️ Current origin ({currentOrigin}) doesn't match the configured redirect URI. 
                  This might cause authentication issues.</p>
                )}
                <p className="mt-1">
                  The redirect URI in Azure portal must match exactly: https://unitopia-hub.vercel.app/
                </p>
              </div>
            )}
            
            <div>
              <span className="font-semibold">Full Auth Status:</span>
              <pre className="mt-1 text-xs overflow-auto max-h-[100px] bg-gray-100 p-1 rounded">
                {JSON.stringify(authStatus, null, 2)}
              </pre>
            </div>
            
            <Button size="sm" variant="outline" onClick={updateAuthStatus} className="w-full mt-2">
              Refresh Status
            </Button>
          </div>
        </CollapsibleContent>
      </Collapsible>
    );
  };

  const renderDebugInfo = () => {
    if (!debugMode) return null;
    
    return (
      <div className="mt-4 border border-gray-200 rounded-md p-4 bg-gray-50">
        <div className="flex justify-between items-center mb-2">
          <h4 className="font-medium text-sm">Debug Information</h4>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setDebugMode(false)}
            className="h-6 w-6 p-0"
          >
            <span className="sr-only">Close</span>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="space-y-2 text-xs">
          <div>
            <span className="font-semibold">Authentication Error:</span>
            <span className="ml-2">{authError || 'None'}</span>
          </div>
          
          <div>
            <span className="font-semibold">Last Error:</span>
            <span className="ml-2">{lastError || 'None'}</span>
          </div>
          
          <div>
            <span className="font-semibold">Retry Count:</span>
            <span className="ml-2">{connectionRetryCount}</span>
          </div>
          
          <div>
            <span className="font-semibold">Auth Status:</span>
            <pre className="mt-1 p-2 bg-gray-100 rounded overflow-auto max-h-[100px]">
              {JSON.stringify(authStatus, null, 2)}
            </pre>
          </div>
          
          {errorDetails && (
            <div>
              <span className="font-semibold">Error Details:</span>
              <pre className="mt-1 p-2 bg-gray-100 rounded overflow-auto max-h-[150px]">
                {JSON.stringify(errorDetails, null, 2)}
              </pre>
            </div>
          )}
          
          <div>
            <span className="font-semibold">MS Graph Config:</span>
            <pre className="mt-1 p-2 bg-gray-100 rounded overflow-auto max-h-[100px]">
              {JSON.stringify(msGraphConfig, null, 2)}
            </pre>
          </div>
          
          <div className="flex flex-col space-y-2 mt-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                updateAuthStatus();
                console.log('[DEBUG] Auth status updated manually');
              }}
              className="w-full"
            >
              Refresh Status
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={bypassAuthForTesting}
              className="w-full text-orange-600 border-orange-200 hover:bg-orange-50"
            >
              Bypass Auth For Testing
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const MaxRetriesReached = () => {
    return (
      <div className="bg-amber-50 border border-amber-200 text-amber-700 px-6 py-4 rounded-lg mb-6">
        <div className="flex items-start">
          <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold mb-1">Maximum Retry Attempts Reached</h4>
            <h4 className="font-semibold mb-1">OneDrive Connection Error</h4>
            <p className="text-sm mb-3">{authError}</p>
            <div className="flex flex-col sm:flex-row gap-2 mt-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleAuthenticate}
                disabled={isAuthenticating}
                className="flex-1"
              >
                {isAuthenticating ? (
                  <>
                    <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                    Retrying...
                  </>
                ) : (
                  <>Retry Connection</>
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSkipOneDriveAuth}
                className="flex-1 text-amber-600 hover:text-amber-700 hover:bg-amber-50 border border-amber-200"
              >
                Continue Without OneDrive
              </Button>
            </div>
            
            {!debugMode && (
              <Button
                variant="link"
                size="sm"
                onClick={() => setDebugMode(true)}
                className="mt-2"
              >
                Show Debug Info
              </Button>
            )}
          </div>
        </div>
        
        {debugMode && renderDebugInfo()}
      </div>
    );
  };

  const renderAuthError = () => {
    if (!authError) return null;
    
    if (shouldStopFetching && fetchCount > 5) {
      return <MaxRetriesReached />;
    }
    
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg mb-6">
        <div className="flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold mb-1">OneDrive Connection Error</h4>
            <p className="text-sm mb-3">{authError}</p>
            <div className="flex flex-col sm:flex-row gap-2 mt-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleAuthenticate}
                disabled={isAuthenticating}
                className="flex-1"
              >
                {isAuthenticating ? (
                  <>
                    <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                    Retrying...
                  </>
                ) : (
                  <>Retry Connection</>
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSkipOneDriveAuth}
                className="flex-1 text-amber-600 hover:text-amber-700 hover:bg-amber-50 border border-amber-200"
              >
                Continue Without OneDrive
              </Button>
            </div>
            
            {!debugMode && (
              <Button
                variant="link"
                size="sm"
                onClick={() => setDebugMode(true)}
                className="mt-2"
              >
                Show Debug Info
              </Button>
            )}
          </div>
        </div>
        
        {debugMode && renderDebugInfo()}
      </div>
    );
  };

  const renderFolderCreation = () => {
    return (
      <div className="mt-6 border rounded-lg p-4 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Create New Folder</h3>
          {isCreatingFolder && (
            <Badge variant="outline" className="bg-blue-50 text-blue-700">
              Creating...
            </Badge>
          )}
        </div>
        
        <div className="flex gap-2 items-center">
          <Input
            placeholder="Enter folder name"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            disabled={isCreatingFolder}
            className="flex-1"
          />
          <Button 
            onClick={handleCreateFolder}
            disabled={isCreatingFolder || !newFolderName.trim()} 
            variant="outline"
            className="whitespace-nowrap"
          >
            {isCreatingFolder ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <FolderPlus className="mr-2 h-4 w-4" />
                Create Folder
              </>
            )}
          </Button>
        </div>
        
        {createFolderError && (
          <div className="text-sm text-red-500 mt-2">
            <AlertTriangle className="h-4 w-4 inline mr-1" />
            {createFolderError}
          </div>
        )}
      </div>
    );
  };

  const renderCurrentPath = () => {
    return (
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-4 overflow-x-auto py-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleNavigateToRoot()}
          className="h-8 px-2"
          disabled={isLoadingContents}
        >
          <Home className="h-4 w-4 mr-1" />
          Root
        </Button>
        
        {currentPath.length > 0 && (
          <>
            {currentPath.map((folder, index) => (
              <React.Fragment key={folder.id}>
                <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleNavigateToFolder(folder.id, index)}
                  className="h-8 px-2 truncate max-w-[180px]"
                  disabled={isLoadingContents || index === currentPath.length - 1}
                >
                  <Folder className="h-4 w-4 mr-1 flex-shrink-0" />
                  <span className="truncate">{folder.name}</span>
                </Button>
              </React.Fragment>
            ))}
          </>
        )}
      </div>
    );
  };

  const handleSelectFolder = (folder: Document) => {
    if (isLoadingContents || isCreatingFolder) return;
    
    setSelectedFolder(folder);
    toast.success(`Folder selected: ${folder.name}`);
    
    // Also select this path
    const completePath = [...currentPath, folder];
    const pathString = completePath.map(f => f.name).join('/');
    
    // Call onComplete with the selected folder
    onComplete({
      folderId: folder.id,
      path: pathString,
      folderName: folder.name
    });
  };

  const handleNavigateToFolder = async (folderId: string, pathIndex?: number) => {
    if (isLoadingContents) return;
    
    try {
      setIsLoadingContents(true);
      setFolderError(null);
      
      // If a pathIndex is provided, navigate to that specific path level
      if (typeof pathIndex === 'number') {
        // Slice the path up to the clicked index (inclusive)
        setCurrentPath(prev => prev.slice(0, pathIndex + 1));
        
        // The folder to navigate to is already in our path
        const targetFolder = currentPath[pathIndex];
        
        // Fetch contents of this folder
        const contents = await getFolderContents(targetFolder.id, 'OneDrive');
        if (contents) {
          setFolderContents(contents);
        } else {
          throw new Error('Could not fetch folder contents');
        }
      } else {
        // Navigate to a new folder and add it to the path
        const folder = folderContents.find(f => f.id === folderId);
        if (!folder) {
          throw new Error('Folder not found');
        }
        
        // Add this folder to the current path
        setCurrentPath(prev => [...prev, folder]);
        
        // Fetch contents of this folder
        const contents = await getFolderContents(folderId, 'OneDrive');
        if (contents) {
          setFolderContents(contents);
        } else {
          throw new Error('Could not fetch folder contents');
        }
      }
    } catch (error) {
      console.error('Error navigating to folder:', error);
      setFolderError(`Could not navigate to folder: ${error.message}`);
      toast.error(`Failed to navigate to folder: ${error.message}`);
    } finally {
      setIsLoadingContents(false);
    }
  };

  const handleNavigateToRoot = async () => {
    if (isLoadingContents) return;
    
    try {
      setIsLoadingContents(true);
      setFolderError(null);
      setCurrentPath([]);
      
      // Fetch the root contents
      const rootContents = await getOneDriveDocuments();
      if (rootContents) {
        setFolderContents(rootContents);
      } else {
        throw new Error('Could not fetch root contents');
      }
    } catch (error) {
      console.error('Error navigating to root:', error);
      setFolderError(`Could not navigate to root: ${error.message}`);
      toast.error(`Failed to navigate to root: ${error.message}`);
    } finally {
      setIsLoadingContents(false);
    }
  };

  const renderFolderContents = () => {
    // Handle the case where auth is needed first
    if (authError) {
      return renderAuthError();
    }
    
    // Handle loading state
    if (isLoadingContents) {
      return (
        <div className="flex flex-col items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-sm text-muted-foreground">Loading folder contents...</p>
        </div>
      );
    }
    
    // Handle error state
    if (folderError) {
      return (
        <div className="border rounded-lg p-6 text-center">
          <AlertTriangle className="h-8 w-8 text-amber-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Folder Error</h3>
          <p className="text-sm text-muted-foreground mb-4">{folderError}</p>
          <Button 
            onClick={handleRetryLoadFolders}
            variant="outline"
          >
            Retry
          </Button>
        </div>
      );
    }
    
    // Handle empty state
    if (folderContents.length === 0) {
      return (
        <div className="border rounded-lg p-6 text-center">
          <FolderOpen className="h-8 w-8 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Folder is Empty</h3>
          <p className="text-sm text-muted-foreground mb-4">
            This folder doesn't contain any items. You can create a new folder here.
          </p>
          {renderFolderCreation()}
        </div>
      );
    }
    
    // Filter to only show folders (not files)
    const folders = folderContents.filter(item => item.isFolder);
    
    // Normal state with folder contents
    return (
      <div className="space-y-6">
        {/* Folder selection UI */}
        <div className="border rounded-lg overflow-hidden">
          <div className="p-3 bg-muted border-b flex justify-between items-center">
            <h3 className="font-medium">Select a Folder</h3>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleRetryLoadFolders}
              disabled={isLoadingContents}
              className="h-8 px-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span className="sr-only">Refresh</span>
            </Button>
          </div>
          
          {folders.length > 0 ? (
            <div className="divide-y max-h-[300px] overflow-y-auto">
              {folders.map((folder) => (
                <div 
                  key={folder.id}
                  className={cn(
                    "p-3 flex items-center justify-between hover:bg-muted/50 cursor-pointer transition-colors",
                    selectedFolder?.id === folder.id && "bg-blue-50 hover:bg-blue-50"
                  )}
                  onClick={() => handleSelectFolder(folder)}
                >
                  <div className="flex items-center gap-3">
                    <Folder className={cn(
                      "h-5 w-5", 
                      selectedFolder?.id === folder.id ? "text-blue-600" : "text-yellow-600"
                    )} />
                    <div>
                      <p className="font-medium">{folder.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(folder.lastModified).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNavigateToFolder(folder.id);
                      }}
                    >
                      <FolderOpen className="h-4 w-4" />
                      <span className="sr-only">Open</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center">
              <p className="text-sm text-muted-foreground">
                No folders found. Create a new folder to start.
              </p>
            </div>
          )}
        </div>
        
        {renderFolderCreation()}
      </div>
    );
  };

  const handleRetryLoadFolders = async () => {
    try {
      setIsLoadingContents(true);
      setFolderError(null);
      
      if (currentPath.length > 0) {
        // We're in a subfolder, reload its contents
        const currentFolder = currentPath[currentPath.length - 1];
        const contents = await getFolderContents(currentFolder.id, 'OneDrive');
        if (contents) {
          setFolderContents(contents);
        } else {
          throw new Error('Could not fetch folder contents');
        }
      } else {
        // We're at root, reload root contents
        const rootContents = await getOneDriveDocuments();
        if (rootContents) {
          setFolderContents(rootContents);
        } else {
          throw new Error('Could not fetch root contents');
        }
      }
    } catch (error) {
      console.error('Error retrying folder load:', error);
      setFolderError(`Could not load folders: ${error.message}`);
      toast.error(`Failed to load folders: ${error.message}`);
    } finally {
      setIsLoadingContents(false);
    }
  };

  return (
    <div className="space-y-4">
      {authError && (
        <div className="bg-amber-50 border border-amber-300 p-4 rounded-md text-amber-800 mb-6">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0 text-amber-500" />
            <div>
              <p className="font-medium">{authError}</p>
              <p className="text-sm mt-1">
                There appears to be an issue with the Microsoft authentication. Please try again or contact support.
              </p>
              <div className="flex gap-2 mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white hover:bg-amber-50 border-amber-300 text-amber-800"
                  onClick={handleAuthenticate}
                >
                  {isAuthenticating ? (
                    <>
                      <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                      Retrying...
                    </>
                  ) : (
                    'Retry Authentication'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white p-6 rounded-lg border shadow-sm">
        {!isAuthenticated ? (
          // UI for authentication step - simplified
          <>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Connect to OneDrive</h3>
              <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                Connecting...
              </div>
            </div>

            <Card className="p-6">
              <div className="flex flex-col items-center justify-center py-8 space-y-4">
                <Cloud className="h-16 w-16 text-blue-500" />
                <h3 className="text-lg font-semibold">Connecting to Microsoft OneDrive</h3>
                <p className="text-center text-sm text-muted-foreground max-w-md">
                  Please wait while we connect to your Microsoft account to access your OneDrive folders.
                </p>
                <div className="mt-4">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              </div>
            </Card>
            {debugMode && renderDiagnostics()}
          </>
        ) : (
          // UI for folder selection (after authentication)
          <>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Select OneDrive Folder</h3>
              <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Connected to OneDrive
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground mb-4">
              Select an existing folder or create a new one to store your unit data.
            </p>
            
            {renderCurrentPath()}
            {renderFolderContents()}
          </>
        )}
      </div>

      {isDeletingFolder && folderToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-10">
          <div className="bg-card p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="font-semibold text-lg mb-4">Delete Folder</h3>
            <p className="mb-4">
              Are you sure you want to delete the folder "{folderToDelete.name}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsDeletingFolder(false);
                  setFolderToDelete(null);
                }}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDeleteFolder}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Trash className="h-4 w-4 mr-2" />
                )}
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 