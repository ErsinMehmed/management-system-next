import { getAuth } from "@/helpers/getAuth";
import { NextResponse } from "next/server";
import connectMongoDB from "@/libs/mongodb";
import User from "@/models/user";

export async function POST(request) {
  const session = await getAuth(request);
  if (!session) return NextResponse.json({ status: false }, { status: 401 });

  const { token } = await request.json();
  if (!token) return NextResponse.json({ status: false }, { status: 400 });

  await connectMongoDB();
  await User.findByIdAndUpdate(session.user.id, {
    $addToSet: { expoPushTokens: token },
  });

  return NextResponse.json({ status: true });
}

export async function DELETE(request) {
  const session = await getAuth(request);
  if (!session) return NextResponse.json({ status: false }, { status: 401 });

  const { token } = await request.json();
  await connectMongoDB();
  await User.findByIdAndUpdate(session.user.id, {
    $pull: { expoPushTokens: token },
  });

  return NextResponse.json({ status: true });
}
