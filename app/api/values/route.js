import { requireAdmin } from "@/helpers/requireRole";
import connectMongoDB from "@/libs/mongodb";
import Value from "@/models/value";
import { NextResponse } from "next/server";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  await connectMongoDB();

  const values = await Value.findOne({});

  return NextResponse.json(values ? [values] : []);
}

export async function PUT(request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const data = await request.json();

  await connectMongoDB();

  await Value.findOneAndUpdate({}, data, { upsert: true });

  return NextResponse.json(
    { message: "Стойностите са обновени", status: true },
    { status: 200 }
  );
}
