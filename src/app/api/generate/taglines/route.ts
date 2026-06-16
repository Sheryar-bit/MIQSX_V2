import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { groq, MODELS } from "@/lib/groq";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { brandName, industry, tone, audience, uniqueValue, count = 8 } = await req.json();

  if (!brandName) return NextResponse.json({ error: "Brand name required" }, { status: 400 });

  const prompt = `You are a world-class brand copywriter. Generate ${count} distinct taglines for this brand.

Brand: ${brandName}
Industry: ${industry || "not specified"}
Tone descriptors: ${tone?.join(", ") || "not specified"}
Target audience: ${audience || "general"}
Unique value: ${uniqueValue || "not specified"}

Rules:
- Each tagline must be 3–8 words max
- Cover different emotional territories: bold, subtle, witty, aspirational, empathetic, minimalist, action-oriented, cultural
- For Pakistani brands, consider a Urdu-inspired phrasing option
- No clichés ("Your trusted partner", "We care", "Excellence in...")
- Be specific to THIS brand, not generic

Return ONLY a JSON array, no other text:
[
  {"tagline": "...", "style": "bold|witty|aspirational|empathetic|minimalist|action|urdu-inspired|cultural", "note": "1-line rationale"},
  ...
]`;

  try {
    const completion = await groq.chat.completions.create({
      model: MODELS.text,
      messages: [{ role: "user", content: prompt }],
      max_tokens: 800,
      temperature: 0.9,
    });

    const raw = completion.choices[0].message.content || "[]";
    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error("No JSON in response");

    const taglines = JSON.parse(jsonMatch[0]);
    return NextResponse.json({ taglines });
  } catch (err) {
    console.error("[TAGLINES]", err);
    return NextResponse.json({ error: "Generation failed" }, { status: 500 });
  }
}
