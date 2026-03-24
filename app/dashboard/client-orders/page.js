import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import connectMongoDB from "@/libs/mongodb";
import ClientOrder from "@/models/clientOrder";
import User from "@/models/user";

export const dynamic = "force-dynamic";
import ClientOrdersClient from "@/components/dashboard/ClientOrdersClient";

const PER_PAGE = 9;

export default async function ClientOrdersPage() {
  const session = await getServerSession(authOptions);

  if (!session) redirect("/");

  const isAdmin = ["Admin", "Super Admin"].includes(session.user.role);

  await connectMongoDB();

  // Filter orders: admins see all, sellers see only their own
  const filter = isAdmin ? {} : { assignedTo: session.user.id };

  const now = new Date();
  const dayStart = new Date(now);
  dayStart.setHours(7, 0, 0, 0);
  if (now < dayStart) dayStart.setDate(dayStart.getDate() - 1);
  const dailyFilter = { status: "доставена", createdAt: { $gte: dayStart } };
  if (!isAdmin) dailyFilter.assignedTo = session.user.id;

  const [totalItems, items, sellers, dailyCount] = await Promise.all([
    ClientOrder.countDocuments(filter),
    ClientOrder.find(filter)
      .sort({ _id: -1 })
      .populate({ path: "product", select: "name weight flavor count category puffs units_per_box", populate: { path: "category", select: "name" } })
      .populate({ path: "secondProduct.product", select: "name weight flavor puffs count category", populate: { path: "category", select: "name" } })
      .populate({ path: "assignedTo", select: "name" })
      .skip(0)
      .limit(PER_PAGE)
      .lean(),
    isAdmin
      ? User.find({})
          .populate({ path: "role", select: "name" })
          .select("name role")
          .lean()
          .then((users) => users.filter((u) => u.role?.name === "Seller"))
      : Promise.resolve([]),
    ClientOrder.countDocuments(dailyFilter),
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
        dailyCount,
      },
    })
  );

  return (
    <ClientOrdersClient
      initialData={initialData}
      sellers={JSON.parse(JSON.stringify(sellers))}
    />
  );
}
