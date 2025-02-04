import { Contract } from "ethers";
import { useAppSelector } from "../hooks";
import { selectExchangeAddress, selectExchangeBalances } from "../features/exchanges/exchangeSlice";
import EXCHANGE_ABI from "../../abis/Exchange.json";
import { selectProvider } from "../features/providers/providerSlice";

export const useExchange = () => {
  const address = useAppSelector(selectExchangeAddress);
  const balances = useAppSelector(selectExchangeBalances);
  const provider = useAppSelector(selectProvider);

  if (!address) return { exchange: null, balances };

  return { exchange: new Contract(address, EXCHANGE_ABI, provider), balances };
};
