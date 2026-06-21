import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { groq, MODELS } from "@/lib/groq";
import { trackEvent } from "@/lib/analytics";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { conversation } = await req.json();
  if (!conversation || conversation.trim().length < 20) {
    return NextResponse.json({ error: "conversation text required" }, { status: 400 });
  }

  const prompt = `You are a Pakistani creative agency's brief extraction specialist. You receive messy WhatsApp conversations between clients and agencies — often a mix of English, Urdu, and Roman Urdu — and extract a clean, structured project brief.

WHATSAPP CONVERSATION:
---
${conversation}
---

Extract all relevant project information, even from casual language. Pakistani clients often say things like:
- "bhai ek logo chahiye" → logo design required
- "green color rakho" → brand color preference: green
- "budget tight hai" → budget is limited
- "kal tak chahiye" → deadline: tomorrow
- "premium lagni chahiye" → brand should feel premium
- "fashion industry mein hain" → fashion industry

Also identify:
- Contradictions (e.g., "simple logo chahiye" but also "bahut saari cheezein add karo")
- Missing info (what crucial details were never mentioned)
- Implied preferences (context clues about their taste/style)

Return a JSON object with this structure:
{
  "projectTitle": "Suggested project name",
  "clientName": "Name if mentioned",
  "projectType": "Logo design" | "Brand identity" | "Social media" | "Website" | "Marketing campaign" | etc,
  "industry": "Client's industry",
  "deliverables": ["List of what they want"],
  "colors": {
    "mentioned": ["colors they specified"],
    "implied": ["colors implied by their preferences/industry"]
  },
  "style": {
    "adjectives": ["words describing the desired look/feel"],
    "references": ["any brands or examples they mentioned"]
  },
  "targetAudience": "Description of their target customer",
  "budget": {
    "mentioned": true/false,
    "amount": "Amount if mentioned or null",
    "flexibility": "tight" | "flexible" | "unknown"
  },
  "deadline": {
    "mentioned": true/false,
    "date": "Date if mentioned or null",
    "urgency": "urgent" | "normal" | "flexible"
  },
  "contradictions": [
    {
      "issue": "What contradicts",
      "messageA": "First conflicting statement",
      "messageB": "Second conflicting statement",
      "recommendation": "How to resolve"
    }
  ],
  "missingInfo": [
    {
      "field": "What info is missing",
      "question": "Question to ask the client"
    }
  ],
  "impliedPreferences": ["Inferred preferences from context"],
  "redFlags": ["Any concerns or scope creep risks"],
  "clarificationPriority": ["Top 3 questions to ask the client first, in order of importance"],
  "structuredBrief": "A clean, professional 2-3 paragraph brief written as if for an internal creative team",
  "language": "en" | "mixed" | "ur"
}`;

  const completion = await groq.chat.completions.create({
    model: MODELS.text,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3,
    max_tokens: 2500,
    response_format: { type: "json_object" },
  });

  let result;
  try {
    result = JSON.parse(completion.choices[0]?.message?.content || "{}");
  } catch {
    return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
  }

  await trackEvent({ userId: session.user.id, feature: "brief", event: "brief.parsed", step: 4 });
  return NextResponse.json(result);
}
