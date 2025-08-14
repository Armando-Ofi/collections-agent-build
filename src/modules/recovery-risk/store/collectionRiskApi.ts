import { baseApi } from "@/core/api/apiClient";
import type { 
  PrePaymentRiskAnalysis, 
  PrePaymentRiskStats, 
  PrePaymentRiskFilters, 
  CreatePrePaymentRiskRequest, 
  UpdatePrePaymentRiskRequest 
} from '../types';

const ENDPOINTS = {
  COLLECTION_ANALYSIS: '/invoices/?collection=true',
  COLLECTION_ANALYSIS_BY_ID: (id: number) => `/invoices/${id}?customer=yes&collection=true`,
  COLLECTION_STATS: '/kpi/invoices/high-overdue-summary',
  COLLECTION_ANALYTICS: '/risk-analysis/analytics',
  COLLECTION_EXPORT: '/risk-analysis/export',
  COLLECTION_IMPORT: '/risk-analysis/import',
  RISK_BULK_UPDATE: '/risk-analysis/bulk-update',
  RISK_BULK_DELETE: '/risk-analysis/bulk-delete',
  UPDATE_PAYMENT_PLAN: (id: number) => `/risk-analysis/${id}/payment-plan`,
  OVERDUE_ACCOUNTS: '/invoices/?type=overdue',
  GENERATE_RECOMMENDATIONS: (id: number) => `/risk-analysis/${id}/recommendations`,
} as const;

// Interfaces del backend
export interface CollectionAnalysisBackendResponse {
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

export interface CollectionStatsBackendResponse {
  total_invoices: number;
  total_outstanding: number;
  avg_recovery_percentage: number;
  legal_ready_count: number;
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
function transCollectionRiskAnalysis(backendData: CollectionAnalysisBackendResponse): PrePaymentRiskAnalysis {
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
function transformCollectionRiskStats(backendStats: CollectionStatsBackendResponse): PrePaymentRiskStats {
  return {
    totalInvoices: backendStats.total_invoices,
    total_outstanding: backendStats.total_outstanding,
    avg_recovery_percentage: backendStats.avg_recovery_percentage,
    legal_ready_count: backendStats.legal_ready_count,
  };
}

// Extender la API base con endpoints específicos de Collection risk analysis
export const CollectionRiskApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ========================================================================
    // GET ENDPOINTS - COLLECTION SPECIFIC
    // ========================================================================
    
    // ✅ Nombres únicos para evitar conflictos
    getCollectionAnalyses: builder.query<PrePaymentRiskAnalysis[], PrePaymentRiskFilters>({
      query: (filters = {}) => ({
        url: ENDPOINTS.COLLECTION_ANALYSIS,
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
              ...result.map(({ id }) => ({ type: 'CollectionAnalysis' as const, id })),
              { type: 'CollectionAnalysis', id: 'LIST' },
            ]
          : [{ type: 'CollectionAnalysis', id: 'LIST' }],
    }),

    getCollectionOverdueAccounts: builder.query<PrePaymentRiskAnalysis[], PrePaymentRiskFilters>({
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
              ...result.map(({ id }) => ({ type: 'CollectionAnalysis' as const, id })),
              { type: 'CollectionAnalysis', id: 'OVERDUE' },
            ]
          : [{ type: 'CollectionAnalysis', id: 'OVERDUE' }],
    }),

    getCollectionAnalysis: builder.query<PrePaymentRiskAnalysis, number>({
      query: (id) => ENDPOINTS.COLLECTION_ANALYSIS_BY_ID(id),
      providesTags: (result, error, id) => [{ type: 'CollectionAnalysis', id }],
      transformResponse: (response: ApiResponse<CollectionAnalysisBackendResponse>) => 
        transCollectionRiskAnalysis(response.data),
    }),

    // ✅ Nombre único para stats de Collection
    getCollectionStats: builder.query<PrePaymentRiskStats, void>({
      query: () => ENDPOINTS.COLLECTION_STATS,
      providesTags: [{ type: 'CollectionAnalysis', id: 'STATS' }],
      transformResponse: (response: CollectionStatsBackendResponse) => 
        transformCollectionRiskStats(response),
    }),

    getCollectionAnalytics: builder.query<any, { dateRange?: string; groupBy?: string }>({
      query: (params) => ({
        url: ENDPOINTS.COLLECTION_ANALYTICS,
        params,
      }),
      providesTags: [{ type: 'CollectionAnalysis', id: 'ANALYTICS' }],
    }),

    getCollectionRecommendations: builder.query<any, number>({
      query: (id) => ENDPOINTS.GENERATE_RECOMMENDATIONS(id),
      providesTags: (result, error, id) => [{ type: 'CollectionAnalysis', id: `${id}-RECOMMENDATIONS` }],
    }),

    // ========================================================================
    // POST ENDPOINTS
    // ========================================================================

    createCollectionAnalysis: builder.mutation<PrePaymentRiskAnalysis, CreatePrePaymentRiskRequest>({
      query: (newAnalysis) => ({
        url: ENDPOINTS.COLLECTION_ANALYSIS,
        method: 'POST',
        body: newAnalysis,
      }),
      invalidatesTags: [
        { type: 'CollectionAnalysis', id: 'LIST' },
        { type: 'CollectionAnalysis', id: 'STATS' },
        { type: 'CollectionAnalysis', id: 'ANALYTICS' },
      ],
      transformResponse: (response: CollectionAnalysisBackendResponse) => 
        transCollectionRiskAnalysis(response),
    }),

    importCollectionAnalyses: builder.mutation<{ imported: number; errors: any[] }, FormData>({
      query: (formData) => ({
        url: ENDPOINTS.COLLECTION_IMPORT,
        method: 'POST',
        body: formData,
        formData: true,
      }),
      invalidatesTags: [
        { type: 'CollectionAnalysis', id: 'LIST' },
        { type: 'CollectionAnalysis', id: 'STATS' },
        { type: 'CollectionAnalysis', id: 'OVERDUE' },
      ],
    }),

    // ========================================================================
    // PUT/PATCH ENDPOINTS
    // ========================================================================

    updateCollectionAnalysis: builder.mutation<PrePaymentRiskAnalysis, UpdatePrePaymentRiskRequest>({
      query: ({ id, ...patch }) => ({
        url: ENDPOINTS.COLLECTION_ANALYSIS_BY_ID(id),
        method: 'PATCH',
        body: patch,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'CollectionAnalysis', id },
        { type: 'CollectionAnalysis', id: 'LIST' },
        { type: 'CollectionAnalysis', id: 'STATS' },
        { type: 'CollectionAnalysis', id: 'OVERDUE' },
      ],
      transformResponse: (response: CollectionAnalysisBackendResponse) => 
        transCollectionRiskAnalysis(response),
    }),

    updateCollectionPaymentPlan: builder.mutation<PrePaymentRiskAnalysis, { id: number; plan: string }>({
      query: ({ id, plan }) => ({
        url: ENDPOINTS.UPDATE_PAYMENT_PLAN(id),
        method: 'PATCH',
        body: { suggested_payment_plan: plan },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'CollectionAnalysis', id },
        { type: 'CollectionAnalysis', id: 'LIST' },
        { type: 'CollectionAnalysis', id: 'STATS' },
        { type: 'CollectionAnalysis', id: 'OVERDUE' },
      ],
      transformResponse: (response: CollectionAnalysisBackendResponse) => 
        transCollectionRiskAnalysis(response),
    }),

    bulkUpdateCollectionAnalyses: builder.mutation<{ updated: number }, { ids: number[]; updates: Partial<PrePaymentRiskAnalysis> }>({
      query: ({ ids, updates }) => ({
        url: ENDPOINTS.RISK_BULK_UPDATE,
        method: 'PATCH',
        body: { ids, updates },
      }),
      invalidatesTags: [
        { type: 'CollectionAnalysis', id: 'LIST' },
        { type: 'CollectionAnalysis', id: 'STATS' },
        { type: 'CollectionAnalysis', id: 'OVERDUE' },
      ],
    }),

    // ========================================================================
    // DELETE ENDPOINTS
    // ========================================================================

    deleteCollectionAnalysis: builder.mutation<void, number>({
      query: (id) => ({
        url: ENDPOINTS.COLLECTION_ANALYSIS_BY_ID(id),
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'CollectionAnalysis', id },
        { type: 'CollectionAnalysis', id: 'LIST' },
        { type: 'CollectionAnalysis', id: 'STATS' },
        { type: 'CollectionAnalysis', id: 'OVERDUE' },
      ],
    }),

    bulkDeleteCollectionAnalyses: builder.mutation<{ deleted: number }, number[]>({
      query: (ids) => ({
        url: ENDPOINTS.RISK_BULK_DELETE,
        method: 'DELETE',
        body: { ids },
      }),
      invalidatesTags: [
        { type: 'CollectionAnalysis', id: 'LIST' },
        { type: 'CollectionAnalysis', id: 'STATS' },
        { type: 'CollectionAnalysis', id: 'OVERDUE' },
      ],
    }),

    // ========================================================================
    // ENDPOINTS ESPECIALES
    // ========================================================================

    exportCollectionAnalyses: builder.mutation<Blob, PrePaymentRiskFilters>({
      query: (filters) => ({
        url: ENDPOINTS.COLLECTION_EXPORT,
        params: filters,
        responseHandler: (response) => response.blob(),
      }),
    }),
  }),
  overrideExisting: false,
});

// ============================================================================
// HOOKS EXPORTADOS CON NOMBRES ÚNICOS
// ============================================================================

export const {
  // Queries - Collection specific
  useGetCollectionAnalysesQuery,
  useGetCollectionOverdueAccountsQuery,
  useGetCollectionAnalysisQuery,
  useGetCollectionStatsQuery, // ✅ Nombre único
  useGetCollectionAnalyticsQuery,
  useGetCollectionRecommendationsQuery,
  
  // Mutations - Collection specific
  useCreateCollectionAnalysisMutation,
  useUpdateCollectionAnalysisMutation,
  useUpdateCollectionPaymentPlanMutation,
  useDeleteCollectionAnalysisMutation,
  useBulkUpdateCollectionAnalysesMutation,
  useBulkDeleteCollectionAnalysesMutation,
  useImportCollectionAnalysesMutation,
  useExportCollectionAnalysesMutation,
  
  // Lazy queries - Collection specific
  useLazyGetCollectionAnalysesQuery,
  useLazyGetCollectionOverdueAccountsQuery,
  useLazyGetCollectionAnalysisQuery,
} = CollectionRiskApi;