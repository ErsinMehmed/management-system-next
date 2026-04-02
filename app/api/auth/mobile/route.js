import connectMongoDB from "@/libs/mongodb";
import { checkRateLimit, resetRateLimit } from "@/helpers/rateLimiter";
import User from "@/models/user";
import bcrypt from "bcryptjs";
import { encode } from "next-auth/jwt";
import { NextResponse } from "next/server";

// POST /api/auth/mobile
// Body: { email, password }
// Returns: { status, token, user }
export async function POST(request) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json(
      { status: false, message: "Имейлът и паролата са задължителни." },
      { status: 400 }
    );
  }

  const { blocked, minutesLeft } = checkRateLimit(email);
  if (blocked) {
    return NextResponse.json(
      { status: false, message: `Твърде много неуспешни опита. Опитайте след ${minutesLeft} минути.` },
      { status: 429 }
    );
  }

  try {
    await connectMongoDB();

    const user = await User.findOne({ email }).populate({ path: "role", select: "name" });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return NextResponse.json(
        { status: false, message: "Грешен имейл или парола." },
        { status: 401 }
      );
    }

    resetRateLimit(email);

    // Issue a JWT token in the same format that NextAuth uses
    const token = await encode({
      token: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role.name,
        profile_image: user.profile_image ?? null,
      },
      secret: process.env.NEXTAUTH_SECRET,
    });

    return NextResponse.json({
      status: true,
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role.name,
        profile_image: user.profile_image ?? null,
      },
    });
  } catch (error) {
    console.error("[mobile auth]", error);
    return NextResponse.json(
      { status: false, message: "Сървърна грешка." },
      { status: 500 }
    );
  }
}