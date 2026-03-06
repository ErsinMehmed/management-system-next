import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";

const ADMIN_ROLES = ["Admin", "Super Admin"];
const SUPER_ADMIN_ROLES = ["Super Admin"];

export async function requireAdmin() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return {
      error: NextResponse.json(
        { message: "Не сте оторизирани." },
        { status: 401 }
      ),
    };
  }

  if (!ADMIN_ROLES.includes(session.user.role)) {
    return {
      error: NextResponse.json(
        { message: "Нямате достъп до тази операция." },
        { status: 403 }
      ),
    };
  }

  return { session };
}

export async function requireSuperAdmin() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return {
      error: NextResponse.json(
        { message: "Не сте оторизирани." },
        { status: 401 }
      ),
    };
  }

  if (!SUPER_ADMIN_ROLES.includes(session.user.role)) {
    return {
      error: NextResponse.json(
        { message: "Нямате достъп до тази операция." },
        { status: 403 }
      ),
    };
  }

  return { session };
}
