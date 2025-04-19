import { FC } from "react";
import { selectTokenSymbols } from "../lib/features/tokens/tokensSlice";
import { priceChartSelector } from "../lib/features/exchanges/selectors";
import Image from "next/image";
import Chart from "react-apexcharts";
import arrowDown from "../assets/down-arrow.svg";
import arrowUp from "../assets/up-arrow.svg";
import { defaultSeries, options } from "./PriceChart.config";
import { selectAccount } from "../lib/features/providers/providerSlice";
import { useAppSelector } from "../lib/hooks";
import { Banner } from "./Banner";

export const PriceChart: FC = () => {
  const symbols = useAppSelector(selectTokenSymbols);
  const account = useAppSelector(selectAccount);
  const priceChart = useAppSelector(priceChartSelector);

  return (
    <div className="bg-secondary rounded-md p-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
          <h2>{symbols && `${symbols[0]}/${symbols[1]}`}</h2>
          {priceChart && (
            <div className="flex items-center gap-2">
              {priceChart.lastPriceChange === "+" ? (
                <Image src={arrowUp} alt="Arrow up" width={60} height={60} style={{ width: 'auto', height: 'auto' }} />
              ) : (
                <Image src={arrowDown} alt="Arrow down" width={60} height={60} style={{ width: 'auto', height: 'auto' }} />
              )}
              <span className="up">{priceChart.lastPrice}</span>
            </div>
          )}
        </div>
      </div>

      {!account ? (
        <Banner text={"Please connect with Metamask"} />
      ) : (
        <Chart
          options={options}
          series={priceChart?.series || defaultSeries}
          type="candlestick"
          width="100%"
          height="100%"
        />
      )}
    </div>
  );
};
