export interface Order {
  id?: string;
  user?: string;
  creator?: string;
  tokenGet?: string;
  amountGet?: string;
  tokenGive?: string;
  amountGive?: string;
  timestamp?: number;
  token0Amount?: string;
  token1Amount?: string;
  tokenPrice?: string | number;
  orderTypeClass?: string;
  formattedTimestamp?: string;
  orderType?: string;
  orderFillAction?: string;
  orderClass?: string;
  orderSign?: string;
  tokenPriceClass?: string;
} 