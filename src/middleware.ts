import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { rateLimit } from "@/lib/rate-limit";

// Burst protection for the expensive AI endpoints (Groq / fal / sharp).
// Per-user when authenticated, per-IP otherwise. Plan quotas (enforceLimit)
// still cap monthly totals — this only stops rapid-fire abuse / cost-bombs.
const AI_LIMIT = { limit: 15, windowSec: 60 };

export async function middleware(req: NextRequest) {
  // Identify the caller: prefer the authenticated user id, fall back to IP.
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const userId = (token?.id as string | undefined) ?? (token?.sub as string | undefined);
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anon";
  const identifier = userId ? `user:${userId}` : `ip:${ip}`;

  const result = await rateLimit(identifier, AI_LIMIT);

  if (!result.success) {
    const retryAfter = Math.max(1, Math.ceil((result.reset - Date.now()) / 1000));
    return NextResponse.json(
      {
        error: "Too many requests. Please slow down and try again shortly.",
        code: "RATE_LIMITED",
        retryAfter,
      },
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

// Only run on the expensive AI endpoints.
export const config = {
  matcher: [
    "/api/generate/:path*",
    "/api/validate/:path*",
    "/api/audit",
    "/api/brief/:path*",
    "/api/chat",
    "/api/names",
    "/api/moodboard",
  ],
};
