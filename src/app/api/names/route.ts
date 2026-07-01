import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { groq, MODELS } from "@/lib/groq";
import { connectDB } from "@/lib/mongoose";
import Brand from "@/models/Brand";
import { requireBrandAccess } from "@/lib/org-context";
import dns from "dns/promises";

async function checkDomain(domain: string): Promise<boolean> {
  try {
    await dns.resolve(domain);
    return false; // Resolves → taken
  } catch {
    return true; // NXDOMAIN or error → available
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { brandId, keywords, industry, style } = await req.json();

  await connectDB();
  let brand: Record<string, unknown> | null = null;
  let orgId: string | undefined;
  if (brandId) {
    const access = await requireBrandAccess(session, brandId, "editor");
    if (!access.ok) return access.response;
    orgId = access.ctx.orgId;
    brand = await Brand.findOne({ _id: brandId, orgId }).lean() as Record<string, unknown> | null;
  }

  const dnaContext = brand && (brand as { dna?: object }).dna
    ? `Brand DNA context: ${JSON.stringify((brand as { dna?: object }).dna)}`
    : "";

  const prompt = `You are a brand naming expert with deep knowledge of the Pakistani and global market.

${dnaContext}
Additional keywords: ${keywords || "none"}
Industry: ${industry || (brand as { industry?: string } | null)?.industry || "general"}
Naming style preference: ${style || "modern, memorable"}

Generate exactly 10 unique brand name suggestions. For each:
- The name must be 1-3 words max
- Memorable, distinct, and brandable
- Consider Urdu/Roman Urdu adaptations if culturally relevant
- Avoid generic words

Return ONLY valid JSON array:
[
  {
    "name": "BrandName",
    "rationale": "Brief 1-sentence reason why this name works",
    "type": "invented|descriptive|evocative|founder|acronym"
  }
]`;

  const completion = await groq.chat.completions.create({
    model: MODELS.text,
    messages: [{ role: "user", content: prompt }],
    max_tokens: 1000,
    temperature: 0.9,
  });

  const raw = completion.choices[0].message.content || "[]";
  const jsonMatch = raw.match(/\[[\s\S]*\]/);
  if (!jsonMatch) return NextResponse.json({ error: "AI generation failed" }, { status: 500 });

  const names: Array<{ name: string; rationale: string; type: string }> = JSON.parse(jsonMatch[0]);

  // Check domain availability in parallel
  const withAvailability = await Promise.all(
    names.map(async (n) => {
      const slug = n.name.toLowerCase().replace(/[^a-z0-9]/g, "");
      const [domainCom, domainPk] = await Promise.all([
        checkDomain(`${slug}.com`),
        checkDomain(`${slug}.pk`),
      ]);
      return { ...n, domainCom: { available: domainCom, checked: true }, domainPk: { available: domainPk, checked: true } };
    })
  );

  // Save to brand if associated
  if (brandId) {
    await Brand.findOneAndUpdate({ _id: brandId, orgId }, { $set: { generatedNames: withAvailability } });
  }

  return NextResponse.json({ names: withAvailability });
}
