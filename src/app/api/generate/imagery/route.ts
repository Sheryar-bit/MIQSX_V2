import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { enforceLimit } from "@/lib/usage";
import { trackEvent } from "@/lib/analytics";
import { generateBrandImage, isCloudflareConfigured, NsfwPromptError, FLUX_MODEL, type ImageSize } from "@/lib/imagegen";

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

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!isCloudflareConfigured()) {
    return NextResponse.json(
      {
        error:
          "Cloudflare Workers AI not configured. Add CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN to .env.local",
      },
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

  // Lead with the user's own request so quoted poster text isn't buried behind
  // the style prefix, then layer style + brand hints as trailing modifiers.
  const fullPrompt = `${prompt.trim()}. ${stylePrefix} ${colorHint} ${keywordHint} Professional brand imagery, high quality, sharp details.`.trim();

  const plan = session.user.plan ?? "free";

  try {
    const imageUrl = await generateBrandImage(fullPrompt, { plan, size: size as ImageSize });

    await trackEvent({ userId: session.user.id, feature: "imagery", event: "imagery.generated", step: 2 });
    return NextResponse.json({
      imageUrl,
      prompt: fullPrompt,
      style,
      model: FLUX_MODEL,
    });
  } catch (err) {
    if (err instanceof NsfwPromptError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error("[IMAGERY]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Image generation failed" },
      { status: 500 }
    );
  }
}
