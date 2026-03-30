import { requireAdmin, requireSuperAdmin } from "@/helpers/requireRole";
import { getAuth } from "@/helpers/getAuth";
import connectMongoDB from "@/libs/mongodb";
import SellerStock from "@/models/sellerStock";
import User from "@/models/user";
import Role from "@/models/role";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

export async function GET(request) {
  const session = await getAuth(request);
  if (!session) return NextResponse.json({ message: "Не сте оторизирани." }, { status: 401 });

  await connectMongoDB();

  const isSeller = session.user.role === "Seller";

  if (isSeller) {
    // Само собствената наличност
    const stocks = await SellerStock.find({ seller: new mongoose.Types.ObjectId(session.user.id) })
      .populate("product", "name weight flavor puffs count")
      .lean();

    const products = stocks.map((s) => ({
      stockId: s._id,
      productId: s.product?._id,
      productName: s.product?.name ?? "Непознат продукт",
      productWeight: s.product?.weight,
      productFlavor: s.product?.flavor,
      stock: s.stock,
    }));

    return NextResponse.json({
      sellers: [{
        sellerId: session.user.id,
        sellerName: session.user.name,
        profileImage: session.user.profile_image ?? null,
        products,
      }],
      status: true,
    });
  }

  // Admin / Super Admin — всички доставчици без Super Admin
  const { error } = await requireAdmin(request);
  if (error) return error;

  const superAdminRole = await Role.findOne({ name: "Super Admin" }, { _id: 1 }).lean();

  const sellers = await User.find(
    superAdminRole ? { role: { $ne: superAdminRole._id } } : {},
    { name: 1, profile_image: 1 }
  ).lean();

  const sellerIds = sellers.map((s) => s._id);

  const stocks = await SellerStock.find({ seller: { $in: sellerIds } })
    .populate("product", "name weight flavor puffs count")
    .lean();

  const stocksBySeller = stocks.reduce((acc, s) => {
    const key = String(s.seller);
    if (!acc[key]) acc[key] = [];
    acc[key].push({
      stockId: s._id,
      productId: s.product?._id,
      productName: s.product?.name ?? "Непознат продукт",
      productWeight: s.product?.weight,
      productFlavor: s.product?.flavor,
      productPuffs: s.product?.puffs,
      productCount: s.product?.count,
      stock: s.stock,
    });
    return acc;
  }, {});

  const result = sellers.map((seller) => ({
    sellerId: seller._id,
    sellerName: seller.name,
    profileImage: seller.profile_image ?? null,
    products: (stocksBySeller[String(seller._id)] ?? []).sort((a, b) =>
      a.productName.localeCompare(b.productName)
    ),
  }));

  return NextResponse.json({ sellers: result, status: true });
}

// Bulk upsert — записва всички продукти за даден доставчик наведнъж
export async function POST(request) {
  const { error } = await requireSuperAdmin();
  if (error) return error;

  const { sellerId, products } = await request.json();
  if (!sellerId || !Array.isArray(products)) {
    return NextResponse.json({ message: "Липсват данни." }, { status: 400 });
  }

  await connectMongoDB();

  await Promise.all(
    products.map(({ productId, stock }) =>
      SellerStock.findOneAndUpdate(
        { seller: sellerId, product: productId },
        { stock: Math.max(0, Number(stock) || 0) },
        { upsert: true }
      )
    )
  );

  return NextResponse.json({ status: true });
}

export async function PUT(request) {
  const { error } = await requireSuperAdmin();
  if (error) return error;

  const { stockId, stock } = await request.json();
  if (stockId === undefined || stock === undefined) {
    return NextResponse.json({ message: "Липсват данни." }, { status: 400 });
  }

  await connectMongoDB();

  await SellerStock.findByIdAndUpdate(stockId, { stock: Math.max(0, Number(stock)) });

  return NextResponse.json({ status: true });
}
