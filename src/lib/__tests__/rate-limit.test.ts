import { describe, it, expect, beforeEach } from "vitest";
import { rateLimit } from "@/lib/rate-limit";

// Ensure the in-memory fallback path is exercised (no Upstash configured).
beforeEach(() => {
  delete process.env.UPSTASH_REDIS_REST_URL;
  delete process.env.UPSTASH_REDIS_REST_TOKEN;
});

describe("rateLimit (in-memory)", () => {
  it("allows up to the limit, then blocks", async () => {
    const id = `test-${Math.floor(Math.random() * 1e9)}`;
    const opts = { limit: 3, windowSec: 60 };

    const r1 = await rateLimit(id, opts);
    const r2 = await rateLimit(id, opts);
    const r3 = await rateLimit(id, opts);
    const r4 = await rateLimit(id, opts);

    expect(r1.success).toBe(true);
    expect(r2.success).toBe(true);
    expect(r3.success).toBe(true);
    expect(r4.success).toBe(false);
  });

  it("decrements remaining and never goes negative", async () => {
    const id = `test-${Math.floor(Math.random() * 1e9)}`;
    const opts = { limit: 2, windowSec: 60 };

    const r1 = await rateLimit(id, opts);
    const r2 = await rateLimit(id, opts);
    const r3 = await rateLimit(id, opts);

    expect(r1.remaining).toBe(1);
    expect(r2.remaining).toBe(0);
    expect(r3.remaining).toBe(0);
  });
});
