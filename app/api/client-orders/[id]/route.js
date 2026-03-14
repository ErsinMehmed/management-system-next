import { requireAdmin, requireSuperAdmin } from "@/helpers/requireRole";
import connectMongoDB from "@/libs/mongodb";
import ClientOrder from "@/models/clientOrder";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function PUT(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ message: "Не сте оторизирани." }, { status: 401 });

  const { id } = await params;
  const body = await request.json();

  await connectMongoDB();

  const existing = await ClientOrder.findById(id).select("status").lean();

  // Редактиране на продукт и цена
  if (body.product !== undefined || body.price !== undefined) {
    if (existing?.status !== "нова" && session.user.role !== "Super Admin") {
      return NextResponse.json({ message: "Нямате достъп до тази операция." }, { status: 403 });
    }
    const update = {};
    if (body.product !== undefined) update.product = body.product;
    if (body.price !== undefined) update.price = body.price;
    if (body.quantity !== undefined) update.quantity = body.quantity;
    await ClientOrder.findByIdAndUpdate(id, update);
    return NextResponse.json({ message: "Поръчката е обновена", status: true });
  }

  // Смяна на статус
  const { status, rejectionReason } = body;
  const lockedStatuses = ["отказана", "доставена"];
  if (lockedStatuses.includes(existing?.status) && session.user.role !== "Super Admin") {
    return NextResponse.json({ message: "Нямате достъп до тази операция." }, { status: 403 });
  }

  const finalStatuses = ["доставена", "отказана"];
  const update = {
    status,
    rejectionReason: status === "отказана" ? (rejectionReason ?? "") : "",
    statusChangedAt: finalStatuses.includes(status) ? new Date() : null,
  };
  await ClientOrder.findByIdAndUpdate(id, update);

  return NextResponse.json({ message: "Статусът е обновен", status: true });
}

export async function PATCH(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ message: "Не сте оторизирани." }, { status: 401 });

  const { id } = await params;

  await connectMongoDB();

  const order = await ClientOrder.findById(id).select("assignedTo viewedBySeller").lean();
  if (!order) return NextResponse.json({ message: "Не е намерена." }, { status: 404 });

  if (order.viewedBySeller) return NextResponse.json({ status: true });

  if (String(order.assignedTo) !== String(session.user.id)) {
    return NextResponse.json({ message: "Нямате достъп до тази операция." }, { status: 403 });
  }

  await ClientOrder.findByIdAndUpdate(id, { viewedBySeller: true });

  return NextResponse.json({ status: true });
}

export async function DELETE(request, { params }) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;

  await connectMongoDB();

  await ClientOrder.findByIdAndDelete(id);

  return NextResponse.json({ message: "Поръчката е изтрита", status: true });
}
