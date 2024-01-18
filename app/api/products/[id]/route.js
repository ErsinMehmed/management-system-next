import connectMongoDB from "@/libs/mongodb";
import Product from "@/models/product";
import { NextResponse } from "next/server";

export async function PUT(request, { params }) {
  const { id } = params;
  const data = await request.json();

  await connectMongoDB();
  await Product.findByIdAndUpdate(id, data);

  return NextResponse.json(
    { message: "Продуктът е обновен", status: true },
    { status: 200 }
  );
}

export async function GET(request, { params }) {
  const { id } = params;

  await connectMongoDB();

  const product = await Product.findOne({ _id: id }).select(
    "price availability sell_prices"
  );

  return NextResponse.json(product);
}
