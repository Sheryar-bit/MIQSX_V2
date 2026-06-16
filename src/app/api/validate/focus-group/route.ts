import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { groq, MODELS } from "@/lib/groq";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { content, assetType, brandDNA } = await req.json();
  if (!content) return NextResponse.json({ error: "content required" }, { status: 400 });

  const audienceHint = brandDNA?.audience
    ? `Target audience: ${brandDNA.audience.primaryAge || "25-35"} ${brandDNA.audience.primaryGender || "mixed"} in ${brandDNA.audience.primaryLocation || "Pakistan"}, interested in ${brandDNA.audience.primaryInterests?.join(", ") || "lifestyle, tech"}.`
    : "Target audience: Pakistani consumers aged 22-40, urban, digitally active.";

  const prompt = `You are a Pakistani market research facilitator. ${audienceHint}

Generate a realistic AI Focus Group of 5 diverse Pakistani consumers reacting to this ${assetType || "brand asset"}:

"${content}"

Each persona must be a real-feeling Pakistani individual with:
- A common Pakistani name
- Age, city, occupation
- Their authentic gut reaction (honest, not all positive)
- A specific score out of 10
- One memorable quote they would say
- One actionable suggestion

Return a JSON object with this structure:
{
  "personas": [
    {
      "name": "...",
      "age": <number>,
      "city": "...",
      "occupation": "...",
      "background": "One sentence about who they are",
      "reaction": "Their detailed reaction (2-3 sentences, candid and realistic)",
      "score": <1-10 number>,
      "quote": "A memorable quote they would say",
      "suggestion": "One specific actionable suggestion"
    }
  ],
  "groupConsensus": "What the group broadly agrees on",
  "averageScore": <calculated average>,
  "topConcern": "The most common concern raised",
  "topStrength": "The most praised element",
  "recommendation": "Final research recommendation"
}

Make personas diverse: include different cities (Karachi, Lahore, Islamabad, Peshawar, smaller cities), ages, genders, and economic backgrounds. Some should be positive, some neutral, some critical.`;

  const completion = await groq.chat.completions.create({
    model: MODELS.text,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.8,
    max_tokens: 2000,
    response_format: { type: "json_object" },
  });

  let result;
  try {
    result = JSON.parse(completion.choices[0]?.message?.content || "{}");
  } catch {
    return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
  }

  return NextResponse.json(result);
}
