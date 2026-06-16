import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import sharp from "sharp";

function wcagLuminance(r: number, g: number, b: number): number {
  const toLinear = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

function contrastRatio(l1: number, l2: number): number {
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { imageBase64, mimeType = "image/png" } = await req.json();
  if (!imageBase64) return NextResponse.json({ error: "imageBase64 required" }, { status: 400 });

  const inputBuffer = Buffer.from(imageBase64, "base64");
  const results: Record<string, string> = {};
  const checks: { name: string; pass: boolean; detail: string }[] = [];

  // --- Original metadata ---
  const meta = await sharp(inputBuffer).metadata();
  const { width = 0, height = 0, format } = meta;

  checks.push({
    name: "Format",
    pass: ["png", "svg", "webp"].includes(format || ""),
    detail: `${format?.toUpperCase() || "Unknown"} — ${width}×${height}px`,
  });

  // --- Favicon simulation (16×16 PNG) ---
  try {
    const favicon = await sharp(inputBuffer)
      .resize(16, 16, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .png()
      .toBuffer();
    results.favicon16 = favicon.toString("base64");
  } catch {
    results.favicon16 = "";
  }

  // --- 32×32 favicon ---
  try {
    const favicon32 = await sharp(inputBuffer)
      .resize(32, 32, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .png()
      .toBuffer();
    results.favicon32 = favicon32.toString("base64");
  } catch {
    results.favicon32 = "";
  }

  // --- Thumbnail 128×128 ---
  try {
    const thumb = await sharp(inputBuffer)
      .resize(128, 128, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .png()
      .toBuffer();
    results.thumb = thumb.toString("base64");
  } catch {
    results.thumb = "";
  }

  // --- Greyscale (B&W) ---
  try {
    const bw = await sharp(inputBuffer).grayscale().png().toBuffer();
    results.grayscale = bw.toString("base64");
  } catch {
    results.grayscale = "";
  }

  // --- Low resolution (pixelated simulation) ---
  try {
    const pixelated = await sharp(inputBuffer)
      .resize(Math.max(8, Math.round(width * 0.05)), Math.max(8, Math.round(height * 0.05)))
      .resize(width || 200, height || 200, { kernel: sharp.kernel.nearest })
      .png()
      .toBuffer();
    results.pixelated = pixelated.toString("base64");
  } catch {
    results.pixelated = "";
  }

  // --- Color analysis with node-vibrant ---
  let dominantColors: string[] = [];
  let wcagChecks: { pair: string; ratio: number; passAA: boolean; passAAA: boolean }[] = [];

  try {
    const Vibrant = (await import("node-vibrant")).default;
    const palette = await Vibrant.from(inputBuffer).getPalette();
    const swatches = Object.values(palette).filter(Boolean);

    dominantColors = swatches.map((s) => {
      const [r, g, b] = s!.getRgb();
      return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
    });

    // Check contrast of first two dominant colors vs white/black
    for (const swatch of swatches.slice(0, 3)) {
      const [r, g, b] = swatch!.getRgb();
      const L = wcagLuminance(r, g, b);
      const Lwhite = 1;
      const Lblack = 0;
      const vsWhite = contrastRatio(L, Lwhite);
      const vsBlack = contrastRatio(L, Lblack);
      wcagChecks.push({
        pair: `${swatch!.hex} vs white`,
        ratio: Math.round(vsWhite * 10) / 10,
        passAA: vsWhite >= 4.5,
        passAAA: vsWhite >= 7,
      });
      wcagChecks.push({
        pair: `${swatch!.hex} vs black`,
        ratio: Math.round(vsBlack * 10) / 10,
        passAA: vsBlack >= 4.5,
        passAAA: vsBlack >= 7,
      });
    }

    checks.push({
      name: "Colors Extracted",
      pass: true,
      detail: `${dominantColors.length} dominant colors found`,
    });
  } catch {
    checks.push({ name: "Color Analysis", pass: false, detail: "Could not extract colors" });
  }

  // --- Resolution check ---
  const isHighRes = width >= 500 && height >= 500;
  checks.push({
    name: "Print Resolution",
    pass: isHighRes,
    detail: isHighRes
      ? `${width}×${height}px — suitable for print`
      : `${width}×${height}px — too small for print (need 500×500px minimum)`,
  });

  // --- Complexity at small size ---
  const totalPixels = width * height;
  checks.push({
    name: "Favicon Legibility",
    pass: totalPixels < 50000,
    detail:
      totalPixels < 50000
        ? "Logo is simple enough to remain legible at 16px"
        : "Logo may be too detailed to read at favicon size — consider a simplified icon variant",
  });

  return NextResponse.json({
    meta: { width, height, format },
    results,
    dominantColors,
    wcagChecks,
    checks,
  });
}
