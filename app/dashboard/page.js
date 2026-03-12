import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import connectMongoDB from "@/libs/mongodb";
import Sell from "@/models/sell";
import Order from "@/models/order";
import Ad from "@/models/ad";
import Product from "@/models/product";
import Category from "@/models/category";
import Income from "@/models/income";
import mongoose from "mongoose";
import DashboardClient from "@/components/dashboard/DashboardClient";

async function fetchExpenses() {
  const [adResult, fuelResult, orderResult, byProductResult] = await Promise.all([
    Ad.aggregate([
      { $group: { _id: null, total_ad_price: { $sum: "$amount" } } },
    ]),
    Sell.aggregate([
      { $group: { _id: null, total_fuel_price: { $sum: "$fuel_price" }, additional_costs: { $sum: "$additional_costs" } } },
    ]),
    Order.aggregate([
      { $group: { _id: null, total_amount: { $sum: "$total_amount" } } },
    ]),
    Order.aggregate([
      { $group: { _id: "$product", quantity: { $sum: "$quantity" }, total_expenses: { $sum: "$total_amount" } } },
      { $lookup: { from: "products", localField: "_id", foreignField: "_id", as: "product" } },
      { $unwind: "$product" },
      { $lookup: { from: "categories", localField: "product.category", foreignField: "_id", as: "category" } },
      { $unwind: "$category" },
      { $project: { _id: "$product._id", name: "$product.name", weight: "$product.weight", flavor: "$product.flavor", puffs: "$product.puffs", count: "$product.count", category: "$category.name", quantity: 1, total_expenses: 1 } },
      { $sort: { quantity: 1 } },
    ]),
  ]);

  return {
    total_ad_expenses: adResult[0]?.total_ad_price ?? 0,
    total_order_expenses: orderResult[0]?.total_amount ?? 0,
    total_fuel_expenses: fuelResult[0]?.total_fuel_price ?? 0,
    total_additional_expenses: fuelResult[0]?.additional_costs ?? 0,
    expenses_by_products: byProductResult,
    status: true,
  };
}

async function fetchLineChartStats() {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 7);

  const sales = await Sell.aggregate([
    { $match: { date: { $gte: startDate } } },
    { $group: { _id: { product: "$product", period: { $dateToString: { format: "%Y-%m-%d", date: "$date" } } }, total_quantity: { $sum: "$quantity" } } },
    { $lookup: { from: "products", localField: "_id.product", foreignField: "_id", as: "product" } },
    { $unwind: "$product" },
    { $lookup: { from: "categories", localField: "product.category", foreignField: "_id", as: "category" } },
    { $unwind: "$category" },
    { $match: { "category.name": "Бутилки" } },
    { $project: { _id: 0, name: "$product.name", period: "$_id.period", total_quantity: 1 } },
    { $sort: { period: 1 } },
  ]);

  if (sales.length === 0) {
    return { message: "Няма намерени данни за посоченият период", status: false };
  }

  const periods = [];
  const dataMap = {};

  sales.forEach(({ name, period, total_quantity }) => {
    if (!periods.includes(period)) periods.push(period);
    if (!dataMap[name]) dataMap[name] = { name, data: [] };
    const idx = periods.indexOf(period);
    dataMap[name].data[idx] = (dataMap[name].data[idx] || 0) + total_quantity;
  });

  const data = Object.values(dataMap).map((item) => ({
    ...item,
    data: periods.map((p, i) => item.data[i] || 0),
  }));

  return { periods, data, status: true };
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) redirect("/");

  await connectMongoDB();

  const isAdmin = ["Admin", "Super Admin"].includes(session.user.role);
  const userObjectId = new mongoose.Types.ObjectId(session.user.id);

  const [
    sellStatsResult,
    incomesResult,
    additionalIncomesResult,
    expensesResult,
    categories,
    products,
    lineChartResult,
  ] = await Promise.all([
    // Pie chart статистики (всички времена)
    Sell.aggregate([
      {
        $group: {
          _id: "$product",
          sales_count: { $sum: 1 },
          total_quantity: { $sum: "$quantity" },
        },
      },
      { $lookup: { from: "products", localField: "_id", foreignField: "_id", as: "product" } },
      { $unwind: "$product" },
      { $lookup: { from: "categories", localField: "product.category", foreignField: "_id", as: "category" } },
      { $unwind: "$category" },
      {
        $project: {
          _id: "$product._id",
          name: "$product.name",
          weight: "$product.weight",
          flavor: "$product.flavor",
          count: "$product.count",
          units_per_box: "$product.units_per_box",
          category: "$category.name",
          total_quantity: 1,
          sales_count: 1,
        },
      },
      { $match: { category: "Бутилки" } },
      { $sort: { total_quantity: 1 } },
    ]),

    // Приходи (само за текущия потребител)
    (async () => {
      const [totalArr, byProductArr] = await Promise.all([
        Sell.aggregate([
          { $match: { creator: userObjectId } },
          { $group: { _id: null, incomes: { $sum: "$price" } } },
        ]),
        Sell.aggregate([
          { $match: { creator: userObjectId } },
          { $group: { _id: "$product", quantity: { $sum: "$quantity" }, total_incomes: { $sum: "$price" } } },
          { $lookup: { from: "products", localField: "_id", foreignField: "_id", as: "product" } },
          { $unwind: "$product" },
          { $lookup: { from: "categories", localField: "product.category", foreignField: "_id", as: "category" } },
          { $unwind: "$category" },
          { $project: { _id: "$product._id", name: "$product.name", weight: "$product.weight", puffs: "$product.puffs", flavor: "$product.flavor", count: "$product.count", category: "$category.name", quantity: 1, total_incomes: 1 } },
          { $sort: { quantity: 1 } },
        ]),
      ]);
      return {
        incomes: totalArr[0]?.incomes ?? 0,
        incomes_by_products: byProductArr,
        status: true,
      };
    })(),

    // Допълнителни приходи
    Income.aggregate([
      { $group: { _id: null, incomes: { $sum: "$amount" } } },
    ]).then((r) => ({ incomes: r[0]?.incomes ?? 0 })),

    // Разходи (само за администратори)
    isAdmin
      ? fetchExpenses()
      : Promise.resolve({
          total_ad_expenses: 0,
          total_order_expenses: 0,
          total_fuel_expenses: 0,
          total_additional_expenses: 0,
          expenses_by_products: [],
          status: true,
        }),

    // Категории
    Category.find({}).lean(),

    // Продукти с категория (за таблицата с наличности)
    Product.find({}).populate("category").lean(),

    // Line chart (последните 7 дни по подразбиране)
    fetchLineChartStats(),
  ]);

  const initialData = JSON.parse(
    JSON.stringify({
      sellStats: {
        sales: sellStatsResult,
        status: sellStatsResult.length > 0,
      },
      incomes: incomesResult,
      additionalIncomes: additionalIncomesResult,
      expenses: expensesResult,
      categories: categories.map((c) => c.name),
      products,
      lineChartStats: lineChartResult,
    })
  );

  return <DashboardClient initialData={initialData} />;
}
