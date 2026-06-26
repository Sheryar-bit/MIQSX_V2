// Cloudflare Workers AI — text-to-image generation.
//
// REST API: POST https://api.cloudflare.com/client/v4/accounts/{accountId}/ai/run/{model}
// Auth:     Authorization: Bearer {CLOUDFLARE_API_TOKEN}
//
// Image models return one of two shapes:
//   - raw image bytes (SDXL family → image/png)
//   - JSON with a base64-encoded image (flux-1-schnell → { result: { image } })
// We normalize both into a data: URL so the rest of the pipeline (preview <img>,
// download link, and the sharp-based export route's fetch) can treat the result
// like any other image URL without needing object storage.

export interface CloudflareImageInput {
  prompt: string;
  negativePrompt?: string;
  width?: number;
  height?: number;
  /** Inference steps. Maps to the model's `num_steps`. */
  steps?: number;
  guidance?: number;
  seed?: number;
}

const ACCOUNTS_ENDPOINT = "https://api.cloudflare.com/client/v4/accounts";

/** True when both the account id and API token are present (non-empty). */
export function isCloudflareConfigured(): boolean {
  return Boolean(process.env.CLOUDFLARE_ACCOUNT_ID && process.env.CLOUDFLARE_API_TOKEN);
}

/**
 * Run a Workers AI text-to-image model and return the generated image as a
 * data: URL. Throws if Workers AI is not configured or the request fails.
 */
export async function generateImage(
  model: string,
  input: CloudflareImageInput
): Promise<string> {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;
  if (!accountId || !apiToken) {
    throw new Error(
      "Cloudflare Workers AI not configured (set CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN)"
    );
  }

  const isFlux = model.includes("flux");

  const body: Record<string, unknown> = { prompt: input.prompt };
  if (input.negativePrompt && !isFlux) body.negative_prompt = input.negativePrompt;
  if (input.width) body.width = input.width;
  if (input.height) body.height = input.height;
  // FLUX models take `steps` (max 8); the SDXL family takes `num_steps`.
  if (input.steps) body[isFlux ? "steps" : "num_steps"] = input.steps;
  if (input.guidance && !isFlux) body.guidance = input.guidance;
  if (typeof input.seed === "number") body.seed = input.seed;

  const res = await fetch(`${ACCOUNTS_ENDPOINT}/${accountId}/ai/run/${model}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const detail = await res.text();
    if (res.status === 401 || res.status === 403) {
      throw new Error(
        `Cloudflare Workers AI authentication failed (${res.status}). Your CLOUDFLARE_API_TOKEN is invalid or lacks the "Workers AI" permission. ` +
          `Create one at Cloudflare dashboard → My Profile → API Tokens → Create Token → "Workers AI" template (it should be an opaque ~40-char string, not a JWT).`
      );
    }
    throw new Error(`Cloudflare Workers AI error (${res.status}): ${detail.slice(0, 300)}`);
  }

  const contentType = res.headers.get("content-type") ?? "";

  // JSON response (e.g. flux-1-schnell) → { result: { image: "<base64 jpeg>" } }
  if (contentType.includes("application/json")) {
    const json = await res.json();
    const b64 = json?.result?.image;
    if (typeof b64 !== "string" || !b64) {
      throw new Error("Cloudflare Workers AI returned no image");
    }
    return `data:image/jpeg;base64,${b64}`;
  }

  // Binary image response (SDXL family) → raw PNG bytes.
  const buffer = Buffer.from(await res.arrayBuffer());
  if (buffer.length === 0) throw new Error("Cloudflare Workers AI returned an empty image");
  const mime = contentType.startsWith("image/") ? contentType : "image/png";
  return `data:${mime};base64,${buffer.toString("base64")}`;
}
