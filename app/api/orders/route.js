import connectMongoDB from "@/libs/mongodb";
import Order from "@/models/order";
import { NextResponse } from "next/server";

export async function POST(request) {
  const data = await request.json();

  await connectMongoDB();

  await Order.create(data);

  return NextResponse.json({ message: "Order Created" }, { status: 201 });
}
