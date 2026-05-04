import { getAuth } from "@/helpers/getAuth";
import connectMongoDB from "@/libs/mongodb";
import ClientOrder from "@/models/clientOrder";
import { expandProducts, productAndCategoryLookup } from "@/libs/clientOrderQueries";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

export async function GET(request) {
  const session = await getAuth(request);
  if (!session) return NextResponse.json({ message: "Не сте оторизирани." }, { status: 401 });

  await connectMongoDB();

  const { searchParams } = request.nextUrl;
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const dateFilter = {};
  if (from) dateFilter.$gte = new Date(from);
  if (to) dateFilter.$lte = new Date(to);
  const dateMatch = Object.keys(dateFilter).length ? { createdAt: dateFilter } : {};

  const role = session.user.role;
  const isSeller = role === "Seller";
  const isAdmin = ["Admin", "Super Admin"].includes(role);

  if (!isSeller && !isAdmin) {
    return NextResponse.json({ message: "Нямате достъп до тази операция." }, { status: 403 });
  }

  // Seller — само неговите доставени поръчки, групирани по продукт
  if (isSeller) {
    const items = await ClientOrder.aggregate([
      { $match: { status: "доставена", assignedTo: new mongoose.Types.ObjectId(session.user.id), ...dateMatch } },
      ...expandProducts,
      ...productAndCategoryLookup,
      {
        $group: {
          _id: "$product",
          totalQuantity: { $sum: "$quantity" },
          totalRevenue:  { $sum: "$price" },
          totalDelivery: { $sum: "$deliveryCost" },
          paidPayout:    { $sum: { $cond: [{ $eq: ["$isPaid", true] }, { $ifNull: ["$payout", 0] }, 0] } },
          unpaidCount:   { $sum: { $cond: [{ $ne: ["$isPaid", true] }, 1, 0] } },
          product:       { $first: "$productDoc" },
        },
      },
      { $sort: { totalRevenue: -1 } },
    ]);

    const grandTotal      = items.reduce((sum, i) => sum + i.totalRevenue, 0);
    const grandDelivery   = items.reduce((sum, i) => sum + i.totalDelivery, 0);
    const grandPaidPayout = items.reduce((sum, i) => sum + i.paidPayout, 0);
    return NextResponse.json({ bySeller: false, items, grandTotal, grandDelivery, grandPaidPayout });
  }

  // Admin / Super Admin — групиране по seller+product, после по seller, user lookup САМО веднъж на seller
  const sellers = await ClientOrder.aggregate([
    { $match: { status: "доставена", ...dateMatch } },
    ...expandProducts,
    ...productAndCategoryLookup,
    // Първи group: по seller + product
    {
      $group: {
        _id: { seller: "$assignedTo", product: "$product" },
        totalQuantity:         { $sum: "$quantity" },
        totalRevenue:          { $sum: "$price" },
        totalPayout:           { $sum: "$orderPayout" },
        totalDelivery:         { $sum: "$deliveryCost" },
        totalDistributorPayout: { $sum: "$distributorPayout" },
        unpaidPayout:          { $sum: { $cond: [{ $ne: ["$isPaid", true] }, "$orderPayout", 0] } },
        unpaidCount:           { $sum: { $cond: [{ $ne: ["$isPaid", true] }, 1, 0] } },
        product:               { $first: "$productDoc" },
      },
    },
    // Втори group: по seller — събираме items масив
    {
      $group: {
        _id: "$_id.seller",
        items: {
          $push: {
            product:               "$product",
            totalQuantity:         "$totalQuantity",
            totalRevenue:          "$totalRevenue",
            totalPayout:           "$totalPayout",
            totalDelivery:         "$totalDelivery",
            totalDistributorPayout: "$totalDistributorPayout",
            unpaidPayout:          "$unpaidPayout",
            unpaidCount:           "$unpaidCount",
          },
        },
        sellerTotal:               { $sum: "$totalRevenue" },
        sellerPayout:              { $sum: "$totalPayout" },
        sellerDelivery:            { $sum: "$totalDelivery" },
        sellerDistributorPayout:   { $sum: "$totalDistributorPayout" },
        sellerUnpaidPayout:        { $sum: "$unpaidPayout" },
        sellerUnpaidCount:         { $sum: "$unpaidCount" },
      },
    },
    // User lookup СЛЕД grouping — веднъж на seller, не веднъж на seller+product
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
      $addFields: {
        sellerName: { $ifNull: ["$seller.name", "Неасайнати"] },
      },
    },
    { $unset: "seller" },
    { $sort: { sellerTotal: -1 } },
  ]);

  const grandTotal               = sellers.reduce((sum, s) => sum + s.sellerTotal, 0);
  const grandPayout              = sellers.reduce((sum, s) => sum + s.sellerPayout, 0);
  const grandPaidPayout          = sellers.reduce((sum, s) => sum + (s.sellerPayout - s.sellerUnpaidPayout), 0);
  const grandDistributorPayout   = sellers.reduce((sum, s) => sum + (s.sellerDistributorPayout ?? 0), 0);
  return NextResponse.json({ bySeller: true, sellers, grandTotal, grandPayout, grandPaidPayout, grandDistributorPayout });
}
