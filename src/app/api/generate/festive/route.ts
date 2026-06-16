import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

type Festival = "eid" | "ramadan" | "independence" | "new-year";

function festiveOverlay(festival: Festival, brandName: string, primaryColor: string): string {
  const overlays: Record<Festival, string> = {
    eid: `
      <!-- Eid overlay: crescent + stars + festive border -->
      <defs>
        <radialGradient id="eidGlow" cx="50%" cy="20%" r="60%">
          <stop offset="0%" stop-color="#C9A84C" stop-opacity="0.25"/>
          <stop offset="100%" stop-color="${primaryColor}" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="400" height="400" fill="url(#eidGlow)"/>
      <!-- Crescent moon top-right -->
      <g transform="translate(300,30) scale(0.7)">
        <path d="M55,10 A36,36 0 1,0 55,90 A26,26 0 1,1 55,10 Z" fill="#C9A84C" opacity="0.9"/>
      </g>
      <!-- Stars -->
      <g fill="#C9A84C" opacity="0.85">
        <polygon points="30,20 32,26 38,26 33,30 35,36 30,32 25,36 27,30 22,26 28,26" transform="scale(0.6) translate(10,10)"/>
        <polygon points="30,20 32,26 38,26 33,30 35,36 30,32 25,36 27,30 22,26 28,26" transform="scale(0.4) translate(750,80)"/>
        <polygon points="30,20 32,26 38,26 33,30 35,36 30,32 25,36 27,30 22,26 28,26" transform="scale(0.5) translate(100,640)"/>
      </g>
      <!-- Festive bottom banner -->
      <rect x="0" y="340" width="400" height="60" fill="${primaryColor}" opacity="0.92" rx="0"/>
      <text x="200" y="378" text-anchor="middle" font-family="'Georgia', serif" font-size="22" fill="white" font-weight="600">Eid Mubarak 🌙</text>
      <!-- Brand name -->
      <text x="200" y="330" text-anchor="middle" font-family="'Inter', sans-serif" font-size="32" fill="${primaryColor}" font-weight="800" letter-spacing="-1">${brandName}</text>`,

    ramadan: `
      <!-- Ramadan overlay: lantern + stars + purple/gold palette -->
      <defs>
        <radialGradient id="ramGlow" cx="50%" cy="0%" r="70%">
          <stop offset="0%" stop-color="#6B46C1" stop-opacity="0.3"/>
          <stop offset="100%" stop-color="${primaryColor}" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="400" height="400" fill="url(#ramGlow)"/>
      <!-- Lantern silhouette -->
      <g transform="translate(170,40) scale(1)">
        <rect x="22" y="0" width="16" height="12" rx="3" fill="#C9A84C"/>
        <polygon points="10,12 50,12 60,60 0,60" fill="#C9A84C" opacity="0.85"/>
        <rect x="0" y="60" width="60" height="50" fill="none" stroke="#C9A84C" stroke-width="3"/>
        <line x1="20" y1="60" x2="20" y2="110" stroke="#C9A84C" stroke-width="2" opacity="0.5"/>
        <line x1="40" y1="60" x2="40" y2="110" stroke="#C9A84C" stroke-width="2" opacity="0.5"/>
        <polygon points="0,110 60,110 70,130 -10,130" fill="#C9A84C" opacity="0.85"/>
      </g>
      <!-- Stars scattered -->
      <g fill="#C9A84C" opacity="0.7" font-size="20">
        <text x="40" y="80">✦</text>
        <text x="320" y="60">✦</text>
        <text x="360" y="180">✦</text>
        <text x="20" y="300">✦</text>
      </g>
      <rect x="0" y="340" width="400" height="60" fill="#6B46C1" opacity="0.92" rx="0"/>
      <text x="200" y="378" text-anchor="middle" font-family="'Georgia', serif" font-size="22" fill="white" font-weight="600">Ramadan Mubarak ✨</text>
      <text x="200" y="330" text-anchor="middle" font-family="'Inter', sans-serif" font-size="32" fill="#6B46C1" font-weight="800" letter-spacing="-1">${brandName}</text>`,

    independence: `
      <!-- 14 August overlay: Pakistan flag colors, crescent & star -->
      <defs>
        <linearGradient id="pakGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#01411C" stop-opacity="0.15"/>
          <stop offset="100%" stop-color="#01411C" stop-opacity="0.05"/>
        </linearGradient>
      </defs>
      <rect width="400" height="400" fill="url(#pakGrad)"/>
      <!-- Green stripe at top -->
      <rect x="0" y="0" width="400" height="8" fill="#01411C"/>
      <rect x="0" y="392" width="400" height="8" fill="#01411C"/>
      <!-- Crescent + Star, centered large -->
      <g transform="translate(140, 80) scale(1.4)">
        <circle cx="50" cy="50" r="48" fill="none" stroke="#01411C" stroke-width="3" opacity="0.3"/>
        <path d="M55,10 A36,36 0 1,0 55,90 A26,26 0 1,1 55,10 Z" fill="#01411C" opacity="0.8"/>
        <polygon points="72,50 65,35 79,46 64,46 78,35" fill="#01411C" opacity="0.8" transform="translate(-5,0)"/>
      </g>
      <rect x="0" y="340" width="400" height="60" fill="#01411C" rx="0"/>
      <text x="200" y="374" text-anchor="middle" font-family="'Georgia', serif" font-size="18" fill="white" font-weight="600">Happy Independence Day 🇵🇰</text>
      <text x="200" y="325" text-anchor="middle" font-family="'Inter', sans-serif" font-size="32" fill="#01411C" font-weight="800" letter-spacing="-1">${brandName}</text>`,

    "new-year": `
      <!-- New Year overlay: confetti + sparkles -->
      <defs>
        <radialGradient id="nyGlow" cx="50%" cy="100%" r="80%">
          <stop offset="0%" stop-color="${primaryColor}" stop-opacity="0.2"/>
          <stop offset="100%" stop-color="${primaryColor}" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="400" height="400" fill="url(#nyGlow)"/>
      <!-- Confetti dots -->
      <g opacity="0.75">
        <circle cx="40" cy="60" r="6" fill="#FFD700"/>
        <circle cx="80" cy="120" r="4" fill="${primaryColor}"/>
        <circle cx="320" cy="80" r="5" fill="#FF6B6B"/>
        <circle cx="350" cy="180" r="4" fill="#FFD700"/>
        <circle cx="60" cy="250" r="6" fill="${primaryColor}"/>
        <circle cx="370" cy="300" r="5" fill="#FF6B6B"/>
        <rect x="100" y="50" width="8" height="8" fill="#FFD700" transform="rotate(30,104,54)"/>
        <rect x="280" y="140" width="8" height="8" fill="${primaryColor}" transform="rotate(45,284,144)"/>
        <rect x="50" y="350" width="6" height="6" fill="#FF6B6B" transform="rotate(20,53,353)"/>
        <text x="30" y="100" font-size="16" opacity="0.6">✦</text>
        <text x="340" y="50" font-size="20" opacity="0.6">✨</text>
        <text x="10" y="200" font-size="14" opacity="0.5">⭐</text>
      </g>
      <rect x="0" y="340" width="400" height="60" fill="${primaryColor}" rx="0"/>
      <text x="200" y="378" text-anchor="middle" font-family="'Georgia', serif" font-size="22" fill="white" font-weight="600">Happy New Year 🎉</text>
      <text x="200" y="330" text-anchor="middle" font-family="'Inter', sans-serif" font-size="32" fill="${primaryColor}" font-weight="800" letter-spacing="-1">${brandName}</text>`,
  };

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
  <rect width="400" height="400" fill="white"/>
  ${overlays[festival]}
</svg>`;
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { festival, brandName = "Brand", primaryColor = "#7C3AED" } = await req.json();

  const validFestivals: Festival[] = ["eid", "ramadan", "independence", "new-year"];
  if (!validFestivals.includes(festival)) {
    return NextResponse.json({ error: "Invalid festival. Choose: eid, ramadan, independence, new-year" }, { status: 400 });
  }

  const svg = festiveOverlay(festival as Festival, brandName, primaryColor);
  return NextResponse.json({ svg, festival });
}
