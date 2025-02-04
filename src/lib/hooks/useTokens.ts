import { Contract, ethers } from "ethers";
import { useAppSelector } from "../hooks";
import { selectTokenAddresses, selectTokenSymbols } from "../features/tokens/tokensSlice";
import TOKEN_ABI from "../../abis/Token.json";

export const useTokens = (provider: ethers.providers.Provider) => {
  const addresses = useAppSelector(selectTokenAddresses);
  const symbols = useAppSelector(selectTokenSymbols);

  const contracts = addresses.map((address) => new Contract(address, TOKEN_ABI, provider));

  return { contracts, symbols };
};
