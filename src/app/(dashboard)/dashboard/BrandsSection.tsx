"use client";

import useSWR from "swr";
import Link from "next/link";
import { ArrowRight, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate, scoreColor } from "@/lib/utils";
import type { Brand as BrandType } from "@/types/brand";

// Live brand grid: hydrates instantly from server-rendered data, then keeps
// itself fresh (polling + focus revalidation) so a teammate's new brand shows
// up on its own — no manual refresh.
export function BrandsSection({ initialBrands }: { initialBrands: BrandType[] }) {
  const { data } = useSWR<{ brands: BrandType[] }>("/api/brand", {
    refreshInterval: 6000,
    fallbackData: { brands: initialBrands },
  });
  const brands = data?.brands ?? initialBrands;

  if (brands.length === 0) {
    return (
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
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {brands.map((brand) => (
        <Link
          key={brand._id}
          href={`/dashboard/brand/${brand._id}`}
          className="rounded-2xl border border-border bg-surface p-6 hover:border-primary/30 hover:shadow-card transition-all duration-200 group"
        >
          {brand.dna?.colors && (
            <div className="flex gap-1.5 mb-4">
              {[brand.dna.colors.primary, brand.dna.colors.secondary, brand.dna.colors.accent]
                .filter(Boolean)
                .map((c, i) => (
                  <div key={i} className="h-5 flex-1 rounded-md" style={{ backgroundColor: c }} />
                ))}
            </div>
          )}

          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-semibold text-text group-hover:text-primary-light transition-colors">
                {brand.name}
              </h3>
              {brand.industry && <p className="text-xs text-text-dim mt-0.5">{brand.industry}</p>}
            </div>
            <div className="flex items-center gap-2">
              {brand.auditScore != null && (
                <span className={`text-sm font-bold ${scoreColor(brand.auditScore)}`}>
                  {brand.auditScore}
                </span>
              )}
              <Badge
                variant={
                  brand.status === "active" ? "success" : brand.status === "drafting" ? "warning" : "outline"
                }
              >
                {brand.status}
              </Badge>
            </div>
          </div>

          {brand.dna?.tone && brand.dna.tone.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {brand.dna.tone.slice(0, 3).map((t) => (
                <span
                  key={t}
                  className="text-xs px-2 py-0.5 rounded-full bg-surface-2 border border-border text-text-muted"
                >
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
  );
}
