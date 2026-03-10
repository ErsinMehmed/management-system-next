import connectMongoDB from "@/libs/mongodb";
import Category from "@/models/category";
import { NextResponse } from "next/server";

export async function POST(request) {
  const data = await request.json();

  await connectMongoDB();

  await Category.create(data);

  return NextResponse.json(
    { message: "Категорията е създадена успешно" },
    { status: 201 }
  );
}

export async function GET() {
  try {
    await connectMongoDB();
    const categories = await Category.find({}).select("name").sort({ name: 1 });
    return NextResponse.json(categories, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Грешка при зареждане на категории", status: false },
      { status: 500 }
    );
  }
}
