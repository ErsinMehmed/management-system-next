import connectMongoDB from "@/libs/mongodb";
import Sell from "@/models/sell";
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

    if (product.availability <= 0 || product.availability < data.quantity) {
      return NextResponse.json(
        {
          message: "Недостатъчна наличност от продукта",
          status: false,
        },
        { status: 400 }
      );
    }

    product.availability -= data.quantity;

    await product.save();

    await Sell.create(data);

    return NextResponse.json(
      { message: "Прождабата е добавена успешно", status: true },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: "Грешка при обработка на продажбата",
        error: error,
        status: false,
      },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  const sellHandler = new RequestHandler(Sell);
  const { items, pagination } = await sellHandler.handleRequest(request);

  return NextResponse.json({ items, pagination });
}

export async function DELETE(request) {
  const id = request.nextUrl.searchParams.get("id");

  await connectMongoDB();

  try {
    const sellToDelete = await Sell.findById(id);

    if (!sellToDelete) {
      return NextResponse.json(
        { message: "Продажбата не беше намерена", status: false },
        { status: 404 }
      );
    }

    const product = await Product.findById(sellToDelete.product);

    if (!product) {
      return NextResponse.json(
        { message: "Продуктът не беше намерен", status: false },
        { status: 404 }
      );
    }

    product.availability += sellToDelete.quantity;

    await product.save();

    await Sell.findByIdAndDelete(id);

    return NextResponse.json(
      { message: "Продажбата е изтрита успешно", status: true },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: "Грешка при изтриване на продажбата",
        error: error,
        status: false,
      },
      { status: 500 }
    );
  }
}
