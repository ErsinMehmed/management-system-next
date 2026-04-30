import { getAuth } from "@/helpers/getAuth";
import connectMongoDB from "@/libs/mongodb";
import ClientOrder from "@/models/clientOrder";
import User from "@/models/user";
import Product from "@/models/product";
import Category from "@/models/category";
import ClientPhone from "@/models/clientPhone";
import { NextResponse } from "next/server";

const sofiaDay = (date) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Sofia" }).format(new Date(date));

const fmtKey = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const computeAnalytics = async (fromStr, toStr) => {
  void User;
  void Product;
  void Category;

  const utcStart = new Date(`${fromStr}T00:00:00.000Z`);
  utcStart.setUTCDate(utcStart.getUTCDate() - 1);
  const utcEnd = new Date(`${toStr}T23:59:59.999Z`);
  utcEnd.setUTCDate(utcEnd.getUTCDate() + 1);

  const orders = await ClientOrder.find({ createdAt: { $gte: utcStart, $lte: utcEnd } })
    .select(
      "phone status price payout deliveryCost distributorPayout secondProduct product quantity assignedTo isPaid rejectionReason createdAt"
    )
    .populate({ path: "product", select: "name flavor weight puffs price image_url" })
    .populate({ path: "secondProduct.product", select: "name flavor weight puffs price image_url" })
    .populate({ path: "assignedTo", select: "name" })
    .lean();

  const filtered = orders.filter((o) => {
    const d = sofiaDay(o.createdAt);
    return d >= fromStr && d <= toStr;
  });

  const delivered = filtered.filter((o) => o.status === "доставена");
  const newCount = filtered.filter((o) => o.status === "нова").length;
  const rejected = filtered.filter((o) => o.status === "отказана");

  const profitOf = (o) => {
    const rev = (o.price || 0) + (o.secondProduct?.price || 0);
    const cost =
      (o.product?.price || 0) * (o.quantity || 0) +
      (o.secondProduct?.product?.price || 0) * (o.secondProduct?.quantity || 0);
    const commission = (o.payout || 0) + (o.secondProduct?.payout || 0);
    return rev - cost - commission - (o.deliveryCost || 0) - (o.distributorPayout || 0);
  };

  let revenue = 0;
  let cost = 0;
  let commissions = 0;
  let delivery = 0;
  let distributorPayoutSum = 0;
  let paidCount = 0;
  let paidSum = 0;
  let unpaidCount = 0;
  let unpaidSum = 0;

  for (const o of delivered) {
    const rev = (o.price || 0) + (o.secondProduct?.price || 0);
    revenue += rev;
    cost +=
      (o.product?.price || 0) * (o.quantity || 0) +
      (o.secondProduct?.product?.price || 0) * (o.secondProduct?.quantity || 0);
    commissions += (o.payout || 0) + (o.secondProduct?.payout || 0);
    delivery += o.deliveryCost || 0;
    distributorPayoutSum += o.distributorPayout || 0;
    if (o.isPaid) {
      paidCount += 1;
      paidSum += rev;
    } else {
      unpaidCount += 1;
      unpaidSum += rev;
    }
  }

  const profit = revenue - cost - commissions - delivery - distributorPayoutSum;
  const margin = revenue > 0 ? profit / revenue : 0;

  // Daily series (доставени)
  const seriesMap = new Map();
  for (const o of delivered) {
    const day = sofiaDay(o.createdAt);
    const e = seriesMap.get(day) || { date: day, revenue: 0, profit: 0, orders: 0 };
    const rev = (o.price || 0) + (o.secondProduct?.price || 0);
    e.revenue += rev;
    e.profit += profitOf(o);
    e.orders += 1;
    seriesMap.set(day, e);
  }

  const series = [];
  const [y1, m1, d1] = fromStr.split("-").map(Number);
  const [y2, m2, d2] = toStr.split("-").map(Number);
  const cursor = new Date(y1, m1 - 1, d1, 12);
  const endDay = new Date(y2, m2 - 1, d2, 12);
  while (cursor <= endDay) {
    const key = fmtKey(cursor);
    const v = seriesMap.get(key) || { date: key, revenue: 0, profit: 0, orders: 0 };
    series.push({
      date: v.date,
      revenue: Number(v.revenue.toFixed(2)),
      profit: Number(v.profit.toFixed(2)),
      orders: v.orders,
    });
    cursor.setDate(cursor.getDate() + 1);
  }

  // Sellers
  const sellersMap = new Map();
  const ensureSeller = (id, name) => {
    if (!sellersMap.has(id)) {
      sellersMap.set(id, { _id: id, name, orders: 0, rejected: 0, revenue: 0, payout: 0, paidPayout: 0 });
    }
    return sellersMap.get(id);
  };
  for (const o of delivered) {
    if (!o.assignedTo) continue;
    const e = ensureSeller(String(o.assignedTo._id), o.assignedTo.name);
    const rev = (o.price || 0) + (o.secondProduct?.price || 0);
    const payout = (o.payout || 0) + (o.secondProduct?.payout || 0);
    e.orders += 1;
    e.revenue += rev;
    e.payout += payout;
    if (o.isPaid) e.paidPayout += payout;
  }
  for (const o of rejected) {
    if (!o.assignedTo) continue;
    const e = ensureSeller(String(o.assignedTo._id), o.assignedTo.name);
    e.rejected += 1;
  }
  const sellers = [...sellersMap.values()]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10)
    .map((s) => ({
      ...s,
      revenue: Number(s.revenue.toFixed(2)),
      payout: Number(s.payout.toFixed(2)),
      paidPayout: Number(s.paidPayout.toFixed(2)),
    }));

  // Products
  const productsMap = new Map();
  const addProductEntry = (prod, qty, rev) => {
    if (!prod) return;
    const pid = String(prod._id);
    const e = productsMap.get(pid) || {
      _id: pid,
      name: prod.name,
      flavor: prod.flavor,
      weight: prod.weight,
      puffs: prod.puffs,
      image_url: prod.image_url,
      cost_price: prod.price || 0,
      qty: 0,
      orders: 0,
      revenue: 0,
      cost: 0,
    };
    e.qty += qty;
    e.orders += 1;
    e.revenue += rev;
    e.cost += (prod.price || 0) * qty;
    productsMap.set(pid, e);
  };
  for (const o of delivered) {
    addProductEntry(o.product, o.quantity || 0, o.price || 0);
    if (o.secondProduct?.product) {
      addProductEntry(o.secondProduct.product, o.secondProduct.quantity || 0, o.secondProduct.price || 0);
    }
  }
  const products = [...productsMap.values()]
    .map((p) => ({
      ...p,
      profit: Number((p.revenue - p.cost).toFixed(2)),
      margin: p.revenue > 0 ? Number(((p.revenue - p.cost) / p.revenue).toFixed(4)) : 0,
      revenue: Number(p.revenue.toFixed(2)),
      cost: Number(p.cost.toFixed(2)),
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  // Clients
  const clientsMap = new Map();
  for (const o of delivered) {
    if (!o.phone) continue;
    const e = clientsMap.get(o.phone) || { phone: o.phone, orders: 0, revenue: 0, lastOrder: null };
    const rev = (o.price || 0) + (o.secondProduct?.price || 0);
    e.orders += 1;
    e.revenue += rev;
    if (!e.lastOrder || o.createdAt > e.lastOrder) e.lastOrder = o.createdAt;
    clientsMap.set(o.phone, e);
  }
  const clients = [...clientsMap.values()]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10)
    .map((c) => ({ ...c, revenue: Number(c.revenue.toFixed(2)) }));

  if (clients.length) {
    const phones = clients.map((c) => c.phone);
    const phoneDocs = await ClientPhone.find({ phone: { $in: phones } }).select("phone name").lean();
    const map = new Map(phoneDocs.filter((d) => d.name && d.name.trim()).map((d) => [d.phone, d.name.trim()]));
    for (const c of clients) c.name = map.get(c.phone) || "";
  }

  // Frequency distribution на клиентите (1, 2, 3, 4+)
  const freq = { f1: 0, f2: 0, f3: 0, f4plus: 0 };
  for (const c of clientsMap.values()) {
    if (c.orders === 1) freq.f1 += 1;
    else if (c.orders === 2) freq.f2 += 1;
    else if (c.orders === 3) freq.f3 += 1;
    else freq.f4plus += 1;
  }

  // Status + rejection reasons
  const reasonsMap = new Map();
  for (const o of rejected) {
    const r = (o.rejectionReason || "").trim() || "Без причина";
    reasonsMap.set(r, (reasonsMap.get(r) || 0) + 1);
  }
  const topReasons = [...reasonsMap.entries()]
    .map(([reason, count]) => ({ reason, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const total = delivered.length + newCount + rejected.length;
  const conversionRate = total > 0 ? delivered.length / total : 0;

  return {
    kpi: {
      orders: delivered.length,
      revenue: Number(revenue.toFixed(2)),
      cost: Number(cost.toFixed(2)),
      commissions: Number(commissions.toFixed(2)),
      delivery: Number(delivery.toFixed(2)),
      distributorPayout: Number(distributorPayoutSum.toFixed(2)),
      profit: Number(profit.toFixed(2)),
      margin: Number(margin.toFixed(4)),
      aov: delivered.length > 0 ? Number((revenue / delivered.length).toFixed(2)) : 0,
      uniqueClients: clientsMap.size,
    },
    series,
    status: {
      delivered: delivered.length,
      new: newCount,
      rejected: rejected.length,
      total,
      conversionRate: Number(conversionRate.toFixed(4)),
      topReasons,
    },
    sellers,
    products,
    clients,
    clientFrequency: freq,
    payments: {
      paidCount,
      paidSum: Number(paidSum.toFixed(2)),
      unpaidCount,
      unpaidSum: Number(unpaidSum.toFixed(2)),
    },
  };
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
