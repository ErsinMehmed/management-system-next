import { requireAdmin } from "@/helpers/requireRole";
import connectMongoDB from "@/libs/mongodb";
import User from "@/models/user";
import { NextResponse } from "next/server";

export async function PUT(request, { params }) {
  const { error } = await requireAdmin(request);

  if (error) return error;

  const { id } = params;
  const data = await request.json();

  await connectMongoDB();
  await User.findByIdAndUpdate(id, data);

  return NextResponse.json(
    { message: "Потребителят е обновен", status: true },
    { status: 200 }
  );
}
