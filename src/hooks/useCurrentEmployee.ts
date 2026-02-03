import { useQuery } from '@tanstack/react-query';
import { useGraphProfile } from './useGraphProfile';
import { useHRService } from './useHRService';
import { Employee } from '@/types/hr';

export const useCurrentEmployee = () => {
    const { profile } = useGraphProfile();
    const { fetchEmployeeByEmail } = useHRService();

    return useQuery<Employee | null>({
        queryKey: ['hr', 'current-employee', profile?.mail],
        queryFn: async () => {
            console.log('useCurrentEmployee: fetching for', profile?.mail);
            if (!profile?.mail) return null;
            const emp = await fetchEmployeeByEmail(profile.mail);
            console.log('useCurrentEmployee: result', emp);
            return emp;
        },
        enabled: !!profile?.mail,
        staleTime: 1000 * 60 * 30, // 30 minutes - employee details don't change often
    });
};
