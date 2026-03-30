import { getAuth } from "@/helpers/getAuth";
import connectMongoDB from "@/libs/mongodb";
import Notification from "@/models/notification";
import { NextResponse } from "next/server";

export async function DELETE(request, { params }) {
  const session = await getAuth(request);
  if (!session) return NextResponse.json({ status: false }, { status: 401 });

  const { id } = await params;

  await connectMongoDB();
  await Notification.findByIdAndDelete(id);

  return NextResponse.json({ status: true });
}
