import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import connectMongoDB from "@/libs/mongodb";
import User from "@/models/user";

// Записва FCM token към текущия потребител
export async function POST(request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ status: false }, { status: 401 });
  }

  const { token } = await request.json();

  if (!token) {
    return NextResponse.json({ status: false }, { status: 400 });
  }

  await connectMongoDB();

  // Добавяме token само ако не съществува вече
  await User.findByIdAndUpdate(session.user.id, {
    $addToSet: { fcmTokens: token },
  });

  return NextResponse.json({ status: true });
}

// Изтрива FCM token (при logout)
export async function DELETE(request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ status: false }, { status: 401 });
  }

  const { token } = await request.json();

  await connectMongoDB();

  await User.findByIdAndUpdate(session.user.id, {
    $pull: { fcmTokens: token },
  });

  return NextResponse.json({ status: true });
}
