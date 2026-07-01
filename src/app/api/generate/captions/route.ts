import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { groq, MODELS } from "@/lib/groq";
import { enforceOrgLimit } from "@/lib/org-context";
import { trackEvent } from "@/lib/analytics";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { topic, platform, brandName, tone, audience, postType } = await req.json();

  if (!topic) return NextResponse.json({ error: "Post topic required" }, { status: 400 });

  const gate = await enforceOrgLimit(session, "captions");
  if (!gate.ok) return gate.response;

  const platformGuide: Record<string, string> = {
    instagram: "Instagram (2200 char max, emojis welcome, 3–5 hashtags)",
    facebook: "Facebook (natural, storytelling, can be longer)",
    linkedin: "LinkedIn (professional tone, no excessive emojis, value-driven)",
    twitter: "X/Twitter (280 chars, punchy, conversational)",
    whatsapp: "WhatsApp Status (short, personal, conversational)",
  };
  const platformStr = platformGuide[platform] || platform || "Instagram";

  const prompt = `You are a bilingual Pakistani social media copywriter. Write captions for this post in THREE versions.

Brand: ${brandName || "the brand"}
Post topic: ${topic}
Platform: ${platformStr}
Post type: ${postType || "general"}
Brand tone: ${tone?.join(", ") || "professional but warm"}
Target audience: ${audience || "Pakistani audience, mixed Urdu/English speakers"}

Write THREE versions:
1. ENGLISH — fluent, brand-voice-appropriate, with relevant emojis and hashtags
2. URDU — proper Urdu script (اردو), same message, culturally adapted (not a direct translation — make it feel native). Use appropriate Urdu idioms.
3. ROMAN URDU — same vibe in Roman Urdu (Urdu words in English letters), casual, how Pakistanis actually text. Mix in some English words naturally.

Return ONLY valid JSON, no other text:
{
  "english": {
    "caption": "full caption text with hashtags",
    "hashtags": ["#tag1", "#tag2"],
    "charCount": 120
  },
  "urdu": {
    "caption": "اردو کیپشن یہاں",
    "note": "Cultural adaptation note"
  },
  "romanUrdu": {
    "caption": "Roman Urdu caption yahan",
    "note": "Tone note"
  }
}`;

  try {
    const completion = await groq.chat.completions.create({
      model: MODELS.text,
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1000,
      temperature: 0.85,
    });

    const raw = completion.choices[0].message.content || "{}";
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON in response");

    const captions = JSON.parse(jsonMatch[0]);
    await trackEvent({ userId: session.user.id, orgId: gate.orgId, feature: "captions", event: "captions.generated", step: 2 });
    return NextResponse.json({ captions });
  } catch (err) {
    console.error("[CAPTIONS]", err);
    return NextResponse.json({ error: "Caption generation failed" }, { status: 500 });
  }
}
