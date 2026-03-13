import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function proxy(req) {
    const { token } = req.nextauth;
    const role = token?.role;
    const path = req.nextUrl.pathname;

    if (path.startsWith("/api/")) {
      if (!token) {
        return NextResponse.json(
          { message: "Не сте оторизирани." },
          { status: 401 }
        );
      }
      return NextResponse.next();
    }

    if (role === "Super Admin") return NextResponse.next();

    if (role === "Admin" && path === "/dashboard/orders") {
      return new NextResponse("Нямате достъп!");
    }

    if (
      role !== "Super Admin" &&
      role !== "Admin" &&
      (path === "/dashboard/orders" ||
        path === "/dashboard/products" ||
        path === "/dashboard/incomes")
    ) {
      return new NextResponse("Нямате достъп!");
    }
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        if (req.nextUrl.pathname.startsWith("/api/")) return true;
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    "/dashboard",
    "/dashboard/orders",
    "/dashboard/sales",
    "/dashboard/products",
    "/dashboard/users",
    "/dashboard/users/sales",
    "/dashboard/incomes",
    "/api/((?!auth|register).*)",
  ],
};
