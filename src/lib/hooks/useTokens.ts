"use client";

import { Contract, ethers } from "ethers";
import { useAppSelector, useAppDispatch } from "../hooks";
import {
  selectTokenAddresses,
  selectTokenSymbols,
  selectTokenBalances
} from "../features/tokens/tokensSlice";
import {
  transferRequest,
  transferFail
} from "../features/exchanges/exchangeSlice";
import TOKEN_ABI from "../../abis/Token.json";
import { selectProvider } from "../features/providers/providerSlice";
import { useExchange } from "./useExchange";

interface TokenTransferResult {
  success: boolean;
  error?: string;
  receipt?: ethers.providers.TransactionReceipt;
}

export const useTokens = () => {
  const dispatch = useAppDispatch();
  const provider = useAppSelector(selectProvider);
  const addresses = useAppSelector(selectTokenAddresses);
  const symbols = useAppSelector(selectTokenSymbols);
  const balances = useAppSelector(selectTokenBalances);
  const { exchange } = useExchange();

  const tokens = addresses.map(
    (address) => new Contract(address, TOKEN_ABI, provider)
  );

  /**
   * Approves the exchange to spend tokens on behalf of the user
   * @param token The token contract instance
   * @param amount The amount to approve
   * @returns The transaction receipt
   */
  const approveTokens = async (
    token: Contract,
    amount: ethers.BigNumber
  ): Promise<ethers.providers.TransactionReceipt> => {
    if (!provider || !exchange) {
      throw new Error("Provider or Exchange contract is not available");
    }

    const signer = provider.getSigner();
    const approvalTx = await token
      .connect(signer)
      .approve(exchange.address, amount);
    const receipt = await approvalTx.wait();
    return receipt;
  };

  /**
   * Transfers tokens to the exchange
   * @param token The token contract instance
   * @param amount The amount to transfer
   * @returns The result of the transfer operation
   */
  const transferTokens = async (
    token: Contract,
    amount: number
  ): Promise<TokenTransferResult> => {
    if (!provider || !exchange) {
      return {
        success: false,
        error: "Provider or Exchange contract is not available"
      };
    }

    dispatch(transferRequest());

    try {
      const amountToTransfer = ethers.utils.parseUnits(amount.toString(), 18);

      // Approve tokens first
      await approveTokens(token, amountToTransfer);

      // Deposit tokens into exchange
      const signer = provider.getSigner();
      const depositTx = await exchange
        .connect(signer)
        .depositToken(token.address, amountToTransfer);
      const depositReceipt = await depositTx.wait();

      return {
        success: true,
        receipt: depositReceipt
      };
    } catch (error) {
      console.error("❌ Transfer failed:", error);
      dispatch(transferFail());
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred"
      };
    }
  };

  /**
   * Withdraws tokens from the exchange
   * @param token The token contract instance
   * @param amount The amount to withdraw
   * @returns The result of the withdrawal operation
   */
  const withdrawTokens = async (
    token: Contract,
    amount: number
  ): Promise<TokenTransferResult> => {
    if (!provider || !exchange) {
      return {
        success: false,
        error: "Provider or Exchange contract is not available"
      };
    }

    dispatch(transferRequest());

    try {
      const amountToTransfer = ethers.utils.parseUnits(amount.toString(), 18);

      // Withdraw tokens from exchange
      const signer = provider.getSigner();
      const withdrawTx = await exchange
        .connect(signer)
        .withdrawToken(token.address, amountToTransfer);
      const receipt = await withdrawTx.wait();

      return {
        success: true,
        receipt
      };
    } catch (error) {
      console.error("❌ Withdrawal failed:", error);
      dispatch(transferFail());
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred"
      };
    }
  };

  return {
    tokens,
    symbols,
    balances,
    transferTokens,
    withdrawTokens
  };
};
