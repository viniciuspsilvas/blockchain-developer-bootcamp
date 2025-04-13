import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../store";

interface ExchangeState {
  address?: string;
  loaded?: boolean;
  balances: string[];
  transaction?: {
    type: string;
    isPending: boolean;
    isSuccessful?: boolean;
    isError?: boolean;
  };
  transferInProgress: boolean;
}

const initialState: ExchangeState = {
  loaded: false,
  transferInProgress: false,
  balances: []
};

export const ExchangeSlice = createSlice({
  name: "Exchange",
  initialState,
  reducers: {
    loadExchange: (
      state,
      { payload: { address } }: PayloadAction<{ address: string }>
    ) => {
      state.address = address;
      state.loaded = true;
    },
    loadExchangeBalance: (
      state,
      { payload: { balances } }: PayloadAction<{ balances: string[] }>
    ) => {
      state.balances = balances;
    },
    transferRequest: (state) => {
      state.transaction = { type: "Transfer", isPending: true };
      state.transferInProgress = true;
    },
    transferSuccess: (state) => {
      state.transaction = {
        type: "Transfer",
        isPending: false,
        isSuccessful: true
      };
      state.transferInProgress = false;
    },
    transferFail: (state) => {
      state.transaction = { type: "Transfer", isPending: false, isError: true };
      state.transferInProgress = false;
    },
    startOrder: (state) => {
      state.transaction = { type: "New Order", isPending: true };
      state.transferInProgress = true;
    },
    orderSuccess: (state) => {
      state.transaction = {
        type: "New Order",
        isPending: false,
        isSuccessful: true
      };
      state.transferInProgress = false;
    },
    orderFail: (state) => {
      state.transaction = {
        type: "New Order",
        isPending: false,
        isError: true
      };
      state.transferInProgress = false;
    }
  }
});

export const {
  loadExchange,
  loadExchangeBalance,
  transferRequest,
  transferSuccess,
  transferFail,
  startOrder,
  orderSuccess,
  orderFail
} = ExchangeSlice.actions;

// Selectors
export const selectExchangeAddress = (state: RootState) =>
  state.exchange.address;
export const selectExchangeBalances = (state: RootState) =>
  state.exchange.balances;
export const selectTransaction = (state: RootState) =>
  state.exchange.transaction;
export const selectTransferInProgress = (state: RootState) =>
  state.exchange.transferInProgress;

export default ExchangeSlice.reducer;
