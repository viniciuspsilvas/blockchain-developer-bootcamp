import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../store";

interface ExchangeState {
  address?: string;
  loaded?: boolean;
  balances: string[]
}

const initialState: ExchangeState = {
  loaded: false,
  balances: []
};

export const ExchangeSlice = createSlice({
  name: "Exchange",
  initialState,
  reducers: {
    loadExchange: (state, { payload: { address } }: PayloadAction<{ address: string }>) => {
      state.address = address;
      state.loaded = true;
    },
    loadExchangeBalance: (state, { payload: { balance } }: PayloadAction<{ balance: string }>) => {
      state.balances = [...state.balances, balance];
    },
  },
});

export const { loadExchange, loadExchangeBalance } = ExchangeSlice.actions;

// Selector to get the exchange address
export const selectExchangeAddress = (state: RootState) => state.exchange.address;

// Selector to get the exchange balance
export const selectExchangeBalances = (state: RootState) => state.exchange.balances;

export default ExchangeSlice.reducer;
