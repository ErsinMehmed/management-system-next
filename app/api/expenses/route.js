import connectMongoDB from "@/libs/mongodb";
import Sell from "@/models/sell";
import Order from "@/models/order";
import Product from "@/models/product";
import { NextResponse } from "next/server";

export async function GET(request) {
  await connectMongoDB();

  let startDate;

  switch (request.nextUrl.searchParams.get("period")) {
    case "today":
      startDate = new Date();
      startDate.setHours(0, 0, 0, 0);
      break;
    case "yesterday":
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 1);
      startDate.setHours(0, 0, 0, 0);
      break;
    case "last7days":
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
      break;
    case "lastMonth":
      startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1);
      break;
    case "last3Months":
      startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 3);
      break;
    case "last6Months":
      startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 6);
      break;
    case "lastYear":
      startDate = new Date();
      startDate.setFullYear(startDate.getFullYear() - 1);
      break;
    default:
      startDate = new Date(0);
  }

  const totalFuelAmountArray = await Sell.aggregate([
    {
      $match: {
        date: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: null,
        total_fuel_price: { $sum: "$fuel_price" },
      },
    },
  ]);

  const totalOrderAmountArray = await Order.aggregate([
    {
      $match: {
        date: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: null,
        total_amount: { $sum: "$total_amount" },
      },
    },
  ]);

  const totalFuelAmount =
    totalFuelAmountArray.length > 0
      ? totalFuelAmountArray[0].total_fuel_price
      : 0;
  const totalOrderAmount =
    totalOrderAmountArray.length > 0
      ? totalOrderAmountArray[0].total_amount
      : 0;

  return NextResponse.json({
    total_order_expenses: totalOrderAmount,
    total_fuel_expenses: totalFuelAmount,
    status: true,
  });
}
