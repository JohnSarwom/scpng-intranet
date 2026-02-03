import { useCallback } from 'react';
import { useEmployees } from '@/contexts/EmployeesContext';
import { staffMembers } from '@/data/divisions';
import { Division } from '@/types';

// Define the return type for the lookup
export interface EmployeeDetails {
    name: string;
    email: string;
    jobTitle?: string;
    department?: string; // This translates to "Unit" usually
    divisionId?: string;
    divisionName?: string;
    avatarUrl?: string;
}

export const useEmployeeLookup = (divisions: Division[] = []) => {
    const { employees, isLoading, isInitialized } = useEmployees();

    const getEmployeeDetails = useCallback((name: string): EmployeeDetails | null => {
        if (!employees || employees.length === 0) return null;

        const employee = employees.find(e => e.displayName === name);
        if (!employee) return null;

        const details: EmployeeDetails = {
            name: employee.displayName,
            email: employee.mail || '',
            jobTitle: employee.jobTitle,
            department: employee.department,
        };

        // Lookup Division info using staffMembers mapping
        if (employee.department) {
            const staffMember = staffMembers.find(s =>
                s.department.toLowerCase() === employee.department?.toLowerCase()
            );

            if (staffMember && staffMember.divisionId) {
                details.divisionId = staffMember.divisionId;
                // Try to find division name from the passed divisions list, or fallback to simple title case
                const division = divisions.find(d => d.id === staffMember.divisionId);
                details.divisionName = division ? division.name : staffMember.divisionId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            }
        }

        return details;
    }, [employees, divisions]);

    return {
        employees,
        isLoading,
        isInitialized,
        getEmployeeDetails
    };
};
