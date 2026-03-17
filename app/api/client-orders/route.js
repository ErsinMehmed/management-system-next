import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { requireAdmin } from "@/helpers/requireRole";
import connectMongoDB from "@/libs/mongodb";
import ClientOrder from "@/models/clientOrder";
import Product from "@/models/product";
import { NextResponse } from "next/server";
import { notifyAllEmployees, notifyUser } from "@/services/pushNotification";

export async function GET(request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ status: false }, { status: 401 });
  }

  await connectMongoDB();

  const { searchParams } = request.nextUrl;
  const page = Math.max(1, parseInt(searchParams.get("page")) || 1);
  const perPage = Math.min(20, parseInt(searchParams.get("per_page")) || 10);
  const status = searchParams.get("status");

  const isAdmin = ["Admin", "Super Admin"].includes(session.user.role);
  const filter = {};
  if (status) filter.status = status;
  if (!isAdmin) filter.assignedTo = session.user.id;

  const [totalItems, items] = await Promise.all([
    ClientOrder.countDocuments(filter),
    ClientOrder.find(filter)
      .sort({ _id: -1 })
      .skip((page - 1) * perPage)
      .limit(perPage)
      .populate({ path: "product", select: "name weight flavor puffs count" })
      .populate({ path: "secondProduct.product", select: "name weight flavor puffs count category", populate: { path: "category", select: "name" } })
      .populate({ path: "assignedTo", select: "name" })
      .lean(),
  ]);

  return NextResponse.json({
    items,
    pagination: {
      current_page: page,
      total_pages: Math.ceil(totalItems / perPage),
      total_results: totalItems,
      per_page: perPage,
    },
  });
}

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ message: "Не сте оторизирани." }, { status: 401 });

  const isAdmin = ["Admin", "Super Admin"].includes(session.user.role);
  const isSeller = session.user.role === "Seller";
  if (!isAdmin && !isSeller) return NextResponse.json({ message: "Нямате достъп до тази операция." }, { status: 403 });

  await connectMongoDB();

  const data = await request.json();

  // Seller винаги се асайнва на себе си
  if (isSeller) data.assignedTo = session.user.id;

  // Определяме дали клиентът е нов по телефон
  const existingOrder = await ClientOrder.findOne({ phone: data.phone });
  data.isNewClient = !existingOrder;

  // Авто-изчисляване на хонорара
  const product = await Product.findById(data.product).select("seller_prices").lean();
  let totalPayout = product?.seller_prices?.[data.quantity - 1] ?? 0;

  // Втори продукт
  if (data.product2 && data.quantity2) {
    const product2 = await Product.findById(data.product2).select("seller_prices").lean();
    const payout2 = product2?.seller_prices?.[Number(data.quantity2) - 1] ?? 0;
    data.secondProduct = {
      product:  data.product2,
      quantity: Number(data.quantity2),
      price:    Number(data.price2) || 0,
      payout:   payout2,
    };
    totalPayout += payout2;
  }
  delete data.product2;
  delete data.quantity2;
  delete data.price2;
  data.payout = totalPayout;

  const order = await ClientOrder.create(data);
  await order.populate([
    { path: "product", select: "name weight flavor puffs count" },
    { path: "secondProduct.product", select: "name" },
    { path: "assignedTo", select: "name" },
  ]);

  // Push notification — само към асайнатия доставчик, или към всички ако няма
  const clientType = data.isNewClient ? "🆕 Нов клиент" : "Съществуващ клиент";
  const notifPayload = {
    title: "📦 Нова поръчка",
    body: `${clientType} · ${data.phone}\n${order.product?.name} × ${data.quantity} бр. — ${data.price} лв.`,
    data: { url: `/dashboard/client-orders/${order._id}` },
  };
  if (data.assignedTo) {
    notifyUser(data.assignedTo, notifPayload).catch(console.error);
  } else {
    notifyAllEmployees(notifPayload).catch(console.error);
  }

  return NextResponse.json(
    { message: "Поръчката е добавена успешно", status: true },
    { status: 201 }
  );
}
