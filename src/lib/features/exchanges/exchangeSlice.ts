import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../store";
import { selectOrderBook, selectOpenOrders } from "./selectors";
import { Order } from "@/src/types/exchange";

interface ExchangeState {
  address?: string;
  loaded?: boolean;
  balances: string[];
  selectedMarket?: string;
  orderBook: {
    allOrders: Order[];
    cancelledOrders: Order[];
    filledOrders: Order[];
  };
  transaction?: {
    type: string;
    isPending: boolean;
    isSuccessful?: boolean;
    isError?: boolean;
  };
  transferInProgress: boolean;
  events: {
    id: string;
    type: string;
    timestamp: number;
    user?: string;
    transactionHash?: string;
  }[];
  autoClose: boolean;
}

interface Event {
  id: string;
  type: string;
  timestamp: number;
  args: {
    user: string;
  };
  blockNumber: number;
  transactionHash: string;
}

const initialState: ExchangeState = {
  loaded: false,
  transferInProgress: false,
  balances: [],
  selectedMarket: undefined,
  orderBook: {
    allOrders: [],
    cancelledOrders: [],
    filledOrders: []
  },
  events: [],
  autoClose: true
};

export const ExchangeSlice = createSlice({
  name: "Exchange",
  initialState,
  reducers: {
    // LOAD EXCHANGE
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
    loadAllOrderBook: (
      state,
      {
        payload: { allOrders, cancelledOrders, filledOrders }
      }: PayloadAction<{
        allOrders: Order[];
        cancelledOrders: Order[];
        filledOrders: Order[];
      }>
    ) => {
      state.orderBook = {
        allOrders,
        cancelledOrders,
        filledOrders
      };
    },

    // TRANSFER
    transferRequest: (state) => {
      state.transaction = { type: "Transfer", isPending: true };
      state.transferInProgress = true;
    },
    transferSuccess: (
      state,
      { payload: { event } }: PayloadAction<{ event?: Event }>
    ) => {
      state.transaction = {
        type: "Transfer",
        isPending: false,
        isSuccessful: true
      };
      state.transferInProgress = false;
      if (event) {
        state.events = [{
          id: event.id,
          type: event.type,
          timestamp: event.timestamp,
          user: event.args?.user,
          transactionHash: event.transactionHash
        }, ...state.events];
      }
    },
    transferFail: (state) => {
      state.transaction = { type: "Transfer", isPending: false, isError: true };
      state.transferInProgress = false;
    },

    // ORDER
    newOrderRequest: (state) => {
      state.transaction = { type: "New Order", isPending: true };
      state.transferInProgress = true;
    },
    orderSuccess: (
      state,
      { payload: { order, event } }: PayloadAction<{ order: Order; event?: Event }>
    ) => {
      // Prevent duplicate orders
      const index = state.orderBook.allOrders.findIndex(
        (o) => o?.id?.toString() === order?.id?.toString()
      );

      let data = state.orderBook.allOrders;

      if (index === -1) {
        data = [...state.orderBook.allOrders, order];
      } else {
        data = state.orderBook.allOrders;
      }

      state.transaction = {
        type: "New Order",
        isPending: false,
        isSuccessful: true
      };
      state.transferInProgress = false;
      state.orderBook.allOrders = data;
      if (event) {
        state.events = [{
          id: event.id,
          type: event.type,
          timestamp: event.timestamp,
          user: event.args?.user,
          transactionHash: event.transactionHash
        }, ...state.events];
      }
    },
    orderFail: (state) => {
      state.transaction = {
        type: "New Order",
        isPending: false,
        isError: true
      };
      state.transferInProgress = false;
    },

    // ------------------------------------------------------------------------------
    // CANCELLING ORDERS
    cancelOrderRequest: (state) => {
      state.transaction = {
        type: "Cancel",
        isPending: true,
        isSuccessful: false
      };
      state.transferInProgress = true;
    },
    cancelOrderSuccess: (
      state,
      { payload: { order, event } }: PayloadAction<{ order: Order; event?: Event }>
    ) => {
      // Remove from allOrders and add to cancelledOrders
      state.orderBook.allOrders = state.orderBook.allOrders.filter(
        (o) => o.id !== order.id
      );
      state.orderBook.cancelledOrders = [
        ...state.orderBook.cancelledOrders,
        order
      ];
      state.transaction = {
        type: "Cancel",
        isPending: false,
        isSuccessful: true
      };
      if (event) {
        state.events = [{
          id: event.id,
          type: event.type,
          timestamp: event.timestamp,
          user: event.args?.user,
          transactionHash: event.transactionHash
        }, ...state.events];
      }
    },
    cancelOrderFail: (state) => {
      state.transaction = {
        type: "Cancel",
        isPending: false,
        isSuccessful: false,
        isError: true
      };
      state.transferInProgress = false;
    },

    // FILL ORDER
    fillOrderRequest: (state) => {
      state.transaction = { type: "Fill Order", isPending: true };
      state.transferInProgress = true;
    },

    fillOrderSuccess: (
      state,
      { payload: { order, event } }: PayloadAction<{ order: Order; event?: Event }>
    ) => {
      // Prevent duplicate orders
      const index = state.orderBook.filledOrders.findIndex(
        (o) => o?.id?.toString() === order?.id?.toString()
      );

      let data;

      if (index === -1) {
        data = [...state.orderBook.filledOrders, order];
      } else {
        data = state.orderBook.filledOrders;
      }

      state.transaction = {
        type: "Fill Order",
        isPending: false,
        isSuccessful: true
      };
      state.transferInProgress = false;
      state.orderBook.filledOrders = data;
      if (event) {
        state.events = [{
          id: event.id,
          type: event.type,
          timestamp: event.timestamp,
          user: event.args?.user,
          transactionHash: event.transactionHash
        }, ...state.events];
      }
    },

    fillOrderFail: (state) => {
      state.transaction = {
        type: "Fill Order",
        isPending: false,
        isError: true
      };
    },

    // SET SELECTED MARKET
    setSelectedMarket: (
      state,
      { payload: { market } }: PayloadAction<{ market: string }>
    ) => {
      state.selectedMarket = market;
    },

    // Add new action
    toggleAutoClose: (state: ExchangeState) => {
      state.autoClose = !state.autoClose;
    }
  }
});

export const {
  loadExchange,
  loadExchangeBalance,
  loadAllOrderBook,
  transferRequest,
  transferSuccess,
  transferFail,
  newOrderRequest,
  orderSuccess,
  orderFail,
  cancelOrderRequest,
  cancelOrderSuccess,
  cancelOrderFail,
  fillOrderRequest,
  fillOrderSuccess,
  fillOrderFail,
  setSelectedMarket,
  toggleAutoClose
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
export const selectAutoClose = (state: RootState) => state.exchange.autoClose;

// Re-export selectors
export { selectOrderBook, selectOpenOrders };

export default ExchangeSlice.reducer;
