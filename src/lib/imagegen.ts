// Shared brand image-generation mechanics used by the imagery, logo, and
// festive routes. Wraps the low-level Cloudflare Workers AI client with the
// app's model choice, plan-gated quality, and named aspect ratios so every
// feature produces consistent FLUX output.
import { generateImage, isCloudflareConfigured } from "./cloudflare";

export { isCloudflareConfigured };

// FLUX.1 [schnell] — the strongest Workers AI model for legible text and prompt
// adherence (the SDXL family garbles letters).
export const FLUX_MODEL = "@cf/black-forest-labs/flux-1-schnell";

// Quality is plan-gated via inference steps (schnell supports up to 8).
const STEPS_BY_PLAN: Record<string, number> = {
  free: 4,
  pro: 6,
  agency: 8,
};

export function stepsForPlan(plan?: string): number {
  return STEPS_BY_PLAN[plan ?? "free"] ?? STEPS_BY_PLAN.free;
}

export type ImageSize = "square" | "landscape" | "portrait" | "story";

// Pixel dimensions (multiples of 64) for each aspect ratio. FLUX honors these.
const SIZE_MAP: Record<ImageSize, { width: number; height: number }> = {
  square: { width: 1024, height: 1024 },
  landscape: { width: 1024, height: 768 },
  portrait: { width: 768, height: 1024 },
  story: { width: 768, height: 1344 },
};

export interface BrandImageOptions {
  plan?: string;
  size?: ImageSize;
  /** Optional seed for reproducibility / forcing variety across a batch. */
  seed?: number;
}

/**
 * Generate a single brand image with FLUX. Returns a data: URL. Throws if
 * Workers AI is not configured or the request fails (callers should guard with
 * isCloudflareConfigured() first for a friendly 503).
 */
export async function generateBrandImage(
  prompt: string,
  opts: BrandImageOptions = {}
): Promise<string> {
  const dims = SIZE_MAP[opts.size ?? "square"] ?? SIZE_MAP.square;
  return generateImage(FLUX_MODEL, {
    prompt,
    width: dims.width,
    height: dims.height,
    steps: stepsForPlan(opts.plan),
    seed: opts.seed,
  });
}
