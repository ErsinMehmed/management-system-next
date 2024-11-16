import connectMongoDB from "@/libs/mongodb";
import Distributor from "@/models/distributor";
import { NextResponse } from "next/server";

export async function POST(request) {
  const data = await request.json();

  await connectMongoDB();
  await Distributor.create(data);

  return NextResponse.json(
    { message: "Дистрибуторът е добавен успешно", status: true },
    { status: 201 }
  );
}

export async function GET() {
  await connectMongoDB();

  const distributors = await Distributor.find();

  return NextResponse.json({ distributors });
}
