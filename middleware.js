import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // if (
    //   req.nextUrl.pathname === "/dashboard" &&
    //   req.nextauth.token?.role !== "admin"
    // ) {
    //   return new NextResponse("You are not authorized!");
    // }
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
    "/dashboard/stocks",
  ],
};
