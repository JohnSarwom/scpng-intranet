import { useState, useEffect, useCallback } from 'react';
import { useMsal } from '@azure/msal-react';
import { supabase, logger } from '@/lib/supabaseClient';
import { toast } from '@/components/ui/use-toast';
import { loginRequest } from '@/authConfig'; // Import MSAL request scopes
import {
    tasksService,
    projectsService,
    risksService,
    assetsService,
    krasService,
    kpisService,
    objectivesService
} from '@/integrations/supabase/unitService';
// --- Add Realtime types ---
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';
// --- End Add Realtime types ---

// Define the type for the 'id' field, allowing string or number
interface Identifiable {
    id?: string | number;
    assigned_to_email?: string | null; // Ensure this is defined for all T
}

// Define more specific function types
type FetchFunction<T> = () => Promise<T[]>; // Standard fetch (now less used)
type FetchWithEmailFunction = (userEmail: string) => Promise<any[]>; // Function-based fetch
type AddFunction<T> = (item: T, userEmail?: string) => Promise<T>;
type UpdateFunction<T> = (id: string, item: Partial<T>, userEmail?: string) => Promise<T>;
type DeleteFunction = (id: string, userEmail?: string) => Promise<boolean>;

// Type guard for MSAL account info
interface MsalAccountInfo {
    homeAccountId?: string;
    environment?: string;
    tenantId?: string;
    username?: string; // This typically holds the email
    localAccountId?: string;
    name?: string;
}

function isMsalAccountInfo(account: any): account is MsalAccountInfo {
    return account && typeof account.username === 'string';
}

// Define the possible entity types
type EntityType = 'tasks' | 'projects' | 'risks' | 'assets' | 'kras' | 'kpis' | 'objectives'; // Added kpis, objectives

// --- Add table name mapping ---
const entityTableMap: Record<EntityType, string> = {
    tasks: 'tasks',
    projects: 'projects',
    risks: 'risks',
    assets: 'assets',
    kras: 'kras',
    kpis: 'kpis',
    objectives: 'objectives',
};
// --- End table name mapping ---

// Extend the generic type to include assigned_to_email
export function useSupabaseData<T extends Identifiable>(
    entityType: EntityType,
    initialData: T[] = []
) {
    const [data, setData] = useState<T[]>(initialData);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);
    const { accounts } = useMsal(); // Get MSAL accounts
    const account = accounts[0]; // Get the primary account

    // Memoize helper functions for CRUD operations
    const getFetchMethod = useCallback((): FetchFunction<T> => {
        switch (entityType) {
            case 'tasks': return tasksService.getTasks as any;
            case 'projects': return projectsService.getProjects as any;
            case 'risks': return risksService.getRisks as any;
            case 'assets': return assetsService.getAssets as any;
            case 'kras': return krasService.getKRAs as any;
            case 'kpis': return kpisService.getKPIs as any;
            case 'objectives': return objectivesService.getObjectives as any;
            default: throw new Error(`Unknown entity type: ${entityType}`);
        }
    }, [entityType]);

    // Get the appropriate add method based on entity type
    const getAddMethod = useCallback((): AddFunction<T> => {
        switch (entityType) {
            case 'tasks': return tasksService.addTask as any;
            case 'projects': return projectsService.addProject as any;
            case 'risks': return risksService.addRisk as any;
            case 'assets': return assetsService.addAsset as any;
            case 'kras': return krasService.addKRA as any;
            case 'kpis': return kpisService.addKPI as any;
            case 'objectives': return objectivesService.addObjective as any;
            default: throw new Error(`Unknown entity type: ${entityType}`);
        }
    }, [entityType]);

    // Get the appropriate update method based on entity type
    const getUpdateMethod = useCallback((): UpdateFunction<T> => {
        switch (entityType) {
            case 'tasks': return tasksService.updateTask as any;
            case 'projects': return projectsService.updateProject as any;
            case 'risks': return risksService.updateRisk as any;
            case 'assets': return assetsService.updateAsset as any;
            case 'kras': return krasService.updateKRA as any;
            case 'kpis': return kpisService.updateKPI as any;
            case 'objectives': return objectivesService.updateObjective as any;
            default: throw new Error(`Unknown entity type: ${entityType}`);
        }
    }, [entityType]);

    // Get the appropriate delete method based on entity type
    const getDeleteMethod = useCallback((): DeleteFunction => {
        switch (entityType) {
            case 'tasks': return tasksService.deleteTask as any;
            case 'projects': return projectsService.deleteProject as any;
            case 'risks': return risksService.deleteRisk as any;
            case 'assets': return assetsService.deleteAsset as any;
            case 'kras': return krasService.deleteKRA as any;
            case 'kpis': return kpisService.deleteKPI as any;
            case 'objectives': return objectivesService.deleteObjective as any;
            default: throw new Error(`Unknown entity type: ${entityType}`);
        }
    }, [entityType]);

    // Main data fetching logic
    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        let fetchedData: T[] = [];
        let fetchError: Error | null = null;

        // All entity types now require the user's email for function invocation
        if (!account || !isMsalAccountInfo(account) || !account.username) {
            logger.warn(`[useSupabaseData - fetchData ${entityType}] No MSAL account/username found.`);
            fetchError = new Error('User not authenticated or email missing.');
            setData([]);
            setError(fetchError);
            setLoading(false);
            return;
        }

        const userEmail = account.username;
        const functionNameMap: Record<EntityType, string> = {
            tasks: 'get-my-tasks',
            projects: 'get-my-projects',
            risks: 'get-my-risks',
            assets: 'get-my-assets',
            kras: 'get-my-kras',
            kpis: 'get-my-kpis',
            objectives: 'get-my-objectives',
        };
        const functionName = functionNameMap[entityType];

        logger.info(`[useSupabaseData - fetchData ${entityType}] Invoking ${functionName} for email: ${userEmail}`);

        try {
            const { data: functionData, error: functionError } = await supabase.functions.invoke(
                functionName,
                { body: { user_email: userEmail } }
            );

            if (functionError) {
                logger.error(`[useSupabaseData - fetchData ${entityType}] Error invoking ${functionName}:`, functionError);
                fetchError = new Error(`Failed to fetch ${entityType}: ${functionError.message}`);
                fetchedData = [];
            } else {
                logger.info(`[useSupabaseData - fetchData ${entityType}] Successfully fetched ${entityType} via function ${functionName}. Count: ${functionData?.length ?? 0}`);
                // Ensure the data is always an array, even if the function returns null/undefined
                fetchedData = Array.isArray(functionData) ? functionData as T[] : [];
            }
        } catch (invokeErr) {
            logger.error(`[useSupabaseData - fetchData ${entityType}] Exception invoking ${functionName}:`, invokeErr);
            fetchError = invokeErr instanceof Error ? invokeErr : new Error(`Failed to invoke ${entityType} fetch function`);
            fetchedData = [];
        } finally {
            setData(fetchedData);
            setError(fetchError);
            setLoading(false);
        }
    }, [entityType, account?.username]); // Depend on username instead of whole accounts object

    // Fetch data on initial load or when user changes
    useEffect(() => {
        if (account?.username) { // Only fetch if user is identified
            fetchData();
        } else {
            // Clear data if user logs out or is not identified
            setData([]);
            setLoading(false);
            setError(null); // Optionally clear error or set specific auth error
        }
    }, [fetchData, account?.username]);

    // --- Add Realtime Subscription useEffect ---
    useEffect(() => {
        // Only subscribe if we have a valid entity type and user
        // We base the subscription channel on the user's email to potentially scope it,
        // although the filtering logic might still happen client-side after receiving events.
        if (!entityType || !account?.username) {
            logger.info(`[useSupabaseData Realtime ${entityType}] Subscription skipped (no entityType or user).`);
            return;
        }

        const tableName = entityTableMap[entityType];
        if (!tableName) {
            logger.error(`[useSupabaseData Realtime ${entityType}] No table mapping found for entity type.`);
            return;
        }

        const channelName = `public:${tableName}:${account.username}`; // User-specific channel
        logger.info(`[useSupabaseData Realtime ${entityType}] Subscribing to channel: ${channelName}`);

        const handlePostgresChanges = (payload: RealtimePostgresChangesPayload<T>) => {
            logger.info(`[useSupabaseData Realtime ${entityType}] Change received on ${tableName}`, payload);

            if (payload.eventType === 'INSERT') {
                const newItem = payload.new as T;
                // Optional: Check if the inserted item's assigned_to_email matches the current user
                // if (newItem.assigned_to_email === account.username) {
                setData(currentData => {
                    // Avoid duplicates if the item somehow already exists
                    if (currentData.some(item => item.id === newItem.id)) {
                        return currentData;
                    }
                    return [...currentData, newItem];
                });
                // } else { logger.info(`[Realtime INSERT ${entityType}] Ignoring item assigned to different user: ${newItem.assigned_to_email}`); }
            } else if (payload.eventType === 'UPDATE') {
                const updatedItem = payload.new as T;
                // Optional: Check if the updated item still belongs to the user
                // if (updatedItem.assigned_to_email === account.username) {
                setData(currentData =>
                    currentData.map(item =>
                        item.id === updatedItem.id ? { ...item, ...updatedItem } : item
                    )
                );
                // } else { // Item might have been reassigned away from the user
                //   setData(currentData => currentData.filter(item => item.id !== updatedItem.id));
                // }
            } else if (payload.eventType === 'DELETE') {
                const oldItemId = (payload.old as T)?.id;
                if (oldItemId) {
                    setData(currentData => currentData.filter(item => item.id !== oldItemId));
                }
            }
        };

        const channel: RealtimeChannel = supabase
            .channel(channelName)
            .on<T>( // Use generic type T here
                'postgres_changes',
                {
                    event: '*', // Listen to INSERT, UPDATE, DELETE
                    schema: 'public',
                    table: tableName,
                    // Optional: Add server-side filter if possible/needed based on RLS or policies
                    // filter: `assigned_to_email=eq.${account.username}` // Might not work if RLS already handles this
                },
                handlePostgresChanges
            )
            .subscribe((status, err) => {
                if (status === 'SUBSCRIBED') {
                    logger.info(`[useSupabaseData Realtime ${entityType}] Successfully subscribed to ${tableName}`);
                } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
                    logger.error(`[useSupabaseData Realtime ${entityType}] Subscription error on ${tableName}: ${status}`, err);
                    toast({
                        title: "Realtime Error",
                        description: `Connection to live updates for ${entityType} failed: ${err?.message || 'Unknown error'}. Data may not update automatically.`,
                        variant: "destructive",
                        duration: 10000
                    });
                    // Optionally trigger a manual refresh on error?
                    // fetchData();
                } else {
                    logger.info(`[useSupabaseData Realtime ${entityType}] Subscription status on ${tableName}: ${status}`);
                }
            });

        // Cleanup function
        return () => {
            logger.info(`[useSupabaseData Realtime ${entityType}] Unsubscribing from channel: ${channelName}`);
            supabase.removeChannel(channel);
        };

        // Re-subscribe if entityType or user changes
    }, [entityType, account?.username]); // Add toast? No, keep it clean. fetchData? No.

    // --- End Realtime Subscription useEffect ---

    // Add a new item
    const add = useCallback(async (item: Omit<T, 'id'>) => {
        if (!account?.username) {
            logger.error('useSupabaseData - add: No MSAL user logged in');
            toast({
                title: "Authentication Error",
                description: "Could not determine user email. Please log in again.",
                variant: "destructive"
            });
            return null;
        }

        try {
            logger.info(`[useSupabaseData - add ${entityType}] Attempting to add item`, item);
            const addMethod = getAddMethod();

            // Prepare the data with the assigned email
            const itemWithEmail = {
                ...item,
                assigned_to_email: account.username
            };

            logger.info(`[useSupabaseData - add ${entityType}] Item with email:`, itemWithEmail);

            // Pass the modified item to the specific add method with user email for audit trail
            const newItem = await addMethod(itemWithEmail as T, account.username);

            if (newItem) {
                setData(prev => [...prev, newItem as unknown as T]);
                toast({
                    title: "Success",
                    description: `${entityType.slice(0, -1)} added successfully`
                });
            }

            return newItem;
        } catch (err) {
            logger.error(`Error adding ${entityType.slice(0, -1)}:`, err);
            toast({
                title: "Error",
                description: `Failed to add ${entityType.slice(0, -1)}`,
                variant: "destructive"
            });

            // Log the specific error to console for debugging
            if (err && typeof err === 'object' && 'code' in err) {
                console.log(`Database error [${(err as any).code}]: ${(err as any).message}`);
            }

            return null;
        }
    }, [entityType, getAddMethod, account?.username]); // Use account?.username

    // Update an item
    const update = useCallback(async (id: string, updateData: Partial<T>) => {
        if (!account?.username) {
            logger.error('useSupabaseData - update: No MSAL user logged in');
            toast({
                title: "Error",
                description: "You must be logged in to update items",
                variant: "destructive"
            });
            return null;
        }

        try {
            const updateMethod = getUpdateMethod();
            // Pass user email for audit trail
            const updatedItem = await updateMethod(id, updateData, account.username);

            if (updatedItem) {
                setData(prev => prev.map(item =>
                    item.id === id ? { ...item, ...updatedItem } as T : item
                ));
                toast({
                    title: "Success",
                    description: `${entityType.slice(0, -1)} updated successfully`
                });
            }

            return updatedItem;
        } catch (err) {
            logger.error(`Error updating ${entityType.slice(0, -1)}:`, err);
            toast({
                title: "Error",
                description: `Failed to update ${entityType.slice(0, -1)}`,
                variant: "destructive"
            });
            // Log specific DB errors
            if (err && typeof err === 'object' && 'code' in err) {
                console.log(`Database error [${(err as any).code}]: ${(err as any).message}`);
            }
            return null;
        }
    }, [entityType, getUpdateMethod, account?.username]); // Use account?.username

    // Delete an item
    const remove = useCallback(async (id: string) => {
        if (!account?.username) {
            logger.error('useSupabaseData - remove: No MSAL user logged in');
            toast({
                title: "Error",
                description: "You must be logged in to delete items",
                variant: "destructive"
            });
            return false;
        }

        try {
            const deleteMethod = getDeleteMethod();
            await deleteMethod(id, account.username);

            setData(prev => prev.filter(item => item.id !== id));
            toast({
                title: "Success",
                description: `${entityType.slice(0, -1)} deleted successfully`
            });

            return true;
        } catch (err) {
            logger.error(`Error deleting ${entityType.slice(0, -1)}:`, err);
            toast({
                title: "Error",
                description: `Failed to delete ${entityType.slice(0, -1)}`,
                variant: "destructive"
            });
            return false;
        }
    }, [entityType, getDeleteMethod, account?.username]); // Use account?.username

    // Expose refresh function (which is fetchData)
    const refresh = fetchData;

    return { data, loading, error, add, update, remove, refresh };
}

import { Task } from '@/components/unit-tabs/TasksTab';
import { Project, Risk, UserAsset, Kra, Kpi, Objective } from '@/types';

export function useTasksData(initialData: Task[] = []) {
    return useSupabaseData<Task>('tasks', initialData);
}

export function useProjectsData(initialData: Project[] = []) {
    return useSupabaseData<Project>('projects', initialData);
}

export function useRisksData(initialData: Risk[] = []) {
    return useSupabaseData<Risk>('risks', initialData);
}

export function useAssetsData(initialData: UserAsset[] = []) {
    return useSupabaseData<UserAsset>('assets', initialData);
}

export function useKRAsData(initialData: Kra[] = []) {
    return useSupabaseData<Kra>('kras', initialData);
}

export function useKPIsData(initialData: Kpi[] = []) {
    return useSupabaseData<Kpi>('kpis', initialData);
}

export function useObjectivesData(initialData: Objective[] = []) {
    return useSupabaseData<Objective>('objectives', initialData);
}
