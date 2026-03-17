import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectMongoDB from "@/libs/mongodb";
import ClientOrder from "@/models/clientOrder";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

// Разгъва всяка поръчка в 1-2 реда (основен + втори продукт ако има)
const expandProducts = [
  {
    $addFields: {
      _entries: {
        $concatArrays: [
          [{
            product:      "$product",
            quantity:     "$quantity",
            price:        "$price",
            deliveryCost: { $ifNull: ["$deliveryCost", 0] },
            payout:       { $subtract: [{ $ifNull: ["$payout", 0] }, { $ifNull: ["$secondProduct.payout", 0] }] },
            isPaid:       "$isPaid",
            isMain:       true,
          }],
          {
            $cond: [
              { $and: [
                { $ne: [{ $ifNull: ["$secondProduct.product", null] }, null] },
                { $gt: [{ $ifNull: ["$secondProduct.quantity", 0] }, 0] },
              ]},
              [{
                product:      "$secondProduct.product",
                quantity:     "$secondProduct.quantity",
                price:        { $ifNull: ["$secondProduct.price", 0] },
                deliveryCost: { $literal: 0 },
                payout:       { $ifNull: ["$secondProduct.payout", 0] },
                isPaid:       "$isPaid",
                isMain:       false,
              }],
              [],
            ],
          },
        ],
      },
    },
  },
  { $unwind: "$_entries" },
  {
    $addFields: {
      product:      "$_entries.product",
      quantity:     "$_entries.quantity",
      price:        "$_entries.price",
      deliveryCost: "$_entries.deliveryCost",
      payout:       "$_entries.payout",
      isPaid:       "$_entries.isPaid",
      _isMain:      "$_entries.isMain",
    },
  },
];

const productAndCategoryLookup = [
  {
    $lookup: {
      from: "products",
      localField: "product",
      foreignField: "_id",
      as: "productDoc",
    },
  },
  { $unwind: { path: "$productDoc", preserveNullAndEmptyArrays: true } },
  {
    $lookup: {
      from: "categories",
      localField: "productDoc.category",
      foreignField: "_id",
      as: "categoryArr",
    },
  },
  {
    $addFields: {
      "productDoc.category": { $arrayElemAt: ["$categoryArr", 0] },
      orderPayout: { $ifNull: ["$payout", 0] },
    },
  },
  { $unset: "categoryArr" },
];

export async function GET(request) {
  const session = await getServerSession(authOptions);
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

  // Admin / Super Admin — всички доставени, групирани по доставчик → продукт
  const sellers = await ClientOrder.aggregate([
    { $match: { status: "доставена", ...dateMatch } },
    ...expandProducts,
    ...productAndCategoryLookup,
    {
      $group: {
        _id: { seller: "$assignedTo", product: "$product" },
        totalQuantity: { $sum: "$quantity" },
        totalRevenue:  { $sum: "$price" },
        totalPayout:   { $sum: "$orderPayout" },
        totalDelivery: { $sum: "$deliveryCost" },
        unpaidPayout:  { $sum: { $cond: [{ $ne: ["$isPaid", true] }, "$orderPayout", 0] } },
        unpaidCount:   { $sum: { $cond: [{ $ne: ["$isPaid", true] }, 1, 0] } },
        product:       { $first: "$productDoc" },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "_id.seller",
        foreignField: "_id",
        as: "seller",
      },
    },
    { $unwind: { path: "$seller", preserveNullAndEmptyArrays: true } },
    {
      $group: {
        _id: "$_id.seller",
        sellerName:        { $first: { $ifNull: ["$seller.name", "Неасайнати"] } },
        items: {
          $push: {
            product:      "$product",
            totalQuantity: "$totalQuantity",
            totalRevenue:  "$totalRevenue",
            totalPayout:   "$totalPayout",
            totalDelivery: "$totalDelivery",
            unpaidPayout:  "$unpaidPayout",
            unpaidCount:   "$unpaidCount",
          },
        },
        sellerTotal:        { $sum: "$totalRevenue" },
        sellerPayout:       { $sum: "$totalPayout" },
        sellerDelivery:     { $sum: "$totalDelivery" },
        sellerUnpaidPayout: { $sum: "$unpaidPayout" },
        sellerUnpaidCount:  { $sum: "$unpaidCount" },
      },
    },
    { $sort: { sellerTotal: -1 } },
  ]);

  const grandTotal      = sellers.reduce((sum, s) => sum + s.sellerTotal, 0);
  const grandPayout     = sellers.reduce((sum, s) => sum + s.sellerPayout, 0);
  const grandPaidPayout = sellers.reduce((sum, s) => sum + (s.sellerPayout - s.sellerUnpaidPayout), 0);
  return NextResponse.json({ bySeller: true, sellers, grandTotal, grandPayout, grandPaidPayout });
}
