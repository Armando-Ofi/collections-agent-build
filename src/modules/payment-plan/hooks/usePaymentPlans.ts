
// hooks/usePaymentPlans.ts

import { useState, useCallback, useMemo } from 'react';
import type { PaymentPlan, PaymentPlanStats, PaymentPlanFilters } from '../types';
import { PaymentPlanService } from '../store/paymentPlansApi';
import { 
  useGetPaymentPlansQuery,
  useGetPaymentPlanStatsQuery,
  useCreatePaymentPlanMutation,
  useUpdatePaymentPlanMutation,
  useUpdatePaymentPlanStatusMutation,
  useDeletePaymentPlanMutation,
  useBulkUpdatePaymentPlansMutation,
  useBulkDeletePaymentPlansMutation,
} from '../store/paymentPlansApi';

export const usePaymentPlans = (initialFilters: PaymentPlanFilters = {}) => {
  const [filters, setFilters] = useState<PaymentPlanFilters>(initialFilters);
  
  // API Queries
  const {
    data: paymentPlansData,
    isLoading: isLoadingPaymentPlans,
    isFetching: isFetchingPaymentPlans,
    error: paymentPlansError,
    refetch: refetchPaymentPlans,
  } = useGetPaymentPlansQuery(filters);

  const {
    data: statsData,
    isLoading: isLoadingStats,
    error: statsError,
    refetch: refetchStats,
  } = useGetPaymentPlanStatsQuery();

  // Mutations
  const [createPaymentPlan, { isLoading: isCreating }] = useCreatePaymentPlanMutation();
  const [updatePaymentPlan, { isLoading: isUpdating }] = useUpdatePaymentPlanMutation();
  const [updatePaymentPlanStatus, { isLoading: isUpdatingStatus }] = useUpdatePaymentPlanStatusMutation();
  const [deletePaymentPlan, { isLoading: isDeleting }] = useDeletePaymentPlanMutation();
  const [bulkUpdatePaymentPlans, { isLoading: isBulkUpdating }] = useBulkUpdatePaymentPlansMutation();
  const [bulkDeletePaymentPlans, { isLoading: isBulkDeleting }] = useBulkDeletePaymentPlansMutation();

  // Memoized data
  const paymentPlans = useMemo(() => paymentPlansData || [], [paymentPlansData]);
  
  // Separate plans by status
  const activePlans = useMemo(() => 
    paymentPlans.filter(plan => plan.status === 'Active'), 
    [paymentPlans]
  );
  
  const completedPlans = useMemo(() => 
    paymentPlans.filter(plan => plan.status === 'Completed'), 
    [paymentPlans]
  );
  
  const defaultedPlans = useMemo(() => 
    paymentPlans.filter(plan => plan.status === 'Defaulted'), 
    [paymentPlans]
  );

  // Memoized stats - usar datos del API o calcular fallback
  const stats = useMemo((): PaymentPlanStats => {
    if (statsData) {
      return statsData;
    }
    
    // Fallback: calcular stats localmente si no hay datos del API
    return PaymentPlanService.calculatePaymentPlanStats(paymentPlans);
  }, [statsData, paymentPlans]);

  // Loading states
  const isLoading = isLoadingPaymentPlans || isLoadingStats;
  const isFetching = isFetchingPaymentPlans;
  const error = paymentPlansError || statsError;

  // Filter handlers
  const updateFilters = useCallback((newFilters: Partial<PaymentPlanFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  // Actions
  const refetch = useCallback(async () => {
    await Promise.all([
      refetchPaymentPlans(),
      refetchStats(),
    ]);
  }, [refetchPaymentPlans, refetchStats]);

  const handleCreatePaymentPlan = useCallback(async (data: any) => {
    try {
      await createPaymentPlan(data).unwrap();
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  }, [createPaymentPlan]);

  const handleUpdatePaymentPlan = useCallback(async (data: any) => {
    try {
      await updatePaymentPlan(data).unwrap();
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  }, [updatePaymentPlan]);

  const handleUpdatePaymentPlanStatus = useCallback(async (id: number, status: string) => {
    try {
      await updatePaymentPlanStatus({ id, status }).unwrap();
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  }, [updatePaymentPlanStatus]);

  const handleDeletePaymentPlan = useCallback(async (id: number) => {
    try {
      await deletePaymentPlan(id).unwrap();
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  }, [deletePaymentPlan]);

  const handleBulkUpdatePaymentPlans = useCallback(async (ids: number[], updates: Partial<PaymentPlan>) => {
    try {
      await bulkUpdatePaymentPlans({ ids, updates }).unwrap();
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  }, [bulkUpdatePaymentPlans]);

  const handleBulkDeletePaymentPlans = useCallback(async (ids: number[]) => {
    try {
      await bulkDeletePaymentPlans(ids).unwrap();
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  }, [bulkDeletePaymentPlans]);

  const findPaymentPlanById = useCallback((id: number) => {
    return paymentPlans.find(plan => plan.id === id);
  }, [paymentPlans]);

  // Filter helpers
  const filterByStatus = useCallback((status: string) => {
    updateFilters({ status });
  }, [updateFilters]);

  const filterByDiscount = useCallback((hasDiscount: boolean) => {
    updateFilters({ hasDiscount });
  }, [updateFilters]);

  const filterByInstallments = useCallback((min?: number, max?: number) => {
    updateFilters({ installmentRange: { min, max } });
  }, [updateFilters]);

  const filterByAmount = useCallback((min?: number, max?: number) => {
    updateFilters({ amountRange: { min, max } });
  }, [updateFilters]);

  return {
    // Data
    paymentPlans,
    activePlans,
    completedPlans,
    defaultedPlans,
    stats,
    
    // Loading states
    isLoading: isLoading || isFetching,
    isCreating,
    isUpdating,
    isUpdatingStatus,
    isDeleting,
    isBulkUpdating,
    isBulkDeleting,
    
    // Error
    error,
    
    // Filters
    filters,
    updateFilters,
    resetFilters,
    filterByStatus,
    filterByDiscount,
    filterByInstallments,
    filterByAmount,
    
    // Actions
    refetch,
    createPaymentPlan: handleCreatePaymentPlan,
    updatePaymentPlan: handleUpdatePaymentPlan,
    updatePaymentPlanStatus: handleUpdatePaymentPlanStatus,
    deletePaymentPlan: handleDeletePaymentPlan,
    bulkUpdatePaymentPlans: handleBulkUpdatePaymentPlans,
    bulkDeletePaymentPlans: handleBulkDeletePaymentPlans,
    findPaymentPlanById,
  };
};