import { getSupabaseClient } from './supabaseClient';
import supabaseConfig from '@/config/supabase';
import { DivisionRole } from '@/types';
import { divisions as mockDivisions, staffMembers as mockStaffMembers } from '@/data/divisions';

// Interface for division data
export interface Division {
    id: string;
    name: string;
    description?: string;
    color?: string;
}

// Interface for division membership
export interface DivisionMembership {
    id?: string;
    staff_id: string;
    division_id: string;
    role: 'director' | 'manager' | 'officer' | 'staff';
}

// Service for handling division operations
export const divisionService = {
    // Get all divisions
    getDivisions: async (): Promise<Division[]> => {
        const supabase = getSupabaseClient();

        try {
            const { data, error } = await supabase
                .from(supabaseConfig.tables.divisions)
                .select('*');

            if (error) {
                console.error('Error fetching divisions:', error);
                // Fall back to mock data if database query fails
                return mockDivisions;
            }

            return data || mockDivisions;
        } catch (error) {
            console.error('Exception in getDivisions:', error);
            return mockDivisions;
        }
    },

    // Get division by ID
    getDivisionById: async (id: string): Promise<Division | null> => {
        const supabase = getSupabaseClient();

        try {
            const { data, error } = await supabase
                .from(supabaseConfig.tables.divisions)
                .select('*')
                .eq('id', id)
                .single();

            if (error) {
                console.error('Error fetching division:', error);
                // Fall back to mock data
                return mockDivisions.find(div => div.id === id) || null;
            }

            return data || mockDivisions.find(div => div.id === id) || null;
        } catch (error) {
            console.error('Exception in getDivisionById:', error);
            return mockDivisions.find(div => div.id === id) || null;
        }
    },

    // Get users for a division
    getDivisionMembers: async (divisionId: string): Promise<any[]> => {
        const supabase = getSupabaseClient();

        try {
            const { data, error } = await supabase
                .from(supabaseConfig.tables.division_memberships)
                .select(`
          *,
          users:${supabaseConfig.tables.users}(*)
        `)
                .eq('divisionId', divisionId);

            if (error) {
                console.error('Error fetching division members:', error);
                // Fall back to mock data
                return mockStaffMembers.filter(staff => staff.divisionId === divisionId);
            }

            return data || mockStaffMembers.filter(staff => staff.divisionId === divisionId);
        } catch (error) {
            console.error('Exception in getDivisionMembers:', error);
            return mockStaffMembers.filter(staff => staff.divisionId === divisionId);
        }
    },

    // Get divisions for a user
    getUserDivisions: async (userId: string): Promise<Division[]> => {
        const supabase = getSupabaseClient();

        try {
            // First get the membership records
            const { data: memberships, error: membershipError } = await supabase
                .from(supabaseConfig.tables.division_memberships)
                .select('*')
                .eq('userId', userId);

            if (membershipError) {
                console.error('Error fetching user memberships:', membershipError);
                // For mock data, let's just return all divisions for simplicity
                return mockDivisions;
            }

            if (!memberships || memberships.length === 0) {
                return [];
            }

            // Get the division IDs from memberships
            const divisionIds = memberships.map(m => m.divisionId);

            // Now fetch the actual divisions
            const { data: divisions, error: divisionError } = await supabase
                .from(supabaseConfig.tables.divisions)
                .select('*')
                .in('id', divisionIds);

            if (divisionError) {
                console.error('Error fetching divisions:', divisionError);
                // Filter mock divisions that match the IDs
                return mockDivisions.filter(div => divisionIds.includes(div.id));
            }

            return divisions || mockDivisions.filter(div => divisionIds.includes(div.id));
        } catch (error) {
            console.error('Exception in getUserDivisions:', error);
            return mockDivisions;
        }
    },

    // Add a new division membership
    addDivisionMembership: async (
        userId: string,
        divisionId: string,
        role: DivisionRole
    ): Promise<DivisionMembership | null> => {
        const supabase = getSupabaseClient();

        try {
            const { data, error } = await supabase
                .from(supabaseConfig.tables.division_memberships)
                .insert([{
                    userId,
                    divisionId,
                    role
                }])
                .select()
                .single();

            if (error) {
                console.error('Error adding division membership:', error);
                return null;
            }

            return data;
        } catch (error) {
            console.error('Exception in addDivisionMembership:', error);
            return null;
        }
    },

    // Initialize database with divisions and staff data
    initializeDivisionsData: async (): Promise<void> => {
        const supabase = getSupabaseClient();

        try {
            // First check if data already exists
            const { count, error: countError } = await supabase
                .from(supabaseConfig.tables.divisions)
                .select('*', { count: 'exact', head: true });

            if (countError) {
                console.error('Error checking divisions count:', countError);
                return;
            }

            // If data already exists, don't initialize
            if (count && count > 0) {
                console.log('Divisions data already exists, skipping initialization');
                return;
            }

            // Default colors for divisions
            const divisionColors = {
                'executive-division': '#4F46E5',
                'corporate-services-division': '#10B981',
                'licensing-market-supervision-division': '#F59E0B',
                'legal-services-division': '#EF4444',
                'research-publication-division': '#8B5CF6',
                'secretariat-unit': '#EC4899'
            };

            // Insert divisions
            const { data: existingDivisions, error: existingDivisionsError } = await supabase
                .from(supabaseConfig.tables.divisions)
                .select('*');

            if (existingDivisionsError) {
                console.error('Error checking existing divisions:', existingDivisionsError);
                return;
            }

            const divisionsWithColors = existingDivisions.map(division => ({
                ...division,
                color: divisionColors[division.id as keyof typeof divisionColors] || '#64748b'
            }));

            const { error: insertError } = await supabase
                .from(supabaseConfig.tables.divisions)
                .insert(divisionsWithColors);

            if (insertError) {
                console.error('Error initializing divisions data:', insertError);
                return;
            }

            // Insert staff members
            const { error: staffError } = await supabase
                .from(supabaseConfig.tables.staff_members)
                .insert(mockStaffMembers);

            if (staffError) {
                console.error('Error initializing staff members:', staffError);
                return;
            }

            console.log('Successfully initialized divisions and staff data');
        } catch (error) {
            console.error('Exception in initializeDivisionsData:', error);
        }
    }
};

export default divisionService;
