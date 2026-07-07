import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongoose";
import User from "@/models/User";
import Membership from "@/models/Membership";
import Organization from "@/models/Organization";

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
        // Backed by a real DB user (find-or-create) so org-scoped features
        // (workspaces, brands, quotas) behave exactly like production accounts;
        // a hardcoded fake id would have no Membership and 403 every org guard.
        if (
          process.env.NODE_ENV !== "production" &&
          email === TEST_USER.email &&
          credentials.password === TEST_USER.password
        ) {
          await connectDB();
          let testUser = await User.findOne({ email: TEST_USER.email });
          if (!testUser) {
            testUser = await User.create({
              name: TEST_USER.name,
              email: TEST_USER.email,
              password: await bcrypt.hash(TEST_USER.password, 12),
            });
          }
          return {
            id: testUser._id.toString(),
            email: testUser.email,
            name: testUser.name,
            plan: testUser.plan,
          };
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
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.plan = "free"; // overwritten below from the active workspace
      }

      // Helper: load a workspace's plan.
      const orgPlan = async (orgId: string) => {
        const org = await Organization.findById(orgId).select("plan");
        return org?.plan ?? "free";
      };

      // Seed the active workspace + its plan (oldest membership = personal workspace).
      if (token.id && !token.activeOrgId) {
        try {
          await connectDB();
          const m = await Membership.findOne({ userId: token.id }).sort({ joinedAt: 1 }).select("orgId");
          if (m) {
            const oid = m.orgId.toString();
            token.activeOrgId = oid;
            token.plan = await orgPlan(oid);
          }
        } catch {
          /* leave unset on transient error */
        }
      }

      if (trigger === "update") {
        try {
          await connectDB();
          // Switch workspace via update({ activeOrgId }) — only if a member.
          const requestedOrg = (session as { activeOrgId?: string } | undefined)?.activeOrgId;
          if (requestedOrg && token.id) {
            const m = await Membership.findOne({ userId: token.id, orgId: requestedOrg });
            if (m) token.activeOrgId = requestedOrg;
          }
          // Re-sync plan from the active workspace (e.g. right after an upgrade).
          const activeOrg = token.activeOrgId;
          if (activeOrg) token.plan = await orgPlan(activeOrg);
        } catch {
          /* keep existing token values */
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.plan = token.plan;
        session.user.activeOrgId = token.activeOrgId;
        if (token.email) session.user.email = token.email;
        if (token.name) session.user.name = token.name;
      }
      return session;
    },
  },
};
