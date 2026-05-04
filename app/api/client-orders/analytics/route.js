import { getAuth } from "@/helpers/getAuth";
import connectMongoDB from "@/libs/mongodb";
import ClientOrder from "@/models/clientOrder";
import User from "@/models/user";
import Product from "@/models/product";
import Category from "@/models/category";
import ClientPhone from "@/models/clientPhone";
import {
  revenueExpr,
  commissionExpr,
  costExpr,
  profitExpr,
} from "@/libs/clientOrderQueries";
import { NextResponse } from "next/server";

const fmtKey = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const buildPipeline = (fromStr, toStr, utcStart, utcEnd) => [
  // Hot match по индекса createdAt
  { $match: { createdAt: { $gte: utcStart, $lte: utcEnd } } },

  // Sofia ден като computed поле, после стесняваме до точния прозорец
  {
    $addFields: {
      _sofiaDay: {
        $dateToString: {
          format: "%Y-%m-%d",
          date: "$createdAt",
          timezone: "Europe/Sofia",
        },
      },
    },
  },
  { $match: { _sofiaDay: { $gte: fromStr, $lte: toStr } } },

  // Lookup-и за продуктите
  {
    $lookup: {
      from: "products",
      localField: "product",
      foreignField: "_id",
      as: "_productDoc",
    },
  },
  { $unwind: { path: "$_productDoc", preserveNullAndEmptyArrays: true } },
  {
    $lookup: {
      from: "products",
      localField: "secondProduct.product",
      foreignField: "_id",
      as: "_secondProductDoc",
    },
  },
  { $unwind: { path: "$_secondProductDoc", preserveNullAndEmptyArrays: true } },

  // Per-order суми
  {
    $addFields: {
      _revenue: revenueExpr,
      _cost: costExpr,
      _commissions: commissionExpr,
    },
  },
  { $addFields: { _profit: profitExpr } },

  // Една facet — всички секции наведнъж
  {
    $facet: {
      kpi: [
        { $match: { status: "доставена" } },
        {
          $group: {
            _id: null,
            orders: { $sum: 1 },
            revenue: { $sum: "$_revenue" },
            cost: { $sum: "$_cost" },
            commissions: { $sum: "$_commissions" },
            delivery: { $sum: { $ifNull: ["$deliveryCost", 0] } },
            distributorPayout: { $sum: { $ifNull: ["$distributorPayout", 0] } },
            profit: { $sum: "$_profit" },
            uniqueClients: { $addToSet: "$phone" },
            paidCount: { $sum: { $cond: [{ $eq: ["$isPaid", true] }, 1, 0] } },
            paidSum: { $sum: { $cond: [{ $eq: ["$isPaid", true] }, "$_revenue", 0] } },
            unpaidCount: { $sum: { $cond: [{ $ne: ["$isPaid", true] }, 1, 0] } },
            unpaidSum: { $sum: { $cond: [{ $ne: ["$isPaid", true] }, "$_revenue", 0] } },
          },
        },
        {
          $project: {
            _id: 0,
            orders: 1,
            revenue: 1,
            cost: 1,
            commissions: 1,
            delivery: 1,
            distributorPayout: 1,
            profit: 1,
            uniqueClients: { $size: "$uniqueClients" },
            paidCount: 1,
            paidSum: 1,
            unpaidCount: 1,
            unpaidSum: 1,
          },
        },
      ],

      series: [
        { $match: { status: "доставена" } },
        {
          $group: {
            _id: "$_sofiaDay",
            revenue: { $sum: "$_revenue" },
            profit: { $sum: "$_profit" },
            orders: { $sum: 1 },
          },
        },
        { $project: { _id: 0, date: "$_id", revenue: 1, profit: 1, orders: 1 } },
      ],

      sellers: [
        { $match: { assignedTo: { $ne: null } } },
        {
          $group: {
            _id: "$assignedTo",
            orders: { $sum: { $cond: [{ $eq: ["$status", "доставена"] }, 1, 0] } },
            rejected: { $sum: { $cond: [{ $eq: ["$status", "отказана"] }, 1, 0] } },
            revenue: { $sum: { $cond: [{ $eq: ["$status", "доставена"] }, "$_revenue", 0] } },
            payout: { $sum: { $cond: [{ $eq: ["$status", "доставена"] }, "$_commissions", 0] } },
            paidPayout: {
              $sum: {
                $cond: [
                  { $and: [{ $eq: ["$status", "доставена"] }, { $eq: ["$isPaid", true] }] },
                  "$_commissions",
                  0,
                ],
              },
            },
          },
        },
        // Изхвърляме доставчици само с "нова" статус (без delivered/rejected)
        { $match: { $or: [{ orders: { $gt: 0 } }, { rejected: { $gt: 0 } }] } },
        { $sort: { revenue: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "_user",
          },
        },
        {
          $project: {
            _id: 1,
            name: { $ifNull: [{ $arrayElemAt: ["$_user.name", 0] }, ""] },
            orders: 1,
            rejected: 1,
            revenue: 1,
            payout: 1,
            paidPayout: 1,
          },
        },
      ],

      products: [
        { $match: { status: "доставена" } },
        {
          $project: {
            entries: {
              $concatArrays: [
                [{
                  pid: "$product",
                  qty: { $ifNull: ["$quantity", 0] },
                  price: { $ifNull: ["$price", 0] },
                  doc: "$_productDoc",
                }],
                {
                  $cond: [
                    {
                      $and: [
                        { $ne: [{ $ifNull: ["$secondProduct.product", null] }, null] },
                        { $gt: [{ $ifNull: ["$secondProduct.quantity", 0] }, 0] },
                      ],
                    },
                    [{
                      pid: "$secondProduct.product",
                      qty: { $ifNull: ["$secondProduct.quantity", 0] },
                      price: { $ifNull: ["$secondProduct.price", 0] },
                      doc: "$_secondProductDoc",
                    }],
                    [],
                  ],
                },
              ],
            },
          },
        },
        { $unwind: "$entries" },
        // Игнорираме записи с изтрит продукт (orphan FK), за да съвпада със
        // старата JS логика, която филтрираше null product-и от populate-а.
        { $match: { "entries.doc": { $ne: null } } },
        {
          $group: {
            _id: "$entries.pid",
            qty: { $sum: "$entries.qty" },
            orders: { $sum: 1 },
            revenue: { $sum: "$entries.price" },
            cost: {
              $sum: {
                $multiply: [
                  { $ifNull: ["$entries.doc.price", 0] },
                  "$entries.qty",
                ],
              },
            },
            doc: { $first: "$entries.doc" },
          },
        },
        { $sort: { revenue: -1 } },
        { $limit: 10 },
        {
          $project: {
            _id: 1,
            name: "$doc.name",
            flavor: "$doc.flavor",
            weight: "$doc.weight",
            puffs: "$doc.puffs",
            image_url: "$doc.image_url",
            cost_price: { $ifNull: ["$doc.price", 0] },
            qty: 1,
            orders: 1,
            revenue: 1,
            cost: 1,
          },
        },
      ],

      clients: [
        { $match: { status: "доставена", phone: { $nin: [null, ""] } } },
        {
          $group: {
            _id: "$phone",
            orders: { $sum: 1 },
            revenue: { $sum: "$_revenue" },
            lastOrder: { $max: "$createdAt" },
          },
        },
        { $sort: { revenue: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: "clientphones",
            localField: "_id",
            foreignField: "phone",
            as: "_phoneDoc",
          },
        },
        {
          $project: {
            _id: 0,
            phone: "$_id",
            orders: 1,
            revenue: 1,
            lastOrder: 1,
            name: { $ifNull: [{ $arrayElemAt: ["$_phoneDoc.name", 0] }, ""] },
          },
        },
      ],

      clientFrequency: [
        { $match: { status: "доставена", phone: { $nin: [null, ""] } } },
        { $group: { _id: "$phone", orders: { $sum: 1 } } },
        {
          $group: {
            _id: null,
            f1: { $sum: { $cond: [{ $eq: ["$orders", 1] }, 1, 0] } },
            f2: { $sum: { $cond: [{ $eq: ["$orders", 2] }, 1, 0] } },
            f3: { $sum: { $cond: [{ $eq: ["$orders", 3] }, 1, 0] } },
            f4plus: { $sum: { $cond: [{ $gte: ["$orders", 4] }, 1, 0] } },
          },
        },
        { $project: { _id: 0, f1: 1, f2: 1, f3: 1, f4plus: 1 } },
      ],

      statusCounts: [
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ],

      topReasons: [
        { $match: { status: "отказана" } },
        {
          $project: {
            reason: {
              $let: {
                vars: { trimmed: { $trim: { input: { $ifNull: ["$rejectionReason", ""] } } } },
                in: { $cond: [{ $eq: ["$$trimmed", ""] }, "Без причина", "$$trimmed"] },
              },
            },
          },
        },
        { $group: { _id: "$reason", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
        { $project: { _id: 0, reason: "$_id", count: 1 } },
      ],
    },
  },
];

const computeAnalytics = async (fromStr, toStr) => {
  // Mongoose registers — нужни заради $lookup от тези колекции.
  void User;
  void Product;
  void Category;
  void ClientPhone;

  const utcStart = new Date(`${fromStr}T00:00:00.000Z`);
  utcStart.setUTCDate(utcStart.getUTCDate() - 1);
  const utcEnd = new Date(`${toStr}T23:59:59.999Z`);
  utcEnd.setUTCDate(utcEnd.getUTCDate() + 1);

  const pipeline = buildPipeline(fromStr, toStr, utcStart, utcEnd);
  const [result] = await ClientOrder.aggregate(pipeline).option({ allowDiskUse: true });

  const round2 = (n) => Number((n ?? 0).toFixed(2));
  const round4 = (n) => Number((n ?? 0).toFixed(4));

  const kpiRaw = result.kpi[0] ?? {};
  const orders = kpiRaw.orders ?? 0;
  const revenue = kpiRaw.revenue ?? 0;
  const profit = kpiRaw.profit ?? 0;

  const kpi = {
    orders,
    revenue: round2(revenue),
    cost: round2(kpiRaw.cost),
    commissions: round2(kpiRaw.commissions),
    delivery: round2(kpiRaw.delivery),
    distributorPayout: round2(kpiRaw.distributorPayout),
    profit: round2(profit),
    margin: revenue > 0 ? round4(profit / revenue) : 0,
    aov: orders > 0 ? round2(revenue / orders) : 0,
    uniqueClients: kpiRaw.uniqueClients ?? 0,
  };

  // Series + gap-filling по дни
  const seriesMap = new Map(result.series.map((s) => [s.date, s]));
  const series = [];
  const [y1, m1, d1] = fromStr.split("-").map(Number);
  const [y2, m2, d2] = toStr.split("-").map(Number);
  const cursor = new Date(y1, m1 - 1, d1, 12);
  const endDay = new Date(y2, m2 - 1, d2, 12);
  while (cursor <= endDay) {
    const key = fmtKey(cursor);
    const v = seriesMap.get(key) ?? { date: key, revenue: 0, profit: 0, orders: 0 };
    series.push({
      date: key,
      revenue: round2(v.revenue),
      profit: round2(v.profit),
      orders: v.orders,
    });
    cursor.setDate(cursor.getDate() + 1);
  }

  const sellers = (result.sellers ?? []).map((s) => ({
    _id: String(s._id),
    name: s.name,
    orders: s.orders,
    rejected: s.rejected,
    revenue: round2(s.revenue),
    payout: round2(s.payout),
    paidPayout: round2(s.paidPayout),
  }));

  const products = (result.products ?? []).map((p) => {
    const profitVal = (p.revenue ?? 0) - (p.cost ?? 0);
    return {
      _id: String(p._id),
      name: p.name,
      flavor: p.flavor,
      weight: p.weight,
      puffs: p.puffs,
      image_url: p.image_url,
      cost_price: p.cost_price ?? 0,
      qty: p.qty,
      orders: p.orders,
      revenue: round2(p.revenue),
      cost: round2(p.cost),
      profit: round2(profitVal),
      margin: p.revenue > 0 ? round4(profitVal / p.revenue) : 0,
    };
  });

  const clients = (result.clients ?? []).map((c) => ({
    phone: c.phone,
    orders: c.orders,
    revenue: round2(c.revenue),
    lastOrder: c.lastOrder,
    name: c.name ?? "",
  }));

  const freqRaw = result.clientFrequency[0] ?? {};
  const clientFrequency = {
    f1: freqRaw.f1 ?? 0,
    f2: freqRaw.f2 ?? 0,
    f3: freqRaw.f3 ?? 0,
    f4plus: freqRaw.f4plus ?? 0,
  };

  const statusByKey = new Map((result.statusCounts ?? []).map((s) => [s._id, s.count]));
  const delivered = statusByKey.get("доставена") ?? 0;
  const newCount = statusByKey.get("нова") ?? 0;
  const rejectedCount = statusByKey.get("отказана") ?? 0;
  const total = delivered + newCount + rejectedCount;
  const status = {
    delivered,
    new: newCount,
    rejected: rejectedCount,
    total,
    conversionRate: total > 0 ? round4(delivered / total) : 0,
    topReasons: result.topReasons ?? [],
  };

  const payments = {
    paidCount: kpiRaw.paidCount ?? 0,
    paidSum: round2(kpiRaw.paidSum),
    unpaidCount: kpiRaw.unpaidCount ?? 0,
    unpaidSum: round2(kpiRaw.unpaidSum),
  };

  return { kpi, series, sellers, products, clients, clientFrequency, status, payments };
};

export async function GET(request) {
  const session = await getAuth(request);
  if (!session) {
    return NextResponse.json({ message: "Не сте оторизирани." }, { status: 401 });
  }
  const isAdmin = ["Admin", "Super Admin"].includes(session.user.role);

  const { searchParams } = request.nextUrl;
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  if (!from || !to) {
    return NextResponse.json({ message: "Липсват дати." }, { status: 400 });
  }

  await connectMongoDB();

  // Auto-prev period със същата ширина
  const [y1, m1, d1] = from.split("-").map(Number);
  const [y2, m2, d2] = to.split("-").map(Number);
  const fromDate = new Date(y1, m1 - 1, d1);
  const toDate = new Date(y2, m2 - 1, d2);
  const widthDays = Math.round((toDate - fromDate) / 86400000);

  const prevTo = new Date(fromDate);
  prevTo.setDate(prevTo.getDate() - 1);
  const prevFrom = new Date(prevTo);
  prevFrom.setDate(prevFrom.getDate() - widthDays);
  const prevFromStr = fmtKey(prevFrom);
  const prevToStr = fmtKey(prevTo);

  const [current, previous] = await Promise.all([
    computeAnalytics(from, to),
    computeAnalytics(prevFromStr, prevToStr),
  ]);

  // За не-админи (Seller-и) скриваме profit-related стойностите
  if (!isAdmin) {
    delete current.kpi.profit;
    delete current.kpi.margin;
    delete current.kpi.cost;
    delete current.kpi.commissions;
    delete current.kpi.delivery;
    delete current.kpi.distributorPayout;
    delete previous.kpi.profit;
    delete previous.kpi.margin;
    delete previous.kpi.cost;
    delete previous.kpi.commissions;
    delete previous.kpi.delivery;
    delete previous.kpi.distributorPayout;
    current.series = current.series.map((s) => ({ date: s.date, revenue: s.revenue, orders: s.orders }));
    current.products = current.products.map((p) => {
      const { profit, cost, margin, ...rest } = p;
      return rest;
    });
  }

  return NextResponse.json({
    from,
    to,
    prev: { from: prevFromStr, to: prevToStr },
    isAdmin,
    ...current,
    kpiPrev: previous.kpi,
  });
}
