// Edge-safe rate limiter. Uses Upstash Redis (via REST, no SDK needed) when
// UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN are set; otherwise falls
// back to an in-memory fixed-window counter (fine for local/single-instance dev,
// best-effort on serverless — configure Upstash for real multi-instance prod).
//
// Fixed-window algorithm: key = rl:{id}:{floor(now/window)}. Simple, cheap, and
// good enough to stop burst cost-bombs on the AI endpoints.

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number; // epoch ms when the current window ends
}

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

// In-memory fallback store (per-isolate). Module-level so it persists across
// requests in a warm process.
const memStore = new Map<string, { count: number; reset: number }>();
let warnedNoUpstash = false;

async function upstashFixedWindow(
  key: string,
  windowSec: number
): Promise<number> {
  // One round-trip pipeline: INCR then (re)set the TTL to cover the window.
  const res = await fetch(`${UPSTASH_URL}/pipeline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${UPSTASH_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify([
      ["INCR", key],
      ["EXPIRE", key, windowSec],
    ]),
  });

  if (!res.ok) throw new Error(`Upstash ${res.status}`);
  const data = (await res.json()) as { result: number }[];
  return data[0]?.result ?? 0;
}

function memoryFixedWindow(
  key: string,
  windowMs: number,
  reset: number
): number {
  const existing = memStore.get(key);
  if (existing && existing.reset === reset) {
    existing.count += 1;
    return existing.count;
  }
  // New window — opportunistically sweep a few stale entries.
  if (memStore.size > 5000) {
    const now = Date.now();
    for (const [k, v] of memStore) {
      if (v.reset < now) memStore.delete(k);
    }
  }
  memStore.set(key, { count: 1, reset });
  return 1;
}

/**
 * Apply a fixed-window rate limit for `identifier`.
 * Defaults: 15 requests per 60s — tuned for the AI endpoints.
 */
export async function rateLimit(
  identifier: string,
  opts: { limit?: number; windowSec?: number } = {}
): Promise<RateLimitResult> {
  const limit = opts.limit ?? 15;
  const windowSec = opts.windowSec ?? 60;
  const windowMs = windowSec * 1000;
  const now = Date.now();
  const windowIndex = Math.floor(now / windowMs);
  const reset = (windowIndex + 1) * windowMs;
  const key = `rl:${identifier}:${windowIndex}`;

  let count: number;
  try {
    if (UPSTASH_URL && UPSTASH_TOKEN) {
      count = await upstashFixedWindow(key, windowSec);
    } else {
      if (!warnedNoUpstash) {
        warnedNoUpstash = true;
        console.warn(
          "[rate-limit] Upstash not configured — using in-memory fallback (not safe across serverless instances)."
        );
      }
      count = memoryFixedWindow(key, windowMs, reset);
    }
  } catch (err) {
    // Fail open: never let the limiter take down the API.
    console.error("[rate-limit] backend error, allowing request:", err);
    return { success: true, limit, remaining: limit, reset };
  }

  return {
    success: count <= limit,
    limit,
    remaining: Math.max(0, limit - count),
    reset,
  };
}
