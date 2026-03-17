import Pusher from "pusher";

const pusher = new Pusher({
  appId:   process.env.PUSHER_APP_ID,
  key:     process.env.PUSHER_KEY,
  secret:  process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER,
  useTLS:  true,
});

/**
 * Праща събитие към всички клиенти на канала client-orders.
 * @param {{ type: string, orderId?: string, orderNumber?: number, changedBy?: string, [key: string]: any }} event
 */
export function notifyOrderClients(event) {
  return pusher.trigger("client-orders", "order-event", event).catch(console.error);
}
