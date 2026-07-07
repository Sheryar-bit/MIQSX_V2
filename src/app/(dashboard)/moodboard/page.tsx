"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";

interface MoodboardResult {
  stylePersonality: string;
  colorPalette: {
    primary?: string;
    secondary?: string;
    accent?: string;
    neutrals?: string[];
  };
  typographyFeel: string;
  visualKeywords: string[];
  moodDescriptors: string[];
  layoutStyle: string;
  brandArchetype: string;
  summary: string;
}

export default function MoodboardPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MoodboardResult | null>(null);
  const [error, setError] = useState("");
  const [favs, setFavs] = useState(false);

  const onDrop = useCallback((accepted: File[]) => {
    const newFiles = [...files, ...accepted].slice(0, 5);
    setFiles(newFiles);
    setPreviews(newFiles.map((f) => URL.createObjectURL(f)));
  }, [files]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    maxFiles: 5,
  });

  function removeFile(i: number) {
    const nf = files.filter((_, idx) => idx !== i);
    setFiles(nf);
    setPreviews(nf.map((f) => URL.createObjectURL(f)));
    setResult(null);
  }

  function clearAll() {
    setFiles([]);
    setPreviews([]);
    setResult(null);
    setError("");
  }

  async function analyze() {
    if (files.length < 2) return;
    setLoading(true);
    setError("");
    setResult(null);

    const fd = new FormData();
    files.forEach((f) => fd.append("images", f));

    try {
      const res = await fetch("/api/moodboard", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data.result);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Analysis failed");
    }
    setLoading(false);
  }

  const paletteColors = result
    ? [
        result.colorPalette.primary,
        result.colorPalette.secondary,
        result.colorPalette.accent,
        ...(result.colorPalette.neutrals || []),
      ].filter(Boolean) as string[]
    : [];

  const allMoods = result
    ? [...(result.moodDescriptors || []), ...(result.visualKeywords || [])].slice(0, 6)
    : [];

  return (
    <div style={{ padding: "clamp(24px, 3.5vw, 44px) clamp(20px, 4vw, 52px) 90px" }}>
      <div style={{ maxWidth: 940, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 20, flexWrap: "wrap", marginBottom: "clamp(26px, 4vh, 40px)" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ width: 38, height: 38, borderRadius: 11, background: "color-mix(in oklab, var(--olive) 18%, transparent)", color: "var(--olive)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2.5"/><circle cx="8.5" cy="8.5" r="1.7"/><path d="M21 15l-5-5L5 21"/></svg>
              </span>
              <h1 style={{ fontFamily: "'General Sans'", fontWeight: 600, fontSize: "clamp(27px, 3.2vw, 40px)", lineHeight: 1.05, letterSpacing: "-0.03em", margin: 0 }}>
                Reverse <span style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic", fontWeight: 400, color: "var(--sig)" }}>Moodboard</span>
              </h1>
            </div>
            <p style={{ fontFamily: "'Newsreader', serif", fontSize: 17, lineHeight: 1.5, color: "var(--muted)", margin: "12px 0 0", maxWidth: "58ch" }}>
              Drop 2–5 images you love from any brand. The AI extracts the shared visual DNA — palette, type, and mood — and merges it into your brand style.
            </p>
          </div>
        </div>

        {/* Dropzone */}
        <div>
          <div
            {...getRootProps()}
            className={`mb-drop${isDragActive ? " drag" : ""}`}
            style={{ position: "relative", border: "1.5px dashed var(--line)", borderRadius: 22, background: "var(--surface)", padding: "clamp(30px, 5vh, 50px) 24px", textAlign: "center", cursor: "pointer", overflow: "hidden" }}
          >
            <input {...getInputProps()} />
            <svg aria-hidden="true" width="20" height="20" viewBox="0 0 40 40" fill="var(--terra)" style={{ position: "absolute", top: "16%", right: "13%", animation: "ds-twinkle 3.3s ease-in-out infinite" }}><path d="M20 0c3 13 7 17 20 20-13 3-17 7-20 20-3-13-7-17-20-20C13 17 17 13 20 0Z"/></svg>
            <span style={{ display: "inline-flex", width: 56, height: 56, borderRadius: "50%", background: "color-mix(in oklab, var(--sig) 12%, transparent)", color: "var(--sig)", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
              <svg width="25" height="25" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M12 16V4M7 9l5-5 5 5M5 20h14"/></svg>
            </span>
            <div style={{ fontFamily: "'General Sans'", fontWeight: 700, fontSize: 19, marginBottom: 6 }}>
              {isDragActive ? "Drop inspiration images" : "Drop inspiration images here"}
            </div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "var(--muted)" }}>
              logos · ads · posts · up to 5
            </div>
          </div>

          {/* Thumbnails */}
          {previews.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 16 }}>
              {previews.map((p, i) => (
                <div key={i} className="mb-tile" style={{ position: "relative", width: 120, height: 120, borderRadius: 16, border: "1px solid var(--line)", overflow: "hidden", backgroundImage: `url(${p})`, backgroundSize: "cover", backgroundPosition: "center" }}>
                  <button
                    onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                    aria-label="Remove"
                    style={{ position: "absolute", top: 6, right: 6, width: 22, height: 22, borderRadius: "50%", border: "none", background: "rgba(20,16,11,.6)", color: "#fff", cursor: "pointer", fontSize: 12, display: "inline-flex", alignItems: "center", justifyContent: "center" }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Action row */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 20, flexWrap: "wrap" }}>
            <button
              onClick={analyze}
              disabled={files.length < 2 || loading}
              style={{
                display: "inline-flex", alignItems: "center", gap: 9, padding: "13px 24px",
                borderRadius: 999, border: "none",
                background: files.length < 2 || loading ? "var(--surf2)" : "var(--sig)",
                color: files.length < 2 || loading ? "var(--muted)" : "var(--onSig)",
                fontFamily: "'General Sans'", fontWeight: 600, fontSize: 15,
                cursor: files.length < 2 || loading ? "not-allowed" : "pointer",
                opacity: files.length < 2 || loading ? 0.7 : 1,
              }}
            >
              <svg width="17" height="17" viewBox="0 0 40 40" fill="currentColor"><path d="M20 2c2.2 9.6 5.2 12.6 14.8 14.8C25.2 19 22.2 22 20 31.6 17.8 22 14.8 19 5.2 16.8 14.8 14.6 17.8 11.6 20 2Z"/></svg>
              {loading ? "Extracting…" : "Extract style DNA"}
            </button>
            {files.length > 0 && (
              <button onClick={clearAll} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "'General Sans'", fontSize: 14, fontWeight: 500, color: "var(--muted)", textDecoration: "underline", textUnderlineOffset: 3 }}>Clear</button>
            )}
            {files.length === 0 && (
              <span style={{ fontFamily: "'Newsreader', serif", fontStyle: "italic", fontSize: 15, color: "var(--muted)" }}>Add at least 2 images.</span>
            )}
            {files.length === 1 && (
              <span style={{ fontFamily: "'Newsreader', serif", fontStyle: "italic", fontSize: 15, color: "var(--muted)" }}>One more…</span>
            )}
          </div>

          {error && (
            <p style={{ marginTop: 16, fontFamily: "'General Sans'", fontSize: 14, color: "var(--terra)", background: "color-mix(in oklab, var(--terra) 10%, var(--surface))", border: "1px solid color-mix(in oklab, var(--terra) 25%, var(--line))", borderRadius: 12, padding: "12px 16px" }}>{error}</p>
          )}
        </div>

        {/* Scanning */}
        {loading && (
          <div style={{ marginTop: 32, borderRadius: 20, border: "1px solid var(--line)", background: "var(--surface)", padding: 30, textAlign: "center", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", left: 0, right: 0, height: 2, background: "linear-gradient(90deg, transparent, var(--sig), transparent)", animation: "mb-scan 1.4s ease-in-out infinite" }} />
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, letterSpacing: ".1em", color: "var(--sig)" }}>EXTRACTING VISUAL DNA…</div>
            <div style={{ fontFamily: "'Newsreader', serif", fontStyle: "italic", fontSize: 15, color: "var(--muted)", marginTop: 8 }}>Sampling colors · reading type · sensing mood</div>
          </div>
        )}

        {/* Result */}
        {result && !loading && (
          <div style={{ marginTop: 32, animation: "mb-rise .55s cubic-bezier(.2,.7,.2,1) both" }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 14 }}>Your extracted style DNA</div>
            <div className="mb-result-grid" style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 18, alignItems: "start" }}>

              {/* Palette card */}
              <div style={{ borderRadius: 20, border: "1px solid var(--line)", background: "var(--surface)", padding: 24, position: "relative", overflow: "hidden" }}>
                <svg aria-hidden="true" width="18" height="18" viewBox="0 0 40 40" fill="var(--terra)" style={{ position: "absolute", top: 16, right: 16, animation: "ds-twinkle 3s ease-in-out infinite" }}><path d="M20 0c3 13 7 17 20 20-13 3-17 7-20 20-3-13-7-17-20-20C13 17 17 13 20 0Z"/></svg>
                <div style={{ fontFamily: "'General Sans'", fontWeight: 700, fontSize: 17, marginBottom: 16 }}>Extracted palette</div>
                <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
                  {paletteColors.slice(0, 5).map((hex, i) => (
                    <div key={hex + i} style={{ flex: 1, animationDelay: `${i * 0.08}s`, animation: "mb-swatch .5s cubic-bezier(.2,.7,.2,1) both" }}>
                      <div style={{ height: 74, borderRadius: 12, backgroundColor: hex, border: "1px solid var(--line)" }} />
                      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9.5, color: "var(--muted)", marginTop: 7, textAlign: "center" }}>{hex}</div>
                    </div>
                  ))}
                </div>
                <div style={{ borderTop: "1px solid var(--line)", paddingTop: 16, display: "flex", gap: 24, flexWrap: "wrap" }}>
                  <div>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 6 }}>Type vibe</div>
                    <div style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic", fontSize: 22 }}>{result.typographyFeel}</div>
                  </div>
                  <div>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 6 }}>Style</div>
                    <div style={{ fontFamily: "'General Sans'", fontWeight: 600, fontSize: 18, color: "var(--terra)" }}>{result.layoutStyle}</div>
                  </div>
                </div>
                {result.summary && (
                  <p style={{ fontFamily: "'Newsreader', serif", fontSize: 14, lineHeight: 1.55, color: "var(--muted)", margin: "14px 0 0" }}>{result.summary}</p>
                )}
              </div>

              {/* Mood + apply */}
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ borderRadius: 20, border: "1px solid var(--line)", background: "var(--surface)", padding: 22 }}>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 14 }}>
                    {result.stylePersonality} · {result.brandArchetype}
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {allMoods.map((m) => (
                      <span key={m} style={{ fontFamily: "'General Sans'", fontSize: 13, fontWeight: 500, padding: "7px 13px", borderRadius: 999, background: "var(--surf2)", color: "var(--ink)", border: "1px solid var(--line)" }}>{m}</span>
                    ))}
                  </div>
                </div>

                <div style={{ borderRadius: 20, border: "1px solid color-mix(in oklab, var(--sig) 30%, var(--line))", background: "color-mix(in oklab, var(--sig) 7%, var(--surface))", padding: 22 }}>
                  <div style={{ fontFamily: "'General Sans'", fontWeight: 700, fontSize: 16, marginBottom: 6 }}>Merge into Brand DNA?</div>
                  <p style={{ fontFamily: "'Newsreader', serif", fontSize: 14, lineHeight: 1.5, color: "var(--muted)", margin: "0 0 16px" }}>This palette and mood will guide every asset you generate next.</p>
                  <button
                    onClick={() => setFavs(true)}
                    style={{ width: "100%", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 9, padding: 13, borderRadius: 12, border: "none", background: favs ? "var(--leaf)" : "var(--sig)", color: "var(--onSig)", fontFamily: "'General Sans'", fontWeight: 600, fontSize: 15, cursor: "pointer" }}
                  >
                    {favs ? "Applied ✓" : "Apply to my brand"}
                    {!favs && <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>}
                  </button>
                </div>

                <button
                  onClick={clearAll}
                  style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, padding: 12, borderRadius: 12, border: "1px solid var(--line)", background: "var(--surface)", color: "var(--ink)", fontFamily: "'General Sans'", fontWeight: 600, fontSize: 14, cursor: "pointer" }}
                >
                  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 12a9 9 0 109-9 9 9 0 00-7 3.3L3 9M3 4v5h5"/></svg>
                  Try other images
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
