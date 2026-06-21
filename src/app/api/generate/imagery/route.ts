import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { enforceLimit } from "@/lib/usage";
import { trackEvent } from "@/lib/analytics";

const STYLE_PREFIXES: Record<string, string> = {
  realism: "professional photography, photorealistic, high detail, natural lighting, sharp focus,",
  neon: "neon lights, cyberpunk aesthetic, glowing neon signs, dark moody background, vibrant colors,",
  minimalist: "minimalist design, clean white background, simple elegant composition, negative space, subtle,",
  "vintage-retro": "vintage retro style, film grain, muted warm tones, nostalgic, analog photography feel,",
  "3d-render": "3D render, octane render, CGI, volumetric lighting, photorealistic 3D, high quality render,",
  watercolor: "watercolor painting, soft watercolor washes, artistic, flowing colors, paper texture, hand-painted,",
  "flat-design": "flat design illustration, vector art style, bold solid colors, geometric shapes, clean lines,",
  animated: "2D animation style, cartoon illustration, vibrant bold colors, clean outlines, studio quality,",
};

const SIZE_MAP: Record<string, string> = {
  square: "square_hd",
  landscape: "landscape_4_3",
  portrait: "portrait_4_3",
  story: "portrait_16_9",
};

// Plan-gated model quality: free gets fast FLUX schnell; paid tiers get the
// higher-quality FLUX dev with more inference steps.
const MODEL_BY_PLAN: Record<string, { endpoint: string; steps: number }> = {
  free: { endpoint: "fal-ai/flux/schnell", steps: 4 },
  pro: { endpoint: "fal-ai/flux/dev", steps: 28 },
  agency: { endpoint: "fal-ai/flux/dev", steps: 35 },
};

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const falKey = process.env.FAL_API_KEY;
  if (!falKey || falKey === "your-fal-api-key-here") {
    return NextResponse.json(
      { error: "FAL_KEY not configured. Get a free key at fal.ai and add it to .env.local" },
      { status: 503 }
    );
  }

  const { prompt, style = "realism", brandColors, brandKeywords, size = "square" } = await req.json();
  if (!prompt?.trim()) return NextResponse.json({ error: "Prompt is required" }, { status: 400 });

  const limited = await enforceLimit(session.user.id, "imagery");
  if (limited) return limited;

  const stylePrefix = STYLE_PREFIXES[style] || STYLE_PREFIXES.realism;
  const colorHint = brandColors?.length
    ? `Color palette: ${brandColors.slice(0, 3).join(", ")}.`
    : "";
  const keywordHint = brandKeywords?.length
    ? `Brand style: ${brandKeywords.slice(0, 4).join(", ")}.`
    : "";

  const fullPrompt = `${stylePrefix} ${prompt.trim()}. ${colorHint} ${keywordHint} Professional brand imagery, high quality.`.trim();

  const plan = session.user.plan ?? "free";
  const model = MODEL_BY_PLAN[plan] ?? MODEL_BY_PLAN.free;

  try {
    const response = await fetch(`https://fal.run/${model.endpoint}`, {
      method: "POST",
      headers: {
        Authorization: `Key ${falKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: fullPrompt,
        image_size: SIZE_MAP[size] ?? "square_hd",
        num_inference_steps: model.steps,
        num_images: 1,
        enable_safety_checker: true,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`fal.ai error: ${err}`);
    }

    const data = await response.json();
    const imageUrl = data.images?.[0]?.url;
    if (!imageUrl) throw new Error("No image in response");

    await trackEvent({ userId: session.user.id, feature: "imagery", event: "imagery.generated", step: 2 });
    return NextResponse.json({
      imageUrl,
      prompt: fullPrompt,
      style,
      model: model.endpoint,
      seed: data.seed,
    });
  } catch (err) {
    console.error("[IMAGERY]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Image generation failed" },
      { status: 500 }
    );
  }
}
