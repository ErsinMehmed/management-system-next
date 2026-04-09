import { requireAdmin } from "@/helpers/requireRole";
import connectMongoDB from "@/libs/mongodb";
import Order from "@/models/order";
import Product from "@/models/product";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export async function GET(request) {
  const { error } = await requireAdmin(request);
  if (error) return error;

  const { searchParams } = request.nextUrl;
  const productId = searchParams.get("productId");
  if (!productId) return NextResponse.json({ suggested: 0, reason: "Няма продукт" });

  await connectMongoDB();

  const [product, lastOrder] = await Promise.all([
    Product.findById(productId).select("availability units_per_box name").lean(),
    Order.findOne({ product: new mongoose.Types.ObjectId(productId) })
      .sort({ date: -1 })
      .select("quantity date")
      .lean(),
  ]);

  if (!product) return NextResponse.json({ suggested: 0, reason: "Продуктът не е намерен" });

  const unitsPerBox = product.units_per_box || 1;

  if (!lastOrder) {
    return NextResponse.json({
      suggested: unitsPerBox,
      reason: "Няма предишни поръчки. Препоръчан 1 кашон.",
    });
  }

  const date = new Date(lastOrder.date).toLocaleDateString("bg-BG", { day: "2-digit", month: "2-digit", year: "numeric" });
  const boxes = (lastOrder.quantity / unitsPerBox).toFixed(1).replace(/\.0$/, "");

  return NextResponse.json({
    suggested: lastOrder.quantity,
    reason: `Последна поръчка: ${lastOrder.quantity} бр. (${boxes} кашона) на ${date}`,
  });
}
