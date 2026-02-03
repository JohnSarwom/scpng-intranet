/**
 * Strategy SharePoint Service
 * Handles data fetching and mapping for the Strategy System from SharePoint Lists
 * 
 * SECURITY: Uses backend filtering to ensure users only receive data for their division
 */

import { Client } from '@microsoft/microsoft-graph-client';
import { StrategicItem, StrategyData } from '@/mockData/strategyData';

// Configuration for SharePoint Lists
const STRATEGY_CONFIG = {
    SITE_DOMAIN: 'scpng1.sharepoint.com',
    SITE_PATH: '/sites/scpngintranet',
    LISTS: {
        CONFIG: 'Strategy_Config',
        PILLARS: 'Strategic_Pillars',
        OBJECTIVES: 'Strategic_Objectives',
        ALIGNMENT: 'Divisional_Alignment',
        MILESTONES: 'Strategy_Milestones',
        RISKS: 'Strategy_Risks'
    }
};

export class StrategyService {
    private client: Client;
    private siteId: string = '';
    private listIds: Record<string, string> = {};

    constructor(client: Client) {
        this.client = client;
    }

    /**
     * Initialize service: get site ID and list IDs
     */
    async initialize(): Promise<void> {
        console.log('🔧 [StrategyService] Initializing SharePoint connection (New Schema)...');

        try {
            // Get Site ID
            const site = await this.client
                .api(`/sites/${STRATEGY_CONFIG.SITE_DOMAIN}:${STRATEGY_CONFIG.SITE_PATH}`)
                .get();

            this.siteId = site.id;
            console.log(`✅ [StrategyService] Site ID obtained: ${this.siteId}`);

            // Get List IDs
            await this.resolveListIds();

            console.log('✅ [StrategyService] Initialization complete!');
        } catch (error) {
            console.error('❌ [StrategyService] Initialization FAILED', error);
            throw error;
        }
    }

    private async resolveListIds() {
        const lists = await this.client
            .api(`/sites/${this.siteId}/lists`)
            .select('id,displayName')
            .get();

        const targetLists = Object.values(STRATEGY_CONFIG.LISTS);

        lists.value.forEach((list: any) => {
            if (targetLists.includes(list.displayName)) {
                const key = Object.keys(STRATEGY_CONFIG.LISTS).find(
                    k => STRATEGY_CONFIG.LISTS[k as keyof typeof STRATEGY_CONFIG.LISTS] === list.displayName
                );
                if (key) {
                    this.listIds[key] = list.id;
                    console.log(`   ✓ [StrategyService] Found List: ${list.displayName} -> ${list.id}`);
                }
            }
        });

        // Debug: Log which lists were NOT found
        Object.entries(STRATEGY_CONFIG.LISTS).forEach(([key, name]) => {
            if (!this.listIds[key]) {
                console.error(`   ✗ [StrategyService] CRITICAL: List NOT found: ${name}`);
            }
        });
    }

    /**
     * Fetch full strategy tree
     */
    async getFullStrategy(): Promise<any> {
        console.log(`📥 [StrategyService] Fetching full strategy data Hub...`);

        try {
            const [config, pillars, objectives, alignments, milestones, risks] = await Promise.all([
                this.fetchConfig().catch(e => { console.error('Error fetching config', e); return []; }),
                this.fetchPillars().catch(e => { console.error('Error fetching pillars', e); return []; }),
                this.fetchObjectives().catch(e => { console.error('Error fetching objectives', e); return []; }),
                this.fetchAlignments().catch(e => { console.error('Error fetching alignments', e); return []; }),
                this.fetchMilestones().catch(e => { console.error('Error fetching milestones', e); return []; }),
                this.fetchRisks().catch(e => { console.error('Error fetching risks', e); return []; })
            ]);

            // Build Organization Info
            const mission = config.find(c => c.key === 'Mission')?.value || 'Mission not defined';
            const vision = config.find(c => c.key === 'Vision')?.value || 'Vision not defined';

            return {
                organization: {
                    mission,
                    vision,
                    values: [] // Fetched separately or defaulted
                },
                pillars,
                objectives,
                alignments,
                milestones,
                risks
            };

        } catch (error) {
            console.error('❌ [StrategyService] Failed to fetch full strategy', error);
            throw error;
        }
    }

    private async fetchConfig(): Promise<Array<{ key: string, value: string }>> {
        if (!this.listIds['CONFIG']) return [];
        const items = await this.client.api(`/sites/${this.siteId}/lists/${this.listIds['CONFIG']}/items`).expand('fields').get();
        return items.value.map((item: any) => ({
            key: item.fields.Title,
            value: item.fields.Value
        }));
    }

    private async fetchPillars(): Promise<StrategicItem[]> {
        if (!this.listIds['PILLARS']) return [];
        // Fetch all and sort in memory to avoid indexing issues
        try {
            const items = await this.client.api(`/sites/${this.siteId}/lists/${this.listIds['PILLARS']}/items`)
                .expand('fields')
                .get();

            console.log(`📊 [StrategyService] Pillars fetched: ${items.value?.length || 0}`);

            return (items.value || [])
                .map((item: any) => ({
                    id: item.id,
                    title: item.fields.Title,
                    description: item.fields.Description || '',
                    status: (item.fields.Status?.toLowerCase() || 'on-track') as any,
                    progress: item.fields.Progress || 0,
                    icon: item.fields.IconName || 'Award',
                    sortOrder: item.fields.SortOrder || 0
                }))
                .sort((a: any, b: any) => a.sortOrder - b.sortOrder);
        } catch (error) {
            console.error('❌ [StrategyService] Error fetching pillars:', error);
            return [];
        }
    }

    private async fetchObjectives(): Promise<StrategicItem[]> {
        if (!this.listIds['OBJECTIVES']) return [];
        // Fetch all and filter in memory to avoid indexing issues
        try {
            const items = await this.client.api(`/sites/${this.siteId}/lists/${this.listIds['OBJECTIVES']}/items`)
                .expand('fields')
                .get();

            console.log(`📊 [StrategyService] Objectives fetched raw: ${items.value?.length || 0}`);

            return (items.value || [])
                .filter((item: any) => {
                    const type = item.fields.GoalType;
                    const isFeatured = item.fields.IsFeatured;
                    // For the Hub, we want all high level objectives
                    // Include if Org level, or missing type, or featured
                    return type === 'Org' || !type || isFeatured === true || isFeatured === 1 || isFeatured === "1";
                })
                .map((item: any) => {
                    // Normalize isFeatured to boolean
                    const isFeatured = item.fields.IsFeatured === true || item.fields.IsFeatured === 1 || item.fields.IsFeatured === "1";

                    return {
                        id: item.id,
                        title: item.fields.Title,
                        description: item.fields.Description || '',
                        progress: item.fields.Progress || 0,
                        status: (item.fields.Status?.toLowerCase().replace(' ', '-') || 'on-track') as any,
                        icon: item.fields.Icon || 'Target',
                        goals: item.fields.Deliverables ? item.fields.Deliverables.split(',').map((s: string) => s.trim()) : [],
                        isFeatured: isFeatured
                    };
                });
        } catch (error) {
            console.error('❌ [StrategyService] Error fetching objectives:', error);
            return [];
        }
    }

    /**
     * Update a single objective
     */
    async updateObjective(id: string, data: any): Promise<void> {
        if (!this.listIds['OBJECTIVES']) throw new Error("Objectives list not found");

        console.log(`📤 [StrategyService] Updating objective ${id}...`, data);

        const fields: any = {};
        if (data.title) fields.Title = data.title;
        if (data.description !== undefined) fields.Description = data.description;
        if (data.progress !== undefined) fields.Progress = data.progress;

        if (data.status) {
            // Map kebab-case back to Title Case for SharePoint Choice field
            const statusMap: Record<string, string> = {
                'on-track': 'On Track',
                'at-risk': 'At Risk',
                'behind': 'Behind',
                'completed': 'Completed'
            };
            fields.Status = statusMap[data.status] || data.status;
        }

        if (data.icon) fields.Icon = data.icon;

        if (data.goals && Array.isArray(data.goals)) {
            fields.Deliverables = data.goals.join(', ');
        }

        await this.client.api(`/sites/${this.siteId}/lists/${this.listIds['OBJECTIVES']}/items/${id}`).patch({
            fields
        });
    }

    /**
     * Bulk update strategy configuration and setup
     */
    async updateFullStrategy(data: any): Promise<void> {
        console.log('📤 [StrategyService] Updating full strategy data...', data);

        const updates = [];

        // 1. Update Mission & Vision in Config
        if (data.mission) updates.push(this.updateConfigItem('Mission', data.mission));
        if (data.vision) updates.push(this.updateConfigItem('Vision', data.vision));

        // 2. Update Pillars
        if (data.pillars && Array.isArray(data.pillars)) {
            updates.push(this.updatePillarsBulk(data.pillars));
        }

        // 3. Update Alignments
        if (data.alignments && Array.isArray(data.alignments)) {
            updates.push(this.updateAlignmentsBulk(data.alignments));
        }

        await Promise.all(updates);
    }

    private async updateConfigItem(key: string, value: string): Promise<void> {
        if (!this.listIds['CONFIG']) return;

        // Find item ID
        const items = await this.client.api(`/sites/${this.siteId}/lists/${this.listIds['CONFIG']}/items`)
            .filter(`fields/Title eq '${key}'`)
            .get();

        if (items.value && items.value.length > 0) {
            const itemId = items.value[0].id;
            await this.client.api(`/sites/${this.siteId}/lists/${this.listIds['CONFIG']}/items/${itemId}`).patch({
                fields: { Value: value }
            });
        } else {
            // Create if not exists
            await this.client.api(`/sites/${this.siteId}/lists/${this.listIds['CONFIG']}/items`).post({
                fields: { Title: key, Value: value }
            });
        }
    }

    private async updatePillarsBulk(pillars: any[]): Promise<void> {
        if (!this.listIds['PILLARS']) return;

        // Simple strategy: iterate and update/create. For simplicity in wizard, 
        // we often assume pillars are fixed names or we match by Title.
        for (let i = 0; i < pillars.length; i++) {
            const pillar = pillars[i];
            const title = pillar.name || pillar.title;

            const existing = await this.client.api(`/sites/${this.siteId}/lists/${this.listIds['PILLARS']}/items`)
                .filter(`fields/Title eq '${title}'`)
                .get();

            const payload = {
                fields: {
                    Title: title,
                    Description: pillar.description,
                    IconName: pillar.icon || pillar.IconName,
                    SortOrder: i + 1,
                    Progress: pillar.progress || 0,
                    Status: pillar.status || 'On Track'
                }
            };

            if (existing.value && existing.value.length > 0) {
                await this.client.api(`/sites/${this.siteId}/lists/${this.listIds['PILLARS']}/items/${existing.value[0].id}`).patch(payload);
            } else {
                await this.client.api(`/sites/${this.siteId}/lists/${this.listIds['PILLARS']}/items`).post(payload);
            }
        }
    }

    private async updateAlignmentsBulk(alignments: any[]): Promise<void> {
        if (!this.listIds['ALIGNMENT']) return;

        for (const align of alignments) {
            const existing = await this.client.api(`/sites/${this.siteId}/lists/${this.listIds['ALIGNMENT']}/items`)
                .filter(`fields/Title eq '${align.name}'`)
                .get();

            const payload = {
                fields: {
                    Title: align.name,
                    Director: align.director,
                    Icon: align.icon,
                    KRAs: Array.isArray(align.kras) ? align.kras.join(', ') : align.kras,
                    AlignedObjectiveLookupId: align.alignedObjectiveId
                }
            };

            if (existing.value && existing.value.length > 0) {
                await this.client.api(`/sites/${this.siteId}/lists/${this.listIds['ALIGNMENT']}/items/${existing.value[0].id}`).patch(payload);
            } else {
                await this.client.api(`/sites/${this.siteId}/lists/${this.listIds['ALIGNMENT']}/items`).post(payload);
            }
        }
    }

    private async fetchAlignments(): Promise<any[]> {
        if (!this.listIds['ALIGNMENT']) return [];
        const items = await this.client.api(`/sites/${this.siteId}/lists/${this.listIds['ALIGNMENT']}/items`).expand('fields').get();
        return items.value.map((item: any) => ({
            id: item.id,
            name: item.fields.Title,
            director: item.fields.Director,
            icon: item.fields.Icon || 'LayoutDashboard',
            kras: item.fields.KRAs ? item.fields.KRAs.split(',').map((s: string) => s.trim()) : [],
            alignedObjectiveId: item.fields.AlignedObjectiveLookupId?.toString(),
            alignedObjectiveTitle: item.fields.AlignedObjectiveLookupValue
        }));
    }

    private async fetchMilestones(): Promise<any[]> {
        if (!this.listIds['MILESTONES']) return [];
        const items = await this.client.api(`/sites/${this.siteId}/lists/${this.listIds['MILESTONES']}/items`).expand('fields').get();
        return items.value.map((item: any) => ({
            id: item.id,
            title: item.fields.Title,
            date: item.fields.MilestoneDate,
            status: item.fields.Status,
            context: item.fields.Context,
            color: item.fields.ColorHex || '#800020'
        }));
    }

    private async fetchRisks(): Promise<any[]> {
        if (!this.listIds['RISKS']) return [];
        const items = await this.client.api(`/sites/${this.siteId}/lists/${this.listIds['RISKS']}/items`).expand('fields').get();
        return items.value.map((item: any) => ({
            id: item.id,
            title: item.fields.Title,
            impact: item.fields.ImpactLevel,
            context: item.fields.Context
        }));
    }
}
