import { useState, useCallback, useEffect, useMemo } from 'react';
import { CsvSyncConfig } from './useCsvSync';
import { toast } from 'sonner';

export interface SetupWizardState {
  showSetupWizard: boolean;
  setShowSetupWizard: (show: boolean) => void;
  oneDriveConfig: {
    folderId: string;
    folderName: string;
    isTemporary?: boolean;
  } | null;
  setOneDriveConfig: (config: { folderId: string; folderName: string; isTemporary?: boolean } | null) => void;
  setupMethod: string;
  setSetupMethod: (method: string) => void;
  objectives: any[];
  setObjectives: (objectives: any[]) => void;
  kras: any[];
  setKRAs: (kras: any[]) => void;
  kpis: any[];
  setKPIs: (kpis: any[]) => void;
  csvConfig: CsvSyncConfig | null;
  setCsvConfig: (config: CsvSyncConfig | null) => void;
  isSetupComplete: boolean;
  resetSetup: () => void;
  updateCsvConfig: () => void;
  handleSetupComplete: () => void;
  setupLocation: string;
  setSetupLocation: (location: string) => void;
  switchToOneDrive: (folderConfig: { folderId: string; folderName: string }) => Promise<boolean>;
}

interface UseSetupWizardProps {
  projectState: any;
  taskState: any;
  riskState: any;
  kraState: any;
  assetState: any;
}

export const useSetupWizard = ({
  projectState,
  taskState,
  riskState,
  kraState,
  assetState,
}: UseSetupWizardProps): SetupWizardState => {
  const [showSetupWizard, setShowSetupWizard] = useState(false);
  const [oneDriveConfig, setOneDriveConfig] = useState<{ folderId: string; folderName: string; isTemporary?: boolean } | null>(null);
  const [setupMethod, setSetupMethod] = useState<string>('');
  const [objectives, setObjectives] = useState<any[]>([]);
  const [kras, setKRAs] = useState<any[]>([]);
  const [kpis, setKPIs] = useState<any[]>([]);
  const [csvConfig, setCsvConfig] = useState<CsvSyncConfig | null>(null);
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [setupLocation, setSetupLocation] = useState<string>('');

  // Initialize setup state
  useEffect(() => {
    if (!isInitialized) {
      // Load saved state from localStorage if available
      const savedState = localStorage.getItem('setupWizardState');
      if (savedState) {
        try {
          const parsed = JSON.parse(savedState);
          setOneDriveConfig(parsed.oneDriveConfig || null);
          setSetupMethod(parsed.setupMethod || '');
          setObjectives(parsed.objectives || []);
          setKPIs(parsed.kpis || []);
          setCsvConfig(parsed.csvConfig || null);
          setIsSetupComplete(parsed.isSetupComplete || false);
          
          // If setup is complete, ensure we don't show the wizard
          if (parsed.isSetupComplete) {
            setShowSetupWizard(false);
          }
        } catch (error) {
          console.error('Error loading saved setup state:', error);
        }
      }
      
      // Add a flag to prevent multiple initializations
      localStorage.setItem('setupWizardInitialized', 'true');
      setIsInitialized(true);
    }
  }, [isInitialized]);

  // Save state to localStorage when it changes
  useEffect(() => {
    if (isInitialized) {
      const stateToSave = {
        oneDriveConfig,
        setupMethod,
        objectives,
        kpis,
        csvConfig,
        isSetupComplete
      };
      localStorage.setItem('setupWizardState', JSON.stringify(stateToSave));
    }
  }, [isInitialized, oneDriveConfig, setupMethod, objectives, kpis, csvConfig, isSetupComplete]);

  // Reset setup state
  const resetSetup = useCallback(() => {
    setOneDriveConfig(null);
    setSetupMethod('');
    setObjectives([]);
    setKPIs([]);
    setCsvConfig(null);
    setIsSetupComplete(false);
    localStorage.removeItem('setupWizardState');
  }, []);

  // Create CSV configuration based on setup method and data
  const createCsvConfig = useCallback(() => {
    if (!oneDriveConfig) return null;

    // Define file names for each entity type
    const fileNames = {
      objectives: 'objectives.csv',
      kras: 'kras.csv',
      kpis: 'kpis.csv',
      tasks: 'tasks.csv',
      projects: 'projects.csv',
      risks: 'risks.csv',
      assets: 'assets.csv'
    };

    // Define headers for each entity type
    const headers = {
      objectives: ['id', 'name', 'description', 'startDate', 'endDate', 'createdAt', 'updatedAt'],
      kras: ['id', 'name', 'objectiveId', 'objectiveName', 'department', 'responsible', 'startDate', 'endDate', 'progress', 'status', 'createdAt', 'updatedAt'],
      kpis: ['id', 'name', 'kraId', 'kraName', 'target', 'actual', 'status', 'description', 'notes', 'startDate', 'endDate', 'createdAt', 'updatedAt'],
      tasks: ['id', 'title', 'description', 'status', 'priority', 'assignee', 'dueDate', 'projectId', 'projectName', 'createdAt', 'updatedAt'],
      projects: ['id', 'name', 'description', 'status', 'startDate', 'endDate', 'manager', 'budget', 'budgetSpent', 'progress', 'createdAt', 'updatedAt'],
      risks: ['id', 'title', 'description', 'impact', 'likelihood', 'status', 'category', 'projectId', 'projectName', 'owner', 'createdAt', 'updatedAt'],
      assets: ['id', 'name', 'type', 'serialNumber', 'assignedTo', 'department', 'purchaseDate', 'warrantyExpiry', 'status', 'notes', 'createdAt', 'updatedAt']
    };

    // Get current timestamp
    const currentTimestamp = new Date().toISOString();

    // Prepare the data structure
    const data: {
      [key: string]: {
        headers: string[];
        rows: any[];
      };
    } = {};

    // Initialize data structure with headers and empty rows
    Object.keys(headers).forEach(key => {
      data[key] = {
        headers: headers[key as keyof typeof headers],
        rows: []
      };
    });

    // Add objectives
    if (objectives && objectives.length > 0) {
      data.objectives.rows = objectives.map(obj => ({
        id: obj.id || `obj-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        name: obj.name || '',
        description: obj.description || '',
        startDate: obj.startDate || '',
        endDate: obj.endDate || '',
        createdAt: obj.createdAt || currentTimestamp,
        updatedAt: currentTimestamp
      }));
    }

    // Add KPIs
    if (kpis && kpis.length > 0) {
      data.kpis.rows = kpis.map(kpi => ({
        ...kpi,
        createdAt: kpi.createdAt || currentTimestamp,
        updatedAt: currentTimestamp
      }));
    }

    // Add tasks if available - handle both patterns (old state or CSV entity data)
    if (taskState) {
      // Check for CSV entity data pattern
      if (taskState.data && Array.isArray(taskState.data)) {
        data.tasks.rows = taskState.data.map((task: any) => ({
          ...task,
          createdAt: task.createdAt || currentTimestamp,
          updatedAt: currentTimestamp
        }));
      }
      // Check for old pattern
      else if (taskState.tasks && Array.isArray(taskState.tasks)) {
        data.tasks.rows = taskState.tasks.map((task: any) => ({
          ...task,
          createdAt: task.createdAt || currentTimestamp,
          updatedAt: currentTimestamp
        }));
      }
    }

    // Add projects if available - handle both patterns
    if (projectState) {
      // Check for CSV entity data pattern
      if (projectState.data && Array.isArray(projectState.data)) {
        data.projects.rows = projectState.data.map((project: any) => ({
          ...project,
          createdAt: project.createdAt || currentTimestamp,
          updatedAt: currentTimestamp
        }));
      }
      // Check for old pattern
      else if (projectState.projects && Array.isArray(projectState.projects)) {
        data.projects.rows = projectState.projects.map((project: any) => ({
          ...project,
          createdAt: project.createdAt || currentTimestamp,
          updatedAt: currentTimestamp
        }));
      }
    }

    // Add risks if available - handle both patterns
    if (riskState) {
      // Check for CSV entity data pattern
      if (riskState.data && Array.isArray(riskState.data)) {
        data.risks.rows = riskState.data.map((risk: any) => ({
          ...risk,
          createdAt: risk.createdAt || currentTimestamp,
          updatedAt: currentTimestamp
        }));
      }
      // Check for old pattern
      else if (riskState.risks && Array.isArray(riskState.risks)) {
        data.risks.rows = riskState.risks.map((risk: any) => ({
          ...risk,
          createdAt: risk.createdAt || currentTimestamp,
          updatedAt: currentTimestamp
        }));
      }
    }

    // Add assets if available - handle both patterns
    if (assetState) {
      // Check for CSV entity data pattern
      if (assetState.data && Array.isArray(assetState.data)) {
        data.assets.rows = assetState.data.map((asset: any) => ({
          ...asset,
          createdAt: asset.createdAt || currentTimestamp,
          updatedAt: currentTimestamp
        }));
      }
      // Check for old pattern
      else if (assetState.assets && Array.isArray(assetState.assets)) {
        data.assets.rows = assetState.assets.map((asset: any) => ({
          ...asset,
          createdAt: asset.createdAt || currentTimestamp,
          updatedAt: currentTimestamp
        }));
      }
    }

    return {
      folderId: oneDriveConfig.folderId,
      fileNames,
      fileIds: {},
      data
    };
  }, [oneDriveConfig, objectives, kpis, taskState, projectState, riskState, assetState]);

  // Update CSV config when setup method or data changes
  const updateCsvConfig = useCallback(() => {
    const newConfig = createCsvConfig();
    setCsvConfig(newConfig);
  }, [createCsvConfig]);

  // Handle setup completion
  const handleSetupComplete = useCallback(() => {
    setIsSetupComplete(true);
    setShowSetupWizard(false);
    
    // Save the completion state immediately
    const currentState = {
      oneDriveConfig,
      setupMethod,
      objectives,
      kpis,
      csvConfig,
      isSetupComplete: true
    };
    localStorage.setItem('setupWizardState', JSON.stringify(currentState));
  }, [oneDriveConfig, setupMethod, objectives, kpis, csvConfig]);

  // Add a function to switch from local storage to OneDrive
  const switchToOneDrive = useCallback(async (folderConfig: { folderId: string; folderName: string }) => {
    if (!folderConfig || !folderConfig.folderId) {
      console.error('Missing folder configuration');
      toast.error('Cannot switch to OneDrive: Missing folder information');
      return false;
    }

    try {
      console.log('Switching from local storage to OneDrive mode');
      console.log('Target folder:', folderConfig);

      // Check if we have local data
      const isUsingLocalStorage = localStorage.getItem('unitopia_storage_type') === 'local';
      const hasLocalFiles = Object.values(csvConfig?.fileIds || {}).some(id => 
        typeof id === 'string' && id.startsWith('local-')
      );

      if (!isUsingLocalStorage && !hasLocalFiles) {
        console.warn('Not using local storage, nothing to migrate');
        toast.info('Already using OneDrive storage');
        return false;
      }

      // Update storage type
      localStorage.setItem('unitopia_storage_type', 'onedrive');

      // Update OneDrive config
      setOneDriveConfig(folderConfig);

      // We need to create new file IDs for OneDrive
      const newFileNames = {
        objectives: 'objectives.csv',
        kras: 'kras.csv',
        kpis: 'kpis.csv',
        tasks: 'tasks.csv',
        projects: 'projects.csv',
        risks: 'risks.csv',
        assets: 'assets.csv'
      };

      // Set up for CSV creation
      const newCsvConfig = {
        ...csvConfig,
        folderId: folderConfig.folderId,
        folderName: folderConfig.folderName,
        fileNames: newFileNames,
        fileIds: {} // Clear existing file IDs to force recreation
      };

      // Update config
      setCsvConfig(newCsvConfig);

      toast.success('Switched to OneDrive mode successfully');
      toast.info('Your data will be saved to OneDrive on next save');
      
      return true;
    } catch (error) {
      console.error('Error switching to OneDrive:', error);
      toast.error('Failed to switch to OneDrive mode');
      return false;
    }
  }, [csvConfig, setOneDriveConfig, setCsvConfig, toast]);

  // Memoize the returned object to prevent unnecessary re-renders
  return useMemo(() => ({
    showSetupWizard,
    setShowSetupWizard,
    oneDriveConfig,
    setOneDriveConfig,
    setupMethod,
    setSetupMethod,
    objectives,
    setObjectives,
    kras,
    setKRAs,
    kpis,
    setKPIs,
    csvConfig,
    setCsvConfig,
    isSetupComplete,
    resetSetup,
    updateCsvConfig,
    handleSetupComplete,
    setupLocation,
    setSetupLocation,
    switchToOneDrive
  }), [
    showSetupWizard,
    oneDriveConfig,
    setupMethod,
    objectives,
    kpis,
    csvConfig,
    isSetupComplete,
    resetSetup,
    updateCsvConfig,
    handleSetupComplete,
    setupLocation,
    switchToOneDrive
  ]);
}; 