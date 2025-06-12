import { baseApi } from "@/core/api/apiClient";
import type { 
  DBProduct, 
  CreateProductRequest, 
  UpdateProductRequest, 
  ProductsFilters
} from '../types';

// Endpoints constants
const ENDPOINTS = {
  PRODUCTS: '/product/',
  PRODUCT_BY_ID: (id: number) => `/products/${id}`,
  PRODUCTS_EXPORT: '/products/export',
  PRODUCTS_IMPORT: '/products/import',
  PRODUCTS_BULK_UPDATE: '/products/bulk-update',
  PRODUCTS_CLONE: (id: number) => `/products/${id}/clone`,
} as const;

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: Record<string, string[]>;
}

// Extend base API with products endpoints
export const productsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ========================================================================
    // GET ENDPOINTS
    // ========================================================================
    
    // GET /api/products - List with filters
    getProducts: builder.query<DBProduct[], ProductsFilters>({
      query: (filters = {}) => ({
        url: ENDPOINTS.PRODUCTS,
        params: {
          /*search: filters.search,
          developer: filters.developer,
          target_industries: filters.target_industries,
          page: filters.page || 1,
          limit: filters.limit || 50,
          sortBy: filters.sortBy || 'name',
          sortOrder: filters.sortOrder || 'asc',*/
        },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Product' as const, id })),
              { type: 'Product', id: 'LIST' },
            ]
          : [{ type: 'Product', id: 'LIST' }],
      transformResponse: (response: DBProduct[]) => response,
    }),

    // GET /api/products/:id - Individual product
    getProduct: builder.query<DBProduct, number>({
      query: (id) => ENDPOINTS.PRODUCT_BY_ID(id),
      providesTags: (result, error, id) => [{ type: 'Product', id }],
      transformResponse: (response: ApiResponse<DBProduct>) => response.data,
    }),

    // ========================================================================
    // POST ENDPOINTS
    // ========================================================================

    // POST /api/products - Create new product
    createProduct: builder.mutation<DBProduct, CreateProductRequest>({
      query: (newProduct) => ({
        url: ENDPOINTS.PRODUCTS,
        method: 'POST',
        body: newProduct,
      }),
      invalidatesTags: [
        { type: 'Product', id: 'LIST' },
      ],
      transformResponse: (response: ApiResponse<DBProduct>) => response.data,
      // Optimistic update
      async onQueryStarted(newProduct, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          productsApi.util.updateQueryData('getProducts', {}, (draft) => {
            const tempProduct: DBProduct = {
              ...newProduct,
              id: Date.now().toString(), // Temporary ID
            };
            draft.unshift(tempProduct);
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),

    // POST /api/products/:id/clone - Clone product
    cloneProduct: builder.mutation<DBProduct, { id: number; name: string }>({
      query: ({ id, name }) => ({
        url: ENDPOINTS.PRODUCTS_CLONE(id),
        method: 'POST',
        body: { name },
      }),
      invalidatesTags: [
        { type: 'Product', id: 'LIST' },
      ],
      transformResponse: (response: ApiResponse<DBProduct>) => response.data,
    }),

    // POST /api/products/import - Import products
    importProducts: builder.mutation<{ imported: number; errors: any[] }, FormData>({
      query: (formData) => ({
        url: ENDPOINTS.PRODUCTS_IMPORT,
        method: 'POST',
        body: formData,
        formData: true,
      }),
      invalidatesTags: [
        { type: 'Product', id: 'LIST' },
      ],
    }),

    // ========================================================================
    // PUT/PATCH ENDPOINTS
    // ========================================================================

    // PATCH /api/products/:id - Update product
    updateProduct: builder.mutation<DBProduct, UpdateProductRequest>({
      query: ({ id, ...patch }) => ({
        url: ENDPOINTS.PRODUCT_BY_ID(Number(id)),
        method: 'PATCH',
        body: patch,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Product', id },
        { type: 'Product', id: 'LIST' },
      ],
      transformResponse: (response: ApiResponse<DBProduct>) => response.data,
      // Optimistic update
      async onQueryStarted({ id, ...patch }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          productsApi.util.updateQueryData('getProducts', {}, (draft) => {
            const product = draft.find((p) => p.id === id);
            if (product) {
              Object.assign(product, patch);
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

    // PATCH /api/products/bulk-update - Bulk update
    bulkUpdateProducts: builder.mutation<{ updated: number }, { ids: number[]; updates: Partial<DBProduct> }>({
      query: ({ ids, updates }) => ({
        url: ENDPOINTS.PRODUCTS_BULK_UPDATE,
        method: 'PATCH',
        body: { ids, updates },
      }),
      invalidatesTags: [
        { type: 'Product', id: 'LIST' },
      ],
    }),

    // ========================================================================
    // DELETE ENDPOINTS
    // ========================================================================

    // DELETE /api/products/:id - Delete product
    deleteProduct: builder.mutation<void, number>({
      query: (id) => ({
        url: ENDPOINTS.PRODUCT_BY_ID(id),
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Product', id },
        { type: 'Product', id: 'LIST' },
      ],
      // Optimistic update
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          productsApi.util.updateQueryData('getProducts', {}, (draft) => {
            const index = draft.findIndex((p) => Number(p.id) === id);
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

    // DELETE /api/products - Bulk delete
    bulkDeleteProducts: builder.mutation<{ deleted: number }, number[]>({
      query: (ids) => ({
        url: ENDPOINTS.PRODUCTS,
        method: 'DELETE',
        body: { ids },
      }),
      invalidatesTags: [
        { type: 'Product', id: 'LIST' },
      ],
    }),

    // ========================================================================
    // SPECIAL ENDPOINTS
    // ========================================================================

    // GET /api/products/export - Export products
    exportProducts: builder.mutation<Blob, ProductsFilters>({
      query: (filters) => ({
        url: ENDPOINTS.PRODUCTS_EXPORT,
        params: filters,
        responseHandler: (response) => response.blob(),
      }),
    }),
  }),
  overrideExisting: false,
});

// Export hooks for use in components
export const {
  // Queries
  useGetProductsQuery,
  useGetProductQuery,
  
  // Mutations
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useCloneProductMutation,
  useBulkUpdateProductsMutation,
  useBulkDeleteProductsMutation,
  useImportProductsMutation,
  useExportProductsMutation,
  
  // Lazy queries
  useLazyGetProductsQuery,
  useLazyGetProductQuery,
} = productsApi;