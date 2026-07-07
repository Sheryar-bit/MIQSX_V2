import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { rateLimit } from "@/lib/rate-limit";

// Per-path rate-limit rules. `bucket` namespaces the counter so, e.g., login
// attempts don't share a budget with AI calls. `keyByIp` forces IP-keying for
// unauthenticated endpoints (login/register/reset) where there's no user yet.
interface Rule {
  limit: number;
  windowSec: number;
  keyByIp: boolean;
  bucket: string;
}

function ruleFor(pathname: string): Rule {
  if (pathname === "/api/auth/forgot-password" || pathname === "/api/auth/reset-password") {
    return { limit: 5, windowSec: 300, keyByIp: true, bucket: "authpw" }; // 5 / 5 min — anti email-spam / reset abuse
  }
  if (pathname.startsWith("/api/auth/callback") || pathname === "/api/auth/register") {
    return { limit: 10, windowSec: 60, keyByIp: true, bucket: "auth" }; // 10 / min — anti brute-force
  }
  if (pathname === "/api/team/invite") {
    return { limit: 20, windowSec: 60, keyByIp: false, bucket: "invite" }; // 20 / min per user
  }
  return { limit: 15, windowSec: 60, keyByIp: false, bucket: "ai" }; // AI endpoints
}

export async function middleware(req: NextRequest) {
  const rule = ruleFor(req.nextUrl.pathname);

  const token = rule.keyByIp ? null : await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const userId = (token?.id as string | undefined) ?? (token?.sub as string | undefined);
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anon";
  const who = !rule.keyByIp && userId ? `user:${userId}` : `ip:${ip}`;
  const identifier = `${rule.bucket}:${who}`;

  const result = await rateLimit(identifier, { limit: rule.limit, windowSec: rule.windowSec });

  if (!result.success) {
    const retryAfter = Math.max(1, Math.ceil((result.reset - Date.now()) / 1000));
    return NextResponse.json(
      { error: "Too many requests. Please slow down and try again shortly.", code: "RATE_LIMITED", retryAfter },
      {
        status: 429,
        headers: {
          "Retry-After": String(retryAfter),
          "X-RateLimit-Limit": String(result.limit),
          "X-RateLimit-Remaining": String(result.remaining),
          "X-RateLimit-Reset": String(result.reset),
        },
      }
    );
  }

  const res = NextResponse.next();
  res.headers.set("X-RateLimit-Limit", String(result.limit));
  res.headers.set("X-RateLimit-Remaining", String(result.remaining));
  return res;
}

export const config = {
  matcher: [
    // Expensive AI endpoints
    "/api/generate/:path*",
    "/api/validate/:path*",
    "/api/audit",
    "/api/brief/:path*",
    "/api/chat",
    "/api/names",
    "/api/moodboard",
    // Sensitive auth endpoints (NOT /api/auth/session — that's polled constantly)
    "/api/auth/callback/:path*",
    "/api/auth/register",
    "/api/auth/forgot-password",
    "/api/auth/reset-password",
    // Team invites (spam protection)
    "/api/team/invite",
  ],
};
