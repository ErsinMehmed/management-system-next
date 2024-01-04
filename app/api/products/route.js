import connectMongoDB from "@/libs/mongodb";
import Product from "@/models/product";
import { NextResponse } from "next/server";

export async function POST(request) {
  const data = await request.json();

  await connectMongoDB();

  await Product.create(data);

  return NextResponse.json({ message: "Product Created" }, { status: 201 });
}

export async function GET() {
  await connectMongoDB();

  const products = await Product.find()
    .populate({
      path: "category",
      select: "name",
    })
    .select("name weight flavor price availability count category");

  return NextResponse.json(products);
}
