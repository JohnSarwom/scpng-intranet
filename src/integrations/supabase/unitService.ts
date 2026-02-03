import { getSupabaseClient } from './supabaseClient';
import supabaseConfig from '@/config/supabase';
import { Objective } from '@/types'; // Import Objective type

// Define Supabase table names
const TABLES = {
    TASKS: 'unit_tasks',
    PROJECTS: 'unit_projects',
    RISKS: 'unit_risks',
    ASSETS: 'assets',
    KRAS: 'unit_kras',
    KPIS: 'unit_kpis',
    OBJECTIVES: 'unit_objectives' // Add objectives table name
};

// Utility to convert camelCase to snake_case
const camelToSnakeCase = (obj: any): any => {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map(camelToSnakeCase);
    }

    // Handle risk likelihood specially to ensure it correctly matches enum type
    if (obj.likelihood) {
        const validLikelihoods = ['low', 'medium', 'high', 'very-high'];
        if (!validLikelihoods.includes(obj.likelihood)) {
            console.warn(`Converting invalid likelihood '${obj.likelihood}' to 'low'`);
            obj.likelihood = 'low';
        }
    }

    return Object.fromEntries(
        Object.entries(obj).map(([key, value]) => {
            // Special case for likelihood to ensure it matches DB enum
            if (key === 'likelihood') {
                const validLikelihoods = ['low', 'medium', 'high', 'very-high'];
                if (!validLikelihoods.includes(value as string)) {
                    console.warn(`Converting invalid likelihood value: "${value}" to "low"`);
                    value = 'low';
                }
                return ['likelihood', value];
            }

            // Convert camelCase to snake_case
            const snakeKey = key.replace(/([A-Z])/g, "_$1").toLowerCase();

            // Special handling for date values
            if (value instanceof Date) {
                // Convert Date objects to ISO strings for PostgreSQL
                value = value.toISOString();
            } else if (key.includes('Date') || key.includes('date') || key.endsWith('_date') ||
                key === 'createdAt' || key === 'updatedAt' || key === 'created_at' || key === 'updated_at' ||
                key === 'last_updated') {
                // For any field that contains "date" or is a known timestamp field
                if (value && typeof value === 'object' && !(value instanceof Date)) {
                    // Handle complex objects that should be dates
                    if ('toISOString' in value && typeof value.toISOString === 'function') {
                        value = value.toISOString();
                    } else {
                        // If it's an object but not a valid date, convert to null
                        value = null;
                    }
                } else if (value === '' || value === null || value === undefined) {
                    // Empty strings, null, or undefined should be null for date fields
                    value = null;
                }
                // Strings that are valid ISO dates can be passed through
            }

            // Handle nested objects (except for checklist which is stored as JSONB)
            else if (key !== 'checklist' && value !== null && typeof value === 'object') {
                value = camelToSnakeCase(value);
            }

            return [snakeKey, value];
        })
    );
};

// Utility to convert snake_case to camelCase
const snakeToCamelCase = (obj: any): any => {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map(snakeToCamelCase);
    }

    return Object.fromEntries(
        Object.entries(obj).map(([key, value]) => {
            const camelKey = key.replace(/(_\w)/g, k => k[1].toUpperCase());

            // Recursively convert nested objects
            if (value !== null && typeof value === 'object') {
                value = snakeToCamelCase(value);
            }

            return [camelKey, value];
        })
    );
};

// Task operations
export const tasksService = {
    // Get all tasks
    getTasks: async (divisionId?: string) => {
        const supabase = getSupabaseClient();

        let query = supabase
            .from(TABLES.TASKS)
            .select('*');

        // If division ID is provided, filter by that specific division
        if (divisionId) {
            query = query.eq('division_id', divisionId);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching tasks:', error);
            throw error;
        }

        // Return raw data
        return data || [];
    },

    // Add a new task
    addTask: async (task: any) => {
        const supabase = getSupabaseClient();

        // Ensure task has division_id - use current division from context if available
        if (!task.divisionId) {
            // Get current division ID from localStorage or context
            const currentDivisionId = localStorage.getItem('current_division_id');
            if (currentDivisionId) {
                task.divisionId = currentDivisionId;
            }
        }

        // Convert camelCase properties to snake_case for DB
        const snakeCaseTask = camelToSnakeCase(task);

        // Ensure task has created_at and updated_at
        const taskWithTimestamps = {
            ...snakeCaseTask,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        const { data, error } = await supabase
            .from(TABLES.TASKS)
            .insert([taskWithTimestamps])
            .select();

        if (error) {
            console.error('Error adding task:', error);
            throw error;
        }

        // Return raw data from insert
        return data?.[0] || null;
    },

    // Update a task
    updateTask: async (id: string, task: any) => {
        const supabase = getSupabaseClient();

        // Convert camelCase properties to snake_case for DB
        const snakeCaseTask = camelToSnakeCase(task);

        // Add updated_at timestamp
        const taskWithTimestamp = {
            ...snakeCaseTask,
            updated_at: new Date().toISOString()
        };

        const { data, error } = await supabase
            .from(TABLES.TASKS)
            .update(taskWithTimestamp)
            .eq('id', id)
            .select();

        if (error) {
            console.error('Error updating task:', error);
            throw error;
        }

        // Return raw data from update
        return data?.[0] || null;
    },

    // Delete a task
    deleteTask: async (id: string) => {
        const supabase = getSupabaseClient();
        const { error } = await supabase
            .from(TABLES.TASKS)
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting task:', error);
            throw error;
        }

        return true;
    }
};

// Project operations
export const projectsService = {
    // Get all projects
    getProjects: async (divisionId?: string) => {
        const supabase = getSupabaseClient();

        let query = supabase
            .from(TABLES.PROJECTS)
            .select('*');

        // If division ID is provided, filter by that specific division
        if (divisionId) {
            query = query.eq('division_id', divisionId);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching projects:', error);
            throw error;
        }

        // Return raw data
        return data || [];
    },

    // Add a new project
    addProject: async (project: any) => {
        const supabase = getSupabaseClient();

        // Convert camelCase properties to snake_case for DB
        const snakeCaseProject = camelToSnakeCase(project);

        // Ensure project has created_at and updated_at
        const projectWithTimestamps = {
            ...snakeCaseProject,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        const { data, error } = await supabase
            .from(TABLES.PROJECTS)
            .insert([projectWithTimestamps])
            .select();

        if (error) {
            console.error('Error adding project:', error);
            throw error;
        }

        // Return raw data from insert
        return data?.[0] || null;
    },

    // Update a project
    updateProject: async (id: string, project: any) => {
        const supabase = getSupabaseClient();

        // Convert camelCase properties to snake_case for DB
        const snakeCaseProject = camelToSnakeCase(project);

        // Add updated_at timestamp
        const projectWithTimestamp = {
            ...snakeCaseProject,
            updated_at: new Date().toISOString()
        };

        const { data, error } = await supabase
            .from(TABLES.PROJECTS)
            .update(projectWithTimestamp)
            .eq('id', id)
            .select();

        if (error) {
            console.error('Error updating project:', error);
            throw error;
        }

        // Return raw data from update
        return data?.[0] || null;
    },

    // Delete a project
    deleteProject: async (id: string) => {
        const supabase = getSupabaseClient();
        const { error } = await supabase
            .from(TABLES.PROJECTS)
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting project:', error);
            throw error;
        }

        return true;
    }
};

// Risk operations
export const risksService = {
    // Debug function to check the table schema
    checkRiskTableSchema: async () => {
        const supabase = getSupabaseClient();

        try {
            // Query the constraint information
            const { data: checkConstraints, error: constraintError } = await supabase
                .from('information_schema.check_constraints')
                .select('constraint_name, check_clause')
                .like('constraint_name', '%unit_risks_likelihood%');

            if (constraintError) {
                console.error('Error fetching constraint info:', constraintError);
            } else {
                console.log('Risk likelihood constraints:', checkConstraints);
            }

            // Query column information
            const { data: columnInfo, error: columnError } = await supabase
                .from('information_schema.columns')
                .select('column_name, data_type, udt_name, is_nullable, column_default')
                .eq('table_name', 'unit_risks')
                .eq('column_name', 'likelihood');

            if (columnError) {
                console.error('Error fetching column info:', columnError);
            } else {
                console.log('Risk likelihood column info:', columnInfo);
            }

            return { checkConstraints, columnInfo };
        } catch (err) {
            console.error('Error checking schema:', err);
            return null;
        }
    },

    // Get all risks
    getRisks: async (divisionId?: string) => {
        const supabase = getSupabaseClient();

        let query = supabase
            .from(TABLES.RISKS)
            .select('*');

        // Filter by division_id if divisionId is provided
        if (divisionId) {
            query = query.eq('division_id', divisionId);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching risks:', error);
            throw error;
        }

        // Return raw data
        return data || [];
    },

    // Add a new risk
    addRisk: async (risk: any) => {
        const supabase = getSupabaseClient();

        // Update with potential alternative enum values for likelihood
        // The database constraint is rejecting 'possible', so let's try with a different set
        const validLikelihoods = ['low', 'medium', 'high', 'very-high'];

        // Map old likelihood values to new ones if needed
        let safeLikelihood = 'low'; // Default fallback
        if (risk.likelihood === 'unlikely') safeLikelihood = 'low';
        else if (risk.likelihood === 'possible') safeLikelihood = 'medium';
        else if (risk.likelihood === 'likely') safeLikelihood = 'high';
        else if (risk.likelihood === 'certain') safeLikelihood = 'very-high';
        else if (validLikelihoods.includes(risk.likelihood)) safeLikelihood = risk.likelihood;

        // Clone the risk object to avoid modifying the original
        const cleanRisk = { ...risk };

        // Explicitly set likelihood to a safe value
        cleanRisk.likelihood = safeLikelihood;

        // Convert camelCase properties to snake_case for DB
        const snakeCaseRisk = camelToSnakeCase(cleanRisk);

        // Ensure risk has created_at and updated_at
        const riskWithTimestamps = {
            ...snakeCaseRisk,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        console.log('[unitService.addRisk] Final payload before insert:', JSON.stringify(riskWithTimestamps, null, 2));

        try {
            // Try a simpler, direct approach
            const { data, error } = await supabase
                .from(TABLES.RISKS)
                .insert([riskWithTimestamps])
                .select();

            if (error) {
                console.error('Error adding risk:', error);
                console.error('Failed SQL constraint:', error.code);
                console.error('Error details:', error.details);
                console.error('Error message:', error.message);
                console.error('Error hint:', error.hint);
                throw error;
            }

            // Return raw data from insert
            return data?.[0] || null;
        } catch (err) {
            console.error('Unexpected error in addRisk:', err);
            throw err;
        }
    },

    // Update a risk
    updateRisk: async (id: string, risk: any) => {
        const supabase = getSupabaseClient();

        // Use the same updated valid likelihood values
        const validLikelihoods = ['low', 'medium', 'high', 'very-high'];

        // Map old likelihood values to new ones if needed
        let safeLikelihood = 'low'; // Default fallback
        if (risk.likelihood === 'unlikely') safeLikelihood = 'low';
        else if (risk.likelihood === 'possible') safeLikelihood = 'medium';
        else if (risk.likelihood === 'likely') safeLikelihood = 'high';
        else if (risk.likelihood === 'certain') safeLikelihood = 'very-high';
        else if (validLikelihoods.includes(risk.likelihood)) safeLikelihood = risk.likelihood;

        // Update the object with the safe likelihood
        const cleanRisk = { ...risk, likelihood: safeLikelihood };

        // Convert camelCase properties to snake_case for DB
        const snakeCaseRisk = camelToSnakeCase(cleanRisk);

        // Add updated_at timestamp
        const riskWithTimestamp = {
            ...snakeCaseRisk,
            updated_at: new Date().toISOString()
        };

        // Log the processed data
        console.log('Processed risk data being sent to Supabase for update:',
            JSON.stringify({
                id,
                originalLikelihood: risk.likelihood,
                safeLikelihood,
                processedRisk: riskWithTimestamp
            })
        );

        const { data, error } = await supabase
            .from(TABLES.RISKS)
            .update(riskWithTimestamp)
            .eq('id', id)
            .select();

        if (error) {
            console.error('Error updating risk:', error);
            throw error;
        }

        // Return raw data from update
        return data?.[0] || null;
    },

    // Delete a risk
    deleteRisk: async (id: string) => {
        const supabase = getSupabaseClient();
        const { error } = await supabase
            .from(TABLES.RISKS)
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting risk:', error);
            throw error;
        }

        return true;
    }
};

// Asset operations
export const assetsService = {
    // Get all assets - Now using Edge Function
    getAssets: async (accessToken?: string) => {
        const supabase = getSupabaseClient();
        console.log('[assetsService.getAssets] Invoking edge function get-assets...');

        try {
            // Prepare options, including headers if accessToken is provided
            const options: { headers?: { [key: string]: string } } = {};
            if (accessToken) {
                options.headers = {
                    'Authorization': `Bearer ${accessToken}`
                };
                console.log('[assetsService.getAssets] Passing Authorization header.');
            } else {
                console.warn('[assetsService.getAssets] No access token provided. Function will likely receive anon role.');
            }

            // Invoke the Edge Function with options
            const { data, error } = await supabase.functions.invoke('get-assets', options); // Pass options

            console.log('[assetsService.getAssets] Edge function response:', { data, error });

            if (error) {
                console.error('[assetsService.getAssets] Edge function invocation error:', error);
                throw error;
            }

            // Assuming the function returns the array of assets directly in `data`
            // Add type assertion if needed, e.g., return (data as YourAssetType[]) || [];
            return data || [];
        } catch (err) {
            console.error('[assetsService.getAssets] Error invoking edge function:', err);
            // Consider re-throwing or returning a specific error structure
            return [];
        }
    },

    // Add a new asset
    addAsset: async (asset: any, userEmail?: string) => {
        const supabase = getSupabaseClient();

        // Convert camelCase properties to snake_case for DB
        const snakeCaseAsset = camelToSnakeCase(asset);

        // Get current timestamp
        const now = new Date().toISOString();

        // Ensure asset has audit trail fields
        const assetWithAudit = {
            ...snakeCaseAsset,
            created_at: now,              // Explicitly set creation timestamp
            created_by: userEmail || snakeCaseAsset.created_by,
            last_updated_by: userEmail || snakeCaseAsset.last_updated_by,
            last_updated: now,
            is_deleted: false // Ensure new assets are not marked as deleted
        };

        console.log('[assetsService.addAsset] Creating asset with audit trail:', {
            created_by: assetWithAudit.created_by,
            name: assetWithAudit.name
        });

        try {
            const { data, error } = await supabase
                .from(TABLES.ASSETS)
                .insert([assetWithAudit])
                .select();

            if (error) {
                console.error('Error adding asset:', error);
                throw error;
            }

            console.log('[assetsService.addAsset] Asset created successfully:', data?.[0]?.id);
            return data?.[0] || null;
        } catch (error) {
            console.error('Error adding asset:', error);
            throw error;
        }
    },

    // Update an asset
    updateAsset: async (id: string, asset: any, userEmail?: string) => {
        const supabase = getSupabaseClient();

        // Convert camelCase properties to snake_case for DB
        const snakeCaseAsset = camelToSnakeCase(asset);

        // Get current timestamp
        const now = new Date().toISOString();

        // Add audit trail fields for update
        const assetWithAudit = {
            ...snakeCaseAsset,
            last_updated_by: userEmail || snakeCaseAsset.last_updated_by,
            last_updated: now
            // Note: Don't update created_by or created_at during updates
        };

        console.log('[assetsService.updateAsset] Updating asset with audit trail:', {
            id,
            last_updated_by: assetWithAudit.last_updated_by
        });

        try {
            const { data, error } = await supabase
                .from(TABLES.ASSETS)
                .update(assetWithAudit)
                .eq('id', id)
                .eq('is_deleted', false) // Only update non-deleted assets
                .select();

            if (error) {
                console.error('Error updating asset:', error);
                throw error;
            }

            if (!data || data.length === 0) {
                console.warn('[assetsService.updateAsset] No asset found with id:', id);
                throw new Error('Asset not found or has been deleted');
            }

            console.log('[assetsService.updateAsset] Asset updated successfully:', id);
            return data[0];
        } catch (error) {
            console.error('Error updating asset:', error);
            throw error;
        }
    },

    // Delete an asset (soft delete)
    deleteAsset: async (id: string, userEmail?: string) => {
        const supabase = getSupabaseClient();

        const now = new Date().toISOString();

        console.log('[assetsService.deleteAsset] Soft deleting asset:', {
            id,
            deleted_by: userEmail
        });

        try {
            // Soft delete by setting is_deleted flag and audit fields
            const { data, error } = await supabase
                .from(TABLES.ASSETS)
                .update({
                    is_deleted: true,
                    deleted_at: now,
                    deleted_by: userEmail,
                    last_updated: now,
                    last_updated_by: userEmail
                })
                .eq('id', id)
                .eq('is_deleted', false) // Only delete assets that aren't already deleted
                .select();

            if (error) {
                console.error('Error soft deleting asset:', error);
                throw error;
            }

            if (!data || data.length === 0) {
                console.warn('[assetsService.deleteAsset] No asset found with id:', id);
                throw new Error('Asset not found or already deleted');
            }

            console.log('[assetsService.deleteAsset] Asset soft deleted successfully:', id);
            return true;
        } catch (error) {
            console.error('Error deleting asset:', error);
            throw error;
        }
    },

    // Hard delete an asset (for admin use only)
    hardDeleteAsset: async (id: string) => {
        const supabase = getSupabaseClient();

        console.log('[assetsService.hardDeleteAsset] Permanently deleting asset:', id);

        const { error } = await supabase
            .from(TABLES.ASSETS)
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error hard deleting asset:', error);
            throw error;
        }

        console.log('[assetsService.hardDeleteAsset] Asset permanently deleted:', id);
        return true;
    },

    // Restore a soft deleted asset
    restoreAsset: async (id: string, userEmail?: string) => {
        const supabase = getSupabaseClient();

        const now = new Date().toISOString();

        console.log('[assetsService.restoreAsset] Restoring asset:', {
            id,
            restored_by: userEmail
        });

        try {
            const { data, error } = await supabase
                .from(TABLES.ASSETS)
                .update({
                    is_deleted: false,
                    deleted_at: null,
                    deleted_by: null,
                    last_updated: now,
                    last_updated_by: userEmail
                })
                .eq('id', id)
                .eq('is_deleted', true) // Only restore deleted assets
                .select();

            if (error) {
                console.error('Error restoring asset:', error);
                throw error;
            }

            if (!data || data.length === 0) {
                console.warn('[assetsService.restoreAsset] No deleted asset found with id:', id);
                throw new Error('Deleted asset not found');
            }

            console.log('[assetsService.restoreAsset] Asset restored successfully:', id);
            return data[0];
        } catch (error) {
            console.error('Error restoring asset:', error);
            throw error;
        }
    }
};

// KRA operations
export const krasService = {
    // Get all KRAs
    getKRAs: async () => {
        const supabase = getSupabaseClient();

        let query = supabase
            .from(TABLES.KRAS)
            .select(`
        *,
        unit_kpis(*),
        unit_objectives ( title )
      `);

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching KRAs:', error);
            throw error;
        }

        // --- MODIFIED --- Convert snake_case to camelCase before returning
        const camelCaseData = snakeToCamelCase(data);

        return camelCaseData || [];
    },

    // Add a new KRA
    addKRA: async (kra: any) => {
        const supabase = getSupabaseClient();

        // Convert camelCase properties to snake_case for DB
        const snakeCaseKra = camelToSnakeCase(kra);

        // Ensure KRA has created_at and updated_at
        const kraWithTimestamps = {
            ...snakeCaseKra,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        // Ensure status is a valid enum value for the DB
        // Valid values in DB constraint: 'on-track', 'at-risk', 'off-track', 'completed', 'pending'
        if (kraWithTimestamps.status) {
            const validStatuses = ['on-track', 'at-risk', 'off-track', 'completed', 'pending'];
            if (!validStatuses.includes(kraWithTimestamps.status)) {
                // Map to a valid status or default to 'pending'
                const statusMapping: Record<string, string> = {
                    'At Risk': 'at-risk',
                    'On Track': 'on-track',
                    'Off Track': 'off-track',
                    'Completed': 'completed',
                    'Pending': 'pending',
                    'Draft': 'pending'
                };
                kraWithTimestamps.status = statusMapping[kraWithTimestamps.status] || 'pending';
            }
        } else {
            kraWithTimestamps.status = 'pending'; // Default status
        }

        // Ensure division_id is present
        if (!kraWithTimestamps.division_id) {
            // Get current division ID from localStorage
            const currentDivisionId = localStorage.getItem('current_division_id');
            if (currentDivisionId) {
                kraWithTimestamps.division_id = currentDivisionId;
            }
        }

        console.log('Prepared KRA data for insertion:', kraWithTimestamps);

        try {
            const { data, error } = await supabase
                .from(TABLES.KRAS)
                .insert([kraWithTimestamps])
                .select();

            if (error) {
                console.error('Error adding KRA:', error);
                throw error;
            }

            // Return raw data from insert
            return data?.[0] || null;
        } catch (error) {
            console.error('Failed to create KRA:', error);
            throw error;
        }
    },

    // Update a KRA
    updateKRA: async (id: string, kra: any) => {
        const supabase = getSupabaseClient();

        // Convert camelCase properties to snake_case for DB
        const snakeCaseKra = camelToSnakeCase(kra);

        // Add updated_at timestamp
        const kraWithTimestamp = {
            ...snakeCaseKra,
            updated_at: new Date().toISOString()
        };

        const { data, error } = await supabase
            .from(TABLES.KRAS)
            .update(kraWithTimestamp)
            .eq('id', id)
            .select();

        if (error) {
            console.error('Error updating KRA:', error);
            throw error;
        }

        // Return raw data from update
        return data?.[0] || null;
    },

    // Delete a KRA
    deleteKRA: async (id: string) => {
        const supabase = getSupabaseClient();
        const { error } = await supabase
            .from(TABLES.KRAS)
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting KRA:', error);
            throw error;
        }

        return true;
    }
};

// KPI operations
export const kpisService = {
    // Get all KPIs
    getKPIs: async () => {
        const supabase = getSupabaseClient();

        let query = supabase
            .from(TABLES.KPIS)
            .select(`
        *,
        unit_kras ( title )
      `);

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching KPIs:', error);
            throw error;
        }

        // Convert snake_case to camelCase before returning
        const camelCaseData = snakeToCamelCase(data);

        return camelCaseData || [];
    },

    // Add a new KPI
    addKPI: async (kpi: any) => {
        const supabase = getSupabaseClient();

        // Convert camelCase properties to snake_case for DB
        const snakeCaseKpi = camelToSnakeCase(kpi);

        // Ensure KPI has created_at and updated_at
        const kpiWithTimestamps = {
            ...snakeCaseKpi,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        // Ensure status is a valid enum value for the DB
        if (kpiWithTimestamps.status) {
            const validStatuses = ['on-track', 'at-risk', 'off-track', 'completed', 'pending'];
            if (!validStatuses.includes(kpiWithTimestamps.status)) {
                const statusMapping: Record<string, string> = {
                    'At Risk': 'at-risk',
                    'On Track': 'on-track',
                    'Off Track': 'off-track',
                    'Completed': 'completed',
                    'Pending': 'pending',
                    'Draft': 'pending'
                };
                kpiWithTimestamps.status = statusMapping[kpiWithTimestamps.status] || 'pending';
            }
        } else {
            kpiWithTimestamps.status = 'pending'; // Default status
        }

        // Ensure division_id is present
        if (!kpiWithTimestamps.division_id) {
            const currentDivisionId = localStorage.getItem('current_division_id');
            if (currentDivisionId) {
                kpiWithTimestamps.division_id = currentDivisionId;
            }
        }

        console.log('Prepared KPI data for insertion:', kpiWithTimestamps);

        try {
            const { data, error } = await supabase
                .from(TABLES.KPIS)
                .insert([kpiWithTimestamps])
                .select();

            if (error) {
                console.error('Error adding KPI:', error);
                throw error;
            }

            // Convert snake_case back to camelCase for frontend consistency
            return data ? snakeToCamelCase(data[0]) : null;
        } catch (error) {
            console.error('Failed to create KPI:', error);
            throw error;
        }
    },

    // Update a KPI
    updateKPI: async (id: string, kpi: any) => {
        const supabase = getSupabaseClient();

        // Convert camelCase properties to snake_case for DB
        const snakeCaseKpi = camelToSnakeCase(kpi);

        // Add updated_at timestamp
        const kpiWithTimestamp = {
            ...snakeCaseKpi,
            updated_at: new Date().toISOString()
        };

        const { data, error } = await supabase
            .from(TABLES.KPIS)
            .update(kpiWithTimestamp)
            .eq('id', id)
            .select();

        if (error) {
            console.error('Error updating KPI:', error);
            throw error;
        }

        // Convert snake_case back to camelCase for frontend consistency
        return data ? snakeToCamelCase(data[0]) : null;
    },

    // Delete a KPI
    deleteKPI: async (id: string) => {
        const supabase = getSupabaseClient();
        const { error } = await supabase
            .from(TABLES.KPIS)
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting KPI:', error);
            throw error;
        }

        return true;
    }
};

// Objective operations
export const objectivesService = {
    // Get all Objectives
    getObjectives: async (): Promise<Objective[]> => {
        const supabase = getSupabaseClient();
        console.log("[objectivesService] Fetching all objectives...");
        try {
            const { data, error } = await supabase
                .from(TABLES.OBJECTIVES)
                .select('*')
                .order('created_at', { ascending: true }); // Optional: order them

            if (error) {
                console.error("[objectivesService] Error fetching objectives:", error);
                throw error;
            }

            console.log(`[objectivesService] Fetched ${data?.length || 0} objectives.`);

            // Convert snake_case to camelCase before returning
            // NOTE: The original mapping of title -> name is removed here,
            // assuming the frontend/hook expects the direct DB field names (title)
            // after snakeToCamelCase conversion.
            // If 'name' is required upstream, the mapping should happen there or be kept here.
            const camelCaseData = snakeToCamelCase(data);

            return camelCaseData || [];

        } catch (error) {
            console.error("[objectivesService] Unexpected error in getObjectives:", error);
            throw error; // Re-throw the error to be handled by the calling component
        }
    },

    // Add a new Objective
    addObjective: async (objective: any) => {
        const supabase = getSupabaseClient();

        // Convert camelCase properties to snake_case for DB
        const snakeCaseObjective = camelToSnakeCase(objective);

        // Ensure Objective has created_at and updated_at
        const objectiveWithTimestamps = {
            ...snakeCaseObjective,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        // Ensure division_id is present
        if (!objectiveWithTimestamps.division_id) {
            const currentDivisionId = localStorage.getItem('current_division_id');
            if (currentDivisionId) {
                objectiveWithTimestamps.division_id = currentDivisionId;
            }
        }

        console.log('Prepared Objective data for insertion:', objectiveWithTimestamps);

        try {
            const { data, error } = await supabase
                .from(TABLES.OBJECTIVES)
                .insert([objectiveWithTimestamps])
                .select();

            if (error) {
                console.error('Error adding Objective:', error);
                throw error;
            }

            // Convert snake_case back to camelCase for frontend consistency
            return data ? snakeToCamelCase(data[0]) : null;
        } catch (error) {
            console.error('Failed to create Objective:', error);
            throw error;
        }
    },

    // Update an Objective
    updateObjective: async (id: string, objective: any) => {
        const supabase = getSupabaseClient();

        // Convert camelCase properties to snake_case for DB
        const snakeCaseObjective = camelToSnakeCase(objective);

        // Add updated_at timestamp
        const objectiveWithTimestamp = {
            ...snakeCaseObjective,
            updated_at: new Date().toISOString()
        };

        const { data, error } = await supabase
            .from(TABLES.OBJECTIVES)
            .update(objectiveWithTimestamp)
            .eq('id', id)
            .select();

        if (error) {
            console.error('Error updating Objective:', error);
            throw error;
        }

        // Convert snake_case back to camelCase for frontend consistency
        return data ? snakeToCamelCase(data[0]) : null;
    },

    // Delete an objective
    deleteObjective: async (id: string) => {
        const supabase = getSupabaseClient();
        console.log(`[objectivesService] Deleting objective with ID: ${id}`);
        const { error } = await supabase
            .from(TABLES.OBJECTIVES)
            .delete()
            .eq('id', id);

        if (error) {
            console.error(`[objectivesService] Error deleting objective ID ${id}:`, error);
            throw error;
        }

        console.log(`[objectivesService] Objective ID ${id} deleted successfully.`);
        return true;
    }
};

// Export individual services if structured that way
// e.g., export const tasksService = { ... }; export const projectsService = { ... }; 
