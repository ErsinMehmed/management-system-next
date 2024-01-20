import connectMongoDB from "@/libs/mongodb";
import Order from "@/models/order";
import Product from "@/models/product";
import { NextResponse } from "next/server";

export async function POST(request) {
  const data = await request.json();

  await connectMongoDB();

  try {
    const product = await Product.findOne({ _id: data.product });

    if (!data.date) {
      data.date = new Date();
    }

    if (!product) {
      return NextResponse.json(
        { message: "Продуктът не беше намерен", status: false },
        { status: 404 }
      );
    }

    product.availability += data.quantity;

    await product.save();

    await Order.create(data);

    return NextResponse.json(
      { message: "Поръчката е добавена успешно", status: true },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: "Грешка при обработка на поръчката",
        error: error,
        status: false,
      },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  const page = request.nextUrl.searchParams.get("page") || 1;
  const perPage = request.nextUrl.searchParams.get("per_page") || 10;
  const searchText = request.nextUrl.searchParams.get("search");
  const searchParam = request.nextUrl.searchParams.get("searchParam");

  await connectMongoDB();

  let queryBuilder = Order.find();

  if (searchText?.length > 0) {
    const productIds = await Product.find({
      name: { $regex: new RegExp(searchText, "i") },
    }).distinct("_id");

    queryBuilder = queryBuilder.where("product").in(productIds);
  }

  const totalOrders = await Order.countDocuments(queryBuilder);
  const orders = await queryBuilder
    .populate({
      path: "product",
      select: "name weight flavor count category",
    })
    .sort({ _id: -1 })
    .skip((page - 1) * perPage)
    .limit(perPage);

  const pagination = {
    current_page: parseInt(page),
    total_pages: Math.ceil(totalOrders / perPage),
    total_results: totalOrders,
    per_page: parseInt(perPage),
  };

  return NextResponse.json({ orders, pagination });
}

export async function DELETE(request) {
  const id = request.nextUrl.searchParams.get("id");

  await connectMongoDB();

  try {
    const orderToDelete = await Order.findById(id);

    if (!orderToDelete) {
      return NextResponse.json(
        { message: "Поръчката не беше намерена", status: false },
        { status: 404 }
      );
    }

    const product = await Product.findById(orderToDelete.product);

    if (!product) {
      return NextResponse.json(
        { message: "Продуктът не беше намерен", status: false },
        { status: 404 }
      );
    }

    product.availability -= orderToDelete.quantity;

    await product.save();

    await Order.findByIdAndDelete(id);

    return NextResponse.json(
      { message: "Поръчката е изтрита успешно", status: true },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: "Грешка при изтриване на поръчката",
        error: error,
        status: false,
      },
      { status: 500 }
    );
  }
}
