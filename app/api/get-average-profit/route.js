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
        totalAdditionalCosts: { $sum: "$additional_costs" },
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
      $match: {
        "productInfo.hidden": false,
      },
    },
    {
      $lookup: {
        from: "categories",
        localField: "productInfo.category",
        foreignField: "_id",
        as: "categoryInfo",
      },
    },
    {
      $unwind: "$categoryInfo",
    },
    {
      $match: {
        "categoryInfo.name": "Бутилки",
      },
    },
    {
      $project: {
        productId: "$productInfo._id",
        productName: "$productInfo.name",
        productWeight: "$productInfo.weight",
        totalIncome: 1,
        totalQuantity: 1,
        totalAdditionalCosts: 1,
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
    const totalAdditionalCosts = item.totalAdditionalCosts || 0;
    const profit = item.totalIncome - totalAmount - totalAdditionalCosts; // Печалба
    const averageProfit =
      item.totalQuantity > 0 ? profit / item.totalQuantity : 0;

    return {
      productName: item.productName + " " + item.productWeight + "гр.",
      totalIncome: parseFloat(item.totalIncome.toFixed(2)),
      totalAmount: parseFloat(totalAmount.toFixed(2)),
      totalAdditionalCosts: parseFloat(totalAdditionalCosts.toFixed(2)),
      profit: parseFloat(profit.toFixed(2)),
      averageProfit: parseFloat(averageProfit.toFixed(2)),
      quantity: parseFloat(item.totalQuantity.toFixed(2)),
    };
  });

  profitResults.sort((a, b) => b.averageProfit - a.averageProfit);

  // Изчисляване на общата печалба, включително и допълнителните разходи
  const totalProfit = profitResults.reduce(
    (acc, item) => acc + (item.profit - item.totalAdditionalCosts),
    0
  );

  // Изчисляване на общото количество продадени продукти
  const totalSoldQuantity = profitResults.reduce(
    (acc, item) => acc + item.quantity,
    0
  );

  // Изчисляване на средната печалба за всички продукти, включително допълнителните разходи
  const averageProfitOverall = parseFloat(
    (totalSoldQuantity > 0 ? totalProfit / totalSoldQuantity : 0).toFixed(2)
  );

  return NextResponse.json({
    averageProfitOverall,
    totalProfit,
    profitResults,
    status: true,
  });
}
