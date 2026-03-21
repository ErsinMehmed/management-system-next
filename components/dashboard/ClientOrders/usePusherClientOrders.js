import { useEffect } from "react";
import PusherClient from "pusher-js";
import { addToast } from "@heroui/toast";
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
    addToast({ title: "Нова заявка", description: `${num}добавена${by}`, color: "success", timeout: 5000 });
  } else if (event.type === "updated" && event.change === "status") {
    const color = event.status === "доставена" ? "success" : event.status === "отказана" ? "danger" : "primary";
    addToast({ title: "Статус обновен", description: `${num}→ ${event.status}${by}`, color, timeout: 5000 });
  } else if (event.type === "updated") {
    addToast({ title: "Заявка редактирана", description: `${num}редактирана${by}`, color: "default", timeout: 5000 });
  } else if (event.type === "deleted") {
    addToast({ title: "Заявка изтрита", description: `${num}изтрита${by}`, color: "danger", timeout: 5000 });
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
