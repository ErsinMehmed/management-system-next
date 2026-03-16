import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectMongoDB from "@/libs/mongodb";
import ClientOrder from "@/models/clientOrder";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ message: "Не сте оторизирани." }, { status: 401 });

  await connectMongoDB();

  const isSeller = session.user.role === "Seller";
  const baseMatch = isSeller
    ? { isPaid: true, assignedTo: new mongoose.Types.ObjectId(session.user.id) }
    : { isPaid: true };

  const sellers = await ClientOrder.aggregate([
    { $match: baseMatch },
    {
      $lookup: {
        from: "products",
        localField: "product",
        foreignField: "_id",
        as: "productDoc",
      },
    },
    { $unwind: { path: "$productDoc", preserveNullAndEmptyArrays: true } },
    // Групиране по доставчик + точен момент на плащане
    {
      $group: {
        _id: { seller: "$assignedTo", paidAt: "$paidAt" },
        paidAt: { $first: "$paidAt" },
        totalPayout: { $sum: "$payout" },
        totalRevenue: { $sum: "$price" },
        orderCount: { $sum: 1 },
        products: {
          $push: {
            name: "$productDoc.name",
            quantity: "$quantity",
            price: "$price",
            payout: "$payout",
          },
        },
      },
    },
    // Групиране по доставчик → масив от плащания
    {
      $group: {
        _id: "$_id.seller",
        totalPayout: { $sum: "$totalPayout" },
        totalRevenue: { $sum: "$totalRevenue" },
        orderCount: { $sum: "$orderCount" },
        payments: {
          $push: {
            paidAt: "$paidAt",
            totalPayout: "$totalPayout",
            totalRevenue: "$totalRevenue",
            orderCount: "$orderCount",
            products: "$products",
          },
        },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "seller",
      },
    },
    { $unwind: { path: "$seller", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 0,
        sellerId: "$_id",
        sellerName: { $ifNull: ["$seller.name", "Неасайнати"] },
        totalPayout: 1,
        totalRevenue: 1,
        orderCount: 1,
        payments: 1,
      },
    },
    { $sort: { totalRevenue: -1 } },
  ]);

  // Сортираме плащанията вътрешно по дата низходящо
  sellers.forEach((s) => s.payments.sort((a, b) => new Date(b.paidAt) - new Date(a.paidAt)));

  const grandTotal = sellers.reduce((s, x) => s + x.totalRevenue, 0);
  const grandPayout = sellers.reduce((s, x) => s + x.totalPayout, 0);

  return NextResponse.json({ sellers, isSeller, grandTotal, grandPayout });
}
