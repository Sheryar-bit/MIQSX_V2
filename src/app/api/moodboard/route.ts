import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { groq, MODELS } from "@/lib/groq";
import { connectDB } from "@/lib/mongoose";
import Brand from "@/models/Brand";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const formData = await req.formData();
    const brandId = formData.get("brandId") as string | null;
    const files = formData.getAll("images") as File[];

    if (files.length < 2) {
      return NextResponse.json({ error: "Upload at least 2 inspiration images" }, { status: 400 });
    }

    const imageContents = await Promise.all(
      files.slice(0, 5).map(async (file) => {
        const buf = await file.arrayBuffer();
        const base64 = Buffer.from(buf).toString("base64");
        return {
          type: "image_url" as const,
          image_url: { url: `data:${file.type};base64,${base64}` },
        };
      })
    );

    const completion = await groq.chat.completions.create({
      model: MODELS.vision,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `You are a visual brand analyst. Analyze these ${files.length} inspiration/moodboard images to extract the shared design DNA.

Identify what these images have in common visually — the user loves all of them, so extract their shared visual language.

Return ONLY valid JSON:
{
  "stylePersonality": "2-3 word overall style (e.g., 'Bold Minimalist', 'Warm Artisan', 'Clean Tech')",
  "colorPalette": {
    "primary": "#hex",
    "secondary": "#hex",
    "accent": "#hex",
    "neutrals": ["#hex", "#hex"]
  },
  "typographyFeel": "Description of typography preference (e.g., 'Strong geometric sans-serif with generous spacing')",
  "visualKeywords": ["word1", "word2", "word3", "word4", "word5"],
  "moodDescriptors": ["adjective1", "adjective2", "adjective3"],
  "layoutStyle": "Description of composition/layout preference",
  "brandArchetype": "One of: Sage, Hero, Creator, Explorer, Rebel, Lover, Jester, Caregiver, Ruler, Innocent, Magician, Everyman",
  "summary": "2-sentence summary of what these images say about the user's brand taste"
}`,
            },
            ...imageContents,
          ],
        },
      ],
      max_tokens: 800,
      temperature: 0.4,
    });

    const raw = completion.choices[0].message.content || "{}";
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    const result = jsonMatch ? JSON.parse(jsonMatch[0]) : {};

    // Merge into Brand DNA if associated
    if (brandId) {
      await connectDB();
      await Brand.findOneAndUpdate(
        { _id: brandId, userId: session.user.id },
        {
          $set: {
            "dna.colors": result.colorPalette,
            "dna.style.keywords": result.visualKeywords,
            "dna.style.moodDescriptors": result.moodDescriptors,
          },
        }
      );
    }

    return NextResponse.json({ result });
  } catch (err) {
    console.error("[MOODBOARD]", err);
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}
