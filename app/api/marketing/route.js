import connectMongoDB from "@/libs/mongodb";
import Ad from "@/models/ad";
import { NextResponse } from "next/server";

export async function POST(request) {
  const data = await request.json();

  await connectMongoDB();

  await Ad.create(data);

  return NextResponse.json({ message: "Ad Created" }, { status: 201 });
}

export async function GET() {
  await connectMongoDB();

  const ads = await Ad.find();

  return NextResponse.json(ads);
}
