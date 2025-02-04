import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../store";

interface TokenState {
  symbols?: string[];
  addresses: string[];
  loaded?: boolean;
  balances: string[]
}

const initialState: TokenState = {
  loaded: false,
  addresses: [],
  balances: []
};

export const TokensSlice = createSlice({
  name: "Tokens",
  initialState,
  reducers: {
    loadTokens: (
      state,
      { payload: { symbols, addresses } }: PayloadAction<TokenState>
    ) => {
      state.symbols = symbols;
      state.addresses = addresses;
      state.loaded = true;
    },
    loadTokenBalance: (state, { payload: { balance } }: PayloadAction<{ balance: string }>) => {
      state.balances = [...state.balances, balance];
    },
  },
});

export const { loadTokens, loadTokenBalance } = TokensSlice.actions;

// Selector to get token addresses
export const selectTokenAddresses = (state: RootState) => state.tokens.addresses;

// Selector to get token symbols
export const selectTokenSymbols = (state: RootState) => state.tokens.symbols;

// Selector to get token symbols
export const selectTokenBalances = (state: RootState) => state.tokens.balances;

export default TokensSlice.reducer;
