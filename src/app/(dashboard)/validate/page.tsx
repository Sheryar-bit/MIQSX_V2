import Link from "next/link";

const tools = [
  {
    href: "/validate/guardian",
    label: "Brand Guardian",
    description: "Score any asset 0-100 against your Brand DNA. Color compliance, tone match, style alignment.",
    tag: "F13",
    color: "var(--sig)",
    icon: <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24"><path d="M12 2l8 3v6c0 5-3.5 8.5-8 11-4.5-2.5-8-6-8-11V5z" /></svg>,
  },
  {
    href: "/validate/focus-group",
    label: "AI Focus Group",
    description: "5 synthetic Pakistani personas react to your content with honest scores and feedback.",
    tag: "F12",
    color: "var(--terra)",
    icon: <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24"><circle cx="9" cy="8" r="3" /><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M16 4.5a3 3 0 010 6M21 20c0-2.5-1.5-4.6-3.6-5.5" /></svg>,
  },
  {
    href: "/validate/stress-test",
    label: "Logo Stress Test",
    description: "Favicon, B&W, inverted, colorblind simulations + WCAG contrast ratios.",
    tag: "F14",
    color: "var(--leaf)",
    icon: <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24"><path d="M13 2L4 14h7l-1 8 9-12h-7z" /></svg>,
  },
  {
    href: "/validate/cultural",
    label: "Cultural Check",
    description: "AI reviews your copy for Pakistani cultural missteps, Urdu tone, and regional sensitivity.",
    tag: "F15",
    color: "var(--peri)",
    icon: <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 2.7 2.5 15.3 0 18M12 3c-2.5 2.7-2.5 15.3 0 18" /></svg>,
  },
];

export default function ValidateHub() {
  return (
    <div style={{ padding: "clamp(24px, 3.5vw, 44px) clamp(20px, 4vw, 52px) 90px" }}>
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>
        <div style={{ marginBottom: 30 }}>
          <h1 style={{ fontFamily: "'General Sans'", fontWeight: 600, fontSize: "clamp(27px, 3.4vw, 38px)", lineHeight: 1.05, letterSpacing: "-0.03em", margin: 0, color: "var(--ink)" }}>Validate &amp; Test</h1>
          <p style={{ fontFamily: "'Newsreader', serif", fontSize: 16, color: "var(--muted)", margin: "8px 0 0" }}>
            Run your brand assets through AI-powered compliance checks before publishing.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
          {tools.map((tool) => (
            <Link key={tool.href} href={tool.href} className="ds-qa-card" style={{ textDecoration: "none", display: "flex", alignItems: "flex-start", gap: 16 }}>
              <span style={{ display: "inline-flex", flexShrink: 0, width: 48, height: 48, borderRadius: 14, background: `color-mix(in oklab, ${tool.color} 15%, transparent)`, color: tool.color, alignItems: "center", justifyContent: "center" }}>
                {tool.icon}
              </span>
              <div style={{ minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontFamily: "'General Sans'", fontWeight: 700, fontSize: 16, color: "var(--ink)" }}>{tool.label}</span>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: "var(--surf2)", color: "var(--muted)" }}>
                    {tool.tag}
                  </span>
                </div>
                <p style={{ fontSize: 13.5, color: "var(--muted)", lineHeight: 1.55, margin: 0 }}>{tool.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
