import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { groq, MODELS } from "@/lib/groq";
import { connectDB } from "@/lib/mongoose";
import Brand from "@/models/Brand";

const SYSTEM_PROMPT = `You are the MIQSX AI Brand Strategist — a world-class brand consultant who helps businesses discover their Brand DNA through a conversational interview. Your job is to guide the user through a structured but natural conversation.

You ask ONE question at a time. You are warm, insightful, and occasionally witty. You speak conversationally, not like a form.

The interview follows this arc (10 phases):
1. Brand name + what it means to the founder
2. Industry / niche / market
3. Target customer — who they are, their pain
4. The unique difference — what makes this brand different
5. Brand personality — 3 words, if it were a person
6. Brand voice — how it speaks (formal/casual/witty/bold/warm)
7. What the brand NEVER is — the anti-brand, the donts
8. Visual taste — favorite brand references aesthetically
9. Color direction — existing colors or open to suggestions
10. Mission — one sentence why this brand exists

After phase 10, synthesize everything into a JSON Brand DNA object and output it wrapped in triple backticks with the tag BRAND_DNA_JSON.

Rules:
- Always acknowledge the user's previous answer thoughtfully before asking the next question
- For Pakistani/Urdu market brands, be culturally aware. Ask about Urdu/Roman Urdu needs if relevant
- If an answer is unclear, ask a quick clarifying follow-up before moving on
- Keep messages under 120 words
- Never ask multiple questions at once`;

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { brandId, message, history } = await req.json();

  // Demo mode: run in memory when MongoDB is not connected or brandId is "DEMO"
  let brand: { _id: string; chatHistory: unknown[] } | null = null;
  const demoMode = brandId === "DEMO" || !process.env.MONGODB_URI;

  if (!demoMode) {
    try {
      await connectDB();
      brand = await Brand.findOne({ _id: brandId, userId: session.user.id });
      if (!brand) return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    } catch {
      // MongoDB not available — fall through to demo mode
    }
  }

  const messages = [
    { role: "system" as const, content: SYSTEM_PROMPT },
    ...(history || []).map((m: { role: string; content: string }) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
    { role: "user" as const, content: message },
  ];

  const stream = await groq.chat.completions.create({
    model: MODELS.text,
    messages,
    stream: true,
    max_tokens: 400,
    temperature: 0.8,
  });

  const encoder = new TextEncoder();
  let fullResponse = "";

  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content || "";
        if (text) {
          fullResponse += text;
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
        }
      }

      // Check if Brand DNA was synthesized
      const dnaMatch = fullResponse.match(/```BRAND_DNA_JSON\n?([\s\S]*?)```/);
      if (dnaMatch) {
        try {
          const dna = JSON.parse(dnaMatch[1]);
          if (!demoMode && brand) {
            await Brand.findByIdAndUpdate(brandId, {
              $set: {
                dna,
                onboardingComplete: true,
                status: "active",
                chatHistory: [
                  ...((brand.chatHistory as unknown[]) || []),
                  { role: "user", content: message },
                  { role: "assistant", content: fullResponse },
                ],
              },
            });
          }
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ dnaComplete: true, dna })}\n\n`));
        } catch (e) {
          console.error("DNA parse error", e);
        }
      } else if (!demoMode && brand) {
        // Save ongoing chat history (skip in demo mode)
        await Brand.findByIdAndUpdate(brandId, {
          $push: {
            chatHistory: [
              { role: "user", content: message },
              { role: "assistant", content: fullResponse },
            ],
          },
          $inc: { onboardingStep: 1 },
        });
      }

      controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      controller.close();
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
