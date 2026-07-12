"use client";

import { useState } from "react";

interface BriefResult {
  projectTitle: string;
  clientName?: string;
  projectType: string;
  industry: string;
  deliverables: string[];
  colors: { mentioned: string[]; implied: string[] };
  style: { adjectives: string[]; references: string[] };
  targetAudience: string;
  budget: { mentioned: boolean; amount: string | null; flexibility: string };
  deadline: { mentioned: boolean; date: string | null; urgency: string };
  contradictions: { issue: string; messageA: string; messageB: string; recommendation: string }[];
  missingInfo: { field: string; question: string }[];
  impliedPreferences: string[];
  redFlags: string[];
  clarificationPriority: string[];
  structuredBrief: string;
  language: string;
}

const EXAMPLE = `Ahmed: bhai logo chahiye, fashion brand ke liye
Me: kaunsa style? minimalist ya bold?
Ahmed: premium lagni chahiye, aur simple bhi
Me: colors?
Ahmed: green aur white, ya kuch modern... actually gold bhi acha hai
Me: deadline kya hai?
Ahmed: kal tak de do bhai, presentation hai
Me: budget?
Ahmed: bohat zada nahi, thora flexible
Ahmed: aur ha, full brand identity bhi chahiye, social media ke liye bhi
Me: matlab logo k saath kya kya chahiye?
Ahmed: bas logo, aur shayad business card bhi`;

const PREVIEW_BUBBLES = [
  { text: "salam, mujhe apni bakery ke liye branding chahiye", time: "10:02" },
  { text: "brown rakhna… nahi cream… kuch homemade type feel", time: "10:03" },
  { text: "logo chahiye aur insta posts bhi. budget zyada nahi", time: "10:04" },
  { text: "Eid se pehle ready karo. mums ko target karna hai", time: "10:05" },
];

function Chip({ label }: { label: string }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", fontFamily: "'General Sans'", fontSize: 13, fontWeight: 500, padding: "5px 11px", borderRadius: 999, background: "var(--surf2)", border: "1px solid var(--line)", color: "var(--ink)" }}>
      {label}
    </span>
  );
}

function BriefRow({ label, delay, children }: { label: string; delay: string; children: React.ReactNode }) {
  return (
    <div className="bp-row" style={{ animationDelay: delay }}>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase" as const, color: "var(--muted)", marginBottom: 6 }}>
        {label}
      </div>
      {children}
    </div>
  );
}

function TextBlock({ value }: { value: string }) {
  return (
    <div style={{ fontSize: 14, lineHeight: 1.5, color: "var(--ink)", background: "var(--surf2)", borderRadius: 10, padding: "10px 13px", border: "1px solid var(--line)" }}>
      {value}
    </div>
  );
}

export default function BriefPage() {
  const [conversation, setConversation] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BriefResult | null>(null);

  const handleSubmit = async () => {
    if (conversation.trim().length < 20) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/brief/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversation }),
      });
      setResult(await res.json());
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "clamp(24px, 3.5vw, 44px) clamp(20px, 4vw, 52px) 90px" }}>
      <div style={{ maxWidth: 1060, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 20, flexWrap: "wrap", marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ width: 46, height: 46, borderRadius: 13, background: "color-mix(in oklab, var(--terra) 14%, transparent)", color: "var(--terra)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M.06 24l1.68-6.16A11.87 11.87 0 0 1 .13 11.9C.12 5.33 5.46 0 12.03 0a11.82 11.82 0 0 1 8.42 3.49 11.82 11.82 0 0 1 3.48 8.42c0 6.57-5.34 11.9-11.91 11.9a11.9 11.9 0 0 1-5.7-1.45L.06 24z"/></svg>
            </span>
            <div>
              <h1 style={{ fontFamily: "'General Sans'", fontWeight: 600, fontSize: "clamp(26px, 3vw, 36px)", lineHeight: 1.05, letterSpacing: "-0.03em", margin: 0 }}>
                Brief <span style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic", fontWeight: 400, color: "var(--terra)" }}>Parser</span>
              </h1>
              <p style={{ fontFamily: "'Newsreader', serif", fontSize: 16, color: "var(--muted)", margin: "5px 0 0" }}>
                Paste the messy WhatsApp brief. Get a clean, structured one.
              </p>
            </div>
          </div>
        </div>

        {/* 2-col layout */}
        <div className="bp-layout">

          {/* Left: chat preview + input */}
          <div style={{ borderRadius: 20, border: "1px solid var(--line)", background: "var(--surface)", padding: "clamp(18px, 2.5vw, 24px)", display: "flex", flexDirection: "column", gap: 14 }}>

            {/* WA header */}
            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="#25D366"><path d="M.06 24l1.68-6.16A11.87 11.87 0 0 1 .13 11.9C.12 5.33 5.46 0 12.03 0a11.82 11.82 0 0 1 8.42 3.49 11.82 11.82 0 0 1 3.48 8.42c0 6.57-5.34 11.9-11.91 11.9a11.9 11.9 0 0 1-5.7-1.45L.06 24z"/></svg>
              <span style={{ fontFamily: "'General Sans'", fontWeight: 700, fontSize: 14, color: "var(--ink)" }}>Client conversation</span>
            </div>

            {/* Chat bubble preview */}
            <div style={{ background: "var(--wa)", borderRadius: 14, padding: "12px 12px", display: "flex", flexDirection: "column", gap: 8 }}>
              {PREVIEW_BUBBLES.map((b, i) => (
                <div key={i} style={{ alignSelf: "flex-start", maxWidth: "88%", background: "var(--surface)", borderRadius: "4px 13px 13px 13px", padding: "8px 12px", fontSize: 13, lineHeight: 1.5, color: "var(--ink)", boxShadow: "0 1px 4px -2px rgba(0,0,0,.25)" }}>
                  {b.text}
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "var(--muted)", textAlign: "right", marginTop: 3 }}>{b.time}</div>
                </div>
              ))}
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "var(--muted)", textAlign: "center", marginTop: 2, letterSpacing: ".06em" }}>— paste your own below —</div>
            </div>

            {/* Textarea label row */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <label style={{ fontFamily: "'General Sans'", fontSize: 12, fontWeight: 600, color: "var(--muted)" }}>Paste your conversation</label>
              <button
                onClick={() => setConversation(EXAMPLE)}
                style={{ fontFamily: "'General Sans'", fontSize: 12, color: "var(--sig)", background: "none", border: "none", cursor: "pointer", padding: 0 }}
              >
                Load example
              </button>
            </div>

            <textarea
              value={conversation}
              onChange={(e) => setConversation(e.target.value)}
              placeholder="Paste your WhatsApp conversation here — works with English, Urdu, and Roman Urdu…"
              className="gf-field"
              style={{ resize: "vertical", minHeight: 140, fontFamily: "'General Sans', sans-serif" }}
            />

            {/* Language hint chips */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {["English", "Roman Urdu", "Urdu mixed", "Punjabi slang", "Code-switching"].map((t) => (
                <span key={t} style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "var(--muted)", background: "var(--surf2)", border: "1px solid var(--line)", borderRadius: 999, padding: "3px 9px" }}>{t}</span>
              ))}
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={loading || conversation.trim().length < 20}
              style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 9, padding: "14px", borderRadius: 12, border: "none", background: loading || conversation.trim().length < 20 ? "var(--surf2)" : "var(--terra)", color: loading || conversation.trim().length < 20 ? "var(--muted)" : "#fff", fontFamily: "'General Sans'", fontWeight: 600, fontSize: 15, cursor: loading || conversation.trim().length < 20 ? "not-allowed" : "pointer", opacity: loading || conversation.trim().length < 20 ? 0.7 : 1 }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M.06 24l1.68-6.16A11.87 11.87 0 0 1 .13 11.9C.12 5.33 5.46 0 12.03 0a11.82 11.82 0 0 1 8.42 3.49 11.82 11.82 0 0 1 3.48 8.42c0 6.57-5.34 11.9-11.91 11.9a11.9 11.9 0 0 1-5.7-1.45L.06 24z"/></svg>
              {loading ? "Parsing brief…" : "Parse this brief"}
            </button>
          </div>

          {/* Right: output panel */}
          <div style={{ borderRadius: 20, border: "1px solid var(--line)", background: "var(--surface)", minHeight: 460, display: "flex", flexDirection: "column", padding: "clamp(18px, 2.5vw, 24px)", position: "relative", overflow: "hidden" }}>

            {/* Decorative star */}
            <svg aria-hidden="true" width="16" height="16" viewBox="0 0 40 40" fill="var(--terra)" style={{ position: "absolute", top: 16, right: 18, animation: "ds-twinkle 3.2s ease-in-out infinite" }}><path d="M20 0c3 13 7 17 20 20-13 3-17 7-20 20-3-13-7-17-20-20C13 17 17 13 20 0Z"/></svg>

            {/* Empty state */}
            {!result && !loading && (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", color: "var(--muted)" }}>
                <span style={{ display: "inline-flex", width: 64, height: 64, borderRadius: 16, background: "var(--surf2)", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="var(--muted)"><path d="M.06 24l1.68-6.16A11.87 11.87 0 0 1 .13 11.9C.12 5.33 5.46 0 12.03 0a11.82 11.82 0 0 1 8.42 3.49 11.82 11.82 0 0 1 3.48 8.42c0 6.57-5.34 11.9-11.91 11.9a11.9 11.9 0 0 1-5.7-1.45L.06 24z" opacity=".3"/></svg>
                </span>
                <div style={{ fontFamily: "'General Sans'", fontWeight: 600, fontSize: 16, color: "var(--ink)" }}>Structured brief appears here</div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, marginTop: 6 }}>parse the messages to begin</div>
              </div>
            )}

            {/* Loading state */}
            {loading && (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", gap: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: "50%", border: "3px solid var(--line)", borderTop: "3px solid var(--terra)", animation: "ds-spin 1s linear infinite" }} />
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, letterSpacing: ".1em", color: "var(--terra)" }}>PARSING BRIEF…</div>
                <div style={{ fontFamily: "'Newsreader', serif", fontStyle: "italic", fontSize: 14, color: "var(--muted)" }}>extracting goals · colors · audience · deadline</div>
              </div>
            )}

            {/* Results */}
            {result && (
              <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>

                {/* Parsed badge + title */}
                <div style={{ display: "flex", alignItems: "center", gap: 9, flexWrap: "wrap" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: ".08em", color: "var(--leaf)", background: "color-mix(in oklab, var(--leaf) 13%, transparent)", padding: "4px 10px", borderRadius: 999 }}>
                    ✓ parsed
                  </span>
                  <span style={{ fontFamily: "'General Sans'", fontWeight: 700, fontSize: 17, color: "var(--ink)" }}>{result.projectTitle}</span>
                  {result.language && (
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9.5, color: "var(--muted)", background: "var(--surf2)", border: "1px solid var(--line)", borderRadius: 999, padding: "3px 8px" }}>{result.language}</span>
                  )}
                </div>

                {/* Project type + industry */}
                {(result.projectType || result.industry) && (
                  <BriefRow label="Project" delay="0s">
                    <TextBlock value={[result.projectType, result.industry, result.clientName ? `Client: ${result.clientName}` : ""].filter(Boolean).join(" · ")} />
                  </BriefRow>
                )}

                {/* Target audience */}
                {result.targetAudience && (
                  <BriefRow label="Target audience" delay=".06s">
                    <TextBlock value={result.targetAudience} />
                  </BriefRow>
                )}

                {/* Deliverables */}
                {result.deliverables?.length > 0 && (
                  <BriefRow label="Deliverables" delay=".12s">
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                      {result.deliverables.map((d, i) => <Chip key={i} label={d} />)}
                    </div>
                  </BriefRow>
                )}

                {/* Colors */}
                {((result.colors?.mentioned?.length ?? 0) + (result.colors?.implied?.length ?? 0)) > 0 && (
                  <BriefRow label="Colors" delay=".18s">
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                      {[...(result.colors?.mentioned ?? []), ...(result.colors?.implied ?? [])].map((c, i) => <Chip key={i} label={c} />)}
                    </div>
                  </BriefRow>
                )}

                {/* Style adjectives */}
                {result.style?.adjectives?.length > 0 && (
                  <BriefRow label="Tone & style" delay=".24s">
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                      {result.style.adjectives.map((a, i) => <Chip key={i} label={a} />)}
                    </div>
                  </BriefRow>
                )}

                {/* Budget + Deadline */}
                <div className="bp-row" style={{ animationDelay: ".3s", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase" as const, color: "var(--muted)", marginBottom: 6 }}>Budget</div>
                    <TextBlock value={result.budget?.amount || (result.budget?.mentioned ? result.budget.flexibility || "Mentioned" : "Not specified")} />
                  </div>
                  <div>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase" as const, color: "var(--muted)", marginBottom: 6 }}>Deadline</div>
                    <TextBlock value={result.deadline?.date || (result.deadline?.mentioned ? result.deadline.urgency || "Mentioned" : "Not specified")} />
                  </div>
                </div>

                {/* Implied preferences */}
                {result.impliedPreferences?.length > 0 && (
                  <BriefRow label="Implied preferences" delay=".36s">
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      {result.impliedPreferences.map((p, i) => (
                        <div key={i} style={{ fontFamily: "'Newsreader', serif", fontSize: 13.5, color: "var(--muted)", paddingLeft: 13, borderLeft: "2px solid var(--line)" }}>{p}</div>
                      ))}
                    </div>
                  </BriefRow>
                )}

                {/* Contradictions */}
                {result.contradictions?.length > 0 && (
                  <BriefRow label="Contradictions" delay=".42s">
                    <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                      {result.contradictions.map((c, i) => (
                        <div key={i} style={{ borderRadius: 11, background: "color-mix(in oklab, var(--terra) 7%, var(--surface))", border: "1px solid color-mix(in oklab, var(--terra) 22%, var(--line))", padding: "9px 13px" }}>
                          <div style={{ fontFamily: "'General Sans'", fontWeight: 600, fontSize: 12.5, color: "var(--terra)", marginBottom: 3 }}>{c.issue}</div>
                          <div style={{ fontFamily: "'Newsreader', serif", fontSize: 12, color: "var(--muted)" }}>"{c.messageA}" vs "{c.messageB}"</div>
                          {c.recommendation && <div style={{ fontFamily: "'General Sans'", fontSize: 12, color: "var(--terra)", marginTop: 4, opacity: 0.8 }}>Resolve: {c.recommendation}</div>}
                        </div>
                      ))}
                    </div>
                  </BriefRow>
                )}

                {/* Clarification priority */}
                {result.clarificationPriority?.length > 0 && (
                  <BriefRow label="Ask client first" delay=".48s">
                    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                      {result.clarificationPriority.map((q, i) => (
                        <div key={i} style={{ display: "flex", gap: 9, alignItems: "flex-start" }}>
                          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: 11, color: "var(--sig)", flexShrink: 0, marginTop: 2 }}>{i + 1}.</span>
                          <span style={{ fontFamily: "'Newsreader', serif", fontSize: 13.5, color: "var(--muted)" }}>{q}</span>
                        </div>
                      ))}
                    </div>
                  </BriefRow>
                )}

                {/* Missing info */}
                {result.missingInfo?.length > 0 && (
                  <BriefRow label="Missing info" delay=".54s">
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      {result.missingInfo.map((m, i) => (
                        <div key={i} style={{ fontFamily: "'Newsreader', serif", fontSize: 13, color: "var(--muted)", paddingLeft: 13, borderLeft: "2px solid var(--line)" }}>{m.question}</div>
                      ))}
                    </div>
                  </BriefRow>
                )}

                {/* Red flags */}
                {result.redFlags?.length > 0 && (
                  <BriefRow label="Red flags" delay=".6s">
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                      {result.redFlags.map((f, i) => (
                        <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "'General Sans'", fontSize: 13, fontWeight: 500, padding: "5px 11px", borderRadius: 999, background: "color-mix(in oklab, var(--red) 8%, var(--surface))", border: "1px solid color-mix(in oklab, var(--red) 22%, var(--line))", color: "var(--red)" }}>⚠ {f}</span>
                      ))}
                    </div>
                  </BriefRow>
                )}

                {/* Start brand CTA */}
                <a
                  href="/onboarding"
                  style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 9, padding: "13px", borderRadius: 12, background: "var(--sig)", color: "var(--onSig)", fontFamily: "'General Sans'", fontWeight: 600, fontSize: 15, textDecoration: "none", marginTop: 4 }}
                >
                  Start brand with this brief
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Structured brief — full width below */}
        {result?.structuredBrief && (
          <div style={{ marginTop: 22, borderRadius: 20, border: "1px solid var(--line)", background: "var(--surface)", padding: "clamp(18px, 2.5vw, 26px)" }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: ".16em", textTransform: "uppercase" as const, color: "var(--muted)", marginBottom: 12 }}>
              Structured Brief — Ready to Share
            </div>
            <p style={{ fontFamily: "'Newsreader', serif", fontSize: 15, color: "var(--muted)", lineHeight: 1.65, margin: 0, whiteSpace: "pre-line" }}>
              {result.structuredBrief}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
