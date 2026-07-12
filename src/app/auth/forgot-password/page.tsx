"use client";

import { useState } from "react";
import Link from "next/link";
import "../auth.css";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setSent(true);
    } catch {
      setSent(true); // generic — never reveal anything
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
            {sent ? (
              <div style={{ textAlign: "center" }}>
                <h1 style={{ fontFamily: "'General Sans'", fontWeight: 600, fontSize: 26, letterSpacing: "-0.02em", margin: "0 0 10px" }}>Check your inbox</h1>
                <p style={{ fontFamily: "'Newsreader', serif", fontSize: 15, color: "var(--muted)", margin: "0 0 18px" }}>
                  If that email is registered, a password reset link is on its way. It expires in 1 hour.
                </p>
                <Link href="/auth/login" style={{ color: "var(--sig)", fontSize: 14, fontWeight: 600, textDecoration: "none" }}>
                  Back to sign in
                </Link>
              </div>
            ) : (
              <>
                <h1 style={{ fontFamily: "'General Sans'", fontWeight: 600, fontSize: 26, letterSpacing: "-0.02em", margin: "0 0 8px" }}>Reset your password</h1>
                <p style={{ fontFamily: "'Newsreader', serif", fontSize: 15, color: "var(--muted)", margin: "0 0 26px" }}>We&apos;ll email you a reset link.</p>
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <label style={{ display: "block" }}>
                    <span style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--muted)", marginBottom: 6 }}>Email</span>
                    <input
                      className="au-input"
                      type="email"
                      placeholder="you@studio.pk"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </label>
                  <button
                    type="submit"
                    disabled={loading}
                    style={{ marginTop: 4, width: "100%", padding: "14px", borderRadius: 12, border: "none", background: "var(--sig)", color: "var(--onSig)", fontFamily: "'General Sans'", fontWeight: 600, fontSize: 15, cursor: loading ? "default" : "pointer", opacity: loading ? 0.7 : 1 }}
                  >
                    {loading ? "Sending…" : "Send reset link"}
                  </button>
                </form>
                <p style={{ textAlign: "center", fontSize: 14, color: "var(--muted)", marginTop: 22, marginBottom: 0 }}>
                  Remembered it?{" "}
                  <Link href="/auth/login" style={{ color: "var(--sig)", fontWeight: 600, textDecoration: "none" }}>
                    Sign in
                  </Link>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
