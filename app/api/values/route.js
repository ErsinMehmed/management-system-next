import connectMongoDB from "@/libs/mongodb";
import Value from "@/models/value";
import { NextResponse } from "next/server";

export async function POST(request) {
  const data = await request.json();

  await connectMongoDB();

  await Value.create(data);

  return NextResponse.json({ message: "Value Created" }, { status: 201 });
}

export async function GET() {
  await connectMongoDB();

  const values = await Value.find();

  return NextResponse.json(values);
}
