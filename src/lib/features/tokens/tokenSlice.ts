import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

// Define a type for the slice state
interface TokenState {
  symbols?: string[]
  contracts?: unknown[]
  loaded?: boolean
}

// Define the initial state using that type
const initialState: TokenState = {
  loaded: false
}

export const TokenSlice = createSlice({
  name: 'Token',
  initialState,
  reducers: {
    loadTokens: (state, { payload: { symbols, contracts } }: PayloadAction<TokenState>) => {
      state.symbols = symbols
      state.contracts = contracts
      state.loaded = true
    },
  },
})

export const { loadTokens } = TokenSlice.actions

export default TokenSlice.reducer