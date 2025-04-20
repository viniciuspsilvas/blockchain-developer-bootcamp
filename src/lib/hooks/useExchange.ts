"use client";

import { Contract, ethers } from "ethers";
import { useAppDispatch, useAppSelector } from "../hooks";
import {
  orderFail,
  selectExchangeAddress,
  selectExchangeBalances,
  newOrderRequest,
  cancelOrderFail,
  cancelOrderRequest,
  fillOrderRequest,
  fillOrderFail
} from "../features/exchanges/exchangeSlice";
import EXCHANGE_ABI from "../../abis/Exchange.json";
import { selectProvider } from "../features/providers/providerSlice";
import { Order } from "@/src/types/exchange";

interface OrderResult {
  success: boolean;
  error?: string;
  receipt?: ethers.providers.TransactionReceipt;
}

export const useExchange = () => {
  const dispatch = useAppDispatch();
  const address = useAppSelector(selectExchangeAddress);
  const balances = useAppSelector(selectExchangeBalances);
  const provider = useAppSelector(selectProvider);

  // Early return if exchange or provider is not available
  if (!address || !provider) {
    return {
      exchange: null,
      balances: balances || [],
      makeBuyOrder: async () => ({
        success: false,
        error: "Exchange or Provider is not available"
      }),
      cancelOrder: async () => ({
        success: false,
        error: "Exchange or Provider is not available"
      })
    };
  }

  // Initialize exchange contract
  const exchange = new Contract(address, EXCHANGE_ABI, provider);

  /**
   * Creates a buy order in the exchange
   * @param amount The amount of tokens to buy
   * @param price The price per token
   * @param tokens Array of token contracts
   * @returns The result of the order operation
   */
  const makeBuyOrder = async (
    amount: number,
    price: number,
    tokens: Contract[]
  ): Promise<OrderResult> => {
    if (!exchange || !provider) {
      return {
        success: false,
        error: "Exchange or Provider is not available"
      };
    }

    try {
      dispatch(newOrderRequest());

      const tokenGet = tokens[0].address;
      const amountGet = ethers.utils.parseUnits(
        (amount * price).toString(),
        18
      );
      const tokenGive = tokens[1].address;
      const amountGive = ethers.utils.parseUnits(amount.toString(), 18);

      const signer = provider.getSigner();
      const transaction = await exchange
        .connect(signer)
        .makeOrder(tokenGet, amountGet, tokenGive, amountGive);

      const receipt = await transaction.wait();
      return {
        success: true,
        receipt
      };
    } catch (error) {
      dispatch(orderFail());
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred"
      };
    }
  };

  /**
   * Cancels an existing order in the exchange
   * @param orderId The ID of the order to cancel
   * @returns The result of the cancel operation
   */
  const cancelOrder = async (orderId: number): Promise<OrderResult> => {
    if (!exchange || !provider) {
      return {
        success: false,
        error: "Exchange or Provider is not available"
      };
    }

    try {
      dispatch(cancelOrderRequest());

      const signer = provider.getSigner();
      const transaction = await exchange.connect(signer).cancelOrder(orderId);

      const receipt = await transaction.wait();

      return {
        success: true,
        receipt
      };
    } catch (error) {
      dispatch(cancelOrderFail());
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred"
      };
    }
  };

  const fillOrder = async (order: Order) => {
    if (!exchange || !provider) {
      return {
        success: false,
        error: "Exchange or Provider is not available"
      };
    }

    try {
      dispatch(fillOrderRequest());

      const signer = provider.getSigner();
      const transaction = await exchange.connect(signer).fillOrder(order.id);

      const receipt = await transaction.wait();

      return {
        success: true,
        receipt
      };
    } catch (error) {
      dispatch(fillOrderFail());
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred"
      };
    }
  };

  return {
    exchange,
    balances,
    makeBuyOrder,
    cancelOrder,
    fillOrder
  };
};
