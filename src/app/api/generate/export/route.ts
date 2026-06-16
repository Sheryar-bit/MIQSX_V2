import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import sharp from "sharp";
import JSZip from "jszip";

const EXPORT_FORMATS = [
  { name: "Instagram Post", slug: "instagram-post", w: 1080, h: 1080 },
  { name: "Instagram Story", slug: "instagram-story", w: 1080, h: 1920 },
  { name: "Facebook Cover", slug: "facebook-cover", w: 820, h: 312 },
  { name: "LinkedIn Banner", slug: "linkedin-banner", w: 1584, h: 396 },
  { name: "Twitter Header", slug: "twitter-header", w: 1500, h: 500 },
  { name: "YouTube Thumbnail", slug: "youtube-thumb", w: 1280, h: 720 },
  { name: "WhatsApp DP", slug: "whatsapp-dp", w: 500, h: 500 },
];

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { imageUrl, formats } = await req.json();
  if (!imageUrl) return NextResponse.json({ error: "imageUrl required" }, { status: 400 });

  // Download source image
  const srcResponse = await fetch(imageUrl);
  if (!srcResponse.ok) return NextResponse.json({ error: "Could not fetch image" }, { status: 400 });
  const srcBuffer = Buffer.from(await srcResponse.arrayBuffer());

  const selectedFormats = formats
    ? EXPORT_FORMATS.filter((f) => formats.includes(f.slug))
    : EXPORT_FORMATS;

  const zip = new JSZip();

  await Promise.all(
    selectedFormats.map(async (fmt) => {
      const resized = await sharp(srcBuffer)
        .resize(fmt.w, fmt.h, { fit: "cover", position: "centre" })
        .jpeg({ quality: 92 })
        .toBuffer();
      zip.file(`${fmt.slug}-${fmt.w}x${fmt.h}.jpg`, resized);
    })
  );

  const zipBuffer = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });

  return new Response(new Uint8Array(zipBuffer), {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": 'attachment; filename="social-media-kit.zip"',
    },
  });
}

// GET: return the format list
export async function GET() {
  return NextResponse.json({ formats: EXPORT_FORMATS });
}
