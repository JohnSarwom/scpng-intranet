/**
 * React Hook for HR SharePoint Service
 * Refactored to use React Query for caching and mutations
 * Uses singleton service instance to avoid redundant initialization
 */

import { useState, useCallback } from 'react';
import { useMsal } from '@azure/msal-react';
import { toast } from 'sonner';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { getHRServiceInstance, HRSharePointService } from '@/services/hrSharePointService';
import { getGraphClient } from '@/services/graphService';
import {
  Employee,
  EmployeeProfile,
  LeaveBalance,
  LeaveRequest,
  HRStatistics,
  HRProfileFilters,
  EmployeeFormData,
  LeaveRequestSubmission,
} from '@/types/hr';

export const useHRService = () => {
  const { instance: msalInstance } = useMsal();
  const queryClient = useQueryClient();

  // We no longer need local state for the service since it's a singleton
  // We keep isLoading for backward compatibility with consumers expecting it
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Helper to get the singleton service instance
   */
  const getService = useCallback(async (): Promise<HRSharePointService> => {
    if (!msalInstance) {
      throw new Error('MSAL instance not available');
    }

    const client = await getGraphClient(msalInstance);
    if (!client) {
      throw new Error('Failed to initialize Microsoft Graph client');
    }

    return getHRServiceInstance(client);
  }, [msalInstance]);

  /**
   * ==========================================
   * EMPLOYEE OPERATIONS
   * ==========================================
   */

  /**
   * Fetch all employees
   */
  const fetchEmployees = useCallback(
    async (filters?: HRProfileFilters): Promise<Employee[]> => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await queryClient.fetchQuery({
          queryKey: ['hr', 'employees', filters],
          queryFn: async () => {
            const service = await getService();
            const employees = await service.getEmployees({
              status: filters?.employmentStatus,
              department: filters?.department,
              employmentType: filters?.employmentType,
            });

            // Apply client-side search filter
            let filtered = employees;
            if (filters?.searchQuery) {
              const query = filters.searchQuery.toLowerCase();
              filtered = employees.filter(
                (emp) =>
                  emp.firstName?.toLowerCase().includes(query) ||
                  emp.lastName?.toLowerCase().includes(query) ||
                  emp.email?.toLowerCase().includes(query) ||
                  emp.employeeId?.toLowerCase().includes(query) ||
                  emp.jobTitle?.toLowerCase().includes(query)
              );
            }
            return filtered;
          },
          staleTime: 1000 * 60 * 5, // 5 minutes
        });
        return data;
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        const errorMsg = `Failed to fetch employees: ${msg}`;
        setError(errorMsg);
        toast.error(errorMsg);
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    [getService, queryClient]
  );

  /**
   * Fetch employee by ID
   */
  const fetchEmployeeById = useCallback(
    async (employeeId: string): Promise<Employee | null> => {
      setIsLoading(true);
      setError(null);

      try {
        return await queryClient.fetchQuery({
          queryKey: ['hr', 'employee', employeeId],
          queryFn: async () => {
            const service = await getService();
            return service.getEmployeeById(employeeId);
          },
          staleTime: 1000 * 60 * 5,
        });
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        const errorMsg = `Failed to fetch employee: ${msg}`;
        setError(errorMsg);
        toast.error(errorMsg);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [getService, queryClient]
  );

  /**
   * Fetch employee by Email
   */
  const fetchEmployeeByEmail = useCallback(
    async (email: string): Promise<Employee | null> => {
      setIsLoading(true);
      setError(null);

      try {
        return await queryClient.fetchQuery({
          queryKey: ['hr', 'employee', 'email', email],
          queryFn: async () => {
            const service = await getService();
            return service.getEmployeeByEmail(email);
          },
          staleTime: 1000 * 60 * 5,
        });
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        const errorMsg = `Failed to fetch employee by email: ${msg}`;
        setError(errorMsg);
        toast.error(errorMsg);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [getService, queryClient]
  );

  /**
   * Fetch comprehensive employee profile
   */
  const fetchEmployeeProfile = useCallback(
    async (employeeId: string): Promise<EmployeeProfile | null> => {
      setIsLoading(true);
      setError(null);

      try {
        return await queryClient.fetchQuery({
          queryKey: ['hr', 'profile', employeeId],
          queryFn: async () => {
            const service = await getService();
            return service.getEmployeeProfile(employeeId);
          },
          staleTime: 1000 * 60 * 5,
        });
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        const errorMsg = `Failed to fetch employee profile: ${msg}`;
        setError(errorMsg);
        toast.error(errorMsg);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [getService, queryClient]
  );

  /**
   * Create new employee Mutation
   */
  const createEmployeeMutation = useMutation({
    mutationFn: async (data: EmployeeFormData) => {
      const service = await getService();
      return service.createEmployee(data);
    },
    onSuccess: (newEmployee) => {
      toast.success(`Employee ${newEmployee.fullName} created successfully`);
      queryClient.invalidateQueries({ queryKey: ['hr', 'employees'] });
    },
    onError: (e: unknown) => {
      const msg = e instanceof Error ? e.message : String(e);
      const errorMsg = `Failed to create employee: ${msg}`;
      setError(errorMsg);
      toast.error(errorMsg);
    }
  });

  /**
   * Update employee Mutation
   */
  const updateEmployeeMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<EmployeeFormData> }) => {
      const service = await getService();
      return service.updateEmployee(id, data);
    },
    onSuccess: () => {
      toast.success('Employee updated successfully');
      queryClient.invalidateQueries({ queryKey: ['hr', 'employees'] });
      queryClient.invalidateQueries({ queryKey: ['hr', 'profile'] });
      queryClient.invalidateQueries({ queryKey: ['hr', 'employee'] });
    },
    onError: (e: unknown) => {
      const msg = e instanceof Error ? e.message : String(e);
      const errorMsg = `Failed to update employee: ${msg}`;
      setError(errorMsg);
      toast.error(errorMsg);
    }
  });

  /**
   * ==========================================
   * LEAVE OPERATIONS
   * ==========================================
   */

  /**
   * Fetch leave balances
   */
  const fetchLeaveBalances = useCallback(
    async (employeeId: string): Promise<LeaveBalance[]> => {
      try {
        return await queryClient.fetchQuery({
          queryKey: ['hr', 'leave-balances', employeeId],
          queryFn: async () => {
            const service = await getService();
            return service.getLeaveBalances(employeeId);
          },
          staleTime: 1000 * 60 * 5,
        });
      } catch (e: unknown) {
        console.error('Failed to fetch leave balances:', e);
        return [];
      }
    },
    [getService, queryClient]
  );

  /**
   * Fetch leave requests
   */
  const fetchLeaveRequests = useCallback(
    async (employeeId: string): Promise<LeaveRequest[]> => {
      try {
        return await queryClient.fetchQuery({
          queryKey: ['hr', 'leave-requests', employeeId],
          queryFn: async () => {
            const service = await getService();
            return service.getLeaveRequests(employeeId);
          },
          staleTime: 1000 * 60 * 5,
        });
      } catch (e: unknown) {
        console.error('Failed to fetch leave requests:', e);
        return [];
      }
    },
    [getService, queryClient]
  );

  /**
   * Submit leave request Mutation
   */
  const submitLeaveRequestMutation = useMutation({
    mutationFn: async (data: LeaveRequestSubmission) => {
      const service = await getService();
      return service.submitLeaveRequest(data);
    },
    onSuccess: () => {
      toast.success('Leave request submitted successfully');
      queryClient.invalidateQueries({ queryKey: ['hr', 'leave-requests'] });
      queryClient.invalidateQueries({ queryKey: ['hr', 'leave-balances'] });
    },
    onError: (e: unknown) => {
      const msg = e instanceof Error ? e.message : String(e);
      const errorMsg = `Failed to submit leave request: ${msg}`;
      setError(errorMsg);
      toast.error(errorMsg);
    }
  });

  /**
   * ==========================================
   * STATISTICS
   * ==========================================
   */

  /**
   * Fetch HR statistics
   */
  const fetchStatistics = useCallback(async (): Promise<HRStatistics | null> => {
    setIsLoading(true);
    setError(null);

    try {
      return await queryClient.fetchQuery({
        queryKey: ['hr', 'statistics'],
        queryFn: async () => {
          const service = await getService();
          return service.getHRStatistics();
        },
        staleTime: 1000 * 60 * 15,
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      const errorMsg = `Failed to fetch statistics: ${msg}`;
      setError(errorMsg);
      toast.error(errorMsg);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [getService, queryClient]);

  /**
   * Create leave balance Mutation
   */
  const createLeaveBalanceMutation = useMutation({
    mutationFn: async ({ employeeId, leaveType, entitlement, year }: { employeeId: string; leaveType: string; entitlement: number; year: number }) => {
      const service = await getService();
      return service.createLeaveBalance(employeeId, leaveType, entitlement, year);
    },
    onError: (e: unknown) => {
      console.error('Failed to create leave balance:', e);
      // Don't show toast for every balance creation to avoid spamming
    }
  });

  // Combine loading states
  const isAnyLoading = isLoading ||
    createEmployeeMutation.isPending ||
    updateEmployeeMutation.isPending ||
    submitLeaveRequestMutation.isPending ||
    createLeaveBalanceMutation.isPending;

  return {
    // Always true as we lazy load the service singleton
    isInitialized: true,
    isLoading: isAnyLoading,
    error,
    // Employee operations
    fetchEmployees,
    fetchEmployeeById,
    fetchEmployeeByEmail,
    fetchEmployeeProfile,
    createEmployee: createEmployeeMutation.mutateAsync,
    updateEmployee: (id: string, data: Partial<EmployeeFormData>) => updateEmployeeMutation.mutateAsync({ id, data }),
    // Leave operations
    fetchLeaveBalances,
    fetchLeaveRequests,
    submitLeaveRequest: submitLeaveRequestMutation.mutateAsync,
    createLeaveBalance: (employeeId: string, leaveType: string, entitlement: number, year: number) =>
      createLeaveBalanceMutation.mutateAsync({ employeeId, leaveType, entitlement, year }),
    // Statistics
    fetchStatistics,
    // Debug
    inspectListColumns: useCallback(async (listName: string) => {
      const service = await getService();
      await service.inspectListColumns(listName);
    }, [getService]),
  };
};
