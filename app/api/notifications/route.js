import { getAuth } from "@/helpers/getAuth";
import connectMongoDB from "@/libs/mongodb";
import Notification from "@/models/notification";
import { NextResponse } from "next/server";

function buildFilter(userId, role) {
  const isAdmin = ["Admin", "Super Admin"].includes(role);
  const base = { changedByUserId: { $ne: String(userId) } };
  if (isAdmin) return base;
  // Seller вижда само известия за техни заявки
  return { ...base, assignedTo: String(userId) };
}

export async function GET(request) {
  const session = await getAuth(request);
  if (!session) return NextResponse.json({ status: false }, { status: 401 });

  await connectMongoDB();

  const { searchParams } = request.nextUrl;
  const page    = Math.max(1, parseInt(searchParams.get("page")) || 1);
  const perPage = 10;

  const filter = buildFilter(session.user.id, session.user.role);

  const [total, items, unreadCount] = await Promise.all([
    Notification.countDocuments(filter),
    Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * perPage)
      .limit(perPage)
      .lean(),
    Notification.countDocuments({
      ...filter,
      readBy: { $ne: String(session.user.id) },
    }),
  ]);

  return NextResponse.json({
    items,
    unreadCount,
    hasMore: page * perPage < total,
  });
}

// Маркира всички като прочетени
export async function PATCH(request) {
  const session = await getAuth(request);
  if (!session) return NextResponse.json({ status: false }, { status: 401 });

  await connectMongoDB();

  const filter = buildFilter(session.user.id, session.user.role);

  await Notification.updateMany(
    { ...filter, readBy: { $ne: String(session.user.id) } },
    { $addToSet: { readBy: String(session.user.id) } }
  );

  return NextResponse.json({ status: true });
}
