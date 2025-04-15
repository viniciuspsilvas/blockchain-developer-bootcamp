import { ethers } from "ethers";

export interface Order {
  id?: string;
  user?: string;
  tokenGet?: string;
  amountGet?: string;
  tokenGive?: string;
  amountGive?: string;
  token0Amount: string;
  tokenPrice: string;
  token1Amount: string;
  orderTypeClass: string;
  timestamp?: number;
}

export interface OrderResult {
  success: boolean;
  error?: string;
  receipt?: ethers.providers.TransactionReceipt;
} 