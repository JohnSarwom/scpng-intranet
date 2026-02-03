import { useQuery } from '@tanstack/react-query';
import { useMsal } from '@azure/msal-react';
import { SharePointOpsService } from '@/services/sharePointOpsService';
import { getGraphClient } from '@/services/graphService';
import { Kra, Kpi, Project, Task, KRA, Objective, FilterScope, UserContext } from '@/types';
import { useToast } from '@/components/ui/use-toast';

// Helper to get service instance
const useOpsService = () => {
    const { instance: msalInstance } = useMsal();

    const getService = async () => {
        const account = msalInstance.getActiveAccount();
        if (!account) throw new Error('No active account');

        const graphClient = await getGraphClient(msalInstance);
        if (!graphClient) throw new Error('Failed to get Graph client');

        const service = new SharePointOpsService(graphClient);
        await service.initialize();
        return service;
    };

    return getService;
};

// --- Hooks ---

export function useSharePointObjectives(department?: string, scope: FilterScope = 'Division', context?: UserContext) {
    const getService = useOpsService();

    const query = useQuery({
        queryKey: ['sharePoint', 'objectives', department, scope, context?.division, context?.unit, context?.email, context?.role],
        queryFn: async () => {
            try {
                const service = await getService();
                // We re-use getObjectives but type cast for now if needed or rely on service typing
                const data = await service.getObjectives(scope, context);
                console.log('✅ [useSharePointOps] Loaded Objectives:', data.length);
                return data;
            } catch (err) {
                console.error('❌ [useSharePointOps] Failed to fetch Objectives', err);
                return [];
            }
        }
    });

    return {
        data: (query.data || []) as unknown as Objective[],
        loading: query.isLoading,
        error: query.error as Error | null,
        add: async (item: Partial<Objective>) => {
            try {
                const service = await getService();
                await service.addObjective(item, department);
                query.refetch();
                return true;
            } catch (error) {
                console.error('Failed to add objective', error);
                throw error;
            }
        },
        update: async (id: string, item: Partial<Objective>) => {
            try {
                const service = await getService();
                await service.updateObjective(id, item);
                query.refetch();
                return true;
            } catch (error) {
                console.error('Failed to update objective', error);
                throw error;
            }
        },
        remove: async (id: string) => {
            try {
                const service = await getService();
                await service.deleteObjective(id);
                query.refetch();
                return true;
            } catch (error) {
                console.error('Failed to delete objective', error);
                throw error;
            }
        },
        refresh: query.refetch
    };
}

export function useSharePointKRAs(department?: string, scope: FilterScope = 'Division', context?: UserContext) {
    const getService = useOpsService();
    const { toast } = useToast();

    const query = useQuery({
        // Include department (which is derived from context) and scope to ensure refetch on context switch
        queryKey: ['sharePoint', 'kras', department, scope, context?.division, context?.unit, context?.email, context?.role],
        queryFn: async () => {
            try {
                const service = await getService();

                // Fetch KRAs and KPIs in parallel to merge them
                const [kras, kpis] = await Promise.all([
                    service.getKRAs(scope, context),
                    service.getKPIs(department)
                ]);

                console.log('✅ [useSharePointOps] Loaded KRAs:', kras.length);
                console.log('✅ [useSharePointOps] Loaded KPIs for merging:', kpis.length);

                // Merge KPIs into their parent KRAs
                // This ensures unitKpis is populated, which the UI relies on
                const krasWithKpis = kras.map(kra => {
                    const kraKpis = kpis.filter(kpi => String(kpi.kra_id) === String(kra.id));
                    return {
                        ...kra,
                        unitKpis: kraKpis
                    };
                });

                return krasWithKpis;
            } catch (err) {
                console.error('❌ [useSharePointOps] Failed to fetch KRAs', err);
                return [];
            }
        },
        staleTime: 1000 * 60 * 5, // 5 min
    });

    // Match useSupabaseData shape
    return {
        data: (query.data || []) as unknown as Kra[], // Cast to Kra to satisfy Unit.tsx expectations
        loading: query.isLoading,
        error: query.error as Error | null,
        add: async (item: Partial<KRA>) => {
            try {
                const service = await getService();
                const newKra = await service.addKRA(item);
                query.refetch();
                toast({ title: "Success", description: "KRA added successfully" });
                return newKra; // Return the created KRA so we can use its ID
            } catch (error: any) {
                console.error('Failed to add KRA', error);
                toast({ title: "Error", description: error.message || "Failed to add KRA", variant: "destructive" });
                throw error;
            }
        },
        update: async (id: string, item: Partial<KRA>) => {
            try {
                const service = await getService();
                const updatedKra = await service.updateKRA(id, item);
                query.refetch();
                toast({ title: "Success", description: "KRA updated successfully" });
                return updatedKra; // Return the updated KRA
            } catch (error: any) {
                console.error('Failed to update KRA', error);
                toast({ title: "Error", description: error.message || "Failed to update KRA", variant: "destructive" });
                throw error;
            }
        },
        remove: async (id: string) => {
            try {
                const service = await getService();
                await service.deleteKRA(id);
                query.refetch();
                toast({ title: "Success", description: "KRA deleted successfully" });
                return true;
            } catch (error: any) {
                console.error('Failed to delete KRA', error);
                toast({ title: "Error", description: error.message || "Failed to delete KRA", variant: "destructive" });
                throw error;
            }
        },
        refresh: query.refetch
    };
}

export function useSharePointKPIs(department?: string, context?: UserContext) {
    const getService = useOpsService();
    const { toast } = useToast();

    const query = useQuery({
        queryKey: ['sharePoint', 'kpis', department, context?.role],
        queryFn: async () => {
            try {
                const service = await getService();
                const data = await service.getKPIs(department);
                console.log('✅ [useSharePointOps] Loaded KPIs:', data.length);
                return data;
            } catch (err) {
                console.error('❌ [useSharePointOps] Failed to fetch KPIs', err);
                return [];
            }
        }
    });

    return {
        data: (query.data || []) as unknown as Kpi[],
        loading: query.isLoading,
        error: query.error as Error | null,
        add: async (item: Partial<Kpi>) => {
            try {
                const service = await getService();
                await service.addKPI(item);
                query.refetch();
                toast({ title: "Success", description: "KPI added successfully" });
                return true;
            } catch (error: any) {
                console.error('Failed to add KPI', error);
                toast({ title: "Error", description: error.message || "Failed to add KPI", variant: "destructive" });
                throw error;
            }
        },
        update: async (id: string, item: Partial<Kpi>) => {
            try {
                const service = await getService();
                await service.updateKPI(id, item);
                query.refetch();
                toast({ title: "Success", description: "KPI updated successfully" });
                return true;
            } catch (error: any) {
                console.error('Failed to update KPI', error);
                toast({ title: "Error", description: error.message || "Failed to update KPI", variant: "destructive" });
                throw error;
            }
        },
        remove: async (id: string) => {
            try {
                const service = await getService();
                await service.deleteKPI(id);
                query.refetch();
                toast({ title: "Success", description: "KPI deleted successfully" });
                return true;
            } catch (error: any) {
                console.error('Failed to delete KPI', error);
                toast({ title: "Error", description: error.message || "Failed to delete KPI", variant: "destructive" });
                throw error;
            }
        },
        refresh: query.refetch
    };
}

export function useSharePointProjects(department?: string, scope: FilterScope = 'Unit', context?: UserContext) {
    const getService = useOpsService();

    const query = useQuery({
        queryKey: ['sharePoint', 'projects', department, scope, context?.division, context?.unit, context?.email, context?.role],
        queryFn: async () => {
            try {
                const service = await getService();
                const data = await service.getProjects(scope, context);
                console.log('✅ [useSharePointOps] Loaded Projects:', data.length);
                return data;
            } catch (err) {
                console.error('❌ [useSharePointOps] Failed to fetch Projects', err);
                return [];
            }
        }
    });

    return {
        data: (query.data || []) as unknown as Project[],
        loading: query.isLoading,
        error: query.error as Error | null,
        add: async () => { },
        update: async () => { },
        remove: async () => { },
        refresh: query.refetch
    };
}

export function useSharePointTasks(department?: string, scope: FilterScope = 'Unit', context?: UserContext) {
    const getService = useOpsService();

    const query = useQuery({
        queryKey: ['sharePoint', 'tasks', department, scope, context?.division, context?.unit, context?.email, context?.role],
        queryFn: async () => {
            try {
                const service = await getService();
                const data = await service.getTasks(scope, context);
                console.log('✅ [useSharePointOps] Loaded Tasks:', data.length);
                return data;
            } catch (err) {
                console.error('❌ [useSharePointOps] Failed to fetch Tasks', err);
                return [];
            }
        }
    });

    return {
        data: (query.data || []) as unknown as Task[],
        loading: query.isLoading,
        error: query.error as Error | null,
        add: async () => { },
        update: async () => { },
        remove: async () => { },
        refresh: query.refetch
    };
}

export function useSharePointRisks(department?: string, scope: FilterScope = 'Division', context?: UserContext) {
    const getService = useOpsService();

    const query = useQuery({
        queryKey: ['sharePoint', 'risks', department, scope, context?.division, context?.unit, context?.email, context?.role],
        queryFn: async () => {
            try {
                const service = await getService();
                const data = await service.getRisks(scope, context);
                console.log('✅ [useSharePointOps] Loaded Risks:', data.length);
                return data;
            } catch (err) {
                console.error('❌ [useSharePointOps] Failed to fetch Risks', err);
                return [];
            }
        }
    });

    return {
        data: (query.data || []) as unknown as any[], // Casting to any[] to avoid strict Risk type issues during transition
        loading: query.isLoading,
        error: query.error as Error | null,
        add: async () => { },
        update: async () => { },
        remove: async () => { },
        refresh: query.refetch
    };
}
