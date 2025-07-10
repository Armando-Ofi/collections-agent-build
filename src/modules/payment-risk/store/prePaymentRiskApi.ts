
import { baseApi } from "@/core/api/apiClient";
import type { 
  PrePaymentRiskAnalysis, 
  PrePaymentRiskStats, 
  PrePaymentRiskFilters, 
  CreatePrePaymentRiskRequest, 
  UpdatePrePaymentRiskRequest 
} from '../types';

const ENDPOINTS = {
  RISK_ANALYSIS: '/invoices/?type=ontime',
  RISK_ANALYSIS_BY_ID: (id: number) => `/risk-analysis/${id}`,
  RISK_STATS: '/invoices-kpi/',
  RISK_ANALYTICS: '/risk-analysis/analytics',
  RISK_EXPORT: '/risk-analysis/export',
  RISK_IMPORT: '/risk-analysis/import',
  RISK_BULK_UPDATE: '/risk-analysis/bulk-update',
  RISK_BULK_DELETE: '/risk-analysis/bulk-delete',
  UPDATE_PAYMENT_PLAN: (id: number) => `/risk-analysis/${id}/payment-plan`,
  OVERDUE_ACCOUNTS: '/invoices/?type=overdue',
  GENERATE_RECOMMENDATIONS: (id: number) => `/risk-analysis/${id}/recommendations`,
} as const;

// Interfaces del backend
export interface RiskAnalysisBackendResponse {
  id: number;
  customer_name: string;
  customer_company: string;
  invoice_amount: number;
  due_date: string;
  risk_score: number;
  suggested_payment_plan: string;
  payment_history: string;
  credit_limit: number;
  contact_info: string;
  invoice_number: string;
  created_at: string;
  updated_at: string;
  days_overdue?: number;
  previous_payments: number;
  contract_terms: string;
  risk_level: string;
  is_overdue: boolean;
  probability_to_pay: number;
  payment_plan_status: string;
}



export interface RiskStatsBackendResponse {
  on_time_total_invoices: number;
  on_time_total_amount: number;
  on_time_average_risk_score: number;
  high_risk_count: number;
  //active_invoices: number;
  //active_amount: number;
  //active_avg_risk: number;
  overdue_total_invoices: number;
  overdue_total_amount: number;
  overdue_average_risk_score: number;
  overdue_total_critical_invoices: number;
  conversion_rate: number;
  collection_efficiency: number;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: Record<string, string[]>;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Función para transformar respuesta del backend a nuestro formato
function transformRiskAnalysis(backendData: RiskAnalysisBackendResponse): PrePaymentRiskAnalysis {
  return {
    id: backendData.id,
    customer: backendData.customer_name,
    customer_company: backendData.customer_company,
    invoice_amount: backendData.invoice_amount,
    due_date: backendData.due_date,
    risk_score: backendData.risk_score,
    suggested_payment_plan: backendData.suggested_payment_plan,
    payment_history: backendData.payment_history,
    credit_limit: backendData.credit_limit,
    contact_info: backendData.contact_info,
    invoice_number: backendData.invoice_number,
    created_at: backendData.created_at,
    days_overdue: backendData.days_overdue,
    previous_payments: backendData.previous_payments,
    contract_terms: backendData.contract_terms,
  };
}

// Función para transformar stats del backend
function transformRiskStats(backendStats: RiskStatsBackendResponse): PrePaymentRiskStats {
  return {
    totalInvoices: backendStats.on_time_total_invoices,
    totalAmount: backendStats.on_time_total_amount,
    averageRiskScore: backendStats.on_time_average_risk_score,
    highRiskCount: backendStats.high_risk_count,
    //activeInvoices: backendStats.active_invoices,
    //activeAmount: backendStats.active_amount,
    //activeAvgRisk: backendStats.active_avg_risk,
    overdueCount: backendStats.overdue_total_invoices,
    overdueAmount: backendStats.overdue_total_amount,
    overdueAvgRisk: backendStats.overdue_average_risk_score,
    criticalOverdue: backendStats.overdue_total_critical_invoices,
  };
}

// Extender la API base con endpoints específicos de risk analysis
export const prePaymentRiskApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ========================================================================
    // GET ENDPOINTS
    // ========================================================================
    
    // GET /api/risk-analysis - Lista paginada con filtros
    getRiskAnalyses: builder.query<PrePaymentRiskAnalysis[], PrePaymentRiskFilters>({
      query: (filters = {}) => ({
        url: ENDPOINTS.RISK_ANALYSIS,
        params: {
          search: filters.search,
          riskLevel: filters.riskLevel,
          status: filters.status,
          dateRange: filters.dateRange,
          page: filters.page || 1,
          limit: filters.limit || 50,
        },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'RiskAnalysis' as const, id })),
              { type: 'RiskAnalysis', id: 'LIST' },
            ]
          : [{ type: 'RiskAnalysis', id: 'LIST' }],
    }),

    // GET /api/risk-analysis/overdue - Cuentas vencidas
    getOverdueAccounts: builder.query<PrePaymentRiskAnalysis[], PrePaymentRiskFilters>({
      query: (filters = {}) => ({
        url: ENDPOINTS.OVERDUE_ACCOUNTS,
        params: {
          search: filters.search,
          dateRange: filters.dateRange,
          page: filters.page || 1,
          limit: filters.limit || 50,
        },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'RiskAnalysis' as const, id })),
              { type: 'RiskAnalysis', id: 'OVERDUE' },
            ]
          : [{ type: 'RiskAnalysis', id: 'OVERDUE' }],
    }),

    // GET /api/risk-analysis/:id - Análisis individual
    getRiskAnalysis: builder.query<PrePaymentRiskAnalysis, number>({
      query: (id) => ENDPOINTS.RISK_ANALYSIS_BY_ID(id),
      providesTags: (result, error, id) => [{ type: 'RiskAnalysis', id }],
      transformResponse: (response: ApiResponse<RiskAnalysisBackendResponse>) => 
        transformRiskAnalysis(response.data),
    }),

    // GET /api/risk-analysis/stats - Estadísticas
    getRiskStats: builder.query<PrePaymentRiskStats, void>({
      query: () => ENDPOINTS.RISK_STATS,
      providesTags: [{ type: 'RiskAnalysis', id: 'STATS' }],
      transformResponse: (response: RiskStatsBackendResponse) => 
        transformRiskStats(response),
    }),

    // GET /api/risk-analysis/analytics - Analytics avanzados
    getRiskAnalytics: builder.query<any, { dateRange?: string; groupBy?: string }>({
      query: (params) => ({
        url: ENDPOINTS.RISK_ANALYTICS,
        params,
      }),
      providesTags: [{ type: 'RiskAnalysis', id: 'ANALYTICS' }],
    }),

    // GET /api/risk-analysis/:id/recommendations - Recomendaciones AI
    getRecommendations: builder.query<any, number>({
      query: (id) => ENDPOINTS.GENERATE_RECOMMENDATIONS(id),
      providesTags: (result, error, id) => [{ type: 'RiskAnalysis', id: `${id}-RECOMMENDATIONS` }],
    }),

    // ========================================================================
    // POST ENDPOINTS
    // ========================================================================

    // POST /api/risk-analysis - Crear nuevo análisis
    createRiskAnalysis: builder.mutation<PrePaymentRiskAnalysis, CreatePrePaymentRiskRequest>({
      query: (newAnalysis) => ({
        url: ENDPOINTS.RISK_ANALYSIS,
        method: 'POST',
        body: newAnalysis,
      }),
      invalidatesTags: [
        { type: 'RiskAnalysis', id: 'LIST' },
        { type: 'RiskAnalysis', id: 'STATS' },
        { type: 'RiskAnalysis', id: 'ANALYTICS' },
      ],
      transformResponse: (response: RiskAnalysisBackendResponse) => 
        transformRiskAnalysis(response),
    }),

    // POST /api/risk-analysis/import - Importar análisis masivamente
    importRiskAnalyses: builder.mutation<{ imported: number; errors: any[] }, FormData>({
      query: (formData) => ({
        url: ENDPOINTS.RISK_IMPORT,
        method: 'POST',
        body: formData,
        formData: true,
      }),
      invalidatesTags: [
        { type: 'RiskAnalysis', id: 'LIST' },
        { type: 'RiskAnalysis', id: 'STATS' },
        { type: 'RiskAnalysis', id: 'OVERDUE' },
      ],
    }),

    // ========================================================================
    // PUT/PATCH ENDPOINTS
    // ========================================================================

    // PATCH /api/risk-analysis/:id - Actualizar análisis
    updateRiskAnalysis: builder.mutation<PrePaymentRiskAnalysis, UpdatePrePaymentRiskRequest>({
      query: ({ id, ...patch }) => ({
        url: ENDPOINTS.RISK_ANALYSIS_BY_ID(id),
        method: 'PATCH',
        body: patch,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'RiskAnalysis', id },
        { type: 'RiskAnalysis', id: 'LIST' },
        { type: 'RiskAnalysis', id: 'STATS' },
        { type: 'RiskAnalysis', id: 'OVERDUE' },
      ],
      transformResponse: (response: RiskAnalysisBackendResponse) => 
        transformRiskAnalysis(response),
    }),

    // PATCH /api/risk-analysis/:id/payment-plan - Actualizar plan de pago
    updatePaymentPlan: builder.mutation<PrePaymentRiskAnalysis, { id: number; plan: string }>({
      query: ({ id, plan }) => ({
        url: ENDPOINTS.UPDATE_PAYMENT_PLAN(id),
        method: 'PATCH',
        body: { suggested_payment_plan: plan },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'RiskAnalysis', id },
        { type: 'RiskAnalysis', id: 'LIST' },
        { type: 'RiskAnalysis', id: 'STATS' },
        { type: 'RiskAnalysis', id: 'OVERDUE' },
      ],
      transformResponse: (response: RiskAnalysisBackendResponse) => 
        transformRiskAnalysis(response),
    }),

    // PATCH /api/risk-analysis/bulk-update - Actualización masiva
    bulkUpdateRiskAnalyses: builder.mutation<{ updated: number }, { ids: number[]; updates: Partial<PrePaymentRiskAnalysis> }>({
      query: ({ ids, updates }) => ({
        url: ENDPOINTS.RISK_BULK_UPDATE,
        method: 'PATCH',
        body: { ids, updates },
      }),
      invalidatesTags: [
        { type: 'RiskAnalysis', id: 'LIST' },
        { type: 'RiskAnalysis', id: 'STATS' },
        { type: 'RiskAnalysis', id: 'OVERDUE' },
      ],
    }),

    // ========================================================================
    // DELETE ENDPOINTS
    // ========================================================================

    // DELETE /api/risk-analysis/:id - Eliminar análisis
    deleteRiskAnalysis: builder.mutation<void, number>({
      query: (id) => ({
        url: ENDPOINTS.RISK_ANALYSIS_BY_ID(id),
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'RiskAnalysis', id },
        { type: 'RiskAnalysis', id: 'LIST' },
        { type: 'RiskAnalysis', id: 'STATS' },
        { type: 'RiskAnalysis', id: 'OVERDUE' },
      ],
    }),

    // DELETE /api/risk-analysis/bulk-delete - Eliminación masiva
    bulkDeleteRiskAnalyses: builder.mutation<{ deleted: number }, number[]>({
      query: (ids) => ({
        url: ENDPOINTS.RISK_BULK_DELETE,
        method: 'DELETE',
        body: { ids },
      }),
      invalidatesTags: [
        { type: 'RiskAnalysis', id: 'LIST' },
        { type: 'RiskAnalysis', id: 'STATS' },
        { type: 'RiskAnalysis', id: 'OVERDUE' },
      ],
    }),

    // ========================================================================
    // ENDPOINTS ESPECIALES
    // ========================================================================

    // GET /api/risk-analysis/export - Exportar análisis
    exportRiskAnalyses: builder.mutation<Blob, PrePaymentRiskFilters>({
      query: (filters) => ({
        url: ENDPOINTS.RISK_EXPORT,
        params: filters,
        responseHandler: (response) => response.blob(),
      }),
    }),
  }),
  overrideExisting: false,
});

// ============================================================================
// CONFIGURACIÓN DE CACHE
// ============================================================================

export const RISK_ANALYSIS_CACHE_CONFIG = {
  analyses: 60 * 5, // 5 minutos
  stats: 60 * 2, // 2 minutos
  analytics: 60 * 10, // 10 minutos
  recommendations: 60 * 15, // 15 minutos
} as const;

// ============================================================================
// HOOKS EXPORTADOS PARA USAR EN COMPONENTES
// ============================================================================

export const {
  // Queries
  useGetRiskAnalysesQuery,
  useGetOverdueAccountsQuery,
  useGetRiskAnalysisQuery,
  useGetRiskStatsQuery,
  useGetRiskAnalyticsQuery,
  useGetRecommendationsQuery,
  
  // Mutations
  useCreateRiskAnalysisMutation,
  useUpdateRiskAnalysisMutation,
  useUpdatePaymentPlanMutation,
  useDeleteRiskAnalysisMutation,
  useBulkUpdateRiskAnalysesMutation,
  useBulkDeleteRiskAnalysesMutation,
  useImportRiskAnalysesMutation,
  useExportRiskAnalysesMutation,
  
  // Lazy queries
  useLazyGetRiskAnalysesQuery,
  useLazyGetOverdueAccountsQuery,
  useLazyGetRiskAnalysisQuery,
} = prePaymentRiskApi;