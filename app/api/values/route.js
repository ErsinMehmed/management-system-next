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

  const values = await Value.findById("global");

  return NextResponse.json(values ? [values] : []);
}

export async function PUT(request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const data = await request.json();

  await connectMongoDB();

  await Value.findOneAndUpdate({ _id: "global" }, data, { upsert: true });

  return NextResponse.json(
    { message: "Стойностите са обновени", status: true },
    { status: 200 }
  );
}
