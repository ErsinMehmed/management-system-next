import connectMongoDB from "@/libs/mongodb";
import Product from "@/models/product";
import { NextResponse } from "next/server";

export async function GET() {
  await connectMongoDB();

  const products = await Product.aggregate([
    {
      $lookup: {
        from: "categories",
        localField: "category",
        foreignField: "_id",
        as: "category",
      },
    },
    {
      $unwind: "$category",
    },
    {
      $project: {
        _id: "$_id",
        name: "$name",
        weight: "$weight",
        price: "$price",
        availability: "$availability",
        category: "$category.name",
      },
    },
    {
      $match: {
        availability: { $gt: 0 },
        category: "Бутилки",
      },
    },
  ]);

  return NextResponse.json(products, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
