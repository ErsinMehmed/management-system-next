import { requireSuperAdmin } from "@/helpers/requireRole";
import connectMongoDB from "@/libs/mongodb";
import Product from "@/models/product";
import Category from "@/models/category";
import Order from "@/models/order";
import Sell from "@/models/sell";
import Ad from "@/models/ad";
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
    .populate({ path: "product", select: "name weight flavor puffs count image_url category" })
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
        image_url: s.product.image_url, qty: 0, revenue: 0, countOrders: 0,
      };
      existing.qty += s.quantity || 0;
      existing.revenue += amt;
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

  // Топ 5 продукти
  const topProducts = [...productAgg.values()]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)
    .map((p) => ({ ...p, count: p.countOrders }));

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

  return {
    revenue: Number(totalRevenue.toFixed(2)),
    expenses: Number(expenses.toFixed(2)),
    profit: Number((totalRevenue - expenses).toFixed(2)),
    orders: totalOrders,
    topProducts,
    byCategory,
    timeSeries,
    revenueTimeSeries,
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

  return NextResponse.json({
    period1: { from: range1.fromStr, to: range1.toStr, ...period1 },
    period2: { from: range2.fromStr, to: range2.toStr, ...period2 },
  });
}
