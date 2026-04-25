import { decode, getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

// Reads the session token from either:
//  - Authorization: Bearer <jwt>  (mobile clients)
//  - NextAuth session cookie       (web clients)
async function readToken(req) {
  const auth =
    req.headers.get("authorization") ?? req.headers.get("Authorization");

  if (auth?.startsWith("Bearer ")) {
    try {
      const decoded = await decode({
        token: auth.slice(7),
        secret: process.env.NEXTAUTH_SECRET,
      });
      if (decoded) return decoded;
    } catch {
      // fall through to cookie
    }
  }

  return await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
}

export default async function proxy(req) {
  const path = req.nextUrl.pathname;
  const token = await readToken(req);

  if (path.startsWith("/api/")) {
    if (!token) {
      return NextResponse.json(
        { message: "Не сте оторизирани." },
        { status: 401 }
      );
    }
    return NextResponse.next();
  }

  // /dashboard/* — require login, then enforce role rules
  if (!token) {
    const signInUrl = new URL("/api/auth/signin", req.url);
    signInUrl.searchParams.set("callbackUrl", path);
    return NextResponse.redirect(signInUrl);
  }

  const role = token.role;

  if (role === "Super Admin") return NextResponse.next();

  if (role === "Admin" && path === "/dashboard/orders") {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  if (role === "Seller" && !path.startsWith("/dashboard/client-orders")) {
    return NextResponse.redirect(new URL("/dashboard/client-orders", req.url));
  }

  if (
    role !== "Super Admin" &&
    role !== "Admin" &&
    (path === "/dashboard/orders" ||
      path === "/dashboard/products" ||
      path === "/dashboard/incomes" ||
      path === "/dashboard/sales")
  ) {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard",
    "/dashboard/orders",
    "/dashboard/sales",
    "/dashboard/products",
    "/dashboard/users",
    "/dashboard/users/sales",
    "/dashboard/incomes",
    "/dashboard/client-orders/:path*",
    "/api/((?!auth|register).*)",
  ],
};