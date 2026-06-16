import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { groq, MODELS } from "@/lib/groq";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { content, assetType, targetRegion, includeUrduCheck } = await req.json();
  if (!content) return NextResponse.json({ error: "content required" }, { status: 400 });

  const prompt = `You are a Pakistani cultural consultant and brand strategist with deep knowledge of:
- Pakistani consumer sensitivities across provinces (Punjab, Sindh, KPK, Balochistan)
- Islamic values and their business implications
- Color psychology in the Pakistani context
- Urdu-English code-switching patterns
- Roman Urdu usage and its pitfalls
- Regional dialects and their connotations
- Pakistani family dynamics and its influence on purchasing
- Local idioms and their reception
- Sensitive topics in Pakistani advertising
- Religious calendar considerations (Ramadan, Eid, etc.)

Review this ${assetType || "brand content"} for cultural appropriateness and effectiveness in the Pakistani market:

CONTENT:
"${content}"

TARGET REGION: ${targetRegion || "Pakistan (all provinces)"}

Analyze for:
1. Religious sensitivity (Islamic values, religious symbols, Ramadan/Eid considerations)
2. Color connotations (green = national/Islamic, white = purity but also mourning, saffron = Hindu, red = auspicious but check context)
3. Urdu/Roman Urdu tone (is it too formal hamdard-style, too casual street-style, or appropriate?)
4. Gender representation and family dynamics
5. Regional inclusivity (does it unintentionally favor one province?)
6. English loanwords (which ones feel natural vs forced in Pakistani context)
7. Local humor and idiom opportunities or risks
8. Economic sensitivity (wealth displays, affordability signals)
9. Political neutrality
10. Class and education level signals in language

${includeUrduCheck ? "Also provide suggested Urdu translation of any English taglines or captions." : ""}

Return a JSON object with this structure:
{
  "overallScore": <0-100>,
  "culturalFit": "excellent" | "good" | "neutral" | "risky" | "problematic",
  "flags": [
    {
      "category": "...",
      "severity": "critical" | "warning" | "suggestion",
      "issue": "What the issue is",
      "explanation": "Why this matters in Pakistani context",
      "fix": "Specific fix suggestion"
    }
  ],
  "strengths": ["..."],
  "opportunities": ["Local cultural hooks you could add"],
  "regionalNotes": {
    "karachi": "How this lands in Karachi",
    "lahore": "How this lands in Lahore",
    "islamabad": "How this lands in Islamabad"
  },
  "urduSuggestion": ${includeUrduCheck ? '"Suggested Urdu version"' : 'null'},
  "romanUrduSuggestion": "Suggested Roman Urdu version (if applicable)",
  "summary": "Overall cultural assessment in 2 sentences"
}`;

  const completion = await groq.chat.completions.create({
    model: MODELS.text,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.4,
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
