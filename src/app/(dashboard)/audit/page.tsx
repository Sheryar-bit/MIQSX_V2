"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";

interface AuditResult {
  overallScore: number;
  colorScore: number;
  typographyScore: number;
  styleScore: number;
  detectedColors: string[];
  detectedFonts: string[];
  violations: Array<{ type: string; description: string; severity: "low" | "medium" | "high" }>;
  strengths: string[];
  recommendations: string[];
}

function colorFor(n: number): string {
  return n >= 80 ? "var(--leaf)" : n >= 60 ? "#E0A93C" : "var(--terra)";
}

function verdictFor(n: number): string {
  return n >= 80 ? "on-brand" : n >= 60 ? "mostly" : "needs work";
}

export default function AuditPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [error, setError] = useState("");

  const onDrop = useCallback((accepted: File[]) => {
    const newFiles = [...files, ...accepted].slice(0, 6);
    setFiles(newFiles);
    setPreviews(newFiles.map((f) => URL.createObjectURL(f)));
  }, [files]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".png", ".jpg", ".jpeg", ".webp"] },
    maxFiles: 6,
  });

  function removeFile(i: number) {
    const nf = files.filter((_, idx) => idx !== i);
    const np = previews.filter((_, idx) => idx !== i);
    setFiles(nf);
    setPreviews(np);
    setResult(null);
  }

  function clearAll() {
    setFiles([]);
    setPreviews([]);
    setResult(null);
    setError("");
  }

  async function runAudit() {
    if (!files.length) return;
    setLoading(true);
    setError("");
    setResult(null);

    const fd = new FormData();
    files.forEach((f) => fd.append("images", f));

    try {
      const res = await fetch("/api/audit", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Audit failed");
      setResult(data.audit);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Audit failed");
    }
    setLoading(false);
  }

  const overallPct = result ? result.overallScore / 100 : 0;
  const ringCircumference = 402;
  const ringOffset = result ? Math.round(ringCircumference * (1 - overallPct)) : ringCircumference;

  const dims = result
    ? [
        { label: "Color", icon: "●", score: result.colorScore, note: result.colorScore >= 80 ? "Palette is consistent across assets." : "Some color drift detected." },
        { label: "Typography", icon: "Aa", score: result.typographyScore, note: result.typographyScore >= 80 ? "Type pairing is on-system." : "Typography inconsistencies found." },
        { label: "Style", icon: "◈", score: result.styleScore, note: result.styleScore >= 80 ? "Visual tone holds together well." : "Style varies across assets." },
      ]
    : [];

  return (
    <div style={{ padding: "clamp(24px, 3.5vw, 44px) clamp(20px, 4vw, 52px) 90px" }}>
      <div style={{ maxWidth: 940, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 20, flexWrap: "wrap", marginBottom: "clamp(26px, 4vh, 40px)" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ width: 38, height: 38, borderRadius: 11, background: "color-mix(in oklab, var(--sig) 14%, transparent)", color: "var(--sig)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M12 2l8 3v6c0 5-3.5 8.5-8 11-4.5-2.5-8-6-8-11V5z"/></svg>
              </span>
              <h1 style={{ fontFamily: "'General Sans'", fontWeight: 600, fontSize: "clamp(28px, 3.2vw, 40px)", lineHeight: 1.05, letterSpacing: "-0.03em", margin: 0 }}>
                Brand <span style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic", fontWeight: 400, color: "var(--sig)" }}>Audit</span>
              </h1>
            </div>
            <p style={{ fontFamily: "'Newsreader', serif", fontSize: 17, lineHeight: 1.5, color: "var(--muted)", margin: "12px 0 0", maxWidth: "56ch" }}>
              Upload 2–6 brand assets (logos, posts, banners). The Guardian scores consistency across <strong style={{ color: "var(--ink)", fontWeight: 600 }}>color</strong>, <strong style={{ color: "var(--ink)", fontWeight: 600 }}>typography</strong>, and <strong style={{ color: "var(--ink)", fontWeight: 600 }}>style</strong>.
            </p>
          </div>
        </div>

        {/* Dropzone */}
        <div style={{ marginBottom: "clamp(26px, 4vh, 40px)" }}>
          <div
            {...getRootProps()}
            className={`ba-drop${isDragActive ? " drag" : ""}`}
            style={{ position: "relative", border: "1.5px dashed var(--line)", borderRadius: 22, background: "var(--surface)", padding: "clamp(34px, 6vh, 60px) 24px", textAlign: "center", cursor: "pointer", overflow: "hidden" }}
          >
            <input {...getInputProps()} />
            <svg aria-hidden="true" width="20" height="20" viewBox="0 0 40 40" fill="var(--terra)" style={{ position: "absolute", top: "16%", right: "13%", animation: "ds-twinkle 3.3s ease-in-out infinite" }}><path d="M20 0c3 13 7 17 20 20-13 3-17 7-20 20-3-13-7-17-20-20C13 17 17 13 20 0Z"/></svg>
            <span style={{ display: "inline-flex", width: 58, height: 58, borderRadius: "50%", background: "color-mix(in oklab, var(--sig) 12%, transparent)", color: "var(--sig)", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
              <svg width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M12 16V4M7 9l5-5 5 5M5 20h14"/></svg>
            </span>
            <div style={{ fontFamily: "'General Sans'", fontWeight: 700, fontSize: 19, marginBottom: 6 }}>
              {isDragActive ? "Drop your assets here" : "Drag & drop brand assets"}
            </div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "var(--muted)" }}>or click to browse · PNG, JPG, WebP · up to 6 files</div>
          </div>

          {/* Thumbnails */}
          {previews.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 16 }}>
              {previews.map((p, i) => (
                <div key={i} className="ba-asset" style={{ position: "relative", width: 104 }}>
                  <div style={{ height: 104, borderRadius: 14, backgroundImage: `url(${p})`, backgroundSize: "cover", backgroundPosition: "center", border: "1px solid var(--line)", position: "relative", overflow: "hidden" }} />
                  <button
                    onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                    aria-label="Remove"
                    style={{ position: "absolute", top: -7, right: -7, width: 22, height: 22, borderRadius: "50%", border: "1px solid var(--line)", background: "var(--bg)", color: "var(--ink)", cursor: "pointer", fontSize: 12, lineHeight: 1, display: "inline-flex", alignItems: "center", justifyContent: "center" }}
                  >×</button>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "var(--muted)", marginTop: 6, textAlign: "center", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{files[i]?.name}</div>
                </div>
              ))}
            </div>
          )}

          {/* Action row */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 20, flexWrap: "wrap" }}>
            <button
              onClick={runAudit}
              disabled={files.length < 1 || loading}
              style={{
                display: "inline-flex", alignItems: "center", gap: 9, padding: "13px 24px", borderRadius: 999, border: "none",
                background: files.length < 1 || loading ? "var(--surf2)" : "var(--sig)",
                color: files.length < 1 || loading ? "var(--muted)" : "var(--onSig)",
                fontFamily: "'General Sans'", fontWeight: 600, fontSize: 15,
                cursor: files.length < 1 || loading ? "not-allowed" : "pointer",
                opacity: files.length < 1 || loading ? 0.7 : 1,
              }}
            >
              <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24"><path d="M12 2l8 3v6c0 5-3.5 8.5-8 11-4.5-2.5-8-6-8-11V5z"/></svg>
              {loading ? "Auditing…" : `Audit ${files.length} asset${files.length !== 1 ? "s" : ""}`}
            </button>
            {files.length > 0 && (
              <button onClick={clearAll} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "'General Sans'", fontSize: 14, fontWeight: 500, color: "var(--muted)", textDecoration: "underline", textUnderlineOffset: 3 }}>Clear all</button>
            )}
            {files.length === 0 && (
              <span style={{ fontFamily: "'Newsreader', serif", fontStyle: "italic", fontSize: 15, color: "var(--muted)" }}>Add at least 2 assets to run.</span>
            )}
            {files.length === 1 && (
              <span style={{ fontFamily: "'Newsreader', serif", fontStyle: "italic", fontSize: 15, color: "var(--muted)" }}>One more to go…</span>
            )}
          </div>

          {error && (
            <p style={{ marginTop: 16, fontFamily: "'General Sans'", fontSize: 14, color: "var(--terra)", background: "color-mix(in oklab, var(--terra) 10%, var(--surface))", border: "1px solid color-mix(in oklab, var(--terra) 25%, var(--line))", borderRadius: 12, padding: "12px 16px" }}>{error}</p>
          )}
        </div>

        {/* Scanning */}
        {loading && (
          <div style={{ marginTop: 34, borderRadius: 20, border: "1px solid var(--line)", background: "var(--surface)", padding: 30, textAlign: "center", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", left: 0, right: 0, height: 2, background: "linear-gradient(90deg, transparent, var(--sig), transparent)", animation: "mb-scan 1.4s ease-in-out infinite" }} />
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, letterSpacing: ".1em", color: "var(--sig)" }}>ANALYSING {files.length} ASSETS…</div>
            <div style={{ fontFamily: "'Newsreader', serif", fontStyle: "italic", fontSize: 15, color: "var(--muted)", marginTop: 8 }}>Extracting palettes · matching type · scoring style</div>
          </div>
        )}

        {/* Results */}
        {result && !loading && (
          <div style={{ animation: "mb-rise .55s cubic-bezier(.2,.7,.2,1) both" }}>
            <div className="ba-results-grid" style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 20, alignItems: "start" }}>

              {/* Overall score ring */}
              <div style={{ borderRadius: 22, border: "1px solid var(--line)", background: "var(--surface)", padding: 26, textAlign: "center", position: "relative", overflow: "hidden" }}>
                <svg aria-hidden="true" width="18" height="18" viewBox="0 0 40 40" fill="var(--terra)" style={{ position: "absolute", top: 14, right: 16, animation: "ds-twinkle 3s ease-in-out infinite" }}><path d="M20 0c3 13 7 17 20 20-13 3-17 7-20 20-3-13-7-17-20-20C13 17 17 13 20 0Z"/></svg>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 16 }}>Overall consistency</div>
                <div style={{ position: "relative", width: 150, height: 150, margin: "0 auto" }}>
                  <svg width="150" height="150" viewBox="0 0 150 150">
                    <circle cx="75" cy="75" r="64" fill="none" stroke="var(--surf2)" strokeWidth="13"/>
                    <circle cx="75" cy="75" r="64" fill="none" stroke={colorFor(result.overallScore)} strokeWidth="13" strokeLinecap="round" strokeDasharray={ringCircumference} strokeDashoffset={ringOffset} transform="rotate(-90 75 75)" style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(.2,.7,.2,1)" }}/>
                  </svg>
                  <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontFamily: "'General Sans'", fontWeight: 700, fontSize: 44, lineHeight: 1, color: "var(--ink)" }}>{result.overallScore}</span>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", color: colorFor(result.overallScore) }}>{verdictFor(result.overallScore)}</span>
                  </div>
                </div>
                <div style={{ fontFamily: "'Newsreader', serif", fontStyle: "italic", fontSize: 15, lineHeight: 1.5, color: "var(--muted)", marginTop: 18 }}>
                  {result.overallScore >= 80 ? "Strong, cohesive identity — ship with confidence." : result.overallScore >= 60 ? "Mostly on-brand, with a couple of fixes to make." : "Inconsistent — a few assets pull against your DNA."}
                </div>

                {/* Detected colors */}
                {result.detectedColors && result.detectedColors.length > 0 && (
                  <div style={{ marginTop: 18, paddingTop: 16, borderTop: "1px solid var(--line)" }}>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 8 }}>Detected colors</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center" }}>
                      {result.detectedColors.slice(0, 6).map((c) => (
                        <div key={c} title={c} style={{ width: 22, height: 22, borderRadius: 6, backgroundColor: c, border: "1px solid var(--line)" }} />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Breakdown + violations */}
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {/* Dimension bars */}
                <div style={{ borderRadius: 20, border: "1px solid var(--line)", background: "var(--surface)", padding: 22 }}>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 16 }}>Breakdown</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
                    {dims.map((d) => (
                      <div key={d.label}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 7 }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 9, fontSize: 14, fontWeight: 600 }}>
                            <span style={{ color: colorFor(d.score) }}>{d.icon}</span>{d.label}
                          </span>
                          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: 14, color: colorFor(d.score) }}>{d.score}</span>
                        </div>
                        <div style={{ height: 8, borderRadius: 999, background: "var(--surf2)", overflow: "hidden" }}>
                          <div style={{ width: `${d.score}%`, height: "100%", background: colorFor(d.score), transition: "width 1s cubic-bezier(.2,.7,.2,1)" }} />
                        </div>
                        <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 6 }}>{d.note}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Violations */}
                {result.violations && result.violations.length > 0 && (
                  <div style={{ borderRadius: 20, border: "1px solid var(--line)", background: "var(--surface)", padding: 22 }}>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 14 }}>Issues found ({result.violations.length})</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {result.violations.map((v, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 14px", borderRadius: 12, background: "var(--surf2)", border: "1px solid var(--line)" }}>
                          <span style={{ flex: "0 0 auto", fontFamily: "'JetBrains Mono', monospace", fontSize: 10, padding: "3px 8px", borderRadius: 999, fontWeight: 700, background: v.severity === "high" ? "color-mix(in oklab, var(--terra) 20%, transparent)" : "var(--surf2)", color: v.severity === "high" ? "var(--terra)" : "var(--muted)", border: `1px solid ${v.severity === "high" ? "color-mix(in oklab, var(--terra) 30%, transparent)" : "var(--line)"}` }}>{v.severity}</span>
                          <div>
                            <div style={{ fontFamily: "'General Sans'", fontWeight: 600, fontSize: 14, color: "var(--ink)" }}>{v.type}</div>
                            <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 2 }}>{v.description}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Strengths + recommendations */}
                {(result.strengths?.length > 0 || result.recommendations?.length > 0) && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    {result.strengths && result.strengths.length > 0 && (
                      <div style={{ borderRadius: 16, border: "1px solid color-mix(in oklab, var(--leaf) 30%, var(--line))", background: "color-mix(in oklab, var(--leaf) 7%, var(--surface))", padding: 18 }}>
                        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--leaf)", marginBottom: 12 }}>Strengths</div>
                        <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
                          {result.strengths.map((s) => (
                            <li key={s} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 13, color: "var(--muted)" }}>
                              <span style={{ color: "var(--leaf)", marginTop: 1 }}>✓</span> {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {result.recommendations && result.recommendations.length > 0 && (
                      <div style={{ borderRadius: 16, border: "1px solid color-mix(in oklab, var(--sig) 30%, var(--line))", background: "color-mix(in oklab, var(--sig) 7%, var(--surface))", padding: 18 }}>
                        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--sig)", marginBottom: 12 }}>Recommendations</div>
                        <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
                          {result.recommendations.map((r) => (
                            <li key={r} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 13, color: "var(--muted)" }}>
                              <span style={{ color: "var(--sig)", marginTop: 1 }}>→</span> {r}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <button onClick={clearAll} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 22px", borderRadius: 999, border: "1px solid var(--line)", background: "var(--surface)", color: "var(--ink)", fontFamily: "'General Sans'", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
                    <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 12a9 9 0 109-9 9 9 0 00-7 3.3L3 9M3 4v5h5"/></svg>
                    Run another audit
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
