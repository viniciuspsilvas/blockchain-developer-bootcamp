import { Contract } from "ethers";
import { useAppSelector } from "../hooks";
import { selectTokenAddresses, selectTokenBalances, selectTokenSymbols } from "../features/tokens/tokensSlice";
import TOKEN_ABI from "../../abis/Token.json";
import { selectProvider } from "../features/providers/providerSlice";

export const useTokens = () => {
  const addresses = useAppSelector(selectTokenAddresses);
  const symbols = useAppSelector(selectTokenSymbols);
  const balances = useAppSelector(selectTokenBalances);
  const provider = useAppSelector(selectProvider);

  const tokens = addresses.map((address) => new Contract(address, TOKEN_ABI, provider));

  return { tokens, symbols, balances };
};
