// All icons render in a 100×100 viewBox using `currentColor`.
export type IconName =
  | "bolt" | "diamond" | "hexagon" | "triangle" | "wave"
  | "leaf" | "flame" | "mountain" | "crown" | "star"
  | "shield" | "drop" | "circle-dot" | "cross" | "arrow"
  | "globe" | "infinity-mark" | "crescent" | "abstract-a"
  | "compass" | "arc" | "dots" | "cube" | "wordmark-only";

export const ICONS: Record<IconName, string> = {
  bolt: `<polygon points="58,4 32,52 54,52 42,96 68,48 46,48" fill="currentColor"/>`,

  diamond: `<polygon points="50,6 94,50 50,94 6,50" fill="none" stroke="currentColor" stroke-width="7" stroke-linejoin="round"/>`,

  hexagon: `<polygon points="50,6 88,28 88,72 50,94 12,72 12,28" fill="none" stroke="currentColor" stroke-width="7" stroke-linejoin="round"/>`,

  triangle: `<polygon points="50,8 94,88 6,88" fill="currentColor" stroke-linejoin="round"/>`,

  wave: `<path d="M5,50 C20,20 35,80 50,50 C65,20 80,80 95,50" fill="none" stroke="currentColor" stroke-width="10" stroke-linecap="round"/>`,

  leaf: `<path d="M50,88 C16,72 8,44 16,20 C24,8 50,6 72,20 C90,34 88,68 50,88 Z" fill="currentColor"/>
         <line x1="50" y1="88" x2="50" y2="24" stroke="white" stroke-width="3" opacity="0.4"/>`,

  flame: `<path d="M50,88 C22,74 24,50 30,36 C34,26 44,20 48,8 C52,20 46,32 56,32 C64,14 70,6 76,4 C82,30 76,56 82,48 C86,70 72,88 50,88 Z" fill="currentColor"/>`,

  mountain: `<polygon points="50,10 88,84 12,84" fill="currentColor"/>
             <polygon points="72,42 92,84 52,84" fill="currentColor" opacity="0.45"/>`,

  crown: `<path d="M12,68 L12,32 L28,52 L50,14 L72,52 L88,32 L88,68 Z" fill="currentColor"/>
          <rect x="12" y="68" width="76" height="14" rx="4" fill="currentColor"/>`,

  star: `<polygon points="50,4 62,36 96,36 70,56 80,88 50,68 20,88 30,56 4,36 38,36" fill="currentColor"/>`,

  shield: `<path d="M50,6 L88,22 L88,52 C88,74 72,88 50,94 C28,88 12,74 12,52 L12,22 Z" fill="none" stroke="currentColor" stroke-width="7" stroke-linejoin="round"/>`,

  drop: `<path d="M50,10 C50,10 20,42 20,62 C20,78 34,92 50,92 C66,92 80,78 80,62 C80,42 50,10 50,10 Z" fill="currentColor"/>`,

  "circle-dot": `<circle cx="50" cy="50" r="38" fill="none" stroke="currentColor" stroke-width="8"/>
                  <circle cx="50" cy="50" r="12" fill="currentColor"/>`,

  cross: `<rect x="42" y="8" width="16" height="84" rx="6" fill="currentColor"/>
          <rect x="8" y="42" width="84" height="16" rx="6" fill="currentColor"/>`,

  arrow: `<path d="M10,50 L72,50" stroke="currentColor" stroke-width="10" stroke-linecap="round"/>
          <path d="M52,24 L78,50 L52,76" fill="none" stroke="currentColor" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>`,

  globe: `<circle cx="50" cy="50" r="38" fill="none" stroke="currentColor" stroke-width="6"/>
          <ellipse cx="50" cy="50" rx="18" ry="38" fill="none" stroke="currentColor" stroke-width="4"/>
          <line x1="12" y1="50" x2="88" y2="50" stroke="currentColor" stroke-width="4"/>
          <line x1="16" y1="30" x2="84" y2="30" stroke="currentColor" stroke-width="3"/>
          <line x1="16" y1="70" x2="84" y2="70" stroke="currentColor" stroke-width="3"/>`,

  "infinity-mark": `<path d="M30,50 C30,36 44,28 50,28 C56,28 70,36 70,50 C70,64 56,72 50,72 C44,72 30,64 30,50 Z M50,50 C50,36 64,28 70,28 C80,28 88,38 88,50 C88,62 80,72 70,72 C64,72 50,64 50,50 Z M50,50 C50,36 36,28 30,28 C20,28 12,38 12,50 C12,62 20,72 30,72 C36,72 50,64 50,50 Z" fill="none" stroke="currentColor" stroke-width="8" stroke-linecap="round"/>`,

  crescent: `<path d="M55,10 A36,36 0 1,0 55,90 A26,26 0 1,1 55,10 Z" fill="currentColor"/>
             <polygon points="73,22 77,30 85,30 79,36 81,44 73,40 65,44 67,36 61,30 69,30" fill="currentColor" transform="scale(0.5) translate(76,10)"/>`,

  "abstract-a": `<path d="M20,86 L50,14 L80,86" fill="none" stroke="currentColor" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
                  <line x1="32" y1="62" x2="68" y2="62" stroke="currentColor" stroke-width="10" stroke-linecap="round"/>`,

  compass: `<circle cx="50" cy="50" r="38" fill="none" stroke="currentColor" stroke-width="6"/>
            <polygon points="50,16 44,50 50,58 56,50" fill="currentColor"/>
            <polygon points="50,84 56,50 50,42 44,50" fill="currentColor" opacity="0.35"/>
            <polygon points="16,50 50,56 58,50 50,44" fill="currentColor" opacity="0.35"/>
            <polygon points="84,50 50,44 42,50 50,56" fill="currentColor" opacity="0.6"/>`,

  arc: `<path d="M12,72 A42,42 0 0,1 88,72" fill="none" stroke="currentColor" stroke-width="10" stroke-linecap="round"/>
        <circle cx="50" cy="28" r="14" fill="currentColor"/>`,

  dots: `<circle cx="26" cy="26" r="10" fill="currentColor"/>
         <circle cx="50" cy="26" r="10" fill="currentColor"/>
         <circle cx="74" cy="26" r="10" fill="currentColor"/>
         <circle cx="26" cy="50" r="10" fill="currentColor"/>
         <circle cx="50" cy="50" r="10" fill="currentColor"/>
         <circle cx="74" cy="50" r="10" fill="currentColor"/>
         <circle cx="26" cy="74" r="10" fill="currentColor"/>
         <circle cx="50" cy="74" r="10" fill="currentColor"/>
         <circle cx="74" cy="74" r="10" fill="currentColor"/>`,

  cube: `<polygon points="50,10 84,30 84,70 50,90 16,70 16,30" fill="none" stroke="currentColor" stroke-width="6" stroke-linejoin="round"/>
         <line x1="50" y1="10" x2="50" y2="90" stroke="currentColor" stroke-width="4" opacity="0.5"/>
         <line x1="16" y1="30" x2="84" y2="70" stroke="currentColor" stroke-width="4" opacity="0.5"/>
         <line x1="84" y1="30" x2="16" y2="70" stroke="currentColor" stroke-width="4" opacity="0.5"/>`,

  "wordmark-only": ``,
};

export const ICON_CATEGORIES: Record<string, IconName[]> = {
  "Tech & Digital": ["bolt", "circuit" as IconName, "globe", "cube", "dots", "abstract-a"],
  "Premium & Luxury": ["diamond", "crown", "star", "infinity-mark"],
  "Nature & Organic": ["leaf", "mountain", "wave", "drop", "flame"],
  "Minimal & Abstract": ["hexagon", "triangle", "arc", "circle-dot", "cross", "compass"],
  "Direction & Growth": ["arrow", "triangle"],
  "Security & Trust": ["shield", "compass"],
  "Pakistan / Cultural": ["crescent", "star"],
  "Typography": ["wordmark-only", "abstract-a"],
};

export const FONT_OPTIONS = [
  { id: "space-grotesk", label: "Space Grotesk", style: "modern", import: "Space+Grotesk:wght@600;700", family: "'Space Grotesk', sans-serif" },
  { id: "inter", label: "Inter", style: "minimal", import: "Inter:wght@600;700;800", family: "'Inter', sans-serif" },
  { id: "oswald", label: "Oswald", style: "bold", import: "Oswald:wght@600;700", family: "'Oswald', sans-serif" },
  { id: "playfair", label: "Playfair Display", style: "classic", import: "Playfair+Display:wght@600;700", family: "'Playfair Display', serif" },
  { id: "syne", label: "Syne", style: "creative", import: "Syne:wght@700;800", family: "'Syne', sans-serif" },
  { id: "raleway", label: "Raleway", style: "elegant", import: "Raleway:wght@600;700", family: "'Raleway', sans-serif" },
  { id: "bebas", label: "Bebas Neue", style: "display", import: "Bebas+Neue", family: "'Bebas Neue', sans-serif" },
  { id: "dm-serif", label: "DM Serif", style: "editorial", import: "DM+Serif+Display", family: "'DM Serif Display', serif" },
] as const;

export type FontId = typeof FONT_OPTIONS[number]["id"];
