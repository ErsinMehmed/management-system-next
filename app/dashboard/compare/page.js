import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import CompareClient from "@/components/dashboard/CompareClient";

export const dynamic = "force-dynamic";

export default async function ComparePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/");
  const isAdmin = session.user.role === "Admin" || session.user.role === "Super Admin";
  if (!isAdmin) redirect("/dashboard");
  return <CompareClient />;
}
