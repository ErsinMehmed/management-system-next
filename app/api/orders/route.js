import connectMongoDB from "@/libs/mongodb";
import Order from "@/models/order";
import Product from "@/models/product";
import RequestHandler from "@/helpers/RequestHandler";
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
  const orderHandler = new RequestHandler(Order);
  const { items, pagination } = await orderHandler.handleRequest(request);

  return NextResponse.json({ items, pagination });
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
