"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useWorkspaces } from "@/lib/hooks";

const brandItems = [
  { href: "/dashboard", label: "Dashboard", exact: true, icon: <svg fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></svg> },
  { href: "/onboarding", label: "New Brand", icon: <svg fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg> },
  { href: "/audit", label: "Brand Audit", icon: <svg fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg> },
  { href: "/names", label: "Name Generator", icon: <svg fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M4 7V5h16v2M9 19h6M12 5v14"/></svg> },
  { href: "/moodboard", label: "Moodboard", icon: <svg fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2.5"/><circle cx="8.5" cy="8.5" r="1.7"/><path d="M21 15l-5-5L5 21"/></svg> },
];

const generateItems = [
  { href: "/generate/logo", label: "Logo", icon: <svg fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M12 2l2.4 7.4H22l-6 4.5 2.3 7.1L12 16.8 5.7 21l2.3-7.1-6-4.5h7.6z"/></svg> },
  { href: "/generate/taglines", label: "Taglines", icon: <svg fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M4 7V5h16v2M9 19h6M12 5v14"/></svg> },
  { href: "/generate/captions", label: "Captions", badge: "3", icon: <svg fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.7 2.5 15.3 0 18M12 3c-2.5 2.7-2.5 15.3 0 18"/></svg> },
  { href: "/generate/imagery", label: "Post Imagery", icon: <svg fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2.5"/><circle cx="8.5" cy="8.5" r="1.7"/><path d="M21 15l-5-5L5 21"/></svg> },
  { href: "/generate/festive", label: "Festive Variants", icon: <svg fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M12 3l2.5 6H21l-5 4 2 6.5L12 15.8 6 19.5l2-6.5-5-4h6.5z"/></svg> },
];

const validateItems = [
  { href: "/validate/guardian", label: "Brand Guardian", icon: <svg fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M12 2l8 3v6c0 5-3.5 8.5-8 11-4.5-2.5-8-6-8-11V5z"/></svg> },
  { href: "/validate/focus-group", label: "Focus Group", icon: <svg fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="9" cy="8" r="3"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M16 4.5a3 3 0 010 6M21 20c0-2.5-1.5-4.6-3.6-5.5"/></svg> },
  { href: "/validate/stress-test", label: "Stress Test", icon: <svg fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M13 2L4 14h7l-1 8 9-12h-7z"/></svg> },
  { href: "/validate/cultural", label: "Cultural Check", icon: <svg fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.7 2.5 15.3 0 18M12 3c-2.5 2.7-2.5 15.3 0 18"/></svg> },
];

const workflowItems = [
  { href: "/review", label: "Review Board", icon: <svg fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4h6v3H9zM8 11h8M8 15h5"/></svg> },
  { href: "/brief", label: "Brief Parser", icon: <svg fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M4 5h16v11H8l-4 4z"/></svg> },
];

const accountItems = [
  { href: "/analytics", label: "Analytics", icon: <svg fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg> },
  { href: "/billing", label: "Billing", icon: <svg fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="2.5"/><path d="M2 10h20"/></svg> },
  { href: "/team", label: "Team", icon: <svg fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="9" cy="8" r="3"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M16 4.5a3 3 0 010 6M21 20c0-2.5-1.5-4.6-3.6-5.5"/></svg> },
  { href: "/profile", label: "Public Profile", icon: <svg fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.7 2.5 15.3 0 18M12 3c-2.5 2.7-2.5 15.3 0 18"/></svg> },
];

type NavItemProps = { href: string; label: string; icon: React.ReactNode; exact?: boolean; badge?: string; onClick?: () => void };

function NavItem({ href, label, icon, exact, badge, onClick }: NavItemProps) {
  const pathname = usePathname();
  const active = exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");
  return (
    <Link href={href} onClick={onClick} className={`ds-nav-item${active ? " ds-active" : ""}`}>
      {icon}
      <span style={{ flex: 1 }}>{label}</span>
      {badge && <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "var(--terra)" }}>{badge}</span>}
      {active && (
        <svg style={{ width: 15, height: 15, marginLeft: "auto" }} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6" /></svg>
      )}
    </Link>
  );
}

const PLAN_META: Record<string, { label: string; blurb: string; pct: string }> = {
  free:   { label: "Free Plan",   blurb: "1 brand · 5 audits",       pct: "20%" },
  pro:    { label: "Pro Plan",    blurb: "Higher limits unlocked",    pct: "60%" },
  agency: { label: "Agency Plan", blurb: "Team & unlimited usage",    pct: "100%" },
};

const SunIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="4"/>
    <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
  </svg>
);

const MoonIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
  </svg>
);

export function Sidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  // Read the plan LIVE from the active workspace (via SWR), not the JWT — so an
  // upgrade/downgrade shows immediately without needing a re-login. Falls back to
  // the session's plan until the workspace list loads.
  const { workspaces, activeOrgId } = useWorkspaces();
  const activeWs = workspaces.find((w) => w.orgId === (activeOrgId ?? session?.user?.activeOrgId));
  const plan = activeWs?.plan ?? (session?.user?.plan as string) ?? "free";
  const meta = PLAN_META[plan] ?? PLAN_META.free;
  const [dark, setDark] = useState(false);
  const [mobOpen, setMobOpen] = useState(false);

  // Initialize theme from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("ds-theme") ?? "light";
    const isDark = saved === "dark";
    setDark(isDark);
    document.querySelector("[data-ds-theme]")?.setAttribute("data-ds-theme", isDark ? "dark" : "light");
  }, []);

  // Close mobile drawer on route change
  useEffect(() => { setMobOpen(false); }, [pathname]);

  // Scroll-lock + escape key for mobile drawer
  useEffect(() => {
    document.body.style.overflow = mobOpen ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setMobOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", onKey); };
  }, [mobOpen]);

  function toggleTheme() {
    const next = !dark;
    setDark(next);
    localStorage.setItem("ds-theme", next ? "dark" : "light");
    document.querySelector("[data-ds-theme]")?.setAttribute("data-ds-theme", next ? "dark" : "light");
  }

  const closeDrawer = () => setMobOpen(false);

  return (
    <>
      {/* Mobile top bar */}
      <div className="ds-mob-bar">
        <Link href="/dashboard" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", color: "var(--ink)" }}>
          <span style={{ width: 32, height: 32, borderRadius: 9, background: "var(--sig)", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="16" height="16" viewBox="0 0 40 40" fill="var(--onSig)"><path d="M20 0c3 13 7 17 20 20-13 3-17 7-20 20-3-13-7-17-20-20C13 17 17 13 20 0Z" /></svg>
          </span>
          <span style={{ fontFamily: "'General Sans'", fontWeight: 700, fontSize: 17, letterSpacing: "-0.02em" }}>MIQSX</span>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button onClick={toggleTheme} className="ds-mob-theme" aria-label="Toggle theme">
            {dark ? <SunIcon /> : <MoonIcon />}
          </button>
          <button
            className={`ds-mob-burger${mobOpen ? " open" : ""}`}
            onClick={() => setMobOpen(v => !v)}
            aria-label={mobOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobOpen}
          >
            <span /><span /><span />
          </button>
        </div>
      </div>

      {/* Mobile overlay */}
      <div className={`ds-mob-overlay${mobOpen ? " open" : ""}`} onClick={closeDrawer} />

      {/* Sidebar */}
      <aside className={`ds-sidebar ds-scroll${mobOpen ? " mob-open" : ""}`} style={{ position: "relative", zIndex: 10, width: 256, flex: "0 0 256px", height: "100vh", overflowY: "auto", background: "var(--surface)", borderRight: "1px solid var(--line)", display: "flex", flexDirection: "column" }}>
        {/* logo */}
        <Link href="/dashboard" onClick={closeDrawer} style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none", color: "var(--ink)", padding: "20px 18px", borderBottom: "1px solid var(--line)", position: "sticky", top: 0, background: "var(--surface)", zIndex: 2 }}>
          <span style={{ width: 38, height: 38, borderRadius: 11, background: "var(--sig)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="20" height="20" viewBox="0 0 40 40" fill="var(--onSig)"><path d="M20 0c3 13 7 17 20 20-13 3-17 7-20 20-3-13-7-17-20-20C13 17 17 13 20 0Z" /></svg>
          </span>
          <span>
            <span style={{ display: "block", fontFamily: "'General Sans'", fontWeight: 700, fontSize: 19, letterSpacing: "-0.02em", lineHeight: 1 }}>MIQSX</span>
            <span style={{ display: "block", fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--muted)", marginTop: 3 }}>Brand OS</span>
          </span>
        </Link>

        {/* nav */}
        <nav style={{ flex: 1, padding: "8px 14px 16px" }}>
          <div className="ds-nav-label">Brand</div>
          {brandItems.map((item) => <NavItem key={item.href} {...item} onClick={closeDrawer} />)}

          <div className="ds-nav-label">Generate</div>
          {generateItems.map((item) => <NavItem key={item.href} {...item} onClick={closeDrawer} />)}

          <div className="ds-nav-label">Validate</div>
          {validateItems.map((item) => <NavItem key={item.href} {...item} onClick={closeDrawer} />)}

          <div className="ds-nav-label">Workflow</div>
          {workflowItems.map((item) => <NavItem key={item.href} {...item} onClick={closeDrawer} />)}

          <div className="ds-nav-label">Account</div>
          {accountItems.map((item) => <NavItem key={item.href} {...item} onClick={closeDrawer} />)}
        </nav>

        {/* theme toggle + plan card + sign out */}
        <div style={{ position: "sticky", bottom: 0, padding: 14, background: "var(--surface)", borderTop: "1px solid var(--line)" }}>
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="ds-theme-toggle"
          >
            <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {dark ? <SunIcon /> : <MoonIcon />}
              {dark ? "Dark mode" : "Light mode"}
            </span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: ".08em", opacity: 0.55 }}>
              {dark ? "DARK" : "LIGHT"}
            </span>
          </button>

          {/* Plan card */}
          <div style={{ borderRadius: 14, border: "1px solid var(--line)", background: "var(--surf2)", padding: 14, marginBottom: 8, marginTop: 8 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontFamily: "'General Sans'", fontWeight: 700, fontSize: 14 }}>{meta.label}</span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "var(--terra)" }}>UPGRADE</span>
            </div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "var(--muted)", marginBottom: 10 }}>{meta.blurb}</div>
            <div style={{ height: 6, borderRadius: 999, background: "var(--line)", overflow: "hidden" }}>
              <div style={{ width: meta.pct, height: "100%", background: "linear-gradient(90deg, var(--terra), var(--olive))" }} />
            </div>
          </div>

          {/* Sign out */}
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            style={{ display: "flex", width: "100%", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 10, border: "none", background: "none", cursor: "pointer", color: "var(--muted)", fontFamily: "'General Sans'", fontSize: 14, fontWeight: 500, transition: "background .18s, color .18s" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "color-mix(in oklab, #BC4636 12%, transparent)"; (e.currentTarget as HTMLButtonElement).style.color = "#BC4636"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "none"; (e.currentTarget as HTMLButtonElement).style.color = "var(--muted)"; }}
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" /></svg>
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}
