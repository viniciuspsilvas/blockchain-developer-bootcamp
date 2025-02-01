import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

// Define a type for the slice state
interface ExchangeState {
  contract?: unknown
  loaded?: boolean
}

// Define the initial state using that type
const initialState: ExchangeState = {
  loaded: false
}

export const ExchangeSlice = createSlice({
  name: 'Exchange',
  initialState,
  reducers: {
    loadExchange: (state, { payload: { contract } }: PayloadAction<ExchangeState>) => {
      state.contract = contract
      state.loaded = true
    },
  },
})

export const { loadExchange } = ExchangeSlice.actions

export default ExchangeSlice.reducer