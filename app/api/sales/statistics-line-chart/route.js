import connectMongoDB from "@/libs/mongodb";
import Sell from "@/models/sell";
import Product from "@/models/product";
import { NextResponse } from "next/server";

const monthNamesBulgarian = [
  "Януари",
  "Февруари",
  "Март",
  "Април",
  "Май",
  "Юни",
  "Юли",
  "Август",
  "Септември",
  "Октомври",
  "Ноември",
  "Декември",
];

export async function GET(request) {
  await connectMongoDB();

  let startDate;
  let endDate = new Date();

  const period = request.nextUrl.searchParams.get("period");

  switch (period) {
    case "last7days":
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
      break;
    case "lastMonth":
      startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1);
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
      return NextResponse.json({
        message: "Невалиден период",
        status: false,
      });
  }

  const sales = await Sell.aggregate([
    {
      $match: {
        date: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: {
          product: "$product",
          period: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$date",
            },
          },
        },
        total_quantity: { $sum: "$quantity" },
      },
    },
    {
      $lookup: {
        from: "products",
        localField: "_id.product",
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
      $match: {
        "category.name": "Бутилки",
      },
    },
    {
      $project: {
        _id: 0,
        name: "$product.name",
        period: "$_id.period",
        total_quantity: 1,
      },
    },
    {
      $sort: {
        period: 1,
      },
    },
  ]);

  if (sales.length === 0) {
    return NextResponse.json({
      message: "Няма намерени данни за посоченият период",
      status: false,
    });
  }

  if (period === "last6Months" || period === "lastYear") {
    const { periods, data } = groupSalesByMonth(sales);
    return NextResponse.json({
      periods: periods,
      data: data,
      status: true,
    });
  }

  const periods = [];
  const dataMap = {};

  sales.forEach((sale) => {
    const { name, period, total_quantity } = sale;

    let displayPeriod = period;

    if (!periods.includes(displayPeriod)) {
      periods.push(displayPeriod);
    }

    if (!dataMap[name]) {
      dataMap[name] = {
        name: name,
        data: Array(periods.length).fill(0),
      };
    }

    const periodIndex = periods.indexOf(displayPeriod);
    dataMap[name].data[periodIndex] =
      (dataMap[name].data[periodIndex] || 0) + total_quantity;
  });

  const data = Object.values(dataMap);

  const correctedData = data.map((item) => {
    const correctedItem = { ...item };
    correctedItem.data = periods.map((p) => item.data[periods.indexOf(p)] || 0);
    return correctedItem;
  });

  return NextResponse.json({
    periods: periods,
    data: correctedData,
  });
}

function groupSalesByMonth(sales) {
  const groupedData = {};
  const periods = [];

  sales.forEach((sale) => {
    const date = new Date(sale.period);
    const monthYear = `${
      monthNamesBulgarian[date.getMonth()]
    } ${date.getFullYear()}`;

    if (!groupedData[sale.name]) {
      groupedData[sale.name] = {};
    }

    if (!groupedData[sale.name][monthYear]) {
      groupedData[sale.name][monthYear] = 0;
    }

    groupedData[sale.name][monthYear] += sale.total_quantity;

    if (!periods.includes(monthYear)) {
      periods.push(monthYear);
    }
  });

  const data = Object.keys(groupedData).map((productName) => {
    return {
      name: productName,
      data: periods.map((period) => groupedData[productName][period] || 0),
    };
  });

  return { periods, data };
}
