import { requireAdmin } from "@/helpers/requireRole";
import connectMongoDB from "@/libs/mongodb";
import Value from "@/models/value";
import { NextResponse } from "next/server";

export async function POST(request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const data = await request.json();

  await connectMongoDB();

  await Value.create(data);

  return NextResponse.json({ message: "Value Created" }, { status: 201 });
}

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  await connectMongoDB();

  const values = await Value.find();

  return NextResponse.json(values);
}
