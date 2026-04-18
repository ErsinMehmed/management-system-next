import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectMongoDB from "@/libs/mongodb";
import ClientOrder from "@/models/clientOrder";
import ClientPhone from "@/models/clientPhone";
import { NextResponse } from "next/server";

// GET — уникални телефони от поръчките с пагинация, обогатени с имена
export async function GET(request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ message: "Няма достъп." }, { status: 401 });

  await connectMongoDB();

  const { searchParams } = request.nextUrl;
  const page = Math.max(1, parseInt(searchParams.get("page")) || 1);
  const perPage = 12;
  const search = searchParams.get("search")?.trim() ?? "";

  const [phones, stored] = await Promise.all([
    ClientOrder.aggregate([
      { $group: { _id: "$phone", lastOrder: { $max: "$createdAt" }, orderCount: { $sum: 1 } } },
      { $sort: { lastOrder: -1 } },
    ]),
    ClientPhone.find({}).lean(),
  ]);

  const nameMap = new Map(stored.map((n) => [n.phone, n.name]));
  const fromOrders = new Set(phones.map((p) => p._id));

  let items = phones.map(({ _id, lastOrder, orderCount }) => ({
    phone: _id,
    name: nameMap.get(_id) ?? "",
    lastOrder,
    orderCount,
  }));

  // Включи и клиентите без поръчки (само записани ръчно)
  for (const p of stored) {
    if (!fromOrders.has(p.phone)) {
      items.unshift({ phone: p.phone, name: p.name || "", lastOrder: p.createdAt, orderCount: 0 });
    }
  }

  if (search) {
    const lower = search.toLowerCase();
    items = items.filter(
      (i) => i.phone.includes(search) || i.name.toLowerCase().includes(lower)
    );
  }

  const total = items.length;
  const paginated = items.slice((page - 1) * perPage, page * perPage);
  const hasMore = page * perPage < total;

  return NextResponse.json({ items: paginated, hasMore, total });
}

// PUT — запазване на име за телефонен номер
export async function PUT(request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ message: "Няма достъп." }, { status: 401 });

  const { phone, name } = await request.json();
  if (!phone) return NextResponse.json({ message: "Липсва телефон." }, { status: 400 });

  await connectMongoDB();

  await ClientPhone.findOneAndUpdate(
    { phone },
    { name: name?.trim() ?? "" },
    { upsert: true }
  );

  return NextResponse.json({ status: true, message: "Името е запазено." });
}
