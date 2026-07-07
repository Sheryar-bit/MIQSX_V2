"use client";

import { useState, useRef } from "react";

type AssetType = "caption" | "tagline" | "logo" | "image" | "design";
type Severity = "high" | "medium" | "low";

interface Violation {
  category: string;
  message: string;
  severity: Severity;
}

interface GuardianResult {
  overall: number;
  grade: string;
  scores: Record<string, number>;
  violations: Violation[];
  suggestions: string[];
  summary: string;
}

const ASSET_TYPES: AssetType[] = ["caption", "tagline", "logo", "image", "design"];

function ScoreRing({ score, label }: { score: number; label: string }) {
  const r = 40;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 80 ? "var(--sig)" : score >= 60 ? "var(--olive)" : "var(--red)";
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
      <div style={{ position: "relative", width: 88, height: 88 }}>
        <svg viewBox="0 0 88 88" style={{ transform: "rotate(-90deg)", width: "100%", height: "100%" }}>
          <circle cx="44" cy="44" r={r} fill="none" stroke="var(--surf2)" strokeWidth="6" />
          <circle cx="44" cy="44" r={r} fill="none" stroke={color} strokeWidth="6"
            strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 0.8s ease" }} />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontFamily: "'General Sans'", fontWeight: 700, fontSize: 20, color: "var(--ink)" }}>{score}</span>
        </div>
      </div>
      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase" as const, color: "var(--muted)", textAlign: "center" }}>{label}</span>
    </div>
  );
}

export default function GuardianPage() {
  const [assetType, setAssetType] = useState<AssetType>("caption");
  const [content, setContent] = useState("");
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GuardianResult | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setImagePreview(dataUrl);
      const b64 = dataUrl.split(",")[1];
      setImageBase64(b64);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!content && !imageBase64) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/validate/guardian", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assetType, content, imageBase64 }),
      });
      const data = await res.json();
      setResult(data);
    } finally {
      setLoading(false);
    }
  };

  const gradeColor = (g: string) =>
    g === "A" ? "var(--sig)" :
    g === "B" ? "var(--leaf)" :
    g === "C" ? "var(--olive)" :
    g === "D" ? "var(--terra)" : "var(--red)";

  const severityColor = (s: Severity) =>
    s === "high" ? "var(--red)" : s === "medium" ? "var(--terra)" : "var(--olive)";

  return (
    <div style={{ padding: "clamp(24px, 3.5vw, 44px) clamp(20px, 4vw, 52px) 90px" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: "clamp(26px, 4vh, 40px)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
            <span style={{ width: 38, height: 38, borderRadius: 11, background: "color-mix(in oklab, var(--sig) 14%, transparent)", color: "var(--sig)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </span>
            <h1 style={{ fontFamily: "'General Sans'", fontWeight: 600, fontSize: "clamp(27px, 3.2vw, 40px)", lineHeight: 1.05, letterSpacing: "-0.03em", margin: 0 }}>
              Brand <span style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic", fontWeight: 400, color: "var(--sig)" }}>Guardian</span>
            </h1>
          </div>
          <p style={{ fontFamily: "'Newsreader', serif", fontSize: 17, lineHeight: 1.5, color: "var(--muted)", margin: 0, maxWidth: "56ch" }}>
            Score any asset against your <strong style={{ color: "var(--ink)", fontWeight: 600 }}>Brand DNA</strong> — catch violations before they go live.
          </p>
        </div>

        {/* Asset type tabs */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
          {ASSET_TYPES.map((t) => (
            <button key={t} onClick={() => setAssetType(t)} className={`bg-tab${assetType === t ? " sel" : ""}`}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* 2-col layout */}
        <div className="bg-layout">

          {/* Left: input */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ borderRadius: 20, border: "1px solid var(--line)", background: "var(--surface)", padding: "clamp(20px, 3vw, 28px)" }}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--muted)", marginBottom: 7 }}>Content</label>
                <textarea
                  className="gf-field"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Paste your caption, tagline, or describe the design..."
                  style={{ minHeight: 120, resize: "vertical", fontFamily: "'General Sans', sans-serif" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--muted)", marginBottom: 7 }}>Visual asset (optional)</label>
                {imagePreview ? (
                  <div style={{ position: "relative", borderRadius: 14, overflow: "hidden", border: "1px solid var(--line)" }}>
                    <img src={imagePreview} alt="Preview" style={{ width: "100%", height: 160, objectFit: "cover", display: "block" }} />
                    <button
                      onClick={() => { setImagePreview(null); setImageBase64(null); }}
                      style={{ position: "absolute", top: 8, right: 8, width: 28, height: 28, borderRadius: "50%", background: "var(--surface)", border: "1px solid var(--line)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                    >
                      <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => fileRef.current?.click()}
                    style={{ width: "100%", height: 120, borderRadius: 14, border: "1.5px dashed var(--line)", background: "var(--surf2)", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}
                  >
                    <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" style={{ color: "var(--muted)" }}><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
                    <span style={{ fontFamily: "'General Sans'", fontSize: 13, color: "var(--muted)" }}>Upload image</span>
                  </button>
                )}
                <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }}
                  onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading || (!content && !imageBase64)}
              style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 9, padding: "15px 24px", borderRadius: 999, border: "none", background: "var(--sig)", color: "var(--onSig)", fontFamily: "'General Sans'", fontWeight: 600, fontSize: 15, cursor: loading || (!content && !imageBase64) ? "not-allowed" : "pointer", opacity: loading || (!content && !imageBase64) ? 0.6 : 1 }}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              {loading ? "Analyzing…" : "Run Guardian Check"}
            </button>
          </div>

          {/* Right: results */}
          <div>
            {!result && !loading && (
              <div style={{ minHeight: 380, borderRadius: 20, border: "1.5px dashed var(--line)", background: "var(--surface)", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12 }}>
                <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 24 24" style={{ color: "var(--muted)", opacity: .2 }}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                <p style={{ fontFamily: "'Newsreader', serif", fontSize: 14, color: "var(--muted)", margin: 0 }}>Results will appear here</p>
              </div>
            )}

            {loading && (
              <div style={{ minHeight: 380, borderRadius: 20, border: "1px solid var(--line)", background: "var(--surface)", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: "50%", border: "3px solid var(--line)", borderTop: "3px solid var(--sig)", animation: "ds-spin 1s linear infinite" }} />
                <span style={{ fontFamily: "'General Sans'", fontSize: 14, color: "var(--muted)" }}>Analyzing against Brand DNA…</span>
              </div>
            )}

            {result && (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {/* Score card */}
                <div style={{ borderRadius: 20, border: "1px solid var(--line)", background: "var(--surface)", padding: "clamp(18px, 2.5vw, 24px)" }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 8 }}>
                    <span style={{ fontFamily: "'General Sans'", fontWeight: 700, fontSize: 52, lineHeight: 1, color: "var(--ink)" }}>{result.overall}</span>
                    <span style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic", fontSize: 30, color: gradeColor(result.grade) }}>Grade {result.grade}</span>
                  </div>
                  <p style={{ fontFamily: "'Newsreader', serif", fontSize: 13, color: "var(--muted)", margin: "0 0 14px", lineHeight: 1.5 }}>{result.summary}</p>
                  {Object.keys(result.scores).length > 0 && (
                    <div style={{ display: "flex", gap: 14, flexWrap: "wrap", paddingTop: 14, borderTop: "1px solid var(--line)" }}>
                      {Object.entries(result.scores).map(([key, val]) => (
                        <ScoreRing key={key} score={val} label={key} />
                      ))}
                    </div>
                  )}
                </div>

                {/* Violations */}
                {result.violations.length > 0 && (
                  <div style={{ borderRadius: 20, border: "1px solid var(--line)", background: "var(--surface)", padding: "18px 20px" }}>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: ".16em", textTransform: "uppercase" as const, color: "var(--muted)", marginBottom: 12 }}>
                      Issues found ({result.violations.length})
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {result.violations.map((v, i) => (
                        <div key={i} className="bg-row" style={{ animationDelay: `${i * 0.06}s`, display: "flex", gap: 10, padding: "10px 14px", borderRadius: 12, border: `1px solid color-mix(in oklab, ${severityColor(v.severity)} 25%, var(--line))`, background: `color-mix(in oklab, ${severityColor(v.severity)} 6%, var(--surface))` }}>
                          <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>
                            {v.severity === "high" ? "🔴" : v.severity === "medium" ? "🟡" : "🔵"}
                          </span>
                          <div>
                            <div style={{ fontFamily: "'General Sans'", fontWeight: 600, fontSize: 12, color: severityColor(v.severity), marginBottom: 2 }}>{v.category}</div>
                            <div style={{ fontFamily: "'Newsreader', serif", fontSize: 13, color: "var(--ink)", lineHeight: 1.45 }}>{v.message}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Suggestions */}
                {result.suggestions?.length > 0 && (
                  <div style={{ borderRadius: 20, border: "1px solid color-mix(in oklab, var(--sig) 25%, var(--line))", background: "color-mix(in oklab, var(--sig) 5%, var(--surface))", padding: "18px 20px" }}>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: ".16em", textTransform: "uppercase" as const, color: "var(--sig)", marginBottom: 12 }}>
                      Suggestions ({result.suggestions.length})
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {result.suggestions.map((s, i) => (
                        <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                          <svg width="14" height="14" fill="none" stroke="var(--sig)" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0, marginTop: 2 }}><path d="M20 6L9 17l-5-5"/></svg>
                          <span style={{ fontFamily: "'Newsreader', serif", fontSize: 14, color: "var(--ink)", lineHeight: 1.5 }}>{s}</span>
                        </div>
                      ))}
                    </div>
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
