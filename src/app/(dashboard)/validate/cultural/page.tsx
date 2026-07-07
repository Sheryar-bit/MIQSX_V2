"use client";

import { useState } from "react";

type CulturalFit = "excellent" | "good" | "neutral" | "risky" | "problematic";

interface Flag {
  category: string;
  severity: "critical" | "warning" | "suggestion";
  issue: string;
  explanation: string;
  fix: string;
}

interface CulturalResult {
  overallScore: number;
  culturalFit: CulturalFit;
  flags: Flag[];
  strengths: string[];
  opportunities: string[];
  regionalNotes: Record<string, string>;
  urduSuggestion: string | null;
  romanUrduSuggestion: string | null;
  summary: string;
}

const fitConfig: Record<CulturalFit, { color: string; label: string }> = {
  excellent: { color: "var(--sig)", label: "Excellent fit" },
  good: { color: "var(--leaf)", label: "Good fit" },
  neutral: { color: "var(--olive)", label: "Neutral" },
  risky: { color: "var(--terra)", label: "Risky" },
  problematic: { color: "var(--red)", label: "Problematic" },
};

const severityColor = { critical: "var(--red)", warning: "var(--terra)", suggestion: "var(--olive)" };

const ASSET_TYPES = ["caption", "tagline", "ad copy", "campaign concept", "product name", "website copy"];

export default function CulturalCheckPage() {
  const [content, setContent] = useState("");
  const [assetType, setAssetType] = useState("caption");
  const [targetRegion, setTargetRegion] = useState("Pakistan (all provinces)");
  const [includeUrdu, setIncludeUrdu] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CulturalResult | null>(null);

  const handleSubmit = async () => {
    if (!content.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/validate/cultural", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, assetType, targetRegion, includeUrduCheck: includeUrdu }),
      });
      setResult(await res.json());
    } finally {
      setLoading(false);
    }
  };

  const fit = result ? fitConfig[result.culturalFit] ?? fitConfig.neutral : null;

  return (
    <div style={{ padding: "clamp(24px, 3.5vw, 44px) clamp(20px, 4vw, 52px) 90px" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: "clamp(26px, 4vh, 40px)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
            <span style={{ width: 38, height: 38, borderRadius: 11, background: "color-mix(in oklab, var(--terra) 14%, transparent)", color: "var(--terra)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20"/></svg>
            </span>
            <h1 style={{ fontFamily: "'General Sans'", fontWeight: 600, fontSize: "clamp(27px, 3.2vw, 40px)", lineHeight: 1.05, letterSpacing: "-0.03em", margin: 0 }}>
              Cultural <span style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic", fontWeight: 400, color: "var(--terra)" }}>Check</span>
            </h1>
          </div>
          <p style={{ fontFamily: "'Newsreader', serif", fontSize: 17, lineHeight: 1.5, color: "var(--muted)", margin: 0, maxWidth: "56ch" }}>
            AI reviews content for <strong style={{ color: "var(--ink)", fontWeight: 600 }}>Pakistani cultural sensitivity</strong> — regional, linguistic, religious.
          </p>
        </div>

        {/* Type tabs */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
          {ASSET_TYPES.map((t) => (
            <button key={t} onClick={() => setAssetType(t)} className={`cc-tab${assetType === t ? " sel" : ""}`}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* 2-col layout */}
        <div className="cc-layout">

          {/* Left: input */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ borderRadius: 20, border: "1px solid var(--line)", background: "var(--surface)", padding: "clamp(20px, 3vw, 28px)" }}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--muted)", marginBottom: 7 }}>Content *</label>
                <textarea
                  className="gf-field"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Paste your copy here — English, Urdu, or Roman Urdu all work..."
                  style={{ minHeight: 140, resize: "vertical", fontFamily: "'General Sans', sans-serif" }}
                />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--muted)", marginBottom: 7 }}>Target region</label>
                <select
                  value={targetRegion}
                  onChange={(e) => setTargetRegion(e.target.value)}
                  style={{ width: "100%", fontFamily: "'General Sans', sans-serif", fontSize: 15, color: "var(--ink)", background: "var(--field)", border: "1px solid var(--line)", borderRadius: 12, padding: "13px 15px", outline: "none", appearance: "none" as const, boxSizing: "border-box" as const }}
                >
                  <option>Pakistan (all provinces)</option>
                  <option>Karachi</option>
                  <option>Lahore</option>
                  <option>Islamabad / Rawalpindi</option>
                  <option>Peshawar / KPK</option>
                  <option>Multan / South Punjab</option>
                  <option>Interior Sindh</option>
                </select>
              </div>
              <label style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
                <div
                  onClick={() => setIncludeUrdu(!includeUrdu)}
                  style={{ width: 36, height: 20, borderRadius: 999, background: includeUrdu ? "var(--terra)" : "var(--surf2)", border: "1px solid var(--line)", position: "relative", transition: "background .2s", cursor: "pointer", flexShrink: 0 }}
                >
                  <div style={{ position: "absolute", top: 2, left: includeUrdu ? "calc(100% - 18px)" : 2, width: 16, height: 16, borderRadius: "50%", background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,.2)", transition: "left .2s" }} />
                </div>
                <span style={{ fontFamily: "'General Sans'", fontSize: 13, color: "var(--muted)" }}>Include Urdu translation suggestion</span>
              </label>
            </div>
            <button
              onClick={handleSubmit}
              disabled={loading || !content.trim()}
              style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 9, padding: "15px 24px", borderRadius: 999, border: "none", background: "var(--terra)", color: "#fff", fontFamily: "'General Sans'", fontWeight: 600, fontSize: 15, cursor: loading || !content.trim() ? "not-allowed" : "pointer", opacity: loading || !content.trim() ? 0.6 : 1 }}
            >
              <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24"><path d="M5 3l14 9-14 9V3z"/></svg>
              {loading ? "Analyzing cultural fit…" : "Run Cultural Check"}
            </button>
          </div>

          {/* Right: results */}
          <div>
            {!result && !loading && (
              <div style={{ minHeight: 380, borderRadius: 20, border: "1.5px dashed var(--line)", background: "var(--surface)", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12 }}>
                <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 24 24" style={{ color: "var(--muted)", opacity: .2 }}><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20"/></svg>
                <p style={{ fontFamily: "'Newsreader', serif", fontSize: 14, color: "var(--muted)", margin: 0 }}>Cultural analysis will appear here</p>
              </div>
            )}
            {loading && (
              <div style={{ minHeight: 380, borderRadius: 20, border: "1px solid var(--line)", background: "var(--surface)", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: "50%", border: "3px solid var(--line)", borderTop: "3px solid var(--terra)", animation: "ds-spin 1s linear infinite" }} />
                <span style={{ fontFamily: "'General Sans'", fontSize: 14, color: "var(--muted)" }}>Consulting Pakistani cultural guidelines…</span>
              </div>
            )}
            {result && fit && (
              <div className="cc-result" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {/* Score card */}
                <div style={{ borderRadius: 20, border: `1px solid color-mix(in oklab, ${fit.color} 30%, var(--line))`, background: `color-mix(in oklab, ${fit.color} 6%, var(--surface))`, padding: "clamp(18px, 2.5vw, 24px)" }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 6 }}>
                    <span style={{ fontFamily: "'General Sans'", fontWeight: 700, fontSize: 52, lineHeight: 1, color: "var(--ink)" }}>{result.overallScore}</span>
                    <span style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic", fontSize: 22, color: fit.color }}>{fit.label}</span>
                  </div>
                  <p style={{ fontFamily: "'Newsreader', serif", fontSize: 14, color: "var(--muted)", margin: 0, lineHeight: 1.55 }}>{result.summary}</p>
                </div>
                {/* Flags */}
                {result.flags?.length > 0 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {result.flags.map((f, i) => (
                      <div key={i} className="cc-row" style={{ animationDelay: `${i * 0.06}s`, borderRadius: 14, border: `1px solid color-mix(in oklab, ${severityColor[f.severity]} 22%, var(--line))`, background: `color-mix(in oklab, ${severityColor[f.severity]} 5%, var(--surface))`, padding: "12px 14px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                          <svg width="12" height="12" fill="none" stroke={severityColor[f.severity]} strokeWidth="2" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01"/></svg>
                          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase" as const, color: severityColor[f.severity] }}>{f.category} · {f.severity}</span>
                        </div>
                        <p style={{ fontFamily: "'General Sans'", fontWeight: 600, fontSize: 13, color: "var(--ink)", margin: "0 0 3px" }}>{f.issue}</p>
                        <p style={{ fontFamily: "'Newsreader', serif", fontSize: 12, color: "var(--muted)", margin: "0 0 5px", lineHeight: 1.45 }}>{f.explanation}</p>
                        <p style={{ fontFamily: "'General Sans'", fontSize: 12, color: "var(--muted)", margin: 0, paddingTop: 6, borderTop: "1px solid var(--line)" }}>Fix: {f.fix}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Below-fold results */}
        {result && (
          <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Regional notes */}
            {result.regionalNotes && Object.keys(result.regionalNotes).length > 0 && (
              <div style={{ borderRadius: 20, border: "1px solid var(--line)", background: "var(--surface)", padding: "clamp(18px, 2.5vw, 24px)" }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: ".16em", textTransform: "uppercase" as const, color: "var(--muted)", marginBottom: 14 }}>Regional Reception</div>
                <div className="cc-regional" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                  {Object.entries(result.regionalNotes).map(([city, note]) => (
                    <div key={city} style={{ borderRadius: 14, border: "1px solid var(--line)", background: "var(--surf2)", padding: "14px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                        <svg width="12" height="12" fill="none" stroke="var(--muted)" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                        <span style={{ fontFamily: "'General Sans'", fontWeight: 600, fontSize: 12, color: "var(--ink)" }}>{city}</span>
                      </div>
                      <p style={{ fontFamily: "'Newsreader', serif", fontSize: 13, color: "var(--muted)", margin: 0, lineHeight: 1.45 }}>{note}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Strengths + Opportunities */}
            {(result.strengths?.length > 0 || result.opportunities?.length > 0) && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                {result.strengths?.length > 0 && (
                  <div style={{ borderRadius: 18, border: "1px solid color-mix(in oklab, var(--sig) 25%, var(--line))", background: "color-mix(in oklab, var(--sig) 5%, var(--surface))", padding: "18px 20px" }}>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase" as const, color: "var(--sig)", marginBottom: 10 }}>Cultural Strengths</div>
                    <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
                      {result.strengths.map((s, i) => (
                        <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                          <svg width="13" height="13" fill="none" stroke="var(--sig)" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0, marginTop: 2 }}><path d="M20 6L9 17l-5-5"/></svg>
                          <span style={{ fontFamily: "'Newsreader', serif", fontSize: 13, color: "var(--ink)", lineHeight: 1.5 }}>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {result.opportunities?.length > 0 && (
                  <div style={{ borderRadius: 18, border: "1px solid color-mix(in oklab, var(--olive) 25%, var(--line))", background: "color-mix(in oklab, var(--olive) 5%, var(--surface))", padding: "18px 20px" }}>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase" as const, color: "var(--olive)", marginBottom: 10 }}>Local Hook Opportunities</div>
                    <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
                      {result.opportunities.map((o, i) => (
                        <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                          <svg width="13" height="13" fill="none" stroke="var(--olive)" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0, marginTop: 2 }}><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
                          <span style={{ fontFamily: "'Newsreader', serif", fontSize: 13, color: "var(--ink)", lineHeight: 1.5 }}>{o}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Urdu suggestions */}
            {(result.urduSuggestion || result.romanUrduSuggestion) && (
              <div style={{ borderRadius: 20, border: "1px solid var(--line)", background: "var(--surface)", padding: "clamp(18px, 2.5vw, 24px)" }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: ".16em", textTransform: "uppercase" as const, color: "var(--muted)", marginBottom: 14 }}>Language Variants</div>
                {result.urduSuggestion && (
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "var(--muted)", marginBottom: 5 }}>اردو</div>
                    <p style={{ fontFamily: "'Newsreader', serif", fontSize: 20, lineHeight: 1.8, color: "var(--ink)", margin: 0, direction: "rtl", textAlign: "right" }}>{result.urduSuggestion}</p>
                  </div>
                )}
                {result.romanUrduSuggestion && (
                  <div>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "var(--muted)", marginBottom: 5 }}>Roman Urdu</div>
                    <p style={{ fontFamily: "'Newsreader', serif", fontStyle: "italic", fontSize: 16, color: "var(--ink)", margin: 0 }}>{result.romanUrduSuggestion}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
