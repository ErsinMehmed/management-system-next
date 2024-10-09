import connectMongoDB from "@/libs/mongodb";
import Sell from "@/models/sell";
import Product from "@/models/product";
import { NextResponse } from "next/server";
import { getDateCondition } from "@/utils";

export async function GET(request) {
  await connectMongoDB();

  const dateFrom = request.nextUrl.searchParams.get("dateFrom");
  const dateTo = request.nextUrl.searchParams.get("dateTo");
  const period = request.nextUrl.searchParams.get("period");

  const dateCondition = getDateCondition(dateFrom, dateTo, period);

  try {
    const sales = await Sell.aggregate([
      {
        $match: dateCondition,
      },
      {
        $lookup: {
          from: "products",
          localField: "product",
          foreignField: "_id",
          as: "product",
        },
      },
      {
        $unwind: "$product",
      },
      {
        $lookup: {
          from: "categories",
          localField: "product.category",
          foreignField: "_id",
          as: "category",
        },
      },
      {
        $unwind: "$category",
      },
      {
        $match: {
          "category.name": "Бутилки",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "creator",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $group: {
          _id: {
            user: "$user.name",
            profile_image: "$user.profile_image",
            product: "$product.name",
            weight: "$product.weight",
            percent: "$product.percent",
          },
          total_quantity: { $sum: "$quantity" },
          total_fuel_price: { $sum: "$fuel_price" },
        },
      },
      {
        $group: {
          _id: {
            user: "$_id.user",
            profile_image: "$_id.profile_image",
          },
          products: {
            $push: {
              product: "$_id.product",
              weight: "$_id.weight",
              percent: "$_id.percent",
              total_quantity: "$total_quantity",
            },
          },
          total_bottles: { $sum: "$total_quantity" },
          total_fuel_price: { $sum: "$total_fuel_price" },
        },
      },
      {
        $project: {
          _id: 0,
          user: "$_id.user",
          profile_image: "$_id.profile_image",
          products: 1,
          total_bottles: 1,
          total_fuel_price: 1,
        },
      },
      {
        $sort: {
          user: 1,
        },
      },
    ]);

    return NextResponse.json({
      sales,
      status: true,
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: "Грешка при извличане на продажбите",
        error: error,
        status: false,
      },
      { status: 500 }
    );
  }
}
