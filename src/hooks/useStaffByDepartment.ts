import { useState, useEffect } from 'react';
import DivisionStaffMap from '@/utils/divisionStaffMap'; // Re-add DivisionStaffMap import
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth'; // Correct the import path
import { StaffMember } from '@/types/staff';

// Remove snakeToCamelCase helper if it was added specifically for the Supabase fetch

export function useStaffByDepartment() {
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Remove currentUserDepartment state if added
  const { user } = useSupabaseAuth(); // Correct the hook usage

  useEffect(() => {
    setLoading(true);
    setError(null);

    try {
      // Restore original logic using DivisionStaffMap
      if (!user?.email) {
        setStaffMembers([]);
        // setLoading(false); // Move to finally block
        return;
      }

      // Find the current user's staff member record
      const currentStaff = DivisionStaffMap.getStaffByEmail(user.email);

      if (!currentStaff) {
        setStaffMembers([]);
        // setLoading(false); // Move to finally block
        return;
      }

      // Get all staff members
      const allStaff = DivisionStaffMap.getAllStaff();

      // Filter staff to only include those in the same department/unit
      const departmentStaff = allStaff.filter(
        staff => staff.department === currentStaff.department
      );

      setStaffMembers(departmentStaff);
    } catch (err) {
      console.error('Error getting staff by department:', err);
      setError('Failed to load staff members');
      setStaffMembers([]);
    } finally {
      setLoading(false); // Ensure loading is always set to false
    }
  }, [user?.email]);

  return {
    staffMembers,
    loading,
    error,
    // Restore original logic for currentUserDepartment
    currentUserDepartment: staffMembers.length > 0 && user?.email
      ? DivisionStaffMap.getStaffByEmail(user.email)?.department
      : null,
    isEmpty: staffMembers.length === 0 && !loading
  };
}

export default useStaffByDepartment; 