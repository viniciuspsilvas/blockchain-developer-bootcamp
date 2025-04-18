import { FC, useState } from "react";
import { useSelector } from "react-redux";
import { selectTokenSymbols } from "../lib/features/tokens/tokensSlice";
import sort from "../assets/sort.svg";
import Image from "next/image";
import {
  myOpenOrdersSelector,
  myFilledOrdersSelector
} from "../lib/features/exchanges/selectors";
import { Order } from "../types/exchange";
import { Banner } from "./Banner";
import ToggleButtonGroup from "./ToggleButtonGroup";
import { useExchange } from "../lib/hooks/useExchange";

export const Transactions: FC = () => {
  const symbols = useSelector(selectTokenSymbols);
  const [activeOption, setActiveOption] = useState("Orders");
  const { cancelOrder } = useExchange();

  const myOpenOrders = useSelector(myOpenOrdersSelector);
  const myFilledOrders = useSelector(myFilledOrdersSelector);

  const cancelHandler = (order: Order) => {
    if (order.id) {
      cancelOrder(Number(order.id));
    } else {
      console.error("No order ID found");
    }
  };

  return (
    <div className="bg-secondary rounded-md p-4 h-full">
      <div className="flex justify-between items-center mb-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium">My Orders</h2>
        </div>

        <ToggleButtonGroup
          options={["Orders", "Trades"]}
          activeOption={activeOption}
          onOptionClick={(option: string) => setActiveOption(option)}
        />
      </div>

      {activeOption === "Orders" ? (
        <>
          {!myOpenOrders || myOpenOrders.length === 0 ? (
            <Banner text="No Open Orders" />
          ) : (
            <div className="relative">
              <table className="w-full rounded-md overflow-hidden text-left bg-blue-500">
                <thead className="sticky top-0 bg-blue-500">
                  <tr className="text-gray-500 text-xs">
                    <th>
                      {symbols && symbols[0]}
                      <Image
                        src={sort}
                        alt="Sort"
                        width={16}
                        height={16}
                        className="inline-block ml-2"
                      />
                    </th>
                    <th className="text-right">
                      {symbols && symbols[0]}/{symbols && symbols[1]}
                      <Image
                        src={sort}
                        alt="Sort"
                        width={16}
                        height={16}
                        className="inline-block ml-2"
                      />
                    </th>
                    <th />
                  </tr>
                </thead>
              </table>
              <div className="h-[200px] overflow-y-auto">
                <table className="w-full rounded-md overflow-hidden text-left bg-blue-500">
                  <tbody>
                    {myOpenOrders.map((order: Order) => {
                      return (
                        <tr key={order.id}>
                          <td style={{ color: `${order.orderTypeClass}` }}>
                            {order.token0Amount}
                          </td>
                          <td className="text-right">{order.tokenPrice}</td>
                          <td>
                            <button
                              className="px-2  ml-2 border border-blue text-blue rounded-md text-sm hover:border-white hover:text-white transition-all duration-300"
                              onClick={() => cancelHandler(order)}
                            >
                              Cancel
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          {!myFilledOrders || myFilledOrders.length === 0 ? (
            <Banner text="No Filled Orders" />
          ) : (
            <div className="relative">
              <table className="w-full rounded-md overflow-hidden text-left bg-blue-500">
                <thead className="sticky top-0 bg-blue-500">
                  <tr>
                    <th>
                      Time
                      <Image
                        src={sort}
                        alt="Sort"
                        width={16}
                        height={16}
                        className="inline-block ml-2"
                      />
                    </th>
                    <th>
                      {symbols && symbols[0]}
                      <Image
                        src={sort}
                        alt="Sort"
                        width={16}
                        height={16}
                        className="inline-block ml-2"
                      />
                    </th>
                    <th>
                      {symbols && symbols[0]}/{symbols && symbols[1]}
                      <Image
                        src={sort}
                        alt="Sort"
                        width={16}
                        height={16}
                        className="inline-block ml-2"
                      />
                    </th>
                  </tr>
                </thead>
              </table>
              <div className="h-[200px] overflow-y-auto">
                <table className="w-full rounded-md overflow-hidden text-left bg-blue-500">
                  <tbody>
                    {myFilledOrders &&
                      myFilledOrders.map((order, index) => {
                        return (
                          <tr key={index}>
                            <td>{order.formattedTimestamp}</td>
                            <td style={{ color: `${order.orderTypeClass}` }}>
                              {order.orderSign}
                              {order.token0Amount}
                            </td>
                            <td>{order.tokenPrice}</td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
