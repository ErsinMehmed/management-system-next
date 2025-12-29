import connectMongoDB from "@/libs/mongodb";
import Product from "@/models/product";
import { NextResponse } from "next/server";

export async function PUT(request, { params }) {
  try {
    const id = await params.id;
    const data = await request.json();

    await connectMongoDB();

    const updatedProduct = await Product.findByIdAndUpdate(id, data, {
      new: true,
    });

    if (!updatedProduct) {
      return NextResponse.json(
        { message: "Продуктът не е намерен", status: false },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Продуктът е обновен", status: true },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Възникна грешка при обновяване", status: false },
      { status: 500 }
    );
  }
}

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    await connectMongoDB();

    const product = await Product.findById(id).select(
      "price availability sell_prices"
    );

    if (!product) {
      return NextResponse.json(
        { message: "Продуктът не е намерен", status: false },
        { status: 404 }
      );
    }

    return NextResponse.json(product, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Възникна грешка при зареждане", status: false },
      { status: 500 }
    );
  }
}
