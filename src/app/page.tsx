"use client";

import { ethers } from "ethers";
import configData from "../config.json";
import TOKEN_ABI from "../abis/Token.json";
import { useEffect } from "react";
import { useAppDispatch } from "../lib/hooks";
import { loadProvider } from "../lib/features/providers/providerSlice";

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

  useEffect(() => {
    console.log("Iniciando");

    const loadBlockchainData = async () => {
      // @ts-expect-error: Unreachable code error
      if (typeof window !== "undefined") {
        // @ts-expect-error: Unreachable code error
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts"
        });
        console.log(accounts[0]);

        // Connect Ethers to blockchain
        // @ts-expect-error: Unreachable code  error
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const { chainId, name } = await provider.getNetwork();
        console.log(`Network: ${chainId} ${name}`);

        // Token Smart Contract
        const token = new ethers.Contract(
          config[chainId].DApp.address,
          TOKEN_ABI,
          provider
        );
        console.log(`${token.address}`);
        const symbol = await token.symbol();
        console.log(symbol);

        dispatch(loadProvider(provider));
      }
    };
    loadBlockchainData();
  }, []);

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
