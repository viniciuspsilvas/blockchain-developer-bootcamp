import { FC, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  selectTokenSymbols,
  selectTokenAddresses
} from "../lib/features/tokens/tokensSlice";
import { setSelectedMarket } from "../lib/features/exchanges/exchangeSlice";
import sort from "../assets/sort.svg";
import Image from "next/image";
import { filledOrdersSelector } from "../lib/features/exchanges/selectors";
import { Order } from "../types/exchange";
import { Banner } from "./Banner";

export const Trades: FC = () => {
  const dispatch = useDispatch();
  const symbols = useSelector(selectTokenSymbols);
  const filledOrders = useSelector(filledOrdersSelector);
  const addresses = useSelector(selectTokenAddresses);

  // Definir o mercado selecionado quando o componente é montado
  useEffect(() => {
    if (addresses && addresses[0]) {
      dispatch(setSelectedMarket({ market: addresses[0] }));
    }
  }, [addresses, dispatch]);

  if (!filledOrders) {
    return (
      <div className="bg-secondary rounded-md p-4 h-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium">Trades</h2>
        </div>
        <p className="text-center">Loading trades...</p>
      </div>
    );
  }

  return (
    <div className="bg-secondary rounded-md p-4 h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium">Trades</h2>
      </div>

      {!filledOrders || filledOrders.length === 0 ? (
        <Banner text="No Transactions" />
      ) : (
        <div className="relative">
          <table className="w-full rounded-md overflow-hidden text-left bg-blue-500">
            <thead className="sticky top-0 bg-blue-500">
              <tr className="text-gray-500 text-xs">
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
                <th className="text-right">
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
          </table>
          <div className="h-[200px] overflow-y-auto">
            <table className="w-full rounded-md overflow-hidden text-left bg-blue-500">
              <tbody>
                {filledOrders.map((order: Order) => {
                  return (
                    <tr key={order.id}>
                      <td>{order.formattedTimestamp}</td>
                      <td
                        className="text-right"
                        style={{ color: `${order.tokenPriceClass}` }}
                      >
                        {order.token0Amount}
                      </td>
                      <td className="text-right">{order.tokenPrice}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
