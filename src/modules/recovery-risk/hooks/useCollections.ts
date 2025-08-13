import { useState, useCallback, useMemo } from 'react';
import type { PrePaymentRiskStats, PrePaymentRiskFilters } from '../types';
import { PrePaymentRiskService } from '../services/prePaymentRiskService';
import { 
  useGetCollectionAnalysesQuery,
  //useGetOverdueAccountsQuery,
  useGetCollectionStatsQuery,
  useCreateCollectionAnalysisMutation,
  useUpdateCollectionAnalysisMutation,
  useDeleteCollectionAnalysisMutation,
  useUpdateCollectionPaymentPlanMutation
} from '../store/collectionRiskApi';

export const useCollections = (initialFilters: PrePaymentRiskFilters = {}) => {
  const [filters, setFilters] = useState<PrePaymentRiskFilters>(initialFilters);
  
  // API Queries
  const {
    data: riskAnalysesData,
    isLoading: isLoadingRiskAnalyses,
    isFetching: isFetchingRiskAnalyses,
    error: riskAnalysesError,
    refetch: refetchRiskAnalyses,
  } = useGetCollectionAnalysesQuery(filters);

  /*const {
    data: overdueAccountsData,
    isLoading: isLoadingOverdue,
    isFetching: isFetchingOverdue,
    error: overdueError,
    refetch: refetchOverdue,
  } = useGetOverdueAccountsQuery(filters);*/

  const {
    data: statsData,
    isLoading: isLoadingStats,
    error: statsError,
    refetch: refetchStats,
  } = useGetCollectionStatsQuery();

  

  // Mutations
  const [createRiskAnalysis, { isLoading: isCreating }] = useCreateCollectionAnalysisMutation();
  const [updateRiskAnalysis, { isLoading: isUpdating }] = useUpdateCollectionAnalysisMutation();
  const [deleteRiskAnalysis, { isLoading: isDeleting }] = useDeleteCollectionAnalysisMutation();
  const [updatePaymentPlanMutation, { isLoading: isUpdatingPaymentPlan }] = useUpdateCollectionPaymentPlanMutation();

  // Memoized data
  const riskAnalyses = useMemo(() => riskAnalysesData || [], [riskAnalysesData]);
  //const overdueAccounts = useMemo(() => overdueAccountsData || [], [overdueAccountsData]);
  const allAccounts = useMemo(() => [...riskAnalyses], [riskAnalyses]);

  // Memoized stats - usar datos del API o calcular fallback
  const stats = useMemo((): PrePaymentRiskStats => {
    if (statsData) {
      return statsData;
    }
    
    // Fallback: calcular stats localmente si no hay datos del API
    //const portfolioMetrics = PrePaymentRiskService.calculatePortfolioMetrics(allAccounts);
    //const activeMetrics = PrePaymentRiskService.calculateActiveMetrics(riskAnalyses);
    //const overdueMetrics = PrePaymentRiskService.calculateOverdueMetrics(overdueAccounts);

    return {};
  }, [statsData, allAccounts, riskAnalyses]);

  // Loading states
  const isLoading = isLoadingRiskAnalyses || isLoadingStats;
  const isFetching = isFetchingRiskAnalyses;
  const error = riskAnalysesError || statsError;

  // Filter handlers
  const updateFilters = useCallback((newFilters: Partial<PrePaymentRiskFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  // Actions
  const refetch = useCallback(async () => {
    await Promise.all([
      refetchRiskAnalyses(),
      //refetchOverdue(),
      refetchStats(),
    ]);
  }, [refetchRiskAnalyses, refetchStats]);

  const updatePaymentPlan = useCallback(async (id: number, plan: string) => {
    try {
      await updatePaymentPlanMutation({ id, plan }).unwrap();
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  }, [updatePaymentPlanMutation]);

  const handleCreateRiskAnalysis = useCallback(async (data: any) => {
    try {
      await createRiskAnalysis(data).unwrap();
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  }, [createRiskAnalysis]);

  const handleUpdateRiskAnalysis = useCallback(async (data: any) => {
    try {
      await updateRiskAnalysis(data).unwrap();
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  }, [updateRiskAnalysis]);

  const handleDeleteRiskAnalysis = useCallback(async (id: number) => {
    try {
      await deleteRiskAnalysis(id).unwrap();
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  }, [deleteRiskAnalysis]);

  const findAnalysisById = useCallback((id: number) => {
    return allAccounts.find(analysis => analysis.id === id);
  }, [allAccounts]);

  return {
    // Data
    riskAnalyses,
    //overdueAccounts,
    allAccounts,
    stats,
    
    // Loading states
    isLoading: isLoading || isFetching,
    isCreating,
    isUpdating,
    isDeleting,
    isUpdatingPaymentPlan,
    
    // Error
    error,
    
    // Filters
    filters,
    updateFilters,
    resetFilters,
    
    // Actions
    refetch,
    updatePaymentPlan,
    createRiskAnalysis: handleCreateRiskAnalysis,
    updateRiskAnalysis: handleUpdateRiskAnalysis,
    deleteRiskAnalysis: handleDeleteRiskAnalysis,
    findAnalysisById,
  };
};