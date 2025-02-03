"use client";

import { ethers } from "ethers";
import TOKEN_ABI from "../abis/Token.json";
import EXCHANGE_ABI from "../abis/Exchange.json";
import { useEffect } from "react";
import { useAppDispatch } from "../lib/hooks";
import {
  loadAccount,
  loadBalance,
  loadNetwork,
  loadProvider
} from "../lib/features/providers/providerSlice";
import { loadTokens } from "../lib/features/tokens/tokenSlice";
import { loadExchange } from "../lib/features/exchanges/exchangeSlice";

import configData from "../config.json";
import { Navbar } from "../components/navbar";
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ethereum?: any;
  }
}

type ConfigType = {
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
      if (typeof window === "undefined") return; // Garante que não roda no SSR

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

          // Connect Ethers to blockchain
          const account = ethers.utils.getAddress(accounts[0]);
          const provider = new ethers.providers.Web3Provider(ethereum);
          const { chainId } = await provider.getNetwork();
          const balance = ethers.utils.formatEther(
            await provider.getBalance(account)
          );

          dispatch(loadProvider(provider));
          dispatch(loadNetwork(`${chainId}`));
          dispatch(loadBalance(balance));

          // Token Smart Contracts
          const DAppToken = new ethers.Contract(
            config[chainId].DApp.address,
            TOKEN_ABI,
            provider
          );

          const mETHToken = new ethers.Contract(
            config[chainId].mETH.address,
            TOKEN_ABI,
            provider
          );

          const dAppSymbol: string = await DAppToken.symbol();
          const mETHSymbol: string = await mETHToken.symbol();

          dispatch(
            loadTokens({
              symbols: [dAppSymbol, mETHSymbol],
              contracts: [DAppToken, mETHToken]
            })
          );

          const exchange = new ethers.Contract(
            config[chainId].exchange.address,
            EXCHANGE_ABI,
            provider
          );

          dispatch(loadExchange({ contract: exchange }));

          // Fetch current account & balance from Metamask when changed
          window.ethereum.on("accountsChanged", async (_accounts: string[]) => {
            const _account = _accounts[0];
            dispatch(loadAccount(ethers.utils.getAddress(_account)));
            const _balance = ethers.utils.formatEther(
              await provider.getBalance(_account)
            );

            dispatch(loadBalance(_balance));
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

      <main className="grid grid-cols-12 ">
        {/* Left Section */}
        <section className="grid bg-secondary p-8 col-span-12">
          {/* Markets */}
          {/* Balance */}
          {/* Order */}
        </section>
        {/* Right Section */}
        <section className="grid ">
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
