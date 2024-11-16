import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const role = req.nextauth.token?.role;
    const path = req.nextUrl.pathname;

    if (role === "Super Admin") return NextResponse.next();

    if (role === "Admin" && path === "/dashboard/orders") {
      return new NextResponse("You are not authorized!");
    }

    if (
      role !== "Super Admin" &&
      role !== "Admin" &&
      (path === "/dashboard/orders" ||
        path === "/dashboard/products" ||
        path === "/dashboard/incomes")
    ) {
      return new NextResponse("You are not authorized!");
    }
  },
  {
    callbacks: {
      authorized: (params) => {
        let { token } = params;
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
    "/dashboard/incomes",
  ],
};
