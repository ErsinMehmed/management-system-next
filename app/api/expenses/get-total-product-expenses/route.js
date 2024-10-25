import connectMongoDB from "@/libs/mongodb";
import Sell from "@/models/sell";
import { NextResponse } from "next/server";
import { getDateCondition } from "@/utils";

export async function GET(request) {
  await connectMongoDB();

  const dateFrom = request.nextUrl.searchParams.get("dateFrom");
  const dateTo = request.nextUrl.searchParams.get("dateTo");

  const dateCondition = getDateCondition(dateFrom, dateTo);

  try {
    const totalExpenses = await Sell.aggregate([
      {
        $match: dateCondition,
      },
      {
        $lookup: {
          from: "products",
          localField: "product",
          foreignField: "_id",
          as: "product",
        },
      },
      {
        $unwind: "$product",
      },
      {
        $group: {
          _id: null,
          total_cost: {
            $sum: { $multiply: ["$quantity", "$product.price"] },
          },
        },
      },
      {
        $project: {
          _id: 0,
          total_cost: 1,
        },
      },
    ]);

    return NextResponse.json({
      total_cost: totalExpenses[0]?.total_cost || 0,
      status: true,
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: "Грешка при извличане на сумата на разходите за периода",
        error: error.message,
        status: false,
      },
      { status: 500 }
    );
  }
}
