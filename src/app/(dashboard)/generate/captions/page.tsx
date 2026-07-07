"use client";

import { useState } from "react";

interface CaptionResult {
  english: { caption: string; hashtags: string[]; charCount: number };
  urdu: { caption: string; note: string };
  romanUrdu: { caption: string; note: string };
}

const PLATFORMS = ["instagram", "facebook", "linkedin", "twitter", "whatsapp"] as const;
const POST_TYPES = ["product launch", "behind the scenes", "quote", "offer/sale", "milestone", "educational", "festive"] as const;

export default function CaptionsPage() {
  const [topic, setTopic] = useState("");
  const [brandName, setBrandName] = useState("");
  const [platform, setPlatform] = useState<string>("instagram");
  const [postType, setPostType] = useState<string>("product launch");
  const [result, setResult] = useState<CaptionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  async function generate() {
    if (!topic.trim()) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/generate/captions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, brandName, platform, postType }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data.captions);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Generation failed");
    }
    setLoading(false);
  }

  function copyText(text: string, key: string) {
    try { navigator.clipboard.writeText(text); } catch { /* ignore */ }
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  }

  const selectStyle: React.CSSProperties = {
    width: "100%", fontFamily: "'General Sans', sans-serif", fontSize: 15,
    color: "var(--ink)", background: "var(--field)", border: "1px solid var(--line)",
    borderRadius: 12, padding: "13px 15px", outline: "none", appearance: "none",
    boxSizing: "border-box",
  };

  return (
    <div style={{ padding: "clamp(24px, 3.5vw, 44px) clamp(20px, 4vw, 52px) 90px" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: "clamp(26px, 4vh, 40px)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
            <span style={{ width: 38, height: 38, borderRadius: 11, background: "color-mix(in oklab, var(--leaf) 14%, transparent)", color: "var(--leaf)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20"/></svg>
            </span>
            <h1 style={{ fontFamily: "'General Sans'", fontWeight: 600, fontSize: "clamp(27px, 3.2vw, 40px)", lineHeight: 1.05, letterSpacing: "-0.03em", margin: 0 }}>
              Trilingual <span style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic", fontWeight: 400, color: "var(--sig)" }}>Captions</span>
            </h1>
          </div>
          <p style={{ fontFamily: "'Newsreader', serif", fontSize: 17, lineHeight: 1.5, color: "var(--muted)", margin: 0, maxWidth: "56ch" }}>
            One topic → <strong style={{ color: "var(--ink)", fontWeight: 600 }}>English</strong> + <strong style={{ color: "var(--ink)", fontWeight: 600 }}>اردو</strong> + <strong style={{ color: "var(--ink)", fontWeight: 600 }}>Roman Urdu</strong> — in your brand voice.
          </p>
        </div>

        {/* Input card */}
        <div style={{ borderRadius: 20, border: "1px solid var(--line)", background: "var(--surface)", padding: "clamp(20px, 3vw, 28px)", marginBottom: "clamp(26px, 4vh, 40px)", position: "relative", overflow: "hidden" }}>
          <svg aria-hidden="true" width="18" height="18" viewBox="0 0 40 40" fill="var(--leaf)" style={{ position: "absolute", top: 16, right: 18, animation: "ds-twinkle 3.2s ease-in-out infinite" }}><path d="M20 0c3 13 7 17 20 20-13 3-17 7-20 20-3-13-7-17-20-20C13 17 17 13 20 0Z"/></svg>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--muted)", marginBottom: 7 }}>{"What's this post about? *"}</label>
            <textarea
              className="gf-field"
              placeholder="e.g. We just launched our new summer collection with 5 limited-edition fragrances, handcrafted in Lahore"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              style={{ minHeight: 90, resize: "vertical", fontFamily: "'General Sans', sans-serif" }}
            />
          </div>

          <div className="cp-inputs" style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr", gap: 16, marginBottom: 18 }}>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--muted)", marginBottom: 7 }}>Brand name</label>
              <input className="gf-field" type="text" placeholder="e.g. Itr House" value={brandName} onChange={(e) => setBrandName(e.target.value)} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--muted)", marginBottom: 7 }}>Platform</label>
              <select value={platform} onChange={(e) => setPlatform(e.target.value)} style={selectStyle}>
                {PLATFORMS.map((p) => (
                  <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--muted)", marginBottom: 7 }}>Post type</label>
              <select value={postType} onChange={(e) => setPostType(e.target.value)} style={selectStyle}>
                {POST_TYPES.map((p) => (
                  <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={generate}
            disabled={loading || !topic.trim()}
            style={{ display: "inline-flex", alignItems: "center", gap: 9, padding: "13px 24px", borderRadius: 999, border: "none", background: "var(--sig)", color: "var(--onSig)", fontFamily: "'General Sans'", fontWeight: 600, fontSize: 15, cursor: loading || !topic.trim() ? "not-allowed" : "pointer", opacity: loading || !topic.trim() ? 0.6 : 1 }}
          >
            <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24"><path d="M5 3l14 9-14 9V3z"/></svg>
            {loading ? "Writing in 3 languages…" : result ? "Regenerate" : "Generate trilingual captions"}
          </button>

          {error && (
            <p style={{ marginTop: 14, fontFamily: "'General Sans'", fontSize: 14, color: "var(--terra)", background: "color-mix(in oklab, var(--terra) 10%, var(--surface))", border: "1px solid color-mix(in oklab, var(--terra) 25%, var(--line))", borderRadius: 12, padding: "12px 16px" }}>{error}</p>
          )}
        </div>

        {/* Results */}
        {result && (
          <div className="cp-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
            {/* English */}
            <div className="cp-card" style={{ animationDelay: "0s" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontFamily: "'General Sans'", fontWeight: 600, fontSize: 14 }}>English</span>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase" as const, color: "var(--muted)", background: "var(--surf2)", border: "1px solid var(--line)", borderRadius: 999, padding: "2px 7px" }}>EN</span>
                </div>
                <button onClick={() => copyText(result.english?.caption ?? "", "en")} aria-label="Copy" className="cp-iconbtn" style={{ color: copied === "en" ? "var(--leaf)" : undefined }}>
                  {copied === "en"
                    ? <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>
                    : <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 012-2h10"/></svg>
                  }
                </button>
              </div>
              <p style={{ fontFamily: "'Newsreader', serif", fontSize: 14, lineHeight: 1.6, color: "var(--ink)", whiteSpace: "pre-wrap", margin: 0 }}>{result.english?.caption}</p>
              {result.english?.hashtags?.length > 0 && (
                <p style={{ marginTop: 10, fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "var(--muted)", lineHeight: 1.6 }}>{result.english.hashtags.map((h) => `#${h}`).join(" ")}</p>
              )}
            </div>

            {/* Urdu */}
            <div className="cp-card" style={{ animationDelay: ".07s" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontFamily: "'General Sans'", fontWeight: 600, fontSize: 14 }}>اردو</span>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase" as const, color: "var(--muted)", background: "var(--surf2)", border: "1px solid var(--line)", borderRadius: 999, padding: "2px 7px" }}>UR</span>
                </div>
                <button onClick={() => copyText(result.urdu?.caption ?? "", "ur")} aria-label="Copy" className="cp-iconbtn" style={{ color: copied === "ur" ? "var(--leaf)" : undefined }}>
                  {copied === "ur"
                    ? <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>
                    : <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 012-2h10"/></svg>
                  }
                </button>
              </div>
              <p style={{ fontFamily: "'Newsreader', serif", fontSize: 15, lineHeight: 1.8, color: "var(--ink)", whiteSpace: "pre-wrap", textAlign: "right", direction: "rtl", margin: 0 }}>{result.urdu?.caption}</p>
              {result.urdu?.note && <p style={{ marginTop: 10, fontFamily: "'General Sans'", fontSize: 12, color: "var(--muted)", fontStyle: "italic" }}>{result.urdu.note}</p>}
            </div>

            {/* Roman Urdu */}
            <div className="cp-card" style={{ animationDelay: ".14s" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontFamily: "'General Sans'", fontWeight: 600, fontSize: 14 }}>Roman Urdu</span>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase" as const, color: "var(--muted)", background: "var(--surf2)", border: "1px solid var(--line)", borderRadius: 999, padding: "2px 7px" }}>ROM</span>
                </div>
                <button onClick={() => copyText(result.romanUrdu?.caption ?? "", "rom")} aria-label="Copy" className="cp-iconbtn" style={{ color: copied === "rom" ? "var(--leaf)" : undefined }}>
                  {copied === "rom"
                    ? <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>
                    : <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 012-2h10"/></svg>
                  }
                </button>
              </div>
              <p style={{ fontFamily: "'Newsreader', serif", fontSize: 14, lineHeight: 1.6, color: "var(--ink)", whiteSpace: "pre-wrap", margin: 0 }}>{result.romanUrdu?.caption}</p>
              {result.romanUrdu?.note && <p style={{ marginTop: 10, fontFamily: "'General Sans'", fontSize: 12, color: "var(--muted)", fontStyle: "italic" }}>{result.romanUrdu.note}</p>}
            </div>
          </div>
        )}

        {/* Empty state */}
        {!result && !loading && (
          <div style={{ marginTop: 40, textAlign: "center", padding: "50px 20px", border: "1.5px dashed var(--line)", borderRadius: 22, background: "var(--surface)" }}>
            <span style={{ display: "inline-flex", width: 60, height: 60, borderRadius: 16, background: "color-mix(in oklab, var(--leaf) 12%, transparent)", color: "var(--leaf)", alignItems: "center", justifyContent: "center", fontSize: 28, marginBottom: 16 }}>🌐</span>
            <div style={{ fontFamily: "'General Sans'", fontWeight: 600, fontSize: 20, marginBottom: 6 }}>Three languages, one click.</div>
            <p style={{ fontFamily: "'Newsreader', serif", fontSize: 15, color: "var(--muted)", margin: 0 }}>Describe your post and generate EN + اردو + Roman Urdu captions instantly.</p>
          </div>
        )}
      </div>
    </div>
  );
}
