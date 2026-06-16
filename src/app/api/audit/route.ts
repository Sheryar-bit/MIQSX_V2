import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { groq, MODELS } from "@/lib/groq";
import { connectDB } from "@/lib/mongoose";
import Brand from "@/models/Brand";
import { enforceLimit } from "@/lib/usage";
import { trackEvent } from "@/lib/analytics";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const formData = await req.formData();
    const brandId = formData.get("brandId") as string;
    const files = formData.getAll("images") as File[];

    if (!files.length) {
      return NextResponse.json({ error: "Please upload at least one image" }, { status: 400 });
    }

    const limited = await enforceLimit(session.user.id, "audit");
    if (limited) return limited;

    await connectDB();
    const brand = await Brand.findOne({ _id: brandId, userId: session.user.id }).lean();

    // Convert images to base64 for vision model
    const imageContents = await Promise.all(
      files.slice(0, 6).map(async (file) => {
        const buf = await file.arrayBuffer();
        const base64 = Buffer.from(buf).toString("base64");
        return {
          type: "image_url" as const,
          image_url: { url: `data:${file.type};base64,${base64}` },
        };
      })
    );

    const brandDNAContext = brand && (brand as { dna?: object }).dna
      ? `The brand's known DNA: ${JSON.stringify((brand as { dna?: object }).dna, null, 2)}`
      : "No existing Brand DNA — analyze purely from the uploaded assets.";

    const completion = await groq.chat.completions.create({
      model: MODELS.vision,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `You are a brand consistency auditor. Analyze these ${files.length} brand asset image(s) and produce a brand audit report.

${brandDNAContext}

Evaluate:
1. Color consistency (0-100): Are the same colors used across all assets?
2. Typography consistency (0-100): Are fonts consistent?
3. Visual style consistency (0-100): Does the overall look feel unified?
4. Overall brand score (0-100): Weighted average

Return ONLY valid JSON in this exact format:
{
  "overallScore": 72,
  "colorScore": 80,
  "typographyScore": 65,
  "styleScore": 70,
  "detectedColors": ["#FF5733", "#2C3E50"],
  "detectedFonts": ["Appears to use a sans-serif", "One asset uses serif"],
  "violations": [
    {"type": "Color", "description": "Asset 3 uses a blue not present in others", "severity": "high"},
    {"type": "Typography", "description": "Two different font weights used inconsistently", "severity": "medium"}
  ],
  "strengths": ["Strong consistent logo usage", "Good whitespace discipline"],
  "recommendations": ["Standardize to 2 fonts maximum", "Create a color palette guide"]
}`,
            },
            ...imageContents,
          ],
        },
      ],
      max_tokens: 1200,
      temperature: 0.3,
    });

    const raw = completion.choices[0].message.content || "{}";
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    const result = jsonMatch ? JSON.parse(jsonMatch[0]) : {};

    // Persist audit results
    if (brandId) {
      await Brand.findByIdAndUpdate(brandId, {
        $set: {
          auditScore: result.overallScore,
          auditViolations: result.violations || [],
          auditLastRun: new Date(),
        },
      });
    }

    await trackEvent({ userId: session.user.id, feature: "audit", event: "audit.run", step: 1, brandId: brandId || undefined });
    return NextResponse.json({ audit: result });
  } catch (err) {
    console.error("[AUDIT]", err);
    return NextResponse.json({ error: "Audit failed. Check your images and try again." }, { status: 500 });
  }
}
