import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { composeLogoVariants } from "@/lib/logo-composer";
import type { IconName, FontId } from "@/lib/svg-icons";
import type { LogoLayout } from "@/lib/logo-composer";
import { enforceLimit } from "@/lib/usage";
import { trackEvent } from "@/lib/analytics";
import { generateBrandImage, isCloudflareConfigured, NsfwPromptError } from "@/lib/imagegen";

// Number of AI logo concepts produced per request (each with a distinct seed).
const AI_CONCEPT_COUNT = 3;

function buildLogoPrompt(opts: {
  brandName: string;
  description?: string;
  tagline?: string;
  icon?: string;
  primaryColor: string;
  bgColor?: string;
}): string {
  const bg =
    opts.bgColor && opts.bgColor !== "transparent"
      ? `solid ${opts.bgColor} background`
      : "clean plain white background";
  const tag = opts.tagline ? ` with a small tagline "${opts.tagline}"` : "";
  // A free-text description takes creative control; otherwise fall back to the
  // selected icon as the emblem motif.
  const concept = opts.description?.trim()
    ? opts.description.trim()
    : `modern minimalist vector emblem${opts.icon ? ` incorporating a ${opts.icon} symbol` : ""}`;
  return `A professional brand logo design for "${opts.brandName}". ${concept}, featuring the brand name text "${opts.brandName}"${tag}. Primary brand color ${opts.primaryColor}, ${bg}, centered balanced composition, high contrast, crisp clean lines, flat design, iconic and memorable corporate identity, high quality. No photographic background, no clutter.`;
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const {
    brandName,
    tagline,
    icon = "hexagon",
    fontId = "space-grotesk",
    primaryColor = "#7C3AED",
    secondaryColor,
    bgColor,
    layout,
    mode,
    prompt,
  } = body;

  if (!brandName?.trim()) {
    return NextResponse.json({ error: "Brand name is required" }, { status: 400 });
  }

  // AI logo concepts via FLUX — generated alongside (not replacing) the SVG
  // composer. Counts against the same monthly logo quota.
  if (mode === "ai") {
    if (!isCloudflareConfigured()) {
      return NextResponse.json(
        { error: "Cloudflare Workers AI not configured. Add CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN to .env.local" },
        { status: 503 }
      );
    }

    const limited = await enforceLimit(session.user.id, "logo");
    if (limited) return limited;

    const logoPrompt = buildLogoPrompt({
      brandName: brandName.trim(),
      description: prompt,
      tagline,
      icon,
      primaryColor,
      bgColor,
    });
    const plan = session.user.plan ?? "free";

    const results = await Promise.allSettled(
      Array.from({ length: AI_CONCEPT_COUNT }, () =>
        generateBrandImage(logoPrompt, { plan, size: "square", seed: Math.floor(Math.random() * 1_000_000_000) })
      )
    );
    const images = results
      .filter((r): r is PromiseFulfilledResult<string> => r.status === "fulfilled")
      .map((r) => r.value);

    if (images.length === 0) {
      const firstError = results.find((r) => r.status === "rejected") as PromiseRejectedResult | undefined;
      if (firstError?.reason instanceof NsfwPromptError) {
        return NextResponse.json({ error: firstError.reason.message }, { status: 400 });
      }
      console.error("[LOGO/AI]", firstError?.reason);
      return NextResponse.json(
        { error: firstError?.reason instanceof Error ? firstError.reason.message : "AI logo generation failed" },
        { status: 500 }
      );
    }

    await trackEvent({ userId: session.user.id, feature: "logo", event: "logo.ai_generated", step: 2 });
    return NextResponse.json({ images, prompt: logoPrompt });
  }

  const cfg = {
    brandName: brandName.trim(),
    tagline: tagline?.trim() || undefined,
    icon: icon as IconName,
    fontId: fontId as FontId,
    primaryColor,
    secondaryColor,
    bgColor,
  };

  if (layout) {
    const { composeLogo } = await import("@/lib/logo-composer");
    const svg = composeLogo({ ...cfg, layout: layout as LogoLayout });
    return NextResponse.json({ svg, layout });
  }

  const limited = await enforceLimit(session.user.id, "logo");
  if (limited) return limited;

  const variants = composeLogoVariants(cfg);
  await trackEvent({ userId: session.user.id, feature: "logo", event: "logo.generated", step: 2 });
  return NextResponse.json({ variants });
}
