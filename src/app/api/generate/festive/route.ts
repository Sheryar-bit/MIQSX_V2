import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { enforceLimit } from "@/lib/usage";
import { trackEvent } from "@/lib/analytics";
import { generateBrandImage, isCloudflareConfigured, NsfwPromptError, FLUX_MODEL } from "@/lib/imagegen";

type Festival = "eid" | "ramadan" | "independence" | "new-year";

const VALID_FESTIVALS: Festival[] = ["eid", "ramadan", "independence", "new-year"];

// Rich FLUX prompts per festival. Brand name + greeting text are quoted so FLUX
// renders them legibly on a festive, share-ready poster.
const FESTIVE_PROMPTS: Record<Festival, (brand: string, color: string) => string> = {
  eid: (b, c) =>
    `A premium Eid Mubarak greeting poster with the large headline text "Eid Mubarak" and the brand name "${b}". Crescent moon and stars, elegant Islamic geometric patterns and arabesque ornaments, glowing lanterns, luxurious gold and ${c} color palette, warm festive lighting, high detail, professional social media post design.`,
  ramadan: (b, c) =>
    `A premium Ramadan Kareem greeting poster with the headline text "Ramadan Kareem" and the brand name "${b}". Ornate hanging lanterns, crescent moon, mosque silhouette, scattered stars, deep purple and gold with ${c} accents, intricate Islamic patterns, serene festive atmosphere, high detail, professional social media post design.`,
  independence: (b, c) =>
    `A patriotic Pakistan Independence Day (14 August) poster with the headline text "Happy Independence Day" and the brand name "${b}". Pakistan flag colors deep green and white, crescent and star emblem, flags and bunting, fireworks, proud national celebration theme, ${c} accents, high detail, professional social media post design.`,
  "new-year": (b, c) =>
    `A vibrant Happy New Year celebration poster with the headline text "Happy New Year" and the brand name "${b}". Fireworks bursting in the night sky, confetti, sparkles, festive countdown atmosphere, ${c} and gold color palette, energetic celebratory design, high detail, professional social media post design.`,
};

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!isCloudflareConfigured()) {
    return NextResponse.json(
      { error: "Cloudflare Workers AI not configured. Add CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN to .env.local" },
      { status: 503 }
    );
  }

  const { festival, brandName = "Brand", primaryColor = "#7C3AED", size = "square" } = await req.json();

  if (!VALID_FESTIVALS.includes(festival)) {
    return NextResponse.json(
      { error: "Invalid festival. Choose: eid, ramadan, independence, new-year" },
      { status: 400 }
    );
  }

  const limited = await enforceLimit(session.user.id, "festive");
  if (limited) return limited;

  const prompt = FESTIVE_PROMPTS[festival as Festival](String(brandName).trim() || "Brand", primaryColor);
  const plan = session.user.plan ?? "free";

  try {
    const imageUrl = await generateBrandImage(prompt, {
      plan,
      size: size === "story" ? "story" : "square",
    });

    await trackEvent({ userId: session.user.id, feature: "festive", event: "festive.generated", step: 2 });
    return NextResponse.json({ imageUrl, festival, prompt, model: FLUX_MODEL });
  } catch (err) {
    if (err instanceof NsfwPromptError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error("[FESTIVE]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Festive generation failed" },
      { status: 500 }
    );
  }
}
