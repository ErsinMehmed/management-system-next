import connectMongoDB from "@/libs/mongodb";
import User from "@/models/user";
import { NextResponse } from "next/server";

export async function PUT(request, { params }) {
  const { id } = params;
  const data = await request.json();

  await connectMongoDB();
  await User.findByIdAndUpdate(id, data);

  return NextResponse.json(
    { message: "Потребителят е обновен", status: true },
    { status: 200 }
  );
}
