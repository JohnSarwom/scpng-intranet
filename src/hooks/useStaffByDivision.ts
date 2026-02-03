import { useState, useEffect } from 'react';
import { getSupabaseClient } from '@/integrations/supabase/supabaseClient';
import DivisionStaffMap from '@/utils/divisionStaffMap';
import { useDivisionContext } from './useDivisionContext';
import { StaffMember } from '@/types/staff';

export interface UseStaffByDivisionOptions {
  divisionId?: string;
  searchQuery?: string;
  includeAllDivisions?: boolean;
}

const useStaffByDivision = (options: UseStaffByDivisionOptions = {}) => {
  const { divisionId, searchQuery, includeAllDivisions = false } = options;
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const supabase = getSupabaseClient();
  const { userDivisions } = useDivisionContext();

  useEffect(() => {
    const fetchStaff = async () => {
      setLoading(true);
      setError(null);

      try {
        // First try to fetch from the database
        let { data, error } = await supabase
          .from('staff_members')
          .select('*')
          .eq(divisionId ? 'division_id' : '', divisionId || '');

        if (error) throw error;

        let staffData: StaffMember[] = [];

        if (data && data.length > 0) {
          // Map the data to match our StaffMember interface
          // Database has 'unit' field, interface expects 'department'
          staffData = data.map(staff => ({
            id: staff.id.toString(),
            name: staff.name,
            email: staff.email,
            job_title: staff.job_title,
            department: staff.unit || 'N/A', // Database field is 'unit' not 'department'
            mobile: staff.mobile || 'N/A',
            business_phone: staff.business_phone || 'N/A',
            office_location: staff.office_location || 'N/A',
            division_id: staff.division_id
          }));
        } else {
          // Fallback to static data if no results or specified division
          if (divisionId) {
            staffData = DivisionStaffMap.getStaffByDivision(divisionId);
          } else if (includeAllDivisions) {
            staffData = DivisionStaffMap.getAllStaff();
          } else if (userDivisions && userDivisions.length > 0) {
            // If no division specified but user has divisions, get staff for user's divisions
            // Use the division ID from the first division in userDivisions
            staffData = DivisionStaffMap.getStaffByDivision(userDivisions[0].id);
          } else {
            // Get all staff as a last resort
            staffData = DivisionStaffMap.getAllStaff();
          }
        }

        // Apply search filtering if a query is provided
        if (searchQuery && searchQuery.trim() !== '') {
          const query = searchQuery.toLowerCase().trim();
          staffData = staffData.filter(
            staff =>
              staff.name.toLowerCase().includes(query) ||
              staff.email.toLowerCase().includes(query) ||
              staff.job_title.toLowerCase().includes(query) ||
              staff.department.toLowerCase().includes(query)
          );
        }

        setStaff(staffData);
      } catch (err) {
        console.error('Error fetching staff:', err);
        setError(err instanceof Error ? err : new Error(String(err)));

        // Fallback to static data on error
        let staffData: StaffMember[];

        if (divisionId) {
          staffData = DivisionStaffMap.getStaffByDivision(divisionId);
        } else if (includeAllDivisions) {
          staffData = DivisionStaffMap.getAllStaff();
        } else {
          staffData = DivisionStaffMap.getAllStaff();
        }

        // Apply search filtering on error case too
        if (searchQuery && searchQuery.trim() !== '') {
          const query = searchQuery.toLowerCase().trim();
          staffData = staffData.filter(
            staff =>
              staff.name.toLowerCase().includes(query) ||
              staff.email.toLowerCase().includes(query) ||
              staff.job_title.toLowerCase().includes(query) ||
              staff.department.toLowerCase().includes(query)
          );
        }

        setStaff(staffData);
      } finally {
        setLoading(false);
      }
    };

    fetchStaff();
  }, [divisionId, searchQuery, includeAllDivisions, supabase, userDivisions]);

  return {
    staffMembers: staff,
    loading,
    error,
    isEmpty: staff.length === 0 && !loading
  };
};

export default useStaffByDivision; 