"use client";

import { useState } from "react";

interface Tagline {
  tagline: string;
  style: string;
  note: string;
}

export default function TaglinesPage() {
  const [form, setForm] = useState({ brandName: "", industry: "", tone: "", audience: "", uniqueValue: "" });
  const [taglines, setTaglines] = useState<Tagline[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<number | null>(null);
  const [saved, setSaved] = useState<Record<number, boolean>>({});

  function update(k: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));
  }

  async function generate() {
    if (!form.brandName.trim()) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/generate/taglines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandName: form.brandName,
          industry: form.industry,
          tone: form.tone ? form.tone.split(",").map((t) => t.trim()) : [],
          audience: form.audience,
          uniqueValue: form.uniqueValue,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setTaglines(data.taglines);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Generation failed");
    }
    setLoading(false);
  }

  function copyTagline(text: string, idx: number) {
    try { navigator.clipboard.writeText(text); } catch { /* ignore */ }
    setCopied(idx);
    setTimeout(() => setCopied(null), 1500);
  }

  function toggleSave(idx: number) {
    setSaved((prev) => ({ ...prev, [idx]: !prev[idx] }));
  }

  return (
    <div style={{ padding: "clamp(24px, 3.5vw, 44px) clamp(20px, 4vw, 52px) 90px" }}>
      <div style={{ maxWidth: 980, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: "clamp(26px, 4vh, 40px)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
            <span style={{ width: 38, height: 38, borderRadius: 11, background: "color-mix(in oklab, var(--sig) 14%, transparent)", color: "var(--sig)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontFamily: "'Instrument Serif', serif", fontStyle: "italic", fontSize: 22 }}>"</span>
            <h1 style={{ fontFamily: "'General Sans'", fontWeight: 600, fontSize: "clamp(27px, 3.2vw, 40px)", lineHeight: 1.05, letterSpacing: "-0.03em", margin: 0 }}>
              Tagline <span style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic", fontWeight: 400, color: "var(--sig)" }}>Generator</span>
            </h1>
          </div>
          <p style={{ fontFamily: "'Newsreader', serif", fontSize: 17, lineHeight: 1.5, color: "var(--muted)", margin: 0, maxWidth: "56ch" }}>
            8 taglines across emotional styles — including <strong style={{ color: "var(--ink)", fontWeight: 600 }}>Urdu-inspired</strong> options.
          </p>
        </div>

        {/* Input card */}
        <div style={{ borderRadius: 20, border: "1px solid var(--line)", background: "var(--surface)", padding: "clamp(20px, 3vw, 28px)", marginBottom: "clamp(26px, 4vh, 40px)", position: "relative", overflow: "hidden" }}>
          <svg aria-hidden="true" width="18" height="18" viewBox="0 0 40 40" fill="var(--sig)" style={{ position: "absolute", top: 16, right: 18, animation: "ds-twinkle 3.2s ease-in-out infinite" }}><path d="M20 0c3 13 7 17 20 20-13 3-17 7-20 20-3-13-7-17-20-20C13 17 17 13 20 0Z"/></svg>

          <div className="tg-inputs" style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr 1fr", gap: 16, marginBottom: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--muted)", marginBottom: 7 }}>Brand name *</label>
              <input className="gf-field" type="text" placeholder="e.g. Zindagi Organics" value={form.brandName} onChange={update("brandName")} onKeyDown={(e) => e.key === "Enter" && generate()} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--muted)", marginBottom: 7 }}>Industry</label>
              <input className="gf-field" type="text" placeholder="e.g. Organic food" value={form.industry} onChange={update("industry")} onKeyDown={(e) => e.key === "Enter" && generate()} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--muted)", marginBottom: 7 }}>Tone</label>
              <input className="gf-field" type="text" placeholder="bold, warm, playful" value={form.tone} onChange={update("tone")} onKeyDown={(e) => e.key === "Enter" && generate()} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--muted)", marginBottom: 7 }}>Unique value</label>
              <input className="gf-field" type="text" placeholder="e.g. 100% desi ingredients" value={form.uniqueValue} onChange={update("uniqueValue")} onKeyDown={(e) => e.key === "Enter" && generate()} />
            </div>
          </div>

          <div style={{ marginBottom: 18 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--muted)", marginBottom: 7 }}>Target audience</label>
            <input className="gf-field" type="text" placeholder="e.g. Urban Pakistani women 25–40" value={form.audience} onChange={update("audience")} style={{ maxWidth: 400 }} />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 13, flexWrap: "wrap" }}>
            <button
              onClick={generate}
              disabled={loading || !form.brandName.trim()}
              style={{ display: "inline-flex", alignItems: "center", gap: 9, padding: "13px 24px", borderRadius: 999, border: "none", background: "var(--sig)", color: "var(--onSig)", fontFamily: "'General Sans'", fontWeight: 600, fontSize: 15, cursor: loading || !form.brandName.trim() ? "not-allowed" : "pointer", opacity: loading || !form.brandName.trim() ? 0.6 : 1 }}
            >
              <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24"><path d="M5 3l14 9-14 9V3z"/></svg>
              {loading ? "Writing taglines…" : taglines ? "Regenerate 8" : "Generate 8 taglines"}
            </button>
          </div>

          {error && (
            <p style={{ marginTop: 14, fontFamily: "'General Sans'", fontSize: 14, color: "var(--terra)", background: "color-mix(in oklab, var(--terra) 10%, var(--surface))", border: "1px solid color-mix(in oklab, var(--terra) 25%, var(--line))", borderRadius: 12, padding: "12px 16px" }}>{error}</p>
          )}
        </div>

        {/* Results */}
        {taglines && (
          <>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--muted)" }}>
                {taglines.length} taglines generated
              </div>
              <div style={{ fontFamily: "'General Sans'", fontSize: 13, color: "var(--muted)" }}>
                <svg width="14" height="14" fill="var(--terra)" viewBox="0 0 24 24" style={{ verticalAlign: "middle", marginRight: 5 }}><path d="M12 21s-7-4.6-9.3-9C1 8.5 2.7 5 6.2 5c2 0 3.3 1.2 3.8 2.3C10.5 6.2 11.8 5 13.8 5c3.5 0 5.2 3.5 3.5 7-2.3 4.4-9.3 9-9.3 9z"/></svg>
                {Object.values(saved).filter(Boolean).length} saved
              </div>
            </div>
            <div className="tg-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {taglines.map((t, idx) => (
                <div
                  key={idx}
                  className="tg-row"
                  style={{ animationDelay: `${idx * 0.05}s`, border: `1px solid ${saved[idx] ? "color-mix(in oklab, var(--terra) 45%, var(--line))" : "var(--line)"}`, background: "var(--surface)", borderRadius: 16, padding: "18px 20px" }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: "'General Sans'", fontWeight: 700, fontSize: 18, lineHeight: 1.3, letterSpacing: "-0.015em", marginBottom: 6 }}>
                        &ldquo;{t.tagline}&rdquo;
                      </div>
                      <div style={{ fontFamily: "'Newsreader', serif", fontStyle: "italic", fontSize: 13, color: "var(--muted)", lineHeight: 1.4 }}>{t.note}</div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 7, flexShrink: 0 }}>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--muted)", background: "var(--surf2)", border: "1px solid var(--line)", borderRadius: 999, padding: "3px 8px" }}>{t.style}</span>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          onClick={() => toggleSave(idx)}
                          aria-label="Save"
                          className="tg-iconbtn"
                          style={{ color: saved[idx] ? "var(--terra)" : undefined, borderColor: saved[idx] ? "var(--terra)" : undefined }}
                        >
                          <svg width="15" height="15" fill={saved[idx] ? "var(--terra)" : "none"} stroke={saved[idx] ? "var(--terra)" : "currentColor"} strokeWidth="1.8" viewBox="0 0 24 24"><path d="M12 21s-7-4.6-9.3-9C1 8.5 2.7 5 6.2 5c2 0 3.3 1.2 3.8 2.3C10.5 6.2 11.8 5 13.8 5c3.5 0 5.2 3.5 3.5 7-2.3 4.4-9.3 9-9.3 9z"/></svg>
                        </button>
                        <button
                          onClick={() => copyTagline(t.tagline, idx)}
                          aria-label="Copy"
                          className="tg-iconbtn"
                          style={{ color: copied === idx ? "var(--leaf)" : undefined }}
                        >
                          {copied === idx
                            ? <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>
                            : <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 012-2h10"/></svg>
                          }
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Empty state */}
        {!taglines && !loading && (
          <div style={{ marginTop: 40, textAlign: "center", padding: "50px 20px", border: "1.5px dashed var(--line)", borderRadius: 22, background: "var(--surface)" }}>
            <span style={{ display: "inline-flex", width: 60, height: 60, borderRadius: 16, background: "color-mix(in oklab, var(--sig) 12%, transparent)", color: "var(--sig)", alignItems: "center", justifyContent: "center", fontFamily: "'Instrument Serif', serif", fontStyle: "italic", fontSize: 32, marginBottom: 16 }}>"</span>
            <div style={{ fontFamily: "'General Sans'", fontWeight: 600, fontSize: 20, marginBottom: 6 }}>8 taglines in seconds.</div>
            <p style={{ fontFamily: "'Newsreader', serif", fontSize: 15, color: "var(--muted)", margin: 0 }}>Add your brand name and hit generate — bold, witty, Urdu-inspired and more.</p>
          </div>
        )}
      </div>
    </div>
  );
}
