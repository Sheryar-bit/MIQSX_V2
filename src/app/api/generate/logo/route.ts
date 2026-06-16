import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { composeLogoVariants } from "@/lib/logo-composer";
import type { IconName, FontId } from "@/lib/svg-icons";
import type { LogoLayout } from "@/lib/logo-composer";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const {
    brandName,
    tagline,
    icon = "hexagon",
    fontId = "space-grotesk",
    primaryColor = "#7C3AED",
    secondaryColor,
    bgColor,
    layout,
  } = body;

  if (!brandName?.trim()) {
    return NextResponse.json({ error: "Brand name is required" }, { status: 400 });
  }

  const cfg = {
    brandName: brandName.trim(),
    tagline: tagline?.trim() || undefined,
    icon: icon as IconName,
    fontId: fontId as FontId,
    primaryColor,
    secondaryColor,
    bgColor,
  };

  if (layout) {
    const { composeLogo } = await import("@/lib/logo-composer");
    const svg = composeLogo({ ...cfg, layout: layout as LogoLayout });
    return NextResponse.json({ svg, layout });
  }

  const variants = composeLogoVariants(cfg);
  return NextResponse.json({ variants });
}
