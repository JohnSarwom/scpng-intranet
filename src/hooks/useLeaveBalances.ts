import { useQuery } from '@tanstack/react-query';
import { useMsal } from '@azure/msal-react';
import { getGraphClient } from '@/services/graphService';
import { getHRServiceInstance } from '@/services/hrSharePointService';
import { LeaveBalance } from '@/types/hr';

export const useLeaveBalances = (employeeId?: string) => {
    const { instance: msalInstance } = useMsal();

    return useQuery<LeaveBalance[]>({
        queryKey: ['hr', 'leave-balances', employeeId],
        queryFn: async () => {
            if (!employeeId || !msalInstance) return [];

            try {
                const client = await getGraphClient(msalInstance);
                if (!client) return [];

                const service = await getHRServiceInstance(client);
                return await service.getLeaveBalances(employeeId);
            } catch (error) {
                console.error('Error in useLeaveBalances:', error);
                return [];
            }
        },
        enabled: !!employeeId && !!msalInstance,
    });
};
