import { FC, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../lib/hooks";
import { loadTokens, selectTokens } from "../lib/features/tokens/tokensSlice";
import { selectProvider } from "../lib/features/providers/providerSlice";
import configData from "../config.json";
import { ConfigType } from "../app/page";
import { ethers } from "ethers";
import TOKEN_ABI from "../abis/Token.json";
import { loadBalances } from "../lib/features/exchanges/exchangeSlice";

export const config: ConfigType = configData;

export const Markets: FC = () => {
  const dispatch = useAppDispatch();
  const { chainId, connection: provider } = useAppSelector(selectProvider);
  const contracts = useAppSelector(selectTokens);


  useEffect(() => {
   
    const loadBalances = async () => {

      if (!contracts ) {
        throw Error("Tokens not loaded")
      }


      let balance = ethers.utils.formatUnits(
        await contracts[0].balanceOf(account),
        18
      );
      // dispatch({ type: "TOKEN_1_BALANCE_LOADED", balance });

      balance = ethers.utils.formatUnits(
        await exchange.balanceOf(tokens[0].address, account),
        18
      );
      // dispatch({ type: "EXCHANGE_TOKEN_1_BALANCE_LOADED", balance });

      balance = ethers.utils.formatUnits(
        await tokens[1].balanceOf(account),
        18
      );
      // dispatch({ type: "TOKEN_2_BALANCE_LOADED", balance });

      balance = ethers.utils.formatUnits(
        await exchange.balanceOf(tokens[1].address, account),
        18
      );
      // dispatch({ type: "EXCHANGE_TOKEN_2_BALANCE_LOADED", balance });
    };

  loadBalances()
    
  }, [exchange, tokens, account, transferInProgress])



  return (
    <div className="relative ">
      <div className="mb-3">
        <h2>Balance</h2>

        <div>
          <button>Deposit</button>
          <button>Withdraw</button>
        </div>
      </div>

      <hr />
    </div>
  );
};
