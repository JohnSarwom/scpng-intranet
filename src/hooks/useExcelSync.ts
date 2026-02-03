import { useState, useEffect, useCallback } from 'react';
import { useMicrosoftGraph } from './useMicrosoftGraph';
import { toast } from 'sonner';

export interface ExcelSyncConfig {
  folderId: string;
  fileName: string;
  fileId?: string;
  sheets: {
    [key: string]: {
      name: string;
      headers: string[];
      data: any[];
    };
  };
}

export interface UseExcelSyncProps {
  config: ExcelSyncConfig | null;
  onConfigChange: (config: ExcelSyncConfig) => void;
  isSetupComplete: boolean;
}

export const useExcelSync = ({ config, onConfigChange, isSetupComplete }: UseExcelSyncProps) => {
  const { createExcelFile, readExcelFile, updateExcelFile, getExcelSheets } = useMicrosoftGraph();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasAttemptedInit, setHasAttemptedInit] = useState(false);

  // Initialize Excel file if it doesn't exist
  const initializeExcelFile = useCallback(async () => {
    if (!config || config.fileId || hasAttemptedInit) return;

    setIsLoading(true);
    setError(null);

    try {
      // Check if we've already attempted to create a file in this session
      const sessionKey = `excel_init_attempt_${config.folderId}_${config.fileName}`;
      const hasAttemptedInSession = sessionStorage.getItem(sessionKey);
      
      if (hasAttemptedInSession) {
        console.log('Excel file creation already attempted in this session, skipping');
        setHasAttemptedInit(true);
        return;
      }
      
      console.log('Creating Excel file in folder:', config.folderId, 'with name:', config.fileName);
      
      // Create a new Excel file
      const excelFile = await createExcelFile(config.fileName, config.folderId);
      
      if (!excelFile) {
        throw new Error('Failed to create Excel file');
      }

      console.log('Excel file created successfully with ID:', excelFile.id);

      // Update the config with the file ID
      onConfigChange({
        ...config,
        fileId: excelFile.id
      });

      // Mark that we've attempted initialization in this session
      sessionStorage.setItem(sessionKey, 'true');

      toast.success('Excel file created successfully');
      
      // Return the file ID for immediate use
      return excelFile.id;
    } catch (err) {
      console.error('Error initializing Excel file:', err);
      setError('Failed to initialize Excel file');
      toast.error('Failed to initialize Excel file');
      throw err; // Re-throw to allow caller to handle
    } finally {
      setIsLoading(false);
      setHasAttemptedInit(true);
    }
  }, [config, createExcelFile, onConfigChange, hasAttemptedInit]);

  // Load data from Excel file
  const loadDataFromExcel = useCallback(async () => {
    if (!config || !config.fileId) return;

    setIsLoading(true);
    setError(null);

    try {
      const updatedSheets: { [key: string]: any } = {};

      // Load data from each sheet
      for (const [key, sheet] of Object.entries(config.sheets)) {
        const data = await readExcelFile(config.fileId!, sheet.name, 'A1:Z1000');
        
        if (!data || data.length === 0) {
          // If sheet is empty, initialize it with headers
          await updateExcelFile(config.fileId!, sheet.name, 'A1', [sheet.headers]);
          updatedSheets[key] = {
            ...sheet,
            data: []
          };
        } else {
          // Parse data from Excel
          const headers = data[0];
          const rows = data.slice(1).map(row => {
            const obj: any = {};
            headers.forEach((header: string, index: number) => {
              obj[header] = row[index] || '';
            });
            return obj;
          });

          updatedSheets[key] = {
            ...sheet,
            data: rows
          };
        }
      }

      // Update the config with the loaded data
      onConfigChange({
        ...config,
        sheets: updatedSheets
      });

      toast.success('Data loaded from Excel successfully');
    } catch (err) {
      console.error('Error loading data from Excel:', err);
      setError('Failed to load data from Excel');
      toast.error('Failed to load data from Excel');
    } finally {
      setIsLoading(false);
    }
  }, [config, readExcelFile, updateExcelFile, onConfigChange]);

  // Save data to Excel file
  const saveDataToExcel = useCallback(async () => {
    if (!config || !config.fileId) {
      console.error('Cannot save data to Excel: Missing config or fileId', { config });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('Saving data to Excel file with ID:', config.fileId);
      console.log('Sheets to save:', Object.keys(config.sheets));
      
      // Save data to each sheet
      for (const [key, sheet] of Object.entries(config.sheets)) {
        console.log(`Processing sheet: ${sheet.name} with ${sheet.data?.length || 0} rows and ${sheet.headers?.length || 0} columns`);
        
        // Skip sheets with no data or headers
        if (!sheet.headers || sheet.headers.length === 0) {
          console.warn(`Skipping sheet ${sheet.name}: No headers defined`);
          continue;
        }
        
        // Ensure the data is an array
        const dataArray = Array.isArray(sheet.data) ? sheet.data : [];
        
        // Convert data to 2D array for Excel with proper validation
        const headerRow = [...sheet.headers]; // Create a copy of headers
        
        // Map each data item to a row, ensuring all header cells have a corresponding value
        const dataRows = dataArray.map(item => {
          // For each header, extract the corresponding value from the data item
          return headerRow.map(header => {
            // Get the value for this header, or empty string if not found
            const value = item[header];
            
            // Convert null or undefined to empty string to avoid Excel errors
            return value === null || value === undefined ? '' : String(value);
          });
        });
        
        // Combine headers and data
        const excelData = [headerRow, ...dataRows];
        
        console.log(`Updating Excel file with ${excelData.length} rows for sheet ${sheet.name}`);
        
        try {
          // Update Excel file
          const success = await updateExcelFile(config.fileId, sheet.name, 'A1', excelData);
          
          if (!success) {
            throw new Error(`Failed to update sheet ${sheet.name}`);
          }
          
          console.log(`Successfully updated sheet ${sheet.name}`);
        } catch (sheetError) {
          console.error(`Error updating sheet ${sheet.name}:`, sheetError);
          // Continue with other sheets rather than failing completely
        }
      }

      toast.success('Data saved to Excel successfully');
    } catch (err) {
      console.error('Error saving data to Excel:', err);
      setError('Failed to save data to Excel');
      toast.error('Failed to save data to Excel');
      throw err; // Re-throw to allow caller to handle
    } finally {
      setIsLoading(false);
    }
  }, [config, updateExcelFile]);

  // Update data in a specific sheet
  const updateSheetData = useCallback((sheetKey: string, data: any[]) => {
    if (!config) return;

    const updatedSheets = {
      ...config.sheets,
      [sheetKey]: {
        ...config.sheets[sheetKey],
        data
      }
    };

    onConfigChange({
      ...config,
      sheets: updatedSheets
    });
  }, [config, onConfigChange]);

  // Initialize Excel file on mount if needed
  useEffect(() => {
    if (!isSetupComplete && config && !config.fileId && !hasAttemptedInit) {
      initializeExcelFile();
    }
  }, [config, initializeExcelFile, hasAttemptedInit, isSetupComplete]);

  return {
    isLoading,
    error,
    loadDataFromExcel,
    saveDataToExcel,
    updateSheetData
  };
}; 