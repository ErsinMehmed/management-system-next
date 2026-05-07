import { requireAdmin } from "@/helpers/requireRole";
import connectMongoDB from "@/libs/mongodb";
import Sell from "@/models/sell";
import Order from "@/models/order";
import Product from "@/models/product";
import { NextResponse } from "next/server";
import { getDateCondition } from "@/utils";

export async function GET(request) {
  const { error } = await requireAdmin(request);
  if (error) return error;

  await connectMongoDB();

  const dateFrom = request.nextUrl.searchParams.get("dateFrom");
  const dateTo = request.nextUrl.searchParams.get("dateTo");
  const period = request.nextUrl.searchParams.get("period");

  if (dateFrom && dateTo && dateFrom > dateTo) {
    return NextResponse.json({
      message: "Невалиден период от време",
      status: false,
    });
  }

  const dateCondition = getDateCondition(dateFrom, dateTo, period);

  const [totalFuelAmountArray, totalOrderAmountArray, expensesByProductArray] =
    await Promise.all([
      Sell.aggregate([
        { $match: dateCondition },
        {
          $group: {
            _id: null,
            total_fuel_price: { $sum: "$fuel_price" },
            additional_costs: { $sum: "$additional_costs" },
          },
        },
      ]),
      Order.aggregate([
        { $match: dateCondition },
        { $group: { _id: null, total_amount: { $sum: "$total_amount" } } },
      ]),
      Order.aggregate([
        { $match: dateCondition },
        {
          $group: {
            _id: "$product",
            quantity: { $sum: "$quantity" },
            total_expenses: { $sum: "$total_amount" },
          },
        },
        {
          $lookup: {
            from: "products",
            localField: "_id",
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
            as: "category",
          },
        },
        { $unwind: "$category" },
        {
          $project: {
            _id: "$product._id",
            name: "$product.name",
            weight: "$product.weight",
            flavor: "$product.flavor",
            puffs: "$product.puffs",
            count: "$product.count",
            category: "$category.name",
            quantity: 1,
            total_expenses: 1,
          },
        },
        { $sort: { quantity: 1 } },
      ]),
    ]);

  return NextResponse.json({
    total_order_expenses: totalOrderAmountArray[0]?.total_amount ?? 0,
    total_fuel_expenses: totalFuelAmountArray[0]?.total_fuel_price ?? 0,
    total_additional_expenses: totalFuelAmountArray[0]?.additional_costs ?? 0,
    expenses_by_products: expensesByProductArray,
    status: true,
  });
}
