import { getServerSession } from "next-auth/next";
import { decode } from "next-auth/jwt";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

/**
 * Returns the session regardless of whether the request comes from
 * the web (NextAuth cookie) or a mobile client (Authorization: Bearer <token>).
 *
 * @param {Request|null} request - Pass the Next.js request object for mobile support.
 */
export async function getAuth(request = null) {
  // Web: NextAuth cookie session
  const session = await getServerSession(authOptions);
  if (session) return session;

  // Mobile: Bearer JWT
  if (!request) return null;

  const authorization =
    request.headers.get("Authorization") ??
    request.headers.get("authorization");

  if (!authorization?.startsWith("Bearer ")) return null;

  const decoded = await decode({
    token: authorization.slice(7),
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!decoded) return null;

  return {
    user: {
      id: String(decoded.id),
      name: decoded.name,
      email: decoded.email,
      role: decoded.role,
      profile_image: decoded.profile_image ?? null,
    },
  };
}
