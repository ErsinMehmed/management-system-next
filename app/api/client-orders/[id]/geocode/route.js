import { getAuth } from "@/helpers/getAuth";
import connectMongoDB from "@/libs/mongodb";
import ClientOrder from "@/models/clientOrder";
import { geocodeAddress } from "@/libs/geocode";
import { NextResponse } from "next/server";

export async function POST(request, { params }) {
  const session = await getAuth(request);
  if (!session) {
    return NextResponse.json({ message: "Не сте оторизирани." }, { status: 401 });
  }

  const { id } = await params;
  await connectMongoDB();

  const order = await ClientOrder.findById(id)
    .select("address coords assignedTo")
    .lean();
  if (!order) {
    return NextResponse.json({ message: "Поръчката не е намерена." }, { status: 404 });
  }

  // Достъп: admin/super admin или асайнатия seller
  const isAdmin = ["Admin", "Super Admin"].includes(session.user.role);
  if (!isAdmin && String(order.assignedTo) !== String(session.user.id)) {
    return NextResponse.json({ message: "Нямате достъп." }, { status: 403 });
  }

  // Кеширан резултат
  if (order.coords?.lat != null && order.coords?.lng != null) {
    return NextResponse.json({
      coords: { lat: order.coords.lat, lng: order.coords.lng },
      cached: true,
    });
  }

  if (!order.address?.trim()) {
    return NextResponse.json(
      { message: "Поръчката няма адрес.", coords: null },
      { status: 400 }
    );
  }

  const coords = await geocodeAddress(order.address);
  if (!coords) {
    return NextResponse.json(
      { message: "Адресът не може да бъде локализиран.", coords: null },
      { status: 422 }
    );
  }

  await ClientOrder.findByIdAndUpdate(id, {
    coords: { lat: coords.lat, lng: coords.lng, geocodedAt: new Date() },
  });

  return NextResponse.json({ coords, cached: false });
}
