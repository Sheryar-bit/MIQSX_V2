import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { generateImage, isCloudflareConfigured } from "@/lib/cloudflare";

const ORIGINAL_FETCH = global.fetch;

beforeEach(() => {
  process.env.CLOUDFLARE_ACCOUNT_ID = "acct_123";
  process.env.CLOUDFLARE_API_TOKEN = "token_abc";
});

afterEach(() => {
  global.fetch = ORIGINAL_FETCH;
  vi.restoreAllMocks();
});

describe("isCloudflareConfigured", () => {
  it("is true when both env vars are present", () => {
    expect(isCloudflareConfigured()).toBe(true);
  });

  it("is false when a credential is missing or empty", () => {
    process.env.CLOUDFLARE_API_TOKEN = "";
    expect(isCloudflareConfigured()).toBe(false);
    delete process.env.CLOUDFLARE_ACCOUNT_ID;
    expect(isCloudflareConfigured()).toBe(false);
  });
});

describe("generateImage", () => {
  it("normalizes a binary PNG response into a data URL", async () => {
    const bytes = new Uint8Array([137, 80, 78, 71, 1, 2, 3]); // PNG magic + payload
    global.fetch = vi.fn().mockResolvedValue(
      new Response(bytes, { status: 200, headers: { "content-type": "image/png" } })
    );

    const url = await generateImage("@cf/test/model", {
      prompt: "a cat",
      width: 1024,
      height: 1024,
      steps: 6,
    });

    expect(url).toBe(`data:image/png;base64,${Buffer.from(bytes).toString("base64")}`);

    const [calledUrl, init] = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(calledUrl).toBe(
      "https://api.cloudflare.com/client/v4/accounts/acct_123/ai/run/@cf/test/model"
    );
    expect((init.headers as Record<string, string>).Authorization).toBe("Bearer token_abc");
    const body = JSON.parse(init.body as string);
    expect(body).toMatchObject({ prompt: "a cat", width: 1024, height: 1024, num_steps: 6 });
  });

  it("normalizes a JSON/base64 response (flux-style) into a data URL and uses `steps`", async () => {
    const b64 = Buffer.from("fake-jpeg").toString("base64");
    global.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ result: { image: b64 } }), {
        status: 200,
        headers: { "content-type": "application/json" },
      })
    );

    const url = await generateImage("@cf/black-forest-labs/flux-1-schnell", {
      prompt: "a dog",
      steps: 8,
      negativePrompt: "blurry",
    });
    expect(url).toBe(`data:image/jpeg;base64,${b64}`);

    const [, init] = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    const body = JSON.parse(init.body as string);
    // FLUX uses `steps`, not `num_steps`, and ignores negative_prompt.
    expect(body.steps).toBe(8);
    expect(body.num_steps).toBeUndefined();
    expect(body.negative_prompt).toBeUndefined();
  });

  it("raises a clear auth error on 401/403", async () => {
    global.fetch = vi.fn().mockResolvedValue(
      new Response("denied", { status: 401, headers: { "content-type": "text/plain" } })
    );
    await expect(generateImage("@cf/test/model", { prompt: "x" })).rejects.toThrow(
      /authentication failed/i
    );
  });

  it("throws with status detail when Workers AI returns an error", async () => {
    global.fetch = vi.fn().mockResolvedValue(
      new Response("model not found", { status: 404, headers: { "content-type": "text/plain" } })
    );

    await expect(generateImage("@cf/bad/model", { prompt: "x" })).rejects.toThrow(/404/);
  });

  it("throws when credentials are missing", async () => {
    delete process.env.CLOUDFLARE_ACCOUNT_ID;
    await expect(generateImage("@cf/test/model", { prompt: "x" })).rejects.toThrow(/not configured/);
  });
});
