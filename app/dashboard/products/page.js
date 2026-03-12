import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import ProductsClient from "@/components/dashboard/ProductsClient";

export default async function ProductsPage() {
  const session = await getServerSession(authOptions);

  if (!session) redirect("/");

  return <ProductsClient />;
}
