// store/collectionsApi.ts

import { baseApi } from "@/core/api/apiClient";
import type { 
  CollectionsKPIResponse, 
  CollectionsKPIStats, 
  CollectionsFilters
} from '../types';

const ENDPOINTS = {
  COLLECTIONS_KPI: '/kpi/invoices/',
} as const;

// Interfaces del backend (basadas en tu JSON real)
export interface CollectionsKPIBackendResponse {
  on_time_total_invoices: number;
  on_time_total_amount: number;
  on_time_average_risk_score: number;
  overdue_total_invoices: number;
  overdue_total_amount: number;
  overdue_average_risk_score: number;
  overdue_total_critical_invoices: number;
  total_receivable_trend: Array<{
    label: string;
    amount: number;
    tooltip: null;
  }>;
  accounts_receivable_aging: Array<{
    label: string;
    amount: number;
    tooltip: {
      label: string;
      amount: number;
    };
  }>;
  current_accounts_receivable: number;
  ar_turnover: number;
  days_sales_outstanding: number;
  average_days_delinquent: {
    current_value: number;
    change_last_30_days: number;
  };
  risk_funnel: Array<{
    label: string;
    amount: number;
    tooltip: null;
  }>;
  communication_response_rate: Array<{
    channel: string;
    rate: number;
  }>;
  cost_per_dollar_collected: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: Record<string, string[]>;
}

// Función para transformar respuesta del backend a nuestro formato
function transformCollectionsKPI(backendData: CollectionsKPIBackendResponse): CollectionsKPIResponse {
  return {
    onTimeInvoices: backendData.on_time_total_invoices,
    onTimeAmount: backendData.on_time_total_amount,
    onTimeAverageRisk: backendData.on_time_average_risk_score,
    overdueInvoices: backendData.overdue_total_invoices,
    overdueAmount: backendData.overdue_total_amount,
    overdueAverageRisk: backendData.overdue_average_risk_score,
    criticalInvoices: backendData.overdue_total_critical_invoices,
    receivableTrend: backendData.total_receivable_trend,
    agingBreakdown: backendData.accounts_receivable_aging,
    currentReceivables: backendData.current_accounts_receivable,
    arTurnover: backendData.ar_turnover,
    daysSalesOutstanding: backendData.days_sales_outstanding,
    averageDaysDelinquent: backendData.average_days_delinquent,
    riskFunnel: backendData.risk_funnel,
    communicationRates: backendData.communication_response_rate,
    costPerDollarCollected: backendData.cost_per_dollar_collected,
  };
}

// Función para transformar stats del backend
function transformCollectionsStats(backendData: CollectionsKPIBackendResponse): CollectionsKPIStats {
  return {
    totalInvoices: backendData.on_time_total_invoices + backendData.overdue_total_invoices,
    totalAmount: backendData.on_time_total_amount + backendData.overdue_total_amount,
    onTimeInvoices: backendData.on_time_total_invoices,
    onTimeAmount: backendData.on_time_total_amount,
    overdueInvoices: backendData.overdue_total_invoices,
    overdueAmount: backendData.overdue_total_amount,
    criticalInvoices: backendData.overdue_total_critical_invoices,
    averageRiskScore: backendData.overdue_average_risk_score,
    currentReceivables: backendData.current_accounts_receivable,
    arTurnover: backendData.ar_turnover,
    daysSalesOutstanding: backendData.days_sales_outstanding,
    averageDaysDelinquent: backendData.average_days_delinquent,
    collectionEfficiency: 0, // Se calculará en el servicio
    conversionRate: 0, // Se calculará en el servicio
  };
}

// Extender la API base con endpoints específicos de collections
export const collectionsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ========================================================================
    // GET ENDPOINTS
    // ========================================================================
    
    // GET /invoices-kpi/ - KPIs principales (único endpoint real)
    getCollectionsKPI: builder.query<CollectionsKPIResponse, CollectionsFilters>({
      query: (filters = {}) => ({
        url: ENDPOINTS.COLLECTIONS_KPI,
        // Solo incluir parámetros si el endpoint los soporta
        params: filters.refresh ? { refresh: filters.refresh } : undefined,
      }),
      providesTags: [{ type: 'Collections', id: 'KPI' }],
      transformResponse: (response: CollectionsKPIBackendResponse) => 
        transformCollectionsKPI(response),
    }),

    // GET /invoices-kpi/ - Stats (mismo endpoint, diferente transformación)
    getCollectionsStats: builder.query<CollectionsKPIStats, void>({
      query: () => ENDPOINTS.COLLECTIONS_KPI,
      providesTags: [{ type: 'Collections', id: 'STATS' }],
      transformResponse: (response: CollectionsKPIBackendResponse) => 
        transformCollectionsStats(response),
    }),
  }),
  overrideExisting: false,
});

// ============================================================================
// CONFIGURACIÓN DE CACHE
// ============================================================================

export const COLLECTIONS_CACHE_CONFIG = {
  kpi: 60 * 2, // 2 minutos
  stats: 60 * 2, // 2 minutos
} as const;

// ============================================================================
// HOOKS EXPORTADOS PARA USAR EN COMPONENTES
// ============================================================================

export const {
  // Queries
  useGetCollectionsKPIQuery,
  useGetCollectionsStatsQuery,
  
  // Lazy queries
  useLazyGetCollectionsKPIQuery,
  useLazyGetCollectionsStatsQuery,
} = collectionsApi;