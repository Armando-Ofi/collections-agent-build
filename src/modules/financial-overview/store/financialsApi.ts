// store/financialsApi.ts

import { baseApi } from "@/core/api/apiClient";
import type { 
  FinancialsKPIResponse, 
  FinancialsKPIStats, 
  FinancialsFilters,
  FinancialsKPIBackendResponse
} from '../types/financials';

const ENDPOINTS = {
  FINANCIALS_KPI: '/kpi/financials/',
} as const;

// ============================================================================
// TRANSFORMACIÓN DE DATOS
// ============================================================================

// Función para transformar respuesta del backend a nuestro formato
function transformFinancialsKPI(backendData: FinancialsKPIBackendResponse): FinancialsKPIResponse {
  return {
    totalPortfolioValue: backendData.total_portfolio_value,
    collectionRate: backendData.collection_rate,
    liquidationRate: backendData.liquidation_rate,
    badDebtWriteOffRate: backendData.bad_debt_write_off_rate,
    daysSalesOutstanding: backendData.days_sales_outstanding,
    portfolioValueTrend: backendData.portfolio_value_trend,
    collectionRateTrend: backendData.collection_rate_trend,
    liquidationRateTrend: backendData.liquidation_rate_trend,
  };
}

// Función para transformar stats del backend
function transformFinancialsStats(backendData: FinancialsKPIBackendResponse): FinancialsKPIStats {
  // Calcular métricas derivadas
  const netCollectionRate = backendData.collection_rate - backendData.bad_debt_write_off_rate;
  const portfolioHealth = Math.max(0, 100 - (backendData.bad_debt_write_off_rate * 100));
  
  // Calcular score de performance basado en métricas clave
  const performanceScore = (
    (backendData.collection_rate * 0.4) +
    (backendData.liquidation_rate * 0.3) +
    ((1 - backendData.bad_debt_write_off_rate) * 0.3)
  ) * 100;

  return {
    totalPortfolioValue: backendData.total_portfolio_value,
    collectionRate: backendData.collection_rate,
    liquidationRate: backendData.liquidation_rate,
    badDebtWriteOffRate: backendData.bad_debt_write_off_rate,
    daysSalesOutstanding: backendData.days_sales_outstanding,
    netCollectionRate,
    portfolioHealth,
    performanceScore,
  };
}

// ============================================================================
// API ENDPOINTS
// ============================================================================

// Extender la API base con endpoints específicos de financials
export const financialsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ========================================================================
    // GET ENDPOINTS
    // ========================================================================
    
    // GET /kpi/financials/ - KPIs financieros principales
    getFinancialsKPI: builder.query<FinancialsKPIResponse, FinancialsFilters>({
      query: (filters = {}) => ({
        url: ENDPOINTS.FINANCIALS_KPI,
        params: filters.refresh ? { refresh: filters.refresh } : undefined,
      }),
      providesTags: [{ type: 'Financials', id: 'KPI' }],
      transformResponse: (response: FinancialsKPIBackendResponse) => 
        transformFinancialsKPI(response),
    }),

    // GET /kpi/financials/ - Stats (mismo endpoint, diferente transformación)
    getFinancialsStats: builder.query<FinancialsKPIStats, void>({
      query: () => ENDPOINTS.FINANCIALS_KPI,
      providesTags: [{ type: 'Financials', id: 'STATS' }],
      transformResponse: (response: FinancialsKPIBackendResponse) => 
        transformFinancialsStats(response),
    }),
  }),
  overrideExisting: false,
});

// ============================================================================
// CONFIGURACIÓN DE CACHE
// ============================================================================

export const FINANCIALS_CACHE_CONFIG = {
  kpi: 60 * 5, // 5 minutos para datos financieros
  stats: 60 * 5, // 5 minutos
} as const;

// ============================================================================
// HOOKS EXPORTADOS PARA USAR EN COMPONENTES
// ============================================================================

export const {
  // Queries
  useGetFinancialsKPIQuery,
  useGetFinancialsStatsQuery,
  
  // Lazy queries
  useLazyGetFinancialsKPIQuery,
  useLazyGetFinancialsStatsQuery,
} = financialsApi;