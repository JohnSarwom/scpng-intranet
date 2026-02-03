import { useQuery, useQueryClient } from '@tanstack/react-query';
import { StaffMember } from '@/data/divisions';
import { fetchStaffMembers, fetchStaffMemberByEmail } from '@/services/staffService';

interface UseStaffMembersReturn {
  staffMembers: StaffMember[];
  loading: boolean;
  error: Error | null;
  refreshStaffMembers: () => Promise<void>;
}

export function useStaffMembers(divisionId?: string): UseStaffMembersReturn {
  const queryClient = useQueryClient();
  const queryKey = ['staffMembers', divisionId];

  const { data, isLoading, error, refetch } = useQuery({
    queryKey,
    queryFn: () => fetchStaffMembers(divisionId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  return {
    staffMembers: data || [],
    loading: isLoading,
    error: error as Error | null,
    refreshStaffMembers: async () => {
      await refetch();
    },
  };
}

// Re-export the helper if needed, or consumers should import from service
// Keeping it here for backward compatibility if it was exported before
export const getStaffMemberByEmail = fetchStaffMemberByEmail;