import { getAuth } from "@/helpers/getAuth";
import connectMongoDB from "@/libs/mongodb";
import ClientOrder from "@/models/clientOrder";
import Product from "@/models/product";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

// Разгъва всяка поръчка в 1-2 реда (основен + втори продукт ако има)
const expandProducts = [
  {
    $addFields: {
      _entries: {
        $concatArrays: [
          [
            {
              product: "$product",
              quantity: "$quantity",
              price: "$price",
              deliveryCost: { $ifNull: ["$deliveryCost", 0] },
              payout: {
                $subtract: [
                  { $ifNull: ["$payout", 0] },
                  { $ifNull: ["$secondProduct.payout", 0] },
                ],
              },
              isMain: true,
            },
          ],
          {
            $cond: [
              {
                $and: [
                  {
                    $ne: [{ $ifNull: ["$secondProduct.product", null] }, null],
                  },
                  { $gt: [{ $ifNull: ["$secondProduct.quantity", 0] }, 0] },
                ],
              },
              [
                {
                  product: "$secondProduct.product",
                  quantity: "$secondProduct.quantity",
                  price: { $ifNull: ["$secondProduct.price", 0] },
                  deliveryCost: { $literal: 0 },
                  payout: { $ifNull: ["$secondProduct.payout", 0] },
                  isMain: false,
                },
              ],
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
      product: "$_entries.product",
      quantity: "$_entries.quantity",
      price: "$_entries.price",
      deliveryCost: "$_entries.deliveryCost",
      payout: "$_entries.payout",
      _isMain: "$_entries.isMain",
    },
  },
];

export async function GET(request) {
  const session = await getAuth(request);
  if (!session)
    return NextResponse.json(
      { message: "Не сте оторизирани." },
      { status: 401 },
    );

  await connectMongoDB();

  const role = session.user.role;
  const isSeller = role === "Seller";
  const isAdmin = ["Admin", "Super Admin"].includes(role);

  if (!isSeller && !isAdmin) {
    return NextResponse.json(
      { message: "Нямате достъп до тази операция." },
      { status: 403 },
    );
  }

  const baseMatch = isSeller
    ? { isPaid: true, assignedTo: new mongoose.Types.ObjectId(session.user.id) }
    : { isPaid: true };

  const sellers = await ClientOrder.aggregate([
    { $match: baseMatch },
    ...expandProducts,
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
        totalDelivery: { $sum: "$deliveryCost" },
        orderCount: { $sum: { $cond: [{ $eq: ["$_isMain", true] }, 1, 0] } },
        revenueConfirmed: { $first: "$revenueConfirmed" },
        products: {
          $push: {
            name: "$productDoc.name",
            weight: "$productDoc.weight",
            flavor: "$productDoc.flavor",
            puffs: "$productDoc.puffs",
            count: "$productDoc.count",
            quantity: "$quantity",
            price: "$price",
            payout: "$payout",
            deliveryCost: "$deliveryCost",
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
        totalDelivery: { $sum: "$totalDelivery" },
        orderCount: { $sum: "$orderCount" },
        payments: {
          $push: {
            paidAt: "$paidAt",
            totalPayout: "$totalPayout",
            totalRevenue: "$totalRevenue",
            totalDelivery: "$totalDelivery",
            orderCount: "$orderCount",
            products: "$products",
            revenueConfirmed: "$revenueConfirmed",
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
        totalDelivery: 1,
        orderCount: 1,
        payments: 1,
      },
    },
    { $sort: { totalRevenue: -1 } },
  ]);

  // Сортираме плащанията вътрешно по дата низходящо
  sellers.forEach((s) =>
    s.payments.sort((a, b) => new Date(b.paidAt) - new Date(a.paidAt)),
  );

  const grandTotal = sellers.reduce((s, x) => s + x.totalRevenue, 0);
  const grandPayout = sellers.reduce((s, x) => s + x.totalPayout, 0);

  let owedTotal = 0;
  let grandOwedTotal = 0;

  if (isSeller) {
    // За селлър — дължимото е спрямо ВСИЧКИ доставени поръчки (платени + неплатени)
    const owedAgg = await ClientOrder.aggregate([
      {
        $match: {
          status: "доставена",
          assignedTo: new mongoose.Types.ObjectId(session.user.id),
        },
      },
      {
        $group: {
          _id: "$assignedTo",
          totalRevenue: {
            $sum: {
              $add: ["$price", { $ifNull: ["$secondProduct.price", 0] }],
            },
          },
          totalPayout: {
            $sum: {
              $add: [
                { $ifNull: ["$payout", 0] },
                { $ifNull: ["$secondProduct.payout", 0] },
              ],
            },
          },
        },
      },
    ]);
    const owedMap = {};
    for (const row of owedAgg) {
      const owed = row.totalRevenue - row.totalPayout;
      owedMap[String(row._id)] = owed;
      grandOwedTotal += owed;
    }
    sellers.forEach((s) => {
      s.owedAmount = owedMap[String(s.sellerId)] ?? 0;
    });
    owedTotal = grandOwedTotal;
  } else {
    // За супер адм — дължимото е само от изплатените суми в историята
    sellers.forEach((s) => {
      s.owedAmount = s.totalRevenue - s.totalPayout;
      grandOwedTotal += s.owedAmount;
    });
  }

  return NextResponse.json({
    sellers,
    isSeller,
    grandTotal,
    grandPayout,
    owedTotal: isSeller ? owedTotal : null,
    grandOwedTotal: !isSeller ? grandOwedTotal : null,
  });
}
