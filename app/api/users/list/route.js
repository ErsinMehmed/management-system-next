import { requireAdmin } from "@/helpers/requireRole";
import connectMongoDB from "@/libs/mongodb";
import User from "@/models/user";
import { NextResponse } from "next/server";

export async function GET(request) {
  const { error } = await requireAdmin(request);
  if (error) return error;

  await connectMongoDB();

  try {
    const users = await User.find().select("_id name percent target");

    return NextResponse.json({
      users,
      status: true,
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: "Грешка при извличане на потребителите",
        error: error,
        status: false,
      },
      { status: 500 }
    );
  }
}
