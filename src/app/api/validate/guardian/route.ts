import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { groq, MODELS } from "@/lib/groq";
import { enforceLimit } from "@/lib/usage";
import { trackEvent } from "@/lib/analytics";

function hexToRgb(hex: string) {
  const clean = hex.replace("#", "");
  return {
    r: parseInt(clean.slice(0, 2), 16),
    g: parseInt(clean.slice(2, 4), 16),
    b: parseInt(clean.slice(4, 6), 16),
  };
}

function colorDistance(hex1: string, hex2: string): number {
  const c1 = hexToRgb(hex1);
  const c2 = hexToRgb(hex2);
  return Math.sqrt((c1.r - c2.r) ** 2 + (c1.g - c2.g) ** 2 + (c1.b - c2.b) ** 2);
}

function wcagLuminance(r: number, g: number, b: number): number {
  const toLinear = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

function contrastRatio(hex1: string, hex2: string): number {
  const c1 = hexToRgb(hex1);
  const c2 = hexToRgb(hex2);
  const l1 = wcagLuminance(c1.r, c1.g, c1.b);
  const l2 = wcagLuminance(c2.r, c2.g, c2.b);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { assetType, content, imageBase64, brandDNA } = body;

  // Validate inputs
  if (!assetType || (!content && !imageBase64)) {
    return NextResponse.json({ error: "assetType and content or imageBase64 required" }, { status: 400 });
  }

  const limited = await enforceLimit(session.user.id, "guardian");
  if (limited) return limited;

  const violations: { category: string; message: string; severity: "high" | "medium" | "low" }[] = [];
  const scores: Record<string, number> = {};

  // --- Color compliance (if image provided with brand DNA) ---
  let colorScore = 85;
  if (imageBase64 && brandDNA?.colors) {
    try {
      const Vibrant = (await import("node-vibrant")).default;
      const buffer = Buffer.from(imageBase64, "base64");
      const palette = await Vibrant.from(buffer).getPalette();
      const extractedColors = Object.values(palette)
        .filter(Boolean)
        .map((swatch) => {
          const [r, g, b] = swatch!.getRgb();
          return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
        });

      const dnaColors = [
        brandDNA.colors.primary,
        brandDNA.colors.secondary,
        brandDNA.colors.accent,
      ].filter(Boolean) as string[];

      let colorMatches = 0;
      for (const extracted of extractedColors) {
        const isClose = dnaColors.some((dna) => colorDistance(extracted, dna) < 60);
        if (isClose) colorMatches++;
      }

      colorScore = extractedColors.length > 0
        ? Math.round((colorMatches / extractedColors.length) * 100)
        : 70;

      if (colorScore < 50) {
        violations.push({
          category: "Color",
          message: "Colors deviate significantly from brand palette",
          severity: "high",
        });
      } else if (colorScore < 75) {
        violations.push({
          category: "Color",
          message: "Some colors don't match the brand palette",
          severity: "medium",
        });
      }

      // WCAG contrast check
      if (dnaColors.length >= 2) {
        const ratio = contrastRatio(dnaColors[0], dnaColors[1]);
        if (ratio < 3) {
          violations.push({
            category: "Accessibility",
            message: `Low contrast ratio: ${ratio.toFixed(1)}:1 (minimum 3:1 for large text, 4.5:1 for normal text)`,
            severity: "high",
          });
        } else if (ratio < 4.5) {
          violations.push({
            category: "Accessibility",
            message: `Contrast ratio ${ratio.toFixed(1)}:1 passes AA large text only. Use stronger contrast for body copy.`,
            severity: "low",
          });
        }
      }
    } catch {
      // node-vibrant unavailable, skip color check
    }
  }
  scores.color = colorScore;

  // --- Tone / text compliance via Groq ---
  const tonePrompt = brandDNA
    ? `You are a brand compliance expert reviewing content against a brand's identity guidelines.

BRAND DNA:
- Tone: ${brandDNA.voice?.tone || "not specified"}
- Personality: ${brandDNA.voice?.personality || "not specified"}
- Keywords: ${brandDNA.voice?.keywords?.join(", ") || "not specified"}
- Avoid: ${brandDNA.voice?.avoid?.join(", ") || "not specified"}
- Target Audience: ${brandDNA.audience?.primaryAge || ""} ${brandDNA.audience?.primaryGender || ""}, ${brandDNA.audience?.primaryLocation || ""}

ASSET TYPE: ${assetType}
CONTENT TO REVIEW:
${content || "[Image uploaded - no text content]"}

Evaluate this content for brand compliance. Return a JSON object with EXACTLY this structure:
{
  "toneScore": <0-100 number>,
  "styleScore": <0-100 number>,
  "violations": [{"category": "...", "message": "...", "severity": "high"|"medium"|"low"}],
  "suggestions": ["...", "..."],
  "summary": "One sentence overall assessment"
}`
    : `You are a brand expert reviewing content for general quality and professionalism.

ASSET TYPE: ${assetType}
CONTENT:
${content || "[Image provided]"}

Return a JSON object with this structure:
{
  "toneScore": <0-100 number>,
  "styleScore": <0-100 number>,
  "violations": [{"category": "...", "message": "...", "severity": "high"|"medium"|"low"}],
  "suggestions": ["...", "..."],
  "summary": "One sentence assessment"
}`;

  const messages: Parameters<typeof groq.chat.completions.create>[0]["messages"] = imageBase64
    ? [
        {
          role: "user",
          content: [
            { type: "text", text: tonePrompt },
            { type: "image_url", image_url: { url: `data:image/png;base64,${imageBase64}` } },
          ],
        },
      ]
    : [{ role: "user", content: tonePrompt }];

  const model = imageBase64 ? MODELS.vision : MODELS.text;

  const completion = await groq.chat.completions.create({
    model,
    messages,
    temperature: 0.3,
    max_tokens: 1000,
    response_format: imageBase64 ? undefined : { type: "json_object" },
  });

  let aiResult = {
    toneScore: 75,
    styleScore: 75,
    violations: [] as typeof violations,
    suggestions: [] as string[],
    summary: "Unable to analyze content",
  };

  try {
    const raw = completion.choices[0]?.message?.content || "";
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) aiResult = JSON.parse(jsonMatch[0]);
  } catch {
    // use defaults
  }

  // Merge violations
  const allViolations = [...violations, ...(aiResult.violations || [])];
  scores.tone = aiResult.toneScore || 75;
  scores.style = aiResult.styleScore || 75;

  // Calculate overall score
  const overall = Math.round(
    (scores.color * 0.35 + scores.tone * 0.35 + scores.style * 0.30)
  );

  // Grade
  const grade =
    overall >= 90 ? "A" :
    overall >= 80 ? "B" :
    overall >= 70 ? "C" :
    overall >= 60 ? "D" : "F";

  await trackEvent({ userId: session.user.id, feature: "guardian", event: "guardian.run", step: 3 });
  return NextResponse.json({
    overall,
    grade,
    scores,
    violations: allViolations,
    suggestions: aiResult.suggestions || [],
    summary: aiResult.summary || "",
  });
}
