
import { baseApi } from "@/core/api/apiClient";
import type { Lead, CreateLeadRequest, UpdateLeadRequest, LeadsStats, LeadsFilters, Status } from '../types';

// Definir las URLs de endpoints como constantes
const ENDPOINTS = {
  LEADS: '/lead/',
  LEAD_BY_ID: (id: string) => `/leads/${id}`,
  LEADS_STATS: '/leads/stats',
  LEADS_EXPORT: '/leads/export',
  LEADS_IMPORT: '/leads/import',
  LEADS_BULK_UPDATE: '/leads/bulk-update',
  LEADS_ANALYTICS: '/leads/analytics',
} as const;



export interface Opportunity {
  id: number;
  status: Status;
  reason: string;
  opportunityScore: string;
  clientPriorityLevel: 'Low' | 'Medium' | 'High' | string; // Puedes refinar los valores posibles
  lastContact: string | null;
  contactMethod: string | null;
  estimatedValue: number | null;
  aiAgentAssigned: string | null;
  probabilityToLand: string | null;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  company: {
    id: number;
    name: string;
    industry: string;
  };
  product: {
    id: number;
    name: string;
  };
  contact: Contact | null; // Puedes definir esta interfaz aparte si se requiere
}

// Ejemplo opcional si deseas definir la interfaz Contact en el futuro
export interface Contact {
  id: number;
  name: string;
  email: string;
  phone?: string;
  // otros campos según tu modelo
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: Record<string, string[]>;
}

const validContactMethods = ['Email', 'Phone', 'LinkedIn', 'Video Call', 'WhatsApp'] as const;

function mapContactMethod(method: string | null): Lead['contactMethod'] {
  if (validContactMethods.includes(method as any)) {
    return method as Lead['contactMethod'];
  }
  return 'Email'; // Valor por defecto si no es válido
}

// Extender la API base con endpoints específicos de leads
export const leadsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ========================================================================
    // GET ENDPOINTS
    // ========================================================================
    
    // GET /api/leads - Lista paginada con filtros
    getLeads: builder.query<Lead[], LeadsFilters>({
      query: (filters = {}) => ({
        url: ENDPOINTS.LEADS,
        /*params: {
          //page: filters.page || 1,
          //limit: filters.limit || 10,
          search: filters.search,
          industry: filters.industry,
          priority: filters.priority,
          status: filters.status,
          //sortBy: filters.sortBy || 'createdAt',
          //sortOrder: filters.sortOrder || 'desc',
        },*/
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Lead' as const, id })),
              { type: 'Lead', id: 'LIST' },
            ]
          : [{ type: 'Lead', id: 'LIST' }],
      // Transformar respuesta si es necesario
      transformResponse: (response: Opportunity[]): Lead[] =>
        response.map((opportunity) => ({
          id: opportunity.id.toString(),
          name: opportunity.company?.name ?? 'Unknown',
          industry: opportunity.company?.industry ?? 'Unknown',
          effectivenessPercentage: parseFloat(opportunity.opportunityScore) || 0,
          probabilityToLand: parseFloat(opportunity.probabilityToLand) || 0,
          priority: mapPriority(opportunity.clientPriorityLevel),
          status: opportunity.status,
          lastContact: opportunity.lastContact ?? '',
          contactMethod: mapContactMethod(opportunity.contactMethod),
          email: opportunity.contact?.email ?? 'unknown@example.com',
          phone: opportunity.contact?.phone ?? undefined,
          company: opportunity.company?.name ?? 'Unknown',
          estimatedValue: opportunity.estimatedValue ?? undefined,
          aiAgentAssigned: opportunity.aiAgentAssigned ?? undefined,
          createdAt: opportunity.createdAt,
          updatedAt: opportunity.updatedAt,
        })),
    }),

    // GET /api/leads/:id - Lead individual
    getLead: builder.query<Lead, string>({
      query: (id) => ENDPOINTS.LEAD_BY_ID(id),
      providesTags: (result, error, id) => [{ type: 'Lead', id }],
      transformResponse: (response: ApiResponse<Lead>) => response.data,
    }),

    // GET /api/leads/stats - Estadísticas
    getLeadsStats: builder.query<LeadsStats, void>({
      query: () => ENDPOINTS.LEADS_STATS,
      providesTags: [{ type: 'Lead', id: 'STATS' }],
      transformResponse: (response: ApiResponse<LeadsStats>) => response.data,
    }),

    // GET /api/leads/analytics - Analytics avanzados
    getLeadsAnalytics: builder.query<any, { dateRange?: string; groupBy?: string }>({
      query: (params) => ({
        url: ENDPOINTS.LEADS_ANALYTICS,
        params,
      }),
      providesTags: [{ type: 'Lead', id: 'ANALYTICS' }],
    }),

    // ========================================================================
    // POST ENDPOINTS
    // ========================================================================

    // POST /api/leads - Crear nuevo lead
    createLead: builder.mutation<Lead, CreateLeadRequest>({
      query: (newLead) => ({
        url: ENDPOINTS.LEADS,
        method: 'POST',
        body: newLead,
      }),
      invalidatesTags: [
        { type: 'Lead', id: 'LIST' },
        { type: 'Lead', id: 'STATS' },
        { type: 'Lead', id: 'ANALYTICS' },
      ],
      transformResponse: (response: ApiResponse<Lead>) => response.data,
      // Optimistic update
      async onQueryStarted(newLead, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          leadsApi.util.updateQueryData('getLeads', {}, (draft) => {
            const tempLead: Lead = {
              ...newLead,
              id: `temp-${Date.now()}`,
              effectivenessPercentage: 0,
              lastContact: new Date().toISOString(),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            draft.data.unshift(tempLead);
            draft.total += 1;
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),

    // POST /api/leads/import - Importar leads masivamente
    importLeads: builder.mutation<{ imported: number; errors: any[] }, FormData>({
      query: (formData) => ({
        url: ENDPOINTS.LEADS_IMPORT,
        method: 'POST',
        body: formData,
        formData: true,
      }),
      invalidatesTags: [
        { type: 'Lead', id: 'LIST' },
        { type: 'Lead', id: 'STATS' },
      ],
    }),

    // ========================================================================
    // PUT/PATCH ENDPOINTS
    // ========================================================================

    // PATCH /api/leads/:id - Actualizar lead
    updateLead: builder.mutation<Lead, UpdateLeadRequest>({
      query: ({ id, ...patch }) => ({
        url: ENDPOINTS.LEAD_BY_ID(id),
        method: 'PATCH',
        body: patch,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Lead', id },
        { type: 'Lead', id: 'LIST' },
        { type: 'Lead', id: 'STATS' },
      ],
      transformResponse: (response: ApiResponse<Lead>) => response.data,
      // Optimistic update
      async onQueryStarted({ id, ...patch }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          leadsApi.util.updateQueryData('getLeads', {}, (draft) => {
            const lead = draft.data.find((l) => l.id === id);
            if (lead) {
              Object.assign(lead, patch, { updatedAt: new Date().toISOString() });
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

    // PATCH /api/leads/bulk-update - Actualización masiva
    bulkUpdateLeads: builder.mutation<{ updated: number }, { ids: string[]; updates: Partial<Lead> }>({
      query: ({ ids, updates }) => ({
        url: ENDPOINTS.LEADS_BULK_UPDATE,
        method: 'PATCH',
        body: { ids, updates },
      }),
      invalidatesTags: [
        { type: 'Lead', id: 'LIST' },
        { type: 'Lead', id: 'STATS' },
      ],
    }),

    // ========================================================================
    // DELETE ENDPOINTS
    // ========================================================================

    // DELETE /api/leads/:id - Eliminar lead
    deleteLead: builder.mutation<void, string>({
      query: (id) => ({
        url: ENDPOINTS.LEAD_BY_ID(id),
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Lead', id },
        { type: 'Lead', id: 'LIST' },
        { type: 'Lead', id: 'STATS' },
      ],
      // Optimistic update
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          leadsApi.util.updateQueryData('getLeads', {}, (draft) => {
            const index = draft.data.findIndex((l) => l.id === id);
            if (index > -1) {
              draft.data.splice(index, 1);
              draft.total -= 1;
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

    // DELETE /api/leads - Eliminación masiva
    bulkDeleteLeads: builder.mutation<{ deleted: number }, string[]>({
      query: (ids) => ({
        url: ENDPOINTS.LEADS,
        method: 'DELETE',
        body: { ids },
      }),
      invalidatesTags: [
        { type: 'Lead', id: 'LIST' },
        { type: 'Lead', id: 'STATS' },
      ],
    }),

    // ========================================================================
    // ENDPOINTS ESPECIALES
    // ========================================================================

    // GET /api/leads/export - Exportar leads
    exportLeads: builder.mutation<Blob, LeadsFilters>({
      query: (filters) => ({
        url: ENDPOINTS.LEADS_EXPORT,
        params: filters,
        responseHandler: (response) => response.blob(),
      }),
    }),
  }),
  overrideExisting: false,
});

// ============================================================================
// 3. CONFIGURACIÓN DE VARIABLES DE ENTORNO - .env
// ============================================================================

/*
# .env.development
VITE_API_BASE_URL=http://localhost:3001/api
VITE_API_TIMEOUT=10000

# .env.production  
VITE_API_BASE_URL=https://api.yourapp.com/v1
VITE_API_TIMEOUT=15000

# .env.staging
VITE_API_BASE_URL=https://staging-api.yourapp.com/v1
VITE_API_TIMEOUT=12000
*/

// ============================================================================
// 4. CONFIGURACIÓN AVANZADA - shared/lib/api/apiConfig.ts
// ============================================================================

export const API_CONFIG = {
  // Base URLs por environment
  BASE_URLS: {
    development: 'http://localhost:3001/api',
    staging: 'https://staging-api.yourapp.com/v1',
    production: 'https://api.yourapp.com/v1',
  },
  
  // Timeouts
  TIMEOUTS: {
    default: 10000,
    upload: 30000,
    download: 60000,
  },

  // Retry configuration
  RETRY: {
    attempts: 3,
    delay: 1000,
    backoff: 2,
  },

  // Cache configuration
  CACHE: {
    leads: 60 * 5, // 5 minutos
    stats: 60 * 2, // 2 minutos
    analytics: 60 * 10, // 10 minutos
  },
} as const;

function mapPriority(priority: string): Lead['priority'] {
  switch (priority) {
    case 'Low':
    case 'Medium':
    case 'High':
      return priority;
    case 'Critical':
      return 'Critical';
    default:
      return 'Low'; // Valor por defecto
  }
}

/*function mapStatus(status: string): Lead['status'] {
  const map: Record<string, Lead['status']> = {
    'New': 'New',
    'Contacted': 'Contacted',
    'Qualified': 'Qualified',
    'Proposal': 'Proposal',
    'Negotiation': 'Negotiation',
    'Closed': 'Closed',
    'Lost': 'Lost',
    'Argo Sales Sent an Email': 'Contacted',
    // agrega más reglas si es necesario
  };
  return map[status] ?? 'New';
}*/


// ============================================================================
// 5. HOOK EXPORTADO PARA USAR EN COMPONENTES
// ============================================================================

export const {
  // Queries
  useGetLeadsQuery,
  useGetLeadQuery,
  useGetLeadsStatsQuery,
  useGetLeadsAnalyticsQuery,
  
  // Mutations
  useCreateLeadMutation,
  useUpdateLeadMutation,
  useDeleteLeadMutation,
  useBulkUpdateLeadsMutation,
  useBulkDeleteLeadsMutation,
  useImportLeadsMutation,
  useExportLeadsMutation,
  
  // Lazy queries
  useLazyGetLeadsQuery,
  useLazyGetLeadQuery,
} = leadsApi;