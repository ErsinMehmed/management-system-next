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
    const totalAdditionalCostsArray = await Sell.aggregate([
      {
        $match: dateCondition,
      },
      {
        $group: {
          _id: null,
          total_additional_costs: { $sum: "$additional_costs" },
        },
      },
    ]);

    const totalAdditionalCosts =
      totalAdditionalCostsArray.length > 0
        ? totalAdditionalCostsArray[0].total_additional_costs
        : 0;

    return NextResponse.json({
      total_additional_costs: totalAdditionalCosts,
      status: true,
    });
  } catch (error) {
    return NextResponse.json({
      message: "Грешка при извличане на допълнителните разходи",
      status: false,
      error: error.message,
    });
  }
}
