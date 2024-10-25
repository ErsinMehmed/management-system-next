import connectMongoDB from "@/libs/mongodb";
import Sell from "@/models/sell";
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
    const totalFuelPriceArray = await Sell.aggregate([
      {
        $match: dateCondition,
      },
      {
        $group: {
          _id: null,
          total_fuel_price: { $sum: "$fuel_price" },
        },
      },
    ]);

    const totalFuelPrice =
      totalFuelPriceArray.length > 0
        ? totalFuelPriceArray[0].total_fuel_price
        : 0;

    return NextResponse.json({
      total_fuel_price: totalFuelPrice,
      status: true,
    });
  } catch (error) {
    return NextResponse.json({
      message: "Грешка при извличане на данни за горивото",
      status: false,
      error: error.message,
    });
  }
}
