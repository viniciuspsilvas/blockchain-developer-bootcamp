import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../store";

interface TokenState {
  symbols?: string[];
  addresses: string[];
  loaded?: boolean;
}

const initialState: TokenState = {
  loaded: false,
  addresses: [],
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
  },
});

export const { loadTokens } = TokensSlice.actions;

// Selector to get token addresses
export const selectTokenAddresses = (state: RootState) => state.tokens.addresses;

// Selector to get token symbols
export const selectTokenSymbols = (state: RootState) => state.tokens.symbols;

export default TokensSlice.reducer;
