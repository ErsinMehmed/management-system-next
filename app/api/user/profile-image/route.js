import { getAuth } from "@/helpers/getAuth";
import connectMongoDB from "@/libs/mongodb";
import User from "@/models/user";
import { NextResponse } from "next/server";

// Cloudinary cloud name съвпада с frontend-а (CreateProductModal, profile page).
const CLOUDINARY_CLOUD = "dhp0zcdke";
const CLOUDINARY_URL_RE = new RegExp(
  `^https://res\\.cloudinary\\.com/${CLOUDINARY_CLOUD}/.+`
);

export async function PUT(request) {
  const session = await getAuth(request);
  if (!session) return NextResponse.json({ message: "Не сте оторизирани." }, { status: 401 });

  const { profile_image } = await request.json();
  if (!profile_image || typeof profile_image !== "string") {
    return NextResponse.json({ message: "Липсва URL на снимката." }, { status: 400 });
  }

  // Без whitelist клиентът може да подаде data:/javascript: URI, internal URL
  // (SSRF), друг CDN. Ограничаваме до нашия Cloudinary cloud.
  if (!CLOUDINARY_URL_RE.test(profile_image)) {
    return NextResponse.json(
      { message: "Невалиден URL на снимката." },
      { status: 400 }
    );
  }

  await connectMongoDB();
  await User.findByIdAndUpdate(session.user.id, { profile_image });

  return NextResponse.json({ status: true });
}
