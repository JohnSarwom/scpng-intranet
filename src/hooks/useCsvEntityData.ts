import { useState, useEffect, useCallback } from 'react';
import { useCsvSync, CsvSyncConfig } from './useCsvSync';
import { toast } from '@/components/ui/use-toast';

// Generic type for entity data
type EntityData<T> = {
  data: T[];
  isLoading: boolean;
  error: string | null;
  add: (item: Omit<T, 'id'>) => Promise<T | null>;
  edit: (id: string, updatedItem: Partial<T>) => Promise<T | null>;
  remove: (id: string) => Promise<boolean>;
  refresh: () => Promise<void>;
};

export function useCsvEntityData<T extends { id: string }>(
  entityType: 'tasks' | 'projects' | 'risks' | 'assets' | 'objectives' | 'kras' | 'kpis'
): EntityData<T> {
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Placeholder/Disabled fetch logic
  const fetchData = useCallback(async () => {
    console.warn(`[${entityType}] useCsvEntityData is disabled. Data will not be fetched from CSV.`);
    setIsLoading(true); // Indicate loading starts
    setError('CSV data source is disabled.'); 
    setData([]); // Ensure data is empty
    setIsLoading(false); // Indicate loading finishes (quickly)
  }, [entityType]);

  // Load initial data (will now just set error and empty data)
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Modify Add/Edit/Remove to be no-ops or log warnings
  const add = useCallback(async (item: Omit<T, 'id'>): Promise<T | null> => {
    console.warn(`[${entityType}] Add operation disabled (useCsvEntityData).`);
    toast({ title: "Operation Disabled", description: `Cannot add ${entityType} via CSV source.`, variant: "destructive" });
    return null; // Indicate failure or no-op
  }, [entityType]);

  const edit = useCallback(async (id: string, updatedItem: Partial<T>): Promise<T | null> => {
    console.warn(`[${entityType}] Edit operation disabled (useCsvEntityData). ID: ${id}`);
    toast({ title: "Operation Disabled", description: `Cannot edit ${entityType} via CSV source.`, variant: "destructive" });
    return null; // Indicate failure or no-op
  }, [entityType]);

  const remove = useCallback(async (id: string): Promise<boolean> => {
    console.warn(`[${entityType}] Remove operation disabled (useCsvEntityData). ID: ${id}`);
    toast({ title: "Operation Disabled", description: `Cannot remove ${entityType} via CSV source.`, variant: "destructive" });
    return false; // Indicate failure or no-op
  }, [entityType]);

  // Refresh function is now just the fetchData placeholder
  const refresh = fetchData;

  return {
    data,
    isLoading,
    error,
    add,
    edit,
    remove,
    refresh,
  };
} 