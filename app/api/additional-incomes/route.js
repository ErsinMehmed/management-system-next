import connectMongoDB from "@/libs/mongodb";
import Income from "@/models/income";
import { NextResponse } from "next/server";

export async function POST(request) {
  const data = await request.json();

  await connectMongoDB();

  if (!data.date) {
    data.date = new Date();
  }

  await Income.create(data);

  return NextResponse.json(
    { message: "Допълнителният приход добавен успешно", status: true },
    { status: 201 }
  );
}

export async function GET() {
  await connectMongoDB();

  const incomes = await Income.find().select("amount message date");

  return NextResponse.json(incomes);
}
