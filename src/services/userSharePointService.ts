import { Client } from '@microsoft/microsoft-graph-client';


const SITE_PATH = '/sites/scpngintranet';
const SITE_DOMAIN = 'scpng1.sharepoint.com';
const USER_ROLES_LIST_NAME = 'UserRoles';
const PERMISSION_GROUPS_LIST_NAME = 'PermissionGroups';

export interface PermissionGroup {
    id?: string;
    title: string; // Group Name
    permissions: any; // JSON
    description?: string;
}

export interface UserRole {
    id?: string; // SharePoint Item ID
    user_email: string; // Title
    role_name: string; // Role
    division_name?: string; // Division
    unit_name?: string; // Unit
    permissions?: any; // Permissions (JSON string)
    is_admin: boolean; // IsAdmin or derived from Role
    user_name?: string; // Name
    groups?: string[]; // Array of group names
}

export class UserSharePointService {
    private client: Client;
    private siteId: string | null = null;
    private listId: string | null = null;
    private groupsListId: string | null = null;
    private permissionsColumnName: string = 'Permissions'; // Default fallback

    constructor(client: Client) {
        this.client = client;
    }

    async initialize(): Promise<void> {
        if (this.siteId && this.listId && this.groupsListId) return;

        try {
            // Get Site ID
            const site = await this.client
                .api(`/sites/${SITE_DOMAIN}:${SITE_PATH}`)
                .get();

            if (!site || !site.id) {
                throw new Error(`Site not found at ${SITE_DOMAIN}:${SITE_PATH}`);
            }

            this.siteId = site.id;

            // Get List IDs
            // Get List IDs
            // Note: Complex OData filters on displayName can sometimes fail or be unsupported depending on the environment.
            // Fetching top lists and filtering in memory is safer.
            const lists = await this.client
                .api(`/sites/${this.siteId}/lists`)
                .select('id,displayName,name')
                .top(200) // Fetch top 200 lists to be safe
                .get();

            console.log('[UserSharePointService] Available lists:', lists.value.map((l: any) => `${l.displayName} (${l.name})`));

            // Try to find by displayName first, then by internal name (case-insensitive)
            const findList = (name: string) => lists.value.find((l: any) =>
                l.displayName === name ||
                l.name === name ||
                l.displayName?.toLowerCase() === name.toLowerCase() ||
                l.name?.toLowerCase() === name.toLowerCase()
            );

            const userRolesList = findList(USER_ROLES_LIST_NAME);
            const groupsList = findList(PERMISSION_GROUPS_LIST_NAME);

            if (!userRolesList) {
                throw new Error(`List '${USER_ROLES_LIST_NAME}' not found. Please create it first.`);
            }

            // Groups list is optional for now to prevent breaking existing setup if not created yet
            if (groupsList) {
                this.groupsListId = groupsList.id;
            } else {
                console.warn(`List '${PERMISSION_GROUPS_LIST_NAME}' not found. Group permissions will be disabled.`);
            }

            // Dynamically find the internal name for "Permissions" column
            if (this.groupsListId) {
                try {
                    const columns = await this.client
                        .api(`/sites/${this.siteId}/lists/${this.groupsListId}/columns`)
                        .select('name,displayName')
                        .get();

                    const permCol = columns.value.find((c: any) => c.displayName === 'Permissions');
                    if (permCol) {
                        this.permissionsColumnName = permCol.name;
                        console.log(`[UserSharePointService] Resolved 'Permissions' column to internal name: ${this.permissionsColumnName}`);
                    } else {
                        console.warn("[UserSharePointService] Could not find column with display name 'Permissions', using default.");
                    }
                } catch (colError) {
                    console.error("[UserSharePointService] Failed to fetch columns:", colError);
                }
            }

            this.listId = userRolesList.id;
        } catch (error) {
            console.error('Failed to initialize UserSharePointService:', error);
            throw error;
        }
    }

    private mapFromSharePoint(item: any): UserRole {
        const fields = item.fields || item;
        let permissions = {};
        try {
            if (fields.Permissions) {
                permissions = JSON.parse(fields.Permissions);
            }
        } catch (e) {
            console.warn('Failed to parse permissions JSON', e);
        }

        // Parse Groups
        let groups: string[] = [];
        if (fields.Groups) {
            groups = fields.Groups.split(',').map((g: string) => g.trim()).filter((g: string) => g);
        }

        // Handle IsAdmin as boolean or text "Yes"/"No" or derived from Role
        let isAdmin = false;
        if (fields.IsAdmin === true || fields.IsAdmin === 'Yes' || fields.IsAdmin === 'true') {
            isAdmin = true;
        } else if (fields.Role === 'super_admin' || fields.Role === 'admin') {
            // Fallback: Derive from role if IsAdmin is missing or false
            isAdmin = true;
        }

        return {
            id: item.id,
            user_email: fields.Title,
            role_name: fields.Role || 'staff_member', // Text field
            division_name: fields.Division,
            unit_name: fields.Unit,
            permissions: permissions,
            is_admin: isAdmin,
            user_name: fields.Name || fields.Title, // Fallback to email if Name is missing
            groups: groups
        };
    }

    private mapGroupFromSharePoint(item: any): PermissionGroup {
        const fields = item.fields || item;
        let permissions: any = {};
        try {
            if (fields.Permissions) {
                const parsed = JSON.parse(fields.Permissions);

                // Handle compressed format (Array of strings)
                if (Array.isArray(parsed)) {
                    parsed.forEach((resourceId: string) => {
                        permissions[resourceId] = ['read'];
                    });
                } else {
                    // Handle legacy format (Object)
                    permissions = parsed;
                }
            }
        } catch (e) {
            console.warn('Failed to parse group permissions JSON', e);
        }

        return {
            id: item.id,
            title: fields.Title,
            permissions: permissions,
            description: fields.Description
        };
    }

    async getUsers(): Promise<UserRole[]> {
        await this.initialize();

        try {
            const response = await this.client
                .api(`/sites/${this.siteId}/lists/${this.listId}/items`)
                .expand('fields')
                .top(5000)
                .get();

            return response.value.map((item: any) => this.mapFromSharePoint(item));
        } catch (error) {
            console.error('Error fetching users:', error);
            throw error;
        }
    }

    async getGroups(): Promise<PermissionGroup[]> {
        await this.initialize();
        if (!this.groupsListId) return [];

        try {
            const response = await this.client
                .api(`/sites/${this.siteId}/lists/${this.groupsListId}/items`)
                .expand('fields')
                .top(5000)
                .get();

            return response.value.map((item: any) => this.mapGroupFromSharePoint(item));
        } catch (error) {
            console.error('Error fetching groups:', error);
            return [];
        }
    }

    async getUser(email: string): Promise<UserRole | null> {
        await this.initialize();

        try {
            const response = await this.client
                .api(`/sites/${this.siteId}/lists/${this.listId}/items`)
                .header('Prefer', 'HonorNonIndexedQueriesWarningMayFailRandomly')
                .expand('fields')
                .filter(`fields/Title eq '${email}'`)
                .get();

            if (response.value && response.value.length > 0) {
                const user = this.mapFromSharePoint(response.value[0]);

                // Merge permissions from groups
                if (user.groups && user.groups.length > 0 && this.groupsListId) {
                    const allGroups = await this.getGroups();
                    const userGroups = allGroups.filter(g => user.groups?.includes(g.title));

                    // Merge logic: Combine all permissions arrays
                    const mergedPermissions: any = { ...user.permissions };

                    userGroups.forEach(group => {
                        Object.keys(group.permissions).forEach(resource => {
                            if (!mergedPermissions[resource]) {
                                mergedPermissions[resource] = [];
                            }
                            // Add unique permissions
                            const groupResourcePerms = group.permissions[resource];
                            if (Array.isArray(groupResourcePerms)) {
                                groupResourcePerms.forEach((action: string) => {
                                    if (!mergedPermissions[resource].includes(action)) {
                                        mergedPermissions[resource].push(action);
                                    }
                                });
                            }
                        });
                    });

                    user.permissions = mergedPermissions;
                }

                return user;
            }
            return null;
        } catch (error) {
            console.error(`Error fetching user ${email}:`, error);
            return null;
        }
    }

    async addUser(user: Partial<UserRole>): Promise<UserRole> {
        await this.initialize();

        try {
            const fields: any = {
                Title: user.user_email,
                Role: user.role_name,
                Division: user.division_name || '',
                Unit: user.unit_name || '',
                // Permissions column removed in favor of Group-based permissions
                IsAdmin: user.is_admin ? 'Yes' : 'No', // Send as Text "Yes"/"No"
                Name: user.user_name || '',
                Groups: user.groups ? user.groups.join(', ') : ''
            };

            const response = await this.client
                .api(`/sites/${this.siteId}/lists/${this.listId}/items`)
                .post({ fields });

            return this.mapFromSharePoint(response);
        } catch (error) {
            console.error('Error adding user:', error);
            throw error;
        }
    }

    async updateUser(email: string, updates: Partial<UserRole>): Promise<UserRole> {
        await this.initialize();

        // First find the item ID
        const existingUser = await this.getUser(email);
        if (!existingUser || !existingUser.id) {
            throw new Error(`User ${email} not found`);
        }

        try {
            const fields: any = {};
            if (updates.role_name) fields.Role = updates.role_name;
            if (updates.division_name !== undefined) fields.Division = updates.division_name;
            if (updates.unit_name !== undefined) fields.Unit = updates.unit_name;
            // Permissions column removed in favor of Group-based permissions
            if (updates.is_admin !== undefined) fields.IsAdmin = updates.is_admin ? 'Yes' : 'No';
            if (updates.user_name) fields.Name = updates.user_name;
            if (updates.groups) fields.Groups = updates.groups.join(', ');

            const response = await this.client
                .api(`/sites/${this.siteId}/lists/${this.listId}/items/${existingUser.id}`)
                .patch({ fields });

            return { ...existingUser, ...updates };
        } catch (error) {
            console.error('Error updating user:', error);
            throw error;
        }
    }

    async deleteUser(email: string): Promise<void> {
        await this.initialize();

        const existingUser = await this.getUser(email);
        if (!existingUser || !existingUser.id) {
            throw new Error(`User ${email} not found`);
        }

        try {
            await this.client
                .api(`/sites/${this.siteId}/lists/${this.listId}/items/${existingUser.id}`)
                .delete();
        } catch (error) {
            console.error('Error deleting user:', error);
            throw error;
        }
    }

    // Group Management Methods
    async createGroup(group: PermissionGroup): Promise<PermissionGroup> {
        await this.initialize();
        if (!this.groupsListId) throw new Error("PermissionGroups list not found");

        try {
            const fields: any = {
                Title: group.title,
                Description: group.description || ''
            };

            // Compress permissions: Convert { "home": ["read"] } -> ["home"]
            const compressedPermissions = Object.keys(group.permissions || {});

            // Use dynamic column name
            fields[this.permissionsColumnName] = JSON.stringify(compressedPermissions);

            const response = await this.client
                .api(`/sites/${this.siteId}/lists/${this.groupsListId}/items`)
                .post({ fields });

            return this.mapGroupFromSharePoint(response);
        } catch (error) {
            console.error('Error creating group:', error);
            throw error;
        }
    }

    async updateGroup(group: PermissionGroup): Promise<PermissionGroup> {
        await this.initialize();
        if (!this.groupsListId || !group.id) throw new Error("PermissionGroups list not found or Group ID missing");

        try {
            const fields: any = {
                Title: group.title,
                Description: group.description || ''
            };

            // Compress permissions: Convert { "home": ["read"] } -> ["home"]
            const compressedPermissions = Object.keys(group.permissions || {});

            fields[this.permissionsColumnName] = JSON.stringify(compressedPermissions);

            console.log('[UserSharePointService] Updating group with fields:', fields);

            await this.client
                .api(`/sites/${this.siteId}/lists/${this.groupsListId}/items/${group.id}`)
                .patch({ fields });

            return group;
        } catch (error) {
            console.error('Error updating group:', error);
            throw error;
        }
    }

    async deleteGroup(groupId: string): Promise<void> {
        await this.initialize();
        if (!this.groupsListId) throw new Error("PermissionGroups list not found");

        try {
            await this.client
                .api(`/sites/${this.siteId}/lists/${this.groupsListId}/items/${groupId}`)
                .delete();
        } catch (error) {
            console.error('Error deleting group:', error);
            throw error;
        }
    }
}
