import { requireAdmin } from "@/helpers/requireRole";
import connectMongoDB from "@/libs/mongodb";
import OrderTemplate from "@/models/orderTemplate";
import { NextResponse } from "next/server";

export async function GET(request) {
  const { error, session } = await requireAdmin(request);
  if (error) return error;

  await connectMongoDB();

  const templates = await OrderTemplate.find({ createdBy: session.user.id })
    .populate({ path: "product", select: "name weight flavor puffs count price units_per_box category", populate: { path: "category", select: "name" } })
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json(templates);
}

export async function POST(request) {
  const { error, session } = await requireAdmin(request);
  if (error) return error;

  const data = await request.json();
  if (!data.name?.trim() || !data.product || !data.quantity) {
    return NextResponse.json({ message: "Попълни всички полета.", status: false }, { status: 400 });
  }

  await connectMongoDB();

  await OrderTemplate.create({
    name: data.name.trim(),
    product: data.product,
    quantity: Number(data.quantity),
    message: data.message || "",
    createdBy: session.user.id,
  });

  return NextResponse.json({ message: "Шаблонът е запазен.", status: true }, { status: 201 });
}

export async function DELETE(request) {
  const { error } = await requireAdmin(request);
  if (error) return error;

  const { searchParams } = request.nextUrl;
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ message: "Липсва ID.", status: false }, { status: 400 });

  await connectMongoDB();
  await OrderTemplate.findByIdAndDelete(id);

  return NextResponse.json({ message: "Шаблонът е изтрит.", status: true });
}
