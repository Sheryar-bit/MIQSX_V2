import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongoose";
import Brand from "@/models/Brand";
import { Types } from "mongoose";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Brand as BrandType } from "@/types/brand";

const sectionLabelStyle: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 8,
  fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: ".14em",
  textTransform: "uppercase", color: "var(--muted)", marginBottom: 14,
};

const cardStyle: React.CSSProperties = {
  borderRadius: 18, border: "1px solid var(--line)", background: "var(--surface)", padding: "clamp(18px, 2.4vw, 24px)",
};

function statusPill(status: string) {
  const active = status === "active";
  return {
    background: active ? "color-mix(in oklab, var(--sig) 14%, var(--surface))" : "color-mix(in oklab, var(--terra) 14%, var(--surface))",
    color: active ? "var(--sig)" : "var(--terra)",
  };
}

function scorePill(score: number) {
  if (score >= 80) return { bg: "color-mix(in oklab, var(--sig) 14%, var(--surface))", fg: "var(--sig)" };
  if (score >= 60) return { bg: "color-mix(in oklab, var(--olive) 16%, var(--surface))", fg: "var(--olive)" };
  return { bg: "color-mix(in oklab, var(--red) 14%, var(--surface))", fg: "var(--red)" };
}

export default async function BrandPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  const { id } = await params;

  const userId = session!.user!.id!;
  if (!Types.ObjectId.isValid(id) || !Types.ObjectId.isValid(userId)) notFound();

  let brand: BrandType | null = null;
  try {
    await connectDB();
    brand = await Brand.findOne({ _id: id, userId }).lean() as BrandType | null;
  } catch {
    notFound();
  }
  if (!brand) notFound();

  const dna = brand.dna;

  return (
    <div style={{ padding: "clamp(24px, 3.5vw, 44px) clamp(20px, 4vw, 52px) 90px" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <Link
              href="/dashboard"
              aria-label="Back to dashboard"
              style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 38, height: 38, borderRadius: 11, border: "1px solid var(--line)", color: "var(--muted)", flexShrink: 0 }}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
            </Link>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <h1 style={{ fontFamily: "'General Sans'", fontWeight: 600, fontSize: "clamp(24px, 3vw, 32px)", lineHeight: 1.1, letterSpacing: "-0.03em", margin: 0, color: "var(--ink)" }}>{brand.name}</h1>
                <span style={{ ...statusPill(brand.status), fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: 700, padding: "4px 11px", borderRadius: 999, textTransform: "capitalize" }}>
                  {brand.status}
                </span>
                {brand.auditScore != null && (
                  <span style={{ ...scorePill(brand.auditScore), fontFamily: "'JetBrains Mono', monospace", fontSize: 12, fontWeight: 700, padding: "4px 11px", borderRadius: 999 }}>
                    Score: {brand.auditScore}
                  </span>
                )}
              </div>
              {brand.industry && <p style={{ fontSize: 14, color: "var(--muted)", margin: "5px 0 0" }}>{brand.industry}</p>}
            </div>
          </div>
          <Link
            href="/audit"
            style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 999, border: "1px solid var(--line)", color: "var(--ink)", fontFamily: "'General Sans'", fontWeight: 600, fontSize: 14, textDecoration: "none" }}
          >
            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M12 2l8 3v6c0 5-3.5 8.5-8 11-4.5-2.5-8-6-8-11V5z" /></svg>
            Audit brand
          </Link>
        </div>

        {!dna ? (
          <div style={{ borderRadius: 18, border: "1.5px dashed var(--line)", padding: "48px 20px", textAlign: "center" }}>
            <p style={{ fontFamily: "'Newsreader', serif", fontSize: 16, color: "var(--muted)", margin: "0 0 18px" }}>Brand DNA is still being built. Complete the onboarding interview to generate it.</p>
            <Link
              href="/onboarding"
              style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 22px", borderRadius: 999, border: "none", background: "var(--sig)", color: "var(--onSig)", fontFamily: "'General Sans'", fontWeight: 600, fontSize: 14.5, textDecoration: "none" }}
            >
              Continue interview
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Identity */}
            <div style={cardStyle}>
              <div style={sectionLabelStyle}>
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="3" /></svg>
                Brand Identity
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
                {dna.tagline && (
                  <div style={{ gridColumn: "1 / -1", borderRadius: 14, background: "color-mix(in oklab, var(--sig) 7%, var(--surface))", border: "1px solid color-mix(in oklab, var(--sig) 18%, var(--line))", padding: 16 }}>
                    <p style={{ fontSize: 11, color: "var(--sig)", fontWeight: 600, margin: "0 0 4px" }}>Tagline</p>
                    <p style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic", fontSize: 19, color: "var(--ink)", margin: 0 }}>&quot;{dna.tagline}&quot;</p>
                  </div>
                )}
                {dna.uniqueValueProp && (
                  <div>
                    <p style={{ fontSize: 11, color: "var(--muted)", margin: "0 0 4px" }}>Unique Value Proposition</p>
                    <p style={{ fontSize: 14, color: "var(--ink)", margin: 0 }}>{dna.uniqueValueProp}</p>
                  </div>
                )}
                {dna.missionStatement && (
                  <div>
                    <p style={{ fontSize: 11, color: "var(--muted)", margin: "0 0 4px" }}>Mission</p>
                    <p style={{ fontSize: 14, color: "var(--ink)", margin: 0 }}>{dna.missionStatement}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Colors */}
            {dna.colors && (
              <div style={cardStyle}>
                <div style={sectionLabelStyle}>
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2.5" /></svg>
                  Color Palette
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 18 }}>
                  {[
                    { label: "Primary", color: dna.colors.primary },
                    { label: "Secondary", color: dna.colors.secondary },
                    { label: "Accent", color: dna.colors.accent },
                    ...(dna.colors.neutrals || []).map((c, i) => ({ label: `Neutral ${i + 1}`, color: c })),
                  ].filter((c) => c.color).map(({ label, color }) => (
                    <div key={label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                      <div style={{ height: 56, width: 56, borderRadius: 14, border: "2px solid var(--line)", background: color }} />
                      <div style={{ textAlign: "center" }}>
                        <p style={{ fontSize: 11.5, fontWeight: 600, color: "var(--ink)", margin: 0 }}>{label}</p>
                        <p style={{ fontSize: 10.5, color: "var(--muted)", fontFamily: "'JetBrains Mono', monospace", margin: "2px 0 0" }}>{color}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Typography & Voice */}
            <div className="brand-2col">
              {dna.typography && (
                <div style={cardStyle}>
                  <div style={sectionLabelStyle}>
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M4 7V5h16v2M9 19h6M12 5v14" /></svg>
                    Typography
                  </div>
                  {dna.typography.heading && (
                    <div style={{ marginBottom: 12 }}>
                      <p style={{ fontSize: 11, color: "var(--muted)", margin: "0 0 4px" }}>Heading</p>
                      <p style={{ fontSize: 15, fontWeight: 600, color: "var(--ink)", margin: 0 }}>{dna.typography.heading.family}</p>
                      {dna.typography.heading.weight && (
                        <p style={{ fontSize: 12, color: "var(--muted)", margin: "2px 0 0" }}>Weight: {dna.typography.heading.weight}</p>
                      )}
                    </div>
                  )}
                  {dna.typography.body && (
                    <div>
                      <p style={{ fontSize: 11, color: "var(--muted)", margin: "0 0 4px" }}>Body</p>
                      <p style={{ fontSize: 15, fontWeight: 500, color: "var(--ink)", margin: 0 }}>{dna.typography.body.family}</p>
                      {dna.typography.body.weight && (
                        <p style={{ fontSize: 12, color: "var(--muted)", margin: "2px 0 0" }}>Weight: {dna.typography.body.weight}</p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {(dna.tone || dna.voice) && (
                <div style={cardStyle}>
                  <div style={sectionLabelStyle}>Brand Voice</div>
                  {dna.voice && <p style={{ fontSize: 14, color: "var(--ink)", margin: "0 0 12px" }}>{dna.voice}</p>}
                  {dna.tone && dna.tone.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {dna.tone.map((t) => (
                        <span key={t} style={{ fontSize: 12, padding: "5px 12px", borderRadius: 999, background: "color-mix(in oklab, var(--terra) 12%, var(--surface))", border: "1px solid color-mix(in oklab, var(--terra) 28%, var(--line))", color: "var(--terra)" }}>
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Audience */}
            {dna.audience && (
              <div style={cardStyle}>
                <div style={sectionLabelStyle}>
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="9" cy="8" r="3" /><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M16 4.5a3 3 0 010 6M21 20c0-2.5-1.5-4.6-3.6-5.5" /></svg>
                  Target Audience
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 18 }}>
                  {dna.audience.demographics && (
                    <div>
                      <p style={{ fontSize: 11, color: "var(--muted)", margin: "0 0 4px" }}>Demographics</p>
                      <p style={{ fontSize: 13.5, color: "var(--ink)", margin: 0 }}>{dna.audience.demographics}</p>
                    </div>
                  )}
                  {dna.audience.psychographics && (
                    <div>
                      <p style={{ fontSize: 11, color: "var(--muted)", margin: "0 0 4px" }}>Psychographics</p>
                      <p style={{ fontSize: 13.5, color: "var(--ink)", margin: 0 }}>{dna.audience.psychographics}</p>
                    </div>
                  )}
                  {dna.audience.painPoints && dna.audience.painPoints.length > 0 && (
                    <div>
                      <p style={{ fontSize: 11, color: "var(--muted)", margin: "0 0 8px" }}>Pain Points</p>
                      <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 6 }}>
                        {dna.audience.painPoints.map((p) => (
                          <li key={p} style={{ fontSize: 12.5, color: "var(--ink)", display: "flex", alignItems: "flex-start", gap: 8 }}>
                            <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--terra)", flexShrink: 0, marginTop: 6 }} />
                            {p}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Rules */}
            {dna.rules && (
              <div className="brand-2col">
                {dna.rules.dos && dna.rules.dos.length > 0 && (
                  <div style={{ borderRadius: 18, border: "1px solid color-mix(in oklab, var(--sig) 25%, var(--line))", background: "color-mix(in oklab, var(--sig) 6%, var(--surface))", padding: "clamp(18px, 2.4vw, 24px)" }}>
                    <h3 style={{ fontFamily: "'General Sans'", fontWeight: 700, fontSize: 14, color: "var(--sig)", margin: "0 0 12px" }}>✓ Always do</h3>
                    <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 8 }}>
                      {dna.rules.dos.map((d) => (
                        <li key={d} style={{ fontSize: 13.5, color: "var(--ink)", display: "flex", alignItems: "flex-start", gap: 8 }}>
                          <span style={{ color: "var(--sig)", marginTop: 1 }}>+</span> {d}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {dna.rules.donts && dna.rules.donts.length > 0 && (
                  <div style={{ borderRadius: 18, border: "1px solid color-mix(in oklab, var(--red) 25%, var(--line))", background: "color-mix(in oklab, var(--red) 6%, var(--surface))", padding: "clamp(18px, 2.4vw, 24px)" }}>
                    <h3 style={{ fontFamily: "'General Sans'", fontWeight: 700, fontSize: 14, color: "var(--red)", margin: "0 0 12px" }}>✗ Never do</h3>
                    <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 8 }}>
                      {dna.rules.donts.map((d) => (
                        <li key={d} style={{ fontSize: 13.5, color: "var(--ink)", display: "flex", alignItems: "flex-start", gap: 8 }}>
                          <span style={{ color: "var(--red)", marginTop: 1 }}>−</span> {d}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Style Keywords */}
            {dna.style?.keywords && dna.style.keywords.length > 0 && (
              <div style={cardStyle}>
                <div style={sectionLabelStyle}>Visual Style Keywords</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {dna.style.keywords.map((k) => (
                    <span key={k} style={{ fontSize: 13, padding: "7px 14px", borderRadius: 999, background: "var(--surf2)", border: "1px solid var(--line)", color: "var(--muted)" }}>
                      {k}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Audit violations */}
            {brand.auditViolations && brand.auditViolations.length > 0 && (
              <div style={cardStyle}>
                <div style={sectionLabelStyle}>Latest Audit Issues</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {brand.auditViolations.map((v, i) => {
                    const sevColor = v.severity === "high" ? "var(--red)" : v.severity === "medium" ? "var(--olive)" : "var(--muted)";
                    return (
                      <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: 12, borderRadius: 12, background: "var(--surf2)", border: "1px solid var(--line)" }}>
                        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 999, textTransform: "uppercase", background: `color-mix(in oklab, ${sevColor} 16%, var(--surface))`, color: sevColor, flexShrink: 0 }}>
                          {v.severity}
                        </span>
                        <div>
                          <p style={{ fontSize: 12.5, fontWeight: 600, color: "var(--ink)", margin: 0 }}>{v.type}</p>
                          <p style={{ fontSize: 12, color: "var(--muted)", margin: "3px 0 0" }}>{v.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
