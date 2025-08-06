// store/paymentPlansApi.ts

import { baseApi } from "@/core/api/apiClient";
import type { 
  PaymentPlan, 
  PaymentPlanStats, 
  PaymentPlanFilters, 
  CreatePaymentPlanRequest, 
  UpdatePaymentPlanRequest 
} from '../types';

const ENDPOINTS = {
  PAYMENT_PLANS: '/payment-plans/',
  PAYMENT_PLAN_BY_ID: (id: number) => `/payment-plans/${id}/`,
  PAYMENT_PLAN_STATS: '/kpi/payment-plans/',
  PAYMENT_PLAN_ANALYTICS: '/payment-plans/analytics/',
  PAYMENT_PLAN_EXPORT: '/payment-plans/export/',
  UPDATE_PLAN_STATUS: (id: number) => `/payment-plans/${id}/status/`,
  PAYMENT_PLAN_INSTALLMENTS: (id: number) => `/payment-plans/${id}/installments/`,
  BULK_UPDATE_PLANS: '/payment-plans/bulk-update/',
  BULK_DELETE_PLANS: '/payment-plans/bulk-delete/',
} as const;

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

// ✅ Función actualizada con nueva estructura de stats
function calculatePaymentPlanStats(plans: PaymentPlan[]): PaymentPlanStats {
  const totalPlans = plans.length;
  const totalAmount = plans.reduce((sum, plan) => sum + plan.total_amount, 0);
  
  const activePlans = plans.filter(p => p.status === 'Active');
  const activeAmount = activePlans.reduce((sum, plan) => sum + plan.total_amount, 0);
  
  const deniedPlans = plans.filter(p => p.status === 'Denied');
  
  const defaultedPlans = plans.filter(p => p.status === 'Defaulted');
  const defaultedAmount = defaultedPlans.reduce((sum, plan) => sum + plan.total_amount, 0);
  
  const completedPlans = plans.filter(p => p.status === 'Completed');
  
  const averageInstallments = totalPlans > 0 
    ? Math.round(plans.reduce((sum, plan) => sum + plan.installments, 0) / totalPlans)
    : 0;
  
  const totalDiscountAmount = plans.reduce((sum, plan) => sum + plan.discount_amount, 0);
  
  const successRate = totalPlans > 0 ? completedPlans.length / totalPlans : 0;

  // ✅ Devolver la nueva estructura anidada
  return {
    active_plans: {
      total_active_plans: activePlans.length,
      active_amount: activeAmount,
      avg_installments: averageInstallments,
      success_rate: successRate,
    },
    denied_plans: {
      total_denied_plans: deniedPlans.length,
      avg_denied_plans: 0, // Puedes calcular esto según tu lógica de negocio
    },
    defaulted_plans: {
      total_defaulted_plans: defaultedPlans.length,
      defaulted_amount: defaultedAmount,
    },
    total_plans: {
      total_plans: totalPlans,
      total_amount: totalAmount,
      success_rate: successRate,
      total_discounts: totalDiscountAmount,
    },
  };
}

// Extender la API base con endpoints específicos de payment plans
export const paymentPlansApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ========================================================================
    // GET ENDPOINTS
    // ========================================================================
    
    // GET /payment-plans/ - Lista paginada con filtros
    getPaymentPlans: builder.query<PaymentPlan[], PaymentPlanFilters>({
      query: (filters = {}) => ({
        url: ENDPOINTS.PAYMENT_PLANS,
        params: {
          search: filters.search,
          status: filters.status,
          has_discount: filters.hasDiscount,
          date_range: filters.dateRange,
          min_installments: filters.installmentRange?.min,
          max_installments: filters.installmentRange?.max,
          min_amount: filters.amountRange?.min,
          max_amount: filters.amountRange?.max,
          page: filters.page || 1,
          limit: filters.limit || 50,
        },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'PaymentPlan' as const, id })),
              { type: 'PaymentPlan', id: 'LIST' },
            ]
          : [{ type: 'PaymentPlan', id: 'LIST' }],
      transformResponse: (response: PaymentPlan[]) => response,
    }),

    // GET /payment-plans/:id/ - Plan individual
    getPaymentPlan: builder.query<PaymentPlan, number>({
      query: (id) => ENDPOINTS.PAYMENT_PLAN_BY_ID(id),
      providesTags: (result, error, id) => [{ type: 'PaymentPlan', id }],
    }),

    // GET /payment-plans/stats/ - Estadísticas
    getPaymentPlanStats: builder.query<PaymentPlanStats, void>({
      query: () => ENDPOINTS.PAYMENT_PLAN_STATS,
      providesTags: [{ type: 'PaymentPlan', id: 'STATS' }],
      transformResponse: (response: PaymentPlanStats) => response,
    }),

    // GET /payment-plans/analytics/ - Analytics avanzados
    getPaymentPlanAnalytics: builder.query<any, { dateRange?: string; groupBy?: string }>({
      query: (params) => ({
        url: ENDPOINTS.PAYMENT_PLAN_ANALYTICS,
        params,
      }),
      providesTags: [{ type: 'PaymentPlan', id: 'ANALYTICS' }],
    }),

    // GET /payment-plans/:id/installments/ - Cuotas del plan
    getPaymentPlanInstallments: builder.query<any[], number>({
      query: (id) => ENDPOINTS.PAYMENT_PLAN_INSTALLMENTS(id),
      providesTags: (result, error, id) => [{ type: 'PaymentPlan', id: `${id}-INSTALLMENTS` }],
    }),

    // ========================================================================
    // POST ENDPOINTS
    // ========================================================================

    // POST /payment-plans/ - Crear nuevo plan
    createPaymentPlan: builder.mutation<PaymentPlan, CreatePaymentPlanRequest>({
      query: (newPlan) => ({
        url: ENDPOINTS.PAYMENT_PLANS,
        method: 'POST',
        body: newPlan,
      }),
      invalidatesTags: [
        { type: 'PaymentPlan', id: 'LIST' },
        { type: 'PaymentPlan', id: 'STATS' },
        { type: 'PaymentPlan', id: 'ANALYTICS' },
      ],
    }),

    // ========================================================================
    // PUT/PATCH ENDPOINTS
    // ========================================================================

    // PATCH /payment-plans/:id/ - Actualizar plan
    updatePaymentPlan: builder.mutation<PaymentPlan, UpdatePaymentPlanRequest>({
      query: ({ id, ...patch }) => ({
        url: ENDPOINTS.PAYMENT_PLAN_BY_ID(id),
        method: 'PATCH',
        body: patch,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'PaymentPlan', id },
        { type: 'PaymentPlan', id: 'LIST' },
        { type: 'PaymentPlan', id: 'STATS' },
      ],
    }),

    // PATCH /payment-plans/:id/status/ - Actualizar estado del plan
    updatePaymentPlanStatus: builder.mutation<PaymentPlan, { id: number; status: string }>({
      query: ({ id, status }) => ({
        url: ENDPOINTS.UPDATE_PLAN_STATUS(id),
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'PaymentPlan', id },
        { type: 'PaymentPlan', id: 'LIST' },
        { type: 'PaymentPlan', id: 'STATS' },
      ],
    }),

    // PATCH /payment-plans/bulk-update/ - Actualización masiva
    bulkUpdatePaymentPlans: builder.mutation<{ updated: number }, { ids: number[]; updates: Partial<PaymentPlan> }>({
      query: ({ ids, updates }) => ({
        url: ENDPOINTS.BULK_UPDATE_PLANS,
        method: 'PATCH',
        body: { ids, updates },
      }),
      invalidatesTags: [
        { type: 'PaymentPlan', id: 'LIST' },
        { type: 'PaymentPlan', id: 'STATS' },
      ],
    }),

    // ========================================================================
    // DELETE ENDPOINTS
    // ========================================================================

    // DELETE /payment-plans/:id/ - Eliminar plan
    deletePaymentPlan: builder.mutation<void, number>({
      query: (id) => ({
        url: ENDPOINTS.PAYMENT_PLAN_BY_ID(id),
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'PaymentPlan', id },
        { type: 'PaymentPlan', id: 'LIST' },
        { type: 'PaymentPlan', id: 'STATS' },
      ],
    }),

    // DELETE /payment-plans/bulk-delete/ - Eliminación masiva
    bulkDeletePaymentPlans: builder.mutation<{ deleted: number }, number[]>({
      query: (ids) => ({
        url: ENDPOINTS.BULK_DELETE_PLANS,
        method: 'DELETE',
        body: { ids },
      }),
      invalidatesTags: [
        { type: 'PaymentPlan', id: 'LIST' },
        { type: 'PaymentPlan', id: 'STATS' },
      ],
    }),

    // ========================================================================
    // ENDPOINTS ESPECIALES
    // ========================================================================

    // GET /payment-plans/export/ - Exportar planes
    exportPaymentPlans: builder.mutation<Blob, PaymentPlanFilters>({
      query: (filters) => ({
        url: ENDPOINTS.PAYMENT_PLAN_EXPORT,
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

export const PAYMENT_PLAN_CACHE_CONFIG = {
  plans: 60 * 5, // 5 minutos
  stats: 60 * 2, // 2 minutos
  analytics: 60 * 10, // 10 minutos
  installments: 60 * 15, // 15 minutos
} as const;

// ============================================================================
// HOOKS EXPORTADOS PARA USAR EN COMPONENTES
// ============================================================================

export const {
  // Queries
  useGetPaymentPlansQuery,
  useGetPaymentPlanQuery,
  useGetPaymentPlanStatsQuery,
  useGetPaymentPlanAnalyticsQuery,
  useGetPaymentPlanInstallmentsQuery,
  
  // Mutations
  useCreatePaymentPlanMutation,
  useUpdatePaymentPlanMutation,
  useUpdatePaymentPlanStatusMutation,
  useDeletePaymentPlanMutation,
  useBulkUpdatePaymentPlansMutation,
  useBulkDeletePaymentPlansMutation,
  useExportPaymentPlansMutation,
  
  // Lazy queries
  useLazyGetPaymentPlansQuery,
  useLazyGetPaymentPlanQuery,
} = paymentPlansApi;

// ============================================================================
// SERVICIO HELPER
// ============================================================================

export const PaymentPlanService = {
  formatAmount: (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  },

  formatAmountCompact: (amount: number): string => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(1)}K`;
    }
    return `$${amount.toFixed(0)}`;
  },

  formatAmountDecimal: (amount: number): string => {
  return `$${amount.toFixed(2)}`;
  },

  formatDate: (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  },

  formatPercentage: (value: number): string => {
    return `${(value * 100).toFixed(1)}%`;
  },

  getStatusColor: (status: string): string => {
    const colors = {
      'Active': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      'Completed': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      'Defaulted': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
      'Cancelled': 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
      'Pending': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      'On Hold': 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
      'Denied': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
  },

  calculatePaymentPlanStats,

  getProgressColor: (percentage: number): string => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  },

  calculateDaysRemaining: (endDate: string): number => {
    const end = new Date(endDate);
    const today = new Date();
    const diffTime = end.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  },
};