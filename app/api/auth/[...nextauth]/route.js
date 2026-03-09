import connectMongoDB from "@/libs/mongodb";
import { checkRateLimit, resetRateLimit } from "@/helpers/rateLimiter";
import User from "@/models/user";
import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {},

      async authorize(credentials) {
        const { email, password } = credentials;

        const { blocked, minutesLeft } = checkRateLimit(email);

        if (blocked) {
          throw new Error(
            `Твърде много неуспешни опита. Опитайте отново след ${minutesLeft} минути.`
          );
        }

        try {
          await connectMongoDB();

          const user = await User.findOne({ email }).populate({
            path: "role",
            select: "name",
          });

          if (!user) {
            return null;
          }

          const passwordsMatch = await bcrypt.compare(password, user.password);

          if (!passwordsMatch) {
            return null;
          }

          resetRateLimit(email);

          return user;
        } catch (error) {
          if (error.message.includes("Опитайте")) throw error;
          console.log("Error: ", error);
        }
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.role = token.role;
        session.user.profile_image = token.profile_image;
      }

      return session;
    },
    async jwt({ token, user }) {
      // user е наличен само при първоначален login — не при всяко опресняване
      if (user) {
        token.id = user._id;
        token.name = user.name;
        token.email = user.email;
        token.role = user.role.name;
        token.profile_image = user.profile_image;
      }

      return token;
    },
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/",
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
