import connectMongoDB from "@/libs/mongodb";
import User from "@/models/user";
import { NextResponse } from "next/server";

export async function PUT(request) {
  const data = await request.json();

  await connectMongoDB();
  await User.findByIdAndUpdate(data.id, data);

  return NextResponse.json(
    { message: "Потребителят е обновен", status: true },
    { status: 200 }
  );
}
