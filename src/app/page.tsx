"use client";

import { ethers } from "ethers";
import configData from "../config.json";
import TOKEN_ABI from "../abis/Token.json";
import { useEffect, useState } from "react";
import { useAppDispatch } from "../lib/hooks";
import { loadProvider } from "../lib/features/providers/providerSlice";

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
            console.error("MetaMask não detectado");
            return;
          }

          const ethereum = window.ethereum;
          const accounts = await ethereum.request({
            method: "eth_requestAccounts"
          });

          console.log(accounts[0]);

          const web3Provider = new ethers.providers.Web3Provider(ethereum);
          const network = await web3Provider.getNetwork();
          console.log(`Network: ${network.chainId} ${network.name}`);

          dispatch(loadProvider(web3Provider));
        } catch (error) {
          console.error("Erro ao carregar blockchain data:", error);
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
