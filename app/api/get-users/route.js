import connectMongoDB from "@/libs/mongodb";
import User from "@/models/user";
import { NextResponse } from "next/server";

export async function GET() {
  await connectMongoDB();

  try {
    const users = await User.find().select("_id name");

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
