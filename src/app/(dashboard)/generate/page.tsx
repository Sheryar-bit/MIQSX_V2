import Link from "next/link";

const tools = [
  {
    href: "/generate/logo",
    title: "Logo Generator",
    desc: "Compose vector-first SVG logos from your Brand DNA — plus AI logo concepts via FLUX.",
    badge: "Vector-first",
    color: "var(--sig)",
    icon: <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M12 2l2.4 7.4H22l-6 4.5 2.3 7.1L12 16.8 5.7 21l2.3-7.1-6-4.5h7.6z" /></svg>,
  },
  {
    href: "/generate/taglines",
    title: "Tagline Generator",
    desc: "8 taglines in distinct emotional styles — bold, witty, aspirational, Urdu-inspired.",
    badge: "Groq",
    color: "var(--terra)",
    icon: <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24"><path d="M4 7V5h16v2M9 19h6M12 5v14" /></svg>,
  },
  {
    href: "/generate/captions",
    title: "Trilingual Captions",
    desc: "One post topic → English + اردو + Roman Urdu captions in your brand voice.",
    badge: "Pakistan-first",
    color: "var(--leaf)",
    icon: <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 2.7 2.5 15.3 0 18M12 3c-2.5 2.7-2.5 15.3 0 18" /></svg>,
  },
  {
    href: "/generate/imagery",
    title: "Post Imagery",
    desc: "Cloudflare Workers AI brand imagery with style filters: Realism, Neon, Minimalist, Vintage, 3D, and more.",
    badge: "Workers AI",
    color: "var(--peri)",
    icon: <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2.5" /><circle cx="8.5" cy="8.5" r="1.7" /><path d="M21 15l-5-5L5 21" /></svg>,
  },
  {
    href: "/generate/imagery",
    title: "Social Media Kit",
    desc: "Auto-export any image to all platform sizes — Instagram, Facebook, LinkedIn, Twitter, YouTube.",
    badge: "Built-in",
    color: "var(--olive)",
    icon: <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M12 3v13m0 0-4-4m4 4 4-4M4 21h16" /></svg>,
  },
  {
    href: "/generate/festive",
    title: "Festive Variants",
    desc: "AI festive posters for Eid, Ramadan, 14 August & New Year — FLUX-generated, share-ready.",
    badge: "Desi",
    color: "var(--red)",
    icon: <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M12 3l2.5 6H21l-5 4 2 6.5L12 15.8 6 19.5l2-6.5-5-4h6.5z" /></svg>,
  },
];

export default function GenerateHubPage() {
  return (
    <div style={{ padding: "clamp(24px, 3.5vw, 44px) clamp(20px, 4vw, 52px) 90px" }}>
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>
        <div style={{ marginBottom: 30 }}>
          <h1 style={{ fontFamily: "'General Sans'", fontWeight: 600, fontSize: "clamp(27px, 3.4vw, 38px)", lineHeight: 1.05, letterSpacing: "-0.03em", margin: 0, color: "var(--ink)" }}>Generate</h1>
          <p style={{ fontFamily: "'Newsreader', serif", fontSize: 16, color: "var(--muted)", margin: "8px 0 0" }}>
            Every generator pulls your Brand DNA automatically — colors, tone, and style are always consistent.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
          {tools.map((t) => (
            <Link key={t.href + t.title} href={t.href} className="ds-qa-card" style={{ textDecoration: "none" }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
                <span style={{ display: "inline-flex", width: 42, height: 42, borderRadius: 12, background: `color-mix(in oklab, ${t.color} 15%, transparent)`, color: t.color, alignItems: "center", justifyContent: "center" }}>
                  {t.icon}
                </span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: ".06em", textTransform: "uppercase", padding: "4px 10px", borderRadius: 999, background: "var(--surf2)", color: "var(--muted)" }}>
                  {t.badge}
                </span>
              </div>
              <div style={{ fontFamily: "'General Sans'", fontWeight: 700, fontSize: 16, marginBottom: 4, color: "var(--ink)" }}>{t.title}</div>
              <div style={{ fontSize: 13.5, color: "var(--muted)", lineHeight: 1.55 }}>{t.desc}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
