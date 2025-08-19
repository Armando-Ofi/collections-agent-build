// types/financials.ts

// ============================================================================
// BACKEND RESPONSE INTERFACES
// ============================================================================

export interface FinancialsTrendItem {
  label: string;
  amount: number;
  tooltip: {
    label: string;
    amount: number;
  } | null;
}

export interface FinancialsKPIBackendResponse {
  total_portfolio_value: number;
  collection_rate: number;
  liquidation_rate: number;
  bad_debt_write_off_rate: number;
  days_sales_outstanding: number;
  portfolio_value_trend: FinancialsTrendItem[];
  collection_rate_trend: FinancialsTrendItem[];
  liquidation_rate_trend: FinancialsTrendItem[];
}

// ============================================================================
// FRONTEND DATA INTERFACES
// ============================================================================

export interface FinancialsKPIResponse {
  totalPortfolioValue: number;
  collectionRate: number;
  liquidationRate: number;
  badDebtWriteOffRate: number;
  daysSalesOutstanding: number;
  portfolioValueTrend: FinancialsTrendItem[];
  collectionRateTrend: FinancialsTrendItem[];
  liquidationRateTrend: FinancialsTrendItem[];
}

export interface FinancialsKPIStats {
  totalPortfolioValue: number;
  collectionRate: number;
  liquidationRate: number;
  badDebtWriteOffRate: number;
  daysSalesOutstanding: number;
  netCollectionRate: number;
  portfolioHealth: number;
  performanceScore: number;
}

export interface FinancialsChartData {
  portfolioTrend: Array<{
    month: string;
    value: number;
    formattedValue: string;
  }>;
  collectionTrend: Array<{
    month: string;
    rate: number;
    formattedRate: string;
  }>;
  liquidationTrend: Array<{
    month: string;
    rate: number;
    formattedRate: string;
  }>;
  performanceMetrics: Array<{
    name: string;
    value: number;
    target: number;
    status: 'excellent' | 'good' | 'warning' | 'critical';
    formattedValue: string;
  }>;
}

export interface FinancialsSummaryMetrics {
  portfolioValue: string;
  collectionRate: string;
  liquidationRate: string;
  badDebtRate: string;
  daysOutstanding: string;
  netPerformance: string;
  healthScore: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface FinancialsTrendAnalysis {
  portfolioTrend: {
    change: number;
    trend: 'up' | 'down' | 'neutral';
    direction: 'increasing' | 'decreasing' | 'stable';
  };
  collectionPerformance: {
    current: number;
    change: number;
    trend: 'up' | 'down' | 'neutral';
  };
  liquidationEfficiency: {
    current: number;
    change: number;
    trend: 'up' | 'down' | 'neutral';
  };
}

export interface FinancialsAlert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  value: number;
  threshold: number;
  timestamp: string;
  actionRequired: boolean;
}

export interface FinancialsFilters {
  refresh?: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface FinancialsKPICard {
  title: string;
  value: string;
  change?: number;
  trend: 'up' | 'down' | 'neutral';
  icon: React.ReactNode;
  description: string;
  format: 'currency' | 'percentage' | 'number' | 'days';
  status?: 'excellent' | 'good' | 'warning' | 'critical';
}

export interface FinancialsRecommendation {
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low' | 'recommended';
  actionRequired: boolean;
  impact: 'high' | 'medium' | 'low';
}