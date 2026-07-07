"use client";

import { useState } from "react";

interface Persona {
  name: string;
  age: number;
  city: string;
  occupation: string;
  background: string;
  reaction: string;
  score: number;
  quote: string;
  suggestion: string;
}

interface FocusGroupResult {
  personas: Persona[];
  groupConsensus: string;
  averageScore: number;
  topConcern: string;
  topStrength: string;
  recommendation: string;
}

const ASSET_TYPES = ["caption", "tagline", "ad concept", "brand concept", "product name", "slogan"];
const AVATAR_COLORS = ["var(--sig)", "var(--terra)", "var(--olive)", "var(--leaf)", "var(--muted)"];

function ConsensusRing({ score }: { score: number }) {
  const r = 38;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 10) * circ;
  const color = score >= 8 ? "var(--sig)" : score >= 6 ? "var(--olive)" : "var(--terra)";
  return (
    <div style={{ position: "relative", width: 96, height: 96, flexShrink: 0 }}>
      <svg viewBox="0 0 96 96" style={{ transform: "rotate(-90deg)", width: "100%", height: "100%" }}>
        <circle cx="48" cy="48" r={r} fill="none" stroke="var(--surf2)" strokeWidth="6" />
        <circle cx="48" cy="48" r={r} fill="none" stroke={color} strokeWidth="6"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.8s ease" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 0 }}>
        <span style={{ fontFamily: "'General Sans'", fontWeight: 700, fontSize: 22, color: "var(--ink)", lineHeight: 1 }}>{score?.toFixed(1)}</span>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "var(--muted)" }}>/10</span>
      </div>
    </div>
  );
}

export default function FocusGroupPage() {
  const [assetType, setAssetType] = useState("caption");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FocusGroupResult | null>(null);

  const handleSubmit = async () => {
    if (!content.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/validate/focus-group", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, assetType }),
      });
      const data = await res.json();
      setResult(data);
    } finally {
      setLoading(false);
    }
  };

  function initials(name: string) {
    return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  }

  return (
    <div style={{ padding: "clamp(24px, 3.5vw, 44px) clamp(20px, 4vw, 52px) 90px" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: "clamp(26px, 4vh, 40px)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
            <span style={{ width: 38, height: 38, borderRadius: 11, background: "color-mix(in oklab, var(--terra) 14%, transparent)", color: "var(--terra)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>
            </span>
            <h1 style={{ fontFamily: "'General Sans'", fontWeight: 600, fontSize: "clamp(27px, 3.2vw, 40px)", lineHeight: 1.05, letterSpacing: "-0.03em", margin: 0 }}>
              AI Focus <span style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic", fontWeight: 400, color: "var(--terra)" }}>Group</span>
            </h1>
          </div>
          <p style={{ fontFamily: "'Newsreader', serif", fontSize: 17, lineHeight: 1.5, color: "var(--muted)", margin: 0, maxWidth: "56ch" }}>
            Simulate <strong style={{ color: "var(--ink)", fontWeight: 600 }}>5 Pakistani audience personas</strong> reacting to your brand content.
          </p>
        </div>

        {/* Type tabs */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
          {ASSET_TYPES.map((t) => (
            <button key={t} onClick={() => setAssetType(t)} className={`fg-tab${assetType === t ? " sel" : ""}`}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* Input */}
        <div style={{ borderRadius: 20, border: "1px solid var(--line)", background: "var(--surface)", padding: "clamp(20px, 3vw, 28px)", marginBottom: 24 }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--muted)", marginBottom: 7 }}>Your content *</label>
          <textarea
            className="gf-field"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={`Enter your ${assetType} here...`}
            style={{ minHeight: 110, resize: "vertical", fontFamily: "'General Sans', sans-serif", marginBottom: 14 }}
          />
          <button
            onClick={handleSubmit}
            disabled={loading || !content.trim()}
            style={{ display: "inline-flex", alignItems: "center", gap: 9, padding: "13px 24px", borderRadius: 999, border: "none", background: "var(--terra)", color: "#fff", fontFamily: "'General Sans'", fontWeight: 600, fontSize: 15, cursor: loading || !content.trim() ? "not-allowed" : "pointer", opacity: loading || !content.trim() ? 0.6 : 1 }}
          >
            <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24"><path d="M5 3l14 9-14 9V3z"/></svg>
            {loading ? "Gathering reactions…" : "Run Focus Group"}
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: "40px 0" }}>
            {[0, 1, 2].map((i) => (
              <div key={i} className="fg-blink" style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--terra)", animationDelay: `${i * 0.18}s` }} />
            ))}
            <span style={{ fontFamily: "'General Sans'", fontSize: 14, color: "var(--muted)", marginLeft: 8 }}>Assembling your Pakistani focus group…</span>
          </div>
        )}

        {/* Results */}
        {result && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Consensus */}
            <div style={{ borderRadius: 20, border: "1px solid var(--line)", background: "var(--surface)", padding: "clamp(18px, 2.5vw, 24px)", display: "flex", gap: 24, alignItems: "center" }}>
              <ConsensusRing score={result.averageScore} />
              <div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: ".16em", textTransform: "uppercase" as const, color: "var(--muted)", marginBottom: 6 }}>Group consensus</div>
                <p style={{ fontFamily: "'Newsreader', serif", fontSize: 16, lineHeight: 1.55, color: "var(--ink)", margin: 0 }}>{result.groupConsensus}</p>
              </div>
            </div>

            {/* Persona grid */}
            <div className="fg-persona">
              {result.personas?.map((p, i) => (
                <div key={i} className="fg-card" style={{ animationDelay: `${i * 0.08}s` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: "50%", background: AVATAR_COLORS[i % AVATAR_COLORS.length], display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <span style={{ fontFamily: "'General Sans'", fontWeight: 700, fontSize: 14, color: "#fff" }}>{initials(p.name)}</span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: "'General Sans'", fontWeight: 600, fontSize: 14, color: "var(--ink)" }}>{p.name}</div>
                      <div style={{ fontFamily: "'Newsreader', serif", fontSize: 12, color: "var(--muted)" }}>{p.age}y · {p.city} · {p.occupation}</div>
                    </div>
                    <div style={{ fontFamily: "'General Sans'", fontWeight: 700, fontSize: 20, color: p.score >= 8 ? "var(--sig)" : p.score >= 5 ? "var(--olive)" : "var(--terra)", flexShrink: 0 }}>
                      {p.score}<span style={{ fontSize: 11, fontWeight: 400, color: "var(--muted)" }}>/10</span>
                    </div>
                  </div>
                  <p style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic", fontSize: 14, lineHeight: 1.5, color: "var(--ink)", margin: "0 0 8px", paddingLeft: 12, borderLeft: "2px solid var(--terra)" }}>"{p.quote}"</p>
                  <p style={{ fontFamily: "'General Sans'", fontSize: 12, color: "var(--muted)", margin: 0, lineHeight: 1.5 }}>{p.suggestion}</p>
                </div>
              ))}
            </div>

            {/* Insights */}
            <div className="fg-insights" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
              <div style={{ borderRadius: 16, border: "1px solid color-mix(in oklab, var(--sig) 25%, var(--line))", background: "color-mix(in oklab, var(--sig) 5%, var(--surface))", padding: "16px 18px" }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase" as const, color: "var(--sig)", marginBottom: 6 }}>Top Strength</div>
                <p style={{ fontFamily: "'Newsreader', serif", fontSize: 14, color: "var(--ink)", margin: 0, lineHeight: 1.5 }}>{result.topStrength}</p>
              </div>
              <div style={{ borderRadius: 16, border: "1px solid color-mix(in oklab, var(--terra) 25%, var(--line))", background: "color-mix(in oklab, var(--terra) 5%, var(--surface))", padding: "16px 18px" }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase" as const, color: "var(--terra)", marginBottom: 6 }}>Top Concern</div>
                <p style={{ fontFamily: "'Newsreader', serif", fontSize: 14, color: "var(--ink)", margin: 0, lineHeight: 1.5 }}>{result.topConcern}</p>
              </div>
              <div style={{ borderRadius: 16, border: "1px solid var(--line)", background: "var(--surface)", padding: "16px 18px" }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase" as const, color: "var(--muted)", marginBottom: 6 }}>Recommendation</div>
                <p style={{ fontFamily: "'Newsreader', serif", fontSize: 14, color: "var(--ink)", margin: 0, lineHeight: 1.5 }}>{result.recommendation}</p>
              </div>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!result && !loading && (
          <div style={{ textAlign: "center", padding: "50px 20px", border: "1.5px dashed var(--line)", borderRadius: 22, background: "var(--surface)" }}>
            <span style={{ display: "inline-flex", width: 60, height: 60, borderRadius: 16, background: "color-mix(in oklab, var(--terra) 12%, transparent)", color: "var(--terra)", alignItems: "center", justifyContent: "center", fontSize: 28, marginBottom: 16 }}>👥</span>
            <div style={{ fontFamily: "'General Sans'", fontWeight: 600, fontSize: 20, marginBottom: 6 }}>Simulate your audience.</div>
            <p style={{ fontFamily: "'Newsreader', serif", fontSize: 15, color: "var(--muted)", margin: 0 }}>Paste any brand content to see how 5 Pakistani personas would react.</p>
          </div>
        )}
      </div>
    </div>
  );
}
