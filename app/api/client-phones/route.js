import { requireSuperAdmin } from "@/helpers/requireRole";
import connectMongoDB from "@/libs/mongodb";
import ClientOrder from "@/models/clientOrder";
import ClientPhone from "@/models/clientPhone";
import { NextResponse } from "next/server";

// GET — уникални телефони от поръчките с пагинация, обогатени с имена
export async function GET(request) {
  const { error } = await requireSuperAdmin();
  if (error) return error;

  await connectMongoDB();

  const { searchParams } = request.nextUrl;
  const page = Math.max(1, parseInt(searchParams.get("page")) || 1);
  const perPage = 12;
  const search = searchParams.get("search")?.trim() ?? "";

  const [phones, names] = await Promise.all([
    ClientOrder.aggregate([
      { $group: { _id: "$phone", lastOrder: { $max: "$createdAt" }, orderCount: { $sum: 1 } } },
      { $sort: { lastOrder: -1 } },
    ]),
    ClientPhone.find({}).lean(),
  ]);

  const nameMap = new Map(names.map((n) => [n.phone, n.name]));

  let items = phones.map(({ _id, lastOrder, orderCount }) => ({
    phone: _id,
    name: nameMap.get(_id) ?? "",
    lastOrder,
    orderCount,
  }));

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
  const { error } = await requireSuperAdmin();
  if (error) return error;

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
