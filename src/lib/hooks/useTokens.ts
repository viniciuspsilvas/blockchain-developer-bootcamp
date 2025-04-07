import { Contract, ethers } from "ethers";
import { useAppSelector, useAppDispatch } from "../hooks";
import { selectTokenAddresses, selectTokenSymbols, selectTokenBalances } from "../features/tokens/tokensSlice";
import { transferRequest, transferFail } from "../features/exchanges/exchangeSlice";
import TOKEN_ABI from "../../abis/Token.json";
import { selectProvider } from "../features/providers/providerSlice";
import { useExchange } from "./useExchange";

export const useTokens = () => {
  const dispatch = useAppDispatch();
  const provider = useAppSelector(selectProvider);
  const addresses = useAppSelector(selectTokenAddresses);
  const symbols = useAppSelector(selectTokenSymbols);
  const balances = useAppSelector(selectTokenBalances);

  const { exchange } = useExchange()

  const tokens = addresses.map((address) => new Contract(address, TOKEN_ABI, provider));

  const transferTokens = async (token: Contract, amount: number) => {
    if (!provider || !exchange) {
      console.error("❌ Provider or Exchange contract is not available.");
      return;
    }

    dispatch(transferRequest());

    try {
      const signer = provider.getSigner();

      // Approve the exchange to spend tokens
      console.log("🔹 Approving exchange to spend tokens...");

      const amountToTransfer = ethers.utils.parseUnits(amount.toString(), 18)
      const approvalTx = await token.connect(signer).approve(exchange.address, amountToTransfer);
      await approvalTx.wait();
      console.log("✅ Approval successful!", amountToTransfer);

      // Deposit tokens into the exchange
      console.log("🔹 Depositing tokens into the exchange...");
      const depositTx = await exchange.connect(signer).depositToken(token.address, amountToTransfer);
      const receipt = await depositTx.wait();
      console.log("✅ Deposit successful!", receipt);

    } catch (error) {
      console.error("❌ Transfer failed:", error);
      dispatch(transferFail());
    }
  };

  const withdrawTokens = async (token: Contract, amount: number) => {
    if (!provider || !exchange) {
      console.error("❌ Provider or Exchange contract is not available.");
      return;
    } 

    dispatch(transferRequest());

    try {
      const signer = provider.getSigner();

      // Approve the exchange to spend tokens
      console.log("🔹 Approving exchange to spend tokens...");

      const amountToTransfer = ethers.utils.parseUnits(amount.toString(), 18)
      const approvalTx = await token.connect(signer).approve(exchange.address, amountToTransfer);
      await approvalTx.wait();
      console.log("✅ Approval successful!", amountToTransfer);

      // Withdraw tokens from the exchange
      console.log("🔹 Withdrawing tokens from the exchange...");
      const withdrawTx = await exchange.connect(signer).withdrawToken (token.address, amountToTransfer);
      const receipt = await withdrawTx.wait();
      console.log("✅ Withdrawal successful!", receipt);

      // dispatch(transferSuccess(receipt.events));
    } catch (error) {
      console.error("❌ Withdrawal failed:", error);
      dispatch(transferFail());
      }
  };

  return { tokens, symbols, balances, transferTokens, withdrawTokens   };
};
