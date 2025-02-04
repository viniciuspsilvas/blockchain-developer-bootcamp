import { FC, useEffect } from "react";
import { useAppDispatch } from "../lib/hooks";
import { selectAccount } from "../lib/features/providers/providerSlice";
import configData from "../config.json";
import { ConfigType } from "../app/page";
import { ethers } from "ethers";
import dapp from "../assets/dapp.svg";
import Image from "next/image";
import { useSelector } from "react-redux";
import {
  loadTokenBalance,
  selectTokenAddresses,
  selectTokenSymbols
} from "../lib/features/tokens/tokensSlice";
import { useTokens } from "../lib/hooks/useTokens";
import { useExchange } from "../lib/hooks/useExchange";
import { loadExchangeBalance } from "../lib/features/exchanges/exchangeSlice";

export const config: ConfigType = configData;

export const Balance: FC = () => {
  const symbols = useSelector(selectTokenSymbols);
  const tokenAddresses = useSelector(selectTokenAddresses);
  const account = useSelector(selectAccount);

  const { tokens, balances: tokenBalances } = useTokens();
  const { exchange, balances: exchangeBalances } = useExchange();

  const dispatch = useAppDispatch();

  useEffect(
    () => {
      const loadBalances = async () => {
        if (!tokenAddresses) {
          throw Error("Tokens not loaded");
        }

        if (!exchange) {
          // throw Error("Exchange not loaded");
          return;
        }

        let balance = ethers.utils.formatUnits(
          await tokens[0].balanceOf(account),
          18
        );

        dispatch(loadTokenBalance({ balance }));

        balance = ethers.utils.formatUnits(
          await exchange.balanceOf(tokens[0].address, account),
          18
        );

        dispatch(loadExchangeBalance({ balance }));

        balance = ethers.utils.formatUnits(
          await tokens[1].balanceOf(account),
          18
        );

        dispatch(loadTokenBalance({ balance }));

        balance = ethers.utils.formatUnits(
          await exchange.balanceOf(tokens[1].address, account),
          18
        );

        dispatch(loadExchangeBalance({ balance }));
      };

      loadBalances();
    },
    [exchange, tokens, account, tokenAddresses, dispatch]
  );

  return (
    <div className="bg-secondary rounded-md">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium">Balance</h2>
        <div className="bg-primary rounded-md p-1 flex space-x-2">
          <button className="px-4 py-1 bg-blue-500 text-white rounded-md">
            Deposit
          </button>
          <button className="px-4 py-1 text-white">Withdraw</button>
        </div>
      </div>

      {/* Deposit/Withdraw Component 1 (DApp) */}
      <div className="mb-4">
        <div className="flex justify-between items-center p-4 bg-primary rounded-md">
          <p className="text-sm">
            <small className="text-neutral">Token</small>
            <br />
            <Image
              src={dapp}
              alt="ETH Token Logo"
              width={20}
              height={20}
              className="inline-block mr-2"
            />
            {symbols && symbols[0]}
          </p>
          <p className="text-sm">
            <small className="text-neutral">Wallet</small>
            <br />
            {tokenBalances && tokenBalances[0]}
          </p>
          <p className="text-sm">
            <small className="text-neutral">Exchange</small>
            <br />
            {exchangeBalances && exchangeBalances[0]}
          </p>
        </div>
      </div>

      <hr className="border-gray-600 my-4" />

      {/* Deposit/Withdraw Component 2 (mETH) */}
      <div className="mb-4">
        <div className="flex justify-between items-center p-4 bg-primary rounded-md">
          <form className="w-full flex flex-col space-y-2">
            <label htmlFor="token1" className="text-sm text-neutral">
              Amount
            </label>
            <input
              type="text"
              id="token1"
              placeholder="0.0000"
              className="bg-secondary text-white p-2 rounded-md w-full"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md"
            >
              Deposit
            </button>
          </form>
        </div>
      </div>

      <hr className="border-gray-600 my-4" />
    </div>
  );
};
