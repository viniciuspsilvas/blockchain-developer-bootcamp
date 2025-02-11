import { FC } from "react";
import { useAppDispatch, useAppSelector } from "../lib/hooks";
import { loadTokens } from "../lib/features/tokens/tokensSlice";
import {
  selectChainId,
  selectProvider
} from "../lib/features/providers/providerSlice";
import configData from "../config.json";
import { ConfigType } from "../app/page";
import { ethers } from "ethers";
import TOKEN_ABI from "../abis/Token.json";

export const config: ConfigType = configData;

export const Markets: FC = () => {
  const dispatch = useAppDispatch();
  const provider = useAppSelector(selectProvider);
  const chainId = useAppSelector(selectChainId) || "0"; // Ensure network is always a string

  const marketHandler = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!provider) {
      console.error("Provider is not available");
      return;
    }

    try {
      const [token1Address, token2Address] = e.target.value.split(",");

      // Create contract instances for the selected tokens
      const token1Contract = new ethers.Contract(
        token1Address,
        TOKEN_ABI,
        provider
      );
      const token2Contract = new ethers.Contract(
        token2Address,
        TOKEN_ABI,
        provider
      );

      // Fetch token symbols
      const token1Symbol = await token1Contract.symbol();
      const token2Symbol = await token2Contract.symbol();

      // Dispatch the loadTokens action with the fetched data
      dispatch(
        loadTokens({
          symbols: [token1Symbol, token2Symbol],
          addresses: [token1Address, token2Address] // Store addresses instead of contracts
        })
      );
    } catch (error) {
      console.error("Error while handling market selection:", error);
    }
  };

  return (
    <div className="relative">
      <div className="mb-2">
        <h2>Select Market</h2>
      </div>

      {chainId !== "0" && config[chainId]
        ? <select
            name="markets"
            id="markets"
            onChange={marketHandler}
            className="border border-gray-500 bg-primary text-white p-2 rounded-md w-full"
          >
            <option
              value={`${config[chainId].DApp.address},${config[chainId].mETH
                .address}`}
            >
              DApp / mETH
            </option>
            <option
              value={`${config[chainId].DApp.address},${config[chainId].mDAI
                .address}`}
            >
              DApp / mDAI
            </option>
          </select>
        : <div>
            <p className="p-4">Not Deployed to Network</p>
          </div>}

      <hr className="border-gray-800 my-8" />
    </div>
  );
};
