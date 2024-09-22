import connectMongoDB from "@/libs/mongodb";
import Role from "@/models/role";
import { NextResponse } from "next/server";

export async function POST(request) {
  const data = await request.json();

  await connectMongoDB();

  await Role.create(data);

  return NextResponse.json(
    { message: "Ролята е създадена успешно" },
    { status: 201 }
  );
}

export async function GET() {
  await connectMongoDB();

  const roles = await Role.find();

  return NextResponse.json({ roles });
}
