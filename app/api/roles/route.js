import connectMongoDB from "@/libs/mongodb";
import Role from "@/models/role";
import { NextResponse } from "next/server";
import { roleSchema } from "@/rules/schemas";

export async function POST(request) {
  const raw = await request.json();
  const parsed = roleSchema.safeParse(raw);

  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.errors[0].message, status: false },
      { status: 400 }
    );
  }

  await connectMongoDB();
  await Role.create(parsed.data);

  return NextResponse.json(
    { message: "Ролята е създадена успешно", status: true },
    { status: 201 }
  );
}

export async function GET() {
  await connectMongoDB();
  const roles = await Role.find().lean();
  return NextResponse.json({ roles });
}
