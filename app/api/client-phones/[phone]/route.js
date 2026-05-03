import { getAuth } from "@/helpers/getAuth";
import connectMongoDB from "@/libs/mongodb";
import ClientOrder from "@/models/clientOrder";
import ClientPhone from "@/models/clientPhone";
import Product from "@/models/product";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  const session = await getAuth(request);
  if (!session) return NextResponse.json({ message: "Няма достъп." }, { status: 401 });

  await connectMongoDB();
  // ensure Product model is registered for populate
  void Product;

  const { phone: rawPhone } = await params;
  const phone = decodeURIComponent(rawPhone);

  const orderFilter = { phone };

  const [phoneDoc, orders, stats, topProduct] = await Promise.all([
    ClientPhone.findOne({ phone }).populate("notes.createdBy", "name").lean(),
    ClientOrder.find(orderFilter)
      .populate("product", "name weight flavor puffs count")
      .populate("assignedTo", "name")
      .sort({ createdAt: -1 })
      .limit(50)
      .lean(),
    ClientOrder.aggregate([
      { $match: orderFilter },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: {
            $sum: {
              $cond: [
                { $eq: ["$status", "доставена"] },
                { $add: ["$price", { $ifNull: ["$secondProduct.price", 0] }] },
                0,
              ],
            },
          },
          firstOrder: { $min: "$createdAt" },
          lastOrder: { $max: "$createdAt" },
          delivered: { $sum: { $cond: [{ $eq: ["$status", "доставена"] }, 1, 0] } },
          rejected: { $sum: { $cond: [{ $eq: ["$status", "отказана"] }, 1, 0] } },
        },
      },
    ]),
    ClientOrder.aggregate([
      { $match: { ...orderFilter, status: "доставена" } },
      { $group: { _id: "$product", qty: { $sum: "$quantity" }, count: { $sum: 1 } } },
      { $sort: { qty: -1 } },
      { $limit: 1 },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
    ]),
  ]);

  const summary = stats[0] || {
    totalOrders: 0,
    totalRevenue: 0,
    firstOrder: null,
    lastOrder: null,
    delivered: 0,
    rejected: 0,
  };

  const favoriteProduct = topProduct[0]
    ? { name: topProduct[0].product.name, weight: topProduct[0].product.weight, quantity: topProduct[0].qty, orders: topProduct[0].count }
    : null;

  return NextResponse.json({
    phone,
    name: phoneDoc?.name || "",
    notes: phoneDoc?.notes || [],
    orders,
    summary,
    favoriteProduct,
  });
}
