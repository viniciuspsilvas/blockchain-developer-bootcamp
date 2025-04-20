"use client";

import { FC, useState } from "react";
import ToggleButtonGroup from "./ToggleButtonGroup";
import { useTokens } from "../lib/hooks/useTokens";
import { useExchange } from "../lib/hooks/useExchange";

export const Order: FC = () => {
  const [orderType, setOrderType] = useState<"buy" | "sell">("buy");
  const [amount, setAmount] = useState<number>(0);
  const [price, setPrice] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const { tokens } = useTokens();
  const { makeBuyOrder } = useExchange();

  const buyHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
      
    const result = await makeBuyOrder(amount, price, tokens);
    if (result.success) {
      setAmount(0);
      setPrice(0);
    } else {
      setError(result.error || "Failed to place buy order");
    }
  };

  const sellHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
      
    // For sell orders, we reverse the token order and adjust the price
    const result = await makeBuyOrder(amount, 1/price, [tokens[1], tokens[0]]);
    if (result.success) {
      setAmount(0);
      setPrice(0);
    } else {
      setError(result.error || "Failed to place sell order");
    }
  };

  const isBuy = orderType === "buy";

  return (
    <div className="bg-secondary rounded-md p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium">New Order</h2>
        <ToggleButtonGroup
          options={["Buy", "Sell"]}
          activeOption={isBuy ? "Buy" : "Sell"}
          onOptionClick={(option: string) =>
            setOrderType(option.toLowerCase() as "buy" | "sell")
          }
        />
      </div>

      {error && (
        <div className="mb-4 p-2 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <form
        onSubmit={isBuy ? buyHandler : sellHandler}
        className="w-full flex flex-col space-y-3"
      >
        <label htmlFor="amount" className="text-sm text-neutral">
          {isBuy ? "Buy Amount" : "Sell Amount"}
        </label>
        <input
          type="text"
          id="amount"
          placeholder="0.0000"
          className="bg-primary text-white p-2 rounded-md w-full"
          value={amount === 0 ? "" : amount}
          onChange={(e) => setAmount(Number(e.target.value) || 0)}
        />

        <label htmlFor="price" className="text-sm text-neutral">
          {isBuy ? "Buy Price" : "Sell Price"}
        </label>
        <input
          type="text"
          id="price"
          placeholder="0.0000"
          className="bg-primary text-white p-2 rounded-md w-full"
          value={price === 0 ? "" : price}
          onChange={(e) => setPrice(Number(e.target.value) || 0)}
        />

        <button
          type="submit"
          className="px-4 py-2 border border-blue text-white rounded-md bg-blue hover:border-white transition-colors duration-200"
        >
          {isBuy ? "Buy Order" : "Sell Order"}
        </button>
      </form>
    </div>
  );
};
