import { getSupabaseClient } from '@/integrations/supabase/supabaseClient';
import supabaseConfig from '@/config/supabase';
import { getStaffMembersByDivision, staffMembers as mockStaffMembers, StaffMember } from '@/data/divisions';

/**
 * Fetches staff members from Supabase, optionally filtered by division.
 * Falls back to mock data on error.
 */
export async function fetchStaffMembers(divisionId?: string): Promise<StaffMember[]> {
  try {
    const supabase = getSupabaseClient();

    let query = supabase
      .from(supabaseConfig.tables.staff_members)
      .select('*');

    if (divisionId) {
      query = query.eq('division_id', divisionId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching staff members:', error);
      // Fall back to mock data
      return divisionId ? getStaffMembersByDivision(divisionId) : mockStaffMembers;
    }

    if (data && data.length > 0) {
      // Map the data to match our StaffMember interface
      // Using the exact database schema fields: unit, job_title, mobile, business_phone, office_location, division_id
      return data.map(staff => ({
        id: staff.id.toString(),
        name: staff.name,
        email: staff.email,
        jobTitle: staff.job_title,
        department: staff.unit, // Database field is 'unit' not 'department'
        mobile: staff.mobile || 'N/A',
        businessPhone: staff.business_phone || 'N/A',
        officeLocation: staff.office_location || 'N/A',
        divisionId: staff.division_id
      }));
    }

    // If no data found in DB, fall back to mock data
    return divisionId ? getStaffMembersByDivision(divisionId) : mockStaffMembers;

  } catch (err) {
    console.error('Exception in fetchStaffMembers:', err);
    // Fall back to mock data
    return divisionId ? getStaffMembersByDivision(divisionId) : mockStaffMembers;
  }
}

/**
 * Fetches a single staff member by email.
 */
export async function fetchStaffMemberByEmail(email: string): Promise<StaffMember | null> {
  if (!email) return null;

  try {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from(supabaseConfig.tables.staff_members)
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      console.error('Error fetching staff member by email:', error);
      return null;
    }

    if (data) {
      return {
        id: data.id.toString(),
        name: data.name,
        email: data.email,
        jobTitle: data.job_title,
        department: data.unit || 'N/A',
        mobile: data.mobile || 'N/A',
        businessPhone: data.business_phone || 'N/A',
        officeLocation: data.office_location || 'N/A',
        divisionId: data.division_id
      };
    }

    return null;
  } catch (err) {
    console.error('Exception in fetchStaffMemberByEmail:', err);
    return null;
  }
}
