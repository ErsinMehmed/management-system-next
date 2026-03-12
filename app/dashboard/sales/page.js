import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import connectMongoDB from "@/libs/mongodb";
import Sell from "@/models/sell";
import Value from "@/models/value";
import SalesClient from "@/components/dashboard/SalesClient";

const PER_PAGE = 10;

export default async function SalesPage() {
  const session = await getServerSession(authOptions);

  if (!session) redirect("/");

  await connectMongoDB();

  const isAdmin = ["Admin", "Super Admin"].includes(session.user.role);
  const isSuperAdmin = session.user.role === "Super Admin";

  const salesQuery = Sell.find(
    isSuperAdmin ? {} : { creator: session.user.id }
  )
    .sort({ _id: -1 })
    .populate({ path: "product", select: "name weight flavor count category puffs units_per_box", populate: { path: "category", select: "name" } })
    .populate({ path: "creator", select: "name" });

  const [totalItems, items, values] = await Promise.all([
    Sell.countDocuments(isSuperAdmin ? {} : { creator: session.user.id }),
    salesQuery.skip(0).limit(PER_PAGE).lean(),
    isAdmin ? Value.findOne({}).lean() : Promise.resolve(null),
  ]);

  const initialData = JSON.parse(
    JSON.stringify({
      sales: {
        items,
        pagination: {
          current_page: 1,
          total_pages: Math.ceil(totalItems / PER_PAGE),
          total_results: totalItems,
          per_page: PER_PAGE,
        },
      },
      values,
    })
  );

  return <SalesClient initialData={initialData} />;
}
