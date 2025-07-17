// hooks/useCollections.ts

import { useState, useCallback, useMemo } from 'react';
import type { 
  CollectionsKPIResponse, 
  CollectionsKPIStats, 
  CollectionsFilters, 
  CollectionsAlert,
  CollectionsChartData,
  CollectionsSummaryMetrics,
  CollectionsTrendAnalysis
} from '../types';
import { CollectionsService } from '../services/collectionsService';
import { 
  useGetCollectionsKPIQuery,
  useGetCollectionsStatsQuery,
} from '../store/collectionsApi';

export const useCollections = (initialFilters: CollectionsFilters = {}) => {
  const [filters, setFilters] = useState<CollectionsFilters>(initialFilters);
  
  // API Queries - Solo el endpoint real
  const {
    data: collectionsKPIData,
    isLoading: isLoadingKPI,
    isFetching: isFetchingKPI,
    error: kpiError,
    refetch: refetchKPI,
  } = useGetCollectionsKPIQuery(filters);

  const {
    data: collectionsStatsData,
    isLoading: isLoadingStats,
    error: statsError,
    refetch: refetchStats,
  } = useGetCollectionsStatsQuery();

  // No hay mutations reales, solo refetch
  const isRefreshing = isFetchingKPI;
  const isExporting = false;

  // Memoized data
  const collectionsKPI = useMemo(() => collectionsKPIData || null, [collectionsKPIData]);
  const collectionsStats = useMemo(() => collectionsStatsData || null, [collectionsStatsData]);

  // Memoized processed data
  const chartData = useMemo((): CollectionsChartData | null => {
    if (!collectionsKPI) return null;
    return CollectionsService.processChartData(collectionsKPI);
  }, [collectionsKPI]);

  const summaryMetrics = useMemo((): CollectionsSummaryMetrics | null => {
    if (!collectionsKPI) return null;
    return CollectionsService.calculateSummaryMetrics(collectionsKPI);
  }, [collectionsKPI]);

  const trendAnalysis = useMemo((): CollectionsTrendAnalysis | null => {
    if (!collectionsKPI) return null;
    return CollectionsService.analyzeTrends(collectionsKPI);
  }, [collectionsKPI]);

  // Memoized alerts - generadas localmente
  const alerts = useMemo((): CollectionsAlert[] => {
    if (!collectionsKPI) return [];
    return CollectionsService.generateAlerts(collectionsKPI);
  }, [collectionsKPI]);

  // Memoized stats - usar datos del API o calcular fallback
  const stats = useMemo((): CollectionsKPIStats | null => {
    if (collectionsStats) {
      return collectionsStats;
    }
    
    // Fallback: calcular stats localmente si no hay datos del API
    if (collectionsKPI) {
      return CollectionsService.calculateStats(collectionsKPI);
    }
    
    return null;
  }, [collectionsStats, collectionsKPI]);

  // Alertas críticas y de warning
  const criticalAlerts = useMemo(() => alerts.filter(alert => alert.type === 'critical'), [alerts]);
  const warningAlerts = useMemo(() => alerts.filter(alert => alert.type === 'warning'), [alerts]);
  const hasCriticalAlerts = useMemo(() => criticalAlerts.length > 0, [criticalAlerts]);

  // Loading states
  const isLoading = isLoadingKPI || isLoadingStats;
  const isFetching = isFetchingKPI || isRefreshing;
  const error = kpiError || statsError;

  // Filter handlers
  const updateFilters = useCallback((newFilters: Partial<CollectionsFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  // Actions
  const refetch = useCallback(async () => {
    await Promise.all([
      refetchKPI(),
      refetchStats(),
    ]);
  }, [refetchKPI, refetchStats]);

  const handleRefreshData = useCallback(async () => {
    try {
      await refetch();
      return { success: true, message: 'Data refreshed successfully' };
    } catch (error) {
      return { success: false, error, message: 'Failed to refresh data' };
    }
  }, [refetch]);

  const handleExportData = useCallback(async () => {
    try {
      if (!collectionsKPI) {
        throw new Error('No data to export');
      }
      
      // Generar CSV localmente
      const csvData = generateCSVFromKPI(collectionsKPI);
      const blob = new Blob([csvData], { type: 'text/csv' });
      
      // Descargar archivo
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `collections-report-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      return { success: true, message: 'Data exported successfully' };
    } catch (error) {
      return { success: false, error, message: 'Failed to export data' };
    }
  }, [collectionsKPI]);

  // Utility functions
  const getRecommendations = useCallback(() => {
    if (!collectionsKPI) return [];
    return CollectionsService.getRecommendations(collectionsKPI);
  }, [collectionsKPI]);

  const findAlertById = useCallback((id: string) => {
    return alerts.find(alert => alert.id === id);
  }, [alerts]);

  const getAlertsByType = useCallback((type: 'critical' | 'warning' | 'info') => {
    return alerts.filter(alert => alert.type === type);
  }, [alerts]);

  // Dashboard summary
  const dashboardSummary = useMemo(() => {
    if (!stats) return null;
    
    return {
      totalInvoices: stats.totalInvoices,
      totalAmount: stats.totalAmount,
      collectionEfficiency: stats.collectionEfficiency,
      daysOutstanding: stats.daysSalesOutstanding,
      criticalCount: stats.criticalInvoices,
      alertCount: alerts.length,
      hasCriticalAlerts,
      trends: trendAnalysis,
    };
  }, [stats, alerts.length, hasCriticalAlerts, trendAnalysis]);

  return {
    // Raw data
    collectionsKPI,
    collectionsStats,
    alerts,
    
    // Processed data
    chartData,
    summaryMetrics,
    trendAnalysis,
    stats,
    dashboardSummary,
    
    // Filtered alerts
    criticalAlerts,
    warningAlerts,
    hasCriticalAlerts,
    
    // Loading states
    isLoading,
    isFetching,
    isRefreshing,
    isExporting,
    
    // Error
    error,
    
    // Filters
    filters,
    updateFilters,
    resetFilters,
    
    // Actions
    refetch,
    refreshData: handleRefreshData,
    exportData: handleExportData,
    
    // Utilities
    getRecommendations,
    findAlertById,
    getAlertsByType,
  };
};

// Función helper para generar CSV localmente
const generateCSVFromKPI = (data: CollectionsKPIResponse): string => {
  const rows = [
    ['Metric', 'Value'],
    ['On Time Invoices', data.onTimeInvoices.toString()],
    ['On Time Amount', data.onTimeAmount.toString()],
    ['Overdue Invoices', data.overdueInvoices.toString()],
    ['Overdue Amount', data.overdueAmount.toString()],
    ['Critical Invoices', data.criticalInvoices.toString()],
    ['Days Sales Outstanding', data.daysSalesOutstanding.toString()],
    ['AR Turnover', data.arTurnover.toString()],
    ['Current Receivables', data.currentReceivables.toString()],
    ['Average Days Delinquent', data.averageDaysDelinquent.current_value.toString()],
    ['', ''], // Empty row
    ['Aging Breakdown', ''],
    ...data.agingBreakdown.map(item => [item.label, item.amount.toString()]),
    ['', ''], // Empty row
    ['Receivable Trend', ''],
    ...data.receivableTrend.map(item => [item.label, item.amount.toString()]),
  ];
  
  return rows.map(row => row.join(',')).join('\n');
};