import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongoose";
import Brand from "@/models/Brand";
import { Types } from "mongoose";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Palette, Type, Users, Target, ShieldCheck, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { scoreColor, scoreBg } from "@/lib/utils";
import type { Brand as BrandType } from "@/types/brand";

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
    <div className="p-8 max-w-5xl">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-text">{brand.name}</h1>
              <Badge variant={brand.status === "active" ? "success" : "warning"}>
                {brand.status}
              </Badge>
              {brand.auditScore != null && (
                <span className={`text-sm font-bold px-2.5 py-0.5 rounded-full border ${scoreBg(brand.auditScore)} ${scoreColor(brand.auditScore)}`}>
                  Score: {brand.auditScore}
                </span>
              )}
            </div>
            {brand.industry && <p className="text-text-muted text-sm mt-1">{brand.industry}</p>}
          </div>
        </div>
        <div className="flex gap-2">
          <Link href="/audit">
            <Button variant="outline" size="sm">
              <ShieldCheck className="h-4 w-4" />
              Audit brand
            </Button>
          </Link>
        </div>
      </div>

      {!dna ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center">
          <p className="text-text-muted">Brand DNA is still being built. Complete the onboarding interview to generate it.</p>
          <Link href="/dashboard/onboarding" className="mt-4 inline-block">
            <Button className="mt-4">Continue interview</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Identity */}
          <div className="rounded-2xl border border-border bg-surface p-6">
            <h2 className="text-sm font-semibold text-text-dim uppercase tracking-widest mb-4 flex items-center gap-2">
              <Target className="h-4 w-4" />
              Brand Identity
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {dna.tagline && (
                <div className="col-span-3 rounded-xl bg-primary/5 border border-primary/15 p-4">
                  <p className="text-xs text-primary-light font-medium mb-1">Tagline</p>
                  <p className="text-text font-semibold italic">"{dna.tagline}"</p>
                </div>
              )}
              {dna.uniqueValueProp && (
                <div className="col-span-3 md:col-span-2">
                  <p className="text-xs text-text-dim mb-1">Unique Value Proposition</p>
                  <p className="text-text-muted text-sm">{dna.uniqueValueProp}</p>
                </div>
              )}
              {dna.missionStatement && (
                <div>
                  <p className="text-xs text-text-dim mb-1">Mission</p>
                  <p className="text-text-muted text-sm">{dna.missionStatement}</p>
                </div>
              )}
            </div>
          </div>

          {/* Colors */}
          {dna.colors && (
            <div className="rounded-2xl border border-border bg-surface p-6">
              <h2 className="text-sm font-semibold text-text-dim uppercase tracking-widest mb-4 flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Color Palette
              </h2>
              <div className="flex flex-wrap gap-4">
                {[
                  { label: "Primary", color: dna.colors.primary },
                  { label: "Secondary", color: dna.colors.secondary },
                  { label: "Accent", color: dna.colors.accent },
                  ...(dna.colors.neutrals || []).map((c, i) => ({ label: `Neutral ${i + 1}`, color: c })),
                ].filter((c) => c.color).map(({ label, color }) => (
                  <div key={label} className="flex flex-col items-center gap-2">
                    <div
                      className="h-16 w-16 rounded-xl border-2 border-border shadow-card"
                      style={{ backgroundColor: color }}
                    />
                    <div className="text-center">
                      <p className="text-xs font-medium text-text">{label}</p>
                      <p className="text-xs text-text-dim font-mono">{color}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Typography & Voice */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {dna.typography && (
              <div className="rounded-2xl border border-border bg-surface p-6">
                <h2 className="text-sm font-semibold text-text-dim uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Type className="h-4 w-4" />
                  Typography
                </h2>
                {dna.typography.heading && (
                  <div className="mb-3">
                    <p className="text-xs text-text-dim mb-1">Heading</p>
                    <p className="text-text font-semibold">{dna.typography.heading.family}</p>
                    {dna.typography.heading.weight && (
                      <p className="text-xs text-text-muted">Weight: {dna.typography.heading.weight}</p>
                    )}
                  </div>
                )}
                {dna.typography.body && (
                  <div>
                    <p className="text-xs text-text-dim mb-1">Body</p>
                    <p className="text-text font-medium">{dna.typography.body.family}</p>
                    {dna.typography.body.weight && (
                      <p className="text-xs text-text-muted">Weight: {dna.typography.body.weight}</p>
                    )}
                  </div>
                )}
              </div>
            )}

            {(dna.tone || dna.voice) && (
              <div className="rounded-2xl border border-border bg-surface p-6">
                <h2 className="text-sm font-semibold text-text-dim uppercase tracking-widest mb-4">Brand Voice</h2>
                {dna.voice && <p className="text-text-muted text-sm mb-3">{dna.voice}</p>}
                {dna.tone && dna.tone.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {dna.tone.map((t) => (
                      <span key={t} className="text-xs px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent">
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
            <div className="rounded-2xl border border-border bg-surface p-6">
              <h2 className="text-sm font-semibold text-text-dim uppercase tracking-widest mb-4 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Target Audience
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {dna.audience.demographics && (
                  <div>
                    <p className="text-xs text-text-dim mb-1">Demographics</p>
                    <p className="text-sm text-text-muted">{dna.audience.demographics}</p>
                  </div>
                )}
                {dna.audience.psychographics && (
                  <div>
                    <p className="text-xs text-text-dim mb-1">Psychographics</p>
                    <p className="text-sm text-text-muted">{dna.audience.psychographics}</p>
                  </div>
                )}
                {dna.audience.painPoints && dna.audience.painPoints.length > 0 && (
                  <div>
                    <p className="text-xs text-text-dim mb-2">Pain Points</p>
                    <ul className="space-y-1">
                      {dna.audience.painPoints.map((p) => (
                        <li key={p} className="text-xs text-text-muted flex items-start gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-accent flex-shrink-0 mt-1.5" />
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {dna.rules.dos && dna.rules.dos.length > 0 && (
                <div className="rounded-2xl border border-success/20 bg-success/5 p-6">
                  <h3 className="text-sm font-semibold text-success mb-3">✓ Always do</h3>
                  <ul className="space-y-2">
                    {dna.rules.dos.map((d) => (
                      <li key={d} className="text-sm text-text-muted flex items-start gap-2">
                        <span className="text-success mt-0.5">+</span> {d}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {dna.rules.donts && dna.rules.donts.length > 0 && (
                <div className="rounded-2xl border border-error/20 bg-error/5 p-6">
                  <h3 className="text-sm font-semibold text-error mb-3">✗ Never do</h3>
                  <ul className="space-y-2">
                    {dna.rules.donts.map((d) => (
                      <li key={d} className="text-sm text-text-muted flex items-start gap-2">
                        <span className="text-error mt-0.5">−</span> {d}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Style Keywords */}
          {dna.style?.keywords && dna.style.keywords.length > 0 && (
            <div className="rounded-2xl border border-border bg-surface p-6">
              <h2 className="text-sm font-semibold text-text-dim uppercase tracking-widest mb-4">Visual Style Keywords</h2>
              <div className="flex flex-wrap gap-2">
                {dna.style.keywords.map((k) => (
                  <span key={k} className="text-sm px-3 py-1.5 rounded-full bg-surface-2 border border-border text-text-muted hover:border-primary/30 hover:text-text transition-colors">
                    {k}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Audit violations */}
          {brand.auditViolations && brand.auditViolations.length > 0 && (
            <div className="rounded-2xl border border-border bg-surface p-6">
              <h2 className="text-sm font-semibold text-text-dim uppercase tracking-widest mb-4">Latest Audit Issues</h2>
              <div className="space-y-2">
                {brand.auditViolations.map((v, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-surface-2 border border-border">
                    <Badge variant={v.severity === "high" ? "error" : v.severity === "medium" ? "warning" : "outline"}>
                      {v.severity}
                    </Badge>
                    <div>
                      <p className="text-xs font-medium text-text">{v.type}</p>
                      <p className="text-xs text-text-muted mt-0.5">{v.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
