import { getAuth } from "@/helpers/getAuth";
import connectMongoDB from "@/libs/mongodb";
import ClientOrder from "@/models/clientOrder";
import User from "@/models/user";
import PaymentAudit from "@/models/paymentAudit";
import { orderRevenue } from "@/libs/clientOrderQueries";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

export async function PATCH(request) {
  const session = await getAuth(request);
  if (!session) return NextResponse.json({ message: "Не сте оторизирани." }, { status: 401 });

  const isSuperAdmin = session.user.role === "Super Admin";
  if (!isSuperAdmin) return NextResponse.json({ message: "Нямате достъп." }, { status: 403 });

  const { sellerId, paidAt } = await request.json();
  if (!sellerId || !paidAt) return NextResponse.json({ message: "Липсват параметри." }, { status: 400 });

  await connectMongoDB();

  const sellerObjectId = new mongoose.Types.ObjectId(sellerId);
  const paidAtDate = new Date(paidAt);

  // Намираме batch-а преди update — нужно е за audit log (за оборота)
  const orders = await ClientOrder.find(
    { assignedTo: sellerObjectId, paidAt: paidAtDate, revenueConfirmed: { $ne: true } },
    { price: 1, "secondProduct.price": 1 }
  ).lean();

  const result = await ClientOrder.updateMany(
    {
      assignedTo: sellerObjectId,
      paidAt: paidAtDate,
      revenueConfirmed: { $ne: true },
    },
    { $set: { revenueConfirmed: true } }
  );

  // Audit log
  if (orders.length > 0) {
    const seller = await User.findById(sellerObjectId).select("name").lean();
    let totalRevenue = 0;
    for (const o of orders) totalRevenue += orderRevenue(o);
    PaymentAudit.create({
      type: "revenue_confirmed",
      actor: session.user.id,
      actorName: session.user.name,
      seller: sellerObjectId,
      sellerName: seller?.name || "",
      paidAt: paidAtDate,
      revenue: Number(totalRevenue.toFixed(2)),
      orderCount: orders.length,
    }).catch((e) => console.error("PaymentAudit create failed:", e));
  }

  return NextResponse.json({ status: true, updated: result.modifiedCount });
}
