import connectMongoDB from "@/libs/mongodb";
import Sell from "@/models/sell";
import Order from "@/models/order";
import Product from "@/models/product";
import { NextResponse } from "next/server";
import { getDateCondition } from "@/utils";

export async function GET(request) {
  await connectMongoDB();

  const dateFrom = request.nextUrl.searchParams.get("dateFrom");
  const dateTo = request.nextUrl.searchParams.get("dateTo");

  if (dateFrom && dateTo && dateFrom > dateTo) {
    return NextResponse.json({
      message: "Невалиден период от време",
      status: false,
    });
  }

  const dateCondition = getDateCondition(dateFrom, dateTo);

  // Извличане на приходите от Sell, групирани по продукт
  const totalIncomeArray = await Sell.aggregate([
    {
      $match: dateCondition,
    },
    {
      $group: {
        _id: "$product",
        totalIncome: { $sum: "$price" },
        totalQuantity: { $sum: "$quantity" },
      },
    },
    {
      $lookup: {
        from: "products",
        localField: "_id",
        foreignField: "_id",
        as: "productInfo",
      },
    },
    {
      $unwind: "$productInfo",
    },
    {
      $project: {
        productId: "$productInfo._id",
        productName: "$productInfo.name",
        productWeight: "$productInfo.weight",
        totalIncome: 1,
        totalQuantity: 1,
      },
    },
  ]);

  // Извличане на разходите от Order за същите продукти
  const totalCostsArray = await Order.aggregate([
    {
      $group: {
        _id: "$product",
        totalAmount: { $sum: "$total_amount" },
      },
    },
  ]);

  // Създаване на карта за бързо търсене на разходите по продукт
  const totalCostsMap = totalCostsArray.reduce((acc, item) => {
    acc[item._id] = item.totalAmount;
    return acc;
  }, {});

  // Изчисляване на печалбата за всеки продукт
  const profitResults = totalIncomeArray.map((item) => {
    const totalAmount = totalCostsMap[item.productId] || 0;
    const profit = item.totalIncome - totalAmount; // Печалба
    const averageProfit =
      item.totalQuantity > 0 ? profit / item.totalQuantity : 0;

    return {
      productName: item.productName + " " + item.productWeight + "гр.",
      totalIncome: item.totalIncome,
      totalAmount,
      profit,
      averageProfit,
      quantity: item.totalQuantity,
    };
  });

  // Изчисляване на средната печалба за всички продукти
  const totalProfit = profitResults.reduce((acc, item) => acc + item.profit, 0);
  const totalSoldQuantity = profitResults.reduce(
    (acc, item) => acc + item.quantity,
    0
  );
  const averageProfitOverall =
    totalSoldQuantity > 0 ? totalProfit / totalSoldQuantity : 0;

  return NextResponse.json({
    averageProfitOverall,
    profitResults,
    status: true,
  });
}
