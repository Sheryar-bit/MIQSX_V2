import { ICONS, FONT_OPTIONS, type IconName, type FontId } from "./svg-icons";

export type LogoLayout = "horizontal" | "stacked" | "icon-only" | "wordmark";

export interface LogoConfig {
  brandName: string;
  tagline?: string;
  icon: IconName;
  layout: LogoLayout;
  fontId: FontId;
  primaryColor: string;
  secondaryColor?: string;
  bgColor?: string;       // transparent by default
  iconColor?: string;     // defaults to primaryColor
  textColor?: string;     // defaults to primaryColor
  padding?: number;
}

function getFontFamily(fontId: FontId): string {
  return FONT_OPTIONS.find((f) => f.id === fontId)?.family ?? "'Inter', sans-serif";
}

function getFontImport(fontId: FontId): string {
  const opt = FONT_OPTIONS.find((f) => f.id === fontId);
  return opt ? `@import url('https://fonts.googleapis.com/css2?family=${opt.import}&display=swap');` : "";
}

function iconSvg(name: IconName, color: string, size: number, x: number, y: number): string {
  if (name === "wordmark-only") return "";
  return `
    <g transform="translate(${x}, ${y}) scale(${size / 100})">
      <g fill="${color}" stroke="${color}">
        ${ICONS[name] ?? ""}
      </g>
    </g>`;
}

export function composeLogo(cfg: LogoConfig): string {
  const iconColor = cfg.iconColor ?? cfg.primaryColor;
  const textColor = cfg.textColor ?? cfg.primaryColor;
  const font = getFontFamily(cfg.fontId);
  const fontImport = getFontImport(cfg.fontId);
  const bg = cfg.bgColor ?? "none";
  const isWordmarkOnly = cfg.icon === "wordmark-only";

  let svg = "";

  if (cfg.layout === "horizontal") {
    const iconSize = 64;
    const totalH = 120;
    const iconX = 20;
    const iconY = (totalH - iconSize) / 2;
    const textX = isWordmarkOnly ? 20 : iconX + iconSize + 20;
    const nameY = cfg.tagline ? totalH / 2 - 2 : totalH / 2 + 10;
    const nameSize = cfg.brandName.length > 10 ? 26 : cfg.brandName.length > 7 ? 32 : 38;
    const approxW = isWordmarkOnly
      ? 20 + cfg.brandName.length * nameSize * 0.65 + 20
      : textX + cfg.brandName.length * nameSize * 0.62 + 20;
    const width = Math.max(260, Math.min(520, approxW));

    svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${totalH}" width="${width}" height="${totalH}">
  <defs><style>${fontImport} text { font-family: ${font}; }</style></defs>
  ${bg !== "none" ? `<rect width="${width}" height="${totalH}" fill="${bg}" rx="12"/>` : ""}
  ${!isWordmarkOnly ? iconSvg(cfg.icon, iconColor, iconSize, iconX, iconY) : ""}
  <text x="${textX}" y="${nameY}" font-size="${nameSize}" font-weight="700" fill="${textColor}" dominant-baseline="middle" letter-spacing="-0.5">${cfg.brandName}</text>
  ${cfg.tagline ? `<text x="${textX}" y="${nameY + nameSize * 0.85}" font-size="${Math.round(nameSize * 0.4)}" font-weight="500" fill="${textColor}" dominant-baseline="middle" opacity="0.6" letter-spacing="1">${cfg.tagline.toUpperCase()}</text>` : ""}
</svg>`;
  }

  else if (cfg.layout === "stacked") {
    const iconSize = 80;
    const nameSize = cfg.brandName.length > 10 ? 22 : cfg.brandName.length > 7 ? 26 : 30;
    const width = 260;
    const iconX = (width - iconSize) / 2;
    const iconY = 24;
    const nameY = iconY + iconSize + 26;
    const taglineY = nameY + nameSize + 10;
    const totalH = cfg.tagline ? taglineY + 24 : nameY + 32;

    svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${totalH}" width="${width}" height="${totalH}">
  <defs><style>${fontImport} text { font-family: ${font}; }</style></defs>
  ${bg !== "none" ? `<rect width="${width}" height="${totalH}" fill="${bg}" rx="12"/>` : ""}
  ${!isWordmarkOnly ? iconSvg(cfg.icon, iconColor, iconSize, iconX, iconY) : ""}
  <text x="${width / 2}" y="${nameY}" font-size="${nameSize}" font-weight="700" fill="${textColor}" text-anchor="middle" letter-spacing="-0.5">${cfg.brandName}</text>
  ${cfg.tagline ? `<text x="${width / 2}" y="${taglineY}" font-size="${Math.round(nameSize * 0.42)}" font-weight="500" fill="${textColor}" text-anchor="middle" opacity="0.6" letter-spacing="1.5">${cfg.tagline.toUpperCase()}</text>` : ""}
</svg>`;
  }

  else if (cfg.layout === "icon-only") {
    const iconSize = 160;
    const pad = 20;
    const total = iconSize + pad * 2;

    svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${total} ${total}" width="${total}" height="${total}">
  <defs><style>${fontImport}</style></defs>
  ${bg !== "none" ? `<rect width="${total}" height="${total}" fill="${bg}" rx="24"/>` : ""}
  ${!isWordmarkOnly ? iconSvg(cfg.icon, iconColor, iconSize, pad, pad) : ""}
</svg>`;
  }

  else if (cfg.layout === "wordmark") {
    const nameSize = cfg.brandName.length > 12 ? 42 : cfg.brandName.length > 8 ? 52 : 64;
    const width = Math.max(200, cfg.brandName.length * nameSize * 0.62 + 40);
    const totalH = cfg.tagline ? 100 : 80;
    const nameY = cfg.tagline ? 44 : totalH / 2;

    svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${totalH}" width="${width}" height="${totalH}">
  <defs><style>${fontImport} text { font-family: ${font}; }</style></defs>
  ${bg !== "none" ? `<rect width="${width}" height="${totalH}" fill="${bg}" rx="12"/>` : ""}
  <text x="${width / 2}" y="${nameY}" font-size="${nameSize}" font-weight="700" fill="${textColor}" text-anchor="middle" dominant-baseline="middle" letter-spacing="-1">${cfg.brandName}</text>
  ${cfg.tagline ? `<text x="${width / 2}" y="${nameY + nameSize * 0.65}" font-size="${Math.round(nameSize * 0.28)}" font-weight="500" fill="${textColor}" text-anchor="middle" opacity="0.6" letter-spacing="3">${cfg.tagline.toUpperCase()}</text>` : ""}
</svg>`;
  }

  return svg.trim();
}

// Generate all 4 layout variants at once
export function composeLogoVariants(cfg: Omit<LogoConfig, "layout">): Record<LogoLayout, string> {
  return {
    horizontal: composeLogo({ ...cfg, layout: "horizontal" }),
    stacked: composeLogo({ ...cfg, layout: "stacked" }),
    "icon-only": composeLogo({ ...cfg, layout: "icon-only" }),
    wordmark: composeLogo({ ...cfg, layout: "wordmark" }),
  };
}
