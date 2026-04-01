import { configureStore } from '@reduxjs/toolkit'
import { baseApi } from './base-api'

export const apiStore = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
})

export type RootState = ReturnType<typeof apiStore.getState>
export type AppDispatch = typeof apiStore.dispatch
