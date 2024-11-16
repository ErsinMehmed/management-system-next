import connectMongoDB from "@/libs/mongodb";
import Income from "@/models/income";
import User from "@/models/user";
import { NextResponse } from "next/server";
import { getDateCondition } from "@/utils";
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

export async function DELETE(request) {
  const id = request.nextUrl.searchParams.get("id");

  await connectMongoDB();

  try {
    const incomeToDelete = await Income.findById(id);

    if (!incomeToDelete) {
      return NextResponse.json(
        { message: "Прихода не беше намерен", status: false },
        { status: 404 }
      );
    }

    await Income.findByIdAndDelete(id);

    return NextResponse.json(
      { message: "Прихода е изтрит успешно", status: true },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: "Грешка при изтриване на прихода",
        error: error,
        status: false,
      },
      { status: 500 }
    );
  }
}
