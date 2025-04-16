import { FC, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  selectTokenSymbols,
  selectTokenAddresses
} from "../lib/features/tokens/tokensSlice";
import { setSelectedMarket } from "../lib/features/exchanges/exchangeSlice";
import sort from "../assets/sort.svg";
import Image from "next/image";
import { myOpenOrdersSelector } from "../lib/features/exchanges/selectors";
import { DecoratedOrder } from "../lib/features/exchanges/selectors";
import { Banner } from "./Banner";
import ToggleButtonGroup from "./ToggleButtonGroup";

export const Transactions: FC = () => {
  const dispatch = useDispatch();
  const symbols = useSelector(selectTokenSymbols);
  const addresses = useSelector(selectTokenAddresses);
  const myOpenOrders = useSelector(myOpenOrdersSelector);
  const [activeOption, setActiveOption] = useState("Orders");

  // Definir o mercado selecionado quando o componente é montado
  useEffect(() => {
    if (addresses && addresses[0]) {
      dispatch(setSelectedMarket({ market: addresses[0] }));
    }
  }, [addresses, dispatch]);

  if (!myOpenOrders) {
    return (
      <div className="bg-secondary rounded-md p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium">My Orders</h2>
        </div>
        <p className="text-center">Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="bg-secondary rounded-md p-4">
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

      {!myOpenOrders || myOpenOrders.length === 0 ? (
        <Banner text="No Open Orders" />
      ) : (
        <table className="w-full rounded-md overflow-hidden text-left bg-blue-500">
          <thead>
            <tr className="text-gray-500 text-xs">
              <th >
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
            </tr>
          </thead>
          <tbody>
            {myOpenOrders.map((order: DecoratedOrder) => {
              return (
                <tr key={order.id}>
                  <td
                    style={{ color: `${order.orderTypeClass}` }}
                  >
                    {order.token0Amount}
                  </td>
                  <td className="text-right">{order.tokenPrice}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};
