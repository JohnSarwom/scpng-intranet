import { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useCsvSync } from '@/hooks/useCsvSync';
import { useMicrosoftGraph } from '@/hooks/useMicrosoftGraph';
import { OneDriveConfig, CsvConfig, CsvSyncConfig } from '../types';
import { generateId, clearSetupLocalStorage, addTimestamps } from '../utils';

interface UseSetupWizardProps {
  oneDriveConfig: OneDriveConfig | null;
  csvConfig: CsvConfig | null;
  updateCsvConfig: () => void;
  setObjectives: (objectives: any[]) => void;
  setKRAs: (kras: any[]) => void;
  setKPIs: (kpis: any[]) => void;
  handleSetupCompleteFromHook: () => void;
  isSetupComplete: boolean;
}

export function useSetupWizard({
  oneDriveConfig,
  csvConfig,
  updateCsvConfig,
  setObjectives,
  setKRAs,
  setKPIs,
  handleSetupCompleteFromHook,
  isSetupComplete
}: UseSetupWizardProps) {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [tempObjectives, setTempObjectives] = useState<any[]>([]);
  const [tempKRAs, setTempKRAs] = useState<any[]>([]);
  const [tempKPIs, setTempKPIs] = useState<any[]>([]);
  const [setupError, setSetupError] = useState<string | null>(null);
  const [isUsingLocalStorage, setIsUsingLocalStorage] = useState(false);
  
  // Add the useMicrosoftGraph hook
  const { createCsvFile, isLoading: graphLoading } = useMicrosoftGraph();

  // Use the CSV sync hook
  const { 
    isLoading: isCsvLoading, 
    error: csvError, 
    loadDataFromCsv, 
    saveDataToCsv
  } = useCsvSync({
    config: csvConfig && csvConfig.folderId ? {
      folderId: csvConfig.folderId,
      fileNames: csvConfig.fileNames || {},
      fileIds: csvConfig.fileIds || {},
      data: csvConfig.data || {}
    } as CsvSyncConfig : null,
    onConfigChange: updateCsvConfig || (() => {}),
    isSetupComplete
  });

  // Function to update CSV configuration with new data
  const updateCsvConfigWithData = useCallback((newConfig?: any) => {
    if (newConfig) {
      console.log('Updating CSV config with new data:', newConfig);
      
      // Create a deep copy of the current config
      const updatedConfig = JSON.parse(JSON.stringify(csvConfig || {}));
      
      // Update the fileIds if provided
      if (newConfig.fileIds) {
        updatedConfig.fileIds = {...(updatedConfig.fileIds || {}), ...newConfig.fileIds};
      }
      
      // Ensure data object exists
      if (!updatedConfig.data) {
        updatedConfig.data = {};
      }
      
      // Update each entity's data in the config
      if (newConfig.data) {
        Object.keys(newConfig.data).forEach(entityType => {
          const newEntityData = newConfig.data[entityType];
          
          if (!updatedConfig.data[entityType]) {
            // Create new entity data
            updatedConfig.data[entityType] = {
              headers: [...newEntityData.headers],
              rows: JSON.parse(JSON.stringify(newEntityData.rows))
            };
          } else {
            // Update existing entity data
            updatedConfig.data[entityType] = {
              headers: newEntityData.headers || updatedConfig.data[entityType].headers,
              rows: JSON.parse(JSON.stringify(newEntityData.rows || updatedConfig.data[entityType].rows))
            };
          }
        });
      }
      
      console.log('Updated CSV config:', updatedConfig);
      
      // Update the CSV config in the parent component
      if (updateCsvConfig) {
        // We need to find a way to update the config in the parent
        // For now, we'll use a workaround by directly modifying the csvConfig object
        Object.assign(csvConfig || {}, updatedConfig);
        
        // Call the updateCsvConfig function to trigger a re-render
        updateCsvConfig();
      }
    }
  }, [csvConfig, updateCsvConfig]);

  // Define handleComplete with KRAs support
  const handleComplete = useCallback(async () => {
    // Add more robust error handling
    try {
      if (!csvConfig && !isUsingLocalStorage) {
        toast({
          title: "Setup Error",
          description: "CSV configuration is not properly initialized. Please try again.",
          variant: "destructive",
        });
        return;
      }
      
      // Check if createCsvFile function is available (when not using local storage)
      if (!isUsingLocalStorage && (!createCsvFile || typeof createCsvFile !== 'function')) {
        console.error('Error: createCsvFile function is not available');
        setSetupError('The Microsoft Graph API integration is not available. Try using local storage instead.');
        toast({
          title: "API Error",
          description: "Microsoft Graph API integration is not available. Try using local storage.",
          variant: "destructive",
        });
        setIsUsingLocalStorage(true);
        // Continue with local storage flow instead of returning
      }
      
      setIsProcessing(true);
      setProgress(10);
      
      // If we're using local storage, handle that flow
      if (isUsingLocalStorage) {
        try {
          console.log('Using local storage for unit data');
          setProgress(20);
          
          // Store in localStorage for persistence
          localStorage.setItem('unitopia_objectives', JSON.stringify(tempObjectives));
          localStorage.setItem('unitopia_kras', JSON.stringify(tempKRAs));
          localStorage.setItem('unitopia_kpis', JSON.stringify(tempKPIs));
          localStorage.setItem('unitopia_storage_type', 'local');
          
          setProgress(50);
          
          // Update the state in parent
          if (setObjectives) setObjectives(tempObjectives);
          if (setKRAs) setKRAs(tempKRAs);
          if (setKPIs) setKPIs(tempKPIs);
          
          // Complete setup
          setProgress(95);
          if (handleSetupCompleteFromHook) {
            handleSetupCompleteFromHook();
          }
          
          setProgress(100);
          toast({ 
            title: "Setup Complete", 
            description: "Your unit has been successfully configured and all data has been saved locally." 
          });
          
          return true;
        } catch (error) {
          console.error('Error in local storage setup:', error);
          setSetupError(`Local storage error: ${error.message || 'Unknown error'}`);
          toast({
            title: "Setup Error",
            description: "Failed to save your data locally. Please try again.",
            variant: "destructive"
          });
          setIsProcessing(false);
          return false;
        }
      }
      
      // Regular OneDrive setup continues here
      // Prepare data for CSV files
      setProgress(20);
      
      // Create a copy of the current config to update
      const updatedConfig = { ...csvConfig };
      
      // Ensure the data object and fileIds exist
      if (!updatedConfig.data) {
        updatedConfig.data = {};
      }
      
      if (!updatedConfig.fileIds) {
        updatedConfig.fileIds = {};
      }
      
      // Prepare objectives data
      if (tempObjectives && tempObjectives.length > 0) {
        console.log('Preparing Objectives data:', tempObjectives);
        
        // Get current timestamp
        const currentTimestamp = new Date().toISOString();
        
        // Make sure all objectives have IDs
        const objectivesWithIds = tempObjectives.map(obj => 
          addTimestamps({
            ...obj,
            id: obj.id || generateId()
          }, !obj.id)
        );
        
        const objectivesHeaders = ['id', 'name', 'description', 'startDate', 'endDate', 'createdAt', 'updatedAt'];
        
        // Ensure we have an objectives entity in the data
        if (!updatedConfig.data.objectives) {
          updatedConfig.data.objectives = {
            headers: objectivesHeaders,
            rows: []
          };
        }
        
        // Update objectives data
        updatedConfig.data.objectives.rows = objectivesWithIds.map(obj => {
          const row: Record<string, string> = {};
          objectivesHeaders.forEach(header => {
            row[header] = obj[header] || '';
          });
          return row;
        });
        
        console.log('Prepared objectives data:', updatedConfig.data.objectives);
      }
      
      // Prepare KRAs data
      if (tempKRAs && tempKRAs.length > 0) {
        console.log('Preparing KRAs data:', tempKRAs);
        
        // Get current timestamp
        const currentTimestamp = new Date().toISOString();
        
        // Make sure all KRAs have IDs
        const krasWithIds = tempKRAs.map(kra => 
          addTimestamps({
            ...kra,
            id: kra.id || generateId()
          }, !kra.id)
        );
        
        const kraHeaders = ['id', 'name', 'department', 'responsible', 'startDate', 'endDate', 'objectiveId', 'objectiveName', 'createdAt', 'updatedAt'];
        
        // Ensure we have a KRAs entity in the data
        if (!updatedConfig.data.kras) {
          updatedConfig.data.kras = {
            headers: kraHeaders,
            rows: []
          };
        }
        
        // Update KRAs data
        updatedConfig.data.kras.rows = krasWithIds.map(kra => {
          const row: Record<string, string> = {};
          kraHeaders.forEach(header => {
            row[header] = kra[header] || '';
          });
          return row;
        });
        
        console.log('Prepared KRAs data:', updatedConfig.data.kras);
      }
      
      // Prepare KPIs data
      if (tempKPIs && tempKPIs.length > 0) {
        console.log('Preparing KPIs data:', tempKPIs);
        
        // Get current timestamp
        const currentTimestamp = new Date().toISOString();
        
        // Make sure all KPIs have IDs
        const kpisWithIds = tempKPIs.map(kpi => 
          addTimestamps({
            ...kpi,
            id: kpi.id || generateId()
          }, !kpi.id)
        );
        
        const kpiHeaders = ['id', 'name', 'target', 'actual', 'status', 'description', 'notes', 'kraId', 'kraName', 'startDate', 'endDate', 'createdAt', 'updatedAt'];
        
        // Ensure we have a KPIs entity in the data
        if (!updatedConfig.data.kpis) {
          updatedConfig.data.kpis = {
            headers: kpiHeaders,
            rows: []
          };
        }
        
        // Update KPIs data
        updatedConfig.data.kpis.rows = kpisWithIds.map(kpi => {
          const row: Record<string, string> = {};
          kpiHeaders.forEach(header => {
            row[header] = kpi[header] || '';
          });
          return row;
        });
        
        console.log('Prepared KPIs data:', updatedConfig.data.kpis);
      }
      
      // Update the CSV config with the new data
      setProgress(30);
      updateCsvConfigWithData(updatedConfig);
      console.log('[SetupWizard] Updated CsvConfig with prepared data:', updatedConfig);
      
      // Create CSV files if they don't exist
      setProgress(40);
      const existingFileIds = updatedConfig.fileIds || {};
      if (Object.keys(existingFileIds).length === 0) {
        console.log('[SetupWizard] No existing CSV file IDs found. Attempting to create initial CSV files in OneDrive.');
        
        // Clear any previous session storage to force file creation
        const sessionKey = `csv_init_attempt_${updatedConfig.folderId}`;
        sessionStorage.removeItem(sessionKey);
        
        try {
          const fileIds: Record<string, string> = {};
          
          // Ensure the folder ID is correctly set
          console.log('[SetupWizard] Using OneDrive folder ID for CSV creation:', updatedConfig.folderId || oneDriveConfig?.folderId);
          
          // Double-check that we have a folder ID from oneDriveConfig
          if (!updatedConfig.folderId && oneDriveConfig && oneDriveConfig.folderId) {
            console.log('[SetupWizard] Setting folder ID from oneDriveConfig:', oneDriveConfig.folderId);
            updatedConfig.folderId = oneDriveConfig.folderId;
          }
          
          if (!updatedConfig.folderId) {
            throw new Error('[SetupWizard] Critical Error: No folder ID found for CSV file creation');
          }
          
          // Define the entities we are setting up in this wizard
          const initialEntities = {
            objectives: 'objectives.csv',
            kras: 'kras.csv',
            kpis: 'kpis.csv'
          };

          // Prepare fileNames in the config if not present
          if (!updatedConfig.fileNames || Object.keys(updatedConfig.fileNames).length === 0) {
              updatedConfig.fileNames = {};
          }
          Object.assign(updatedConfig.fileNames, initialEntities); // Ensure our initial entities are in fileNames

          console.log(`[SetupWizard] Preparing to create files for entities: ${Object.keys(initialEntities).join(', ')}`);

          // Create CSV files in parallel ONLY for the initial entities
          const createFilePromises = Object.entries(initialEntities).map(async ([entityType, fileName]) => {
            console.log(`[SetupWizard] Creating CSV file for ${entityType}: ${fileName} in folder ${updatedConfig.folderId}`);
            
            // Prepare initial content with headers
            const headers = updatedConfig.data[entityType]?.headers || [];
            const initialContent = headers.join(',');
            console.log(`[SetupWizard] File: ${fileName}, Headers: ${headers.length > 0 ? headers.join(',') : 'No headers found'}`);
            
            try {
              // Log the exact call parameters for debugging
              const createParams = {
                fileName,
                contentLength: initialContent.length,
                folderId: updatedConfig.folderId
              };
              console.log('[SetupWizard] Calling createCsvFile with params:', createParams);
              
              const csvFile = await createCsvFile(
                fileName,
                initialContent,
                updatedConfig.folderId
              );
              
              if (!csvFile || !csvFile.id) {
                 throw new Error(`[SetupWizard] Failed to create CSV file for ${entityType}: API response missing file ID.`);
              }
              
              console.log(`[SetupWizard] Successfully created CSV file for ${entityType}. File ID: ${csvFile.id}, Name: ${csvFile.name}`);
              fileIds[entityType] = csvFile.id;

            } catch (fileError) {
              console.error(`[SetupWizard] Error creating CSV file for ${entityType} (${fileName}):`, fileError);
              // Create a mock file as fallback
              console.warn(`[SetupWizard] Fallback: Creating mock local file for ${entityType}`);
              setIsUsingLocalStorage(true);
              const tempFileId = `local-${Date.now()}-${Math.random().toString(36).substring(7)}`;
              localStorage.setItem(`unitopia_csv_${entityType}`, initialContent);
              fileIds[entityType] = tempFileId; // Still need an ID for the config
              toast({
                title: "OneDrive Error (Fallback)",
                description: `Failed to create ${fileName}. Using local storage for ${entityType}.`,
                variant: "default",
                duration: 5000
              });
            }
          });
          
          // Wait for all files to be created
          await Promise.all(createFilePromises);
          
          // Update the config with the file IDs
          updatedConfig.fileIds = { ...existingFileIds, ...fileIds }; // Merge with any potential pre-existing IDs
          updateCsvConfigWithData(updatedConfig);
          console.log('[SetupWizard] Updated CsvConfig with new file IDs:', updatedConfig.fileIds);
          
          // Wait briefly for state update propagation if needed
          await new Promise(resolve => setTimeout(resolve, 500)); // Reduced delay
        } catch (error) {
          console.error('[SetupWizard] Error during initial CSV file creation process:', error);
          toast({
            title: "CSV File Creation Error",
            description: `Failed to create initial CSV files: ${error.message || 'Unknown error'}. Check console for details.`,
            variant: "destructive",
          });
          // Decide if we should stop or try local storage fallback entirely
          // For now, we let the error propagate to the main handler
          throw error; 
        }
      } else {
          console.log('[SetupWizard] Existing CSV file IDs found, skipping creation step:', existingFileIds);
      }
      
      // Save data to CSV files
      setProgress(60);
      console.log('[SetupWizard] Attempting to save data to CSV files using useCsvSync...');
      try {
        // Double-check we have the correct folder ID before proceeding
        if (!updatedConfig.folderId && oneDriveConfig && oneDriveConfig.folderId) {
          console.log('[SetupWizard] Setting folder ID from oneDriveConfig for saving:', oneDriveConfig.folderId);
          updatedConfig.folderId = oneDriveConfig.folderId;
        }
        
        if (!updatedConfig.folderId) {
          throw new Error('[SetupWizard] Critical Error: No folder ID found for saving CSV files');
        }
        
        console.log('[SetupWizard] CSV configuration being used for saving:', {
          folderId: updatedConfig.folderId,
          folderName: updatedConfig.folderName || oneDriveConfig?.folderName,
          fileIds: updatedConfig.fileIds ? Object.keys(updatedConfig.fileIds) : 'none',
          dataKeys: updatedConfig.data ? Object.keys(updatedConfig.data) : 'none'
        });
        
        await saveDataToCsv(); // Assumes saveDataToCsv uses the latest config state internally via useCsvSync
        console.log('[SetupWizard] Successfully saved data via saveDataToCsv.');
      } catch (error) {
        console.error('[SetupWizard] Error saving data to CSV files via saveDataToCsv:', error);
        toast({
          title: "CSV Save Error",
          description: `Failed to save data: ${error.message || 'Unknown error'}. Please try again.`,
          variant: "destructive",
        });
        throw error; // Propagate error to main catch block
      }
      
      // Optional: Load data from CSV to verify (consider performance implications)
      setProgress(80);
      console.log('[SetupWizard] Attempting to reload data from CSV for verification...');
      try {
        await loadDataFromCsv();
        console.log('[SetupWizard] Successfully reloaded data from CSV.');
      } catch (loadError) {
          console.warn('[SetupWizard] Failed to reload data from CSV after saving. Setup might still be complete.', loadError);
          // Don't throw an error here, as saving might have succeeded.
          toast({
            title: "Verification Warning",
            description: "Could not verify data save by reloading. Please check your OneDrive folder manually.",
            variant: "default",
            duration: 7000
          });
      }
      
      // Store objectives, KRAs, and KPIs in parent state
      setProgress(90);
      console.log('[SetupWizard] Updating application state with saved data...');
      if (setObjectives && tempObjectives) {
        setObjectives(tempObjectives);
      }
      if (setKRAs && tempKRAs) {
        setKRAs(tempKRAs);
      }
      if (setKPIs && tempKPIs) {
        setKPIs(tempKPIs);
      }
      
      // Complete the setup
      setProgress(95);
      if (handleSetupCompleteFromHook) {
        console.log('[SetupWizard] Calling final setup completion handler...');
        handleSetupCompleteFromHook();
      }
      
      setProgress(100);
      console.log('[SetupWizard] Setup process fully completed successfully.');
      toast({ 
        title: "Setup Complete", 
        description: "Your unit configuration and data have been saved to OneDrive.",
        variant: "default"
      });
      
      return true;
    } catch (error) {
      console.error('[SetupWizard] Error completing setup:', error);
      setSetupError(`Setup error: ${error.message || 'Unknown error'}. Check console for details.`);
      toast({ 
        title: "Setup Error", 
        description: "There was an error completing the setup process. Please try again.", 
        variant: "destructive" 
      });
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, [
    csvConfig, 
    handleSetupCompleteFromHook, 
    saveDataToCsv, 
    loadDataFromCsv, 
    toast, 
    tempObjectives,
    tempKRAs,
    tempKPIs, 
    updateCsvConfigWithData, 
    updateCsvConfig, 
    createCsvFile, 
    setObjectives,
    setKRAs,
    setKPIs,
    isUsingLocalStorage,
    oneDriveConfig
  ]);
  
  // Handle local storage setup
  const useLocalStorage = useCallback((value: boolean) => {
    setIsUsingLocalStorage(value);
  }, []);

  return {
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
  };
} 