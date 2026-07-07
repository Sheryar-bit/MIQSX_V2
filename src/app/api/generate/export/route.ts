import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import sharp from "sharp";
import JSZip from "jszip";

const MAX_BYTES = 15 * 1024 * 1024; // 15 MB cap on the source image

// SSRF guard: the app only ever exports its own generated images, which are
// `data:` URLs. We also allow a tight https allowlist of image CDNs. Anything
// else (arbitrary http(s), internal IPs, file://) is rejected so the server
// never fetches a URL an attacker controls.
const ALLOWED_HOSTS = ["fal.media", "imagedelivery.net", "res.cloudinary.com"];

function isAllowedImageUrl(url: string): boolean {
  if (url.startsWith("data:image/")) return true;
  try {
    const u = new URL(url);
    if (u.protocol !== "https:") return false;
    const host = u.hostname.toLowerCase();
    return ALLOWED_HOSTS.some((h) => host === h || host.endsWith(`.${h}`));
  } catch {
    return false;
  }
}

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
  if (!imageUrl || typeof imageUrl !== "string") {
    return NextResponse.json({ error: "imageUrl required" }, { status: 400 });
  }
  if (!isAllowedImageUrl(imageUrl)) {
    return NextResponse.json({ error: "Unsupported image source." }, { status: 400 });
  }
  if (imageUrl.length > MAX_BYTES * 2) {
    // base64 is ~1.37x the byte size; this is a generous string-length ceiling.
    return NextResponse.json({ error: "Image too large." }, { status: 413 });
  }

  // Fetch the (validated) source image.
  const srcResponse = await fetch(imageUrl);
  if (!srcResponse.ok) return NextResponse.json({ error: "Could not fetch image" }, { status: 400 });
  const srcBuffer = Buffer.from(await srcResponse.arrayBuffer());
  if (srcBuffer.byteLength > MAX_BYTES) {
    return NextResponse.json({ error: "Image too large." }, { status: 413 });
  }

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
