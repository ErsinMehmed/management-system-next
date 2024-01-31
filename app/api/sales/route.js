import connectMongoDB from "@/libs/mongodb";
import Sell from "@/models/sell";
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
  const page = request.nextUrl.searchParams.get("page") || 1;
  const perPage = request.nextUrl.searchParams.get("per_page") || 10;
  const searchText = request.nextUrl.searchParams.get("search");
  const dateFrom = request.nextUrl.searchParams.get("date_from");
  const dateTo = request.nextUrl.searchParams.get("date_to");
  const product = request.nextUrl.searchParams.get("product");
  const minQuantity = request.nextUrl.searchParams.get("min_quantity");
  const maxQuantity = request.nextUrl.searchParams.get("max_quantity");
  const sortColumn = request.nextUrl.searchParams.get("sort_column");
  const sortOrder = request.nextUrl.searchParams.get("sort_order");

  await connectMongoDB();

  let queryBuilder = Sell.find();

  if (searchText?.length > 0) {
    const productIds = await Product.find({
      name: { $regex: new RegExp(searchText, "i") },
    }).distinct("_id");

    queryBuilder = queryBuilder.where("product").in(productIds);
  }

  if (dateFrom) {
    queryBuilder = queryBuilder.where("date").gte(new Date(dateFrom));
  }

  if (dateTo) {
    queryBuilder = queryBuilder.where("date").lte(new Date(dateTo));
  }

  if (product) {
    queryBuilder.where("product").equals(product);
  }

  if (minQuantity) {
    queryBuilder.where("quantity").gte(parseInt(minQuantity));
  }

  if (maxQuantity) {
    queryBuilder.where("quantity").lte(parseInt(maxQuantity));
  }

  if (sortColumn && sortOrder) {
    const sortObject = {};
    sortObject[sortColumn] = sortOrder === "asc" ? 1 : -1;
    queryBuilder = queryBuilder.sort(sortObject);
  } else {
    queryBuilder = queryBuilder.sort({ _id: -1 });
  }

  const totalSales = await Sell.countDocuments(queryBuilder);
  const sales = await queryBuilder
    .populate({
      path: "product",
      select: "name weight flavor count",
    })
    .select("quantity price message date fuel_price product")
    .skip((page - 1) * perPage)
    .limit(perPage);

  const pagination = {
    current_page: parseInt(page),
    total_pages: Math.ceil(totalSales / perPage),
    total_results: totalSales,
    per_page: parseInt(perPage),
  };

  return NextResponse.json({ sales, pagination });
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
