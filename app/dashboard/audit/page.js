import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import AuditClient from "@/components/dashboard/AuditClient";

export const dynamic = "force-dynamic";

export default async function AuditPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/");
  if (session.user.role !== "Super Admin") redirect("/dashboard");

  return <AuditClient />;
}
