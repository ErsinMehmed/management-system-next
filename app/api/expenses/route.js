import connectMongoDB from "@/libs/mongodb";
import Sell from "@/models/sell";
import Order from "@/models/order";
import Ad from "@/models/ad";
import Product from "@/models/product";
import { NextResponse } from "next/server";
import { getDateCondition } from "@/utils";

export async function GET(request) {
  await connectMongoDB();

  const dateFrom = request.nextUrl.searchParams.get("dateFrom");
  const dateTo = request.nextUrl.searchParams.get("dateTo");
  const period = request.nextUrl.searchParams.get("period");

  const dateCondition = getDateCondition(dateFrom, dateTo, period);

  const totalAdAmountArray = await Ad.aggregate([
    {
      $match: dateCondition,
    },
    {
      $group: {
        _id: null,
        total_ad_price: { $sum: "$amount" },
      },
    },
  ]);

  const totalFuelAmountArray = await Sell.aggregate([
    {
      $match: dateCondition,
    },
    {
      $group: {
        _id: null,
        total_fuel_price: { $sum: "$fuel_price" },
        additional_costs: { $sum: "$additional_costs" },
      },
    },
  ]);

  const totalOrderAmountArray = await Order.aggregate([
    {
      $match: dateCondition,
    },
    {
      $group: {
        _id: null,
        total_amount: { $sum: "$total_amount" },
      },
    },
  ]);

  const expensesByProductArray = await Order.aggregate([
    {
      $match: dateCondition,
    },
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
    {
      $unwind: "$product",
    },
    {
      $lookup: {
        from: "categories",
        localField: "product.category",
        foreignField: "_id",
        as: "category",
      },
    },
    {
      $unwind: "$category",
    },
    {
      $project: {
        _id: "$product._id",
        name: "$product.name",
        weight: "$product.weight",
        flavor: "$product.flavor",
        count: "$product.count",
        category: "$category.name",
        quantity: 1,
        total_expenses: 1,
      },
    },
  ]);

  const totalAdAmount =
    totalAdAmountArray.length > 0 ? totalAdAmountArray[0].total_ad_price : 0;
  const totalFuelAmount =
    totalFuelAmountArray.length > 0
      ? totalFuelAmountArray[0].total_fuel_price
      : 0;
  const additionalCosts =
    totalFuelAmountArray.length > 0
      ? totalFuelAmountArray[0].additional_costs
      : 0;
  const totalOrderAmount =
    totalOrderAmountArray.length > 0
      ? totalOrderAmountArray[0].total_amount
      : 0;

  return NextResponse.json({
    total_ad_expenses: totalAdAmount,
    total_order_expenses: totalOrderAmount,
    total_fuel_expenses: totalFuelAmount,
    total_additional_expenses: additionalCosts,
    expenses_by_products: expensesByProductArray,
    status: true,
  });
}
