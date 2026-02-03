
import { getSupabaseClient } from './supabaseClient';
import { OrganizationUnit, UserProfile, UnitMembership } from '@/types';

// Define unit management service
export const unitManagementService = {
    // Fetch organization units
    getAllUnits: async () => {
        const supabase = getSupabaseClient();

        try {
            const { data, error } = await supabase
                .from('organization_units')
                .select('*');

            if (error) throw error;

            // Transform snake_case to camelCase
            return data.map(unit => ({
                id: unit.id,
                name: unit.name,
                description: unit.description,
                code: unit.code,
                manager: unit.manager,
                createdAt: new Date(unit.created_at),
                updatedAt: new Date(unit.updated_at)
            })) as OrganizationUnit[];
        } catch (error) {
            console.error('Error fetching units:', error);
            throw error;
        }
    },

    // Get a specific unit
    getUnit: async (unitId: string) => {
        const supabase = getSupabaseClient();

        const { data, error } = await supabase
            .from('organization_units')
            .select('*')
            .eq('id', unitId)
            .single();

        if (error) throw error;

        // Transform snake_case to camelCase
        return {
            id: data.id,
            name: data.name,
            description: data.description,
            code: data.code,
            manager: data.manager,
            createdAt: new Date(data.created_at),
            updatedAt: new Date(data.updated_at)
        } as OrganizationUnit;
    },

    // Create a new unit
    createUnit: async (unit: Partial<OrganizationUnit>) => {
        const supabase = getSupabaseClient();

        const { data, error } = await supabase
            .from('organization_units')
            .insert([
                {
                    name: unit.name,
                    description: unit.description,
                    code: unit.code,
                    manager: unit.manager
                }
            ])
            .select();

        if (error) throw error;

        // Transform snake_case to camelCase
        return {
            id: data[0].id,
            name: data[0].name,
            description: data[0].description,
            code: data[0].code,
            manager: data[0].manager,
            createdAt: new Date(data[0].created_at),
            updatedAt: new Date(data[0].updated_at)
        } as OrganizationUnit;
    },

    // Update an existing unit
    updateUnit: async (unitId: string, updates: Partial<OrganizationUnit>) => {
        const supabase = getSupabaseClient();

        const { data, error } = await supabase
            .from('organization_units')
            .update({
                name: updates.name,
                description: updates.description,
                code: updates.code,
                manager: updates.manager
            })
            .eq('id', unitId)
            .select();

        if (error) throw error;

        // Transform snake_case to camelCase
        return {
            id: data[0].id,
            name: data[0].name,
            description: data[0].description,
            code: data[0].code,
            manager: data[0].manager,
            createdAt: new Date(data[0].created_at),
            updatedAt: new Date(data[0].updated_at)
        } as OrganizationUnit;
    },

    // Delete a unit
    deleteUnit: async (unitId: string) => {
        const supabase = getSupabaseClient();

        const { error } = await supabase
            .from('organization_units')
            .delete()
            .eq('id', unitId);

        if (error) throw error;

        return true;
    },

    // Get user's memberships
    getUserMemberships: async (userId: string) => {
        const supabase = getSupabaseClient();

        const { data, error } = await supabase
            .from('user_unit_memberships')
            .select(`
        *,
        organization_units(*)
      `)
            .eq('user_id', userId);

        if (error) throw error;

        // Transform to camelCase
        return data.map(membership => ({
            id: membership.id,
            userId: membership.user_id,
            unitId: membership.unit_id,
            role: membership.role,
            createdAt: new Date(membership.created_at),
            unit: {
                id: membership.organization_units.id,
                name: membership.organization_units.name,
                description: membership.organization_units.description,
                code: membership.organization_units.code,
                manager: membership.organization_units.manager,
                createdAt: new Date(membership.organization_units.created_at),
                updatedAt: new Date(membership.organization_units.updated_at)
            }
        }));
    },

    // Add user to unit
    addUserToUnit: async (userId: string, unitId: string, role: string) => {
        const supabase = getSupabaseClient();

        const { data, error } = await supabase
            .from('user_unit_memberships')
            .insert([
                {
                    user_id: userId,
                    unit_id: unitId,
                    role
                }
            ])
            .select();

        if (error) throw error;

        return {
            id: data[0].id,
            userId: data[0].user_id,
            unitId: data[0].unit_id,
            role: data[0].role,
            createdAt: new Date(data[0].created_at)
        } as UnitMembership;
    },

    // Remove user from unit
    removeUserFromUnit: async (userId: string, unitId: string) => {
        const supabase = getSupabaseClient();

        const { error } = await supabase
            .from('user_unit_memberships')
            .delete()
            .eq('user_id', userId)
            .eq('unit_id', unitId);

        if (error) throw error;

        return true;
    },

    // Update user role in unit
    updateUserRole: async (userId: string, unitId: string, newRole: string) => {
        const supabase = getSupabaseClient();

        const { data, error } = await supabase
            .from('user_unit_memberships')
            .update({ role: newRole })
            .eq('user_id', userId)
            .eq('unit_id', unitId)
            .select();

        if (error) throw error;

        return {
            id: data[0].id,
            userId: data[0].user_id,
            unitId: data[0].unit_id,
            role: data[0].role,
            createdAt: new Date(data[0].created_at)
        } as UnitMembership;
    },

    // Get user profile
    getUserProfile: async (userId: string) => {
        const supabase = getSupabaseClient();

        const { data, error } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                // No profile found
                return null;
            }
            throw error;
        }

        // Transform snake_case to camelCase
        return {
            id: data.id,
            firstName: data.first_name,
            lastName: data.last_name,
            email: data.email,
            position: data.position,
            department: data.department,
            isAdmin: data.is_admin,
            createdAt: new Date(data.created_at),
            updatedAt: new Date(data.updated_at)
        } as UserProfile;
    },

    // Update user profile
    updateUserProfile: async (userId: string, profile: Partial<UserProfile>) => {
        const supabase = getSupabaseClient();

        const { data, error } = await supabase
            .from('user_profiles')
            .update({
                first_name: profile.firstName,
                last_name: profile.lastName,
                position: profile.position,
                department: profile.department,
                is_admin: profile.isAdmin
            })
            .eq('id', userId)
            .select();

        if (error) throw error;

        // Transform snake_case to camelCase
        return {
            id: data[0].id,
            firstName: data[0].first_name,
            lastName: data[0].last_name,
            email: data[0].email,
            position: data[0].position,
            department: data[0].department,
            isAdmin: data[0].is_admin,
            createdAt: new Date(data[0].created_at),
            updatedAt: new Date(data[0].updated_at)
        } as UserProfile;
    }
};

export default unitManagementService;
