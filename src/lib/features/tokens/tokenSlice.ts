import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

// Define a type for the slice state
interface TokenState {
  symbol?: string
  contract?: unknown
  loaded: boolean
}

// Define the initial state using that type
const initialState: TokenState = {
  loaded: false
}

export const TokenSlice = createSlice({
  name: 'Token',
  initialState,
  reducers: {
    loadToken: (state, { payload: { symbol, contract } }: PayloadAction<{ symbol: string, contract: unknown }>) => {
      state.symbol = symbol
      state.contract = contract
      state.loaded = true
    },
  },
})

export const { loadToken } = TokenSlice.actions

export default TokenSlice.reducer