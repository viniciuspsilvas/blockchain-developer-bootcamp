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
  loadAllOrderBook,
  transferSuccess,
  orderSuccess
} from "../lib/features/exchanges/exchangeSlice";
import { filterAndMapEvents } from "../lib/utils/eventMappers";

import configData from "../config.json";
import { Navbar } from "../components/navbar";
import { Markets } from "../components/markets";
import { Balance } from "../components/balance";
import EXCHANGE_ABI from "../abis/Exchange.json";
import { Order } from "../components/order";
import { OrderBook } from "../components/orderBook";
import { PriceChart } from "../components/priceChart";

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

  useEffect(() => {
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
        const exchange = new Contract(exchangeAddress, EXCHANGE_ABI, provider);

        dispatch(loadExchange({ address: exchangeAddress }));

        // Load initial order book
        const block = await provider.getBlockNumber();

        // Fetch and process all order events
        const [cancelStream, tradeStream, orderStream] = await Promise.all([
          exchange.queryFilter("Cancel", 0, block),
          exchange.queryFilter("Trade", 0, block),
          exchange.queryFilter("Order", 0, block)
        ]);

        const [cancelledOrders, filledOrders, allOrders] = [
          filterAndMapEvents(cancelStream),
          filterAndMapEvents(tradeStream),
          filterAndMapEvents(orderStream)
        ];

        dispatch(loadAllOrderBook({ 
          allOrders,
          cancelledOrders,
          filledOrders
        }));

        // Listen to events
        exchange.on("Deposit", () => {
          dispatch(transferSuccess());
        });

        exchange.on("Withdraw", () => {
          dispatch(transferSuccess());
        });

        exchange.on(
          "Order",
          (id, user, tokenGet, amountGet, tokenGive, amountGive, timestamp, event) => {
            const order = {
              id: id.toString(),
              user,
              tokenGet,
              amountGet,
              tokenGive,
              amountGive,
              timestamp,
              token0Amount: amountGet.toString(),
              token1Amount: amountGive.toString(),
              tokenPrice: (amountGet / amountGive).toString(),
              orderTypeClass: event.args?.orderTypeClass
            };
            dispatch(orderSuccess({ order }));
          }
        );

        exchange.on(
          "Cancel",
          (id, user, tokenGet, amountGet, tokenGive, amountGive, timestamp, event) => {
            const order = {
              id: id.toString(),
              user,
              tokenGet,
              amountGet,
              tokenGive,
              amountGive,
              timestamp,
              token0Amount: amountGet.toString(),
              token1Amount: amountGive.toString(),
              tokenPrice: (amountGet / amountGive).toString(),
              orderTypeClass: event.args?.orderTypeClass
            };
            dispatch(orderSuccess({ order }));
          }
        );

        // Fetch current account & balance from Metamask when changed
        window.ethereum.on("accountsChanged", async (_accounts: string[]) => {
          const _account = _accounts[0];
          dispatch(loadAccount(ethers.utils.getAddress(_account)));
          const _balance = ethers.utils.formatEther(
            await provider.getBalance(_account)
          );
          dispatch(loadBalance(_balance));
        });

        // Reload page when network changes
        window.ethereum.on("chainChanged", () => {
          window.location.reload();
        });
      } catch (error) {
        console.error("Error while loading blockchain data:", error);
      }
    };

    loadBlockchainData();
  }, [dispatch]);

  return (
    <div className="min-h-screen font-dm-sans text-white bg-primary">
      <Navbar />

      <main className="grid grid-cols-12">
        {/* Left Section */}
        <section className="grid bg-secondary p-8 col-span-3">
          <Markets />
          <Balance />
          <Order />
        </section>
        {/* Right Section */}
        <section className="grid bg-primary p-8 col-span-9 gap-8">
          <PriceChart />
          {/* Transactions */}
          {/* Trades */}
          <OrderBook />
        </section>
      </main>

      {/* Alert */}
    </div>
  );
}
