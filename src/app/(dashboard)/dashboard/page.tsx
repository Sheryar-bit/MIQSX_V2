import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongoose";
import Brand from "@/models/Brand";
import { getOrgContext } from "@/lib/org-context";
import Link from "next/link";
import { Plus, Sparkles, Search, Type, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandsSection } from "./BrandsSection";
import type { Brand as BrandType } from "@/types/brand";

async function getBrands(orgId: string): Promise<BrandType[]> {
  try {
    await connectDB();
    return Brand.find({ orgId }).sort({ updatedAt: -1 }).lean() as unknown as BrandType[];
  } catch {
    return [];
  }
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/auth/login");

  const ctx = await getOrgContext(session);
  const brands = ctx ? await getBrands(ctx.orgId) : [];

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

      {/* Brands — live (auto-updates as the team adds/edits) */}
      <section>
        <h2 className="text-sm font-semibold text-text-dim uppercase tracking-widest mb-4">Your Brands</h2>
        <BrandsSection initialBrands={brands} />
      </section>
    </div>
  );
}
