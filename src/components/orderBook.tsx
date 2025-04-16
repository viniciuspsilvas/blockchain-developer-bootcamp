import { FC, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectTokenSymbols, selectTokenAddresses } from "../lib/features/tokens/tokensSlice";
import { selectOrderBook, setSelectedMarket } from "../lib/features/exchanges/exchangeSlice";
import sort from "../assets/sort.svg";
import Image from "next/image";


export const OrderBook: FC = () => {
  const dispatch = useDispatch();
  const symbols = useSelector(selectTokenSymbols);
  const addresses = useSelector(selectTokenAddresses);
  const orderBook = useSelector(selectOrderBook);

  // Definir o mercado selecionado quando o componente é montado
  useEffect(() => {
    if (addresses && addresses[0]) {
      dispatch(setSelectedMarket({ market: addresses[0] }));
    }
  }, [addresses, dispatch]);

  if (!orderBook) {
    return (
      <div className="bg-secondary rounded-md p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium">Order Book</h2>
        </div>
        <p className="text-center">Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="bg-secondary rounded-md p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium">Order Book</h2>
      </div>

      <div className="grid grid-cols-2 gap-8">
        {/* Sell Orders */}
        <div>
          {orderBook.sellOrders.length === 0 ? (
            <p className="text-center">No Sell Orders</p>
          ) : (
            <table className="w-full rounded-md overflow-hidden text-left bg-blue-500">
              <caption className="text-left text-sm font-medium mb-2">
                Selling
              </caption>
              <thead>
                <tr className="text-gray-500 text-xs">
                  <th >
                    {symbols && symbols[0]}
                    <Image
                      src={sort}
                      alt="Sort"
                      width={24}
                      height={24}
                      className="cursor-pointer inline-block ml-2"
                    />
                  </th>
                  <th className="text-right">
                    {symbols && symbols[0]}/{symbols && symbols[1]}
                    <Image src={sort} alt="Sort" width={16} height={16} className="inline-block ml-2" />
                  </th>
                  <th className="text-right">
                    {symbols && symbols[1]}
                    <Image src={sort} alt="Sort" width={16} height={16} className="inline-block ml-2" />
                  </th>
                </tr>
              </thead>
              <tbody>
                {orderBook.sellOrders.map((order, index) => (
                  <tr key={index} className="hover:bg-primary">
                    <td >{order.token0Amount}</td>
                    <td className="text-right" style={{ color: order.orderTypeClass }}>{order.tokenPrice}</td>
                    <td className="text-right">{order.token1Amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Buy Orders */}
        <div>
          {orderBook.buyOrders.length === 0 ? (
            <p className="text-center">No Buy Orders</p>
          ) : (
            <table className="w-full rounded-md overflow-hidden text-left bg-blue-500">
              <caption className="text-left text-sm font-medium mb-2">
                Buying
              </caption>
              <thead>
                <tr className="text-gray-500 text-xs">
                  <th >
                    {symbols && symbols[0]}
                    <Image
                      src={sort}
                      alt="Sort"
                      width={24}
                      height={24}
                      className="cursor-pointer inline-block ml-2"
                    />
                  </th>
                  <th className="text-right">
                    {symbols && symbols[0]}/{symbols && symbols[1]}
                    <Image src={sort} alt="Sort" width={16} height={16} className="inline-block ml-2" />
                  </th>
                  <th className="text-right">
                    {symbols && symbols[1]}
                    <Image src={sort} alt="Sort" width={16} height={16} className="inline-block ml-2" />
                  </th>
                </tr>
              </thead>
              <tbody>
                {orderBook.buyOrders.map((order, index) => (
                  <tr key={index} className="hover:bg-primary">
                    <td >{order.token0Amount}</td>
                    <td className="text-right" style={{ color: order.orderTypeClass }}>{order.tokenPrice}</td>
                    <td className="text-right">{order.token1Amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

