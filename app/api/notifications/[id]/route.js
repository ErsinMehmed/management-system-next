import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectMongoDB from "@/libs/mongodb";
import Notification from "@/models/notification";
import { NextResponse } from "next/server";

export async function DELETE(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ status: false }, { status: 401 });

  const { id } = await params;

  await connectMongoDB();
  await Notification.findByIdAndDelete(id);

  return NextResponse.json({ status: true });
}
