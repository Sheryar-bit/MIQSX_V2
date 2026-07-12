"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

interface Profile {
  name: string;
  email: string;
  plan: string;
  profileSlug?: string;
  profilePublic: boolean;
  profileBio?: string;
}

const ACCENTS = ["#C26B43", "#1E5A40", "#5C79C4", "#C2557A", "#8A8A4C"];

export default function ProfilePage() {
  const { update: updateSession } = useSession();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [bio, setBio] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [accent, setAccent] = useState(ACCENTS[0]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    fetch("/api/user/profile")
      .then((r) => r.json())
      .then((d: Profile & { error?: string }) => {
        if (d.error) return;
        setProfile(d);
        setName(d.name ?? "");
        setSlug(d.profileSlug ?? "");
        setBio(d.profileBio ?? "");
        setIsPublic(!!d.profilePublic);
      })
      .finally(() => setLoading(false));
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setNotice("");
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, profileSlug: slug, profileBio: bio, profilePublic: isPublic }),
      });
      const d = await res.json();
      if (!res.ok) {
        setNotice(d.error || "Could not save");
      } else {
        if (d.profileSlug) setSlug(d.profileSlug);
        // Refresh JWT so sidebar/nav show the updated name immediately.
        await updateSession({ name: d.name ?? name });
        setToast(false);
        requestAnimationFrame(() => setToast(true));
        setTimeout(() => setToast(false), 2700);
      }
    } catch {
      setNotice("Network error");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 260 }}>
        <div style={{ width: 32, height: 32, border: "2.5px solid var(--line)", borderTopColor: "var(--sig)", borderRadius: "50%", animation: "ds-spin 0.8s linear infinite" }} />
      </div>
    );
  }

  const displayName = name || profile?.name || "Your Brand";
  const initial = (displayName.trim()[0] || "B").toUpperCase();
  const urlSlug = slug || "your-url";
  const bioShown = bio || "Your brand bio will appear here.";

  return (
    <div style={{ padding: "clamp(24px, 3.5vw, 44px) clamp(20px, 4vw, 52px) 90px" }}>
      <div style={{ maxWidth: 1040, margin: "0 auto" }}>

        {/* Header */}
        <div className="pp-reveal" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 20, flexWrap: "wrap", marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ width: 46, height: 46, borderRadius: 13, background: "color-mix(in oklab, var(--peri) 18%, transparent)", color: "var(--peri)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.7 2.5 15.3 0 18M12 3c-2.5 2.7-2.5 15.3 0 18"/>
              </svg>
            </span>
            <div>
              <h1 style={{ fontFamily: "'General Sans'", fontWeight: 600, fontSize: "clamp(26px, 3vw, 36px)", lineHeight: 1.05, letterSpacing: "-0.03em", margin: 0 }}>
                Public <span style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic", fontWeight: 400, color: "var(--sig)" }}>Profile</span>
              </h1>
              <p style={{ fontFamily: "'Newsreader', serif", fontSize: 16, color: "var(--muted)", margin: "5px 0 0" }}>Control your public-facing brand showcase.</p>
            </div>
          </div>
        </div>

        <form onSubmit={save} className="pp-layout">

          {/* ===== EDIT FORM ===== */}
          <div className="pp-reveal" style={{ borderRadius: 20, border: "1px solid var(--line)", background: "var(--surface)", padding: "clamp(18px, 2.5vw, 26px)" }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10.5, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 18 }}>Edit profile</div>

            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--muted)", marginBottom: 6 }}>Display name</label>
            <input
              className="gf-field"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your brand name"
              style={{ marginBottom: 16 }}
            />

            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--muted)", marginBottom: 6 }}>Profile URL</label>
            <div style={{ display: "flex", alignItems: "center", background: "var(--field)", border: "1px solid var(--line)", borderRadius: 11, padding: "0 4px 0 14px", marginBottom: 16 }}>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: "var(--muted)", whiteSpace: "nowrap" }}>miqsx.co/</span>
              <input
                className="gf-field"
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value.replace(/[^a-z0-9-]/gi, "").toLowerCase())}
                placeholder="acme-studio"
                style={{ border: "none", boxShadow: "none", paddingLeft: 4, background: "transparent" }}
              />
            </div>

            <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 12, fontWeight: 600, color: "var(--muted)", marginBottom: 6 }}>
              Bio
              <span style={{ fontFamily: "'JetBrains Mono', monospace", color: bio.length > 280 ? "var(--terra)" : "var(--muted)" }}>{bio.length}/300</span>
            </label>
            <textarea
              className="gf-field"
              rows={3}
              maxLength={300}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell visitors about your brand work…"
              style={{ resize: "vertical", marginBottom: 18 }}
            />

            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)", marginBottom: 9 }}>Accent color</div>
            <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
              {ACCENTS.map((hex) => (
                <button
                  key={hex}
                  type="button"
                  onClick={() => setAccent(hex)}
                  aria-label="accent"
                  className={`pp-swatch${accent === hex ? " sel" : ""}`}
                  style={{ background: hex }}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={() => setIsPublic((v) => !v)}
              className={`pp-toggle${isPublic ? " on" : ""}`}
              style={{ marginBottom: 18 }}
            >
              <span className={`pp-track${isPublic ? " on" : ""}`}>
                <span className={`pp-knob${isPublic ? " on" : ""}`} />
              </span>
              <span>
                <span style={{ display: "block", fontFamily: "'General Sans'", fontWeight: 600, fontSize: 14.5, color: "var(--ink)" }}>Make profile public</span>
                <span style={{ display: "block", fontSize: 12.5, color: "var(--muted)", marginTop: 2 }}>Anyone with your URL can view your active brands.</span>
              </span>
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button
                type="submit"
                disabled={saving}
                style={{ display: "inline-flex", alignItems: "center", gap: 9, padding: "13px 24px", borderRadius: 12, border: "none", background: "var(--sig)", color: "var(--onSig)", fontFamily: "'General Sans'", fontWeight: 600, fontSize: 15, cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.65 : 1 }}
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>
                {saving ? "Saving…" : "Save changes"}
              </button>
              {notice && <span style={{ fontFamily: "'General Sans'", fontSize: 13, color: "var(--terra)" }}>{notice}</span>}
            </div>
          </div>

          {/* ===== LIVE PREVIEW ===== */}
          <div className="pp-reveal" style={{ position: "sticky", top: 0 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10.5, letterSpacing: ".14em", textTransform: "uppercase" as const, color: "var(--muted)" }}>Live preview</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: isPublic ? "var(--leaf)" : "var(--muted)" }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: isPublic ? "var(--leaf)" : "var(--muted)", display: "inline-block" }} />
                {isPublic ? "public" : "private"}
              </span>
            </div>

            <div style={{ borderRadius: 20, border: "1px solid var(--line)", background: "var(--surface)", overflow: "hidden", boxShadow: "0 30px 60px -36px rgba(0,0,0,.4)" }}>
              {/* Browser bar */}
              <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "11px 14px", borderBottom: "1px solid var(--line)", background: "var(--surf2)" }}>
                <span style={{ display: "flex", gap: 5 }}>
                  <span style={{ width: 9, height: 9, borderRadius: "50%", background: "var(--terra)", display: "inline-block" }} />
                  <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#E0A93C", display: "inline-block" }} />
                  <span style={{ width: 9, height: 9, borderRadius: "50%", background: "var(--olive)", display: "inline-block" }} />
                </span>
                <span style={{ flex: 1, textAlign: "center", fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "var(--muted)", background: "var(--field)", border: "1px solid var(--line)", padding: "4px 12px", borderRadius: 999 }}>
                  miqsx.co/{urlSlug}
                </span>
              </div>

              {/* Profile hero */}
              <div style={{ position: "relative", height: 96, background: `linear-gradient(120deg, ${accent}, color-mix(in oklab, ${accent} 50%, var(--surf2)))`, overflow: "hidden" }}>
                <svg width="120" height="120" viewBox="0 0 40 40" fill="rgba(255,255,255,0.14)" style={{ position: "absolute", top: -30, right: -24, animation: "pp-spin 26s linear infinite" }} aria-hidden="true">
                  <path d="M20 0c3 13 7 17 20 20-13 3-17 7-20 20-3-13-7-17-20-20C13 17 17 13 20 0Z"/>
                </svg>
              </div>

              <div style={{ padding: "0 20px 22px", marginTop: -34, position: "relative" }}>
                <div style={{ width: 68, height: 68, borderRadius: 18, background: accent, border: "3px solid var(--surface)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Instrument Serif', serif", fontStyle: "italic", fontSize: 30, color: "#fff" }}>
                  {initial}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 9, marginTop: 12 }}>
                  <span style={{ fontFamily: "'General Sans'", fontWeight: 700, fontSize: 21, letterSpacing: "-0.02em" }}>{displayName}</span>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, letterSpacing: ".08em", textTransform: "uppercase" as const, color: "var(--olive)", background: "color-mix(in oklab, var(--olive) 16%, transparent)", padding: "3px 8px", borderRadius: 999 }}>on-brand</span>
                </div>
                <p style={{ fontFamily: "'Newsreader', serif", fontSize: 14.5, lineHeight: 1.5, color: "var(--muted)", margin: "8px 0 0" }}>{bioShown}</p>

                {/* Sample brand cards */}
                <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                  <div style={{ flex: 1, height: 70, borderRadius: 12, background: `linear-gradient(150deg, ${accent}, color-mix(in oklab, ${accent} 40%, #E0A93C))`, position: "relative" }}>
                    <span style={{ position: "absolute", bottom: 7, left: 8, color: "#fff", fontFamily: "'Instrument Serif', serif", fontStyle: "italic", fontSize: 13 }}>Eid…</span>
                  </div>
                  <div style={{ flex: 1, height: 70, borderRadius: 12, background: "var(--surf2)", border: "1px solid var(--line)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Instrument Serif', serif", fontStyle: "italic", fontSize: 18, color: "var(--ink)" }}>
                    {initial}
                  </div>
                  <div style={{ flex: 1, height: 70, borderRadius: 12, background: "var(--surf2)", border: "1px solid var(--line)", padding: 8, display: "flex", flexDirection: "column", justifyContent: "center", gap: 2 }}>
                    <span style={{ fontSize: 9.5 }}>New 🎉</span>
                    <span dir="rtl" style={{ textAlign: "right", fontFamily: "'Newsreader', serif", fontSize: 11 }}>نیا</span>
                  </div>
                </div>

                {/* Private notice */}
                {!isPublic && (
                  <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "var(--muted)", background: "var(--surf2)", border: "1px dashed var(--line)", borderRadius: 10, padding: "10px 12px" }}>
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V7a4 4 0 018 0v4"/></svg>
                    This profile is private — only you can see it.
                  </div>
                )}
              </div>
            </div>

            <p style={{ fontFamily: "'Newsreader', serif", fontStyle: "italic", fontSize: 13, color: "var(--muted)", textAlign: "center", marginTop: 12 }}>Updates as you type…</p>
          </div>
        </form>
      </div>

      {/* Toast */}
      {toast && (
        <div className="pp-toast">
          <svg width="16" height="16" fill="none" stroke="var(--leaf)" strokeWidth="2.4" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>
          Profile saved
        </div>
      )}
    </div>
  );
}
