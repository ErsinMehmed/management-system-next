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
        $lookup: {
          from: "roles",
          localField: "user.role",
          foreignField: "_id",
          as: "role",
        },
      },
      {
        $unwind: "$role",
      },
      {
        $group: {
          _id: {
            user: "$user.name",
            user_id: "$user._id",
            profile_image: "$user.profile_image",
            user_percent: "$user.percent",
            role: "$role.name",
            product: "$product.name",
            weight: "$product.weight",
            percent: "$product.percent",
            product_price: "$product.price", // Вземаме цената на продукта
          },
          total_quantity: { $sum: "$quantity" },
          total_fuel_price: { $sum: "$fuel_price" },
          total_price: { $sum: "$price" }, // Общата цена на продажбите
          total_cost: { $sum: { $multiply: ["$quantity", "$product.price"] } }, // Изчисляваме общия разход
        },
      },
      {
        $group: {
          _id: {
            user: "$_id.user",
            user_id: "$_id.user_id",
            profile_image: "$_id.profile_image",
            role: "$_id.role",
            user_percent: "$_id.user_percent",
          },
          products: {
            $push: {
              name: "$_id.product",
              weight: "$_id.weight",
              percent: "$_id.percent",
              product_price: "$_id.product_price",
              total_quantity: "$total_quantity",
              total_price: "$total_price",
              total_cost: "$total_cost",
            },
          },
          total_bottles: { $sum: "$total_quantity" },
          total_fuel_price: { $sum: "$total_fuel_price" },
          total_cost: { $sum: "$total_cost" },
        },
      },
      {
        $project: {
          _id: 0,
          user_name: "$_id.user",
          user_id: "$_id.user_id",
          user_profile_image: "$_id.profile_image",
          user_percent: "$_id.user_percent",
          user_role: "$_id.role",
          products: 1,
          total_bottles: 1,
          total_fuel_price: 1,
          total_cost: 1,
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
