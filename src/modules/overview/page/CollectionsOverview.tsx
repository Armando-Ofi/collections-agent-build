import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import {
  AlertTriangle,
  DollarSign,
  TrendingUp,
  Clock,
  RefreshCw,
  Download,
  Activity,
  BarChart3,
  Target,
  Bell,
  Users,
  CreditCard,
  Info,
  Sparkles,
} from "lucide-react";
import { cn } from '@/shared/lib/utils';

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// Hooks and Services
import { useCollections } from '../hooks/useCollections';
import { CollectionsService } from '../services/collectionsService';

// Components
import KPICard from "@/shared/components/common/KPICard";
import Error from '@/shared/components/common/Error';

// Custom Tooltip Component
const CustomTooltip = ({ title, content }: { title: string; content: string }) => (
  <div className="group relative inline-block">
    <Info className="w-4 h-4 text-muted-foreground/60 hover:text-primary transition-colors cursor-help" />
    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-popover border border-border text-popover-foreground text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-9999 whitespace-nowrap shadow-2xl backdrop-blur-xl">
      <div className="font-semibold text-foreground">{title}</div>
      <div className="text-muted-foreground mt-1">{content}</div>
      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-popover"></div>
    </div>
  </div>
);

// Theme-responsive tooltip style
const getTooltipStyle = () => ({
  backgroundColor: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "12px",
  color: "hsl(var(--foreground))",
  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
  backdropFilter: "blur(8px)",
});

// Alert Dropdown Component
const AlertDropdown = ({ criticalAlerts }: { criticalAlerts: any[] }) => {
  if (!criticalAlerts || criticalAlerts.length === 0) return null;

  return (
    <div className="relative group">
      <button className="relative p-2 rounded-lg bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
        <Bell className="w-5 h-5 text-red-500" />
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
          {criticalAlerts.length}
        </span>
      </button>
      
      <div className="absolute right-0 top-full mt-2 w-80 bg-card border border-border rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none group-hover:pointer-events-auto z-[9999]">
        <div className="p-3 border-b border-border">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            Critical Alerts
          </h3>
          <p className="text-xs text-muted-foreground">{criticalAlerts.length} active alerts</p>
        </div>
        <div className="max-h-64 overflow-y-auto">
          {criticalAlerts.map((alert) => (
            <div key={alert.id} className="p-3 border-b border-border last:border-b-0 hover:bg-muted/50 transition-colors">
              <div className="flex items-start gap-2">
                <div className="p-1 rounded bg-red-100 dark:bg-red-900/30 mt-0.5">
                  <AlertTriangle className="w-3 h-3 text-red-500" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-sm text-foreground">{alert.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{alert.message}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Header Component
const DashboardHeader = ({ 
  criticalAlerts, 
  isLoading, 
  isRefreshing, 
  isExporting, 
  onRefresh, 
  onExport 
}: {
  criticalAlerts: any[];
  isLoading: boolean;
  isRefreshing: boolean;
  isExporting: boolean;
  onRefresh: () => void;
  onExport: () => void;
}) => (
  <div className="glass-card rounded-2xl p-6 hover-lift">
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-foreground">
              Collections Dashboard
            </h1>
          </div>
        </div>
      </div>
      <div className="flex gap-3">
        <AlertDropdown criticalAlerts={criticalAlerts} />
        
        <Button 
          onClick={onRefresh} 
          variant="secondary" 
          disabled={isLoading || isRefreshing}
          className="glass-card hover-lift hover:neon-glow transition-all duration-300 px-4 py-2"
        >
          <RefreshCw className={cn("w-4 h-4 mr-2", (isLoading || isRefreshing) && "animate-spin")} />
          Refresh
        </Button>
        
        <Button 
          onClick={onExport} 
          variant="outline" 
          disabled={isExporting}
          className="glass-card hover-lift hover:electric-glow transition-all duration-300 px-4 py-2"
        >
          <Download className="w-4 h-4 mr-2" />
          {isExporting ? 'Exporting...' : 'Export'}
        </Button>
      </div>
    </div>
  </div>
);

// KPI Cards Grid Component
const KPICardsGrid = ({ kpiCards }: { kpiCards: any[] }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {kpiCards.map((kpi, index) => (
      <div key={index} className="group relative">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-accent rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-300"></div>
        <div className="relative">
          <KPICard 
            {...kpi} 
            className="glass-card hover-lift hover:neon-glow transition-all duration-300 rounded-2xl p-4 shadow-lg"
          />
        </div>
      </div>
    ))}
  </div>
);

// Receivables Trend Chart Component
const ReceivablesTrendChart = ({ chartData }: { chartData: any }) => (
  <Card className="glass-card hover-lift rounded-2xl overflow-hidden shadow-lg">
    <CardHeader className="bg-gradient-to-r from-blue-50/80 to-blue-100/60 dark:from-blue-900/30 dark:to-blue-800/20 border-b border-border/50 p-4">
      <CardTitle className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/40 shadow-inner">
            <TrendingUp className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">Receivables Trend</h3>
            <p className="text-xs text-muted-foreground">Monthly performance overview</p>
          </div>
        </div>
        <CustomTooltip 
          title="Receivables Trend Analysis" 
          content="Visualizes monthly trends in outstanding receivables to identify patterns and seasonal variations"
        />
      </CardTitle>
    </CardHeader>
    <CardContent className="p-4">
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={chartData?.receivableTrend || []}>
          <defs>
            <linearGradient id="receivableGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground))" opacity={0.3} />
          <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
          <YAxis stroke="hsl(var(--muted-foreground))" />
          <Tooltip
            contentStyle={getTooltipStyle()}
            formatter={(value) => [CollectionsService.formatAmount(value as number), 'Amount']}
          />
          <Area
            type="monotone"
            dataKey="amount"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            fill="url(#receivableGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
);

// Key Metrics Summary Component
const KeyMetricsSummary = ({ summaryMetrics }: { summaryMetrics: any }) => (
  <Card className="glass-card hover-lift rounded-2xl overflow-hidden shadow-lg">
    <CardHeader className="bg-gradient-to-r from-emerald-50/80 to-emerald-100/60 dark:from-emerald-900/30 dark:to-emerald-800/20 border-b border-border/50 p-4">
      <CardTitle className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 shadow-inner">
            <Target className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">Key Metrics</h3>
            <p className="text-xs text-muted-foreground">Performance indicators</p>
          </div>
        </div>
        <CustomTooltip 
          title="Key Performance Metrics" 
          content="Essential KPIs for monitoring accounts receivable effectiveness and efficiency"
        />
      </CardTitle>
    </CardHeader>
    <CardContent className="p-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center space-y-2 p-3 rounded-xl bg-gradient-to-br from-emerald-50/80 to-emerald-100/60 dark:from-emerald-900/30 dark:to-emerald-800/20 shadow-inner">
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {summaryMetrics?.collectionEfficiency || '0%'}
          </div>
          <div className="text-xs text-muted-foreground font-semibold">
            Collection Efficiency
          </div>
        </div>
        <div className="text-center space-y-2 p-3 rounded-xl bg-gradient-to-br from-blue-50/80 to-blue-100/60 dark:from-blue-900/30 dark:to-blue-800/20 shadow-inner">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {summaryMetrics?.arTurnover || '0'}
          </div>
          <div className="text-xs text-muted-foreground font-semibold">
            AR Turnover
          </div>
        </div>
        <div className="text-center space-y-2 p-3 rounded-xl bg-gradient-to-br from-amber-50/80 to-amber-100/60 dark:from-amber-900/30 dark:to-amber-800/20 shadow-inner">
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
            {summaryMetrics?.dso || '0 days'}
          </div>
          <div className="text-xs text-muted-foreground font-semibold">
            DSO
          </div>
        </div>
        <div className="text-center space-y-2 p-3 rounded-xl bg-gradient-to-br from-red-50/80 to-red-100/60 dark:from-red-900/30 dark:to-red-800/20 shadow-inner">
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">
            {summaryMetrics?.averageDaysDelinquent || '0 days'}
          </div>
          <div className="text-xs text-muted-foreground font-semibold">
            Avg Days Delinquent
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

// Aging KPI Cards Component
const AgingKPICards = ({ stats }: { stats: any }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    <Card className="glass-card hover-lift rounded-2xl border-emerald-200/50 dark:border-emerald-800/30 shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Current
        </CardTitle>
        <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 shadow-inner">
          <CreditCard className="w-4 h-4 text-emerald-500" />
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="text-2xl font-bold text-foreground">
          {CollectionsService.formatMoneyCompact(stats?.onTimeAmount || 0)}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {stats?.onTimeInvoices || 0} invoices
        </p>
        <div className="mt-3 h-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full" style={{ width: '75%' }}></div>
        </div>
      </CardContent>
    </Card>

    <Card className="glass-card hover-lift rounded-2xl border-amber-200/50 dark:border-amber-800/30 shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Overdue
        </CardTitle>
        <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/40 shadow-inner">
          <AlertTriangle className="w-4 h-4 text-amber-500" />
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="text-2xl font-bold text-foreground">
          {CollectionsService.formatMoneyCompact(stats?.overdueAmount || 0)}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {stats?.overdueInvoices || 0} invoices
        </p>
        <div className="mt-3 h-2 bg-amber-100 dark:bg-amber-900/30 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-amber-400 to-amber-600 rounded-full" style={{ width: '45%' }}></div>
        </div>
      </CardContent>
    </Card>

    <Card className="glass-card hover-lift rounded-2xl border-red-200/50 dark:border-red-800/30 shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Critical
        </CardTitle>
        <div className="p-2 rounded-xl bg-red-100 dark:bg-red-900/40 shadow-inner">
          <AlertTriangle className="w-4 h-4 text-red-500" />
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="text-2xl font-bold text-red-600">
          {CollectionsService.formatNumber(stats?.criticalInvoices || 0)}
        </div>
        <p className="text-xs text-muted-foreground mt-1">90+ days overdue</p>
        <div className="mt-3 h-2 bg-red-100 dark:bg-red-900/30 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-red-400 to-red-600 rounded-full" style={{ width: '25%' }}></div>
        </div>
      </CardContent>
    </Card>

    <Card className="glass-card hover-lift rounded-2xl border-blue-200/50 dark:border-blue-800/30 shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          DSO
        </CardTitle>
        <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/40 shadow-inner">
          <Clock className="w-4 h-4 text-blue-500" />
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="text-2xl font-bold text-foreground">
          {Math.round(stats?.daysSalesOutstanding || 0)}
        </div>
        <p className="text-xs text-muted-foreground mt-1">days</p>
        <div className="mt-3 h-2 bg-blue-100 dark:bg-blue-900/30 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full" style={{ width: '60%' }}></div>
        </div>
      </CardContent>
    </Card>
  </div>
);

// Aging Pie Chart Component
const AgingPieChart = ({ chartData }: { chartData: any }) => (
  <Card className="glass-card hover-lift rounded-2xl overflow-hidden shadow-lg">
    <CardHeader className="bg-gradient-to-r from-orange-50/80 to-orange-100/60 dark:from-orange-900/30 dark:to-orange-800/20 border-b border-border/50 p-4">
      <CardTitle className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-orange-100 dark:bg-orange-900/40 shadow-inner">
            <Clock className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">Aging Breakdown</h3>
            <p className="text-xs text-muted-foreground">Portfolio distribution</p>
          </div>
        </div>
        <CustomTooltip 
          title="Aging Breakdown Analysis" 
          content="Visual breakdown of receivables portfolio by age categories to identify collection priorities"
        />
      </CardTitle>
    </CardHeader>
    <CardContent className="p-4">
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={chartData?.agingBreakdown || []}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={110}
            paddingAngle={5}
            dataKey="amount"
          >
            {chartData?.agingBreakdown?.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={getTooltipStyle()}
            formatter={(value) => [CollectionsService.formatAmount(value as number), 'Amount']}
          />
        </PieChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
);

// Aging Bar Chart Component
const AgingBarChart = ({ chartData }: { chartData: any }) => (
  <Card className="glass-card hover-lift rounded-2xl overflow-hidden shadow-lg">
    <CardHeader className="bg-gradient-to-r from-violet-50/80 to-violet-100/60 dark:from-violet-900/30 dark:to-violet-800/20 border-b border-border/50 p-4">
      <CardTitle className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-violet-100 dark:bg-violet-900/40 shadow-inner">
            <BarChart3 className="w-5 h-5 text-violet-500" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">Aging Distribution</h3>
            <p className="text-xs text-muted-foreground">Amount by category</p>
          </div>
        </div>
        <CustomTooltip 
          title="Aging Distribution Chart" 
          content="Detailed view of receivables amounts distributed across different aging categories"
        />
      </CardTitle>
    </CardHeader>
    <CardContent className="p-4">
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={chartData?.agingBreakdown || []}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground))" opacity={0.3} />
          <XAxis 
            dataKey="name" 
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis stroke="hsl(var(--muted-foreground))" />
          <Tooltip
            contentStyle={getTooltipStyle()}
            formatter={(value) => [CollectionsService.formatAmount(value as number), 'Amount']}
          />
          <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
            {chartData?.agingBreakdown?.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
);

// Risk Funnel Chart Component
const RiskFunnelChart = ({ chartData }: { chartData: any }) => (
  <Card className="glass-card hover-lift rounded-2xl overflow-hidden shadow-lg">
    <CardHeader className="bg-gradient-to-r from-red-50/80 to-red-100/60 dark:from-red-900/30 dark:to-red-800/20 border-b border-border/50 p-4">
      <CardTitle className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-red-100 dark:bg-red-900/40 shadow-inner">
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">Risk Funnel Analysis</h3>
            <p className="text-xs text-muted-foreground">Progressive risk assessment</p>
          </div>
        </div>
        <CustomTooltip 
          title="Risk Funnel Analysis" 
          content="Progressive risk assessment showing potential collection issues from total receivables to critical accounts"
        />
      </CardTitle>
    </CardHeader>
    <CardContent className="p-4">
      <ResponsiveContainer width="100%" height={350}>
        <BarChart 
          data={chartData?.riskFunnel || []}
          layout="horizontal"
          margin={{ left: 120 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground))" opacity={0.3} />
          <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
          <YAxis type="category" dataKey="name" stroke="hsl(var(--muted-foreground))" />
          <Tooltip
            contentStyle={getTooltipStyle()}
            formatter={(value) => [CollectionsService.formatAmount(value as number), 'Amount']}
          />
          <Bar dataKey="amount" radius={[0, 6, 6, 0]}>
            {chartData?.riskFunnel?.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
);

// Communication Performance Chart Component
const CommunicationPerformanceChart = ({ chartData }: { chartData: any }) => (
  <Card className="glass-card hover-lift rounded-2xl overflow-hidden shadow-lg">
    <CardHeader className="bg-gradient-to-r from-emerald-50/80 to-emerald-100/60 dark:from-emerald-900/30 dark:to-emerald-800/20 border-b border-border/50 p-4">
      <CardTitle className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 shadow-inner">
            <Activity className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">Communication Performance</h3>
            <p className="text-xs text-muted-foreground">Channel effectiveness</p>
          </div>
        </div>
        <CustomTooltip 
          title="Communication Performance Analysis" 
          content="Response rates by communication channel to optimize collection outreach strategies"
        />
      </CardTitle>
    </CardHeader>
    <CardContent className="p-4">
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={chartData?.communicationRates || []}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground))" opacity={0.3} />
          <XAxis dataKey="channel" stroke="hsl(var(--muted-foreground))" />
          <YAxis stroke="hsl(var(--muted-foreground))" />
          <Tooltip
            contentStyle={getTooltipStyle()}
            formatter={(value) => [`${value}%`, 'Response Rate']}
          />
          <Bar dataKey="rate" fill="hsl(var(--accent))" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
);

// Main Component
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
      <div className="space-y-8 p-6">
        <DashboardHeader
          criticalAlerts={criticalAlerts || []}
          isLoading={isLoading}
          isRefreshing={isRefreshing}
          isExporting={isExporting}
          onRefresh={handleRefresh}
          onExport={handleExport}
        />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="glass-card dark:border-white/10 border-gray-200/50 w-full grid grid-cols-3 p-1 rounded-2xl shadow-lg z-10">
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