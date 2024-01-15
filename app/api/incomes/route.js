import connectMongoDB from "@/libs/mongodb";
import Sell from "@/models/sell";
import Order from "@/models/order";
import { NextResponse } from "next/server";

export async function GET(request) {
  await connectMongoDB();

  let startDate;
  let endDate;
  let dateCondition = {};

  const dateFrom = request.nextUrl.searchParams.get("dateFrom");
  const dateTo = request.nextUrl.searchParams.get("dateTo");

  if (dateFrom && dateTo) {
    startDate = new Date(dateFrom);
    startDate.setHours(0, 0, 0, 0);

    endDate = new Date(dateTo);
    endDate.setHours(23, 59, 59, 999);

    dateCondition = {
      date: {
        $gte: startDate,
        $lte: endDate,
      },
    };

    if (startDate > endDate) {
      return NextResponse.json({
        status: false,
        message: "Невалиден период от време",
      });
    }
  } else if (dateFrom) {
    startDate = new Date(dateFrom);

    dateCondition = {
      date: {
        $gte: startDate,
      },
    };
  } else if (dateTo) {
    endDate = new Date(dateTo);

    dateCondition = {
      date: {
        $lte: endDate,
      },
    };
  } else {
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

    dateCondition = {
      date:
        request.nextUrl.searchParams.get("period") === "yesterday"
          ? {
              $gte: startDate,
              $lt: new Date(startDate.getTime() + 24 * 60 * 60 * 1000),
            }
          : { $gte: startDate },
    };
  }

  const totalIncomesArray = await Sell.aggregate([
    {
      $match: dateCondition,
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
      $match: dateCondition,
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
  ]);

  const totalIncomes =
    totalIncomesArray.length > 0 ? totalIncomesArray[0].incomes : 0;

  return NextResponse.json({
    incomes: totalIncomes,
    incomes_by_products: incomesByProductArray,
    status: true,
  });
}
