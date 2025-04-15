export interface Order {
  id: string;
  user: string;
  tokenGet: string;
  amountGet: string;
  tokenGive: string;
  amountGive: string;
  timestamp: string;
  token0Amount: string;
  token1Amount: string;
  tokenPrice: string;
  orderTypeClass?: string;
} 