import { useEffect } from "react";
import PusherClient from "pusher-js";
import { toast } from "@heroui/react";
import { clientOrderStore } from "@/stores/useStore";

function shouldShowToast(event, userId, role) {
  if (event.changedByUserId && String(event.changedByUserId) === String(userId)) return false;
  if (role === "Seller") return event.assignedTo && String(event.assignedTo) === String(userId);
  return true;
}

function showOrderToast(event) {
  const num = event.orderNumber ? `#${event.orderNumber} ` : "";
  const by = event.changedBy ? ` от ${event.changedBy}` : "";
  if (event.type === "created") {
    toast.success("Нова заявка", { description: `${num}добавена${by}`, timeout: 5000 });
  } else if (event.type === "updated" && event.change === "status") {
    const isDelivered = event.status === "доставена";
    const isRejected = event.status === "отказана";
    const desc = { description: `${num}→ ${event.status}${by}`, timeout: 5000 };
    if (isDelivered) toast.success("Статус обновен", desc);
    else if (isRejected) toast.danger("Статус обновен", desc);
    else toast("Статус обновен", desc);
  } else if (event.type === "updated") {
    toast("Заявка редактирана", { description: `${num}редактирана${by}`, timeout: 5000 });
  } else if (event.type === "deleted") {
    toast.danger("Заявка изтрита", { description: `${num}изтрита${by}`, timeout: 5000 });
  }
}

export function usePusherClientOrders(initialData, sessionRef) {
  useEffect(() => {
    if (initialData) {
      clientOrderStore.hydrateOrders(initialData.orders);
    } else {
      clientOrderStore.loadOrders();
    }

    const pusher = new PusherClient(process.env.NEXT_PUBLIC_PUSHER_KEY, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
    });
    const channel = pusher.subscribe("client-orders");
    channel.bind("order-event", (event) => {
      clientOrderStore.loadOrders();
      if (shouldShowToast(event, sessionRef.current?.user?.id, sessionRef.current?.user?.role)) {
        showOrderToast(event);
      }
    });
    return () => {
      channel.unbind_all();
      pusher.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
