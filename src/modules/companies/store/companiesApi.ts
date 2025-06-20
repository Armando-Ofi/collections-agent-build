
import { baseApi } from "@/core/api/apiClient";
import type { Company, CompanyFormData, CompanyKPIs } from '../types';

// Definir las URLs de endpoints como constantes
const ENDPOINTS = {
  COMPANIES: '/company/',
  WEBHOOK_URL: 'https://n8n.sofiatechnology.ai/webhook/8fb550a1-259d-40a7-8780-3c4947158572',
  COMPANY_BY_ID: (id: string) => `/company/${id}`,
  COMPANIES_STATS: '/companies/stats',
  COMPANIES_EXPORT: '/companies/export',
  COMPANIES_IMPORT: '/companies/import',
  COMPANIES_BULK_UPDATE: '/companies/bulk-update',
  COMPANIES_ANALYTICS: '/companies/analytics',
} as const;

export interface CompaniesFilters {
  search?: string;
  industry?: string;
  size?: string;
  country?: string;
  status?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateCompanyRequest extends CompanyFormData { }

export interface UpdateCompanyRequest extends Partial<CompanyFormData> {
  id: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: Record<string, string[]>;
}

// Extender la API base con endpoints específicos de companies
export const companiesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ========================================================================
    // GET ENDPOINTS
    // ========================================================================

    // GET /api/companies - Lista paginada con filtros
    getCompanies: builder.query<Company[], CompaniesFilters>({
      query: (filters = {}) => ({
        url: ENDPOINTS.COMPANIES,
        params: {
          search: filters.search,
          industry: filters.industry,
          size: filters.size,
          country: filters.country,
          status: filters.status,
          page: filters.page,
          limit: filters.limit,
          sortBy: filters.sortBy,
          sortOrder: filters.sortOrder,
        },
      }),
      providesTags: (result) =>
        result
          ? [
            ...result.map(({ id }) => ({ type: 'Company' as const, id })),
            { type: 'Company', id: 'LIST' },
          ]
          : [{ type: 'Company', id: 'LIST' }],
      // Transformar respuesta si es necesario
      transformResponse: (response: Company[]): Company[] => response,
    }),

    // GET /api/companies/:id - Company individual
    getCompany: builder.query<Company, string>({
      query: (id) => ENDPOINTS.COMPANY_BY_ID(id),
      providesTags: (result, error, id) => [{ type: 'Company', id }],
      transformResponse: (response: ApiResponse<Company>) => response.data,
    }),

    // GET /api/companies/stats - Estadísticas y KPIs
    getCompaniesStats: builder.query<CompanyKPIs, void>({
      query: () => ENDPOINTS.COMPANIES_STATS,
      providesTags: [{ type: 'Company', id: 'STATS' }],
      transformResponse: (response: ApiResponse<CompanyKPIs>) => response.data,
    }),

    // GET /api/companies/analytics - Analytics avanzados
    getCompaniesAnalytics: builder.query<any, { dateRange?: string; groupBy?: string }>({
      query: (params) => ({
        url: ENDPOINTS.COMPANIES_ANALYTICS,
        params,
      }),
      providesTags: [{ type: 'Company', id: 'ANALYTICS' }],
    }),

    // ========================================================================
    // POST ENDPOINTS
    // ========================================================================

    // POST /api/companies - Crear nueva company
    createCompany: builder.mutation<Company, CreateCompanyRequest>({
      query: (newCompany) => ({
        url: ENDPOINTS.COMPANIES,
        method: 'POST',
        body: newCompany,
      }),
      invalidatesTags: [
        { type: 'Company', id: 'LIST' },
        { type: 'Company', id: 'STATS' },
        { type: 'Company', id: 'ANALYTICS' },
      ],
      transformResponse: (response: ApiResponse<Company>) => response.data,
      // Optimistic update
      async onQueryStarted(newCompany, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          companiesApi.util.updateQueryData('getCompanies', {}, (draft) => {
            const tempCompany: Company = {
              ...newCompany,
              id: Date.now(), // ID temporal
              company_url_id: null,
              company_url: null,
            };
            draft.unshift(tempCompany);
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),

    createCompanyByUrl: builder.mutation<Company, string>({
      query: (urlParam) => ({
        url: `${ENDPOINTS.WEBHOOK_URL}/?company_url=${urlParam}`, // Nueva base URL
        method: 'GET',
        // Para query parameters: 
        // url: `${OTRA_BASE_URL}/companies?param=${urlParam}`,
        // Para path parameters:
        // url: `${OTRA_BASE_URL}/companies/${urlParam}`,
      }),
      transformResponse: (response: ApiResponse<Company>) => response.data,
      // Nota: Removed optimistic update ya que GET no modifica datos
    }),

    // POST /api/companies/import - Importar companies masivamente
    importCompanies: builder.mutation<{ imported: number; errors: any[] }, FormData>({
      query: (formData) => ({
        url: ENDPOINTS.COMPANIES_IMPORT,
        method: 'POST',
        body: formData,
        formData: true,
      }),
      invalidatesTags: [
        { type: 'Company', id: 'LIST' },
        { type: 'Company', id: 'STATS' },
      ],
    }),

    // ========================================================================
    // PUT/PATCH ENDPOINTS
    // ========================================================================

    // PATCH /api/companies/:id - Actualizar company
    updateCompany: builder.mutation<Company, UpdateCompanyRequest>({
      query: ({ id, ...patch }) => ({
        url: ENDPOINTS.COMPANY_BY_ID(id),
        method: 'PATCH',
        body: patch,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Company', id },
        { type: 'Company', id: 'LIST' },
        { type: 'Company', id: 'STATS' },
      ],
      transformResponse: (response: ApiResponse<Company>) => response.data,
      // Optimistic update
      async onQueryStarted({ id, ...patch }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          companiesApi.util.updateQueryData('getCompanies', {}, (draft) => {
            const company = draft.find((c) => c.id.toString() === id);
            if (company) {
              Object.assign(company, patch);
            }
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),

    // PATCH /api/companies/bulk-update - Actualización masiva
    bulkUpdateCompanies: builder.mutation<{ updated: number }, { ids: string[]; updates: Partial<Company> }>({
      query: ({ ids, updates }) => ({
        url: ENDPOINTS.COMPANIES_BULK_UPDATE,
        method: 'PATCH',
        body: { ids, updates },
      }),
      invalidatesTags: [
        { type: 'Company', id: 'LIST' },
        { type: 'Company', id: 'STATS' },
      ],
    }),

    // ========================================================================
    // DELETE ENDPOINTS
    // ========================================================================

    // DELETE /capi/companies/:id - Eliminar company
    deleteCompany: builder.mutation<void, string>({
      query: (id) => ({
        url: ENDPOINTS.COMPANY_BY_ID(id),
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Company', id },
        { type: 'Company', id: 'LIST' },
        { type: 'Company', id: 'STATS' },
      ],
      // Optimistic update
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          companiesApi.util.updateQueryData('getCompanies', {}, (draft) => {
            const index = draft.findIndex((c) => c.id.toString() === id);
            if (index > -1) {
              draft.splice(index, 1);
            }
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),

    // DELETE /api/companies - Eliminación masiva
    bulkDeleteCompanies: builder.mutation<{ deleted: number }, string[]>({
      query: (ids) => ({
        url: ENDPOINTS.COMPANIES,
        method: 'DELETE',
        body: { ids },
      }),
      invalidatesTags: [
        { type: 'Company', id: 'LIST' },
        { type: 'Company', id: 'STATS' },
      ],
    }),

    // ========================================================================
    // ENDPOINTS ESPECIALES
    // ========================================================================

    // GET /api/companies/export - Exportar companies
    exportCompanies: builder.mutation<Blob, CompaniesFilters>({
      query: (filters) => ({
        url: ENDPOINTS.COMPANIES_EXPORT,
        params: filters,
        responseHandler: (response) => response.blob(),
      }),
    }),
  }),
  overrideExisting: false,
});

// Hook exportado para usar en componentes
export const {
  // Queries
  useGetCompaniesQuery,
  useGetCompanyQuery,
  useGetCompaniesStatsQuery,
  useGetCompaniesAnalyticsQuery,

  // Mutations
  useCreateCompanyMutation,
  useCreateCompanyByUrlMutation,
  useUpdateCompanyMutation,
  useDeleteCompanyMutation,
  useBulkUpdateCompaniesMutation,
  useBulkDeleteCompaniesMutation,
  useImportCompaniesMutation,
  useExportCompaniesMutation,

  // Lazy queries
  useLazyGetCompaniesQuery,
  useLazyGetCompanyQuery,
} = companiesApi;