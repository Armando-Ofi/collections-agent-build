// pages/CollectionsOverview.tsx

import React, { useState, useMemo } from 'react';
import {
  AlertTriangle,
  DollarSign,
  Clock,
  Activity,
  BarChart3,
  Target,
  Shield,
  PieChart,
} from "lucide-react";

// Hooks and Services
import { useFinancials } from '../hooks/useFinancials';
import { FinancialsService } from '../services/financialsService';

// Components
import Error from '../components/Error';
import FinancialDashboardHeader from '../components/FinancialDashboardHeader';
import FinancialKPICard from '../components/FinancialKPICard';
import FinancialTrendChart from '../components/FinancialTrendChart';
import FinancialPortfolioHealth from '../components/FinancialPortfolioHealth';
import FinancialPerformanceMetrics from '../components/FinancialPerformanceMetrics';

// Types
import { FinancialsKPICard } from '../types/financials';

const FinancialOverview: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'performance' | 'analysis'>('overview');
  
  const {
    financialsKPI,
    chartData,
    stats,
    criticalAlerts,
    warningAlerts,
    hasCriticalAlerts,
    isLoading,
    isFetching,
    isRefreshing,
    isExporting,
    error,
    portfolioHealth,
    riskAssessment,
    refreshData,
    exportData,
  } = useFinancials();

  // Handlers
  const handleRefresh = async () => {
    try {
      const result = await refreshData();
      if (result.success) {
        console.log('Data refreshed successfully');
      } else {
        console.error('Failed to refresh data:', result.error);
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  };

  const handleExport = async () => {
    try {
      const result = await exportData();
      if (result.success) {
        console.log('Data exported successfully');
      } else {
        console.error('Failed to export data:', result.error);
      }
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  // Generate KPI cards
  const kpiCards = useMemo((): FinancialsKPICard[] => {
    if (!stats || !financialsKPI) return [];

    const portfolioTrend = FinancialsService.calculateTrend(financialsKPI.portfolioValueTrend);
    const collectionTrend = FinancialsService.calculateTrend(financialsKPI.collectionRateTrend);
    const liquidationTrend = FinancialsService.calculateTrend(financialsKPI.liquidationRateTrend);

    return [
      {
        title: "Portfolio Value",
        value: FinancialsService.formatMoneyCompact(stats.totalPortfolioValue),
        change: portfolioTrend.change,
        trend: portfolioTrend.trend,
        icon: <DollarSign className="w-5 h-5 text-emerald-500" />,
        description: "Total portfolio value",
        format: 'currency',
        status: FinancialsService.getPerformanceStatus(stats.totalPortfolioValue / 1000000, 'score'),
      },
      {
        title: "Collection Rate",
        value: FinancialsService.formatPercentage(stats.collectionRate),
        change: collectionTrend.change,
        trend: collectionTrend.trend,
        icon: <Target className="w-5 h-5 text-blue-500" />,
        description: "Successful collections",
        format: 'percentage',
        status: FinancialsService.getPerformanceStatus(stats.collectionRate, 'rate'),
      },
      {
        title: "Liquidation Rate",
        value: FinancialsService.formatPercentage(stats.liquidationRate),
        change: liquidationTrend.change,
        trend: liquidationTrend.trend,
        icon: <BarChart3 className="w-5 h-5 text-violet-500" />,
        description: "Asset liquidation efficiency",
        format: 'percentage',
        status: FinancialsService.getPerformanceStatus(stats.liquidationRate, 'rate'),
      },
      {
        title: "Bad Debt Rate",
        value: FinancialsService.formatPercentage(stats.badDebtWriteOffRate),
        change: undefined,
        trend: stats.badDebtWriteOffRate <= 0.05 ? 'down' : 'up',
        icon: <AlertTriangle className="w-5 h-5 text-red-500" />,
        description: "Write-off percentage",
        format: 'percentage',
        status: stats.badDebtWriteOffRate <= 0.05 ? 'excellent' : 
               stats.badDebtWriteOffRate <= 0.1 ? 'good' : 
               stats.badDebtWriteOffRate <= 0.15 ? 'warning' : 'critical',
      },
      {
        title: "Days Sales Outstanding",
        value: `${Math.round(stats.daysSalesOutstanding)} days`,
        change: undefined,
        trend: stats.daysSalesOutstanding <= 30 ? 'down' : 'up',
        icon: <Clock className="w-5 h-5 text-amber-500" />,
        description: "Collection cycle time",
        format: 'days',
        status: FinancialsService.getPerformanceStatus(stats.daysSalesOutstanding, 'days'),
      },
      {
        title: "Performance Score",
        value: stats.performanceScore.toFixed(1),
        change: 3.5, // This would come from historical data in real implementation
        trend: 'up',
        icon: <Shield className="w-5 h-5 text-green-500" />,
        description: "Overall performance",
        format: 'number',
        status: FinancialsService.getPerformanceStatus(stats.performanceScore, 'score'),
      },
    ];
  }, [stats, financialsKPI]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading financial data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <Error 
        title="Error Loading Financial Data"
        message="Unable to fetch financial collection metrics. Please check your connection and try again."
        onRetry={handleRefresh}
        isRetrying={isRefreshing}
      />
    );
  }

  // Main component
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90">
      <div className="space-y-8 p-6 relative z-20">
        <FinancialDashboardHeader
          alerts={[...criticalAlerts, ...warningAlerts]}
          isLoading={isLoading}
          isRefreshing={isRefreshing}
          isExporting={isExporting}
          onRefresh={handleRefresh}
          onExport={handleExport}
        />

        {/* Custom Tabs */}
        <div className="w-full">
          <div className="glass-card dark:border-white/10 border-gray-200/50 w-full grid grid-cols-3 p-1 rounded-2xl shadow-lg relative z-10">
            {[
              { key: 'overview', icon: BarChart3, label: 'Overview' },
              { key: 'performance', icon: Activity, label: 'Performance' },
              { key: 'analysis', icon: PieChart, label: 'Analysis' },
            ].map(({ key, icon: Icon, label }) => (
              <button 
                key={key}
                onClick={() => setActiveTab(key as any)}
                className={`flex items-center justify-center gap-2 rounded-xl hover:neon-glow transition-all duration-300 px-4 py-2 text-sm font-medium ${
                  activeTab === key 
                    ? 'bg-primary/20 text-primary' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-primary'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="mt-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {kpiCards.map((card, index) => (
                    <FinancialKPICard key={index} {...card} />
                  ))}
                </div>
                
                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <FinancialTrendChart 
                    data={chartData?.portfolioTrend || []} 
                    title="Portfolio Value Trend" 
                    color="#10B981"
                    dataKey="value"
                  />
                  <FinancialPortfolioHealth 
                    health={portfolioHealth || { score: 0, grade: 'F', description: 'No data' }} 
                    risk={riskAssessment || { level: 'critical', message: 'No data', color: '#DC2626' }} 
                  />
                </div>
              </div>
            )}

            {activeTab === 'performance' && (
              <div className="space-y-6">
                {/* Performance Metrics */}
                <FinancialPerformanceMetrics metrics={chartData?.performanceMetrics || []} />
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <FinancialTrendChart 
                    data={chartData?.collectionTrend || []} 
                    title="Collection Rate Trend" 
                    color="#3B82F6"
                    dataKey="rate"
                  />
                  <FinancialTrendChart 
                    data={chartData?.liquidationTrend || []} 
                    title="Liquidation Rate Trend" 
                    color="#8B5CF6"
                    dataKey="rate"
                  />
                </div>
              </div>
            )}

            {activeTab === 'analysis' && (
              <div className="space-y-6">
                {/* Analysis Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="glass-card p-6 rounded-2xl border border-white/10 dark:border-white/10 shadow-lg">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Key Insights</h3>
                    <div className="space-y-3">
                      {stats && (
                        <>
                          <div className="flex items-start gap-3">
                            <div className={`w-2 h-2 rounded-full mt-2 ${
                              stats.collectionRate >= 0.85 ? 'bg-green-500' : 'bg-yellow-500'
                            }`}></div>
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                Collection Rate {stats.collectionRate >= 0.85 ? 'Above' : 'Below'} Target
                              </p>
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                Current rate of {FinancialsService.formatPercentage(stats.collectionRate)} 
                                {stats.collectionRate >= 0.85 ? ' exceeds the 85% target' : ' is below the 85% target'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className={`w-2 h-2 rounded-full mt-2 ${
                              stats.daysSalesOutstanding <= 30 ? 'bg-green-500' : 
                              stats.daysSalesOutstanding <= 45 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}></div>
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                DSO {stats.daysSalesOutstanding <= 30 ? 'Optimal' : 'Requires Attention'}
                              </p>
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                {Math.round(stats.daysSalesOutstanding)} days is 
                                {stats.daysSalesOutstanding <= 30 ? ' within the optimal 30-day target' : ' above the optimal 30-day target'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">Portfolio Performance</p>
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                Performance score of {stats.performanceScore.toFixed(1)} indicates 
                                {stats.performanceScore >= 85 ? ' excellent' : 
                                 stats.performanceScore >= 70 ? ' good' : ' improvement needed'} portfolio health
                              </p>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="glass-card p-6 rounded-2xl border border-white/10 dark:border-white/10 shadow-lg">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recommendations</h3>
                    <div className="space-y-3">
                      {stats && (
                        <>
                          {stats.daysSalesOutstanding > 45 && (
                            <div className="flex items-start gap-3">
                              <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                              <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">Accelerate DSO Reduction</p>
                                <p className="text-xs text-gray-600 dark:text-gray-400">Implement early payment incentives and automated follow-up</p>
                              </div>
                            </div>
                          )}
                          {stats.badDebtWriteOffRate > 0.1 && (
                            <div className="flex items-start gap-3">
                              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                              <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">Monitor Bad Debt Trends</p>
                                <p className="text-xs text-gray-600 dark:text-gray-400">Current rate approaching warning threshold - review credit policies</p>
                              </div>
                            </div>
                          )}
                          {stats.collectionRate >= 0.85 && stats.performanceScore >= 85 && (
                            <div className="flex items-start gap-3">
                              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                              <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">Maintain Collection Excellence</p>
                                <p className="text-xs text-gray-600 dark:text-gray-400">Continue current collection strategies and consider scaling successful practices</p>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialOverview;