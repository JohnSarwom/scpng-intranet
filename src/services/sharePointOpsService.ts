/**
 * SharePoint Operations Service
 * Handles data fetching and mapping for Operations (KRAs, KPIs, Projects, Tasks) from SharePoint Lists
 */

import { Client } from '@microsoft/microsoft-graph-client';
import { Task, Project, KRA, Kpi, Objective, Risk, FilterScope, UserContext } from '@/types';

// Configuration for SharePoint Lists
const OPS_CONFIG = {
    SITE_DOMAIN: 'scpng1.sharepoint.com',
    SITE_PATH: '/sites/scpngintranet',
    LISTS: {
        KRAS: 'Performance_KRAs',
        KPIS: 'Performance_KPIs',
        PROJECTS: 'Operations_Projects',
        TASKS: 'Operations_Tasks',
        RISKS: 'Operations_Risks',
        OBJECTIVES: 'Strategic_Objectives',
        SETTINGS: 'System_View_Settings'
    }
};

export class SharePointOpsService {
    private client: Client;
    private siteId: string = '';
    private listIds: Record<string, string> = {};

    constructor(client: Client) {
        this.client = client;
    }

    async initialize(): Promise<void> {
        console.log('🔧 [SharePointOpsService] Initializing...');
        try {
            // Get Site ID
            const site = await this.client
                .api(`/sites/${OPS_CONFIG.SITE_DOMAIN}:${OPS_CONFIG.SITE_PATH}`)
                .get();
            this.siteId = site.id;

            // Get List IDs
            await this.resolveListIds();
            console.log('✅ [SharePointOpsService] Initialization complete');
        } catch (error) {
            console.error('❌ [SharePointOpsService] Init failed', error);
            throw error;
        }
    }

    private async resolveListIds() {
        const lists = await this.client
            .api(`/sites/${this.siteId}/lists`)
            .select('id,displayName')
            .get();

        const targetLists = Object.values(OPS_CONFIG.LISTS);
        lists.value.forEach((list: any) => {
            if (targetLists.includes(list.displayName)) {
                const key = Object.keys(OPS_CONFIG.LISTS).find(
                    k => OPS_CONFIG.LISTS[k as keyof typeof OPS_CONFIG.LISTS] === list.displayName
                );
                if (key) this.listIds[key] = list.id;
            }
        });
    }

    // --- Fetch Methods ---

    async getObjectives(scope: FilterScope = 'Division', context?: UserContext): Promise<Objective[]> {
        if (!this.listIds['OBJECTIVES']) return [];

        try {
            // Fetch all to avoid indexing issues with OData filters
            const response = await this.client
                .api(`/sites/${this.siteId}/lists/${this.listIds['OBJECTIVES']}/items`)
                .expand('fields')
                .get();

            console.log(`📊 [SP Ops] getObjectives fetched raw: ${response.value?.length || 0}`);

            return (response.value || [])
                .filter((item: any) => {
                    const f = item.fields;
                    // Admin Bypass
                    if (context?.role === 'admin' || context?.role === 'super_admin') return true;

                    const type = f.GoalType;
                    const isFeatured = f.IsFeatured === true || f.IsFeatured === 1 || f.IsFeatured === "1";

                    // ALWAYS include 'Org', null types (strategic fallback), or featured objectives for alignment lookups
                    if (type === 'Org' || !type || isFeatured) return true;

                    // Then apply scope-specific filtering
                    if (scope === 'Division' && context?.division) {
                        return f.Division === context.division;
                    } else if (scope === 'Unit' && context?.unit) {
                        return f.Unit === context.unit;
                    } else if (scope === 'Individual' && context?.name) {
                        return f.Owner === context.name;
                    }

                    return false;
                })
                .map((item: any) => this.mapObjective(item));
        } catch (error) {
            console.error('❌ [SP Ops] getObjectives failed:', error);
            return [];
        }
    }

    async addObjective(objective: Partial<Objective>, department?: string): Promise<Objective> {
        if (!this.listIds['OBJECTIVES']) throw new Error('Objectives list not found');

        const payload = {
            fields: {
                Title: objective.title,
                Description: objective.description,
                GoalType: objective.goalType || 'Division',
                Division: objective.division || department || 'General',
                Status: objective.status || 'Not Started',
                Progress: objective.progress || 0,
                Year: objective.year,
                StartDate: objective.startDate ? new Date(objective.startDate).toISOString() : null,
                EndDate: objective.endDate ? new Date(objective.endDate).toISOString() : null,
                Unit: objective.unit,
                Owner: objective.owner,
                ParentGoalIdLookupId: objective.parentGoalId,
                Icon: objective.icon,
                IsFeatured: objective.isFeatured,
                Deliverables: objective.deliverables?.join(', ')
            }
        };

        console.log('📝 [SP Ops] Adding Objective:', payload);
        const response = await this.client
            .api(`/sites/${this.siteId}/lists/${this.listIds['OBJECTIVES']}/items`)
            .post(payload);

        return this.mapObjective(response);
    }

    async updateObjective(id: string, objective: Partial<Objective>): Promise<Objective> {
        if (!this.listIds['OBJECTIVES']) throw new Error('Objectives list not found');

        const fields: any = {
            Title: objective.title,
            Description: objective.description,
        };

        // Only add fields if they are defined in the partial update
        if (objective.status !== undefined) fields.Status = objective.status;
        if (objective.progress !== undefined) fields.Progress = objective.progress;
        if (objective.year !== undefined) fields.Year = objective.year;
        if (objective.startDate !== undefined) fields.StartDate = objective.startDate ? new Date(objective.startDate).toISOString() : null;
        if (objective.endDate !== undefined) fields.EndDate = objective.endDate ? new Date(objective.endDate).toISOString() : null;
        if (objective.goalType !== undefined) fields.GoalType = objective.goalType;
        if (objective.division !== undefined) fields.Division = objective.division;
        if (objective.unit !== undefined) fields.Unit = objective.unit;
        if (objective.owner !== undefined) fields.Owner = objective.owner;
        if (objective.parentGoalId !== undefined) fields.ParentGoalIdLookupId = objective.parentGoalId;
        if (objective.icon !== undefined) fields.Icon = objective.icon;
        if (objective.isFeatured !== undefined) fields.IsFeatured = objective.isFeatured;
        if (objective.deliverables !== undefined) fields.Deliverables = objective.deliverables?.join(', ');

        const payload = { fields };

        console.log(`📝 [SP Ops] Updating Objective ${id}:`, payload);
        const response = await this.client
            .api(`/sites/${this.siteId}/lists/${this.listIds['OBJECTIVES']}/items/${id}`)
            .patch(payload);

        return this.mapObjective(response);
    }

    async deleteObjective(id: string): Promise<void> {
        if (!this.listIds['OBJECTIVES']) throw new Error('Objectives list not found');

        console.log(`🗑️ [SP Ops] Deleting Objective ${id}`);
        await this.client
            .api(`/sites/${this.siteId}/lists/${this.listIds['OBJECTIVES']}/items/${id}`)
            .delete();
    }

    async getKRAs(scope: FilterScope = 'Division', context?: UserContext): Promise<KRA[]> {
        if (!this.listIds['KRAS']) return [];
        let query = this.client.api(`/sites/${this.siteId}/lists/${this.listIds['KRAS']}/items`).expand('fields');
        query = query.header('Prefer', 'HonorNonIndexedQueriesWarningMayFailRandomly');

        // Admin Bypass: Super Admins and Admins see everything
        const isAdmin = context?.role === 'admin' || context?.role === 'super_admin';

        if (!isAdmin) {
            let filter = '';
            // KRAs List Schema: 'Department' column holds Division Name.
            if (scope === 'Division' && context?.division) {
                filter = `fields/Department eq '${context.division}'`;
            } else if (scope === 'Unit' && context?.unit) {
                // KRAs don't have a specific Unit column by default schema, but if added later:
                // filter = `fields/Unit eq '${context.unit}'`;
                // Fallback: If filtered by Unit but only have Division column, we technically can't restrict to Unit perfectly.
                // For now, let's assume KRAs are Division level as per default settings.
                // If strictly needed, we'd need to match Department to Division AND filter client side or add column.
                filter = `fields/Department eq '${context.division}'`; // Best effort fallback: Show Division KRAs
            } else if (scope === 'Individual' && context?.email) {
                // filter = `fields/Responsible/Email eq '${context.email}'`;
            }

            if (filter) {
                query = query.filter(filter);
            }
        }

        const response = await query.get();
        return response.value.map((item: any) => this.mapKRA(item));
    }

    async getKPIs(department?: string): Promise<Kpi[]> {
        // KPI filtering usually happens via Linked KRA or client side for now as explicit linkage is complex in one query
        if (!this.listIds['KPIS']) return [];
        const response = await this.client
            .api(`/sites/${this.siteId}/lists/${this.listIds['KPIS']}/items`)
            .expand('fields')
            .get();
        return response.value.map((item: any) => this.mapKPI(item));
    }

    async getProjects(scope: FilterScope = 'Unit', context?: UserContext): Promise<Project[]> {
        if (!this.listIds['PROJECTS']) return [];
        let query = this.client.api(`/sites/${this.siteId}/lists/${this.listIds['PROJECTS']}/items`).expand('fields');
        query = query.header('Prefer', 'HonorNonIndexedQueriesWarningMayFailRandomly');

        query = query.header('Prefer', 'HonorNonIndexedQueriesWarningMayFailRandomly');

        // Admin Bypass
        if (context?.role === 'admin' || context?.role === 'super_admin') {
            // No filter
        } else {
            let filter = '';

            // Projects List Schema: 'Department' column holds Unit Name (usually).
            if (scope === 'Division' && context?.division) {
                // Projects don't have Division column. 
                // Logic: Organization -> Division -> Unit.
                // We can't easily filter Projects by Division if we only have Unit name in 'Department'.
                // Best effort: Do not filter? Or filter by something else?
                // Since Projects defaults to 'Unit Only' scope in settings, this case is rare for now.
                // If we must filter:
                // filter = `fields/Division eq '${context.division}'`; // This would fail.
            } else if (scope === 'Unit' && context?.unit) {
                filter = `fields/Department eq '${context.unit}'`;
            }

            if (filter) query = query.filter(filter);
        }

        const response = await query.get();
        return response.value.map((item: any) => this.mapProject(item));
    }

    async getTasks(scope: FilterScope = 'Unit', context?: UserContext): Promise<Task[]> {
        if (!this.listIds['TASKS']) return [];
        let query = this.client.api(`/sites/${this.siteId}/lists/${this.listIds['TASKS']}/items`).expand('fields');
        query = query.header('Prefer', 'HonorNonIndexedQueriesWarningMayFailRandomly');

        query = query.header('Prefer', 'HonorNonIndexedQueriesWarningMayFailRandomly');

        // Admin Bypass
        if (context?.role === 'admin' || context?.role === 'super_admin') {
            // No filter
        } else {
            let filter = '';
            // Tasks List Schema: 'Department' column holds Unit Name.
            if (scope === 'Division' && context?.division) {
                // See Projects note.
            } else if (scope === 'Unit' && context?.unit) {
                filter = `fields/Department eq '${context.unit}'`;
            } else if (scope === 'Individual' && context?.email) {
                // filter = `fields/AssignedTo/Email eq '${context.email}'`;
            }

            if (filter) query = query.filter(filter);
        }

        const response = await query.get();
        return response.value.map((item: any) => this.mapTask(item));
    }

    async getRisks(scope: FilterScope = 'Division', context?: UserContext): Promise<Risk[]> {
        if (!this.listIds['RISKS']) return [];
        let query = this.client.api(`/sites/${this.siteId}/lists/${this.listIds['RISKS']}/items`).expand('fields');
        query = query.header('Prefer', 'HonorNonIndexedQueriesWarningMayFailRandomly');

        query = query.header('Prefer', 'HonorNonIndexedQueriesWarningMayFailRandomly');

        // Admin Bypass
        if (context?.role === 'admin' || context?.role === 'super_admin') {
            // No filter
        } else {
            let filter = '';
            // Risks List Schema: 'Department' column holds Division Name (usually).
            if (scope === 'Division' && context?.division) {
                filter = `fields/Department eq '${context.division}'`;
            } else if (scope === 'Unit' && context?.unit) {
                // Risks often Division level, but if Unit level:
                // filter = `fields/Unit eq '${context.unit}'`;
            }

            if (filter) query = query.filter(filter);
        }

        const response = await query.get();
        return response.value.map((item: any) => this.mapRisk(item));
    }

    // --- Settings Methods ---

    async getViewSettings(): Promise<any[]> {
        if (!this.listIds['SETTINGS']) return [];
        try {
            const response = await this.client
                .api(`/sites/${this.siteId}/lists/${this.listIds['SETTINGS']}/items`)
                .expand('fields')
                .get();

            return response.value.map((item: any) => ({
                id: item.id,
                page: item.fields.PageName,
                component: item.fields.ComponentName,
                scope: item.fields.VisibilityScope,
                description: item.fields.Description
            }));
        } catch (error) {
            console.error('Failed to get view settings', error);
            return [];
        }
    }

    async updateViewSetting(componentName: string, newScope: string): Promise<void> {
        if (!this.listIds['SETTINGS']) throw new Error('Settings list not found');

        // First find the item ID for this component
        const items = await this.client
            .api(`/sites/${this.siteId}/lists/${this.listIds['SETTINGS']}/items`)
            .filter(`fields/ComponentName eq '${componentName}'`)
            .get();

        if (items.value && items.value.length > 0) {
            const id = items.value[0].id;
            await this.client
                .api(`/sites/${this.siteId}/lists/${this.listIds['SETTINGS']}/items/${id}`)
                .patch({
                    fields: {
                        VisibilityScope: newScope
                    }
                });
        }
    }

    async addKRA(kra: Partial<KRA>): Promise<KRA> {
        if (!this.listIds['KRAS']) throw new Error('KRAs list not found');
        const payload: any = {
            fields: {
                Title: kra.title,
                Department: kra.department,
                Status: kra.status === 'in-progress' ? 'In Progress' : (kra.status === 'closed' ? 'Closed' : 'Open'),
                Progress: kra.progress,
                StartDate: kra.startDate ? new Date(kra.startDate).toISOString() : null,
                EndDate: kra.endDate ? new Date(kra.endDate).toISOString() : null,
                Description: kra.description,
                StrategyGoalLookupId: kra.objective_id ? Number(kra.objective_id) : null
                // Note: Responsible and Assignees fields are Person/Group type in SharePoint
                // These cannot be set via Graph API easily as they require user resolution
                // TODO: Implement user field mapping if needed in the future
            }
        };

        const response = await this.client.api(`/sites/${this.siteId}/lists/${this.listIds['KRAS']}/items`).post(payload);
        return this.mapKRA(response);
    }

    async updateKRA(id: string, kra: Partial<KRA>): Promise<KRA> {
        if (!this.listIds['KRAS']) throw new Error('KRAs list not found');
        const fields: any = {};
        if (kra.title !== undefined) fields.Title = kra.title;
        if (kra.department !== undefined) fields.Department = kra.department;
        if (kra.status !== undefined) fields.Status = kra.status === 'in-progress' ? 'In Progress' : (kra.status === 'closed' ? 'Closed' : 'Open');
        if (kra.progress !== undefined) fields.Progress = kra.progress;
        if (kra.startDate !== undefined) fields.StartDate = kra.startDate ? new Date(kra.startDate).toISOString() : null;
        if (kra.endDate !== undefined) fields.EndDate = kra.endDate ? new Date(kra.endDate).toISOString() : null;
        if (kra.description !== undefined) fields.Description = kra.description;
        if (kra.objective_id !== undefined) fields.StrategyGoalLookupId = kra.objective_id ? Number(kra.objective_id) : null;
        // Note: Responsible and Assignees are Person/Group fields - cannot be easily updated via Graph API

        const response = await this.client.api(`/sites/${this.siteId}/lists/${this.listIds['KRAS']}/items/${id}/fields`).patch(fields);
        return this.mapKRA({ ...response, id });
    }

    async deleteKRA(id: string): Promise<void> {
        if (!this.listIds['KRAS']) throw new Error('KRAs list not found');
        await this.client.api(`/sites/${this.siteId}/lists/${this.listIds['KRAS']}/items/${id}`).delete();
    }

    async addKPI(kpi: Partial<Kpi>): Promise<Kpi> {
        if (!this.listIds['KPIS']) throw new Error('KPIS list not found');
        const payload: any = {
            fields: {
                Title: kpi.name,
                Metric: kpi.metric,
                TargetValue: kpi.target,
                ActualValue: kpi.actual,
                Status: kpi.status === 'on-track' ? 'On Track' : (kpi.status === 'at-risk' ? 'At Risk' : (kpi.status === 'completed' ? 'Completed' : 'Behind')),
                CostAssociated: kpi.costAssociated,
                Description: kpi.description,
                StartDate: kpi.startDate ? new Date(kpi.startDate).toISOString() : null,
                EndDate: kpi.targetDate ? new Date(kpi.targetDate).toISOString() : null, // targetDate maps to EndDate
                RelatedKRALookupId: kpi.kra_id ? Number(kpi.kra_id) : null
            }
        };

        if (kpi.assignees && kpi.assignees.length > 0) {
            // Assignees is a Text column storing JSON, not a true Person Lookup
            payload.fields['Assignees'] = JSON.stringify(kpi.assignees);
        }

        const response = await this.client.api(`/sites/${this.siteId}/lists/${this.listIds['KPIS']}/items`).post(payload);
        return this.mapKPI(response);
    }

    async updateKPI(id: string, kpi: Partial<Kpi>): Promise<Kpi> {
        if (!this.listIds['KPIS']) throw new Error('KPIS list not found');
        const fields: any = {};
        if (kpi.name !== undefined) fields.Title = kpi.name;
        if (kpi.metric !== undefined) fields.Metric = kpi.metric;
        if (kpi.target !== undefined) fields.TargetValue = kpi.target;
        if (kpi.actual !== undefined) fields.ActualValue = kpi.actual;
        if (kpi.status !== undefined) fields.Status = kpi.status === 'on-track' ? 'On Track' : (kpi.status === 'at-risk' ? 'At Risk' : (kpi.status === 'completed' ? 'Completed' : 'Behind'));
        if (kpi.costAssociated !== undefined) fields.CostAssociated = kpi.costAssociated;
        if (kpi.description !== undefined) fields.Description = kpi.description;
        if (kpi.startDate !== undefined) fields.StartDate = kpi.startDate ? new Date(kpi.startDate).toISOString() : null;
        if (kpi.targetDate !== undefined) fields.EndDate = kpi.targetDate ? new Date(kpi.targetDate).toISOString() : null;

        if (kpi.assignees !== undefined) {
            // Assignees is a Text column storing JSON
            fields['Assignees'] = JSON.stringify(kpi.assignees || []);
        }

        const response = await this.client.api(`/sites/${this.siteId}/lists/${this.listIds['KPIS']}/items/${id}`).patch({ fields });
        return this.mapKPI(response);
    }

    async deleteKPI(id: string): Promise<void> {
        if (!this.listIds['KPIS']) throw new Error('KPIS list not found');
        await this.client.api(`/sites/${this.siteId}/lists/${this.listIds['KPIS']}/items/${id}`).delete();
    }

    // --- Mappers ---

    private mapObjective(item: any): Objective {
        const f = item.fields;
        return {
            id: item.id,
            title: f.Title,
            description: f.Description || '',
            status: f.Status,
            progress: f.Progress,
            year: f.Year,
            startDate: f.StartDate ? new Date(f.StartDate) : undefined,
            endDate: f.EndDate ? new Date(f.EndDate) : undefined,
            goalType: f.GoalType,
            division: f.Division,
            unit: f.Unit,
            owner: f.Owner, // Text field usually, or expand if person
            parentGoalId: f.ParentGoalIdLookupId,
            parentGoalTitle: f.ParentGoalIdLookupValue,
            icon: f.Icon,
            isFeatured: f.IsFeatured === true || f.IsFeatured === 1 || f.IsFeatured === "1",
            deliverables: f.Deliverables ? f.Deliverables.split(',').map((s: string) => s.trim()) : [],
        };
    }

    private mapKRA(item: any): KRA {
        const f = item.fields;

        // Map Assignees from JSON String (Text field)
        let assignees: any[] = [];
        try {
            if (f.Assignees) {
                assignees = JSON.parse(f.Assignees);
            }
        } catch (e) {
            console.warn(`[SP Ops] Failed to parse Assignees JSON for KRA ${item.id}`, e);
        }

        return {
            id: item.id,
            title: f.Title,
            department: f.Department,
            status: (f.Status?.toLowerCase() || 'open').replace(' ', '-') as any,
            progress: f.Progress || 0,
            startDate: f.StartDate ? new Date(f.StartDate) : new Date(),
            targetDate: f.EndDate ? new Date(f.EndDate).toISOString() : new Date().toISOString(),
            objective_id: f.StrategyGoalLookupId?.toString(),
            objectiveName: f.StrategyGoalLookupId ? 'Loading...' : 'N/A',
            responsible: f.ResponsibleLookupId || 'Unassigned',
            kpis: [],
            // 'Responsible' is a Person field. If expanded, we might get details. 
            // If only 'f.ResponsibleLookupId' is available, we can't construct a full User object easily without fetching.
            // For now, satisfy the type check but note it might be incomplete.
            owner: f.ResponsibleLookupId ? { id: f.ResponsibleLookupId, name: 'Loading...', email: '' } : null,
            ownerId: f.ResponsibleLookupId || null,
            assignees: assignees,
            unitKpis: [],
            unitObjectives: null,
            name: f.Title,
            objectiveId: f.StrategyGoalLookupId?.toString() ?? '',
            endDate: f.EndDate ? new Date(f.EndDate) : new Date(),
            createdAt: item.createdDateTime,
            updatedAt: item.lastModifiedDateTime,
            description: f.Description || '',
        };
    }

    private mapKPI(item: any): Kpi {
        const f = item.fields;

        let assignees: any[] = [];
        try {
            if (f.Assignees) {
                assignees = JSON.parse(f.Assignees);
            }
        } catch (e) {
            console.warn(`[SP Ops] Failed to parse Assignees JSON for KPI ${item.id}`, e);
        }

        return {
            id: item.id,
            name: f.Title,
            metric: f.Metric || '#',
            actual: f.ActualValue || 0,
            target: f.TargetValue || 0,
            status: (f.Status?.toLowerCase() || 'on-track').replace(' ', '-') as any,
            kra_id: f.RelatedKRALookupId?.toString(),
            assignees: assignees,
            unit: '',
            progress: 0,
            costAssociated: f.CostAssociated || 0,
            description: f.Description || '',
            startDate: f.StartDate || null,
            targetDate: f.EndDate || null,
        };
    }
    private mapProject(item: any): Project {
        const f = item.fields;
        return {
            id: item.id,
            name: f.Title,
            description: f.Description || '',
            status: (f.Status?.toLowerCase() as any) || 'planned',
            startDate: f.StartDate ? new Date(f.StartDate) : new Date(),
            endDate: f.EndDate ? new Date(f.EndDate) : new Date(),
            manager: f.ManagerLookupId || 'Unassigned',
            budget: f.Budget || 0,
            budgetSpent: f.BudgetSpent || 0,
            progress: 0,
            risks: f.RisksJSON ? JSON.parse(f.RisksJSON) : [],
            tasks: [],
            unit_id: f.Department,
            // Removed kra_id as it does not exist on Project type
        };
    }

    private mapTask(item: any): Task {
        const f = item.fields;
        return {
            id: item.id,
            title: f.Title,
            description: f.Description || '',
            status: (f.Status?.toLowerCase() || 'todo') as any,
            priority: (f.Priority?.toLowerCase() || 'medium') as any,
            assignee: f.AssignedToLookupId || 'Unassigned',
            dueDate: f.DueDate || '',
            subtasks: f.SubtasksJSON ? JSON.parse(f.SubtasksJSON) : [],
            tags: f.Tags ? f.Tags.split(',') : [],
            projectId: f.RelatedProjectLookupId?.toString(),
            kra_id: f.RelatedKRALookupId?.toString(),
            kpi_id: f.RelatedKPILookupId?.toString(),
            unit_id: f.Department,
            // Computed/Optional
            completed: f.Status === 'Done'
        };
    }

    private mapRisk(item: any): Risk {
        const f = item.fields;
        return {
            id: item.id,
            title: f.Title,
            description: f.Description || '',
            status: (f.Status?.toLowerCase() || 'identified') as any,
            impact: (f.Impact?.toLowerCase() || 'low') as any,
            likelihood: (f.Likelihood?.toLowerCase() || 'low') as any,
            category: f.Category || 'Operational',
            owner: f.OwnerLookupId || 'Unassigned',
            identificationDate: item.createdDateTime ? new Date(item.createdDateTime) : new Date(),
            mitigationPlan: f.MitigationPlan,
            createdAt: item.createdDateTime ? new Date(item.createdDateTime) : new Date(),
            updatedAt: item.lastModifiedDateTime ? new Date(item.lastModifiedDateTime) : new Date(),
            unit_id: f.Department,
            division_id: f.Department // Assuming division == department for now
        };
    }
}
