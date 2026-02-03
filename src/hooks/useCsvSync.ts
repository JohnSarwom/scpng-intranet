import { useState, useEffect, useCallback } from 'react';
import { useMicrosoftGraph } from './useMicrosoftGraph';
import { toast } from 'sonner';

export interface CsvSyncConfig {
  folderId: string;
  fileNames: {
    [key: string]: string; // key: sheet name, value: file name (e.g., "objectives.csv")
  };
  fileIds: {
    [key: string]: string; // key: sheet name, value: file id
  };
  data: {
    [key: string]: {
      headers: string[];
      rows: any[];
    };
  };
  isUsingLocalStorage?: boolean;
  forceCreation?: boolean;
}

export interface UseCsvSyncProps {
  config: CsvSyncConfig | null;
  onConfigChange: (config: CsvSyncConfig) => void;
  isSetupComplete: boolean;
}

export const useCsvSync = ({ config, onConfigChange, isSetupComplete }: UseCsvSyncProps) => {
  const { createCsvFile, readCsvFile, updateCsvFile } = useMicrosoftGraph();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasAttemptedInit, setHasAttemptedInit] = useState(false);

  // Validate that required functions from useMicrosoftGraph are available
  useEffect(() => {
    if (!createCsvFile || typeof createCsvFile !== 'function') {
      console.error('[CSV SYNC] createCsvFile function is not available or is not a function');
      setError('Microsoft Graph API integration is not available. Please refresh the page and try again.');
    }
    if (!readCsvFile || typeof readCsvFile !== 'function') {
      console.error('[CSV SYNC] readCsvFile function is not available or is not a function');
    }
    if (!updateCsvFile || typeof updateCsvFile !== 'function') {
      console.error('[CSV SYNC] updateCsvFile function is not available or is not a function');
    }
  }, [createCsvFile, readCsvFile, updateCsvFile]);

  // Initialize CSV files if they don't exist
  const initializeCsvFiles = useCallback(async () => {
    if (!config) {
      console.error('[CSV INIT] Cannot initialize CSV files: Missing configuration');
      return;
    }

    if (!config.folderId) {
      console.error('[CSV INIT] Cannot initialize CSV files: No folder ID specified');
      return;
    }
    
    // Check if createCsvFile is available
    if (!createCsvFile || typeof createCsvFile !== 'function') {
      console.error('[CSV INIT] Cannot initialize CSV files: createCsvFile function is not available');
      setError('Microsoft Graph API integration is not available. Please refresh the page and try again.');
      return;
    }

    // Check if we should force creation of new files
    const forceCreation = config.forceCreation === true;
    if (forceCreation) {
      console.log('[CSV INIT] ForceCreation flag detected - will create new files regardless of existing IDs');
    }

    // Skip if we already have file IDs or have already attempted initialization
    const existingFileIds = config.fileIds && Object.keys(config.fileIds).length > 0;
    
    // For robustness, check if the file IDs we have are valid (not temporary local IDs)
    const hasValidFileIds = existingFileIds && 
      !Object.values(config.fileIds).some(id => id.startsWith('local-'));
    
    // Only skip initialization if we have valid file IDs AND we're not forcing creation
    if (hasValidFileIds && !forceCreation) {
      console.log('[CSV INIT] Files already initialized with valid IDs, skipping', config.fileIds);
      return;
    } else if (existingFileIds && !forceCreation) {
      console.log('[CSV INIT] Existing file IDs found but they are temporary local IDs, will try to create real files');
    } else if (forceCreation) {
      console.log('[CSV INIT] Force creation is enabled - will create new OneDrive files');
    }

    // When force creation is true, don't check hasAttemptedInit
    if (hasAttemptedInit && !forceCreation) {
      console.log('[CSV INIT] Initialization already attempted, skipping');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Check if we've already attempted to create files in this session
      const sessionKey = `csv_init_attempt_${config.folderId}`;
      const hasAttemptedInSession = sessionStorage.getItem(sessionKey);
      
      // Skip if we've attempted in this session, but only if not forcing creation
      if (hasAttemptedInSession && !forceCreation) {
        console.log('[CSV INIT] CSV file creation already attempted in this session, skipping');
        setHasAttemptedInit(true);
        return;
      }
      
      console.log('[CSV INIT] Starting CSV file creation in folder:', config.folderId);
      
      // Set up default file names if not already defined
      if (!config.fileNames || Object.keys(config.fileNames).length === 0) {
        console.log('[CSV INIT] No file names defined, setting defaults');
        config.fileNames = {
          objectives: 'objectives.csv',
          kras: 'kras.csv',
          kpis: 'kpis.csv',
          tasks: 'tasks.csv',
          projects: 'projects.csv',
          risks: 'risks.csv',
          assets: 'assets.csv'
        };
      }
      
      console.log('[CSV INIT] Files to create:', Object.entries(config.fileNames).map(([key, name]) => `${key}: ${name}`).join(', '));
      
      const fileIds: { [key: string]: string } = { ...config.fileIds || {} };
      let successCount = 0;
      let failCount = 0;
      let useLocalStorage = false;
      let activeCreationAttempts = 0;
      const maxCreationFailures = 3;
      
      // Create each CSV file one by one to avoid rate limiting
      for (const [key, fileName] of Object.entries(config.fileNames)) {
        try {
          // Skip if we already have a valid ID for this file and not forcing creation
          if (fileIds[key] && !fileIds[key].startsWith('local-') && !forceCreation) {
            console.log(`[CSV INIT] Skipping ${fileName}, already has valid ID: ${fileIds[key]}`);
            successCount++;
            continue;
          }
          
          console.log(`[CSV INIT] Creating CSV file: ${fileName} for ${key}`);
          activeCreationAttempts++;
          
          // Prepare content - headers as first line
          const headers = config.data[key]?.headers || [];
          if (headers.length === 0) {
            console.warn(`[CSV INIT] No headers defined for ${key}, using defaults`);
            
            // Use the helper function to get default headers
            const defaultHeaders = getDefaultHeaders(key);
            defaultHeaders.forEach(header => headers.push(header));
            
            console.log(`[CSV INIT] Using default headers for ${key}:`, headers);
          }
          
          // Add some initial data for testing if rows are empty
          const rows = config.data[key]?.rows || [];
          let initialContent = headers.join(',') + '\n';
          
          // If we have rows, include them in the initial content
          if (rows.length > 0) {
            rows.forEach(row => {
              const values = headers.map(header => {
                const value = row[header];
                
                // Handle values that might need quotes
                if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                  return `"${value.replace(/"/g, '""')}"`;
                }
                
                return value === null || value === undefined ? '' : String(value);
              });
              
              initialContent += values.join(',') + '\n';
            });
          }
          
          console.log(`[CSV INIT] Prepared content for ${fileName}:`, initialContent.substring(0, 100) + '...');
          
          // Try up to 3 times to create the file
          let fileCreated = false;
          let attempts = 0;
          let csvFile = null;
          let lastError = null;
          
          while (!fileCreated && attempts < 3) {
            attempts++;
            try {
              console.log(`[CSV INIT] Attempt ${attempts}/3: Creating file ${fileName}`);
              // Create CSV file with content
              csvFile = await createCsvFile(
                fileName,
                initialContent,
                config.folderId
              );
              
              if (csvFile && csvFile.id) {
                fileCreated = true;
                // Check if this is a local fallback ID
                if (csvFile.id.startsWith('local-')) {
                  console.warn(`[CSV INIT] File ${fileName} created with local fallback ID: ${csvFile.id}`);
                  useLocalStorage = true;
                  if (activeCreationAttempts >= maxCreationFailures) {
                    // If we've had multiple failures, switch permanently to local storage
                    console.error(`[CSV INIT] Multiple OneDrive file creation failures detected, switching to local storage mode`);
                    toast.error('Unable to create files in OneDrive. Using local storage instead.');
                    break;
                  }
                } else {
                  console.log(`[CSV INIT] CSV file created successfully in OneDrive: ${fileName} with ID: ${csvFile.id}`);
                  // Reset the failure counter since we had a success
                  activeCreationAttempts = 0;
                }
              } else {
                console.warn(`[CSV INIT] Creation attempt ${attempts} for ${fileName} returned no valid file ID`);
                await new Promise(resolve => setTimeout(resolve, 1000 * attempts)); // wait longer for each attempt
              }
            } catch (attemptError) {
              lastError = attemptError;
              console.error(`[CSV INIT] Creation attempt ${attempts} for ${fileName} failed:`, attemptError);
              if (attempts < 3) {
                await new Promise(resolve => setTimeout(resolve, 1000 * attempts)); // wait longer for each attempt
              }
            }
          }
          
          if (fileCreated && csvFile) {
            fileIds[key] = csvFile.id;
            successCount++;
            
            // Store content in local storage as backup
            if (csvFile.id.startsWith('local-')) {
              localStorage.setItem(`unitopia_csv_${key}`, initialContent);
              console.log(`[CSV INIT] Stored backup content for ${key} in localStorage`);
            } else {
              console.log(`[CSV INIT] Successfully created OneDrive file for ${key}`);
              // Also store a backup copy just in case
              localStorage.setItem(`unitopia_csv_backup_${key}`, initialContent);
            }
          } else {
            console.error(`[CSV INIT] Failed to create CSV file after ${attempts} attempts: ${fileName}`);
            
            // Create a fallback local ID if all attempts failed
            if (!fileIds[key]) {
              const localId = `local-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
              fileIds[key] = localId;
              
              // Create default headers for fallback content
              const defaultHeaders = getDefaultHeaders(key);
              const fallbackContent = defaultHeaders.join(',') + '\n';
              
              localStorage.setItem(`unitopia_csv_${key}`, fallbackContent);
              console.log(`[CSV INIT] Created fallback local ID for ${key}: ${localId}`);
              useLocalStorage = true;
            }
            
            failCount++;
          }
        } catch (fileError) {
          console.error(`[CSV INIT] Error creating CSV file ${fileName}:`, fileError);
          
          // Create a fallback local ID if all attempts failed
          if (!fileIds[key]) {
            const localId = `local-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
            fileIds[key] = localId;
            
            // Create default headers for fallback content
            const defaultHeaders = getDefaultHeaders(key);
            const fallbackContent = defaultHeaders.join(',') + '\n';
            
            localStorage.setItem(`unitopia_csv_${key}`, fallbackContent);
            console.log(`[CSV INIT] Created fallback local ID for ${key}: ${localId}`);
            useLocalStorage = true;
          }
          
          failCount++;
        }
        
        // Brief pause between file creations to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 800));
      }
      
      // If all attempts failed with OneDrive, mark that we should use local storage
      if (failCount > 0 && successCount === 0) {
        useLocalStorage = true;
        localStorage.setItem('unitopia_storage_type', 'local');
        console.warn('[CSV INIT] All OneDrive operations failed, switching to local storage mode');
      }
      
      // Update the config with the file IDs if we have at least one
      if (Object.keys(fileIds).length > 0) {
        console.log(`[CSV INIT] Updating config with ${Object.keys(fileIds).length} file IDs:`, fileIds);
        const updatedConfig = {
          ...config,
          fileIds,
          isUsingLocalStorage: useLocalStorage,
          forceCreation: false // Reset force creation flag
        };
        
        onConfigChange(updatedConfig);
        
        // Mark that we've attempted initialization in this session
        sessionStorage.setItem(sessionKey, 'true');
        
        if (failCount === 0) {
          toast.success(`CSV files created successfully (${successCount} of ${Object.keys(config.fileNames).length})`);
        } else if (successCount > 0) {
          toast.info(`Some CSV files were created (${successCount} of ${Object.keys(config.fileNames).length}). Using local backup for others.`);
        } else {
          toast.warning('Using local storage as OneDrive connection failed.');
        }
      } else {
        console.error('[CSV INIT] Failed to create any CSV files');
        toast.error('Failed to create CSV files in OneDrive');
      }
      
      console.log(`[CSV INIT] CSV initialization complete. Success: ${successCount}, Failed: ${failCount}, Using local storage: ${useLocalStorage}`);
    } catch (err) {
      console.error('[CSV INIT] Error initializing CSV files:', err);
      setError('Failed to initialize CSV files');
      toast.error(`Failed to initialize CSV files: ${err.message || 'Unknown error'}`);
      
      // Create fallback local IDs for all files
      const localFileIds: { [key: string]: string } = {};
      for (const key of Object.keys(config.fileNames || {})) {
        const localId = `local-${Date.now()}-${key}`;
        localFileIds[key] = localId;
      }
      
      // Update config with local IDs
      if (Object.keys(localFileIds).length > 0) {
        console.log(`[CSV INIT] Using fallback local IDs due to error:`, localFileIds);
        const updatedConfig = {
          ...config,
          fileIds: localFileIds,
          isUsingLocalStorage: true,
          forceCreation: false // Reset force creation flag
        };
        onConfigChange(updatedConfig);
        localStorage.setItem('unitopia_storage_type', 'local');
      }
      
      throw err; // Re-throw to allow caller to handle
    } finally {
      setIsLoading(false);
      setHasAttemptedInit(true);
    }
  }, [config, createCsvFile, onConfigChange, hasAttemptedInit, toast]);

  // Load data from CSV files
  const loadDataFromCsv = useCallback(async () => {
    if (!config || Object.keys(config.fileIds || {}).length === 0) return;

    setIsLoading(true);
    setError(null);

    try {
      const updatedData: { [key: string]: { headers: string[]; rows: any[] } } = {};

      // Load data from each CSV file
      for (const [key, fileId] of Object.entries(config.fileIds)) {
        if (!fileId) continue;
        
        console.log(`Loading data from CSV file: ${config.fileNames[key]} (${fileId})`);
        
        const csvContent = await readCsvFile(fileId);
        
        if (!csvContent || csvContent.trim() === '') {
          // If file is empty, initialize with headers
          updatedData[key] = {
            headers: config.data[key]?.headers || [],
            rows: []
          };
          continue;
        }
        
        // Parse CSV content
        const lines = csvContent.split('\n').filter(line => line.trim() !== '');
        
        if (lines.length === 0) {
          updatedData[key] = {
            headers: config.data[key]?.headers || [],
            rows: []
          };
          continue;
        }
        
        // First line is headers
        const headers = lines[0].split(',').map(h => h.trim());
        
        // Rest are data rows
        const rows = lines.slice(1).map(line => {
          const values = parseCsvLine(line);
          const row: Record<string, any> = {};
          
          headers.forEach((header, index) => {
            row[header] = values[index] || '';
          });
          
          return row;
        });
        
        updatedData[key] = {
          headers,
          rows
        };
      }

      // Update the config with the loaded data
      onConfigChange({
        ...config,
        data: {
          ...config.data,
          ...updatedData
        }
      });

      toast.success('Data loaded from CSV successfully');
    } catch (err) {
      console.error('Error loading data from CSV:', err);
      setError('Failed to load data from CSV');
      toast.error('Failed to load data from CSV');
    } finally {
      setIsLoading(false);
    }
  }, [config, readCsvFile, onConfigChange]);

  // Parse a CSV line handling quoted values correctly
  const parseCsvLine = (line: string): string[] => {
    const values: string[] = [];
    let currentValue = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        // Toggle quote state
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        // End of value
        values.push(currentValue);
        currentValue = '';
      } else {
        // Add character to current value
        currentValue += char;
      }
    }
    
    // Add the last value
    values.push(currentValue);
    
    return values;
  };

  // Save data to CSV
  const saveDataToCsv = useCallback(async () => {
    if (!config) {
      console.error('[CSV SAVE] Cannot save data to CSV: Missing configuration');
      return false;
    }

    // Check if we have at least some file IDs
    if (!config.fileIds || Object.keys(config.fileIds).length === 0) {
      console.error('[CSV SAVE] Cannot save data to CSV: No file IDs available', config);
      return false;
    }

    if (!config.data || Object.keys(config.data).length === 0) {
      console.warn('[CSV SAVE] No data to save to CSV');
      return true; // Not an error, just no data to save
    }

    setIsLoading(true);
    setError(null);

    try {
      const dataKeys = Object.keys(config.data);
      console.log(`[CSV SAVE] Processing save for ${dataKeys.length} data sets:`, dataKeys);

      // Force OneDrive save regardless of local IDs
      console.log('[CSV SAVE] Prioritizing save to OneDrive...');
      
      // First try to save to OneDrive
      try {
        // If we have any local file IDs, create real OneDrive files first
        const hasLocalFileIds = Object.values(config.fileIds).some(id => id && id.toString().startsWith('local-'));
        
        if (hasLocalFileIds && createCsvFile) {
          console.log('[CSV SAVE] Detected local file IDs, attempting to create real OneDrive files first');
          
          const updatedFileIds = {...config.fileIds};
          let filesCreated = 0;
          
          // Create OneDrive files for any local IDs
          for (const [key, fileId] of Object.entries(updatedFileIds)) {
            if (fileId && fileId.toString().startsWith('local-')) {
              console.log(`[CSV SAVE] Creating real OneDrive file for ${key} to replace local ID ${fileId}`);
              
              // Create CSV content
              const dataSet = config.data[key];
              const fileName = config.fileNames?.[key] || `${key}.csv`;
              
              if (dataSet && dataSet.headers) {
                let content = dataSet.headers.join(',') + '\n';
                
                if (dataSet.rows) {
                  for (const row of dataSet.rows) {
                    const rowValues = dataSet.headers.map(header => {
                      const value = row[header];
                      
                      if (value === null || value === undefined) {
                        return '';
                      } else if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                        return `"${value.replace(/"/g, '""')}"`;
                      } else {
                        return String(value);
                      }
                    });
                    
                    content += rowValues.join(',') + '\n';
                  }
                }
                
                try {
                  // Create file in OneDrive
                  const csvFile = await createCsvFile(fileName, content, config.folderId);
                  
                  if (csvFile && csvFile.id && !csvFile.id.toString().startsWith('local-')) {
                    console.log(`[CSV SAVE] Successfully created OneDrive file ${fileName} with ID ${csvFile.id}`);
                    updatedFileIds[key] = csvFile.id;
                    filesCreated++;
                  }
                } catch (createError) {
                  console.error(`[CSV SAVE] Failed to create OneDrive file for ${key}:`, createError);
                }
              }
            }
          }
          
          // If we created any new files, update the config
          if (filesCreated > 0) {
            console.log(`[CSV SAVE] Created ${filesCreated} new OneDrive files, updating config`);
            onConfigChange({
              ...config,
              fileIds: updatedFileIds,
              isUsingLocalStorage: false
            });
            
            // Update local reference for the current operation
            config.fileIds = updatedFileIds;
            
            // Clear local storage flag
            localStorage.removeItem('unitopia_storage_type');
          }
        }
        
        // Try to save to OneDrive
        const results = await saveToOneDrive();
        
        if (results.success) {
          console.log('[CSV SAVE] Successfully saved to OneDrive');
          toast.success('Data saved to OneDrive successfully');
          return true;
        } else {
          console.warn('[CSV SAVE] OneDrive save failed with errors:', results.message);
          
          // Only fall back to localStorage if absolutely necessary
          if ('filesProcessed' in results && results.filesProcessed === 0) {
            console.warn('[CSV SAVE] No files saved to OneDrive, falling back to localStorage');
            await saveToLocalStorage();
            toast.warning('Saved to local storage instead of OneDrive. Please check your connection.');
            return true;
          } else {
            const filesProcessed = 'filesProcessed' in results ? results.filesProcessed : 0;
            toast.warning(`Partially saved to OneDrive (${filesProcessed} files). Some files could not be saved.`);
            return true;
          }
        }
      } catch (oneDriveError) {
        console.error('[CSV SAVE] OneDrive save error:', oneDriveError);
        toast.error('Failed to save to OneDrive: ' + (oneDriveError.message || 'Unknown error'));
        
        // Fall back to localStorage as last resort
        console.warn('[CSV SAVE] Falling back to localStorage as last resort');
        await saveToLocalStorage();
        return true;
      }
    } catch (err) {
      console.error('[CSV SAVE] Error saving data to CSV:', err);
      setError(`Failed to save data: ${err.message}`);
      toast.error('Error saving data: ' + (err.message || 'Unknown error'));
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [config, updateCsvFile, createCsvFile, onConfigChange]);

  // Save to localStorage helper
  const saveToLocalStorage = useCallback(async () => {
    console.log('[CSV SAVE] Saving data to localStorage');
    
    if (!config || !config.data) {
      console.error('[CSV SAVE] Missing config or data for localStorage save');
      return { success: false, message: 'Missing config or data' };
    }
    
    const results: { 
      success: boolean; 
      filesProcessed: number; 
      filesFailed: number;
      message?: string; 
    } = { 
      success: true, 
      filesProcessed: 0, 
      filesFailed: 0 
    };
    
    try {
      for (const [key, dataSet] of Object.entries(config.data)) {
        const fileName = config.fileNames?.[key] || `${key}.csv`;
        console.log(`[CSV SAVE] Processing local file: ${fileName}`);
        
        if (!dataSet.headers || !dataSet.rows) {
          console.warn(`[CSV SAVE] Invalid data structure for ${key}, skipping`);
          continue;
        }
        
        // Convert data to CSV
        let content = dataSet.headers.join(',') + '\n';
        
        for (const row of dataSet.rows) {
          const rowValues = dataSet.headers.map(header => {
            const value = row[header];
            
            // Handle values that need special formatting
            if (value === null || value === undefined) {
              return '';
            } else if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
              return `"${value.replace(/"/g, '""')}"`;
            } else {
              return String(value);
            }
          });
          
          content += rowValues.join(',') + '\n';
        }
        
        console.log(`[CSV SAVE] File has ${dataSet.rows.length} rows and ${dataSet.headers.length} headers`);
        
        // Save to localStorage
        localStorage.setItem(`unitopia_csv_${key}`, content);
        console.log(`[CSV SAVE] Successfully saved ${fileName} to localStorage`);
        results.filesProcessed++;
      }
      
      // Store timestamp of last save
      const timestamp = new Date().toISOString();
      localStorage.setItem('unitopia_csv_last_saved', timestamp);
      console.log(`[CSV SAVE] Local storage save complete at ${timestamp}`);
      console.log(`[CSV SAVE] Results: ${results.filesProcessed} files saved, ${results.filesFailed} files failed`);
      
      return results;
    } catch (err) {
      console.error('[CSV SAVE] Error saving to localStorage:', err);
      return { success: false, message: err.message };
    }
  }, [config]);
  
  // Save to OneDrive helper
  const saveToOneDrive = useCallback(async () => {
    console.log('[CSV SAVE] Attempting to save data to OneDrive');
    
    if (!config || !config.data || !config.fileIds) {
      console.error('[CSV SAVE] Missing config, data, or fileIds for OneDrive save');
      return { success: false, message: 'Missing config, data, or fileIds' };
    }
    
    if (!updateCsvFile || typeof updateCsvFile !== 'function') {
      console.error('[CSV SAVE] updateCsvFile function not available');
      return { success: false, message: 'updateCsvFile function not available' };
    }
    
    const results: { 
      success: boolean; 
      filesProcessed: number; 
      filesFailed: number;
      message?: string; 
    } = { 
      success: true, 
      filesProcessed: 0, 
      filesFailed: 0 
    };
    const errors: string[] = [];
    
    try {
      for (const [key, dataSet] of Object.entries(config.data)) {
        // Skip keys without file IDs
        const fileId = config.fileIds[key];
        if (!fileId) {
          console.warn(`[CSV SAVE] No file ID for ${key}, skipping`);
          continue;
        }
        
        // If it's a local ID, warn but continue anyway since we might have just created a real file
        if (fileId.toString().startsWith('local-')) {
          console.warn(`[CSV SAVE] Local storage ID detected for ${key}, will try OneDrive save anyway: ${fileId}`);
          // We won't skip here, since we might have created a real file
        }
        
        const fileName = config.fileNames?.[key] || `${key}.csv`;
        console.log(`[CSV SAVE] Processing OneDrive file: ${fileName} (${fileId})`);
        
        if (!dataSet.headers || !dataSet.rows) {
          console.warn(`[CSV SAVE] Invalid data structure for ${key}, skipping`);
          continue;
        }
        
        // Convert data to CSV
        let content = dataSet.headers.join(',') + '\n';
        
        for (const row of dataSet.rows) {
          const rowValues = dataSet.headers.map(header => {
            const value = row[header];
            
            // Handle values that need special formatting
            if (value === null || value === undefined) {
              return '';
            } else if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
              return `"${value.replace(/"/g, '""')}"`;
            } else {
              return String(value);
            }
          });
          
          content += rowValues.join(',') + '\n';
        }
        
        console.log(`[CSV SAVE] OneDrive file has ${dataSet.rows.length} rows and ${dataSet.headers.length} headers`);
        
        try {
          // Don't attempt to update local IDs with updateCsvFile
          if (fileId.toString().startsWith('local-')) {
            console.warn(`[CSV SAVE] Cannot update local file ID with OneDrive: ${fileId}`);
            errors.push(`Cannot update local ID for ${fileName}`);
            results.filesFailed++;
            continue;
          }
          
          // Update the OneDrive file
          const updated = await updateCsvFile(fileId, content);
          
          if (updated) {
            console.log(`[CSV SAVE] Successfully updated OneDrive file: ${fileName} (${fileId})`);
            results.filesProcessed++;
            
            // Also save to localStorage as backup
            localStorage.setItem(`unitopia_csv_backup_${key}`, content);
          } else {
            console.error(`[CSV SAVE] Failed to update OneDrive file: ${fileName} (${fileId})`);
            errors.push(`Failed to update ${fileName}`);
            results.filesFailed++;
          }
        } catch (fileError) {
          console.error(`[CSV SAVE] Error updating OneDrive file ${fileName}:`, fileError);
          errors.push(`Error with ${fileName}: ${fileError.message}`);
          results.filesFailed++;
        }
      }
      
      // Update results based on success/failure
      if (results.filesFailed > 0) {
        results.success = false;
        results.message = `Failed to update ${results.filesFailed} files: ${errors.join('; ')}`;
      } else {
        results.success = true;
        results.message = `Successfully updated ${results.filesProcessed} files`;
      }
      
      console.log(`[CSV SAVE] OneDrive save complete. Results: ${results.filesProcessed} files updated, ${results.filesFailed} files failed`);
      return results;
    } catch (err) {
      console.error('[CSV SAVE] Error saving to OneDrive:', err);
      return { success: false, message: err.message };
    }
  }, [config, updateCsvFile]);

  // Update data for a specific entity type
  const updateEntityData = useCallback((entityType: string, data: any[]) => {
    if (!config) return;

    // Get current timestamp for updates
    const currentTimestamp = new Date().toISOString();

    // Add timestamps to the data
    const updatedData = data.map(item => ({
      ...item,
      updatedAt: currentTimestamp,
      createdAt: item.createdAt || currentTimestamp
    }));

    const newConfigData = {
      ...config.data,
      [entityType]: {
        headers: config.data[entityType]?.headers || [],
        rows: updatedData
      }
    };

    onConfigChange({
      ...config,
      data: newConfigData
    });
  }, [config, onConfigChange]);

  // Initialize CSV files on mount if needed
  useEffect(() => {
    if (!isSetupComplete && config && Object.keys(config.fileIds || {}).length === 0 && !hasAttemptedInit) {
      initializeCsvFiles();
    }
  }, [config, initializeCsvFiles, hasAttemptedInit, isSetupComplete]);

  // Helper function to get default headers for a given entity type
  const getDefaultHeaders = (entityType: string): string[] => {
    switch (entityType) {
      case 'objectives':
        return ['id', 'name', 'description', 'startDate', 'endDate', 'createdAt', 'updatedAt'];
      case 'kras':
        return ['id', 'name', 'department', 'responsible', 'objectiveId', 'objectiveName', 'startDate', 'endDate', 'status', 'createdAt', 'updatedAt'];
      case 'kpis':
        return ['id', 'name', 'kraId', 'kraName', 'target', 'actual', 'status', 'startDate', 'date', 'createdAt', 'updatedAt'];
      case 'tasks':
        return ['id', 'title', 'description', 'status', 'priority', 'assignee', 'dueDate', 'projectId', 'projectName', 'createdAt', 'updatedAt'];
      case 'projects':
        return ['id', 'name', 'description', 'status', 'startDate', 'endDate', 'manager', 'progress', 'createdAt', 'updatedAt'];
      case 'risks':
        return ['id', 'title', 'description', 'impact', 'likelihood', 'status', 'category', 'projectId', 'projectName', 'owner', 'createdAt', 'updatedAt'];
      case 'assets':
        return ['id', 'name', 'type', 'serialNumber', 'assignedTo', 'department', 'purchaseDate', 'warrantyExpiry', 'status', 'notes', 'createdAt', 'updatedAt'];
      default:
        return ['id', 'name', 'createdAt', 'updatedAt'];
    }
  };

  return {
    isLoading,
    error,
    loadDataFromCsv,
    saveDataToCsv,
    updateEntityData,
    setCsvSyncConfig: (config: CsvSyncConfig) => {
      if (!config.folderId) {
        console.error('[CSV CONFIG] Cannot set config without folder ID');
        return;
      }
      onConfigChange(config);
    }
  };
}; 