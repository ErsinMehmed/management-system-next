import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectMongoDB from "@/libs/mongodb";
import ClientOrder from "@/models/clientOrder";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

const productLookup = [
  {
    $lookup: {
      from: "products",
      localField: "productId",
      foreignField: "_id",
      as: "product",
    },
  },
  { $unwind: "$product" },
  {
    $lookup: {
      from: "categories",
      localField: "product.category",
      foreignField: "_id",
      as: "product.category",
    },
  },
  { $unwind: { path: "$product.category", preserveNullAndEmpty: true } },
];

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ message: "Не сте оторизирани." }, { status: 401 });

  await connectMongoDB();

  const isSuperAdmin = session.user.role === "Super Admin";
  const isSeller = session.user.role === "Seller";

  // Seller — само неговите доставени поръчки, групирани по продукт
  if (isSeller) {
    const items = await ClientOrder.aggregate([
      { $match: { status: "доставена", assignedTo: new mongoose.Types.ObjectId(session.user.id) } },
      { $group: { _id: "$product", totalQuantity: { $sum: "$quantity" }, totalRevenue: { $sum: "$price" } } },
      { $addFields: { productId: "$_id" } },
      ...productLookup,
      { $sort: { totalRevenue: -1 } },
    ]);

    const grandTotal = items.reduce((sum, i) => sum + i.totalRevenue, 0);
    return NextResponse.json({ bySeller: false, items, grandTotal });
  }

  // Super Admin — всички доставени, групирани по доставчик → продукт
  const sellers = await ClientOrder.aggregate([
    { $match: { status: "доставена" } },
    {
      $group: {
        _id: { seller: "$assignedTo", product: "$product" },
        totalQuantity: { $sum: "$quantity" },
        totalRevenue: { $sum: "$price" },
      },
    },
    { $addFields: { productId: "$_id.product" } },
    ...productLookup,
    {
      $lookup: {
        from: "users",
        localField: "_id.seller",
        foreignField: "_id",
        as: "seller",
      },
    },
    { $unwind: { path: "$seller", preserveNullAndEmpty: true } },
    {
      $group: {
        _id: "$_id.seller",
        sellerName: { $first: { $ifNull: ["$seller.name", "Неасайнати"] } },
        items: {
          $push: {
            product: "$product",
            totalQuantity: "$totalQuantity",
            totalRevenue: "$totalRevenue",
          },
        },
        sellerTotal: { $sum: "$totalRevenue" },
      },
    },
    { $sort: { sellerTotal: -1 } },
  ]);

  const grandTotal = sellers.reduce((sum, s) => sum + s.sellerTotal, 0);
  return NextResponse.json({ bySeller: true, sellers, grandTotal });
}
