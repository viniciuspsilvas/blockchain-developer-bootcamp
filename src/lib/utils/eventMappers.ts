import { Event } from "ethers";
import { Order } from "../types/exchange";

export const mapEventToOrder = (event: Event): Order => {
  if (!event.args) {
    throw new Error('Event args are undefined');
  }

  const { id, user, tokenGet, amountGet, tokenGive, amountGive, timestamp } = event.args;
  
  return {
    id: id?.toString(),
    user,
    tokenGet,
    amountGet,
    tokenGive,
    amountGive,
    timestamp,
    token0Amount: amountGet?.toString(),
    token1Amount: amountGive?.toString(),
    tokenPrice: (amountGet / amountGive).toString(),
    orderTypeClass: event.args?.orderTypeClass
  };
};

export const filterAndMapEvents = (events: Event[]): Order[] => {
  return events
    .filter((event) => event.args !== undefined)
    .map(mapEventToOrder);
}; 