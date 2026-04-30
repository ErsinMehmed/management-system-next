import { requireSuperAdmin } from "@/helpers/requireRole";
import connectMongoDB from "@/libs/mongodb";
import Product from "@/models/product";
import Category from "@/models/category";
import Order from "@/models/order";
import Sell from "@/models/sell";
import Ad from "@/models/ad";
import ClientOrder from "@/models/clientOrder";
import ClientPhone from "@/models/clientPhone";
import { NextResponse } from "next/server";

const parseRange = (from, to) => ({ fromStr: from, toStr: to });

const sofiaDay = (date) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Sofia" }).format(new Date(date));

const aggregatePeriod = async ({ fromStr, toStr }) => {
  void Product; void Category;

  // Широк UTC range с буфер от +/- 1 ден
  const utcStart = new Date(`${fromStr}T00:00:00.000Z`);
  utcStart.setUTCDate(utcStart.getUTCDate() - 1);
  const utcEnd = new Date(`${toStr}T23:59:59.999Z`);
  utcEnd.setUTCDate(utcEnd.getUTCDate() + 1);

  const dateMatch = { date: { $gte: utcStart, $lte: utcEnd } };

  // Sell-ове с product populated — за revenue, orders, topProducts, byCategory, daily
  const rawSales = await Sell.find(dateMatch)
    .select("date quantity price product additional_costs fuel_price")
    .populate({ path: "product", select: "name weight flavor puffs count image_url category price" })
    .lean();

  // Категории отделно
  const categories = await Category.find({}).lean();
  const categoryMap = new Map(categories.map((c) => [String(c._id), c.name]));

  // Разходи отделно: Order (зареждане), Ad (реклама)
  const [dailyOrderExp, dailyAdExp, orderExpensesAgg, adsAgg] = await Promise.all([
    Order.find(dateMatch).select("date total_amount").lean(),
    Ad.find(dateMatch).select("date amount").lean(),
    Order.aggregate([{ $match: dateMatch }, { $group: { _id: null, total: { $sum: "$total_amount" } } }]),
    Ad.aggregate([{ $match: dateMatch }, { $group: { _id: null, total: { $sum: "$amount" } } }]),
  ]);

  // ── Групиране по Sofia date ──
  const revByDay = new Map();
  const ordByDay = new Map();
  const expByDay = new Map();

  let totalRevenue = 0;
  let totalOrders = 0;
  const productAgg = new Map();
  const categoryAgg = new Map();

  for (const s of rawSales) {
    const day = sofiaDay(s.date);
    if (day < fromStr || day > toStr) continue;
    const amt = s.price || 0;
    revByDay.set(day, (revByDay.get(day) || 0) + amt);
    ordByDay.set(day, (ordByDay.get(day) || 0) + 1);
    totalRevenue += amt;
    totalOrders += 1;

    if (s.product) {
      const pid = String(s.product._id);
      const existing = productAgg.get(pid) || {
        _id: s.product._id, name: s.product.name, weight: s.product.weight,
        flavor: s.product.flavor, puffs: s.product.puffs, count: s.product.count,
        image_url: s.product.image_url, cost_price: s.product.price || 0,
        qty: 0, revenue: 0, countOrders: 0, cost: 0,
      };
      existing.qty += s.quantity || 0;
      existing.revenue += amt;
      existing.cost += (s.quantity || 0) * (s.product.price || 0);
      existing.countOrders += 1;
      productAgg.set(pid, existing);

      const catId = String(s.product.category || "");
      const catName = categoryMap.get(catId);
      if (catName) {
        const c = categoryAgg.get(catName) || { _id: catName, revenue: 0, count: 0 };
        c.revenue += amt;
        c.count += 1;
        categoryAgg.set(catName, c);
      }
    }
  }

  // Разходи по дни
  let totalOrderExp = 0;
  for (const o of dailyOrderExp) {
    const day = sofiaDay(o.date);
    if (day < fromStr || day > toStr) continue;
    expByDay.set(day, (expByDay.get(day) || 0) + (o.total_amount || 0));
    totalOrderExp += o.total_amount || 0;
  }
  let totalAdExp = 0;
  for (const a of dailyAdExp) {
    const day = sofiaDay(a.date);
    if (day < fromStr || day > toStr) continue;
    expByDay.set(day, (expByDay.get(day) || 0) + (a.amount || 0));
    totalAdExp += a.amount || 0;
  }
  // Fuel + additional от Sell
  let totalFuelExp = 0;
  let totalAddExp = 0;
  for (const s of rawSales) {
    const day = sofiaDay(s.date);
    if (day < fromStr || day > toStr) continue;
    const fuel = s.fuel_price || 0;
    const add = s.additional_costs || 0;
    if (fuel || add) {
      expByDay.set(day, (expByDay.get(day) || 0) + fuel + add);
    }
    totalFuelExp += fuel;
    totalAddExp += add;
  }

  const expenses = totalOrderExp + totalAdExp + totalFuelExp + totalAddExp;

  // Всички продукти с продажби — sorted по revenue desc
  const allProducts = [...productAgg.values()]
    .sort((a, b) => b.revenue - a.revenue)
    .map((p) => ({ ...p, count: p.countOrders, profit: p.revenue - p.cost }));

  // Топ 5 продукти
  const topProducts = allProducts.slice(0, 5);

  // By category
  const byCategory = [...categoryAgg.values()].sort((a, b) => b.revenue - a.revenue);

  // Попълваме всеки ден от периода (с 0 за липсващи)
  const [y1, m1, d1] = fromStr.split("-").map(Number);
  const [y2, m2, d2] = toStr.split("-").map(Number);
  const cursor = new Date(y1, m1 - 1, d1, 12, 0, 0, 0);
  const endDay = new Date(y2, m2 - 1, d2, 12, 0, 0, 0);
  const timeSeries = [];
  const revenueTimeSeries = [];
  while (cursor <= endDay) {
    const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}-${String(cursor.getDate()).padStart(2, "0")}`;
    const rev = revByDay.get(key) || 0;
    const exp = expByDay.get(key) || 0;
    const ord = ordByDay.get(key) || 0;
    timeSeries.push({ date: key, revenue: rev, orders: ord, expenses: exp, profit: rev - exp });
    revenueTimeSeries.push({ date: key, revenue: rev });
    cursor.setDate(cursor.getDate() + 1);
  }

  // ── Клиентски агрегати: уникални телефони с доставени поръчки в периода ──
  const deliveredOrders = await ClientOrder.find({
    status: "доставена",
    createdAt: { $gte: utcStart, $lte: utcEnd },
  })
    .select("phone createdAt price secondProduct")
    .lean();

  const clientsMap = new Map();
  for (const o of deliveredOrders) {
    const day = sofiaDay(o.createdAt);
    if (day < fromStr || day > toStr) continue;
    const phone = o.phone;
    if (!phone) continue;
    const rev = (o.price || 0) + (o.secondProduct?.price || 0);
    const ex = clientsMap.get(phone) || { phone, revenue: 0, orders: 0, lastOrder: null };
    ex.revenue += rev;
    ex.orders += 1;
    if (!ex.lastOrder || o.createdAt > ex.lastOrder) ex.lastOrder = o.createdAt;
    clientsMap.set(phone, ex);
  }
  const clientsByPhone = [...clientsMap.values()].sort((a, b) => b.revenue - a.revenue);

  return {
    revenue: Number(totalRevenue.toFixed(2)),
    expenses: Number(expenses.toFixed(2)),
    profit: Number((totalRevenue - expenses).toFixed(2)),
    orders: totalOrders,
    topProducts,
    allProducts,
    byCategory,
    timeSeries,
    revenueTimeSeries,
    clientsByPhone,
  };
};

export async function GET(request) {
  const { error } = await requireSuperAdmin(request);
  if (error) return error;

  const { searchParams } = request.nextUrl;
  const from1 = searchParams.get("from1");
  const to1 = searchParams.get("to1");
  const from2 = searchParams.get("from2");
  const to2 = searchParams.get("to2");

  if (!from1 || !to1 || !from2 || !to2) {
    return NextResponse.json({ message: "Липсват дати." }, { status: 400 });
  }

  await connectMongoDB();

  const range1 = parseRange(from1, to1);
  const range2 = parseRange(from2, to2);

  const [period1, period2] = await Promise.all([
    aggregatePeriod(range1),
    aggregatePeriod(range2),
  ]);

  // Cross-period клиентски анализ
  const phonesP1 = new Set(period1.clientsByPhone.map((c) => c.phone));
  const phonesP2 = new Set(period2.clientsByPhone.map((c) => c.phone));

  const newClients = period1.clientsByPhone.filter((c) => !phonesP2.has(c.phone));
  const returningClients = period1.clientsByPhone.filter((c) => phonesP2.has(c.phone));
  const retentionRate =
    phonesP2.size > 0 ? returningClients.length / phonesP2.size : 0;

  const lostClients = period2.clientsByPhone
    .filter((c) => !phonesP1.has(c.phone))
    .slice(0, 5);

  const topClients = period1.clientsByPhone.slice(0, 5);

  // Обогатяване с името от ClientPhone, ако е попълнено
  const phonesToLookup = [...new Set([...topClients.map((c) => c.phone), ...lostClients.map((c) => c.phone)])];
  const phoneNameMap = new Map();
  if (phonesToLookup.length) {
    const phoneDocs = await ClientPhone.find({ phone: { $in: phonesToLookup } })
      .select("phone name")
      .lean();
    for (const d of phoneDocs) {
      if (d.name && d.name.trim()) phoneNameMap.set(d.phone, d.name.trim());
    }
  }
  const enrich = (c) => ({ ...c, name: phoneNameMap.get(c.phone) || "" });
  const topClientsEnriched = topClients.map(enrich);
  const lostClientsEnriched = lostClients.map(enrich);

  const clientsAnalysis = {
    total: period1.clientsByPhone.length,
    totalPrev: period2.clientsByPhone.length,
    newCount: newClients.length,
    returningCount: returningClients.length,
    retentionRate: Number(retentionRate.toFixed(4)),
    topClients: topClientsEnriched,
    lostClients: lostClientsEnriched,
  };

  // не връщаме пълния clientsByPhone в response-а
  const { clientsByPhone: _c1, ...p1Public } = period1;
  const { clientsByPhone: _c2, ...p2Public } = period2;

  return NextResponse.json({
    period1: { from: range1.fromStr, to: range1.toStr, ...p1Public, clients: clientsAnalysis },
    period2: { from: range2.fromStr, to: range2.toStr, ...p2Public },
  });
}
