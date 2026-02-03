/**
 * usePaymentsSharePoint Hook
 * React hook for managing payments with SharePoint backend
 * Refactored to use React Query
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useMsal } from '@azure/msal-react';
import { PaymentsSharePointService } from '@/services/paymentsSharePointService';
import { getGraphClient } from '@/services/graphService';
import type { Payment } from '@/types/payment.types';
import { useToast } from '@/hooks/use-toast';
import { useRoleBasedAuth } from '@/hooks/useRoleBasedAuth';

export const usePaymentsSharePoint = () => {
  const { instance: msalInstance } = useMsal();
  const { user: roleUser, isAdmin } = useRoleBasedAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const userEmail = msalInstance.getActiveAccount()?.username;

  /**
   * Helper to initialize the service
   */
  const getService = async () => {
    const graphClient = await getGraphClient(msalInstance);
    if (!graphClient) {
      throw new Error('Failed to get Graph client');
    }
    const service = new PaymentsSharePointService(graphClient);
    await service.initialize();
    return service;
  };

  /**
   * Fetch Payments Query
   */
  const {
    data: payments = [],
    isLoading: loading,
    error
  } = useQuery({
    queryKey: ['payments', userEmail, isAdmin, roleUser?.role_name],
    queryFn: async () => {
      console.log('📥 [usePaymentsSharePoint] Fetching payments...');
      const service = await getService();
      const fetchedPayments = await service.getPayments(
        userEmail,
        isAdmin,
        roleUser?.role_name
      );
      console.log(`✅ [usePaymentsSharePoint] Loaded ${fetchedPayments.length} payments`);
      return fetchedPayments;
    },
    enabled: !!userEmail && (!!roleUser || !isAdmin),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  /**
   * Add Payment Mutation
   */
  const addMutation = useMutation({
    mutationFn: async (paymentData: Partial<Payment>) => {
      console.log('🆕 [usePaymentsSharePoint] Adding new payment...');
      const service = await getService();

      // Auto-populate creator info and default status
      const paymentToCreate = {
        ...paymentData,
        created_by: paymentData.created_by || userEmail,
        payment_status: paymentData.payment_status || 'Draft',
      };

      return service.addPayment(paymentToCreate);
    },
    onSuccess: (newPayment) => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      toast({
        title: 'Payment Created',
        description: `Payment "${newPayment.title}" has been created successfully.`,
      });
      console.log('✅ [usePaymentsSharePoint] Payment added successfully');
    },
    onError: (err: unknown) => {
      console.error('❌ [usePaymentsSharePoint] Failed to add payment', err);
      toast({
        title: 'Error Creating Payment',
        description: err instanceof Error ? err.message : 'Failed to create payment. Please try again.',
        variant: 'destructive',
      });
    }
  });

  /**
   * Update Payment Mutation
   */
  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Payment> }) => {
      console.log(`📝 [usePaymentsSharePoint] Updating payment ${id}...`);
      const service = await getService();

      const updatesToApply = {
        ...updates,
        last_updated_by: userEmail,
      };

      return service.updatePayment(id, updatesToApply);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      toast({
        title: 'Payment Updated',
        description: 'Payment has been updated successfully.',
      });
      console.log('✅ [usePaymentsSharePoint] Payment updated successfully');
    },
    onError: (err: unknown) => {
      console.error('❌ [usePaymentsSharePoint] Failed to update payment', err);
      toast({
        title: 'Error Updating Payment',
        description: err instanceof Error ? err.message : 'Failed to update payment. Please try again.',
        variant: 'destructive',
      });
    }
  });

  /**
   * Delete Payment Mutation
   */
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log(`🗑️  [usePaymentsSharePoint] Deleting payment ${id}...`);
      const service = await getService();
      await service.deletePayment(id, userEmail!);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      toast({
        title: 'Payment Deleted',
        description: 'Payment has been deleted successfully.',
      });
      console.log('✅ [usePaymentsSharePoint] Payment deleted successfully');
    },
    onError: (err: unknown) => {
      console.error('❌ [usePaymentsSharePoint] Failed to delete payment', err);
      toast({
        title: 'Error Deleting Payment',
        description: err instanceof Error ? err.message : 'Failed to delete payment. Please try again.',
        variant: 'destructive',
      });
    }
  });

  /**
   * Restore Payment Mutation
   */
  const restoreMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log(`♻️  [usePaymentsSharePoint] Restoring payment ${id}...`);
      const service = await getService();
      return service.restorePayment(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      toast({
        title: 'Payment Restored',
        description: 'Payment has been restored successfully.',
      });
      console.log('✅ [usePaymentsSharePoint] Payment restored successfully');
    },
    onError: (err: unknown) => {
      console.error('❌ [usePaymentsSharePoint] Failed to restore payment', err);
      toast({
        title: 'Error Restoring Payment',
        description: err instanceof Error ? err.message : 'Failed to restore payment. Please try again.',
        variant: 'destructive',
      });
    }
  });

  /**
   * Approve Payment Mutation
   */
  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log(`✅ [usePaymentsSharePoint] Approving payment ${id}...`);
      const service = await getService();
      const approverName = roleUser?.full_name || userEmail || '';

      return service.approvePayment(
        id,
        userEmail!,
        approverName
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      toast({
        title: 'Payment Approved',
        description: 'Payment has been approved successfully.',
      });
      console.log('✅ [usePaymentsSharePoint] Payment approved successfully');
    },
    onError: (err: unknown) => {
      console.error('❌ [usePaymentsSharePoint] Failed to approve payment', err);
      toast({
        title: 'Error Approving Payment',
        description: err instanceof Error ? err.message : 'Failed to approve payment. Please try again.',
        variant: 'destructive',
      });
    }
  });

  /**
   * Reject Payment Mutation
   */
  const rejectMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      console.log(`❌ [usePaymentsSharePoint] Rejecting payment ${id}...`);
      const service = await getService();
      return service.rejectPayment(id, reason, userEmail!);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      toast({
        title: 'Payment Rejected',
        description: 'Payment has been rejected.',
        variant: 'destructive',
      });
      console.log('✅ [usePaymentsSharePoint] Payment rejected successfully');
    },
    onError: (err: unknown) => {
      console.error('❌ [usePaymentsSharePoint] Failed to reject payment', err);
      toast({
        title: 'Error Rejecting Payment',
        description: err instanceof Error ? err.message : 'Failed to reject payment. Please try again.',
        variant: 'destructive',
      });
    }
  });

  /**
   * Mark as Paid Mutation
   */
  const markAsPaidMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log(`💰 [usePaymentsSharePoint] Marking payment ${id} as paid...`);
      const service = await getService();
      return service.markAsPaid(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      toast({
        title: 'Payment Marked as Paid',
        description: 'Payment status updated to Paid.',
      });
      console.log('✅ [usePaymentsSharePoint] Payment marked as paid successfully');
    },
    onError: (err: unknown) => {
      console.error('❌ [usePaymentsSharePoint] Failed to mark payment as paid', err);
      toast({
        title: 'Error Updating Payment',
        description: err instanceof Error ? err.message : 'Failed to mark payment as paid. Please try again.',
        variant: 'destructive',
      });
    }
  });

  return {
    payments,
    loading,
    error: error instanceof Error ? error.message : (error ? String(error) : null),
    add: addMutation.mutateAsync,
    update: (id: string, updates: Partial<Payment>) => updateMutation.mutateAsync({ id, updates }),
    remove: deleteMutation.mutateAsync,
    restore: restoreMutation.mutateAsync,
    approve: approveMutation.mutateAsync,
    reject: (id: string, reason: string) => rejectMutation.mutateAsync({ id, reason }),
    markAsPaid: markAsPaidMutation.mutateAsync,
    refresh: () => queryClient.invalidateQueries({ queryKey: ['payments'] }),
  };
};
