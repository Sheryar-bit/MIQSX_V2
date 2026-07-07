"use client";

import { useState } from "react";

interface NameResult {
  name: string;
  rationale: string;
  type: string;
  domainCom: { available: boolean; checked: boolean };
  domainPk: { available: boolean; checked: boolean };
}

export default function NamesPage() {
  const [keywords, setKeywords] = useState("");
  const [industry, setIndustry] = useState("");
  const [style, setStyle] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<NameResult[] | null>(null);
  const [error, setError] = useState("");
  const [favs, setFavs] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState("");

  async function generate() {
    if (!keywords.trim() && !industry.trim()) return;
    setLoading(true);
    setError("");
    setResults(null);
    setFavs({});

    try {
      const res = await fetch("/api/names", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keywords, industry, style }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResults(data.names);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Generation failed");
    }
    setLoading(false);
  }

  function toggleFav(name: string) {
    setFavs((prev) => ({ ...prev, [name]: !prev[name] }));
  }

  function copyName(name: string) {
    try { navigator.clipboard.writeText(name); } catch { /* ignore */ }
    setCopied(name);
    setTimeout(() => setCopied(""), 1500);
  }

  function preset(kw: string, ind: string, sty: string) {
    setKeywords(kw); setIndustry(ind); setStyle(sty);
    setResults(null); setFavs({});
  }

  const availCount = results ? results.filter((r) => r.domainCom?.available).length : 0;
  const favCount = Object.values(favs).filter(Boolean).length;

  return (
    <div style={{ padding: "clamp(24px, 3.5vw, 44px) clamp(20px, 4vw, 52px) 90px" }}>
      <div style={{ maxWidth: 960, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 20, flexWrap: "wrap", marginBottom: "clamp(26px, 4vh, 40px)" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ width: 38, height: 38, borderRadius: 11, background: "color-mix(in oklab, var(--terra) 16%, transparent)", color: "var(--terra)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontFamily: "'Instrument Serif', serif", fontStyle: "italic", fontSize: 22 }}>N</span>
              <h1 style={{ fontFamily: "'General Sans'", fontWeight: 600, fontSize: "clamp(27px, 3.2vw, 40px)", lineHeight: 1.05, letterSpacing: "-0.03em", margin: 0 }}>
                Brand Name <span style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic", fontWeight: 400, color: "var(--sig)" }}>Generator</span>
              </h1>
            </div>
            <p style={{ fontFamily: "'Newsreader', serif", fontSize: 17, lineHeight: 1.5, color: "var(--muted)", margin: "12px 0 0", maxWidth: "56ch" }}>
              Generate 10 brandable names from your essence — each checked for <strong style={{ color: "var(--ink)", fontWeight: 600 }}>.com</strong> and <strong style={{ color: "var(--ink)", fontWeight: 600 }}>.pk</strong> availability.
            </p>
          </div>
        </div>

        {/* Input card */}
        <div style={{ borderRadius: 20, border: "1px solid var(--line)", background: "var(--surface)", padding: "clamp(20px, 3vw, 28px)", position: "relative", overflow: "hidden", marginBottom: "clamp(26px, 4vh, 40px)" }}>
          <svg aria-hidden="true" width="18" height="18" viewBox="0 0 40 40" fill="var(--terra)" style={{ position: "absolute", top: 16, right: 18, animation: "ds-twinkle 3.2s ease-in-out infinite" }}><path d="M20 0c3 13 7 17 20 20-13 3-17 7-20 20-3-13-7-17-20-20C13 17 17 13 20 0Z"/></svg>

          <div className="ng-inputs" style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr 1fr", gap: 16, marginBottom: 18 }}>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--muted)", marginBottom: 7 }}>Keywords / brand essence</label>
              <input className="ng-field" type="text" placeholder="e.g. fresh, homemade, warm" value={keywords} onChange={(e) => setKeywords(e.target.value)} onKeyDown={(e) => e.key === "Enter" && generate()} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--muted)", marginBottom: 7 }}>Industry</label>
              <input className="ng-field" type="text" placeholder="e.g. bakery, F&B" value={industry} onChange={(e) => setIndustry(e.target.value)} onKeyDown={(e) => e.key === "Enter" && generate()} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--muted)", marginBottom: 7 }}>Naming style</label>
              <input className="ng-field" type="text" placeholder="e.g. Urdu-inspired" value={style} onChange={(e) => setStyle(e.target.value)} onKeyDown={(e) => e.key === "Enter" && generate()} />
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 13, flexWrap: "wrap" }}>
            <button
              onClick={generate}
              disabled={loading || (!keywords.trim() && !industry.trim())}
              style={{ display: "inline-flex", alignItems: "center", gap: 9, padding: "13px 24px", borderRadius: 999, border: "none", background: "var(--sig)", color: "var(--onSig)", fontFamily: "'General Sans'", fontWeight: 600, fontSize: 15, cursor: loading || (!keywords.trim() && !industry.trim()) ? "not-allowed" : "pointer", opacity: loading || (!keywords.trim() && !industry.trim()) ? 0.6 : 1 }}
            >
              <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24"><path d="M5 3l14 9-14 9V3z"/></svg>
              {loading ? "Generating + checking domains…" : results ? "Regenerate 10" : "Generate 10 names"}
            </button>
            <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
              {[
                { label: "🥐 bakery", kw: "fresh, homemade, warm", ind: "bakery", sty: "Urdu-inspired" },
                { label: "⚡ tech", kw: "fast, smart, cloud", ind: "SaaS", sty: "modern" },
                { label: "👗 fashion", kw: "elegant, bold, threads", ind: "fashion", sty: "premium" },
              ].map((p) => (
                <button key={p.label} onClick={() => preset(p.kw, p.ind, p.sty)} style={{ cursor: "pointer", fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "var(--muted)", background: "var(--surf2)", border: "1px solid var(--line)", borderRadius: 999, padding: "6px 12px" }}>{p.label}</button>
              ))}
            </div>
          </div>

          {error && (
            <p style={{ marginTop: 14, fontFamily: "'General Sans'", fontSize: 14, color: "var(--terra)", background: "color-mix(in oklab, var(--terra) 10%, var(--surface))", border: "1px solid color-mix(in oklab, var(--terra) 25%, var(--line))", borderRadius: 12, padding: "12px 16px" }}>{error}</p>
          )}
        </div>

        {/* Results */}
        {results && (
          <>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--muted)" }}>
                10 candidates · <span style={{ color: "var(--leaf)" }}>{availCount} available</span>
              </div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: "'General Sans'", fontSize: 13, color: "var(--muted)" }}>
                <svg width="15" height="15" fill="var(--terra)" viewBox="0 0 24 24"><path d="M12 21s-7-4.6-9.3-9C1 8.5 2.7 5 6.2 5c2 0 3.3 1.2 3.8 2.3C10.5 6.2 11.8 5 13.8 5c3.5 0 5.2 3.5 3.5 7-2.3 4.4-9.3 9-9.3 9z"/></svg>
                {favCount} shortlisted
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
              {results.map((r, idx) => {
                const isFav = !!favs[r.name];
                const comAvail = r.domainCom?.available;
                const pkAvail = r.domainPk?.available;
                return (
                  <div key={idx} className="ng-row" style={{ animationDelay: `${idx * 0.04}s`, display: "flex", alignItems: "center", gap: 16, border: `1px solid ${isFav ? "color-mix(in oklab, var(--terra) 45%, var(--line))" : "var(--line)"}`, background: "var(--surface)", borderRadius: 15, padding: "15px 18px", flexWrap: "wrap" }}>
                    <span style={{ flex: "0 0 auto", fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "var(--muted)", width: 22 }}>{String(idx + 1).padStart(2, "0")}</span>
                    <div style={{ flex: 1, minWidth: 150 }}>
                      <div style={{ fontFamily: "'General Sans'", fontWeight: 700, fontSize: 21, letterSpacing: "-0.02em" }}>{r.name}</div>
                      <div style={{ fontFamily: "'Newsreader', serif", fontStyle: "italic", fontSize: 13, color: "var(--muted)", marginTop: 2 }}>{r.rationale}</div>
                    </div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {r.domainCom?.checked && (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "'JetBrains Mono', monospace", fontSize: 11, padding: "5px 10px", borderRadius: 999, background: comAvail ? "color-mix(in oklab, var(--leaf) 12%, transparent)" : "var(--surf2)", color: comAvail ? "var(--leaf)" : "var(--muted)", border: `1px solid ${comAvail ? "color-mix(in oklab, var(--leaf) 30%, transparent)" : "var(--line)"}` }}>
                          <span style={{ width: 6, height: 6, borderRadius: "50%", background: comAvail ? "var(--leaf)" : "var(--muted)" }} />
                          .com {comAvail ? "available" : "taken"}
                        </span>
                      )}
                      {r.domainPk?.checked && (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "'JetBrains Mono', monospace", fontSize: 11, padding: "5px 10px", borderRadius: 999, background: pkAvail ? "color-mix(in oklab, var(--leaf) 12%, transparent)" : "var(--surf2)", color: pkAvail ? "var(--leaf)" : "var(--muted)", border: `1px solid ${pkAvail ? "color-mix(in oklab, var(--leaf) 30%, transparent)" : "var(--line)"}` }}>
                          <span style={{ width: 6, height: 6, borderRadius: "50%", background: pkAvail ? "var(--leaf)" : "var(--muted)" }} />
                          .pk {pkAvail ? "available" : "taken"}
                        </span>
                      )}
                    </div>
                    <div style={{ display: "flex", gap: 7 }}>
                      <button onClick={() => toggleFav(r.name)} aria-label="Shortlist" className="ng-iconbtn" style={{ color: isFav ? "var(--terra)" : undefined, borderColor: isFav ? "var(--terra)" : undefined }}>
                        <svg width="16" height="16" fill={isFav ? "var(--terra)" : "none"} stroke={isFav ? "var(--terra)" : "currentColor"} strokeWidth="1.8" viewBox="0 0 24 24"><path d="M12 21s-7-4.6-9.3-9C1 8.5 2.7 5 6.2 5c2 0 3.3 1.2 3.8 2.3C10.5 6.2 11.8 5 13.8 5c3.5 0 5.2 3.5 3.5 7-2.3 4.4-9.3 9-9.3 9z"/></svg>
                      </button>
                      <button onClick={() => copyName(r.name)} aria-label="Copy" className="ng-iconbtn" style={{ color: copied === r.name ? "var(--leaf)" : undefined }}>
                        {copied === r.name
                          ? <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>
                          : <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 012-2h10"/></svg>
                        }
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Empty state */}
        {!results && !loading && (
          <div style={{ marginTop: 40, textAlign: "center", padding: "50px 20px", border: "1.5px dashed var(--line)", borderRadius: 22, background: "var(--surface)" }}>
            <span style={{ display: "inline-flex", width: 60, height: 60, borderRadius: 16, background: "color-mix(in oklab, var(--terra) 12%, transparent)", color: "var(--terra)", alignItems: "center", justifyContent: "center", fontFamily: "'Instrument Serif', serif", fontStyle: "italic", fontSize: 30, marginBottom: 16 }}>Aa</span>
            <div style={{ fontFamily: "'General Sans'", fontWeight: 600, fontSize: 20, marginBottom: 6 }}>Name your brand in seconds.</div>
            <p style={{ fontFamily: "'Newsreader', serif", fontSize: 15, color: "var(--muted)", margin: 0 }}>Add a keyword or two, then hit generate. Or just try a preset above.</p>
          </div>
        )}
      </div>
    </div>
  );
}
