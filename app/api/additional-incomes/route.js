import connectMongoDB from "@/libs/mongodb";
import Income from "@/models/income";
import { NextResponse } from "next/server";
import { getDateCondition } from "@/utils";

export async function POST(request) {
  const data = await request.json();

  await connectMongoDB();

  if (!data.date) {
    data.date = new Date();
  }

  await Income.create(data);

  return NextResponse.json(
    { message: "Допълнителният приход е добавен успешно", status: true },
    { status: 201 }
  );
}

export async function GET(request) {
  await connectMongoDB();

  const dateFrom = request.nextUrl.searchParams.get("dateFrom");
  const dateTo = request.nextUrl.searchParams.get("dateTo");
  const period = request.nextUrl.searchParams.get("period");

  if (dateFrom && dateTo && dateFrom > dateTo) {
    return NextResponse.json({
      status: false,
    });
  }

  const dateCondition = getDateCondition(dateFrom, dateTo, period);

  const totalIncomesArray = await Income.aggregate([
    {
      $match: dateCondition,
    },
    {
      $group: {
        _id: null,
        incomes: { $sum: "$amount" },
      },
    },
  ]);

  const incomes =
    totalIncomesArray.length > 0 ? totalIncomesArray[0].incomes : 0;

  return NextResponse.json({ incomes: incomes });
}
