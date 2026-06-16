import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const TEST_USER = {
  id: "507f1f77bcf86cd799439011", // valid ObjectId format — required by Mongoose guards
  name: "Test User",
  email: "test@miqsx.com",
  password: "test1234",
};

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/auth/login",
    newUser: "/onboarding",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        // Hardcoded test account — remove when MongoDB is set up
        if (
          credentials.email === TEST_USER.email &&
          credentials.password === TEST_USER.password
        ) {
          return { id: TEST_USER.id, email: TEST_USER.email, name: TEST_USER.name };
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        (session.user as { id?: string }).id = token.id as string;
      }
      return session;
    },
  },
};
