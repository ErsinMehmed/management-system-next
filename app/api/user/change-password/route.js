import { getAuth } from "@/helpers/getAuth";
import connectMongoDB from "@/libs/mongodb";
import User from "@/models/user";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(request) {
  const session = await getAuth(request);
  if (!session) return NextResponse.json({ message: "Не сте оторизирани." }, { status: 401 });

  const { currentPassword, newPassword } = await request.json();

  if (!currentPassword || !newPassword)
    return NextResponse.json({ message: "Попълнете всички полета." }, { status: 400 });

  if (newPassword.length < 8)
    return NextResponse.json({ message: "Новата парола трябва да е поне 8 символа." }, { status: 400 });

  await connectMongoDB();

  const user = await User.findById(session.user.id).select("password");
  if (!user) return NextResponse.json({ message: "Потребителят не е намерен." }, { status: 404 });

  const match = await bcrypt.compare(currentPassword, user.password);
  if (!match) return NextResponse.json({ message: "Грешна текуща парола." }, { status: 400 });

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  return NextResponse.json({ message: "Паролата е сменена успешно." });
}
