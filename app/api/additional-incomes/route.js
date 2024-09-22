import connectMongoDB from "@/libs/mongodb";
import Income from "@/models/income";
import { NextResponse } from "next/server";
import { getDateCondition } from "@/utils";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import mongoose from "mongoose";

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

  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  const userObjectId = new mongoose.Types.ObjectId(userId);

  const dateFrom = request.nextUrl.searchParams.get("dateFrom");
  const dateTo = request.nextUrl.searchParams.get("dateTo");
  const period = request.nextUrl.searchParams.get("period");

  if (dateFrom && dateTo && dateFrom > dateTo) {
    return NextResponse.json({
      status: false,
    });
  }

  const dateCondition = getDateCondition(dateFrom, dateTo, period);

  const matchCondition = {
    ...dateCondition,
    creator: userObjectId,
  };

  const totalIncomesArray = await Income.aggregate([
    {
      $match: matchCondition,
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
