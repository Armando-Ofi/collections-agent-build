import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import {
  AlertTriangle,
  DollarSign,
  TrendingUp,
  Clock,
  Activity,
  BarChart3,
  Target,
} from "lucide-react";

// Hooks and Services
import { useCollections } from '../hooks/useCollections';
import { CollectionsService } from '../services/collectionsService';

// Components
import Error from '@/shared/components/common/Error';
import DashboardHeader from '../components/DashboardHeader';
import KPICardsGrid from '../components/KPICardsGrid';
import ReceivablesTrendChart from '../components/ReceivablesTrendChart';
import KeyMetricsSummary from '../components/KeyMetricsSummary';
import AgingKPICards from '../components/AgingKPICards';
import AgingPieChart from '../components/AgingPieChart';
import AgingBarChart from '../components/AgingBarChart';
import RiskFunnelChart from '../components/RiskFunnelChart';
import CommunicationPerformanceChart from '../components/CommunicationPerformanceChart';

const CollectionsOverview: React.FC = () => {
  const [activeTab, setActiveTab] = useState("overview");
  
  const {
    collectionsKPI,
    chartData,
    summaryMetrics,
    stats,
    criticalAlerts,
    warningAlerts,
    hasCriticalAlerts,
    isLoading,
    isFetching,
    isRefreshing,
    isExporting,
    error,
    refetch,
    refreshData,
    exportData,
    getRecommendations,
  } = useCollections();

  // Handlers
  const handleRefresh = async () => {
    const result = await refreshData();
    if (result.success) {
      console.log('Data refreshed successfully');
    } else {
      console.error('Failed to refresh data:', result.error);
    }
  };

  const handleExport = async () => {
    const result = await exportData();
    if (result.success) {
      console.log('Data exported successfully');
    } else {
      console.error('Failed to export data:', result.error);
    }
  };

  // Generate KPI cards
  const kpiCards = React.useMemo(() => {
    if (!stats || !collectionsKPI) return [];

    const receivableTrend = CollectionsService.calculateTrend(collectionsKPI.receivableTrend);
    const conversionRate = stats.totalInvoices > 0 ? stats.onTimeInvoices / stats.totalInvoices : 0;

    return [
      {
        title: "Total Receivables",
        value: CollectionsService.formatMoneyCompact(stats.totalAmount),
        change: receivableTrend.change,
        trend: receivableTrend.trend,
        icon: <DollarSign className="w-5 h-5 text-emerald-500" />,
        description: "Total outstanding invoices",
        format: 'currency' as const,
      },
      {
        title: "Overdue Amount",
        value: CollectionsService.formatMoneyCompact(stats.overdueAmount),
        change: undefined,
        trend: 'down' as const,
        icon: <AlertTriangle className="w-5 h-5 text-red-500" />,
        description: "Past due invoices",
        format: 'currency' as const,
      },
      {
        title: "Days Sales Outstanding",
        value: Math.round(stats.daysSalesOutstanding).toString(),
        change: collectionsKPI.averageDaysDelinquent.change_last_30_days,
        trend: collectionsKPI.averageDaysDelinquent.change_last_30_days > 0 ? 'up' : 'down',
        icon: <Clock className="w-5 h-5 text-amber-500" />,
        description: "Average collection period",
        format: 'days' as const,
      },
      {
        title: "Collection Rate",
        value: CollectionsService.formatPercentage(conversionRate),
        change: undefined,
        trend: 'up' as const,
        icon: <Target className="w-5 h-5 text-blue-500" />,
        description: "On-time payment rate",
        format: 'percentage' as const,
      },
      {
        title: "AR Turnover",
        value: stats.arTurnover.toFixed(2),
        change: undefined,
        trend: stats.arTurnover > 1 ? 'up' : 'down',
        icon: <TrendingUp className="w-5 h-5 text-violet-500" />,
        description: "Receivables efficiency",
        format: 'number' as const,
      },
      {
        title: "Critical Invoices",
        value: CollectionsService.formatNumber(stats.criticalInvoices),
        change: undefined,
        trend: stats.criticalInvoices > 10 ? 'up' : 'neutral',
        icon: <AlertTriangle className="w-5 h-5 text-red-600" />,
        description: "90+ days overdue",
        format: 'number' as const,
      },
    ];
  }, [stats, collectionsKPI]);

  if (error) {
    return <Error title="Error fetching Collections Data" onRetry={refetch} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90">
      {/* Contenedor principal sin overflow hidden */}
      <div className="space-y-8 p-6 relative z-20">
        <DashboardHeader
          criticalAlerts={criticalAlerts || []}
          isLoading={isLoading}
          isRefreshing={isRefreshing}
          isExporting={isExporting}
          onRefresh={handleRefresh}
          onExport={handleExport}
        />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Reducir z-index de TabsList para que no interfiera con dropdown */}
          <TabsList className="glass-card dark:border-white/10 border-gray-200/50 w-full grid grid-cols-3 p-1 rounded-2xl shadow-lg relative z-10">
            <TabsTrigger 
              value="overview" 
              className="flex items-center gap-2 rounded-xl hover:neon-glow transition-all duration-300 data-[state=active]:bg-primary/20 data-[state=active]:text-primary px-4 py-2 text-sm font-medium"
            >
              <BarChart3 className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="aging" 
              className="flex items-center gap-2 rounded-xl hover:neon-glow transition-all duration-300 data-[state=active]:bg-primary/20 data-[state=active]:text-primary px-4 py-2 text-sm font-medium"
            >
              <Clock className="w-4 h-4" />
              Aging Analysis
            </TabsTrigger>
            <TabsTrigger 
              value="performance" 
              className="flex items-center gap-2 rounded-xl hover:neon-glow transition-all duration-300 data-[state=active]:bg-primary/20 data-[state=active]:text-primary px-4 py-2 text-sm font-medium"
            >
              <Activity className="w-4 h-4" />
              Performance
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="space-y-6">
              <KPICardsGrid kpiCards={kpiCards} />
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ReceivablesTrendChart chartData={chartData} />
                <KeyMetricsSummary summaryMetrics={summaryMetrics} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="aging" className="mt-6">
            <div className="space-y-6">
              <AgingKPICards stats={stats} />
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AgingPieChart chartData={chartData} />
                <AgingBarChart chartData={chartData} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="mt-6">
            <div className="space-y-6">
              <RiskFunnelChart chartData={chartData} />
              <CommunicationPerformanceChart chartData={chartData} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CollectionsOverview;