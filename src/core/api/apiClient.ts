import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '@/core/store/store';

// Configuración de base URL desde variables de entorno
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://sales-agent.api.sofiatechnology.ai/api/v1';

// Base query con configuración enterprise
const baseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: (headers, { getState, endpoint }) => {
    // Agregar token de autenticación
    /*const token = (getState() as RootState).auth?.token;
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }*/

    // Headers estándar
    headers.set('content-type', 'application/json');
    headers.set('accept', 'application/json');

    // Headers específicos por endpoint (opcional)
    if (endpoint === 'uploadFile') {
      headers.delete('content-type'); // Para multipart/form-data
    }

    return headers;
  },
  // Timeout y retry logic
  timeout: 180000,
});

// Base query con retry logic y error handling
const baseQueryWithRetry = async (args: any, api: any, extraOptions: any) => {
  let result = await baseQuery(args, api, extraOptions);

  // Retry logic para errores de red
  if (result.error && result.error.status === 'FETCH_ERROR') {
    // Retry una vez después de 1 segundo
    await new Promise(resolve => setTimeout(resolve, 1000));
    result = await baseQuery(args, api, extraOptions);
  }

  // Manejo de errores de autenticación
  if (result.error?.status === 401) {
    // Dispatch logout action
    api.dispatch({ type: 'auth/logout' });
  }

  return result;
};

// API base que pueden extender otros features
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithRetry,
  tagTypes: ['Lead', 'User', 'Product', 'Order', 'RiskAnalysis', 'Collections', 'PaymentPlan'], // Define todos los tag types
  endpoints: () => ({}), // Se extenderá en cada feature
});