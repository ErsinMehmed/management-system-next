import connectMongoDB from "@/libs/mongodb";
import User from "@/models/user";
import Role from "@/models/role";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(request) {
  const { name, email, password } = await request.json();

  if (!name || !email || !password)
    return NextResponse.json({ message: "Попълнете всички полета." }, { status: 400 });

  if (password.length < 8)
    return NextResponse.json({ message: "Паролата трябва да е поне 8 символа." }, { status: 400 });

  await connectMongoDB();

  const existing = await User.findOne({ email });
  if (existing)
    return NextResponse.json({ message: "Вече съществува акаунт с този имейл." }, { status: 400 });

  const sellerRole = await Role.findOne({ name: "Seller" });
  if (!sellerRole)
    return NextResponse.json({ message: "Системна грешка — роля не е намерена." }, { status: 500 });

  const hashed = await bcrypt.hash(password, 10);
  await User.create({ name, email, password: hashed, role: sellerRole._id });

  return NextResponse.json({ message: "Акаунтът е създаден успешно." }, { status: 201 });
}
