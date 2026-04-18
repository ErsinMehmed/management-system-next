import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectMongoDB from "@/libs/mongodb";
import ClientPhone from "@/models/clientPhone";
import { NextResponse } from "next/server";

export async function POST(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ message: "Няма достъп." }, { status: 401 });

  const { phone: rawPhone } = await params;
  const phone = decodeURIComponent(rawPhone);

  const { text } = await request.json();
  if (!text?.trim()) return NextResponse.json({ message: "Празна бележка." }, { status: 400 });

  await connectMongoDB();

  const note = { text: text.trim(), createdBy: session.user.id, createdAt: new Date() };

  await ClientPhone.findOneAndUpdate(
    { phone },
    { $push: { notes: note }, $setOnInsert: { phone } },
    { upsert: true, new: true }
  );

  return NextResponse.json({ status: true, message: "Бележката е добавена." }, { status: 201 });
}

export async function DELETE(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ message: "Няма достъп." }, { status: 401 });

  const { phone: rawPhone } = await params;
  const phone = decodeURIComponent(rawPhone);

  const { searchParams } = request.nextUrl;
  const noteId = searchParams.get("id");
  if (!noteId) return NextResponse.json({ message: "Липсва ID." }, { status: 400 });

  await connectMongoDB();

  await ClientPhone.findOneAndUpdate(
    { phone },
    { $pull: { notes: { _id: noteId } } }
  );

  return NextResponse.json({ status: true, message: "Бележката е изтрита." });
}
