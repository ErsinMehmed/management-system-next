import connectMongoDB from "@/libs/mongodb";
import Notification from "@/models/notification";

export async function saveNotification(event) {
  if (!event.changedByUserId) return;
  try {
    await connectMongoDB();
    await Notification.create({
      type:            event.type,
      orderId:         event.orderId ?? "",
      orderNumber:     event.orderNumber ?? 0,
      changedBy:       event.changedBy ?? "",
      changedByUserId: String(event.changedByUserId),
      assignedTo:      event.assignedTo ? String(event.assignedTo) : null,
      change:          event.change ?? null,
      status:          event.status ?? null,
      readBy:          [],
    });
  } catch (e) {
    console.error("saveNotification error:", e);
  }
}
