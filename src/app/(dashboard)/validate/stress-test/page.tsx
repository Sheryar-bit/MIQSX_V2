"use client";

import { useState, useRef } from "react";

interface StressResult {
  meta: { width: number; height: number; format: string };
  results: Record<string, string>;
  dominantColors: string[];
  wcagChecks: { pair: string; ratio: number; passAA: boolean; passAAA: boolean }[];
  checks: { name: string; pass: boolean; detail: string }[];
}

// Colorblind SVG filter matrices
const COLORBLIND_FILTERS = `
<svg xmlns="http://www.w3.org/2000/svg" style="display:none">
  <defs>
    <filter id="deuteranopia">
      <feColorMatrix type="matrix" values="
        0.367 0.861 -0.228 0 0
        0.280 0.673  0.047 0 0
       -0.012 0.043  0.969 0 0
        0 0 0 1 0"/>
    </filter>
    <filter id="protanopia">
      <feColorMatrix type="matrix" values="
        0.152 1.053 -0.205 0 0
        0.115 0.786  0.099 0 0
       -0.004 -0.048 1.052 0 0
        0 0 0 1 0"/>
    </filter>
    <filter id="tritanopia">
      <feColorMatrix type="matrix" values="
        1.256 -0.077 -0.180 0 0
       -0.078  0.931  0.148 0 0
        0.005  0.691  0.304 0 0
        0 0 0 1 0"/>
    </filter>
  </defs>
</svg>`;

function ImgPreview({
  src,
  label,
  cssFilter,
  svgFilter,
  small,
}: {
  src: string;
  label: string;
  cssFilter?: string;
  svgFilter?: string;
  small?: boolean;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase" as const, color: "var(--muted)" }}>{label}</div>
      <div
        style={{
          borderRadius: 12, overflow: "hidden", border: "1px solid var(--line)",
          background: "repeating-conic-gradient(var(--surf2) 0% 25%, var(--surface) 0% 50%) 0 0 / 16px 16px",
          display: "flex", alignItems: "center", justifyContent: "center",
          height: small ? 80 : 128,
        }}
      >
        <img
          src={`data:image/png;base64,${src}`}
          alt={label}
          style={{
            height: small ? 64 : 112,
            width: small ? 64 : "100%",
            objectFit: "contain",
            filter: svgFilter ? `url(#${svgFilter}) ${cssFilter || ""}` : cssFilter,
          }}
        />
      </div>
    </div>
  );
}

export default function StressTestPage() {
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<StressResult | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setImagePreview(dataUrl);
      setImageBase64(dataUrl.split(",")[1]);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!imageBase64) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/validate/stress-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64 }),
      });
      setResult(await res.json());
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "clamp(24px, 3.5vw, 44px) clamp(20px, 4vw, 52px) 90px" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <div dangerouslySetInnerHTML={{ __html: COLORBLIND_FILTERS }} />

        {/* Header */}
        <div style={{ marginBottom: "clamp(26px, 4vh, 40px)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
            <span style={{ width: 38, height: 38, borderRadius: 11, background: "color-mix(in oklab, var(--olive) 14%, transparent)", color: "var(--olive)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
            </span>
            <h1 style={{ fontFamily: "'General Sans'", fontWeight: 600, fontSize: "clamp(27px, 3.2vw, 40px)", lineHeight: 1.05, letterSpacing: "-0.03em", margin: 0 }}>
              Logo <span style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic", fontWeight: 400, color: "var(--sig)" }}>Stress Test</span>
            </h1>
          </div>
          <p style={{ fontFamily: "'Newsreader', serif", fontSize: 17, lineHeight: 1.5, color: "var(--muted)", margin: 0, maxWidth: "56ch" }}>
            Favicon, B&amp;W, <strong style={{ color: "var(--ink)", fontWeight: 600 }}>colorblind simulations</strong> + WCAG contrast ratios.
          </p>
        </div>

        {/* Upload */}
        <div style={{ borderRadius: 20, border: "1px solid var(--line)", background: "var(--surface)", padding: "clamp(20px, 3vw, 28px)", marginBottom: 24 }}>
          {imagePreview ? (
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 80, height: 80, borderRadius: 14, overflow: "hidden", border: "1px solid var(--line)", flexShrink: 0, background: "repeating-conic-gradient(var(--surf2) 0% 25%, var(--surface) 0% 50%) 0 0 / 12px 12px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <img src={imagePreview} alt="logo" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontFamily: "'General Sans'", fontWeight: 600, fontSize: 14, color: "var(--ink)", margin: 0 }}>Logo uploaded</p>
                <p style={{ fontFamily: "'Newsreader', serif", fontSize: 13, color: "var(--muted)", margin: "4px 0 0" }}>Ready to run stress tests</p>
              </div>
              <button
                onClick={() => { setImagePreview(null); setImageBase64(null); setResult(null); }}
                style={{ width: 30, height: 30, borderRadius: "50%", background: "var(--surf2)", border: "1px solid var(--line)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileRef.current?.click()}
              style={{ width: "100%", height: 140, borderRadius: 14, border: "1.5px dashed var(--line)", background: "var(--surf2)", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 }}
            >
              <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" style={{ color: "var(--muted)" }}><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
              <span style={{ fontFamily: "'General Sans'", fontWeight: 600, fontSize: 14, color: "var(--muted)" }}>Upload logo (PNG, SVG, WEBP)</span>
              <span style={{ fontFamily: "'Newsreader', serif", fontSize: 13, color: "var(--muted)" }}>Transparent background recommended</span>
            </button>
          )}
          <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }}
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />

          {imageBase64 && (
            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{ marginTop: 16, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 9, padding: "13px 24px", borderRadius: 999, border: "none", background: "var(--sig)", color: "var(--onSig)", fontFamily: "'General Sans'", fontWeight: 600, fontSize: 15, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1, width: "100%" }}
            >
              <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
              {loading ? "Running tests…" : "Run Stress Test"}
            </button>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ borderRadius: 20, border: "1px solid var(--line)", background: "var(--surface)", padding: "40px 24px", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 14, marginBottom: 24 }}>
            <div style={{ width: 44, height: 44, borderRadius: "50%", border: "3px solid var(--line)", borderTop: "3px solid var(--olive)", animation: "ds-spin 1s linear infinite" }} />
            <span style={{ fontFamily: "'General Sans'", fontSize: 14, color: "var(--muted)" }}>Running {7} stress tests…</span>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="st-result" style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Size simulations */}
            <div style={{ borderRadius: 20, border: "1px solid var(--line)", background: "var(--surface)", padding: "clamp(18px, 2.5vw, 24px)" }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: ".16em", textTransform: "uppercase" as const, color: "var(--muted)", marginBottom: 14 }}>Size Simulations</div>
              <div className="st-grid">
                {result.results.thumb && <ImgPreview src={result.results.thumb} label="128px (App Icon)" />}
                {result.results.favicon32 && <ImgPreview src={result.results.favicon32} label="32px (Favicon)" small />}
                {result.results.favicon16 && <ImgPreview src={result.results.favicon16} label="16px (Tiny Favicon)" small />}
                {result.results.pixelated && <ImgPreview src={result.results.pixelated} label="Low Resolution" />}
              </div>
            </div>

            {/* Appearance tests */}
            <div style={{ borderRadius: 20, border: "1px solid var(--line)", background: "var(--surface)", padding: "clamp(18px, 2.5vw, 24px)" }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: ".16em", textTransform: "uppercase" as const, color: "var(--muted)", marginBottom: 14 }}>Appearance Tests</div>
              <div className="st-variants" style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
                <ImgPreview src={result.results.thumb || ""} label="Original" />
                {result.results.grayscale && <ImgPreview src={result.results.grayscale} label="Grayscale (B&W)" />}
                <ImgPreview src={result.results.thumb || ""} label="Inverted" cssFilter="invert(1)" />
                <ImgPreview src={result.results.thumb || ""} label="Deuteranopia" svgFilter="deuteranopia" />
                <ImgPreview src={result.results.thumb || ""} label="Protanopia" svgFilter="protanopia" />
              </div>
            </div>

            {/* Dominant colors */}
            {result.dominantColors?.length > 0 && (
              <div style={{ borderRadius: 20, border: "1px solid var(--line)", background: "var(--surface)", padding: "clamp(18px, 2.5vw, 24px)" }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: ".16em", textTransform: "uppercase" as const, color: "var(--muted)", marginBottom: 14 }}>Extracted Colors</div>
                <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                  {result.dominantColors.map((color, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid var(--line)", backgroundColor: color, flexShrink: 0 }} />
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "var(--muted)" }}>{color}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* WCAG */}
            {result.wcagChecks?.length > 0 && (
              <div style={{ borderRadius: 20, border: "1px solid var(--line)", background: "var(--surface)", padding: "clamp(18px, 2.5vw, 24px)" }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: ".16em", textTransform: "uppercase" as const, color: "var(--muted)", marginBottom: 14 }}>WCAG Contrast Ratios</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {result.wcagChecks.map((c, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderRadius: 12, border: "1px solid var(--line)", background: "var(--surf2)" }}>
                      <span style={{ fontFamily: "'General Sans'", fontSize: 14, color: "var(--muted)" }}>{c.pair}</span>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: "var(--ink)" }}>{c.ratio}:1</span>
                        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, padding: "3px 8px", borderRadius: 999, background: c.passAA ? "color-mix(in oklab, var(--sig) 12%, var(--surface))" : "color-mix(in oklab, var(--red) 12%, var(--surface))", color: c.passAA ? "var(--sig)" : "var(--red)", border: `1px solid ${c.passAA ? "color-mix(in oklab, var(--sig) 25%, var(--line))" : "color-mix(in oklab, var(--red) 25%, var(--line))"}` }}>
                          AA {c.passAA ? "✓" : "✗"}
                        </span>
                        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, padding: "3px 8px", borderRadius: 999, background: c.passAAA ? "color-mix(in oklab, var(--sig) 12%, var(--surface))" : "color-mix(in oklab, var(--olive) 12%, var(--surface))", color: c.passAAA ? "var(--sig)" : "var(--olive)", border: `1px solid ${c.passAAA ? "color-mix(in oklab, var(--sig) 25%, var(--line))" : "color-mix(in oklab, var(--olive) 25%, var(--line))"}` }}>
                          AAA {c.passAAA ? "✓" : "✗"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Print-ready checks */}
            <div style={{ borderRadius: 20, border: "1px solid var(--line)", background: "var(--surface)", padding: "clamp(18px, 2.5vw, 24px)" }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: ".16em", textTransform: "uppercase" as const, color: "var(--muted)", marginBottom: 14 }}>Print-Ready Checks</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {result.checks.map((c, i) => (
                  <div key={i} style={{ display: "flex", gap: 12, padding: "12px 14px", borderRadius: 12, border: "1px solid var(--line)", background: "var(--surf2)", alignItems: "flex-start" }}>
                    {c.pass
                      ? <svg width="16" height="16" fill="none" stroke="var(--sig)" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0, marginTop: 1 }}><path d="M20 6L9 17l-5-5"/></svg>
                      : <svg width="16" height="16" fill="none" stroke="var(--red)" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0, marginTop: 1 }}><path d="M18 6L6 18M6 6l12 12"/></svg>
                    }
                    <div>
                      <p style={{ fontFamily: "'General Sans'", fontWeight: 600, fontSize: 14, color: "var(--ink)", margin: 0 }}>{c.name}</p>
                      <p style={{ fontFamily: "'Newsreader', serif", fontSize: 13, color: "var(--muted)", margin: "3px 0 0" }}>{c.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
