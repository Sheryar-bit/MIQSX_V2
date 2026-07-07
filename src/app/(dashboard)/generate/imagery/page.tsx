"use client";

import { useState } from "react";

const STYLES = [
  { id: "realism", label: "Realism", emoji: "📸" },
  { id: "minimalist", label: "Minimalist", emoji: "◻️" },
  { id: "neon", label: "Neon", emoji: "🌆" },
  { id: "vintage-retro", label: "Vintage / Retro", emoji: "🎞️" },
  { id: "3d-render", label: "3D Render", emoji: "🎲" },
  { id: "watercolor", label: "Watercolor", emoji: "🎨" },
  { id: "flat-design", label: "Flat Design", emoji: "📐" },
  { id: "animated", label: "Animated", emoji: "✨" },
] as const;

const SIZES = [
  { id: "square", label: "Square (1:1)", desc: "Instagram post" },
  { id: "landscape", label: "Landscape (4:3)", desc: "Facebook, blog" },
  { id: "portrait", label: "Portrait (4:3)", desc: "Pinterest" },
  { id: "story", label: "Story (9:16)", desc: "Instagram Story" },
] as const;

const EXPORT_FORMATS = [
  { slug: "instagram-post", label: "Instagram Post", size: "1080×1080" },
  { slug: "instagram-story", label: "Story", size: "1080×1920" },
  { slug: "facebook-cover", label: "Facebook Cover", size: "820×312" },
  { slug: "linkedin-banner", label: "LinkedIn Banner", size: "1584×396" },
  { slug: "twitter-header", label: "Twitter Header", size: "1500×500" },
  { slug: "youtube-thumb", label: "YouTube Thumb", size: "1280×720" },
  { slug: "whatsapp-dp", label: "WhatsApp DP", size: "500×500" },
];

export default function ImageryPage() {
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("realism");
  const [size, setSize] = useState("square");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");
  const [selectedFormats, setSelectedFormats] = useState<string[]>(["instagram-post", "instagram-story"]);

  async function generate() {
    if (!prompt.trim()) return;
    setLoading(true);
    setError("");
    setImageUrl(null);

    try {
      const res = await fetch("/api/generate/imagery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, style, size }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setImageUrl(data.imageUrl);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Generation failed");
    }
    setLoading(false);
  }

  async function exportKit() {
    if (!imageUrl) return;
    setExporting(true);
    try {
      const res = await fetch("/api/generate/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl, formats: selectedFormats }),
      });
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "social-media-kit.zip";
      a.click();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Export failed");
    }
    setExporting(false);
  }

  function toggleFormat(slug: string) {
    setSelectedFormats((prev) =>
      prev.includes(slug) ? prev.filter((f) => f !== slug) : [...prev, slug]
    );
  }

  return (
    <div style={{ padding: "clamp(24px, 3.5vw, 44px) clamp(20px, 4vw, 52px) 90px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: "clamp(26px, 4vh, 40px)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
            <span style={{ width: 38, height: 38, borderRadius: 11, background: "color-mix(in oklab, var(--olive) 14%, transparent)", color: "var(--olive)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>
            </span>
            <h1 style={{ fontFamily: "'General Sans'", fontWeight: 600, fontSize: "clamp(27px, 3.2vw, 40px)", lineHeight: 1.05, letterSpacing: "-0.03em", margin: 0 }}>
              Post <span style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic", fontWeight: 400, color: "var(--sig)" }}>Imagery</span>
            </h1>
          </div>
          <p style={{ fontFamily: "'Newsreader', serif", fontSize: 17, lineHeight: 1.5, color: "var(--muted)", margin: 0, maxWidth: "56ch" }}>
            FLUX.1 on Cloudflare Workers AI · <strong style={{ color: "var(--ink)", fontWeight: 600 }}>8 style filters</strong> · Brand DNA auto-injected.
          </p>
        </div>

        {/* 2-col layout */}
        <div className="pi-main" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28, alignItems: "start" }}>
          {/* Left: controls */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ borderRadius: 20, border: "1px solid var(--line)", background: "var(--surface)", padding: "clamp(20px, 3vw, 28px)" }}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--muted)", marginBottom: 7 }}>Describe the image *</label>
                <textarea
                  className="gf-field"
                  placeholder={'e.g. A bold café poster with "MORNING BREW" above a steaming latte'}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  style={{ minHeight: 90, resize: "vertical", fontFamily: "'General Sans', sans-serif" }}
                />
                <p style={{ marginTop: 6, fontFamily: "'General Sans'", fontSize: 12, color: "var(--muted)" }}>
                  💡 Want text? Put exact words in quotes — e.g. a sign that says &quot;GRAND OPENING&quot;. Keep it 1–4 words for sharp letters.
                </p>
              </div>

              {/* Style filter */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--muted)", marginBottom: 10 }}>Style filter</label>
                <div className="pi-styles" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
                  {STYLES.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setStyle(s.id)}
                      className={`pi-style${style === s.id ? " active" : ""}`}
                    >
                      <span style={{ fontSize: 20 }}>{s.emoji}</span>
                      <span style={{ textAlign: "center", lineHeight: 1.2 }}>{s.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Aspect ratio */}
              <div style={{ marginBottom: 18 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--muted)", marginBottom: 10 }}>Aspect ratio</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {SIZES.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setSize(s.id)}
                      className={`pi-ratio${size === s.id ? " active" : ""}`}
                    >
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{s.label}</div>
                      <div style={{ fontSize: 11, opacity: 0.65, marginTop: 2 }}>{s.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <p style={{ marginBottom: 14, fontFamily: "'General Sans'", fontSize: 14, color: "var(--terra)", background: "color-mix(in oklab, var(--terra) 10%, var(--surface))", border: "1px solid color-mix(in oklab, var(--terra) 25%, var(--line))", borderRadius: 12, padding: "12px 16px" }}>{error}</p>
              )}

              <button
                onClick={generate}
                disabled={loading || !prompt.trim()}
                style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 9, padding: "13px 24px", borderRadius: 999, border: "none", background: "var(--sig)", color: "var(--onSig)", fontFamily: "'General Sans'", fontWeight: 600, fontSize: 15, cursor: loading || !prompt.trim() ? "not-allowed" : "pointer", opacity: loading || !prompt.trim() ? 0.6 : 1, width: "100%" }}
              >
                <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24"><path d="M5 3l14 9-14 9V3z"/></svg>
                {loading ? "Generating with Workers AI…" : "Generate image"}
              </button>
            </div>

            {/* Social Media Kit */}
            {imageUrl && (
              <div style={{ borderRadius: 20, border: "1px solid var(--line)", background: "var(--surface)", padding: "clamp(18px, 2.5vw, 24px)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ color: "var(--terra)" }}><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>
                  <span style={{ fontFamily: "'General Sans'", fontWeight: 600, fontSize: 14 }}>Social Media Kit</span>
                </div>
                <p style={{ fontFamily: "'General Sans'", fontSize: 12, color: "var(--muted)", marginBottom: 12 }}>Select formats to include in zip export:</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
                  {EXPORT_FORMATS.map((f) => (
                    <label key={f.slug} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={selectedFormats.includes(f.slug)}
                        onChange={() => toggleFormat(f.slug)}
                        style={{ accentColor: "var(--sig)" }}
                      />
                      <span style={{ fontFamily: "'General Sans'", fontSize: 13, color: "var(--muted)", flex: 1 }}>{f.label}</span>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "var(--muted)" }}>{f.size}</span>
                    </label>
                  ))}
                </div>
                <button
                  onClick={exportKit}
                  disabled={exporting || selectedFormats.length === 0}
                  style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "11px 20px", borderRadius: 999, border: "1px solid var(--line)", background: "var(--surface)", color: "var(--ink)", fontFamily: "'General Sans'", fontWeight: 600, fontSize: 14, cursor: exporting || selectedFormats.length === 0 ? "not-allowed" : "pointer", opacity: exporting || selectedFormats.length === 0 ? 0.6 : 1, width: "100%" }}
                >
                  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
                  {exporting ? "Exporting…" : `Export ${selectedFormats.length} format${selectedFormats.length !== 1 ? "s" : ""} as ZIP`}
                </button>
              </div>
            )}
          </div>

          {/* Right: preview */}
          <div>
            {imageUrl ? (
              <div className="pi-result" style={{ borderRadius: 20, border: "1px solid var(--line)", overflow: "hidden" }}>
                <img src={imageUrl} alt="Generated" style={{ width: "100%", display: "block" }} />
                <div style={{ padding: "14px 18px", background: "var(--surface)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "var(--muted)", textTransform: "capitalize" }}>{style} · {size}</span>
                  <a
                    href={imageUrl}
                    download="generated.png"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "8px 14px", borderRadius: 999, border: "1px solid var(--line)", background: "var(--surface)", color: "var(--ink)", fontFamily: "'General Sans'", fontWeight: 600, fontSize: 13, textDecoration: "none" }}
                  >
                    <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
                    Download
                  </a>
                </div>
              </div>
            ) : (
              <div style={{ borderRadius: 20, border: "1.5px dashed var(--line)", minHeight: 440, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--surface)", position: "relative", overflow: "hidden" }}>
                {loading ? (
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, color-mix(in oklab, var(--sig) 10%, var(--surface)), color-mix(in oklab, var(--olive) 10%, var(--surface)))", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 14 }}>
                    <div style={{ width: 48, height: 48, borderRadius: "50%", border: "3px solid var(--line)", borderTop: "3px solid var(--sig)", animation: "ds-spin 1s linear infinite" }} />
                    <span style={{ fontFamily: "'General Sans'", fontSize: 14, color: "var(--muted)" }}>Generating with FLUX…</span>
                  </div>
                ) : (
                  <div style={{ textAlign: "center" }}>
                    <svg width="56" height="56" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" style={{ color: "var(--muted)", margin: "0 auto 14px", display: "block" }}><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>
                    <p style={{ fontFamily: "'General Sans'", fontWeight: 600, fontSize: 16, color: "var(--ink)", marginBottom: 6 }}>Your generated image will appear here</p>
                    <p style={{ fontFamily: "'Newsreader', serif", fontSize: 14, color: "var(--muted)", margin: 0 }}>Requires Cloudflare Workers AI keys in .env.local</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
