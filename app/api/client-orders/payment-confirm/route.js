import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectMongoDB from "@/libs/mongodb";
import ClientOrder from "@/models/clientOrder";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

export async function PATCH(request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ message: "Не сте оторизирани." }, { status: 401 });

  const isSuperAdmin = session.user.role === "Super Admin";
  if (!isSuperAdmin) return NextResponse.json({ message: "Нямате достъп." }, { status: 403 });

  const { sellerId, paidAt } = await request.json();
  if (!sellerId || !paidAt) return NextResponse.json({ message: "Липсват параметри." }, { status: 400 });

  await connectMongoDB();

  await ClientOrder.updateMany(
    {
      assignedTo: new mongoose.Types.ObjectId(sellerId),
      paidAt: new Date(paidAt),
      revenueConfirmed: { $ne: true },
    },
    { $set: { revenueConfirmed: true } }
  );

  return NextResponse.json({ status: true });
}
