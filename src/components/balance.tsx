import { FC, FormEvent, useEffect, useState } from "react";
import { useAppDispatch } from "../lib/hooks";
import { selectAccount } from "../lib/features/providers/providerSlice";
import configData from "../config.json";
import { ConfigType } from "../app/page";
import { ethers } from "ethers";
import dapp from "../assets/dapp.svg";
import eth from "../assets/eth.svg";
import Image from "next/image";
import { useSelector } from "react-redux";
import {
  loadTokenBalance,
  selectTokenAddresses,
  selectTokenSymbols
} from "../lib/features/tokens/tokensSlice";
import { useTokens } from "../lib/hooks/useTokens";
import { useExchange } from "../lib/hooks/useExchange";
import {
  loadExchangeBalance,
  selectTransferInProgress
} from "../lib/features/exchanges/exchangeSlice";
import ToggleButtonGroup from "./ToggleButtonGroup";
import { Loading } from "./Loading";

export const config: ConfigType = configData;

export const Balance: FC = () => {
  const [isDeposit, setIsDeposit] = useState(true);
  const [token1TransferAmount, setToken1TransferAmount] = useState(0);
  const [token2TransferAmount, setToken2TransferAmount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const symbols = useSelector(selectTokenSymbols);
  const tokenAddresses = useSelector(selectTokenAddresses);
  const account = useSelector(selectAccount);
  const transferInProgress = useSelector(selectTransferInProgress);

  const {
    tokens,
    balances: tokenBalances,
    transferTokens,
    withdrawTokens
  } = useTokens();
  const { exchange, balances: exchangeBalances } = useExchange();

  const dispatch = useAppDispatch();

  useEffect(() => {
    const loadBalances = async () => {
      // Only run if we have all required data
      if (!tokenAddresses?.length || !exchange || !account || !tokens?.length) {
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Initialize separate arrays to store balances
        const tokenBalances: string[] = [];
        const exchangeBalances: string[] = [];

        // Fetch balances for all tokens
        for (const token of tokens) {
          // Fetch token balance
          const tokenBal = await token.balanceOf(account);
          const formattedTokenBal = ethers.utils.formatEther(tokenBal);
          tokenBalances.push(formattedTokenBal);

          // Fetch exchange balance
          const exchangeBal = await exchange.balanceOf(token.address, account);
          const formattedExchangeBal = ethers.utils.formatEther(exchangeBal);
          exchangeBalances.push(formattedExchangeBal);
        }

        // Dispatch both balances as arrays
        dispatch(loadTokenBalance({ balances: tokenBalances }));
        dispatch(loadExchangeBalance({ balances: exchangeBalances }));
        setError(null);
      } catch (error) {
        console.error("Error loading balances:", error);
        setError("Failed to load balances");
      } finally {
        setIsLoading(false);
      }
    };

    loadBalances();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, tokenAddresses, transferInProgress]); // Removed exchange and tokens from dependencies

  if (!tokenAddresses?.length || !exchange || !account || !tokens?.length) {
    return <Loading />;
  }

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="bg-secondary rounded-md p-4">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  const amountHandler = (
    e: { target: { value: string } },
    token: { address: string }
  ) => {
    if (token.address === tokens[0].address) {
      setToken1TransferAmount(Number(e.target.value));
    } else if (token.address === tokens[1].address) {
      setToken2TransferAmount(Number(e.target.value));
    }
  };

  const depositHandler = async (
    e: FormEvent<HTMLFormElement>,
    token: ethers.Contract
  ) => {
    e.preventDefault();

    if (token.address === tokens[0].address) {
      const result = await transferTokens(token, token1TransferAmount);
      if (result.success) {
        setToken1TransferAmount(0);
      } else {
        console.error("Deposit failed:", result.error);
      }
    } else if (token.address === tokens[1].address) {
      const result = await transferTokens(token, token2TransferAmount);
      if (result.success) {
        setToken2TransferAmount(0);
      } else {
        console.error("Deposit failed:", result.error);
      }
    }
  };

  const withdrawHandler = async (
    e: FormEvent<HTMLFormElement>,
    token: ethers.Contract
  ) => {
    e.preventDefault();

    if (token.address === tokens[0].address) {
      const result = await withdrawTokens(token, token1TransferAmount);
      if (result.success) {
        setToken1TransferAmount(0);
      } else {
        console.error("Withdrawal failed:", result.error);
      }
    } else if (token.address === tokens[1].address) {
      const result = await withdrawTokens(token, token2TransferAmount);
      if (result.success) {
        setToken2TransferAmount(0);
      } else {
        console.error("Withdrawal failed:", result.error);
      }
    }
  };

  return (
    <div className="bg-secondary rounded-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium">Balance</h2>
        <ToggleButtonGroup
          options={["Deposit", "Withdraw"]}
          activeOption={isDeposit ? "Deposit" : "Withdraw"}
          onOptionClick={(option: string) => setIsDeposit(option === "Deposit")}
        />
      </div>

      {/* Deposit/Withdraw Component 1 (DApp) */}
      <div className="mb-4">
        <div className="flex justify-between items-center p-4  rounded-md">
          <p className="text-sm">
            <small className="text-neutral">Token2</small>
            <br />
            <Image
              src={dapp}
              alt="ETH Token Logo"
              width={20}
              height={20}
              className="inline-block mr-2"
              style={{ width: 'auto', height: 'auto' }}
            />
            {symbols && symbols[0]}
          </p>
          <p className="text-sm">
            <small className="text-neutral">Wallet</small>
            <br />

            {tokenBalances && Number(tokenBalances[0]).toFixed(1)}
          </p>
          <p className="text-sm">
            <small className="text-neutral">Exchange</small>
            <br />
            {exchangeBalances && Number(exchangeBalances[0]).toFixed(1)}
          </p>
        </div>

        <form
          className="w-full flex flex-col space-y-2"
          onSubmit={
            isDeposit
              ? (e) => depositHandler(e, tokens[0])
              : (e) => withdrawHandler(e, tokens[0])
          }
        >
          <label htmlFor="token1" className="text-sm text-neutral">
            Amount
          </label>
          <input
            type="text"
            id="token1"
            placeholder="0.0000"
            className="bg-primary text-white p-2 rounded-md w-full"
            value={token1TransferAmount === 0 ? "" : token1TransferAmount}
            onChange={(e) => amountHandler(e, tokens[0])}
          />
          <button
            type="submit"
            className="px-4 py-2 border border-blue text-blue rounded-md"
          >
            {isDeposit ? "Deposit" : "Withdraw"}
          </button>
        </form>
      </div>

      <hr className="border-gray-800 my-8" />

      {/* Deposit/Withdraw Component 2 (mETH) */}
      <div className="mb-4">
        <div className="flex justify-between items-center p-4  rounded-md">
          <p className="text-sm">
            <small className="text-neutral">Token3</small>
            <br />
            <Image
              src={eth}
              alt="ETH Token Logo"
              width={20}
              height={20}
              className="inline-block mr-2"
              style={{ width: 'auto', height: 'auto' }}
            />
            {symbols && symbols[1]}
          </p>
          <p className="text-sm">
            <small className="text-neutral">Wallet</small>
            <br />

            {tokenBalances && Number(tokenBalances[1]).toFixed(1)}
          </p>
          <p className="text-sm">
            <small className="text-neutral">Exchange</small>
            <br />
            {exchangeBalances && Number(exchangeBalances[1]).toFixed(1)}
          </p>
        </div>

        <form
          className="w-full flex flex-col space-y-2"
          onSubmit={
            isDeposit
              ? (e) => depositHandler(e, tokens[1])
              : (e) => withdrawHandler(e, tokens[1])
          }
        >
          <label htmlFor="token2" className="text-sm text-neutral">
            Amount
          </label>
          <input
            type="text"
            id="token2"
            placeholder="0.0000"
            className="bg-primary text-white p-2 rounded-md w-full"
            value={token2TransferAmount === 0 ? "" : token2TransferAmount}
            onChange={(e) => amountHandler(e, tokens[1])}
          />
          <button
            type="submit"
            className="px-4 py-2 border border-blue text-blue rounded-md"
          >
            {isDeposit ? "Deposit" : "Withdraw"}
          </button>
        </form>
      </div>

      <hr className="border-gray-800 my-8" />
    </div>
  );
};
