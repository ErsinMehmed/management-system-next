import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import connectMongoDB from "@/libs/mongodb";
import Income from "@/models/income";

export const dynamic = "force-dynamic";
import Distributor from "@/models/distributor";
import IncomesClient from "@/components/dashboard/IncomesClient";

const PER_PAGE = 10;

export default async function IncomesPage() {
  const session = await getServerSession(authOptions);

  if (!session) redirect("/");

  await connectMongoDB();

  const [totalItems, items, distributors] = await Promise.all([
    Income.countDocuments({}),
    Income.find({})
      .sort({ _id: -1 })
      .populate({ path: "distributor", select: "name" })
      .skip(0)
      .limit(PER_PAGE)
      .lean(),
    Distributor.find({}).lean(),
  ]);

  const initialData = JSON.parse(
    JSON.stringify({
      allIncomes: {
        items,
        pagination: {
          current_page: 1,
          total_pages: Math.ceil(totalItems / PER_PAGE),
          total_results: totalItems,
          per_page: PER_PAGE,
        },
      },
      distributors,
    })
  );

  return <IncomesClient initialData={initialData} />;
}
