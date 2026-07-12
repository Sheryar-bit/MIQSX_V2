import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongoose";
import Brand from "@/models/Brand";
import { getOrgContext } from "@/lib/org-context";
import Link from "next/link";
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

  let ctx = null;
  try {
    ctx = await getOrgContext(session);
  } catch {
    // DB unavailable — show empty state
  }
  const brands = ctx ? await getBrands(ctx.orgId) : [];
  const firstName = session?.user?.name?.split(" ")[0] ?? "there";

  return (
    <div style={{ padding: "clamp(24px, 3.5vw, 44px) clamp(20px, 4vw, 52px) 80px" }}>

      {/* topbar */}
      <div className="ds-in" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 20, flexWrap: "wrap", marginBottom: "clamp(30px, 5vh, 50px)" }}>
        <div>
          <h1 style={{ fontFamily: "'General Sans'", fontWeight: 600, fontSize: "clamp(28px, 3.4vw, 42px)", lineHeight: 1.05, letterSpacing: "-0.03em", margin: 0, color: "var(--ink)" }}>
            Welcome back,{" "}
            <span style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic", fontWeight: 400, color: "var(--sig)" }}>{firstName}</span>{" "}
            <span style={{ fontStyle: "normal" }}>👋</span>
          </h1>
          <p style={{ fontFamily: "'Newsreader', serif", fontSize: 17, color: "var(--muted)", margin: "8px 0 0" }}>
            {brands.length === 0
              ? "Let's build your first Brand DNA."
              : `You're managing ${brands.length} brand${brands.length > 1 ? "s" : ""}.`}
          </p>
        </div>
        <Link
          href="/onboarding"
          style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 20px", borderRadius: 999, border: "none", background: "var(--sig)", color: "var(--onSig)", fontFamily: "'General Sans'", fontWeight: 600, fontSize: 15, textDecoration: "none" }}
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" /></svg>
          New brand
        </Link>
      </div>

      {/* quick actions */}
      <div className="ds-in" style={{ marginBottom: "clamp(30px, 5vh, 50px)" }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 16 }}>Quick actions</div>
        <div className="ds-qa-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>

          <Link href="/onboarding" className="ds-qa-card" style={{ textDecoration: "none" }}>
            <span style={{ display: "inline-flex", width: 42, height: 42, borderRadius: 12, background: "color-mix(in oklab, var(--sig) 14%, transparent)", color: "var(--sig)", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
              <svg width="20" height="20" viewBox="0 0 40 40" fill="currentColor"><path d="M20 2c2.2 9.6 5.2 12.6 14.8 14.8C25.2 19 22.2 22 20 31.6 17.8 22 14.8 19 5.2 16.8 14.8 14.6 17.8 11.6 20 2Z" /></svg>
            </span>
            <div style={{ fontFamily: "'General Sans'", fontWeight: 700, fontSize: 16, marginBottom: 4, color: "var(--ink)" }}>New Brand</div>
            <div style={{ fontSize: 13, color: "var(--muted)" }}>Start with AI interview</div>
          </Link>

          <Link href="/audit" className="ds-qa-card" style={{ textDecoration: "none" }}>
            <span style={{ display: "inline-flex", width: 42, height: 42, borderRadius: 12, background: "color-mix(in oklab, var(--terra) 16%, transparent)", color: "var(--terra)", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>
            </span>
            <div style={{ fontFamily: "'General Sans'", fontWeight: 700, fontSize: 16, marginBottom: 4, color: "var(--ink)" }}>Brand Audit</div>
            <div style={{ fontSize: 13, color: "var(--muted)" }}>Score your existing assets</div>
          </Link>

          <Link href="/names" className="ds-qa-card" style={{ textDecoration: "none" }}>
            <span style={{ display: "inline-flex", width: 42, height: 42, borderRadius: 12, background: "color-mix(in oklab, var(--olive) 18%, transparent)", color: "var(--olive)", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24"><path d="M4 7V5h16v2M9 19h6M12 5v14" /></svg>
            </span>
            <div style={{ fontFamily: "'General Sans'", fontWeight: 700, fontSize: 16, marginBottom: 4, color: "var(--ink)" }}>Name Generator</div>
            <div style={{ fontSize: 13, color: "var(--muted)" }}>Check domains &amp; handles</div>
          </Link>

          <Link href="/moodboard" className="ds-qa-card" style={{ textDecoration: "none" }}>
            <span style={{ display: "inline-flex", width: 42, height: 42, borderRadius: 12, background: "color-mix(in oklab, var(--leaf) 15%, transparent)", color: "var(--leaf)", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2.5" /><circle cx="8.5" cy="8.5" r="1.7" /><path d="M21 15l-5-5L5 21" /></svg>
            </span>
            <div style={{ fontFamily: "'General Sans'", fontWeight: 700, fontSize: 16, marginBottom: 4, color: "var(--ink)" }}>Reverse Moodboard</div>
            <div style={{ fontSize: 13, color: "var(--muted)" }}>Extract your style DNA</div>
          </Link>

        </div>
      </div>

      {/* your brands — live (auto-updates as the team adds/edits) */}
      <div className="ds-in">
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 16 }}>Your brands</div>
        <BrandsSection initialBrands={brands} />
      </div>
    </div>
  );
}
