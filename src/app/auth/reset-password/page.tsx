"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import "../auth.css";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    setToken(new URLSearchParams(window.location.search).get("token"));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const d = await res.json();
      if (!res.ok) {
        setError(d.error || "Could not reset password.");
      } else {
        setDone(true);
        setTimeout(() => router.push("/auth/login"), 1500);
      }
    } catch {
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div data-theme="light" style={{ minHeight: "100vh" }}>
      <div style={{ position: "relative", background: "var(--bg)", color: "var(--ink)", fontFamily: "'General Sans', system-ui, sans-serif", minHeight: "100vh", WebkitFontSmoothing: "antialiased", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
        <div className="au-grain" aria-hidden="true" />

        <div style={{ position: "relative", width: "100%", maxWidth: 408 }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, textDecoration: "none", color: "var(--ink)", fontFamily: "'General Sans'", fontWeight: 700, fontSize: 21, letterSpacing: "-0.02em", marginBottom: 32 }}>
            <span style={{ width: 22, height: 22, background: "var(--sig)", display: "inline-flex", alignItems: "center", justifyContent: "center", borderRadius: 5 }}>
              <svg width="12" height="12" viewBox="0 0 40 40" fill="var(--onSig)"><path d="M20 0c3 13 7 17 20 20-13 3-17 7-20 20-3-13-7-17-20-20C13 17 17 13 20 0Z" /></svg>
            </span>
            MIQSX
          </Link>

          <div style={{ borderRadius: 20, border: "1px solid var(--line)", background: "var(--surface)", padding: "clamp(28px, 4vw, 36px)" }}>
            {done ? (
              <div style={{ textAlign: "center" }}>
                <h1 style={{ fontFamily: "'General Sans'", fontWeight: 600, fontSize: 24, letterSpacing: "-0.02em", margin: "0 0 10px" }}>Password updated</h1>
                <p style={{ fontFamily: "'Newsreader', serif", fontSize: 15, color: "var(--muted)", margin: 0 }}>Redirecting you to sign in…</p>
              </div>
            ) : token === null ? (
              <div style={{ textAlign: "center" }}>
                <h1 style={{ fontFamily: "'General Sans'", fontWeight: 600, fontSize: 22, letterSpacing: "-0.02em", margin: "0 0 10px" }}>Invalid link</h1>
                <p style={{ fontFamily: "'Newsreader', serif", fontSize: 15, color: "var(--muted)", margin: "0 0 12px" }}>This reset link is missing its token.</p>
                <Link href="/auth/forgot-password" style={{ color: "var(--sig)", fontSize: 14, fontWeight: 600, textDecoration: "none" }}>
                  Request a new one
                </Link>
              </div>
            ) : (
              <>
                <h1 style={{ fontFamily: "'General Sans'", fontWeight: 600, fontSize: 26, letterSpacing: "-0.02em", margin: "0 0 8px" }}>Set a new password</h1>
                <p style={{ fontFamily: "'Newsreader', serif", fontSize: 15, color: "var(--muted)", margin: "0 0 26px" }}>Choose a strong password (min. 8 characters).</p>
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <label style={{ display: "block" }}>
                    <span style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--muted)", marginBottom: 6 }}>New password</span>
                    <input
                      className="au-input"
                      type="password"
                      placeholder="Min. 8 characters"
                      autoComplete="new-password"
                      required
                      minLength={8}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </label>
                  {error && (
                    <div style={{ display: "flex", alignItems: "center", gap: 9, fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "var(--terra)", background: "color-mix(in oklab, var(--terra) 12%, transparent)", border: "1px solid color-mix(in oklab, var(--terra) 32%, transparent)", borderRadius: 10, padding: "11px 13px" }}>
                      <span>✕</span> {error}
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={loading}
                    style={{ marginTop: 4, width: "100%", padding: "14px", borderRadius: 12, border: "none", background: "var(--sig)", color: "var(--onSig)", fontFamily: "'General Sans'", fontWeight: 600, fontSize: 15, cursor: loading ? "default" : "pointer", opacity: loading ? 0.7 : 1 }}
                  >
                    {loading ? "Updating…" : "Update password"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
