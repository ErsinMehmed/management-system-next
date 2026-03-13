import { requireAdmin } from "@/helpers/requireRole";
import connectMongoDB from "@/libs/mongodb";
import ClientOrder from "@/models/clientOrder";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function PUT(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ message: "Не сте оторизирани." }, { status: 401 });

  const { id } = await params;
  const { status } = await request.json();

  await connectMongoDB();

  await ClientOrder.findByIdAndUpdate(id, { status });

  return NextResponse.json({ message: "Статусът е обновен", status: true });
}

export async function DELETE(request, { params }) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;

  await connectMongoDB();

  await ClientOrder.findByIdAndDelete(id);

  return NextResponse.json({ message: "Поръчката е изтрита", status: true });
}
