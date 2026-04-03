import { requireSuperAdmin } from "@/helpers/requireRole";
import connectMongoDB from "@/libs/mongodb";
import Product from "@/models/product";
import { NextResponse } from "next/server";
import { productSchema } from "@/rules/schemas";

export async function POST(request) {
  const { error } = await requireSuperAdmin(request);
  if (error) return error;

  const raw = await request.json();
  const parsed = productSchema.safeParse(raw);

  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.errors[0].message, status: false },
      { status: 400 }
    );
  }

  await connectMongoDB();
  await Product.create(parsed.data);

  return NextResponse.json(
    { message: "Продуктът е създаден успешно", status: true },
    { status: 201 }
  );
}

export async function GET() {
  await connectMongoDB();

  const products = await Product.find()
    .populate({
      path: "category",
      select: "name",
    })
    .select(
      "name weight flavor price availability sell_prices seller_prices count category puffs image_url hidden units_per_box"
    ).lean();

  return NextResponse.json(products);
}
