import { Contract, ethers } from "ethers";
import { useAppSelector } from "../hooks";
import { selectExchangeAddress } from "../features/exchanges/exchangeSlice";
import EXCHANGE_ABI from "../../abis/Exchange.json";

export const useExchange = (provider: ethers.providers.Provider) => {
  const address = useAppSelector(selectExchangeAddress);

  if (!address) return null;

  return new Contract(address, EXCHANGE_ABI, provider);
};
