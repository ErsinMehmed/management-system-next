import connectMongoDB from "@/libs/mongodb";
import Sell from "@/models/sell";
import Order from "@/models/order";
import { NextResponse } from "next/server";
import { getDateCondition } from "@/utils";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import mongoose from "mongoose";

export async function GET(request) {
  await connectMongoDB();

  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  const userObjectId = new mongoose.Types.ObjectId(userId);

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

  const matchCondition = {
    ...dateCondition,
    creator: userObjectId,
  };

  const totalIncomesArray = await Sell.aggregate([
    {
      $match: matchCondition,
    },
    {
      $group: {
        _id: null,
        incomes: { $sum: "$price" },
      },
    },
  ]);

  const incomesByProductArray = await Sell.aggregate([
    {
      $match: matchCondition,
    },
    {
      $group: {
        _id: "$product",
        quantity: { $sum: "$quantity" },
        total_incomes: { $sum: "$price" },
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
        total_incomes: 1,
      },
    },
    {
      $sort: { quantity: 1 },
    },
  ]);

  const totalIncomes =
    totalIncomesArray.length > 0 ? totalIncomesArray[0].incomes : 0;

  return NextResponse.json({
    incomes: totalIncomes,
    incomes_by_products: incomesByProductArray,
    status: true,
  });
}
