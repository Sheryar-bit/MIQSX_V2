import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongoose";
import Brand from "@/models/Brand";
import { Types } from "mongoose";
import Link from "next/link";
import { Plus, Sparkles, Search, Type, Image, ArrowRight, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate, scoreColor } from "@/lib/utils";
import type { Brand as BrandType } from "@/types/brand";

async function getBrands(userId: string): Promise<BrandType[]> {
  if (!Types.ObjectId.isValid(userId)) return [];
  try {
    await connectDB();
    return Brand.find({ userId }).sort({ updatedAt: -1 }).lean() as unknown as BrandType[];
  } catch {
    return [];
  }
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const brands = await getBrands(session!.user!.id!);

  const quickActions = [
    { href: "/onboarding", icon: Sparkles, label: "New Brand", desc: "Start with AI interview" },
    { href: "/audit", icon: Search, label: "Brand Audit", desc: "Score your existing assets" },
    { href: "/names", icon: Type, label: "Name Generator", desc: "Check domains & handles" },
    { href: "/moodboard", icon: Image, label: "Reverse Moodboard", desc: "Extract your style DNA" },
  ];

  return (
    <div className="p-8 max-w-6xl">
      {/* Header */}
      <div className="mb-10 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text">
            Welcome back, {session?.user?.name?.split(" ")[0]} 👋
          </h1>
          <p className="text-text-muted mt-1">
            {brands.length === 0
              ? "Let's build your first Brand DNA"
              : `You're managing ${brands.length} brand${brands.length > 1 ? "s" : ""}`}
          </p>
        </div>
        <Link href="/onboarding">
          <Button>
            <Plus className="h-4 w-4" />
            New brand
          </Button>
        </Link>
      </div>

      {/* Quick Actions */}
      <section className="mb-10">
        <h2 className="text-sm font-semibold text-text-dim uppercase tracking-widest mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((a) => (
            <Link
              key={a.href}
              href={a.href}
              className="rounded-2xl border border-border bg-surface p-5 hover:border-primary/30 hover:bg-surface-2 transition-all duration-200 group"
            >
              <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                <a.icon className="h-4 w-4 text-primary-light" />
              </div>
              <p className="font-semibold text-sm text-text">{a.label}</p>
              <p className="text-xs text-text-dim mt-0.5">{a.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Brands */}
      <section>
        <h2 className="text-sm font-semibold text-text-dim uppercase tracking-widest mb-4">Your Brands</h2>

        {brands.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-16 text-center">
            <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Zap className="h-7 w-7 text-primary-light" />
            </div>
            <h3 className="text-lg font-semibold text-text mb-2">No brands yet</h3>
            <p className="text-text-muted text-sm mb-6 max-w-sm mx-auto">
              Create your first Brand DNA with a 10-question AI interview. Takes about 5 minutes.
            </p>
            <Link href="/onboarding">
              <Button>
                <Sparkles className="h-4 w-4" />
                Start AI interview
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {brands.map((brand) => (
              <Link
                key={brand._id}
                href={`/dashboard/brand/${brand._id}`}
                className="rounded-2xl border border-border bg-surface p-6 hover:border-primary/30 hover:shadow-card transition-all duration-200 group"
              >
                {/* Color bar */}
                {brand.dna?.colors && (
                  <div className="flex gap-1.5 mb-4">
                    {[brand.dna.colors.primary, brand.dna.colors.secondary, brand.dna.colors.accent]
                      .filter(Boolean)
                      .map((c, i) => (
                        <div
                          key={i}
                          className="h-5 flex-1 rounded-md"
                          style={{ backgroundColor: c }}
                        />
                      ))}
                  </div>
                )}

                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-text group-hover:text-primary-light transition-colors">
                      {brand.name}
                    </h3>
                    {brand.industry && (
                      <p className="text-xs text-text-dim mt-0.5">{brand.industry}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {brand.auditScore != null && (
                      <span className={`text-sm font-bold ${scoreColor(brand.auditScore)}`}>
                        {brand.auditScore}
                      </span>
                    )}
                    <Badge variant={
                      brand.status === "active" ? "success" :
                      brand.status === "drafting" ? "warning" : "outline"
                    }>
                      {brand.status}
                    </Badge>
                  </div>
                </div>

                {brand.dna?.tone && brand.dna.tone.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {brand.dna.tone.slice(0, 3).map((t) => (
                      <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-surface-2 border border-border text-text-muted">
                        {t}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-xs text-text-dim">{formatDate(brand.updatedAt)}</span>
                  <ArrowRight className="h-4 w-4 text-text-dim group-hover:text-primary-light transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
