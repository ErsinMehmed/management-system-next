import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import connectMongoDB from "@/libs/mongodb";
import Order from "@/models/order";
import OrdersClient from "@/components/dashboard/OrdersClient";

const PER_PAGE = 10;

export default async function OrdersPage() {
  const session = await getServerSession(authOptions);

  if (!session) redirect("/");

  await connectMongoDB();

  const [totalItems, items] = await Promise.all([
    Order.countDocuments({}),
    Order.find({})
      .sort({ _id: -1 })
      .populate({
        path: "product",
        select: "name weight flavor count category puffs units_per_box",
        populate: { path: "category", select: "name" },
      })
      .skip(0)
      .limit(PER_PAGE)
      .lean(),
  ]);

  const initialData = JSON.parse(
    JSON.stringify({
      orders: {
        items,
        pagination: {
          current_page: 1,
          total_pages: Math.ceil(totalItems / PER_PAGE),
          total_results: totalItems,
          per_page: PER_PAGE,
        },
      },
    })
  );

  return <OrdersClient initialData={initialData} />;
}
