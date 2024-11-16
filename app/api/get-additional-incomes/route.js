import Income from "@/models/income";
import User from "@/models/user";
import RequestHandler from "@/helpers/RequestHandler";
import { NextResponse } from "next/server";

export async function GET(request) {
  const incomeHandler = new RequestHandler(Income);
  const { items, pagination } = await incomeHandler.handleRequest(
    request,
    false,
    false,
    false
  );

  return NextResponse.json({ items, pagination });
}
