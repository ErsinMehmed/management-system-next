import { getAuth } from "@/helpers/getAuth";
import { NextResponse } from "next/server";

const ADMIN_ROLES = ["Admin", "Super Admin"];
const SUPER_ADMIN_ROLES = ["Super Admin"];

/**
 * @param {Request|null} request - Pass the Next.js request for mobile Bearer token support.
 */
export async function requireAdmin(request = null) {
  const session = await getAuth(request);

  if (!session) {
    return { error: NextResponse.json({ message: "Не сте оторизирани." }, { status: 401 }) };
  }

  if (!ADMIN_ROLES.includes(session.user.role)) {
    return { error: NextResponse.json({ message: "Нямате достъп до тази операция." }, { status: 403 }) };
  }

  return { session };
}

/**
 * @param {Request|null} request - Pass the Next.js request for mobile Bearer token support.
 */
export async function requireSuperAdmin(request = null) {
  const session = await getAuth(request);

  if (!session) {
    return { error: NextResponse.json({ message: "Не сте оторизирани." }, { status: 401 }) };
  }

  if (!SUPER_ADMIN_ROLES.includes(session.user.role)) {
    return { error: NextResponse.json({ message: "Нямате достъп до тази операция." }, { status: 403 }) };
  }

  return { session };
}
