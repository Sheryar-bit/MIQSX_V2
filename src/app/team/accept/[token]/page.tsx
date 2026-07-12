"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import "../../../auth/auth.css";

interface InviteInfo {
  email: string;
  role: string;
  status: string;
  inviterName: string;
  valid: boolean;
}

export default function AcceptInvitePage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const { status: authStatus } = useSession();

  const [invite, setInvite] = useState<InviteInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [accepting, setAccepting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    fetch(`/api/team/invite/${token}`)
      .then((r) => r.json())
      .then((d) => (d.error ? setError(d.error) : setInvite(d)))
      .catch(() => setError("Could not load this invite."))
      .finally(() => setLoading(false));
  }, [token]);

  async function accept() {
    setAccepting(true);
    setError("");
    try {
      const res = await fetch(`/api/team/invite/${token}`, { method: "POST" });
      const d = await res.json();
      if (!res.ok) {
        setError(d.error || "Could not accept the invite.");
      } else {
        setDone(true);
        setTimeout(() => router.push("/dashboard"), 1500);
      }
    } catch {
      setError("Network error.");
    } finally {
      setAccepting(false);
    }
  }

  const callbackUrl = `/team/accept/${token}`;

  return (
    <div data-theme="light" style={{ minHeight: "100vh" }}>
      <div style={{ position: "relative", background: "var(--bg)", color: "var(--ink)", fontFamily: "'General Sans', system-ui, sans-serif", minHeight: "100vh", WebkitFontSmoothing: "antialiased", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
        <div className="au-grain" aria-hidden="true" />

        <div style={{ position: "relative", width: "100%", maxWidth: 420, borderRadius: 20, border: "1px solid var(--line)", background: "var(--surface)", padding: "clamp(28px, 4vw, 36px)", textAlign: "center" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
            <span style={{ width: 48, height: 48, borderRadius: 14, background: "var(--sig)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="24" height="24" fill="none" stroke="var(--onSig)" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="9" cy="8" r="3" /><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M16 4.5a3 3 0 010 6M21 20c0-2.5-1.5-4.6-3.6-5.5" /></svg>
            </span>
          </div>

          {loading ? (
            <p style={{ fontFamily: "'Newsreader', serif", fontSize: 15, color: "var(--muted)" }}>Loading invite…</p>
          ) : error && !invite ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "center" }}>
              <svg width="30" height="30" fill="none" stroke="var(--red)" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path d="M12 8v5M12 16h.01" /></svg>
              <p style={{ margin: 0 }}>{error}</p>
              <Link href="/dashboard" style={{ color: "var(--sig)", fontSize: 14, fontWeight: 600, textDecoration: "none" }}>
                Go to dashboard
              </Link>
            </div>
          ) : done ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "center" }}>
              <svg width="36" height="36" fill="none" stroke="var(--sig)" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path d="M8.5 12.5l2.5 2.5 5-5" /></svg>
              <h1 style={{ fontFamily: "'General Sans'", fontWeight: 600, fontSize: 22, letterSpacing: "-0.02em", margin: 0 }}>You&apos;re in!</h1>
              <p style={{ fontFamily: "'Newsreader', serif", fontSize: 15, color: "var(--muted)", margin: 0 }}>Redirecting you to the dashboard…</p>
            </div>
          ) : invite && !invite.valid ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "center" }}>
              <svg width="30" height="30" fill="none" stroke="var(--red)" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path d="M12 8v5M12 16h.01" /></svg>
              <p style={{ margin: 0 }}>
                This invite is {invite.status === "pending" ? "no longer valid" : invite.status}.
              </p>
              <Link href="/dashboard" style={{ color: "var(--sig)", fontSize: 14, fontWeight: 600, textDecoration: "none" }}>
                Go to dashboard
              </Link>
            </div>
          ) : invite ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div>
                <h1 style={{ fontFamily: "'General Sans'", fontWeight: 600, fontSize: 22, letterSpacing: "-0.02em", margin: 0 }}>Join a workspace</h1>
                <p style={{ fontFamily: "'Newsreader', serif", fontSize: 15, color: "var(--muted)", margin: "8px 0 0" }}>
                  <strong style={{ color: "var(--ink)" }}>{invite.inviterName}</strong> invited you to collaborate
                  on MIQSX as a <strong style={{ color: "var(--sig)", textTransform: "capitalize" }}>{invite.role}</strong>.
                </p>
              </div>

              {error && (
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "var(--terra)", background: "color-mix(in oklab, var(--terra) 12%, transparent)", border: "1px solid color-mix(in oklab, var(--terra) 32%, transparent)", borderRadius: 10, padding: "11px 13px" }}>
                  {error}
                </div>
              )}

              {authStatus === "authenticated" ? (
                <button
                  onClick={accept}
                  disabled={accepting}
                  style={{ width: "100%", padding: "14px", borderRadius: 12, border: "none", background: "var(--sig)", color: "var(--onSig)", fontFamily: "'General Sans'", fontWeight: 600, fontSize: 15, cursor: accepting ? "default" : "pointer", opacity: accepting ? 0.7 : 1 }}
                >
                  {accepting ? "Accepting…" : "Accept invite"}
                </button>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "var(--muted)", margin: 0 }}>Sign in or create an account to accept.</p>
                  <div style={{ display: "flex", gap: 10 }}>
                    <Link
                      href={`/auth/login?callbackUrl=${encodeURIComponent(callbackUrl)}`}
                      style={{ flex: 1, height: 42, borderRadius: 12, background: "var(--sig)", color: "var(--onSig)", fontSize: 14, fontWeight: 600, textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center" }}
                    >
                      Sign in
                    </Link>
                    <Link
                      href={`/auth/signup?callbackUrl=${encodeURIComponent(callbackUrl)}`}
                      style={{ flex: 1, height: 42, borderRadius: 12, border: "1px solid var(--line)", color: "var(--ink)", fontSize: 14, fontWeight: 600, textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center" }}
                    >
                      Sign up
                    </Link>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
