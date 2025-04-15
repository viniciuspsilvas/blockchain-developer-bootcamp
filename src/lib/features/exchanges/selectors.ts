import { createSelector } from 'reselect';
import { get, groupBy, reject } from 'lodash';
import moment from 'moment';
import { ethers } from 'ethers';
import { RootState } from '../../store';
import { Order } from '../../types/exchange';

interface DecoratedOrder extends Omit<Order, 'tokenPrice'> {
  tokenPrice: number;
  formattedTimestamp: string;
  orderType: string;
  orderTypeClass: string;
  orderFillAction: string;
}

const GREEN = '#25CE8F';
const RED = '#F45353';

// Base selectors
const selectTokens = (state: RootState) => state.tokens.addresses;
const selectAllOrders = (state: RootState) => state.exchange.orderBook.allOrders;
const selectCancelledOrders = (state: RootState) => state.exchange.orderBook.cancelledOrders;
const selectFilledOrders = (state: RootState) => state.exchange.orderBook.filledOrders;
const selectSelectedMarket = (state: RootState) => state.exchange.selectedMarket;

// Open orders selector
export const selectOpenOrders = createSelector(
  [selectAllOrders, selectCancelledOrders, selectFilledOrders, selectSelectedMarket],
  (allOrders, cancelledOrders, filledOrders, selectedMarket) => {
    const openOrders = reject(allOrders, (order) => {
      if (!order.id) {
        return true;
      }
      
      const orderId = order.id.toString();
      const orderFilled = filledOrders.some((o) => {
        const filledId = o.id?.toString();
        return filledId === orderId;
      });
      
      const orderCancelled = cancelledOrders.some((o) => {
        const cancelledId = o.id?.toString();
        return cancelledId === orderId;
      });
      
      return (orderFilled || orderCancelled);
    });

    const marketOrders = openOrders.filter(order => {
      return order.tokenGet === selectedMarket || order.tokenGive === selectedMarket;
    });

    return marketOrders;
  }
);

// Helper function to decorate a single order
const decorateOrder = (order: Order, addresses: string[]): DecoratedOrder => {
  if (!order.amountGet || !order.amountGive) {
    throw new Error('Order amounts are required');
  }

  let token0Amount = ethers.BigNumber.from(order.amountGet);
  let token1Amount = ethers.BigNumber.from(order.amountGive);

  // Note: DApp should be considered token0, mETH is considered token1
  if (order.tokenGive === addresses[1]) {
    token0Amount = ethers.BigNumber.from(order.amountGive); // The amount of DApp we are giving
    token1Amount = ethers.BigNumber.from(order.amountGet); // The amount of mETH we want
  }

  // Calculate token price to 5 decimal places
  const precision = 100000;
  const tokenPrice = token1Amount.mul(precision).div(token0Amount).toNumber() / precision;

  return {
    ...order,
    token1Amount: ethers.utils.formatUnits(token1Amount, "ether"),
    token0Amount: ethers.utils.formatUnits(token0Amount, "ether"),
    tokenPrice,
    formattedTimestamp: order.timestamp ? moment.unix(order.timestamp).format('h:mm:ssa d MMM D') : '',
    orderType: '',
    orderTypeClass: '',
    orderFillAction: ''
  };
};

// Helper function to decorate order book orders
const decorateOrderBookOrder = (order: DecoratedOrder, addresses: string[]): DecoratedOrder => {
  const orderType = order.tokenGive === addresses[1] ? 'buy' : 'sell';

  return {
    ...order,
    orderType,
    orderTypeClass: (orderType === 'buy' ? GREEN : RED),
    orderFillAction: (orderType === 'buy' ? 'sell' : 'buy')
  };
};

// Main order book selector
export const selectOrderBook = createSelector(
  [selectOpenOrders, selectTokens],
  (orders, addresses) => {
    if (!addresses?.[0] || !addresses?.[1]) { 
      return null; 
    }

    let filteredOrders = orders.filter((o) => 
      o.tokenGet === addresses[0] || o.tokenGet === addresses[1]
    );

    filteredOrders = filteredOrders.filter((o) => 
      o.tokenGive === addresses[0] || o.tokenGive === addresses[1]
    );

    const decoratedOrders = filteredOrders.map((order) => {
      const decorated = decorateOrder(order, addresses);
      return decorateOrderBookOrder(decorated, addresses);
    });

    const groupedOrders = groupBy(decoratedOrders, 'orderType');

    const buyOrders = get(groupedOrders, 'buy', []).sort((a, b) => b.tokenPrice - a.tokenPrice);
    const sellOrders = get(groupedOrders, 'sell', []).sort((a, b) => b.tokenPrice - a.tokenPrice);

    return {
      buyOrders,
      sellOrders
    };
  }
); 