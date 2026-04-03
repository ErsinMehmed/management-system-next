import connectMongoDB from "@/libs/mongodb";
import Distributor from "@/models/distributor";
import { NextResponse } from "next/server";
import { distributorSchema } from "@/rules/schemas";

export async function POST(request) {
  const raw = await request.json();
  const parsed = distributorSchema.safeParse(raw);

  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.errors[0].message, status: false },
      { status: 400 }
    );
  }

  await connectMongoDB();
  await Distributor.create(parsed.data);

  return NextResponse.json(
    { message: "Дистрибуторът е добавен успешно", status: true },
    { status: 201 }
  );
}

export async function GET() {
  await connectMongoDB();
  const distributors = await Distributor.find().lean();
  return NextResponse.json({ distributors });
}
