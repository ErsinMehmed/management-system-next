import connectMongoDB from "@/libs/mongodb";
import Category from "@/models/category";
import { NextResponse } from "next/server";
import { categorySchema } from "@/rules/schemas";

export async function POST(request) {
  const raw = await request.json();
  const parsed = categorySchema.safeParse(raw);

  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.errors[0].message, status: false },
      { status: 400 }
    );
  }

  await connectMongoDB();
  await Category.create(parsed.data);

  return NextResponse.json(
    { message: "Категорията е създадена успешно", status: true },
    { status: 201 }
  );
}

export async function GET() {
  try {
    await connectMongoDB();
    const categories = await Category.find({}).select("name").sort({ name: 1 }).lean();
    return NextResponse.json(categories, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Грешка при зареждане на категории", status: false },
      { status: 500 }
    );
  }
}
