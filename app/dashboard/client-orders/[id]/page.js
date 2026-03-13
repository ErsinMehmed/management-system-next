import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect, notFound } from "next/navigation";
import connectMongoDB from "@/libs/mongodb";
import ClientOrder from "@/models/clientOrder";
import ClientOrderDetailClient from "@/components/dashboard/ClientOrderDetailClient";

export const dynamic = "force-dynamic";

export default async function ClientOrderDetailPage({ params }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/");

  const { id } = await params;

  await connectMongoDB();

  const order = await ClientOrder.findById(id)
    .populate({ path: "product", select: "name weight flavor puffs count category", populate: { path: "category", select: "name" } })
    .populate({ path: "assignedTo", select: "name" })
    .lean();

  if (!order) notFound();

  return <ClientOrderDetailClient order={JSON.parse(JSON.stringify(order))} />;
}
