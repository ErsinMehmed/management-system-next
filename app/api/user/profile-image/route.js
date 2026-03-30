import { getAuth } from "@/helpers/getAuth";
import connectMongoDB from "@/libs/mongodb";
import User from "@/models/user";
import { NextResponse } from "next/server";

export async function PUT(request) {
  const session = await getAuth(request);
  if (!session) return NextResponse.json({ message: "Не сте оторизирани." }, { status: 401 });

  const { profile_image } = await request.json();
  if (!profile_image) return NextResponse.json({ message: "Липсва URL на снимката." }, { status: 400 });

  await connectMongoDB();
  await User.findByIdAndUpdate(session.user.id, { profile_image });

  return NextResponse.json({ status: true });
}
