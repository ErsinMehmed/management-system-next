import connectMongoDB from "@/libs/mongodb";
import Sell from "@/models/sell";
import UserStock from "@/models/userStock";
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
            count: "$product.count",
            percent: "$product.percent",
            product_price: "$product.price",
          },
          total_quantity: { $sum: "$quantity" },
          total_fuel_price: { $sum: "$fuel_price" },
          total_price: { $sum: "$price" },
          total_cost: { $sum: { $multiply: ["$quantity", "$product.price"] } },
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
              count: "$_id.count",
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
        $sort: {
          total_quantity: 1,
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

    const userIds = sales.map((sale) => sale.user_id);

    const userStocks = await UserStock.find({
      user: { $in: userIds },
    })
      .populate("product", "_id name weight count")
      .select("user product stock");

    const stocksMap = userStocks.reduce((acc, stock) => {
      if (!acc[stock.user]) {
        acc[stock.user] = [];
      }

      const productName =
        stock.product.name === "Балони"
          ? `${stock.product.name} ${stock.product.count}бр.`
          : `${stock.product.name} ${stock.product.weight}гр.`;

      acc[stock.user].push({
        product_name: productName,
        stock: stock.stock,
      });

      return acc;
    }, {});

    const transformedSales = sales.map((sale) => ({
      ...sale,
      user_stocks: stocksMap[sale.user_id] || [],
    }));

    return NextResponse.json({
      sales: transformedSales,
      status: true,
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: "Грешка при извличане на продажбите",
        error: error.message,
        status: false,
      },
      { status: 500 }
    );
  }
}
