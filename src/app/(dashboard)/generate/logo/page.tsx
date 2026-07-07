"use client";

import { useState } from "react";
import { ICON_CATEGORIES, FONT_OPTIONS, ICONS, type IconName, type FontId } from "@/lib/svg-icons";
import type { LogoLayout } from "@/lib/logo-composer";

function IconMark({ name, color = "currentColor", size = 28 }: { name: IconName; color?: string; size?: number }) {
  if (name === "wordmark-only") {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100">
        <text x="50" y="58" textAnchor="middle" fontSize="38" fontWeight="700" fontFamily="sans-serif" fill={color}>Aa</text>
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" dangerouslySetInnerHTML={{ __html: ICONS[name] ?? "" }} />
  );
}

const LAYOUTS: { id: LogoLayout; label: string }[] = [
  { id: "horizontal", label: "Horizontal" },
  { id: "stacked", label: "Stacked" },
  { id: "icon-only", label: "Icon Only" },
  { id: "wordmark", label: "Wordmark" },
];

function SvgPreview({ svg, label }: { svg: string; label: string }) {
  function downloadSvg() {
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `logo-${label.toLowerCase()}.svg`;
    a.click();
  }

  return (
    <div className="lg-variant">
      <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase" as const, color: "var(--muted)", marginBottom: 12, marginTop: 0 }}>{label}</p>
      <div
        style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "#ffffff", borderRadius: 10, minHeight: 120, padding: 16 }}
        dangerouslySetInnerHTML={{ __html: svg }}
      />
      <button
        onClick={downloadSvg}
        style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "8px 14px", borderRadius: 999, border: "1px solid var(--line)", background: "var(--surface)", color: "var(--muted)", fontFamily: "'General Sans'", fontWeight: 500, fontSize: 12, cursor: "pointer", width: "100%", marginTop: 10 }}
      >
        <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
        Download SVG
      </button>
    </div>
  );
}

export default function LogoGeneratorPage() {
  const [brandName, setBrandName] = useState("");
  const [tagline, setTagline] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#7C3AED");
  const [bgColor, setBgColor] = useState("transparent");
  const [selectedIcon, setSelectedIcon] = useState<IconName>("hexagon");
  const [selectedFont, setSelectedFont] = useState<FontId>("space-grotesk");
  const [activeLayout, setActiveLayout] = useState<LogoLayout | "all">("all");
  const [variants, setVariants] = useState<Record<string, string> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [aiImages, setAiImages] = useState<string[] | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");

  async function generate() {
    if (!brandName.trim()) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/generate/logo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandName,
          tagline,
          icon: selectedIcon,
          fontId: selectedFont,
          primaryColor,
          bgColor: bgColor === "transparent" ? undefined : bgColor,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setVariants(data.variants);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed");
    }
    setLoading(false);
  }

  async function generateAi() {
    if (!brandName.trim()) return;
    setAiLoading(true);
    setAiError("");
    setAiImages(null);

    try {
      const res = await fetch("/api/generate/logo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "ai",
          prompt: aiPrompt,
          brandName,
          tagline,
          icon: selectedIcon,
          primaryColor,
          bgColor: bgColor === "transparent" ? undefined : bgColor,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setAiImages(data.images);
    } catch (e: unknown) {
      setAiError(e instanceof Error ? e.message : "AI generation failed");
    }
    setAiLoading(false);
  }

  const displayedVariants = variants
    ? activeLayout === "all"
      ? Object.entries(variants)
      : Object.entries(variants).filter(([key]) => key === activeLayout)
    : [];

  const selectStyle: React.CSSProperties = {
    width: "100%", fontFamily: "'General Sans', sans-serif", fontSize: 14,
    color: "var(--ink)", background: "var(--field)", border: "1px solid var(--line)",
    borderRadius: 10, padding: "10px 12px", outline: "none",
  };

  return (
    <div style={{ padding: "clamp(24px, 3.5vw, 44px) clamp(20px, 4vw, 52px) 90px" }}>
      <div style={{ maxWidth: 1120, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: "clamp(26px, 4vh, 40px)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
            <span style={{ width: 38, height: 38, borderRadius: 11, background: "color-mix(in oklab, var(--sig) 14%, transparent)", color: "var(--sig)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/></svg>
            </span>
            <h1 style={{ fontFamily: "'General Sans'", fontWeight: 600, fontSize: "clamp(27px, 3.2vw, 40px)", lineHeight: 1.05, letterSpacing: "-0.03em", margin: 0 }}>
              Logo <span style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic", fontWeight: 400, color: "var(--sig)" }}>Generator</span>
            </h1>
          </div>
          <p style={{ fontFamily: "'Newsreader', serif", fontSize: 17, lineHeight: 1.5, color: "var(--muted)", margin: 0, maxWidth: "56ch" }}>
            Crisp <strong style={{ color: "var(--ink)", fontWeight: 600 }}>vector SVG logos</strong> — plus AI concepts from FLUX on Cloudflare Workers AI.
          </p>
        </div>

        {/* Main 2-col grid */}
        <div className="lg-main" style={{ display: "grid", gridTemplateColumns: "2fr 3fr", gap: 28, alignItems: "start" }}>

          {/* Left: controls */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Brand info */}
            <div style={{ borderRadius: 20, border: "1px solid var(--line)", background: "var(--surface)", padding: "clamp(18px, 2.5vw, 24px)" }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: ".16em", textTransform: "uppercase" as const, color: "var(--muted)", marginBottom: 14 }}>Brand Info</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--muted)", marginBottom: 7 }}>Brand name *</label>
                  <input className="gf-field" type="text" placeholder="e.g. Kiran Studio" value={brandName} onChange={(e) => setBrandName(e.target.value)} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--muted)", marginBottom: 7 }}>Tagline (optional)</label>
                  <input className="gf-field" type="text" placeholder="e.g. Build what matters" value={tagline} onChange={(e) => setTagline(e.target.value)} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--muted)", marginBottom: 7 }}>AI logo prompt (optional)</label>
                  <textarea
                    className="gf-field"
                    placeholder={'Describe your ideal logo — e.g. "a minimal geometric fox head inside a hexagon"'}
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    style={{ minHeight: 70, resize: "vertical", fontFamily: "'General Sans', sans-serif" }}
                  />
                  <p style={{ fontFamily: "'General Sans'", fontSize: 11, color: "var(--muted)", marginTop: 4, marginBottom: 0 }}>
                    Guides &ldquo;Generate AI concepts&rdquo; only. Vector variants ignore this.
                  </p>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--muted)", marginBottom: 7 }}>Primary color</label>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <input
                        type="color"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        style={{ width: 36, height: 36, borderRadius: 9, border: "1px solid var(--line)", cursor: "pointer", padding: 2, background: "var(--field)", flexShrink: 0 }}
                      />
                      <input
                        className="gf-field"
                        type="text"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}
                      />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--muted)", marginBottom: 7 }}>Background</label>
                    <select value={bgColor} onChange={(e) => setBgColor(e.target.value)} style={selectStyle}>
                      <option value="transparent">Transparent</option>
                      <option value="#ffffff">White</option>
                      <option value="#000000">Black</option>
                      <option value="#F8F8F8">Off-white</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Font picker */}
            <div style={{ borderRadius: 20, border: "1px solid var(--line)", background: "var(--surface)", padding: "clamp(16px, 2.5vw, 22px)" }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: ".16em", textTransform: "uppercase" as const, color: "var(--muted)", marginBottom: 10 }}>Font</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {FONT_OPTIONS.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setSelectedFont(f.id)}
                    className={`lg-font${selectedFont === f.id ? " active" : ""}`}
                  >
                    <span>{f.label}</span>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, opacity: 0.5 }}>{f.style}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Icon mark picker */}
            <div style={{ borderRadius: 20, border: "1px solid var(--line)", background: "var(--surface)", padding: "clamp(16px, 2.5vw, 22px)" }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: ".16em", textTransform: "uppercase" as const, color: "var(--muted)", marginBottom: 12 }}>Icon Mark</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {Object.entries(ICON_CATEGORIES).map(([category, icons]) => (
                  <div key={category}>
                    <p style={{ fontFamily: "'General Sans'", fontSize: 11, color: "var(--muted)", marginBottom: 6, marginTop: 0 }}>{category}</p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {icons.map((icon) => (
                        <button
                          key={icon}
                          onClick={() => setSelectedIcon(icon)}
                          title={icon}
                          className={`lg-mark${selectedIcon === icon ? " active" : ""}`}
                          style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "8px 6px", minWidth: 52 }}
                        >
                          <IconMark name={icon} size={26} color={selectedIcon === icon ? "var(--sig)" : "var(--ink)"} />
                          <span style={{ fontSize: 9, fontFamily: "'JetBrains Mono', monospace", letterSpacing: ".04em", opacity: 0.6, textTransform: "capitalize", lineHeight: 1 }}>{icon.replace(/-/g, " ")}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {error && (
              <p style={{ fontFamily: "'General Sans'", fontSize: 14, color: "var(--terra)", background: "color-mix(in oklab, var(--terra) 10%, var(--surface))", border: "1px solid color-mix(in oklab, var(--terra) 25%, var(--line))", borderRadius: 12, padding: "12px 16px", margin: 0 }}>{error}</p>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <button
                onClick={generate}
                disabled={loading || !brandName.trim()}
                style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 9, padding: "14px 24px", borderRadius: 999, border: "none", background: "var(--sig)", color: "var(--onSig)", fontFamily: "'General Sans'", fontWeight: 600, fontSize: 15, cursor: loading || !brandName.trim() ? "not-allowed" : "pointer", opacity: loading || !brandName.trim() ? 0.6 : 1 }}
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21.5 2l-11 11M21.5 2H15M21.5 2V8.5M10 5H5a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2v-5"/></svg>
                {loading ? "Composing logo…" : "Generate vector variants"}
              </button>
              <button
                onClick={generateAi}
                disabled={aiLoading || !brandName.trim()}
                style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 9, padding: "14px 24px", borderRadius: 999, border: "1px solid var(--line)", background: "var(--surface)", color: "var(--ink)", fontFamily: "'General Sans'", fontWeight: 600, fontSize: 15, cursor: aiLoading || !brandName.trim() ? "not-allowed" : "pointer", opacity: aiLoading || !brandName.trim() ? 0.6 : 1 }}
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9.5 2A2.5 2.5 0 0112 4.5v15a2.5 2.5 0 01-4.96-.46 2.5 2.5 0 01-2.96-3.08 3 3 0 01-.34-5.58 2.5 2.5 0 013.32-3.97A2.5 2.5 0 019.5 2z"/><path d="M14.5 2A2.5 2.5 0 0112 4.5v15a2.5 2.5 0 004.96-.46 2.5 2.5 0 002.96-3.08 3 3 0 00.34-5.58 2.5 2.5 0 00-3.32-3.97A2.5 2.5 0 0014.5 2z"/></svg>
                {aiLoading ? "Generating with FLUX…" : "Generate AI concepts"}
              </button>
              {aiError && (
                <p style={{ fontFamily: "'General Sans'", fontSize: 14, color: "var(--terra)", background: "color-mix(in oklab, var(--terra) 10%, var(--surface))", border: "1px solid color-mix(in oklab, var(--terra) 25%, var(--line))", borderRadius: 12, padding: "12px 16px", margin: 0 }}>{aiError}</p>
              )}
            </div>
          </div>

          {/* Right: preview */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* AI concepts */}
            {(aiImages || aiLoading) && (
              <div style={{ borderRadius: 20, border: "1px solid var(--line)", background: "var(--surface)", padding: "clamp(18px, 2.5vw, 24px)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ color: "var(--sig)" }}><path d="M9.5 2A2.5 2.5 0 0112 4.5v15a2.5 2.5 0 01-4.96-.46 2.5 2.5 0 01-2.96-3.08 3 3 0 01-.34-5.58 2.5 2.5 0 013.32-3.97A2.5 2.5 0 019.5 2z"/><path d="M14.5 2A2.5 2.5 0 0112 4.5v15a2.5 2.5 0 004.96-.46 2.5 2.5 0 002.96-3.08 3 3 0 00.34-5.58 2.5 2.5 0 00-3.32-3.97A2.5 2.5 0 0014.5 2z"/></svg>
                  <span style={{ fontFamily: "'General Sans'", fontWeight: 600, fontSize: 14 }}>AI Concepts</span>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "var(--muted)" }}>· FLUX</span>
                </div>
                {aiLoading && !aiImages ? (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} style={{ borderRadius: 14, border: "1px solid var(--line)", background: "var(--surf2)", aspectRatio: "1", animation: "ds-pulse 1.5s ease-in-out infinite" }} />
                    ))}
                  </div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                    {aiImages?.map((src, i) => (
                      <div key={i} style={{ borderRadius: 14, border: "1px solid var(--line)", overflow: "hidden" }}>
                        <img src={src} alt={`AI logo concept ${i + 1}`} style={{ width: "100%", display: "block", background: "#fff" }} />
                        <a
                          href={src}
                          download={`logo-ai-${i + 1}.png`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "8px", background: "var(--surface)", color: "var(--muted)", fontFamily: "'General Sans'", fontSize: 12, textDecoration: "none" }}
                        >
                          <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
                          Download
                        </a>
                      </div>
                    ))}
                  </div>
                )}
                <p style={{ fontFamily: "'Newsreader', serif", fontSize: 12, color: "var(--muted)", marginTop: 10, fontStyle: "italic", marginBottom: 0 }}>
                  AI concepts are raster ideas — the brand name may not be spelled exactly. Use vector variants for production.
                </p>
              </div>
            )}

            {/* Vector variants */}
            {variants ? (
              <div style={{ borderRadius: 20, border: "1px solid var(--line)", background: "var(--surface)", padding: "clamp(18px, 2.5vw, 24px)" }}>
                {/* Layout filter tabs */}
                <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
                  {(["all", ...LAYOUTS.map((l) => l.id)] as const).map((l) => (
                    <button
                      key={l}
                      onClick={() => setActiveLayout(l as LogoLayout | "all")}
                      style={{
                        fontFamily: "'General Sans'",
                        fontWeight: 500,
                        fontSize: 12,
                        padding: "7px 14px",
                        borderRadius: 999,
                        border: `1px solid ${activeLayout === l ? "color-mix(in oklab, var(--sig) 40%, var(--line))" : "var(--line)"}`,
                        background: activeLayout === l ? "color-mix(in oklab, var(--sig) 10%, var(--surface))" : "var(--surface)",
                        color: activeLayout === l ? "var(--sig)" : "var(--muted)",
                        cursor: "pointer",
                        textTransform: "capitalize" as const,
                      }}
                    >
                      {l === "all" ? "All layouts" : l}
                    </button>
                  ))}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  {displayedVariants.map(([layout, svg]) => (
                    <SvgPreview key={layout} svg={svg} label={layout} />
                  ))}
                </div>
              </div>
            ) : (
              !aiImages && !aiLoading && (
                <div style={{ borderRadius: 20, border: "1.5px dashed var(--line)", minHeight: 400, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--surface)" }}>
                  <div style={{ textAlign: "center" }}>
                    <svg width="56" height="56" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" style={{ color: "var(--muted)", margin: "0 auto 14px", display: "block" }}><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/></svg>
                    <p style={{ fontFamily: "'General Sans'", fontWeight: 600, fontSize: 16, color: "var(--ink)", marginBottom: 6 }}>Configure your logo on the left</p>
                    <p style={{ fontFamily: "'Newsreader', serif", fontSize: 14, color: "var(--muted)", margin: 0 }}>Hit Generate to see vector variants</p>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
