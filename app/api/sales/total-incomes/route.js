import connectMongoDB from "@/libs/mongodb";
import Sell from "@/models/sell";
import Product from "@/models/product";
import { NextResponse } from "next/server";
import { getDateCondition } from "@/utils";

export async function GET(request) {
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

  try {
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

    const totalAmountSales =
      totalIncomesArray.length > 0 ? totalIncomesArray[0].incomes : 0;

    return NextResponse.json({
      total_amount_sales: totalAmountSales,
      status: true,
    });
  } catch (error) {
    return NextResponse.json({
      message: "Грешка при извличане на данни",
      status: false,
      error: error.message,
    });
  }
}
