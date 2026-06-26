import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongoose";
import User from "@/models/User";
import Membership from "@/models/Membership";

// Dev-only test account — never available in production builds.
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

        const email = credentials.email.toLowerCase().trim();

        // Dev-only convenience login — stripped out of production builds.
        if (
          process.env.NODE_ENV !== "production" &&
          email === TEST_USER.email &&
          credentials.password === TEST_USER.password
        ) {
          return { id: TEST_USER.id, email: TEST_USER.email, name: TEST_USER.name, plan: "free" };
        }

        // Real users — look up in MongoDB and verify the bcrypt hash.
        await connectDB();
        const user = await User.findOne({ email }).select("+password");
        if (!user?.password) return null;

        const valid = await bcrypt.compare(credentials.password, user.password);
        if (!valid) return null;

        return { id: user._id.toString(), email: user.email, name: user.name, plan: user.plan };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // On sign-in, seed id + plan from the authorized user.
      if (user) {
        token.id = user.id;
        token.plan = user.plan ?? "free";
      }

      // Seed the active workspace once we know the user (oldest membership =
      // their personal workspace).
      if (token.id && !token.activeOrgId) {
        try {
          await connectDB();
          const m = await Membership.findOne({ userId: token.id }).sort({ joinedAt: 1 }).select("orgId");
          if (m) token.activeOrgId = m.orgId.toString();
        } catch {
          /* leave unset on transient error */
        }
      }

      if (trigger === "update") {
        // Switch workspace via update({ activeOrgId }) — only if the user is a member.
        const requestedOrg = (session as { activeOrgId?: string } | undefined)?.activeOrgId;
        if (requestedOrg && token.id) {
          try {
            await connectDB();
            const m = await Membership.findOne({ userId: token.id, orgId: requestedOrg });
            if (m) token.activeOrgId = requestedOrg;
          } catch {
            /* ignore */
          }
        }
        // Re-sync plan from the DB (e.g. right after an upgrade).
        if (token.id) {
          try {
            await connectDB();
            const fresh = await User.findById(token.id).select("plan");
            if (fresh) token.plan = fresh.plan;
          } catch {
            /* keep existing token.plan */
          }
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.plan = token.plan;
        session.user.activeOrgId = token.activeOrgId;
      }
      return session;
    },
  },
};
