import { requireSuperAdmin } from "@/helpers/requireRole";
import connectMongoDB from "@/libs/mongodb";
import ClientOrder from "@/models/clientOrder";
import Sell from "@/models/sell";
import Product from "@/models/product";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

export async function POST(request) {
  const { error } = await requireSuperAdmin(request);
  if (error) return error;

  const { sellerId } = await request.json();
  if (!sellerId) return NextResponse.json({ message: "Липсва доставчик." }, { status: 400 });

  await connectMongoDB();

  const paidAt = new Date();
  const sellerObjectId = new mongoose.Types.ObjectId(sellerId);

  const orders = await ClientOrder.find(
    { assignedTo: sellerObjectId, status: "доставена", isPaid: { $ne: true } },
    { product: 1, quantity: 1, price: 1, payout: 1, secondProduct: 1, distributorPayout: 1 }
  ).lean();

  // Групиране по продукт — акумулираме бройки и нето стойност
  const productMap = new Map();

  for (const order of orders) {
    const sp = order.secondProduct;
    const spPayout = sp?.payout ?? 0;
    const mainPayout = order.payout - spPayout;
    const distPayout = order.distributorPayout ?? 0;
    const mainNet = order.price - mainPayout - distPayout;
    const mainKey = String(order.product);

    if (productMap.has(mainKey)) {
      const entry = productMap.get(mainKey);
      entry.quantity += order.quantity;
      entry.price += mainNet;
    } else {
      productMap.set(mainKey, { product: order.product, quantity: order.quantity, price: mainNet });
    }

    if (sp?.product && sp?.quantity > 0) {
      const spNet = sp.price - spPayout;
      const spKey = String(sp.product);

      if (productMap.has(spKey)) {
        const entry = productMap.get(spKey);
        entry.quantity += sp.quantity;
        entry.price += spNet;
      } else {
        productMap.set(spKey, { product: sp.product, quantity: sp.quantity, price: spNet });
      }
    }
  }

  if (productMap.size > 0) {
    const sellRecords = [...productMap.values()].map(({ product, quantity, price }) => ({
      product,
      quantity,
      price,
      creator: sellerObjectId,
      date: paidAt,
    }));
    await Sell.insertMany(sellRecords);

    // Наличността на доставчика вече се намалява при смяна на статус на "доставена"
    // Тук само намаляваме общата наличност на продукта
    const deductOps = [...productMap.values()].map(({ product, quantity }) =>
      Product.findByIdAndUpdate(product, { $inc: { availability: -quantity } })
    );

    await Promise.all(deductOps);
  }

  const result = await ClientOrder.updateMany(
    { assignedTo: sellerObjectId, status: "доставена", isPaid: { $ne: true } },
    { $set: { isPaid: true, paidAt } }
  );

  return NextResponse.json({ status: true, updated: result.modifiedCount });
}
