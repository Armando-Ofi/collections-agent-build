// types/collections.ts

export interface CollectionsFilters {
  dateRange?: string;
  riskLevel?: 'low' | 'medium' | 'high' | 'critical';
  agingBucket?: 'current' | '1-30' | '31-60' | '61-90' | '90+';
  refresh?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface TrendData {
  label: string;
  amount: number;
  tooltip: any;
}

export interface AgingData {
  label: string;
  amount: number;
  tooltip: {
    label: string;
    amount: number;
  };
}

export interface RiskFunnelData {
  label: string;
  amount: number;
  tooltip: any;
}

export interface CommunicationRateData {
  channel: string;
  rate: number;
}

export interface AverageDaysDelinquent {
  current_value: number;
  change_last_30_days: number;
}

// Respuesta principal del KPI endpoint
export interface CollectionsKPIResponse {
  onTimeInvoices: number;
  onTimeAmount: number;
  onTimeAverageRisk: number;
  overdueInvoices: number;
  overdueAmount: number;
  overdueAverageRisk: number;
  criticalInvoices: number;
  receivableTrend: TrendData[];
  agingBreakdown: AgingData[];
  currentReceivables: number;
  arTurnover: number;
  daysSalesOutstanding: number;
  averageDaysDelinquent: AverageDaysDelinquent;
  riskFunnel: RiskFunnelData[];
  communicationRates: CommunicationRateData[];
  costPerDollarCollected: string;
}

// Stats calculadas para los KPIs
export interface CollectionsKPIStats {
  totalInvoices: number;
  totalAmount: number;
  onTimeInvoices: number;
  onTimeAmount: number;
  overdueInvoices: number;
  overdueAmount: number;
  criticalInvoices: number;
  averageRiskScore: number;
  currentReceivables: number;
  arTurnover: number;
  daysSalesOutstanding: number;
  averageDaysDelinquent: AverageDaysDelinquent;
  collectionEfficiency: number;
  conversionRate: number;
}

// Tipos para alertas
export interface CollectionsAlert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  value: number;
  threshold: number;
  timestamp: string;
  actionRequired: boolean;
}

// Tipos para KPI Cards
export interface CollectionsKPICard {
  title: string;
  value: string;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
  icon: React.ReactNode;
  description: string;
  format?: 'currency' | 'percentage' | 'number' | 'days';
}

// Tipos para gráficos procesados
export interface CollectionsChartData {
  receivableTrend: {
    month: string;
    amount: number;
    formattedAmount: string;
  }[];
  agingBreakdown: {
    name: string;
    amount: number;
    count: number;
    percentage: number;
    formattedAmount: string;
    color: string;
  }[];
  riskFunnel: {
    name: string;
    amount: number;
    percentage: number;
    formattedAmount: string;
    color: string;
  }[];
  communicationRates: {
    channel: string;
    rate: number;
    formattedRate: string;
  }[];
}

// Tipos para métricas de resumen
export interface CollectionsSummaryMetrics {
  totalInvoices: string;
  totalAmount: string;
  overduePercentage: string;
  collectionEfficiency: string;
  dso: string;
  arTurnover: string;
  averageDaysDelinquent: string;
  criticalInvoices: string;
  onTimeRate: string;
  avgRiskScore: string;
}

// Tipos para análisis de tendencias
export interface CollectionsTrendAnalysis {
  receivableTrend: {
    change: number;
    trend: 'up' | 'down' | 'neutral';
    direction: string;
  };
  collectionRate: {
    current: number;
    change: number;
    trend: 'up' | 'down' | 'neutral';
  };
  dsoTrend: {
    current: number;
    change: number;
    trend: 'up' | 'down' | 'neutral';
  };
}

// Tipos para configuración de dashboard
export interface CollectionsDashboardConfig {
  refreshInterval: number;
  enableNotifications: boolean;
  enableAutoRefresh: boolean;
  defaultDateRange: string;
  alertThresholds: {
    dso: number;
    criticalInvoices: number;
    arTurnover: number;
    collectionEfficiency: number;
  };
}

// Tipos para requests de creación/actualización
export interface CreateCollectionsRequest {
  dateRange?: string;
  filters?: CollectionsFilters;
}

export interface UpdateCollectionsRequest {
  id: string;
  filters?: CollectionsFilters;
  config?: Partial<CollectionsDashboardConfig>;
}