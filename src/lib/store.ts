import { combineReducers, configureStore } from '@reduxjs/toolkit'
import provider from './features/providers/providerSlice'


const reducers = combineReducers({
  provider,
})


export const makeStore = () => {
  return configureStore({
    reducer: reducers,
    devTools: process.env.NODE_ENV !== 'production',
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false, // Permite valores não serializáveis
      }),
  })
}

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']