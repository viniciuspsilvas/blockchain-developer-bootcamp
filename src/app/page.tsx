"use client";

import { ethers } from "ethers";
import configData from "../config.json";
import TOKEN_ABI from "../abis/Token.json";
import EXCHANGE_ABI from "../abis/Exchange.json";
import { useEffect } from "react";
import { useAppDispatch } from "../lib/hooks";
import {
  loadAccount,
  loadNetwork,
  loadProvider
} from "../lib/features/providers/providerSlice";
import { loadTokens } from "../lib/features/tokens/tokenSlice";
import { loadExchange } from "../lib/features/exchanges/exchangeSlice";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ethereum?: any;
  }
}

type ConfigType = {
  [key: string]: {
    DApp: { address: string };
    mETH: { address: string };
    mDAI: { address: string };
    exchange: { address: string };
  };
};

const config: ConfigType = configData;

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
          const provider = new ethers.providers.Web3Provider(ethereum);
          const { chainId } = await provider.getNetwork();
          // console.log(`Network: ${network.chainId} ${network.name}`);

          // accounts[0] is the Metamask Original but I dont know why
          const account: string = accounts[0]; // TODO accounts[0]
          dispatch(loadAccount(ethers.utils.getAddress(account)));

          dispatch(loadProvider(provider));
          dispatch(loadNetwork(chainId));

          // Token Smart Contract
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

          const dApp = await DAppToken;
          const dAppSymbol: string = await dApp.symbol();

          const mETH = await mETHToken;
          const mETHSymbol: string = await mETH.symbol();

          dispatch(
            loadTokens({
              symbols: [dAppSymbol, mETHSymbol],
              contracts: [dApp, mETH]
            })
          );

          const exchange = new ethers.Contract(
            config[chainId].exchange.address,
            EXCHANGE_ABI,
            provider
          );

          dispatch(loadExchange({ contract: exchange }));
        } catch (error) {
          console.error("Error while loading blockchain data:", error);
        }
      };

      loadBlockchainData();
    },
    [dispatch]
  );

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      {/* Navbar */}
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        MAIN
        <section className="exchange__section--left grid">
          {/* Markets */}
          {/* Balance */}
          {/* Order */}
        </section>
        <section className="exchange__section--right grid">
          {/* PriceChart */}
          {/* Transactions */}
          {/* Trades */}
          {/* OrderBook */}
        </section>
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
        FOOTER
      </footer>
      {/* Alert */}
    </div>
  );
}
