/**
 * SharePoint List Setup Service
 * Programmatically creates Strategy System lists with proper columns and relationships
 */

import { Client } from '@microsoft/microsoft-graph-client';

export class SharePointListSetupService {
    private client: Client;
    private siteId: string;

    constructor(client: Client, siteId: string) {
        this.client = client;
        this.siteId = siteId;
    }

    /**
     * Create all Strategy System lists
     */
    async createAllLists(): Promise<{ success: boolean; message: string; details: any }> {
        console.log('🚀 [Setup] Starting SharePoint list creation...');

        try {
            const results = {
                config: null as any,
                pillars: null as any,
                objectives: null as any
            };

            // Step 1: Create Strategy_Config list
            console.log('📝 [Setup] Creating Strategy_Config list...');
            results.config = await this.createStrategyConfigList();
            console.log('✅ [Setup] Strategy_Config created');

            // Step 2: Create Strategic_Pillars list
            console.log('📝 [Setup] Creating Strategic_Pillars list...');
            results.pillars = await this.createStrategicPillarsList();
            console.log('✅ [Setup] Strategic_Pillars created');

            // Step 3: Create Strategic_Objectives list (with lookups)
            console.log('📝 [Setup] Creating Strategic_Objectives list...');
            results.objectives = await this.createStrategicObjectivesList(results.pillars.id);
            console.log('✅ [Setup] Strategic_Objectives created');

            // Step 4: Add sample data
            await this.addSampleData(results);
            console.log('✅ [Setup] Sample data added');

            // Step 5: Create Operations Lists (KRAs, KPIs, Projects, Tasks, Risks)
            console.log('📝 [Setup] Creating Operations Lists...');
            const opsResults = await this.createOperationsLists();
            if (!opsResults.success) {
                console.warn('⚠️ [Setup] Operations lists creation had issues:', opsResults.message);
                // We don't fail the whole process but warn
            } else {
                console.log('✅ [Setup] Operations lists created');
            }

            return {
                success: true,
                message: 'All Strategy lists created successfully!',
                details: results
            };

        } catch (error: any) {
            console.error('❌ [Setup] Failed to create lists:', error);
            return {
                success: false,
                message: `Failed to create lists: ${error.message}`,
                details: error
            };
        }
    }

    /**
     * Create Strategy_Config list (Mission, Vision, Values)
     */
    private async createStrategyConfigList() {
        const list = await this.client
            .api(`/sites/${this.siteId}/lists`)
            .post({
                displayName: 'Strategy_Config',
                columns: [
                    {
                        name: 'Value',
                        text: { allowMultipleLines: true, maxLength: 5000 }
                    }
                ],
                list: {
                    template: 'genericList'
                }
            });

        return list;
    }

    /**
     * Create Strategic_Pillars list
     */
    private async createStrategicPillarsList() {
        const list = await this.client
            .api(`/sites/${this.siteId}/lists`)
            .post({
                displayName: 'Strategic_Pillars',
                columns: [
                    {
                        name: 'Description',
                        text: { allowMultipleLines: true }
                    },
                    {
                        name: 'IconName',
                        text: {}
                    },
                    {
                        name: 'SortOrder',
                        number: { decimalPlaces: 'none' }
                    },
                    {
                        name: 'Progress',
                        number: { decimalPlaces: 'none', minimum: 0, maximum: 100 }
                    },
                    {
                        name: 'Status',
                        choice: {
                            choices: ['On Track', 'At Risk', 'Behind', 'Completed']
                        }
                    }
                ],
                list: {
                    template: 'genericList'
                }
            });

        return list;
    }

    /**
     * Create Strategic_Goals list with lookups
     */
    private async createStrategicObjectivesList(pillarsListId: string) {
        // First create the list
        const list = await this.client
            .api(`/sites/${this.siteId}/lists`)
            .post({
                displayName: 'Strategic_Objectives',
                columns: [
                    {
                        name: 'Description',
                        text: { allowMultipleLines: true }
                    },
                    {
                        name: 'GoalType',
                        choice: {
                            choices: ['Org', 'Division']
                        }
                    },
                    {
                        name: 'Division',
                        choice: {
                            choices: [
                                'Executive Division',
                                'HR Division',
                                'Finance Division',
                                'IT Division',
                                'Operations Division',
                                'Investigations Unit'
                            ]
                        }
                    },
                    {
                        name: 'Unit',
                        text: {}
                    },
                    {
                        name: 'Status',
                        choice: {
                            choices: ['On Track', 'At Risk', 'Behind', 'Completed']
                        }
                    },
                    {
                        name: 'Progress',
                        number: { decimalPlaces: 'none', minimum: 0, maximum: 100 }
                    },
                    {
                        name: 'Year',
                        text: {}
                    },
                    {
                        name: 'StartDate',
                        dateTime: { format: 'dateOnly' }
                    },
                    {
                        name: 'EndDate',
                        dateTime: { format: 'dateOnly' }
                    },
                    {
                        name: 'Owner',
                        personOrGroup: {}
                    }
                ],
                list: {
                    template: 'genericList'
                }
            });

        // Add lookup columns (need to be added after list creation)
        await this.addLookupColumn(list.id, 'ParentPillarId', pillarsListId, 'Title');
        await this.addLookupColumn(list.id, 'ParentGoalId', list.id, 'Title'); // Self-referencing

        return list;
    }

    /**
     * Add a lookup column to a list
     */
    private async addLookupColumn(
        listId: string,
        columnName: string,
        lookupListId: string,
        lookupField: string
    ) {
        try {
            await this.client
                .api(`/sites/${this.siteId}/lists/${listId}/columns`)
                .post({
                    name: columnName,
                    lookup: {
                        listId: lookupListId,
                        columnName: lookupField
                    }
                });
            console.log(`   ✓ Added lookup column: ${columnName}`);
        } catch (error) {
            console.warn(`   ⚠️ Failed to add lookup column ${columnName}:`, error);
        }
    }

    /**
     * Add sample data to the lists
     */
    private async addSampleData(lists: any) {
        try {
            // Add Mission, Vision, Values
            await this.addConfigData(lists.config.id);

            // Add Strategic Pillars
            const pillarIds = await this.addPillarsData(lists.pillars.id);

            // Add Org Goals and Division Goals
            const objectivesList = await this.createStrategicObjectivesList(lists.pillars.id);
            lists.objectives = objectivesList;

            // Add sample data to objectives
            await this.addObjectivesSampleData(objectivesList.id, pillarIds);

        } catch (error) {
            console.warn('⚠️ [Setup] Failed to add sample data:', error);
        }
    }

    private async addConfigData(listId: string) {
        const items = [
            {
                fields: {
                    Title: 'Mission',
                    Value: 'To provide efficient and transparent public service that serves the people of Papua New Guinea'
                }
            },
            {
                fields: {
                    Title: 'Vision',
                    Value: 'A leading public service organization delivering excellence in governance and accountability'
                }
            },
            {
                fields: {
                    Title: 'Values',
                    Value: JSON.stringify([
                        { name: "Protect", description: "Safeguarding investors from scams and market manipulation.", icon: "Shield" },
                        { name: "Develop", description: "Encouraging new capital formation and innovative market products.", icon: "TrendingUp" },
                        { name: "Regulate", description: "Ensuring all market participants follow the rule of law.", icon: "Award" },
                        { name: "Mitigate", description: "Reducing systemic risks within the PNG financial landscape.", icon: "Zap" }
                    ])
                }
            }
        ];

        for (const item of items) {
            await this.client
                .api(`/sites/${this.siteId}/lists/${listId}/items`)
                .post(item);
        }
    }

    private async addPillarsData(listId: string) {
        const pillars = [
            {
                fields: {
                    Title: 'Operational Excellence',
                    Description: 'Streamline processes and improve efficiency across all operations',
                    IconName: 'target',
                    SortOrder: 1,
                    Progress: 65,
                    Status: 'On Track'
                }
            },
            {
                fields: {
                    Title: 'Digital Transformation',
                    Description: 'Modernize systems and embrace technology for better service delivery',
                    IconName: 'laptop',
                    SortOrder: 2,
                    Progress: 45,
                    Status: 'At Risk'
                }
            },
            {
                fields: {
                    Title: 'People Development',
                    Description: 'Build capacity and develop talent to achieve organizational goals',
                    IconName: 'users',
                    SortOrder: 3,
                    Progress: 80,
                    Status: 'On Track'
                }
            }
        ];

        const createdIds: string[] = [];
        for (const pillar of pillars) {
            const created = await this.client
                .api(`/sites/${this.siteId}/lists/${listId}/items`)
                .post(pillar);
            createdIds.push(created.id);
        }

        return createdIds;
    }

    private async addObjectivesSampleData(listId: string, pillarIds: string[]) {
        // Add Org Goals (these have ParentPillarId but no ParentGoalId)
        const orgGoal1 = await this.client
            .api(`/sites/${this.siteId}/lists/${listId}/items`)
            .post({
                fields: {
                    Title: 'Reduce processing time by 30%',
                    Description: 'Streamline approval workflows and reduce bureaucratic delays',
                    GoalType: 'Org',
                    ParentPillarIdLookupId: parseInt(pillarIds[0]),  // Convert to number
                    Status: 'On Track',
                    Progress: 65,
                    Year: '2025',
                    Icon: 'Target',
                    IsFeatured: false
                }
            });

        const orgGoal2 = await this.client
            .api(`/sites/${this.siteId}/lists/${listId}/items`)
            .post({
                fields: {
                    Title: 'Implement cloud infrastructure',
                    Description: 'Migrate 80% of systems to cloud-based solutions',
                    GoalType: 'Org',
                    ParentPillarIdLookupId: parseInt(pillarIds[1]),  // Convert to number
                    Status: 'At Risk',
                    Progress: 45,
                    Year: '2025',
                    Icon: 'Rocket',
                    IsFeatured: true
                }
            });

        // Add Division Goals (these have ParentGoalId but no ParentPillarId)
        await this.client
            .api(`/sites/${this.siteId}/lists/${listId}/items`)
            .post({
                fields: {
                    Title: 'Automate HR onboarding process',
                    Description: 'Reduce onboarding time from 5 days to 2 days',
                    GoalType: 'Division',
                    Division: 'Executive Division',
                    ParentGoalIdLookupId: parseInt(orgGoal1.id),  // Convert to number
                    Status: 'On Track',
                    Progress: 70,
                    Year: '2025'
                }
            });

        await this.client
            .api(`/sites/${this.siteId}/lists/${listId}/items`)
            .post({
                fields: {
                    Title: 'Deploy new finance system',
                    Description: 'Implement cloud-based ERP for finance operations',
                    GoalType: 'Division',
                    Division: 'Finance Division',
                    ParentGoalIdLookupId: parseInt(orgGoal2.id),  // Convert to number
                    Status: 'Behind',
                    Progress: 30,
                    Year: '2025'
                }
            });
    }

    /**
     * Delete all Strategy System lists
     */

    /**
     * Check if lists already exist
     */
    async checkExistingLists(): Promise<{ exists: boolean; lists: string[] }> {
        try {
            const response = await this.client
                .api(`/sites/${this.siteId}/lists`)
                .select('displayName')
                .get();

            const existingLists = response.value
                .map((list: any) => list.displayName)
                .filter((name: string) =>
                    name === 'Strategy_Config' ||
                    name === 'Strategic_Pillars' ||
                    name === 'Strategic_Objectives' ||
                    name === 'Performance_KRAs' ||
                    name === 'Performance_KPIs' ||
                    name === 'Operations_Projects' ||
                    name === 'Operations_Projects' ||
                    name === 'Operations_Tasks' ||
                    name === 'Operations_Risks' ||
                    name === 'Market_Companies' ||
                    name === 'Market_PriceHistory' ||
                    name === 'Market_Settings' ||
                    name === 'Organizational_Documents'
                );

            return {
                exists: existingLists.length > 0,
                lists: existingLists
            };
        } catch (error) {
            console.error('Failed to check existing lists:', error);
            return { exists: false, lists: [] };
        }
    }

    /**
     * Create Operations Lists (KRAs, KPIs, Projects, Tasks)
     */
    async createOperationsLists(): Promise<{ success: boolean; message: string; details: any }> {
        console.log('🚀 [Setup] Starting Operations list creation...');
        const results = {
            kras: null as any,
            kpis: null as any,
            projects: null as any,
            tasks: null as any,
            risks: null as any
        };

        try {
            // Check if Strategic_Objectives exists (unified source)
            const goalListCheck = await this.client
                .api(`/sites/${this.siteId}/lists`)
                .filter("displayName eq 'Strategic_Objectives'")
                .get();

            if (!goalListCheck.value || goalListCheck.value.length === 0) {
                throw new Error('Strategic_Objectives list not found. Please create Strategy Hub Lists first.');
            }
            const goalListId = goalListCheck.value[0].id;

            // 1. Create Performance_KRAs
            console.log('📝 [Setup] Creating Performance_KRAs...');
            const kraList = await this.createKrasList(goalListId);
            results.kras = kraList;
            console.log('✅ [Setup] Performance_KRAs created');

            // 2. Create Performance_KPIs
            console.log('📝 [Setup] Creating Performance_KPIs...');
            results.kpis = await this.createKpisList(kraList.id);
            console.log('✅ [Setup] Performance_KPIs created');

            // 3. Create Operations_Projects
            console.log('📝 [Setup] Creating Operations_Projects...');
            results.projects = await this.createProjectsList(kraList.id);
            console.log('✅ [Setup] Operations_Projects created');

            // 4. Create Operations_Risks
            console.log('📝 [Setup] Creating Operations_Risks...');
            results.risks = await this.createRisksList(results.projects.id, kraList.id);
            console.log('✅ [Setup] Operations_Risks created');

            // 5. Create Operations_Tasks
            console.log('📝 [Setup] Creating Operations_Tasks...');
            results.tasks = await this.createTasksList(results.projects.id, kraList.id, results.kpis.id);
            console.log('✅ [Setup] Operations_Tasks created');

            // 6. Create System_View_Settings
            console.log('📝 [Setup] Creating System_View_Settings...');
            await this.createViewSettingsList();
            console.log('✅ [Setup] System_View_Settings created');

            // 7. Add Sample Data
            console.log('📝 [Setup] Adding Operations sample data...');
            await this.addOperationsSampleData(goalListId, results);
            console.log('✅ [Setup] Operations sample data added');

            return {
                success: true,
                message: 'All Operations lists created successfully!',
                details: results
            };

        } catch (error: any) {
            console.error('❌ [Setup] Failed to create operations lists:', error);
            return {
                success: false,
                message: `Failed to create lists: ${error.message}`,
                details: error
            };
        }
    }

    /**
     * Create Organizational Documents List Setup (Dedicated)
     */
    async createSharedDocsSetup(): Promise<{ success: boolean; message: string; details: any }> {
        console.log('🚀 [Setup] Starting Organizational Documents setup...');
        try {
            console.log('📝 [Setup] Creating Organizational_Documents...');
            const result = await this.createSharedDocumentsList();
            console.log('✅ [Setup] Organizational_Documents created');

            return {
                success: true,
                message: 'Organizational Documents library created successfully!',
                details: result,
            };
        } catch (error: any) {
            console.error('❌ [Setup] Failed to create shared docs:', error);
            return {
                success: false,
                message: `Failed to create shared docs: ${error.message}`,
                details: error,
            };
        }
    }

    /**
     * Delete Organizational Documents List Setup (Dedicated)
     */
    async deleteSharedDocsSetup(): Promise<{ success: boolean; message: string }> {
        console.log('🗑️ [Setup] Deleting Organizational Documents...');
        const listName = 'Organizational_Documents';
        try {
            const response = await this.client
                .api(`/sites/${this.siteId}/lists`)
                .filter(`displayName eq '${listName}'`)
                .select('id')
                .get();

            if (response.value && response.value.length > 0) {
                const listId = response.value[0].id;
                await this.client
                    .api(`/sites/${this.siteId}/lists/${listId}`)
                    .delete();
                console.log(`✅ [Setup] Deleted list: ${listName}`);
            } else {
                console.log(`ℹ️ [Setup] List not found: ${listName}`);
            }
            return { success: true, message: 'Organizational Documents deleted successfully' };
        } catch (error: any) {
            console.error('❌ [Setup] Failed to delete Organizational Documents:', error);
            return { success: false, message: `Failed to delete Organizational Documents: ${error.message}` };
        }
    }

    /**
     * Create Organizational_Documents Document Library
     */
    async createSharedDocumentsList() {
        // Check if exists first
        const check = await this.client.api(`/sites/${this.siteId}/lists`).filter("displayName eq 'Organizational_Documents'").get();
        if (check.value && check.value.length > 0) return check.value[0];

        const list = await this.client
            .api(`/sites/${this.siteId}/lists`)
            .post({
                displayName: 'Organizational_Documents',
                columns: [
                    { name: 'Category', choice: { choices: ['Governance & Legal', 'Company Strategy & Management', 'Communication & Branding', 'Training & Human Resources', 'IT & Systems', 'Records & Archives'] } },
                    { name: 'SubCategory', text: {} },
                    { name: 'DocDescription', text: { allowMultipleLines: true } },
                    { name: 'Tags', text: {} }
                ],
                list: { template: 'documentLibrary' }
            });

        return list;
    }

    /**
     * Create Performance_KRAs
     */
    private async createKrasList(goalListId: string) {
        const list = await this.client
            .api(`/sites/${this.siteId}/lists`)
            .post({
                displayName: 'Performance_KRAs',
                columns: [
                    { name: 'Department', text: {} },
                    { name: 'Responsible', personOrGroup: {} },
                    { name: 'StartDate', dateTime: { format: 'dateOnly' } },
                    { name: 'EndDate', dateTime: { format: 'dateOnly' } },
                    { name: 'Status', choice: { choices: ['Open', 'In Progress', 'Closed'] } },
                    { name: 'Progress', number: { decimalPlaces: 'none', minimum: 0, maximum: 100 } },
                    { name: 'Description', text: { allowMultipleLines: true } }
                ],
                list: { template: 'genericList' }
            });

        // Simplified name 'StrategyGoal' -> Field 'StrategyGoalId'
        await this.addLookupColumn(list.id, 'StrategyGoal', goalListId, 'Title');
        return list;
    }

    /**
     * Create Performance_KPIs
     */
    private async createKpisList(kraListId: string) {
        const list = await this.client
            .api(`/sites/${this.siteId}/lists`)
            .post({
                displayName: 'Performance_KPIs',
                columns: [
                    { name: 'Metric', text: {} }, // %, $, #
                    { name: 'TargetValue', number: { decimalPlaces: 'automatic' } },
                    { name: 'ActualValue', number: { decimalPlaces: 'automatic' } },
                    { name: 'Status', choice: { choices: ['On Track', 'At Risk', 'Behind', 'Completed'] } },
                    { name: 'CostAssociated', currency: { locale: 'en-AU' } },
                    { name: 'Description', text: { allowMultipleLines: true } },
                    { name: 'StartDate', dateTime: { format: 'dateOnly' } },
                    { name: 'EndDate', dateTime: { format: 'dateOnly' } },
                    { name: 'Assignees', text: { allowMultipleLines: true } }
                ],
                list: { template: 'genericList' }
            });

        await this.addLookupColumn(list.id, 'RelatedKRA', kraListId, 'Title');
        return list;
    }

    /**
     * Create Operations_Projects
     */
    private async createProjectsList(kraListId: string) {
        const list = await this.client
            .api(`/sites/${this.siteId}/lists`)
            .post({
                displayName: 'Operations_Projects',
                columns: [
                    { name: 'Manager', personOrGroup: {} },
                    { name: 'Department', text: {} },
                    { name: 'Status', choice: { choices: ['Planned', 'In Progress', 'Completed'] } },
                    { name: 'StartDate', dateTime: { format: 'dateOnly' } },
                    { name: 'EndDate', dateTime: { format: 'dateOnly' } },
                    { name: 'Budget', currency: { locale: 'en-AU' } },
                    { name: 'BudgetSpent', currency: { locale: 'en-AU' } },
                    { name: 'RisksJSON', text: { allowMultipleLines: true } }
                ],
                list: { template: 'genericList' }
            });

        await this.addLookupColumn(list.id, 'RelatedKRA', kraListId, 'Title');
        await this.addLookupColumn(list.id, 'RelatedKRA', kraListId, 'Title');
        return list;
    }

    /**
     * Create Operations_Risks
     */
    private async createRisksList(projectListId: string, kraListId: string) {
        const list = await this.client
            .api(`/sites/${this.siteId}/lists`)
            .post({
                displayName: 'Operations_Risks',
                columns: [
                    { name: 'Description', text: { allowMultipleLines: true } },
                    { name: 'Status', choice: { choices: ['Identified', 'Analyzing', 'Mitigating', 'Monitoring', 'Resolved', 'Accepted'] } },
                    { name: 'Impact', choice: { choices: ['Low', 'Medium', 'High', 'Critical'] } },
                    { name: 'Likelihood', choice: { choices: ['Low', 'Medium', 'High', 'Very-High'] } },
                    { name: 'Category', choice: { choices: ['Financial', 'Operational', 'Strategic', 'Compliance', 'Reputational'] } },
                    { name: 'MitigationPlan', text: { allowMultipleLines: true } },
                    { name: 'Owner', personOrGroup: {} },
                    { name: 'Department', text: {} }
                ],
                list: { template: 'genericList' }
            });

        await this.addLookupColumn(list.id, 'RelatedProject', projectListId, 'Title');
        await this.addLookupColumn(list.id, 'RelatedKRA', kraListId, 'Title');
        return list;
    }

    /**
     * Create Operations_Tasks
     */
    private async createTasksList(projectListId: string, kraListId: string, kpiListId: string) {
        const list = await this.client
            .api(`/sites/${this.siteId}/lists`)
            .post({
                displayName: 'Operations_Tasks',
                columns: [
                    { name: 'AssignedTo', personOrGroup: {} },
                    { name: 'Department', text: {} },
                    { name: 'DueDate', dateTime: {} },
                    { name: 'Status', choice: { choices: ['Todo', 'In Progress', 'Review', 'Done'] } },
                    { name: 'Priority', choice: { choices: ['Low', 'Medium', 'High', 'Urgent'] } },
                    { name: 'Description', text: { allowMultipleLines: true } },
                    { name: 'SubtasksJSON', text: { allowMultipleLines: true } },
                    { name: 'Tags', text: { allowMultipleLines: true } }
                ],
                list: { template: 'genericList' }
            });

        await this.addLookupColumn(list.id, 'RelatedProject', projectListId, 'Title');
        await this.addLookupColumn(list.id, 'RelatedKRA', kraListId, 'Title');
        await this.addLookupColumn(list.id, 'RelatedKPI', kpiListId, 'Title');
        return list;
    }

    /**
     * Delete Operations Lists
     */
    async deleteOperationsLists(): Promise<{ success: boolean; message: string }> {
        const listNames = ['Performance_KRAs', 'Performance_KPIs', 'Operations_Projects', 'Operations_Tasks', 'Operations_Risks', 'System_View_Settings'];
        try {
            for (const name of listNames) {
                try {
                    const response = await this.client
                        .api(`/sites/${this.siteId}/lists`)
                        .filter(`displayName eq '${name}'`)
                        .select('id')
                        .get();
                    if (response.value && response.value.length > 0) {
                        await this.client
                            .api(`/sites/${this.siteId}/lists/${response.value[0].id}`)
                            .delete();
                        console.log(`✅ [Setup] Deleted list: ${name}`);
                    }
                } catch (err) { console.warn(`Failed delete ${name}`, err); }
            }
            return { success: true, message: 'Operations lists deleted' };
        } catch (error: any) {
            return { success: false, message: error.message };
        }
    }

    /**
     * Create System_View_Settings List
     */
    async createViewSettingsList() {
        // Check if exists first
        const check = await this.client.api(`/sites/${this.siteId}/lists`).filter("displayName eq 'System_View_Settings'").get();
        if (check.value && check.value.length > 0) return check.value[0];

        const list = await this.client
            .api(`/sites/${this.siteId}/lists`)
            .post({
                displayName: 'System_View_Settings',
                columns: [
                    { name: 'PageName', text: {} },
                    { name: 'ComponentName', text: {} },
                    { name: 'VisibilityScope', choice: { choices: ['Division', 'Unit', 'Individual', 'All'] } },
                    { name: 'Description', text: { allowMultipleLines: true } }
                ],
                list: { template: 'genericList' }
            });

        // Add Default Settings
        const defaults = [
            { fields: { Title: 'UnitPage_Objectives', PageName: 'Unit Page', ComponentName: 'Objectives', VisibilityScope: 'Division', Description: 'Strategy Objectives visibility' } },
            { fields: { Title: 'UnitPage_KRAs', PageName: 'Unit Page', ComponentName: 'KRAs', VisibilityScope: 'Division', Description: 'Key Result Areas visibility' } },
            { fields: { Title: 'UnitPage_KPIs', PageName: 'Unit Page', ComponentName: 'KPIs', VisibilityScope: 'Division', Description: 'Key Performance Indicators visibility' } },
            { fields: { Title: 'UnitPage_Projects', PageName: 'Unit Page', ComponentName: 'Projects', VisibilityScope: 'Unit', Description: 'Projects and Initiatives' } },
            { fields: { Title: 'UnitPage_Tasks', PageName: 'Unit Page', ComponentName: 'Tasks', VisibilityScope: 'Unit', Description: 'Daily Tasks' } },
            { fields: { Title: 'UnitPage_Risks', PageName: 'Unit Page', ComponentName: 'Risks', VisibilityScope: 'Division', Description: 'Risk Register' } }
        ];

        for (const item of defaults) {
            await this.client.api(`/sites/${this.siteId}/lists/${list.id}/items`).post(item);
        }

        return list;
    }

    /**
     * Add Linked Sample Data for Operations
     */
    private async addOperationsSampleData(goalListId: string, lists: any) {
        // 1. Get a Division Goal to link to (e.g., "Automate HR...")
        const goals = await this.client
            .api(`/sites/${this.siteId}/lists/${goalListId}/items`)
            .header('Prefer', 'HonorNonIndexedQueriesWarningMayFailRandomly')
            .expand('fields')
            .filter("fields/GoalType eq 'Division'")
            .get();

        if (!goals.value || goals.value.length === 0) {
            console.warn('⚠️ No Division Goals found. Skipping KRA linkage.');
            return;
        }

        const hrGoal = goals.value.find((g: any) => g.fields.Division === 'Executive Division' || g.fields.Title.includes('HR')) || goals.value[0];
        const itGoal = goals.value.find((g: any) => g.fields.Division === 'Finance Division' || g.fields.Title.includes('Finance')) || goals.value[goals.value.length - 1];

        // 2. Create KRAs
        // KRA 1 for HR
        console.log(`🔗 [Setup] Linking KRA to Goal ID: ${hrGoal.id}`);
        const kra1 = await this.client.api(`/sites/${this.siteId}/lists/${lists.kras.id}/items`).post({
            fields: {
                Title: 'Reduce Hiring Time',
                Department: 'Executive Division',
                Status: 'In Progress',
                Progress: 40,
                StrategyGoalLookupId: parseInt(hrGoal.id), // Corrected to 'LookupId'
                StartDate: '2025-01-01',
                EndDate: '2025-12-31'
            }
        });

        // KRA 2 for IT/Finance
        const kra2 = await this.client.api(`/sites/${this.siteId}/lists/${lists.kras.id}/items`).post({
            fields: {
                Title: 'Modernize Financial Reporting',
                Department: 'Finance Division',
                Status: 'In Progress',
                Progress: 20,
                StrategyGoalLookupId: parseInt(itGoal.id),
                StartDate: '2025-01-01',
                EndDate: '2025-12-31'
            }
        });

        // 3. Create KPIs (Linked to KRA 1)
        const kpi1 = await this.client.api(`/sites/${this.siteId}/lists/${lists.kpis.id}/items`).post({
            fields: {
                Title: 'Average Days to Hire',
                Metric: 'Days',
                TargetValue: 30,
                ActualValue: 45,
                Status: 'Behind',
                RelatedKRALookupId: parseInt(kra1.id) // Using 'RelatedKRA' + 'Id'
            }
        });

        // 4. Create Project (Linked to KRA 2)
        const proj1 = await this.client.api(`/sites/${this.siteId}/lists/${lists.projects.id}/items`).post({
            fields: {
                Title: 'Finance System Migration',
                Department: 'Finance Division',
                Status: 'In Progress',
                StartDate: '2025-02-01',
                EndDate: '2025-10-30',
                Budget: 500000,
                BudgetSpent: 120000,
                RelatedKRALookupId: parseInt(kra2.id),
                RisksJSON: JSON.stringify([{ id: 1, text: 'Data migration failure', likelihood: 'Medium' }])
            }
        });

        // 5. Create Risks
        await this.client.api(`/sites/${this.siteId}/lists/${lists.risks.id}/items`).post({
            fields: {
                Title: 'Budget Overrun Risk',
                Description: 'Potential scope creep causing budget concerns',
                Status: 'Monitoring',
                Impact: 'High',
                Likelihood: 'Medium',
                Category: 'Financial',
                MitigationPlan: 'Bi-weekly budget reviews',
                Department: 'Finance Division',
                RelatedProjectLookupId: parseInt(proj1.id)
            }
        });

        await this.client.api(`/sites/${this.siteId}/lists/${lists.risks.id}/items`).post({
            fields: {
                Title: 'Hiring Delays',
                Description: 'Market shortage of qualified candidates',
                Status: 'Mitigating',
                Impact: 'Medium',
                Likelihood: 'High',
                Category: 'Operational',
                MitigationPlan: 'Engage external agencies',
                Department: 'Executive Division',
                RelatedKRALookupId: parseInt(kra1.id)
            }
        });

        // 5. Create Tasks
        // Task linked to Project
        await this.client.api(`/sites/${this.siteId}/lists/${lists.tasks.id}/items`).post({
            fields: {
                Title: 'Map legacy data fields',
                Department: 'Finance Division',
                Status: 'Done',
                Priority: 'High',
                DueDate: '2025-03-01',
                RelatedProjectLookupId: parseInt(proj1.id),
                SubtasksJSON: JSON.stringify([{ id: '1', text: 'Review schema', completed: true }])
            }
        });

        // Task linked to KRA (Ad-hoc)
        await this.client.api(`/sites/${this.siteId}/lists/${lists.tasks.id}/items`).post({
            fields: {
                Title: 'Draft new hiring policy',
                Department: 'Executive Division',
                Status: 'In Progress',
                Priority: 'Medium',
                DueDate: '2025-04-15',
                RelatedKRALookupId: parseInt(kra1.id)
            }
        });

        // Task linked to KPI (Data collection)
        await this.client.api(`/sites/${this.siteId}/lists/${lists.tasks.id}/items`).post({
            fields: {
                Title: 'Collect Q1 Hiring Metrics',
                Department: 'Executive Division',
                Status: 'Todo',
                Priority: 'Low',
                DueDate: '2025-04-01',
                RelatedKPILookupId: parseInt(kpi1.id)
            }
        });
    }


    /**
     * Create Market Data Lists
     */
    async createMarketDataLists(): Promise<{ success: boolean; message: string; details: any }> {
        console.log('🚀 [Setup] Starting Market Data list creation...');
        const results = {
            companies: null as any,
            history: null as any,
            settings: null as any
        };

        try {
            // 1. Create Market_Companies
            console.log('📝 [Setup] Creating Market_Companies...');
            results.companies = await this.createMarketCompaniesList();
            console.log('✅ [Setup] Market_Companies created');

            // 2. Create Market_PriceHistory
            console.log('📝 [Setup] Creating Market_PriceHistory...');
            results.history = await this.createMarketPriceHistoryList(results.companies.id);
            console.log('✅ [Setup] Market_PriceHistory created');

            // 3. Create Market_Settings
            console.log('📝 [Setup] Creating Market_Settings...');
            results.settings = await this.createMarketSettingsList();
            console.log('✅ [Setup] Market_Settings created');

            // 4. Seed Data
            console.log('📝 [Setup] Seeding Market Settings...');
            await this.seedMarketSettings(results.settings.id);
            console.log('✅ [Setup] Market Settings seeded');

            return {
                success: true,
                message: 'All Market Data lists created successfully!',
                details: results
            };
        } catch (error: any) {
            console.error('❌ [Setup] Failed to create Market Data lists:', error);
            return {
                success: false,
                message: `Failed to create lists: ${error.message}`,
                details: error
            };
        }
    }

    /**
     * Create Market_Companies List
     */
    private async createMarketCompaniesList() {
        const list = await this.client
            .api(`/sites/${this.siteId}/lists`)
            .post({
                displayName: 'Market_Companies',
                columns: [
                    { name: 'CompanyName', text: {} },
                    { name: 'Sector', text: {} },
                    { name: 'LastPrice', number: { decimalPlaces: 'automatic' } },
                    { name: 'PreviousClose', number: { decimalPlaces: 'automatic' } },
                    { name: 'ChangePercent', number: { decimalPlaces: 'automatic' } },
                    { name: 'Volume', number: { decimalPlaces: 'none' } },
                    { name: 'MarketCap', text: {} },
                    { name: 'PrimaryColor', text: {} },
                    { name: 'SecondaryColor', text: {} },
                    { name: 'IsActive', boolean: {} },
                    { name: 'DisplayOrder', number: { decimalPlaces: 'none' } },
                    { name: 'CompanyLogo', text: {} }, // Using text for URL simplication or Url type if supported
                    { name: 'Website', text: {} },
                    { name: 'Description', text: { allowMultipleLines: true } }
                ],
                list: {
                    template: 'genericList'
                }
            });
        return list;
    }

    /**
     * Create Market_PriceHistory List
     */
    private async createMarketPriceHistoryList(companiesListId: string) {
        const list = await this.client
            .api(`/sites/${this.siteId}/lists`)
            .post({
                displayName: 'Market_PriceHistory',
                columns: [
                    { name: 'TradeDate', dateTime: {} },
                    { name: 'OpenPrice', number: { decimalPlaces: 'automatic' } },
                    { name: 'HighPrice', number: { decimalPlaces: 'automatic' } },
                    { name: 'LowPrice', number: { decimalPlaces: 'automatic' } },
                    { name: 'ClosePrice', number: { decimalPlaces: 'automatic' } },
                    { name: 'Volume', number: { decimalPlaces: 'none' } },
                    { name: 'NumberOfTrades', number: { decimalPlaces: 'none' } },
                    { name: 'Value', number: { decimalPlaces: 'automatic' } }
                ],
                list: {
                    template: 'genericList'
                }
            });

        // Add Lookup
        await this.addLookupColumn(list.id, 'CompanySymbol', companiesListId, 'Title');
        return list;
    }

    /**
     * Create Market_Settings List
     */
    private async createMarketSettingsList() {
        return await this.client
            .api(`/sites/${this.siteId}/lists`)
            .post({
                displayName: 'Market_Settings',
                columns: [
                    { name: 'SettingKey', text: { enforceUniqueValues: true } },
                    { name: 'SettingValue', text: {} },
                    {
                        name: 'SettingType',
                        choice: {
                            choices: ['String', 'Number', 'Boolean', 'JSON', 'Color'],
                            displayAs: 'dropDownMenu'
                        }
                    },
                    { name: 'Category', text: {} },
                    { name: 'Description', text: { allowMultipleLines: true } },
                    { name: 'IsActive', boolean: {} }
                ],
                list: {
                    template: 'genericList'
                }
            });
    }

    /**
     * Seed Market Settings
     */
    private async seedMarketSettings(listId: string) {
        const settings = [
            { fields: { Title: 'Default Time Range', SettingKey: 'default_time_range', SettingValue: '2M', SettingType: 'String', Category: 'Display', IsActive: true } },
            { fields: { Title: 'Live Updates Enabled', SettingKey: 'live_updates_enabled', SettingValue: 'true', SettingType: 'Boolean', Category: 'Features', IsActive: true } },
            { fields: { Title: 'Auto Cycle Enabled', SettingKey: 'auto_cycle_enabled', SettingValue: 'false', SettingType: 'Boolean', Category: 'Features', IsActive: true } },
            { fields: { Title: 'Cycle Interval', SettingKey: 'cycle_interval', SettingValue: '5000', SettingType: 'Number', Category: 'Features', IsActive: true } },
            { fields: { Title: 'Update Interval', SettingKey: 'update_interval', SettingValue: '2000', SettingType: 'Number', Category: 'Features', IsActive: true } },
            { fields: { Title: 'Chart Animation Duration', SettingKey: 'chart_animation_duration', SettingValue: '800', SettingType: 'Number', Category: 'Display', IsActive: true } },
            { fields: { Title: 'Max Data Points', SettingKey: 'max_data_points', SettingValue: '100', SettingType: 'Number', Category: 'Performance', IsActive: true } }
        ];

        for (const item of settings) {
            await this.client.api(`/sites/${this.siteId}/lists/${listId}/items`).post(item);
        }
    }

    /**
     * Delete Market Lists
     */
    async deleteMarketDataLists(): Promise<{ success: boolean; message: string }> {
        const listNames = ['Market_Companies', 'Market_PriceHistory', 'Market_Settings'];
        try {
            for (const name of listNames) {
                try {
                    const response = await this.client
                        .api(`/sites/${this.siteId}/lists`)
                        .filter(`displayName eq '${name}'`)
                        .select('id')
                        .get();
                    if (response.value && response.value.length > 0) {
                        await this.client
                            .api(`/sites/${this.siteId}/lists/${response.value[0].id}`)
                            .delete();
                        console.log(`✅ [Setup] Deleted list: ${name}`);
                    }
                } catch (err) { console.warn(`Failed delete ${name}`, err); }
            }
            return { success: true, message: 'Market Data lists deleted' };
        } catch (error: any) {
            return { success: false, message: error.message };
        }
    }
    /**
     * Seed Market Data (Companies and Price History)
     */
    async seedMarketData(): Promise<{ success: boolean; message: string }> {
        console.log('🚀 [Setup] Starting Market Data Seeding...');

        try {
            // 1. Get Lists
            const lists = await this.client.api(`/sites/${this.siteId}/lists`).select('id,displayName').get();
            const companiesList = lists.value.find((l: any) => l.displayName === 'Market_Companies');
            const historyList = lists.value.find((l: any) => l.displayName === 'Market_PriceHistory');

            if (!companiesList || !historyList) {
                throw new Error('Market_Companies or Market_PriceHistory list not found. Please create lists first.');
            }

            // 2. Clear existing companies (optional? No, assuming empty or appending)
            // For now, we will just add. If duplicates exist, it might be messy but acceptable for test ground.

            // 3. Loop through companies
            for (const company of INITIAL_COMPANIES) {
                console.log(`📝 [Setup] Seeding company: ${company.symbol}...`);

                // Create Company Item
                const companyItem = await this.client.api(`/sites/${this.siteId}/lists/${companiesList.id}/items`).post({
                    fields: {
                        Title: company.symbol, // Symbol as Title
                        CompanyName: company.name,
                        Sector: company.sector,
                        LastPrice: company.last,
                        PreviousClose: company.last * (1 - company.change / 100), // Approx
                        ChangePercent: company.change,
                        Volume: company.vol,
                        MarketCap: company.mcap,
                        PrimaryColor: company.colors.primary,
                        SecondaryColor: company.colors.secondary,
                        IsActive: true,
                        DisplayOrder: 0,
                        Description: `${company.name} is a leading entity in the ${company.sector} sector.`
                    }
                });

                const companyId = companyItem.id;
                console.log(`✅ [Setup] Created ${company.symbol} (ID: ${companyId})`);

                // Generate and Seed History
                console.log(`   ⏳ Generating history for ${company.symbol}...`);
                const history = this.generatePriceHistory(company.last, company.change, 60); // 60 days

                // Batch insert history? Graph requests are slow one by one.
                // We will do parallel requests in chunks of 5 to avoid throttling
                const chunkSize = 5;
                for (let i = 0; i < history.length; i += chunkSize) {
                    const chunk = history.slice(i, i + chunkSize);
                    await Promise.all(chunk.map(point => {
                        return this.client.api(`/sites/${this.siteId}/lists/${historyList.id}/items`).post({
                            fields: {
                                Title: `${company.symbol} - ${new Date(point.time).toLocaleDateString()}`,
                                CompanySymbolLookupId: companyId, // Lookup to the company item
                                TradeDate: new Date(point.time).toISOString(),
                                OpenPrice: point.open,
                                HighPrice: point.high,
                                LowPrice: point.low,
                                ClosePrice: point.close,
                                Volume: point.volume,
                                NumberOfTrades: Math.floor(point.volume / 100), // Synthetic
                                Value: point.close * point.volume
                            }
                        });
                    }));
                }
                console.log(`   ✅ History seeded for ${company.symbol}`);
            }

            return { success: true, message: 'Market Data seeding completed!' };
        } catch (error: any) {
            console.error('❌ [Setup] Seeding failed:', error);
            return { success: false, message: error.message };
        }
    }

    /**
     * Helper: Generate Price History
     * (Ported from MarketData.tsx)
     */
    private generatePriceHistory(startPrice: number, change: number, days: number): any[] {
        const history: any[] = [];
        const endPrice = startPrice;
        const start = startPrice * (1 - change / 100 * 1.5);
        const volatility = startPrice * 0.02;

        for (let i = 0; i < days; i++) {
            const progress = i / (days - 1);
            const trend = start + (endPrice - start) * progress;

            // Add some realistic market patterns
            const weeklyPattern = Math.sin(i / 7) * volatility * 0.5;
            const monthlyPattern = Math.sin(i / 30) * volatility * 0.3;
            const noise = (Math.random() - 0.5) * volatility;

            const close = Math.max(0.01, trend + noise + weeklyPattern + monthlyPattern);
            const open = close + (Math.random() - 0.5) * volatility * 0.5;
            const high = Math.max(open, close) + Math.random() * volatility * 0.3;
            const low = Math.min(open, close) - Math.random() * volatility * 0.3;

            const baseVolume = 500 + Math.random() * 2000;
            const volumeSpike = Math.random() > 0.9 ? Math.random() * 3000 : 0;
            const vol = Math.round(baseVolume + volumeSpike);

            history.push({
                time: Date.now() - (days - 1 - i) * 24 * 60 * 60 * 1000,
                open: +open.toFixed(2),
                high: +high.toFixed(2),
                low: +low.toFixed(2),
                close: +close.toFixed(2),
                volume: vol
            });
        }
        return history;
    }

    /**
     * Create EVERYTHING for the Strategy Hub (Design Schema)
     * One-click creation and seeding from Strategy Hub Mock Data
     */
    async setupStrategyHubEngine(): Promise<{ success: boolean; message: string; details: any }> {
        console.log('🚀 [StrategyHub] Starting Complete Setup...');
        const results: any = {};

        try {
            // 1. Config
            console.log('📝 [StrategyHub] 1/6 Strategy_Config...');
            results.config = await this.createStrategyConfigList();
            await this.seedStrategyHubConfig(results.config.id);

            // 2. Pillars
            console.log('📝 [StrategyHub] 2/6 Strategic_Pillars...');
            results.pillars = await this.createStrategicPillarsList();
            await this.seedStrategyHubPillars(results.pillars.id);

            // 3. Objectives
            console.log('📝 [StrategyHub] 3/6 Strategic_Objectives...');
            results.objectives = await this.createStrategicObjectivesList(results.pillars ? results.pillars.id : undefined);
            const objectiveMap = await this.seedStrategyHubObjectives(results.objectives.id);

            // 4. Alignment
            console.log('📝 [StrategyHub] 4/6 Divisional_Alignment...');
            results.alignment = await this.createDivisionalAlignmentList(results.objectives.id);
            await this.seedStrategyHubAlignment(results.alignment.id, objectiveMap);

            // 5. Milestones
            console.log('📝 [StrategyHub] 5/6 Strategy_Milestones...');
            results.milestones = await this.createStrategyMilestonesList();
            await this.seedStrategyHubMilestones(results.milestones.id);

            // 6. Risks
            console.log('📝 [StrategyHub] 6/6 Strategy_Risks...');
            results.risks = await this.createStrategyRisksList();
            await this.seedStrategyHubRisks(results.risks.id);

            return {
                success: true,
                message: 'Enterprise Strategy Hub Engine deployed successfully!',
                details: results
            };

        } catch (error: any) {
            console.error('❌ [StrategyHub] Setup failed:', error);
            return { success: false, message: error.message, details: error };
        }
    }

    private async seedStrategyHubConfig(listId: string) {
        const items = [
            { fields: { Title: 'Mission', Value: 'To promote and maintain a secure capital market that is fair for and accessible to all stakeholders while supporting capital formation through innovative market development.' } },
            { fields: { Title: 'Vision', Value: 'To ensure Port Moresby becomes the Financial Capital of the Blue Pacific by 2040.' } },
            { fields: { Title: 'ExecutiveSummary', Value: 'The SCPNG Strategy Hub 2025–2030 outlines our path to modernizing PNG\'s capital markets through regulation, development, and international cooperation.' } }
        ];
        for (const item of items) await this.client.api(`/sites/${this.siteId}/lists/${listId}/items`).post(item);
    }

    private async seedStrategyHubPillars(listId: string) {
        const pillars = [
            { fields: { Title: 'Protect', Description: 'Safeguarding investors from scams and market manipulation.', IconName: 'Shield', SortOrder: 1 } },
            { fields: { Title: 'Develop', Description: 'Encouraging new capital formation and innovative market products.', IconName: 'TrendingUp', SortOrder: 2 } },
            { fields: { Title: 'Regulate', Description: 'Ensuring all market participants follow the rule of law.', IconName: 'Award', SortOrder: 3 } },
            { fields: { Title: 'Mitigate', Description: 'Reducing systemic risks within the PNG financial landscape.', IconName: 'Zap', SortOrder: 4 } }
        ];
        for (const p of pillars) await this.client.api(`/sites/${this.siteId}/lists/${listId}/items`).post(p);
    }


    private async seedStrategyHubObjectives(listId: string) {
        const objectives = [
            { fields: { Title: "Expand Markets & Connectivity", Description: "Enhance PNGX infrastructure and market accessibility.", Progress: 45, Icon: "TrendingUp", Status: "On Track", Deliverables: "PNGX Systems, Market Clean Up, Broker Expansion" } },
            { fields: { Title: "Regulatory Framework Reform", Description: "Modernize the legal environment to ensure fair markets.", Progress: 30, Icon: "ShieldCheck", Status: "On Track", Deliverables: "Legislative Updates, Thematic Green Bonds, New Codes" } },
            { fields: { Title: "Administrative Fundamentals", Description: "Strengthen internal governance and identity.", Progress: 60, Icon: "Building2", Status: "On Track", Deliverables: "Board Appointment, Strategic Planning, Policy Finalization" } },
            { fields: { Title: "Investor Education", Description: "Empower the public via awareness.", Progress: 25, Icon: "GraduationCap", Status: "Needs Attention", Deliverables: "Digital Reach, Investor Bootcamps, Regional Workshops" } },
            { fields: { Title: "National & International Cooperation", Description: "Solidify global standing and partners.", Progress: 40, Icon: "Globe", Status: "On Track", Deliverables: "IOSCO MMOU, Global Partnerships, IPA MOAs" } },
            { fields: { Title: "Centurion Enterprise System", Description: "Digitizing regulatory functions.", Progress: 15, Icon: "Rocket", Status: "On Track", Deliverables: "Licensing Module, Additional Core Modules", IsFeatured: true } }
        ];

        const map: Record<string, string> = {};
        for (const obj of objectives) {
            const created = await this.client.api(`/sites/${this.siteId}/lists/${listId}/items`).post(obj);
            map[obj.fields.Title] = created.id;
        }
        return map;
    }

    private async createDivisionalAlignmentList(objectiveListId: string) {
        const check = await this.client.api(`/sites/${this.siteId}/lists`).filter("displayName eq 'Divisional_Alignment'").get();
        if (check.value && check.value.length > 0) return check.value[0];

        const list = await this.client.api(`/sites/${this.siteId}/lists`).post({
            displayName: 'Divisional_Alignment',
            columns: [
                { name: 'Director', text: {} },
                { name: 'KRAs', text: { allowMultipleLines: true } },
                { name: 'Icon', text: {} },
                { name: 'ContributionWeight', number: { decimalPlaces: 'none' } }
            ],
            list: { template: 'genericList' }
        });

        await this.addLookupColumn(list.id, 'AlignedObjective', objectiveListId, 'Title');
        return list;
    }

    private async seedStrategyHubAlignment(listId: string, objectiveMap: Record<string, string>) {
        const divisions = [
            { fields: { Title: "Legal Services Division (LSD)", Director: "Director Legal Services", Icon: "ShieldCheck", ContributionWeight: 25, KRAs: "Pass amendments, IOSCO MMOU, Legal protocols", AlignedObjectiveLookupId: parseInt(objectiveMap["Regulatory Framework Reform"]) } },
            { fields: { Title: "LISD Division", Director: "Director LIS", Icon: "Zap", ContributionWeight: 35, KRAs: "Centurion Deployment, Unit Trust Codes, Broker licensing", AlignedObjectiveLookupId: parseInt(objectiveMap["Expand Markets & Connectivity"]) } },
            { fields: { Title: "Research & Publication (RPD)", Director: "Director R&P", Icon: "GraduationCap", ContributionWeight: 15, KRAs: "Digital Awareness, Investor Workshops, Roadmap events", AlignedObjectiveLookupId: parseInt(objectiveMap["Investor Education"]) } },
            { fields: { Title: "Corporate Services Division (CSD)", Director: "Director Corporate Services", Icon: "Building2", ContributionWeight: 20, KRAs: "Policy guides, IT Modernization, HR Framework", AlignedObjectiveLookupId: parseInt(objectiveMap["Administrative Fundamentals"]) } },
            { fields: { Title: "Internal Audit Unit", Director: "Manager Audit", Icon: "Shield", ContributionWeight: 10, KRAs: "Strategic Plan 2030, Audit frameworks, Risk monitoring", AlignedObjectiveLookupId: parseInt(objectiveMap["National & International Cooperation"]) } }
        ];

        for (const div of divisions) {
            await this.client.api(`/sites/${this.siteId}/lists/${listId}/items`).post(div);
        }
    }

    private async createStrategyMilestonesList() {
        const check = await this.client.api(`/sites/${this.siteId}/lists`).filter("displayName eq 'Strategy_Milestones'").get();
        if (check.value && check.value.length > 0) return check.value[0];

        return await this.client.api(`/sites/${this.siteId}/lists`).post({
            displayName: 'Strategy_Milestones',
            columns: [
                { name: 'MilestoneDate', dateTime: { format: 'dateOnly' } },
                { name: 'Status', choice: { choices: ['Upcoming', 'Planning', 'On-Track', 'Critical'] } },
                { name: 'Context', text: {} },
                { name: 'ColorHex', text: {} }
            ],
            list: { template: 'genericList' }
        });
    }

    private async seedStrategyHubMilestones(listId: string) {
        const milestones = [
            { fields: { Title: "Internal Policy Finalization", Context: "CSD Operations", MilestoneDate: "2025-05-15", Status: "On-Track", ColorHex: "#0066cc" } },
            { fields: { Title: "Strategic Plan 2025–2030", Context: "Executive Board", MilestoneDate: "2025-09-01", Status: "Planning", ColorHex: "#7c3aed" } },
            { fields: { Title: "Centurion Licensing Module", Context: "LISD Digitalization", MilestoneDate: "2026-01-10", Status: "Upcoming", ColorHex: "#d97706" } }
        ];
        for (const m of milestones) await this.client.api(`/sites/${this.siteId}/lists/${listId}/items`).post(m);
    }

    private async createStrategyRisksList() {
        const check = await this.client.api(`/sites/${this.siteId}/lists`).filter("displayName eq 'Strategy_Risks'").get();
        if (check.value && check.value.length > 0) return check.value[0];

        return await this.client.api(`/sites/${this.siteId}/lists`).post({
            displayName: 'Strategy_Risks',
            columns: [
                { name: 'ImpactLevel', choice: { choices: ['Low', 'Medium', 'High', 'Critical'] } },
                { name: 'Context', text: { allowMultipleLines: true } }
            ],
            list: { template: 'genericList' }
        });
    }

    private async seedStrategyHubRisks(listId: string) {
        const risks = [
            { fields: { Title: "Legislative Delay", ImpactLevel: "High", Context: "Parliamentary backlog may delay SC Act amendments." } },
            { fields: { Title: "Resource Constraints", ImpactLevel: "Medium", Context: "Limited specialized headcount for IOSCO compliance." } },
            { fields: { Title: "Cyber Security Threat", ImpactLevel: "Critical", Context: "Digital transformation increases attack surface on market data." } }
        ];
        for (const r of risks) await this.client.api(`/sites/${this.siteId}/lists/${listId}/items`).post(r);
    }

    /**
     * Delete Strategy Hub Design Lists
     */
    async deleteStrategyHubEngine(): Promise<{ success: boolean; message: string }> {
        const listNames = ['Strategy_Config', 'Strategic_Pillars', 'Strategic_Goals', 'Strategic_Objectives', 'Divisional_Alignment', 'Strategy_Milestones', 'Strategy_Risks'];
        try {
            for (const name of listNames) {
                const response = await this.client.api(`/sites/${this.siteId}/lists`).filter(`displayName eq '${name}'`).select('id').get();
                if (response.value && response.value.length > 0) {
                    await this.client.api(`/sites/${this.siteId}/lists/${response.value[0].id}`).delete();
                }
            }
            return { success: true, message: 'Strategy Hub Engine cleaned up.' };
        } catch (error: any) {
            return { success: false, message: error.message };
        }
    }
}

// ==========================================
// DATA CONSTANTS
// ==========================================
const INITIAL_COMPANIES = [
    {
        symbol: 'BSP',
        name: 'Bank South Pacific',
        sector: 'Financials',
        last: 28.00,
        change: 1.8,
        vol: 10200,
        mcap: 'K 60.2B',
        colors: { primary: '#0066cc', secondary: '#0099ff' }
    },
    {
        symbol: 'CCP',
        name: 'Credit Corporation PNG',
        sector: 'Financials',
        last: 1.95,
        change: 3.2,
        vol: 15000,
        mcap: 'K 8.5B',
        colors: { primary: '#2a9d8f', secondary: '#40c9b4' }
    },
    {
        symbol: 'CGA',
        name: 'Crater Gold Mining',
        sector: 'Mining',
        last: 0.15,
        change: 0.0,
        vol: 0,
        mcap: 'K 120M',
        colors: { primary: '#d97706', secondary: '#f59e0b' }
    },
    {
        symbol: 'CPL',
        name: 'CPL Group',
        sector: 'Industrial',
        last: 0.68,
        change: 1.2,
        vol: 4200,
        mcap: 'K 3.2B',
        colors: { primary: '#7c3aed', secondary: '#a78bfa' }
    },
    {
        symbol: 'KAM',
        name: 'Kina Asset Management',
        sector: 'Asset Management',
        last: 0.85,
        change: 0.6,
        vol: 3200,
        mcap: 'K 2.1B',
        colors: { primary: '#9b5de5', secondary: '#c77dff' }
    },
    {
        symbol: 'KSL',
        name: 'Kina Securities Limited',
        sector: 'Financials',
        last: 2.85,
        change: -2.1,
        vol: 8500,
        mcap: 'K 12.3B',
        colors: { primary: '#e63946', secondary: '#ff6b6b' }
    },
    {
        symbol: 'NEM',
        name: 'Newmont Corporation',
        sector: 'Mining',
        last: 45.20,
        change: 4.5,
        vol: 25000,
        mcap: 'K 95.4B',
        colors: { primary: '#f59e0b', secondary: '#fbbf24' }
    },
    {
        symbol: 'NGP',
        name: 'NGIP Agmark',
        sector: 'Agriculture',
        last: 0.42,
        change: -0.8,
        vol: 5600,
        mcap: 'K 1.8B',
        colors: { primary: '#65a30d', secondary: '#84cc16' }
    },
    {
        symbol: 'NIU',
        name: 'Niuminco Group',
        sector: 'Mining',
        last: 0.02,
        change: 0.0,
        vol: 0,
        mcap: 'K 50M',
        colors: { primary: '#78716c', secondary: '#a8a29e' }
    },
    {
        symbol: 'SST',
        name: 'Steamships Trading',
        sector: 'Conglomerate',
        last: 2.35,
        change: 0.4,
        vol: 7800,
        mcap: 'K 15.6B',
        colors: { primary: '#0891b2', secondary: '#22d3ee' }
    },
    {
        symbol: 'STO',
        name: 'Santos Limited',
        sector: 'Energy',
        last: 6.78,
        change: 2.1,
        vol: 12000,
        mcap: 'K 35.2B',
        colors: { primary: '#dc2626', secondary: '#ef4444' }
    }
];
