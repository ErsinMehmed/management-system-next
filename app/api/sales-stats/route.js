import connectMongoDB from "@/libs/mongodb";
import Sell from "@/models/sell";
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

  const sales = await Sell.aggregate([
    {
      $match: {
        date:
          request.nextUrl.searchParams.get("period") === "yesterday"
            ? {
                $gte: startDate,
                $lt: new Date(startDate.getTime() + 24 * 60 * 60 * 1000),
              }
            : { $gte: startDate },
      },
    },
    {
      $group: {
        _id: "$product",
        sales_count: { $sum: 1 },
        total_quantity: { $sum: "$quantity" },
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
        total_quantity: 1,
        sales_count: 1,
      },
    },
    {
      $match: {
        category: "Бутилки",
      },
    },
  ]);

  if (sales.length === 0) {
    return NextResponse.json({
      message: "Няма намерени данни за посоченият период",
      status: false,
    });
  }

  return NextResponse.json({
    sales: sales,
    status: true,
  });
}
