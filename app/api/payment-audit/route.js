import { requireSuperAdmin } from "@/helpers/requireRole";
import connectMongoDB from "@/libs/mongodb";
import PaymentAudit from "@/models/paymentAudit";
import { NextResponse } from "next/server";

export async function GET(request) {
  const { error } = await requireSuperAdmin(request);
  if (error) return error;

  await connectMongoDB();

  const { searchParams } = request.nextUrl;
  const page = Math.max(1, parseInt(searchParams.get("page")) || 1);
  const perPage = Math.min(
    50,
    Math.max(1, parseInt(searchParams.get("per_page")) || 20)
  );
  const type = searchParams.get("type"); // optional: "payout" | "revenue_confirmed"
  const sellerId = searchParams.get("seller"); // optional

  const filter = {};
  if (type === "payout" || type === "revenue_confirmed") filter.type = type;
  if (sellerId) filter.seller = sellerId;

  const [items, total] = await Promise.all([
    PaymentAudit.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * perPage)
      .limit(perPage)
      .lean(),
    PaymentAudit.countDocuments(filter),
  ]);

  return NextResponse.json({
    items,
    pagination: {
      current_page: page,
      per_page: perPage,
      total_pages: Math.ceil(total / perPage),
      total_results: total,
    },
  });
}
