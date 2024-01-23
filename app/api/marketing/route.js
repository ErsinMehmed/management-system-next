import connectMongoDB from "@/libs/mongodb";
import Ad from "@/models/ad";
import { NextResponse } from "next/server";

export async function POST(request) {
  const data = await request.json();

  await connectMongoDB();

  await Ad.create(data);

  return NextResponse.json(
    { message: "Рекламата е създадена успешно", status: true },
    { status: 201 }
  );
}

export async function GET() {
  await connectMongoDB();

  const ads = await Ad.find();

  return NextResponse.json(ads);
}

export async function DELETE(request) {
  const id = request.nextUrl.searchParams.get("id");

  await connectMongoDB();

  try {
    await Ad.findByIdAndDelete(id);

    return NextResponse.json(
      { message: "Рекламата е изтрита успешно", status: true },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: "Грешка при изтриване на рекламата",
        error: error,
        status: false,
      },
      { status: 500 }
    );
  }
}
