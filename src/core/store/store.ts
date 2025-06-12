
import { configureStore } from '@reduxjs/toolkit';
import { leadsApi } from '@/modules/leads/store/leadsApi';

export const store = configureStore({
  reducer: {
    // Add the RTK Query reducer
    [leadsApi.reducerPath]: leadsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [leadsApi.util.resetApiState.type],
      },
    }).concat(leadsApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;