import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { initializeCsvFiles } from '../hooks/useCsvSync';
import { validateCSV } from '../utils/csv-helpers';

// Mock nextauth
vi.mock('next-auth/react', () => ({
  useSession: () => ({
    data: {
      accessToken: 'mock-token'
    },
    status: 'authenticated'
  })
}));

// Mock fetch
global.fetch = vi.fn();

describe('CSV Sync Functions', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('initializeCsvFiles', () => {
    it('should create all required CSV files successfully', async () => {
      // Mock successful API responses
      const mockResponses = {
        objectives: { id: 'obj-file-id', name: 'objectives.csv' },
        kras: { id: 'kra-file-id', name: 'kras.csv' },
        kpis: { id: 'kpi-file-id', name: 'kpis.csv' },
        tasks: { id: 'task-file-id', name: 'tasks.csv' },
        projects: { id: 'project-file-id', name: 'projects.csv' },
        risks: { id: 'risk-file-id', name: 'risks.csv' },
        assets: { id: 'asset-file-id', name: 'assets.csv' }
      };

      // Setup fetch mock to return success for each file
      (global.fetch as any).mockImplementation((url: string, options: any) => {
        const fileType = url.includes('files') && options.method === 'POST' 
          ? options.body.get('name').split('.')[0] 
          : null;
        
        if (fileType && mockResponses[fileType]) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockResponses[fileType])
          });
        }
        
        return Promise.resolve({
          ok: false,
          status: 404,
          statusText: 'Not Found'
        });
      });

      // Mock config without file IDs
      const mockConfig = {
        driveId: 'test-drive-id',
        folderId: 'test-folder-id',
        fileIds: {}
      };

      // Call function with empty config
      const result = await initializeCsvFiles(mockConfig);

      // Verify success
      expect(result.success).toBe(true);
      expect(result.config.fileIds).toEqual({
        objectives: 'obj-file-id',
        kras: 'kra-file-id',
        kpis: 'kpi-file-id',
        tasks: 'task-file-id',
        projects: 'project-file-id',
        risks: 'risk-file-id',
        assets: 'asset-file-id'
      });
      
      // Verify fetch called correct number of times (7 files)
      expect(global.fetch).toHaveBeenCalledTimes(7);
    });

    it('should handle API errors and retry file creation', async () => {
      // Mock config without file IDs
      const mockConfig = {
        driveId: 'test-drive-id',
        folderId: 'test-folder-id',
        fileIds: {}
      };

      // First attempt fails for 'objectives', second succeeds
      let objectivesAttempts = 0;
      
      // Setup fetch mock to fail on first attempt for objectives
      (global.fetch as any).mockImplementation((url: string, options: any) => {
        if (url.includes('files') && options.method === 'POST') {
          const fileName = options.body.get('name');
          
          // First attempt for objectives.csv fails
          if (fileName === 'objectives.csv') {
            objectivesAttempts++;
            if (objectivesAttempts === 1) {
              return Promise.resolve({
                ok: false,
                status: 429,
                statusText: 'Too Many Requests'
              });
            }
          }
          
          // All other requests succeed
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ 
              id: `${fileName.split('.')[0]}-file-id`, 
              name: fileName 
            })
          });
        }
        
        return Promise.resolve({
          ok: false,
          status: 404,
          statusText: 'Not Found'
        });
      });

      // Call function
      const result = await initializeCsvFiles(mockConfig);

      // Verify success after retry
      expect(result.success).toBe(true);
      expect(result.config.fileIds.objectives).toBe('objectives-file-id');
      
      // Verify fetch called correct number of times (7 files + 1 retry)
      expect(global.fetch).toHaveBeenCalledTimes(8);
    });

    it('should fail if missing required config', async () => {
      // Test with missing driveId
      const resultMissingDrive = await initializeCsvFiles({
        folderId: 'folder-id',
        fileIds: {}
      } as any);
      
      expect(resultMissingDrive.success).toBe(false);
      expect(resultMissingDrive.error).toContain('Missing required configuration');
      
      // Test with missing folderId
      const resultMissingFolder = await initializeCsvFiles({
        driveId: 'drive-id',
        fileIds: {}
      } as any);
      
      expect(resultMissingFolder.success).toBe(false);
      expect(resultMissingFolder.error).toContain('Missing required configuration');
    });
  });

  describe('CSV Validation', () => {
    it('should validate CSV structure correctly', () => {
      const validCsv = 'header1,header2,header3\nvalue1,value2,value3\nvalue4,value5,value6';
      const result = validateCSV(validCsv, ['header1', 'header2', 'header3']);
      expect(result.isValid).toBe(true);
      
      const invalidCsv = 'header1,header2\nvalue1,value2,extra\nvalue4,value5';
      const invalidResult = validateCSV(invalidCsv, ['header1', 'header2', 'header3']);
      expect(invalidResult.isValid).toBe(false);
    });
  });
}); 