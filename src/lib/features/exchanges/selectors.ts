import { createSelector } from "reselect";
import { get, groupBy, reject, maxBy, minBy } from "lodash";
import moment from "moment";
import { ethers } from "ethers";
import { RootState } from "../../store";
import { Order } from "../../../types/exchange";

const GREEN = "#25CE8F";
const RED = "#F45353";

// Base selectors
const selectTokens = (state: RootState) => state.tokens.addresses;
const selectAllOrders = (state: RootState) =>
  state.exchange.orderBook.allOrders;
const selectCancelledOrders = (state: RootState) =>
  state.exchange.orderBook.cancelledOrders;
const selectFilledOrders = (state: RootState) =>
  state.exchange.orderBook.filledOrders;
const selectSelectedMarket = (state: RootState) =>
  state.exchange.selectedMarket;
const selectAccount = (state: RootState) => state.provider.account;
// Open orders selector
export const selectOpenOrders = createSelector(
  [
    selectAllOrders,
    selectCancelledOrders,
    selectFilledOrders,
    selectSelectedMarket
  ],
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

      return orderFilled || orderCancelled;
    });

    const marketOrders = openOrders.filter((order) => {
      return (
        order.tokenGet === selectedMarket || order.tokenGive === selectedMarket
      );
    });

    return marketOrders;
  }
);

// Helper function to decorate a single order
const decorateOrder = (order: Order, addresses: string[]): Order => {
  if (!order.amountGet || !order.amountGive) {
    throw new Error("Order amounts are required");
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
  const tokenPrice =
    token1Amount.mul(precision).div(token0Amount).toNumber() / precision;

  return {
    ...order,
    token1Amount: ethers.utils.formatUnits(token1Amount, "ether"),
    token0Amount: ethers.utils.formatUnits(token0Amount, "ether"),
    tokenPrice: tokenPrice.toString(),
    formattedTimestamp: order.timestamp
      ? moment.unix(order.timestamp).format("h:mm:ssa d MMM D")
      : "",
    orderType: "",
    orderFillAction: ""
  };
};

// Helper function to decorate order book orders
const decorateOrderBookOrder = (
  order: Order,
  addresses: string[]
): Order => {
  const orderType = order.tokenGive === addresses[1] ? "buy" : "sell";

  return {
    ...order,
    orderType,
    orderTypeClass: orderType === "buy" ? GREEN : RED,
    orderFillAction: orderType === "buy" ? "sell" : "buy"
  };
};

// Main order book selector
export const selectOrderBook = createSelector(
  [selectOpenOrders, selectTokens],
  (orders, addresses) => {
    if (!addresses?.[0] || !addresses?.[1]) {
      return null;
    }

    let filteredOrders = orders.filter(
      (o) => o.tokenGet === addresses[0] || o.tokenGet === addresses[1]
    );

    filteredOrders = filteredOrders.filter(
      (o) => o.tokenGive === addresses[0] || o.tokenGive === addresses[1]
    );

    const decoratedOrders = filteredOrders.map((order) => {
      const decorated = decorateOrder(order, addresses);
      return decorateOrderBookOrder(decorated, addresses);
    });

    const groupedOrders = groupBy(decoratedOrders, "orderType");

    const buyOrders = get(groupedOrders, "buy", []).sort(
      (a, b) => Number(b.tokenPrice) - Number(a.tokenPrice)
    );
    const sellOrders = get(groupedOrders, "sell", []).sort(
      (a, b) => Number(b.tokenPrice) - Number(a.tokenPrice)
    );

    return {
      buyOrders,
      sellOrders
    };
  }
);

// ------------------------------------------------------------------------------
// PRICE CHART

export const priceChartSelector = createSelector(
  selectFilledOrders,
  selectTokens,
  (orders, tokens) => {
    if (!tokens[0] || !tokens[1]) {
      return;
    }

    // Filter orders by selected tokens
    orders = orders.filter(
      (o) => o.tokenGet === tokens[0] || o.tokenGet === tokens[1]
    );
    orders = orders.filter(
      (o) => o.tokenGive === tokens[0] || o.tokenGive === tokens[1]
    );

    // Sort orders by date ascending to compare history
    orders = orders.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));

    // Decorate orders - add display attributes
    const decoratedOrders = orders.map((o) => decorateOrder(o, tokens));

    // Get last 2 order for final price & price change
    const [secondLastOrder, lastOrder] = decoratedOrders.slice(
      decoratedOrders.length - 2,
      decoratedOrders.length
    );

    // get last order price
    const lastPrice = get(lastOrder, "tokenPrice", 0);

    // get second last order price
    const secondLastPrice = get(secondLastOrder, "tokenPrice", 0);

    return {
      lastPrice,
      lastPriceChange: lastPrice >= secondLastPrice ? "+" : "-",
      series: [
        {
          data: buildGraphData(decoratedOrders)
        }
      ]
    };
  }
);

const buildGraphData = (orders: Order[]) => {
  // Group the orders by hour for the graph
  const groupedOrders = groupBy(orders, (o) =>
    moment
      .unix(o.timestamp || 0)
      .startOf("hour")
      .format()
  );

  // Get each hour where data exists
  const hours = Object.keys(groupedOrders);

  // Build the graph series
  const graphData = hours.map((hour) => {
    // Fetch all orders from current hour
    const group = groupedOrders[hour];

    // Calculate price values: open, high, low, close
    const open = group[0]; // first order
    const high = maxBy(group, "tokenPrice"); // high price
    const low = minBy(group, "tokenPrice"); // low price
    const close = group[group.length - 1]; // last order

    return {
      x: new Date(hour),
      y: [
        Number(open.tokenPrice),
        Number(high?.tokenPrice) ?? 0,
        Number(low?.tokenPrice) ?? 0,
        Number(close.tokenPrice)
      ]
    };
  });

  return graphData;
};

// ------------------------------------------------------------------------------
// ALL FILLED ORDERS

export const filledOrdersSelector = createSelector(
  selectFilledOrders,
  selectTokens,
  (orders, tokens) => {
    if (!tokens[0] || !tokens[1]) {
      return [];
    }

    // Filter orders by selected tokens
    orders = orders.filter(
      (o) => o.tokenGet === tokens[0] || o.tokenGet === tokens[1]
    );
    orders = orders.filter(
      (o) => o.tokenGive === tokens[0] || o.tokenGive === tokens[1]
    );

    // Sort orders by time ascending for price comparison
    orders = orders.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));

    // Decorate the orders
    const decoratedOrders = decorateFilledOrders(orders, tokens);

    // Sort orders by date descending for display
    return decoratedOrders.sort(
      (a, b) => (b.timestamp || 0) - (a.timestamp || 0)
    );
  }
);

const decorateFilledOrders = (
  orders: Order[],
  tokens: string[]
): Order[] => {
  if (orders.length === 0) return [];

  // Track previous order to compare history
  let previousOrder: Order = decorateOrder(orders[0], tokens);

  return orders.map((order: Order) => {
    // decorate each individual order
    const decorated = decorateOrder(order, tokens);
    const filledOrder = decorateFilledOrder(decorated, previousOrder);
    previousOrder = filledOrder; // Update the previous order once it's decorated
    return filledOrder;
  });
};

const decorateFilledOrder = (
  order: Order,
  previousOrder: Order
): Order => {
  return {
    ...order,
    tokenPriceClass: tokenPriceClass(
      Number(order.tokenPrice),
      order.id || "",
      previousOrder
    )
  };
};

const tokenPriceClass = (
  tokenPrice: number,
  orderId: string,
  previousOrder: Order
): string => {
  // Show green price if only one order exists
  if (previousOrder.id === orderId) {
    return GREEN;
  }

  // Show green price if order price higher than previous order
  // Show red price if order price lower than previous order
  if (Number(previousOrder.tokenPrice) <= tokenPrice) {
    return GREEN; // success
  } else {
    return RED; // danger
  }
};

// ------------------------------------------------------------------------------
// MY OPEN ORDERS

export const myOpenOrdersSelector = createSelector(
  [selectAccount, selectTokens, selectOpenOrders],
  (account, tokens, orders) => {
    if (!tokens[0] || !tokens[1]) {
      return [];
    }

    // Filter orders created by current account
    orders = orders.filter((o) => o.user === account);

    // Filter orders by token addresses
    orders = orders.filter(
      (o) => o.tokenGet === tokens[0] || o.tokenGet === tokens[1]
    );
    orders = orders.filter(
      (o) => o.tokenGive === tokens[0] || o.tokenGive === tokens[1]
    );

    // Decorate orders - add display attributes
    const decoratedOrders = decorateMyOpenOrders(orders, tokens);

    // Sort orders by date descending
    return decoratedOrders.sort(
      (a, b) => (b.timestamp || 0) - (a.timestamp || 0)
    );
  }
);

const decorateMyOpenOrders = (orders: Order[], tokens: string[]): Order[] => {
  return orders.map((order: Order) => {
    const decorated = decorateOrder(order, tokens);
    return decorateMyOpenOrder(decorated, tokens);
  });
};

const decorateMyOpenOrder = (
  order: Order,
  tokens: string[]
): Order => {
  const orderType = order.tokenGive === tokens[1] ? "buy" : "sell";

  return {
    ...order,
    orderType,
    orderTypeClass: orderType === "buy" ? GREEN : RED,
    orderFillAction: orderType === "buy" ? "sell" : "buy",
    orderSign: orderType === "buy" ? "+" : "-"
  };
};


// ------------------------------------------------------------------------------
// MY FILLED ORDERS

export const myFilledOrdersSelector = createSelector(
  [selectAccount, selectTokens, selectFilledOrders],
  (account, tokens, orders) => {
    if (!tokens[0] || !tokens[1] || !account) {
      return [];
    }

    console.log(orders);
    // Find our orders
    orders = orders.filter((o: Order) => o.user === account || o.creator === account);
    // Filter orders for current trading pair
    orders = orders.filter(
      (o: Order) => o.tokenGet === tokens[0] || o.tokenGet === tokens[1]
    );
    orders = orders.filter(
      (o: Order) => o.tokenGive === tokens[0] || o.tokenGive === tokens[1]
    );

    // Sort by date descending
    orders = orders.sort((a: Order, b: Order) => (b.timestamp || 0) - (a.timestamp || 0));

    // Decorate orders - add display attributes
    const decoratedOrders = decorateMyFilledOrders(orders, account, tokens);

    return decoratedOrders;
  }
);

const decorateMyFilledOrders = (
  orders: Order[],
  account: string,
  tokens: string[]
): Order[] => {
  return orders.map((order: Order) => {
    const decorated = decorateOrder(order, tokens);
    return decorateMyFilledOrder(decorated, account, tokens);
  });
};

const decorateMyFilledOrder = (
  order: Order,
  account: string,
  tokens: string[]
): Order => {
  const myOrder = order.creator === account;

  const orderType = myOrder
    ? order.tokenGive === tokens[1] ? "buy" : "sell"
    : order.tokenGive === tokens[1] ? "sell" : "buy";

  return {
    ...order,
    orderType,
    orderTypeClass: orderType === "buy" ? GREEN : RED,
    orderFillAction: orderType === "buy" ? "sell" : "buy",
    orderSign: orderType === "buy" ? "+" : "-"
  };
};
