import { useState, useEffect, useCallback, Fragment, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import { PublicClientApplication } from '@azure/msal-browser';

// Import step components
import { SetupMethod } from './steps/SetupMethod';
import { ObjectivesSetup } from './steps/ObjectivesSetup';
import { KRASetup } from './steps/KRASetup';
import { KPISetup } from './steps/KPISetup';
import { SetupSummary } from './steps/SetupSummary'; 

// Import custom components
import ProgressSteps from './components/ProgressSteps';
import LocalStorageFallbackNotice from './components/LocalStorageFallbackNotice';
import SimplifiedOneDriveSetup from './components/SimplifiedOneDriveSetup';

// Import utilities and types
import { SetupWizardProps, WizardStep, CsvConfig, OneDriveConfig } from './types';
import { addGlobalFolderHighlightStyle } from './utils';
import { useSetupWizard } from './hooks/useSetupWizard';
import microsoftAuthConfig from '@/config/microsoft-auth';

// Import ErrorBoundary
import { ErrorBoundary } from './components/ErrorBoundary';

// Add global style for folder highlighting
addGlobalFolderHighlightStyle();

// Add setCsvConfig to props interface
export interface ExtendedSetupWizardProps extends SetupWizardProps {
  setCsvConfig: (config: CsvConfig | null) => void; 
}

// MSAL Login scopes for OneDrive operations
const loginRequest = {
  scopes: ["User.Read", "Files.ReadWrite.All"]
};

export const SetupWizard: React.FC<ExtendedSetupWizardProps> = ({
  isOpen,
  onClose,
  onComplete,
  // Destructure individual props
  setSetupMethod,
  setOneDriveConfig,
  setObjectives,
  setKRAs,
  setKPIs,
  handleSetupCompleteFromHook,
  updateCsvConfig,
  csvConfig,
  oneDriveConfig,
  setupMethodProp,
  objectivesProp,
  krasProp,
  kpisProp,
  isSetupComplete,
  setCsvConfig, // Added setCsvConfig
}) => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);
  const [selectedSetupType, setSelectedSetupType] = useState<string | null>(null);
  const [oneDriveFailures, setOneDriveFailures] = useState(0); // Track OneDrive failures
  const [directUploadInProgress, setDirectUploadInProgress] = useState(false);
  const [msalInstance, setMsalInstance] = useState<PublicClientApplication | null>(null);

  // Use our custom hook to manage wizard state
  const {
    isProcessing,
    progress,
    tempObjectives,
    tempKRAs,
    tempKPIs,
    setupError,
    isUsingLocalStorage,
    setTempObjectives,
    setTempKRAs,
    setTempKPIs,
    handleComplete,
    useLocalStorage,
    setSetupError,
    setIsProcessing
  } = useSetupWizard({
    oneDriveConfig,
    csvConfig,
    updateCsvConfig,
    setObjectives,
    setKRAs,
    setKPIs,
    handleSetupCompleteFromHook,
    isSetupComplete
  });

  // Initialize MSAL for direct uploads if not using local storage
  useEffect(() => {
    if (!isUsingLocalStorage && oneDriveConfig && !msalInstance) {
      const msalConfig = {
        auth: {
          clientId: microsoftAuthConfig.clientId,
          authority: microsoftAuthConfig.authorityUrl,
          redirectUri: typeof window !== 'undefined' ? window.location.origin + '/' : "https://unitopia-hub.vercel.app/",
        },
        cache: {
          cacheLocation: 'sessionStorage',
          storeAuthStateInCookie: false,
        }
      };
      
      const msalInstanceCreate = new PublicClientApplication(msalConfig);
      
      // Handle redirect to avoid unhandled promise rejection
      msalInstanceCreate.handleRedirectPromise()
        .catch(err => {
          console.error("Redirect promise error:", err);
        });
      
      msalInstanceCreate.initialize().then(() => {
        setMsalInstance(msalInstanceCreate);
      }).catch(err => {
        console.error(`Failed to initialize MSAL: ${err.message}`);
      });
    }
  }, [isUsingLocalStorage, oneDriveConfig]);

  // Define steps for the wizard
  const steps = useMemo<WizardStep[]>(() => [
    { id: 0, name: "Setup Method" },
    { id: 1, name: "Storage Location" },
    { id: 2, name: "Objectives" },
    { id: 3, name: "KRAs" },
    { id: 4, name: "KPIs" },
    { id: 5, name: "Summary" }
  ], []);

  // Initialize component
  useEffect(() => {
    if (isOpen && !isInitialized) {
      setCurrentStep(0);
      setIsProcessing(false);
      setSelectedSetupType(null);
      setTempObjectives([]);
      setTempKRAs([]);
      setTempKPIs([]);
      setSetupError(null);
      setOneDriveFailures(0); // Reset failure counter
      setIsInitialized(true);
    }
  }, [isOpen, isInitialized, setSetupError, setTempObjectives, setTempKRAs, setTempKPIs, setIsProcessing]);

  // Reset initialization when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setIsInitialized(false);
    }
  }, [isOpen]);

  // Function to upload data directly to OneDrive
  const uploadDirectToOneDrive = async (fileName: string, content: string): Promise<boolean> => {
    if (!msalInstance || !oneDriveConfig || !oneDriveConfig.folderId) {
      console.error('Cannot upload to OneDrive: Missing MSAL instance or folder ID');
      return false;
    }

    try {
      setDirectUploadInProgress(true);
      
      // Get current account
      const accounts = msalInstance.getAllAccounts();
      if (accounts.length === 0) {
        throw new Error('No authenticated account found');
      }
      
      const currentAccount = accounts[0];
      
      // Get access token
      const tokenResponse = await msalInstance.acquireTokenSilent({
        ...loginRequest,
        account: currentAccount
      });

      // Create file blob
      const file = new Blob([content], { type: 'text/csv' });
      
      // Upload file to the selected folder
      const uploadUrl = `https://graph.microsoft.com/v1.0/me/drive/items/${oneDriveConfig.folderId}:/${fileName}:/content`;
      
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${tokenResponse.accessToken}`,
          'Content-Type': 'text/csv'
        },
        body: file
      });

      if (!uploadResponse.ok) {
        throw new Error(`Error uploading file: ${uploadResponse.statusText}`);
      }

      console.log(`File ${fileName} uploaded successfully`);
      return true;
      
    } catch (err) {
      console.error(`Failed to upload ${fileName}:`, err);
      
      // Try interactive auth if silent fails
      if (err.name === "InteractionRequiredAuthError" && msalInstance) {
        try {
          const tokenResponse = await msalInstance.acquireTokenPopup(loginRequest);
          
          // Create file blob
          const file = new Blob([content], { type: 'text/csv' });
          
          // Upload file to the selected folder
          const uploadUrl = `https://graph.microsoft.com/v1.0/me/drive/items/${oneDriveConfig.folderId}:/${fileName}:/content`;
          
          const uploadResponse = await fetch(uploadUrl, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${tokenResponse.accessToken}`,
              'Content-Type': 'text/csv'
            },
            body: file
          });

          if (!uploadResponse.ok) {
            throw new Error(`Error uploading file: ${uploadResponse.statusText}`);
          }

          console.log(`File ${fileName} uploaded successfully (after interactive auth)`);
          return true;
          
        } catch (interactiveErr) {
          console.error('Interactive auth failed:', interactiveErr);
          return false;
        }
      }
      
      return false;
    } finally {
      setDirectUploadInProgress(false);
    }
  };

  // Function to handle OneDrive failures and switch to local storage if needed
  const handleOneDriveFailure = useCallback((error: any) => {
    const newFailureCount = oneDriveFailures + 1;
    setOneDriveFailures(newFailureCount);
    
    console.error("[SetupWizard] OneDrive operation failed:", error);
    
    // After 3 failures, force switch to local storage
    if (newFailureCount >= 3) {
      console.log("[SetupWizard] Multiple OneDrive failures detected, switching to local storage");
      useLocalStorage(true);
      
      toast({
        title: "OneDrive connection issue",
        description: "Having trouble connecting to OneDrive. Switched to local storage mode.",
        variant: "destructive",
        duration: 5000,
      });
      
      // Update OneDrive config to mark it as temporary (local)
      if (setOneDriveConfig && oneDriveConfig) {
        setOneDriveConfig({
          ...oneDriveConfig,
          isTemporary: true
        });
      }
      
      // Clear CSV config to prevent further API calls
      if (setCsvConfig) {
        const localCsvConfig = {
          folderId: "local-storage",
          folderName: "Local Storage",
          fileNames: {
            objectives: "objectives.csv",
            kras: "kras.csv",
            kpis: "kpis.csv",
            tasks: "tasks.csv",
            projects: "projects.csv",
            risks: "risks.csv",
            assets: "assets.csv"
          },
          fileIds: {
            objectives: `local-${Date.now()}-objectives`,
            kras: `local-${Date.now()}-kras`,
            kpis: `local-${Date.now()}-kpis`,
            tasks: `local-${Date.now()}-tasks`,
            projects: `local-${Date.now()}-projects`,
            risks: `local-${Date.now()}-risks`,
            assets: `local-${Date.now()}-assets`
          },
          data: {}
        };
        setCsvConfig(localCsvConfig);
        localStorage.setItem('unitopia_storage_type', 'local');
      }
      
      return true; // Switched to local storage
    }
    
    return false; // Still trying OneDrive
  }, [oneDriveFailures, useLocalStorage, toast, setOneDriveConfig, oneDriveConfig, setCsvConfig]);

  const handleNext = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prevStep => prevStep + 1);
    }
  }, [currentStep, steps.length]);

  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prevStep => prevStep - 1);
    }
  }, [currentStep]);

  // Define handleSetupTypeSelect
  const handleSetupTypeSelect = useCallback((type: string) => {
    console.log('Setup type selected:', type);
    setSelectedSetupType(type);
    setSetupError(null);

    if (!setSetupMethod) {
      toast({
        title: "Setup Error",
        description: "Setup state (setSetupMethod) is not properly initialized. Please try again.",
        variant: "destructive"
      });
      return;
    }
    
    // Set the appropriate setup method based on the selected type
    if (type === 'onedrive') {
      try {
        console.log('[DEBUG] Setting up OneDrive integration');
        setSetupMethod('standard'); // Standard setup for OneDrive
        
        // Add a small delay to ensure console logs are visible
        setTimeout(() => {
          console.log('[DEBUG] Moving to step 1 for OneDrive setup');
          setCurrentStep(1);
        }, 500);
      } catch (error) {
        console.error('[DEBUG] Error in OneDrive setup initialization:', error);
        // Don't proceed to next step if there's an error
        setSetupError(`OneDrive initialization error: ${error.message || 'Unknown error'}`);
        
        // Revert to local storage if OneDrive fails
        useLocalStorage(true);
      }
    } else if (type === 'csv') {
      setSetupMethod('import'); // Import method for CSV
      setCurrentStep(1);
    } else if (type === 'demo') {
      setSetupMethod('demo'); // Demo data
      setCurrentStep(1);
    }
  }, [setSetupMethod, toast, setCurrentStep, setSetupError, useLocalStorage]);

  // Add handling for the step completion
  const handleObjectivesComplete = useCallback((objectives: any[]) => {
    setTempObjectives(objectives);
    setCurrentStep(3); // Move to KRA setup step
  }, [setTempObjectives]);

  const handleKRAComplete = useCallback((kras: any[]) => {
    setTempKRAs(kras);
    setCurrentStep(4); // Move to KPI setup step
  }, [setTempKRAs]);

  const handleKPIComplete = useCallback((kpis: any[]) => {
    setTempKPIs(kpis);
    setCurrentStep(5); // Move to Summary step
  }, [setTempKPIs]);

  const handleSummaryComplete = useCallback(async () => {
    console.log("Starting setup completion process...");
    // Set the objectives, KRAs, and KPIs in the parent component
    if (setObjectives) {
      setObjectives(tempObjectives);
    }
    if (setKRAs) {
      setKRAs(tempKRAs);
    }
    if (setKPIs) {
      setKPIs(tempKPIs);
    }
    
    // Check if we've already had OneDrive failures and are using local storage
    if (oneDriveFailures >= 3 || isUsingLocalStorage) {
      console.log("[SetupWizard] Using local storage for setup completion due to previous failures");
      
      // Store data in localStorage
      localStorage.setItem('unitopia_objectives', JSON.stringify(tempObjectives));
      localStorage.setItem('unitopia_kras', JSON.stringify(tempKRAs));
      localStorage.setItem('unitopia_kpis', JSON.stringify(tempKPIs));
      
      // Add localStorage entries for additional entities
      localStorage.setItem('unitopia_tasks', JSON.stringify([]));
      localStorage.setItem('unitopia_projects', JSON.stringify([]));
      localStorage.setItem('unitopia_risks', JSON.stringify([]));
      localStorage.setItem('unitopia_assets', JSON.stringify([]));
      
      localStorage.setItem('unitopia_storage_type', 'local');
      
      // Complete setup without OneDrive
      if (handleSetupCompleteFromHook) {
        handleSetupCompleteFromHook();
      }
      
      // Close the dialog after successful completion
      setTimeout(onComplete, 500); // Call parent's onComplete
      setTimeout(onClose, 500);    // Call parent's onClose
      
      toast({
        title: "Setup completed with local storage",
        description: "Your unit data is saved locally in your browser.",
        duration: 3000
      });
      
      return;
    }

    // Try direct OneDrive upload first if we have all the requirements
    if (oneDriveConfig && msalInstance && !isUsingLocalStorage) {
      setIsProcessing(true);
      
      try {
        // Convert data to CSV format
        const objectivesCsv = convertToCsv(tempObjectives, ['id', 'name', 'description', 'startDate', 'endDate']);
        const krasCsv = convertToCsv(tempKRAs, ['id', 'objectiveId', 'name', 'description', 'startDate', 'endDate']);
        const kpisCsv = convertToCsv(tempKPIs, ['id', 'kraId', 'name', 'description', 'target', 'unit', 'frequency']);
        
        // Create empty CSV files for tasks, projects, risks, and assets with appropriate headers
        const tasksCsv = convertToCsv([], ['id', 'title', 'description', 'status', 'priority', 'assignee', 'dueDate', 'projectId', 'projectName']);
        const projectsCsv = convertToCsv([], ['id', 'name', 'status', 'manager', 'startDate', 'endDate', 'budget', 'progress']);
        const risksCsv = convertToCsv([], ['id', 'title', 'project', 'impact', 'likelihood', 'status', 'owner', 'lastUpdated']);
        const assetsCsv = convertToCsv([], ['id', 'name', 'type', 'assignedTo', 'department', 'serialNumber', 'purchaseDate', 'warranty', 'status']);
        
        // Upload each file to OneDrive
        const objectivesSuccess = await uploadDirectToOneDrive('objectives.csv', objectivesCsv);
        const krasSuccess = await uploadDirectToOneDrive('kras.csv', krasCsv);
        const kpisSuccess = await uploadDirectToOneDrive('kpis.csv', kpisCsv);
        
        // Upload the additional CSV files
        const tasksSuccess = await uploadDirectToOneDrive('tasks.csv', tasksCsv);
        const projectsSuccess = await uploadDirectToOneDrive('projects.csv', projectsCsv);
        const risksSuccess = await uploadDirectToOneDrive('risks.csv', risksCsv);
        const assetsSuccess = await uploadDirectToOneDrive('assets.csv', assetsCsv);
        
        if (objectivesSuccess && krasSuccess && kpisSuccess && 
            tasksSuccess && projectsSuccess && risksSuccess && assetsSuccess) {
          console.log('All files successfully uploaded to OneDrive');
          
          // Update CSV config with file info
          if (setCsvConfig && oneDriveConfig) {
            const updatedCsvConfig = {
              folderId: oneDriveConfig.folderId,
              folderName: oneDriveConfig.folderName,
              fileNames: {
                objectives: "objectives.csv",
                kras: "kras.csv",
                kpis: "kpis.csv",
                tasks: "tasks.csv",
                projects: "projects.csv",
                risks: "risks.csv",
                assets: "assets.csv"
              },
              fileIds: {
                // We don't have the file IDs from the response, but that's okay
                // The useCsvSync hook will find them by name if needed
              },
              data: {
                objectives: { headers: Object.keys(tempObjectives[0] || {}), rows: tempObjectives },
                kras: { headers: Object.keys(tempKRAs[0] || {}), rows: tempKRAs },
                kpis: { headers: Object.keys(tempKPIs[0] || {}), rows: tempKPIs },
                tasks: { headers: ['id', 'title', 'description', 'status', 'priority', 'assignee', 'dueDate', 'projectId', 'projectName'], rows: [] },
                projects: { headers: ['id', 'name', 'status', 'manager', 'startDate', 'endDate', 'budget', 'progress'], rows: [] },
                risks: { headers: ['id', 'title', 'project', 'impact', 'likelihood', 'status', 'owner', 'lastUpdated'], rows: [] },
                assets: { headers: ['id', 'name', 'type', 'assignedTo', 'department', 'serialNumber', 'purchaseDate', 'warranty', 'status'], rows: [] }
              }
            };
            setCsvConfig(updatedCsvConfig);
          }
          
          toast({
            title: "Setup completed successfully",
            description: "Your data has been saved to OneDrive.",
            duration: 3000
          });
          
          if (handleSetupCompleteFromHook) {
            handleSetupCompleteFromHook();
          }
          
          // Close the dialog after successful completion
          setTimeout(onComplete, 500); // Call parent's onComplete
          setTimeout(onClose, 500);    // Call parent's onClose
          
          return;
        } else {
          console.error('Failed to upload all files directly to OneDrive');
          // Fall through to the regular save approach
        }
      } catch (error) {
        console.error('Error during direct upload to OneDrive:', error);
        // Fall through to the regular save approach
      } finally {
        setIsProcessing(false);
      }
    }
    
    // If direct upload failed or isn't available, try the regular approach
    setIsProcessing(true);
    handleComplete()
      .then((success) => {
        if (success) {
          // Close the dialog after successful completion
          setTimeout(onComplete, 500); // Call parent's onComplete
          setTimeout(onClose, 500);    // Call parent's onClose
        } else {
          // If not successful but no error was set, it might be OneDrive issue
          const switched = handleOneDriveFailure(new Error("Unknown error during setup completion"));
          if (switched) {
            // Try again with local storage
            handleSummaryComplete();
          }
        }
      })
      .catch((error) => {
        console.error("Error during setup completion:", error);
        
        // Try to handle as OneDrive failure
        const switched = handleOneDriveFailure(error);
        if (switched) {
          // If switched to local storage, try again
          handleSummaryComplete();
        } else {
          setSetupError(`Setup failed: ${error?.message || 'Unknown error'}`);
        }
      })
      .finally(() => {
        setIsProcessing(false);
      });
  }, [
    tempObjectives, 
    tempKRAs, 
    tempKPIs, 
    setObjectives, 
    setKRAs, 
    setKPIs, 
    handleComplete, 
    onComplete, 
    onClose,
    setSetupError,
    handleOneDriveFailure,
    oneDriveFailures,
    isUsingLocalStorage,
    handleSetupCompleteFromHook,
    toast,
    msalInstance,
    oneDriveConfig,
    setCsvConfig,
    setIsProcessing
  ]);

  // Helper function to convert data to CSV
  const convertToCsv = (data: any[], headers: string[]): string => {
    if (!data || data.length === 0) {
      return headers.join(',') + '\n';
    }
    
    const csvRows = [headers.join(',')];
    
    for (const item of data) {
      const values = headers.map(header => {
        const value = item[header];
        
        // Handle values that might need quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        
        return value === null || value === undefined ? '' : String(value);
      });
      
      csvRows.push(values.join(','));
    }
    
    return csvRows.join('\n');
  };

  // Update handlePathSelect in step 1 to initialize csvConfig
  const handlePathSelect = useCallback((config: any) => {
    console.log('OneDrive path selected:', config);
    
    if (config.isTemporary) {
      console.log('Using temporary local storage instead of OneDrive');
      useLocalStorage(true);
      
      // Set up local storage config for later steps
      if (setOneDriveConfig) {
        setOneDriveConfig({ 
          folderId: config.folderId, 
          folderName: config.path || config.folderName,
          isTemporary: true 
        });
        // Clear any potentially conflicting CSV config
        if (setCsvConfig) {
          const localCsvConfig = {
            folderId: "local-storage",
            folderName: "Local Storage",
            fileNames: {
              objectives: "objectives.csv",
              kras: "kras.csv",
              kpis: "kpis.csv",
              tasks: "tasks.csv",
              projects: "projects.csv",
              risks: "risks.csv",
              assets: "assets.csv"
            },
            fileIds: {
              objectives: `local-${Date.now()}-objectives`,
              kras: `local-${Date.now()}-kras`,
              kpis: `local-${Date.now()}-kpis`,
              tasks: `local-${Date.now()}-tasks`,
              projects: `local-${Date.now()}-projects`,
              risks: `local-${Date.now()}-risks`,
              assets: `local-${Date.now()}-assets`
            },
            data: {}
          };
          setCsvConfig(localCsvConfig);
        }
        toast({ 
          title: "Using Local Storage", 
          description: "Your data will be stored locally for this session.",
          duration: 3000
        });
      }
      setCurrentStep(2); // Move to Objectives step
    } else {
      // Normal OneDrive folder setup
      if (setOneDriveConfig && setCsvConfig) { // Check for setCsvConfig
        // Clear any existing local storage data
        localStorage.removeItem('unitopia_objectives');
        localStorage.removeItem('unitopia_kras');
        localStorage.removeItem('unitopia_kpis');
        localStorage.removeItem('unitopia_tasks');
        localStorage.removeItem('unitopia_projects');
        localStorage.removeItem('unitopia_risks');
        localStorage.removeItem('unitopia_assets');
        localStorage.removeItem('unitopia_storage_type');
        
        // Clear CSV-related storage
        for (const key of Object.keys(localStorage)) {
          if (key.startsWith('unitopia_csv_')) {
            localStorage.removeItem(key);
          }
        }
        
        // Clear any sessionStorage that might affect CSV operations
        for (const key of Object.keys(sessionStorage)) {
          if (key.startsWith('csv_') || key.includes('unitopia')) {
            sessionStorage.removeItem(key);
          }
        }
        
        console.log('Cleared all local/session storage data to prevent old data contamination');
        
        // Update OneDriveConfig
        const currentOneDriveConfig = { 
          folderId: config.folderId, 
          folderName: config.path || config.folderName 
        };
        setOneDriveConfig(currentOneDriveConfig);

        // ---> Initialize CsvConfig <--- 
        const initialCsvConfig = {
          folderId: config.folderId,         // Use the selected folder ID
          folderName: config.path || config.folderName, // Use the selected folder name/path
          fileNames: {
            objectives: "objectives.csv",
            kras: "kras.csv",
            kpis: "kpis.csv",
            tasks: "tasks.csv",
            projects: "projects.csv",
            risks: "risks.csv",
            assets: "assets.csv"
          },
          fileIds: {
            // Explicitly set to empty to force creation of new files
            // This ensures we always create new files in the selected folder
          },
          data: {},      // Initialize empty
          forceCreation: true // Add flag to force file creation
        };
        console.log('Initializing CsvConfig:', initialCsvConfig);
        setCsvConfig(initialCsvConfig); // Update the CsvConfig state
        // <-------------------------------

        toast({ 
          title: "OneDrive folder selected successfully!", 
          description: `Using folder: "${config.path || config.folderName}"`, // Corrected description
          duration: 2000
        });
      }
      
      // Add a short delay to ensure state is updated before proceeding
      setTimeout(() => {
        setCurrentStep(2); // Move to Objectives step
      }, 100);
    }
  }, [setOneDriveConfig, setCsvConfig, toast, setCurrentStep, useLocalStorage]); // Added setCsvConfig dependency

  // Render the appropriate step content
  const renderStep = useCallback(() => {
    // Specific to OneDrive path selection (step 1)
    if (currentStep === 1 && setupMethodProp === 'standard') {
      return (
        <>
          <SimplifiedOneDriveSetup onComplete={handlePathSelect} />
        </>
      );
    }
    
    switch (currentStep) {
      case 0:
        return <SetupMethod onSelect={handleSetupTypeSelect} />;
      case 2:
        return (
          <ObjectivesSetup
            initialObjectives={objectivesProp || []}
            onComplete={handleObjectivesComplete}
          />
        );
      case 3:
        return <KRASetup onComplete={handleKRAComplete} />;
      case 4:
        return <KPISetup onComplete={handleKPIComplete} />;
      case 5:
        return (
          <SetupSummary
            objectives={tempObjectives}
            kras={tempKRAs}
            kpis={tempKPIs}
            onComplete={handleSummaryComplete}
            onBack={handleBack}
            oneDriveConfig={oneDriveConfig}
          />
        );
      default:
        return null;
    }
  }, [
    currentStep,
    setupMethodProp,
    handleSetupTypeSelect,
    handleObjectivesComplete,
    handleKRAComplete,
    handleKPIComplete,
    handleSummaryComplete,
    handlePathSelect,
    useLocalStorage,
    isProcessing,
    tempObjectives,
    tempKRAs,
    tempKPIs,
    oneDriveConfig,
    objectivesProp,
    handleBack
  ]);

  // Extract navigation button rendering to a separate memoized function
  const renderNavigationButtons = useMemo(() => {
    if (isProcessing) return null;
    
    return (
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 0}
          className={currentStep === 0 ? "invisible" : ""}
        >
          Back
        </Button>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isProcessing}
          >
            Cancel
          </Button>
          
          {currentStep === 5 ? (
            <Button 
              onClick={(e) => {
                e.preventDefault();
                console.log("Complete Setup button clicked, starting processing...");
                handleSummaryComplete();
              }}
              className="bg-green-600 hover:bg-green-700 text-white"
              disabled={isProcessing || directUploadInProgress}
            >
              {isProcessing || directUploadInProgress ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {directUploadInProgress ? 'Uploading to OneDrive...' : 'Completing...'}
                </>
              ) : (
                "Complete Setup"
              )}
            </Button>
          ) : currentStep > 0 && currentStep < 5 ? (
            <Button
              onClick={handleNext}
              disabled={isProcessing}
            >
              Next
            </Button>
          ) : null}
        </div>
      </div>
    );
  }, [currentStep, isProcessing, directUploadInProgress, handleBack, onClose, handleNext, handleSummaryComplete]);

  // Extract step content container for better performance
  const renderStepContent = useMemo(() => {
    return (
      <div className="rounded-lg border min-h-[400px] p-6">
        {isProcessing ? (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-center">Setting up your unit data...</p>
            <p className="text-sm text-muted-foreground text-center">
              {directUploadInProgress 
                ? "Uploading your data directly to OneDrive..." 
                : "This may take a moment as we configure your data."}
            </p>
            {oneDriveFailures > 0 && (
              <div className="text-sm text-amber-600 mt-2 max-w-md text-center">
                Having trouble connecting to OneDrive. 
                {oneDriveFailures >= 3 
                  ? " Switched to local storage mode." 
                  : ` Attempt ${oneDriveFailures}/3...`}
              </div>
            )}
          </div>
        ) : (
          <>
            {renderStep()}
          </>
        )}
      </div>
    );
  }, [isProcessing, directUploadInProgress, renderStep, oneDriveFailures]);

  // Dialog structure with updated UI
  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={(open) => {
        // Only allow closing if not processing
        if (!open && !isProcessing) {
          onClose();
        }
      }}
    >
      <DialogContent className="max-w-4xl p-0 overflow-hidden">
        <ErrorBoundary
          fallback={
            <div className="p-6 text-center">
              <h3 className="text-lg font-medium text-red-800 mb-2">Setup Wizard Error</h3>
              <p className="text-sm text-red-600 mb-4">
                An error occurred while rendering the setup wizard. Try refreshing the page.
              </p>
              <Button variant="outline" onClick={onClose}>Close</Button>
            </div>
          }
        >
          <DialogHeader className="p-6 pb-2">
            <DialogTitle className="text-2xl">Unit Setup Wizard</DialogTitle>
            <DialogDescription>
              Configure your unit's backend storage and structure
            </DialogDescription>
          </DialogHeader>

          <div className="px-6 pb-6 space-y-6">
            {/* Progress Steps */}
            <ProgressSteps steps={steps} currentStep={currentStep} />

            {/* Error display */}
            {setupError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline">{setupError}</span>
                {oneDriveFailures > 0 && (
                  <div className="mt-2 text-sm">
                    Having issues with OneDrive connection. 
                    {isUsingLocalStorage 
                      ? " Using local storage as fallback." 
                      : " Will fallback to local storage if issues persist."}
                  </div>
                )}
              </div>
            )}

            {/* Local storage notification */}
            {isUsingLocalStorage && currentStep > 1 && <LocalStorageFallbackNotice />}

            {/* Processing indicator */}
            {isProcessing && (
              <div className="space-y-4">
                <Progress value={progress} className="h-2" />
                <p className="text-sm text-center text-muted-foreground">
                  {progress < 100 ? 'Processing...' : 'Complete!'} ({Math.round(progress)}%)
                </p>
              </div>
            )}

            {/* Step content */}
            {renderStepContent}

            {/* Navigation buttons */}
            {renderNavigationButtons}
          </div>
        </ErrorBoundary>
      </DialogContent>
    </Dialog>
  );
}; 