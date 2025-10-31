import connectMongoDB from "@/libs/mongodb";
import UserStock from "@/models/userStock";
import User from "@/models/user";
import Product from "@/models/product";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

export async function POST(request) {
  const data = await request.json();

  const { userId, productId, stock } = data;

  if (!userId || !productId || stock == null) {
    return NextResponse.json(
      { message: "Липсва необходима информация", status: false },
      { status: 400 }
    );
  }

  await connectMongoDB();

  try {
    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json(
        { message: "Потребителят не беше намерен", status: false },
        { status: 404 }
      );
    }

    const product = await Product.findById(productId);

    if (!product) {
      return NextResponse.json(
        { message: "Продуктът не беше намерен", status: false },
        { status: 404 }
      );
    }

    const existingStock = await UserStock.findOne({
      user: userId,
      product: productId,
    });

    if (existingStock) {
      return NextResponse.json(
        {
          message: "Наличността вече съществува",
          status: false,
        },
        { status: 400 }
      );
    }

    const productObjectId = new mongoose.Types.ObjectId(productId);

    const totalUserStock = await UserStock.aggregate([
      { $match: { product: productObjectId } },
      { $group: { _id: null, totalStock: { $sum: "$stock" } } },
    ]);

    const availableStock =
      product.availability - (totalUserStock[0]?.totalStock || 0);

    if (availableStock < stock) {
      return NextResponse.json(
        {
          message: `Недостатъчна наличност. Можете да добавите максимум ${availableStock} броя.`,
          status: false,
        },
        { status: 400 }
      );
    }

    await UserStock.create({
      user: userId,
      product: productId,
      stock,
    });

    return NextResponse.json(
      {
        message: "Наличността е добавена успешно",
        status: true,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: "Грешка при добавяне на наличността",
        error: error.message,
        status: false,
      },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  const userId = request.nextUrl.searchParams.get("userId");

  await connectMongoDB();

  try {
    let userStocks;

    if (userId) {
      userStocks = await UserStock.find({ user: userId })
        .populate("product", "_id name weight count")
        .select("_id user stock");

      if (!userStocks.length) {
        return NextResponse.json(
          { message: "Няма наличности за този потребител", status: false },
          { status: 404 }
        );
      }
    } else {
      return NextResponse.json(
        { message: "Не е посочен потребител", status: false },
        { status: 404 }
      );
    }

    const transformedStocks = userStocks.map((stock) => ({
      id: stock._id,
      userId: stock.user,
      productId: stock.product._id,
      productName:
        stock.product.name +
        " " +
        (stock.product.name === "Балони"
          ? stock.product.count + "бр."
          : stock.product.weight + "гр."),
      stock: stock.stock,
    }));

    return NextResponse.json(
      {
        status: true,
        data: transformedStocks,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: "Грешка при получаване на наличностите",
        error: error.message,
        status: false,
      },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  const data = await request.json();
  const userStockId = data.id;

  if (!userStockId) {
    return NextResponse.json(
      { status: false, message: "Няма предоставен ID за актуализация." },
      { status: 400 }
    );
  }

  await connectMongoDB();

  try {
    const userStock = await UserStock.findById(userStockId);

    if (!userStock) {
      return NextResponse.json(
        { message: "Наличността не е намерена", status: false },
        { status: 404 }
      );
    }

    const product = await Product.findById(data.productId);
    if (!product) {
      return NextResponse.json(
        { message: "Продуктът не беше намерен", status: false },
        { status: 404 }
      );
    }

    userStock.product = product._id;

    if (data.userId) {
      const user = await User.findById(data.userId);

      if (!user) {
        return NextResponse.json(
          { message: "Потребителят не беше намерен", status: false },
          { status: 404 }
        );
      }

      userStock.user = user._id;
    }

    if (data.stock !== undefined) {
      userStock.stock = data.stock;
    }

    const productObjectId = new mongoose.Types.ObjectId(product._id);
    const stockObjectId = new mongoose.Types.ObjectId(userStockId);

    const totalUserStock = await UserStock.aggregate([
      { $match: { product: productObjectId, _id: { $ne: stockObjectId } } },
      { $group: { _id: null, totalStock: { $sum: "$stock" } } },
    ]);

    const availableStock =
      product.availability - (totalUserStock[0]?.totalStock || 0);

    if (availableStock < data.stock) {
      return NextResponse.json(
        {
          message: `Недостатъчна наличност. Можете да добавите максимум ${availableStock} броя.`,
          status: false,
        },
        { status: 400 }
      );
    }

    await userStock.save();

    return NextResponse.json(
      { message: "Наличността е актуализирана успешно", status: true },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: "Грешка при актуализиране на наличността",
        error: error.message,
        status: false,
      },
      { status: 500 }
    );
  }
}
