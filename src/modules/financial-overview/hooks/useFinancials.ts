// hooks/useFinancials.ts

import { useState, useCallback, useMemo } from 'react';
import type { 
  FinancialsKPIResponse, 
  FinancialsKPIStats, 
  FinancialsFilters, 
  FinancialsAlert,
  FinancialsChartData,
  FinancialsSummaryMetrics,
  FinancialsTrendAnalysis
} from '../types/financials';
import { FinancialsService } from '../services/financialsService';
import { 
  useGetFinancialsKPIQuery,
  useGetFinancialsStatsQuery,
} from '../store/financialsApi';

export const useFinancials = (initialFilters: FinancialsFilters = {}) => {
  const [filters, setFilters] = useState<FinancialsFilters>(initialFilters);
  
  // API Queries
  const {
    data: financialsKPIData,
    isLoading: isLoadingKPI,
    isFetching: isFetchingKPI,
    error: kpiError,
    refetch: refetchKPI,
  } = useGetFinancialsKPIQuery(filters);

  const {
    data: financialsStatsData,
    isLoading: isLoadingStats,
    error: statsError,
    refetch: refetchStats,
  } = useGetFinancialsStatsQuery();

  // No hay mutations reales, solo refetch
  const isRefreshing = isFetchingKPI;
  const isExporting = false;

  // Memoized data
  const financialsKPI = useMemo(() => financialsKPIData || null, [financialsKPIData]);
  const financialsStats = useMemo(() => financialsStatsData || null, [financialsStatsData]);

  // Memoized processed data
  const chartData = useMemo((): FinancialsChartData | null => {
    if (!financialsKPI) return null;
    return FinancialsService.processChartData(financialsKPI);
  }, [financialsKPI]);

  const summaryMetrics = useMemo((): FinancialsSummaryMetrics | null => {
    if (!financialsKPI) return null;
    return FinancialsService.calculateSummaryMetrics(financialsKPI);
  }, [financialsKPI]);

  const trendAnalysis = useMemo((): FinancialsTrendAnalysis | null => {
    if (!financialsKPI) return null;
    return FinancialsService.analyzeTrends(financialsKPI);
  }, [financialsKPI]);

  // Memoized alerts - generadas localmente
  const alerts = useMemo((): FinancialsAlert[] => {
    if (!financialsKPI) return [];
    return FinancialsService.generateAlerts(financialsKPI);
  }, [financialsKPI]);

  // Memoized stats - usar datos del API o calcular fallback
  const stats = useMemo((): FinancialsKPIStats | null => {
    if (financialsStats) {
      return financialsStats;
    }
    
    // Fallback: calcular stats localmente si no hay datos del API
    if (financialsKPI) {
      return FinancialsService.calculateStats(financialsKPI);
    }
    
    return null;
  }, [financialsStats, financialsKPI]);

  // Alertas críticas y de warning
  const criticalAlerts = useMemo(() => alerts.filter(alert => alert.type === 'critical'), [alerts]);
  const warningAlerts = useMemo(() => alerts.filter(alert => alert.type === 'warning'), [alerts]);
  const hasCriticalAlerts = useMemo(() => criticalAlerts.length > 0, [criticalAlerts]);

  // Portfolio health score
  const portfolioHealth = useMemo(() => {
    if (!financialsKPI) return null;
    return FinancialsService.calculatePortfolioHealthScore(financialsKPI);
  }, [financialsKPI]);

  // Risk assessment
  const riskAssessment = useMemo(() => {
    if (!financialsKPI) return null;
    return FinancialsService.getPortfolioRiskLevel(financialsKPI.badDebtWriteOffRate);
  }, [financialsKPI]);

  // Loading states
  const isLoading = isLoadingKPI || isLoadingStats;
  const isFetching = isFetchingKPI || isRefreshing;
  const error = kpiError || statsError;

  // Filter handlers
  const updateFilters = useCallback((newFilters: Partial<FinancialsFilters>) => {
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
      if (!financialsKPI) {
        throw new Error('No data to export');
      }
      
      // Generar CSV localmente
      const csvData = generateCSVFromFinancialsKPI(financialsKPI);
      const blob = new Blob([csvData], { type: 'text/csv' });
      
      // Descargar archivo
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `financials-report-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      return { success: true, message: 'Data exported successfully' };
    } catch (error) {
      return { success: false, error, message: 'Failed to export data' };
    }
  }, [financialsKPI]);

  // Utility functions
  const getRecommendations = useCallback(() => {
    if (!financialsKPI) return [];
    return FinancialsService.getRecommendations(financialsKPI);
  }, [financialsKPI]);

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
      portfolioValue: stats.totalPortfolioValue,
      collectionRate: stats.collectionRate,
      liquidationRate: stats.liquidationRate,
      badDebtRate: stats.badDebtWriteOffRate,
      daysOutstanding: stats.daysSalesOutstanding,
      performanceScore: stats.performanceScore,
      portfolioHealth: stats.portfolioHealth,
      alertCount: alerts.length,
      hasCriticalAlerts,
      trends: trendAnalysis,
      riskLevel: riskAssessment,
    };
  }, [stats, alerts.length, hasCriticalAlerts, trendAnalysis, riskAssessment]);

  return {
    // Raw data
    financialsKPI,
    financialsStats,
    alerts,
    
    // Processed data
    chartData,
    summaryMetrics,
    trendAnalysis,
    stats,
    dashboardSummary,
    portfolioHealth,
    riskAssessment,
    
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
const generateCSVFromFinancialsKPI = (data: FinancialsKPIResponse): string => {
  const rows = [
    ['Metric', 'Value'],
    ['Total Portfolio Value', data.totalPortfolioValue.toString()],
    ['Collection Rate', (data.collectionRate * 100).toFixed(2) + '%'],
    ['Liquidation Rate', (data.liquidationRate * 100).toFixed(2) + '%'],
    ['Bad Debt Write-off Rate', (data.badDebtWriteOffRate * 100).toFixed(2) + '%'],
    ['Days Sales Outstanding', data.daysSalesOutstanding.toString()],
    ['', ''], // Empty row
    ['Portfolio Value Trend', ''],
    ...data.portfolioValueTrend.map(item => [item.label, item.amount.toString()]),
    ['', ''], // Empty row
    ['Collection Rate Trend', ''],
    ...data.collectionRateTrend.map(item => [item.label, (item.amount * 100).toFixed(2) + '%']),
    ['', ''], // Empty row
    ['Liquidation Rate Trend', ''],
    ...data.liquidationRateTrend.map(item => [item.label, (item.amount * 100).toFixed(2) + '%']),
  ];
  
  return rows.map(row => row.join(',')).join('\n');
};