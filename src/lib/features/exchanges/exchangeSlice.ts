import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../store";

interface ExchangeState {
  address?: string;
  loaded?: boolean;
}

const initialState: ExchangeState = {
  loaded: false,
};

export const ExchangeSlice = createSlice({
  name: "Exchange",
  initialState,
  reducers: {
    loadExchange: (state, { payload: { address } }: PayloadAction<{ address: string }>) => {
      state.address = address;
      state.loaded = true;
    },
  },
});

export const { loadExchange } = ExchangeSlice.actions;

// Selector to get the exchange address
export const selectExchangeAddress = (state: RootState) => state.exchange.address;

export default ExchangeSlice.reducer;
