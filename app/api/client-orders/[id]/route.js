import { requireAdmin, requireSuperAdmin } from "@/helpers/requireRole";
import connectMongoDB from "@/libs/mongodb";
import ClientOrder from "@/models/clientOrder";
import Product from "@/models/product";
import { NextResponse } from "next/server";
import { getAuth } from "@/helpers/getAuth";
import { notifyOrderClients } from "@/libs/pusher";
import { saveNotification } from "@/libs/saveNotification";
import { notifyAllSuperAdmins } from "@/services/pushNotification";

export async function PUT(request, { params }) {
  const session = await getAuth(request);
  if (!session) return NextResponse.json({ message: "Не сте оторизирани." }, { status: 401 });

  const { id } = await params;
  const body = await request.json();

  await connectMongoDB();

  const existing = await ClientOrder.findById(id).select("status product quantity assignedTo orderNumber secondProduct").lean();

  // Редактиране на продукт, цена, бройка, хонорар и хонорар на дистрибутор
  if (body.product !== undefined || body.price !== undefined || body.payout !== undefined || body.secondProduct !== undefined || body.distributorPayout !== undefined) {
    if (existing?.status !== "нова" && session.user.role !== "Super Admin") {
      return NextResponse.json({ message: "Нямате достъп до тази операция." }, { status: 403 });
    }
    const update = {};
    if (body.product !== undefined) update.product = body.product;
    if (body.price !== undefined) update.price = body.price;
    if (body.quantity !== undefined) update.quantity = body.quantity;

    // Хонорар: ако е подаден ръчно (само Super Admin), използва се той
    // иначе се авто-изчислява при смяна на продукт или бройка
    if (body.distributorPayout !== undefined && session.user.role === "Super Admin") {
      update.distributorPayout = Number(body.distributorPayout) || 0;
    }

    if (body.payout !== undefined && session.user.role === "Super Admin") {
      update.payout = body.payout;
    } else if (body.product !== undefined || body.quantity !== undefined || body.secondProduct !== undefined) {
      const productId = body.product ?? existing?.product;
      const qty = body.quantity ?? existing?.quantity;
      const prod = await Product.findById(productId).select("seller_prices").lean();
      let totalPayout = prod?.seller_prices?.[qty - 1] ?? 0;

      // Пресмятаме пayout и за втори продукт
      const sp = body.secondProduct !== undefined ? body.secondProduct : existing?.secondProduct;
      if (sp?.product && sp?.quantity) {
        const prod2 = await Product.findById(sp.product).select("seller_prices").lean();
        const payout2 = prod2?.seller_prices?.[sp.quantity - 1] ?? 0;
        update["secondProduct.payout"] = payout2;
        totalPayout += payout2;
      }
      update.payout = totalPayout;
    }

    // Обновяване на полетата на втория продукт
    if (body.secondProduct !== undefined) {
      if (!body.secondProduct) {
        update.secondProduct = { product: null, quantity: 0, price: 0, payout: 0 };
      } else {
        if (body.secondProduct.product !== undefined) update["secondProduct.product"] = body.secondProduct.product || null;
        if (body.secondProduct.quantity !== undefined) update["secondProduct.quantity"] = body.secondProduct.quantity;
        if (body.secondProduct.price !== undefined) update["secondProduct.price"] = body.secondProduct.price;
      }
    }

    await ClientOrder.findByIdAndUpdate(id, update);
    const editEvent = { type: "updated", orderId: id, orderNumber: existing?.orderNumber, changedBy: session.user.name, changedByUserId: String(session.user.id), assignedTo: existing?.assignedTo ? String(existing.assignedTo) : null, change: "edit" };
    notifyOrderClients(editEvent);
    saveNotification(editEvent).catch(console.error);
    return NextResponse.json({ message: "Поръчката е обновена", status: true });
  }

  // Смяна на статус
  const { status, rejectionReason } = body;
  const isSuperAdmin = session.user.role === "Super Admin";
  const isSeller = session.user.role === "Seller";

  // Seller може да сменя статус само на своя поръчка
  if (isSeller && String(existing?.assignedTo) !== String(session.user.id)) {
    return NextResponse.json({ message: "Нямате достъп до тази операция." }, { status: 403 });
  }

  const lockedStatuses = ["отказана", "доставена"];
  if (lockedStatuses.includes(existing?.status) && !isSuperAdmin) {
    return NextResponse.json({ message: "Нямате достъп до тази операция." }, { status: 403 });
  }

  const finalStatuses = ["доставена", "отказана"];
  const update = {
    status,
    rejectionReason: status === "отказана" ? (rejectionReason ?? "") : "",
    statusChangedAt: finalStatuses.includes(status) ? new Date() : null,
  };
  await ClientOrder.findByIdAndUpdate(id, update);

  const statusEvent = { type: "updated", orderId: id, orderNumber: existing?.orderNumber, changedBy: session.user.name, changedByUserId: String(session.user.id), assignedTo: existing?.assignedTo ? String(existing.assignedTo) : null, status, change: "status" };
  notifyOrderClients(statusEvent);
  saveNotification(statusEvent).catch(console.error);

  if (finalStatuses.includes(status) && !isSuperAdmin) {
    const statusLabel = status === "доставена" ? "✅ Доставена" : "❌ Отказана";
    notifyAllSuperAdmins({
      title: `${statusLabel} поръчка #${existing?.orderNumber}`,
      body: `${session.user.name} промени статуса на поръчка #${existing?.orderNumber} на "${status}"`,
      data: { url: `/dashboard/client-orders/${id}` },
    }).catch(console.error);
  }

  return NextResponse.json({ message: "Статусът е обновен", status: true });
}

export async function PATCH(request, { params }) {
  const session = await getAuth(request);
  if (!session) return NextResponse.json({ message: "Не сте оторизирани." }, { status: 401 });

  const { id } = await params;

  await connectMongoDB();

  const order = await ClientOrder.findById(id).select("assignedTo viewedBySeller").lean();
  if (!order) return NextResponse.json({ message: "Не е намерена." }, { status: 404 });

  if (order.viewedBySeller) return NextResponse.json({ status: true });

  if (String(order.assignedTo) !== String(session.user.id)) {
    return NextResponse.json({ message: "Нямате достъп до тази операция." }, { status: 403 });
  }

  await ClientOrder.findByIdAndUpdate(id, { viewedBySeller: true });

  return NextResponse.json({ status: true });
}

export async function DELETE(request, { params }) {
  const { error, session } = await requireAdmin();
  if (error) return error;

  const { id } = await params;

  await connectMongoDB();

  const toDelete = await ClientOrder.findById(id).select("assignedTo orderNumber").lean();
  await ClientOrder.findByIdAndDelete(id);
  const deleteEvent = { type: "deleted", orderId: id, orderNumber: toDelete?.orderNumber, changedBy: session.user.name, changedByUserId: String(session.user.id), assignedTo: toDelete?.assignedTo ? String(toDelete.assignedTo) : null };
  notifyOrderClients(deleteEvent);
  saveNotification(deleteEvent).catch(console.error);

  return NextResponse.json({ message: "Поръчката е изтрита", status: true });
}
