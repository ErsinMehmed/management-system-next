import { requireSuperAdmin } from "@/helpers/requireRole";
import connectMongoDB from "@/libs/mongodb";
import ClientOrder from "@/models/clientOrder";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

export async function POST(request) {
  const { error } = await requireSuperAdmin();
  if (error) return error;

  const { sellerId } = await request.json();
  if (!sellerId) return NextResponse.json({ message: "Липсва доставчик." }, { status: 400 });

  await connectMongoDB();

  const result = await ClientOrder.updateMany(
    {
      assignedTo: new mongoose.Types.ObjectId(sellerId),
      status: "доставена",
      isPaid: { $ne: true },
    },
    { $set: { isPaid: true } }
  );

  return NextResponse.json({ status: true, updated: result.modifiedCount });
}
