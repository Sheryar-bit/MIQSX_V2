"use client";

import { useState } from "react";

const FESTIVALS = [
  { id: "eid", label: "Eid Mubarak", emoji: "🌙", desc: "Crescent moon, stars, golden palette" },
  { id: "ramadan", label: "Ramadan Mubarak", emoji: "🪔", desc: "Lantern, stars, purple & gold" },
  { id: "independence", label: "14 August", emoji: "🇵🇰", desc: "Pakistan flag — crescent & star, forest green" },
  { id: "new-year", label: "New Year", emoji: "🎉", desc: "Confetti, sparkles, celebratory" },
] as const;

export default function FestivePage() {
  const [brandName, setBrandName] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#7C3AED");
  const [selected, setSelected] = useState<string>("eid");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function generate() {
    if (!brandName.trim()) return;
    setLoading(true);
    setError("");
    setImageUrl(null);

    try {
      const res = await fetch("/api/generate/festive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ festival: selected, brandName, primaryColor }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setImageUrl(data.imageUrl);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Generation failed");
    }
    setLoading(false);
  }

  const activeFestival = FESTIVALS.find((f) => f.id === selected);

  return (
    <div style={{ padding: "clamp(24px, 3.5vw, 44px) clamp(20px, 4vw, 52px) 90px" }}>
      <div style={{ maxWidth: 980, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: "clamp(26px, 4vh, 40px)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
            <span style={{ width: 38, height: 38, borderRadius: 11, background: "color-mix(in oklab, var(--olive) 14%, transparent)", color: "var(--olive)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>✦</span>
            <h1 style={{ fontFamily: "'General Sans'", fontWeight: 600, fontSize: "clamp(27px, 3.2vw, 40px)", lineHeight: 1.05, letterSpacing: "-0.03em", margin: 0 }}>
              Festive <span style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic", fontWeight: 400, color: "var(--sig)" }}>Variants</span>
            </h1>
          </div>
          <p style={{ fontFamily: "'Newsreader', serif", fontSize: 17, lineHeight: 1.5, color: "var(--muted)", margin: 0, maxWidth: "56ch" }}>
            AI festive posters for <strong style={{ color: "var(--ink)", fontWeight: 600 }}>Eid, Ramadan, 14 August & New Year</strong> — FLUX on Cloudflare Workers AI.
          </p>
        </div>

        {/* 2-col layout */}
        <div className="fv-main" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28, alignItems: "start" }}>

          {/* Left: controls */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Brand info */}
            <div style={{ borderRadius: 20, border: "1px solid var(--line)", background: "var(--surface)", padding: "clamp(20px, 3vw, 28px)" }}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--muted)", marginBottom: 7 }}>Brand name *</label>
                <input
                  className="gf-field"
                  type="text"
                  placeholder="e.g. Kiran Studio"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && generate()}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--muted)", marginBottom: 10 }}>Brand primary color</label>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    style={{ width: 42, height: 42, borderRadius: 10, border: "1px solid var(--line)", cursor: "pointer", padding: 3, background: "var(--field)", flexShrink: 0 }}
                  />
                  <input
                    className="gf-field"
                    type="text"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13 }}
                  />
                </div>
              </div>
            </div>

            {/* Festival selector */}
            <div style={{ borderRadius: 20, border: "1px solid var(--line)", background: "var(--surface)", padding: "clamp(20px, 3vw, 28px)" }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: ".16em", textTransform: "uppercase" as const, color: "var(--muted)", marginBottom: 12 }}>
                Festival
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {FESTIVALS.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setSelected(f.id)}
                    className={`fv-fest${selected === f.id ? " active" : ""}`}
                  >
                    <span style={{ fontSize: 24, flexShrink: 0 }}>{f.emoji}</span>
                    <div>
                      <div style={{ fontFamily: "'General Sans'", fontWeight: 600, fontSize: 14, color: selected === f.id ? "var(--sig)" : "var(--ink)" }}>{f.label}</div>
                      <div style={{ fontFamily: "'Newsreader', serif", fontSize: 12, color: "var(--muted)", marginTop: 2 }}>{f.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <p style={{ fontFamily: "'General Sans'", fontSize: 14, color: "var(--terra)", background: "color-mix(in oklab, var(--terra) 10%, var(--surface))", border: "1px solid color-mix(in oklab, var(--terra) 25%, var(--line))", borderRadius: 12, padding: "12px 16px", margin: 0 }}>{error}</p>
            )}

            <button
              onClick={generate}
              disabled={loading || !brandName.trim()}
              style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 9, padding: "15px 24px", borderRadius: 999, border: "none", background: "var(--sig)", color: "var(--onSig)", fontFamily: "'General Sans'", fontWeight: 600, fontSize: 15, cursor: loading || !brandName.trim() ? "not-allowed" : "pointer", opacity: loading || !brandName.trim() ? 0.6 : 1 }}
            >
              <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24"><path d="M5 3l14 9-14 9V3z"/></svg>
              {loading ? "Generating with FLUX…" : "Generate festive poster"}
            </button>
          </div>

          {/* Right: preview */}
          <div>
            {imageUrl ? (
              <div className="fv-result" style={{ borderRadius: 20, border: "1px solid var(--line)", overflow: "hidden" }}>
                <img src={imageUrl} alt={`${selected} festive poster`} style={{ width: "100%", display: "block" }} />
                <div style={{ padding: "14px 18px", background: "var(--surface)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "var(--muted)" }}>
                    {activeFestival?.label}
                  </span>
                  <a
                    href={imageUrl}
                    download={`festive-${selected}.png`}
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
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, color-mix(in oklab, var(--sig) 10%, var(--surface)), color-mix(in oklab, var(--terra) 10%, var(--surface)))", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 14 }}>
                    <div style={{ width: 48, height: 48, borderRadius: "50%", border: "3px solid var(--line)", borderTop: "3px solid var(--sig)", animation: "ds-spin 1s linear infinite" }} />
                    <span style={{ fontFamily: "'General Sans'", fontSize: 14, color: "var(--muted)" }}>Generating with FLUX…</span>
                  </div>
                ) : (
                  <div style={{ textAlign: "center" }}>
                    <span style={{ fontSize: 60, display: "block", marginBottom: 14 }}>{activeFestival?.emoji ?? "✦"}</span>
                    <p style={{ fontFamily: "'General Sans'", fontWeight: 600, fontSize: 16, color: "var(--ink)", marginBottom: 6 }}>Festive poster preview</p>
                    <p style={{ fontFamily: "'Newsreader', serif", fontSize: 14, color: "var(--muted)", margin: 0 }}>Enter brand name and pick a festival</p>
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
