"use client";

import { Contract, ethers } from "ethers";
import TOKEN_ABI from "../abis/Token.json";
import { useEffect } from "react";
import { useAppDispatch } from "../lib/hooks";
import {
  loadAccount,
  loadBalance,
  loadNetwork,
  loadProvider
} from "../lib/features/providers/providerSlice";
import { loadTokens } from "../lib/features/tokens/tokensSlice";
import {
  loadExchange,
  transferSuccess
} from "../lib/features/exchanges/exchangeSlice";

import configData from "../config.json";
import { Navbar } from "../components/navbar";
import { Markets } from "../components/markets";
import { Balance } from "../components/balance";
import EXCHANGE_ABI from "../abis/Exchange.json";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ethereum?: any;
  }
}

export type ConfigType = {
  [key: string]: {
    explorerURL: string;
    DApp: { address: string };
    mETH: { address: string };
    mDAI: { address: string };
    exchange: { address: string };
  };
};

export const config: ConfigType = configData;

export default function Home() {
  const dispatch = useAppDispatch();

  useEffect(
    () => {
      if (typeof window === "undefined") return;

      const loadBlockchainData = async () => {
        try {
          if (!window.ethereum) {
            console.error("MetaMask not detected");
            return;
          }

          const ethereum = window.ethereum;
          const accounts = await ethereum.request({
            method: "eth_requestAccounts"
          });

          // Get account
          const account = ethers.utils.getAddress(accounts[0]);

          // Connect Ethers to blockchain
          const provider = new ethers.providers.Web3Provider(ethereum);
          const { chainId } = await provider.getNetwork();
          const balance = ethers.utils.formatEther(
            await provider.getBalance(account)
          );

          dispatch(loadProvider(provider));
          dispatch(loadNetwork(`${chainId}`));
          dispatch(loadBalance(balance));
          dispatch(loadAccount(account));

          // Store only token addresses & symbols in Redux
          const tokenAddresses = [
            config[chainId].DApp.address,
            config[chainId].mETH.address
          ];

          const DAppToken = new ethers.Contract(
            tokenAddresses[0],
            TOKEN_ABI,
            provider
          );
          const mETHToken = new ethers.Contract(
            tokenAddresses[1],
            TOKEN_ABI,
            provider
          );
          const dAppSymbol: string = await DAppToken.symbol();
          const mETHSymbol: string = await mETHToken.symbol();

          dispatch(
            loadTokens({
              symbols: [dAppSymbol, mETHSymbol],
              addresses: tokenAddresses
            })
          );

          // Store exchange address in Redux
          const exchangeAddress = config[chainId].exchange.address;
          const exchange = new Contract(
            exchangeAddress,
            EXCHANGE_ABI,
            provider
          );

          dispatch(loadExchange({ address: exchangeAddress }));

          // Fetch current account & balance from Metamask when changed
          window.ethereum.on("accountsChanged", async (_accounts: string[]) => {
            const _account = _accounts[0];
            dispatch(loadAccount(ethers.utils.getAddress(_account)));
            const _balance = ethers.utils.formatEther(
              await provider.getBalance(_account)
            );
            dispatch(loadBalance(_balance));
          });

          // Listen to events
          exchange.on("Deposit", (token, user, amount, balance, event) => {
            dispatch(transferSuccess(event));
          });
        } catch (error) {
          console.error("Error while loading blockchain data:", error);
        }

        // Reload page when network changes
        window.ethereum.on("chainChanged", () => {
          console.log("chainChanged");
          window.location.reload();
        });
      };

      loadBlockchainData();
    },
    [dispatch]
  );

  return (
    <div className="min-h-screen font-dm-sans text-white bg-primary">
      <Navbar />

      <main className="grid grid-cols-12">
        {/* Left Section */}
        <section className="grid bg-secondary p-8 col-span-3">
          <Markets />
          <Balance />
          {/* Order */}
        </section>
        {/* Right Section */}
        <section className="grid bg-primary p-8 col-span-9">
          Right Section
          {/* PriceChart */}
          {/* Transactions */}
          {/* Trades */}
          {/* OrderBook */}
        </section>
      </main>

      {/* Alert */}
    </div>
  );
}
