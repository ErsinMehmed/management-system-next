import connectMongoDB from "@/libs/mongodb";
import Value from "@/models/value";
import { NextResponse } from "next/server";

export async function PUT(request, { params }) {
  const { id } = params;
  const data = await request.json();

  await connectMongoDB();
  await Value.findByIdAndUpdate(id, data);

  return NextResponse.json(
    { message: "Стойностите са обновени", status: true },
    { status: 200 }
  );
}

export async function GET(request, { params }) {
  const { id } = params;

  await connectMongoDB();

  const value = await Value.findOne({ _id: id });

  return NextResponse.json(value);
}
