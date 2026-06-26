import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { generateBrandImage, stepsForPlan, FLUX_MODEL } from "@/lib/imagegen";

const ORIGINAL_FETCH = global.fetch;

beforeEach(() => {
  process.env.CLOUDFLARE_ACCOUNT_ID = "acct_123";
  process.env.CLOUDFLARE_API_TOKEN = "token_abc";
});

afterEach(() => {
  global.fetch = ORIGINAL_FETCH;
  vi.restoreAllMocks();
});

describe("stepsForPlan", () => {
  it("gates step count by plan and defaults to free", () => {
    expect(stepsForPlan("free")).toBe(4);
    expect(stepsForPlan("pro")).toBe(6);
    expect(stepsForPlan("agency")).toBe(8);
    expect(stepsForPlan(undefined)).toBe(4);
    expect(stepsForPlan("mystery")).toBe(4);
  });
});

describe("generateBrandImage", () => {
  function mockImage() {
    const b64 = Buffer.from("img").toString("base64");
    global.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ result: { image: b64 } }), {
        status: 200,
        headers: { "content-type": "application/json" },
      })
    );
  }

  it("targets the FLUX model with plan steps and mapped dimensions", async () => {
    mockImage();
    await generateBrandImage("a logo", { plan: "agency", size: "story" });

    const [url, init] = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(url).toContain(encodeURI(FLUX_MODEL));
    const body = JSON.parse(init.body as string);
    expect(body).toMatchObject({ prompt: "a logo", steps: 8, width: 768, height: 1344 });
  });

  it("defaults to a square at free-tier steps", async () => {
    mockImage();
    await generateBrandImage("a poster");
    const [, init] = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    const body = JSON.parse(init.body as string);
    expect(body).toMatchObject({ steps: 4, width: 1024, height: 1024 });
  });

  it("passes a seed through when given", async () => {
    mockImage();
    await generateBrandImage("x", { seed: 42 });
    const [, init] = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(JSON.parse(init.body as string).seed).toBe(42);
  });
});
