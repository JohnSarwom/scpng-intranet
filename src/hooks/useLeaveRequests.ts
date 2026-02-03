import { useQuery } from '@tanstack/react-query';
import { useMsal } from '@azure/msal-react';
import { getGraphClient } from '@/services/graphService';
import { getHRServiceInstance } from '@/services/hrSharePointService';
import { LeaveRequest } from '@/types/hr';

export const useLeaveRequests = (employeeId?: string) => {
    const { instance: msalInstance } = useMsal();

    return useQuery<LeaveRequest[]>({
        queryKey: ['hr', 'leave-requests', employeeId],
        queryFn: async () => {
            if (!employeeId || !msalInstance) return [];

            try {
                const client = await getGraphClient(msalInstance);
                if (!client) return [];

                const service = await getHRServiceInstance(client);
                return await service.getLeaveRequests(employeeId);
            } catch (error) {
                console.error('Error in useLeaveRequests:', error);
                return [];
            }
        },
        enabled: !!employeeId && !!msalInstance,
        refetchInterval: 5000, // Poll every 5 seconds
    });
};

