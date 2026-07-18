"use client";

import { useState, useEffect, useRef } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import "../auth.css";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [dark, setDark] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const btnRef = useRef<HTMLButtonElement>(null);
  const innerRef = useRef<HTMLSpanElement>(null);
  const iconRef = useRef<SVGSVGElement>(null);

  function update(k: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));
  }

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const els = document.querySelectorAll("[data-reveal]");
    if (reduce) {
      els.forEach((e) => e.classList.add("in"));
    } else {
      els.forEach((e, i) => {
        setTimeout(() => e.classList.add("in"), 80 + Math.min(i * 55, 650));
      });
    }

    const btn = btnRef.current;
    const inner = innerRef.current;
    const icon = iconRef.current;
    if (!btn || !inner || reduce) return;

    const onMove = (ev: MouseEvent) => {
      const r = btn.getBoundingClientRect();
      const x = (ev.clientX - r.left - r.width / 2) * 0.18;
      const y = (ev.clientY - r.top - r.height / 2) * 0.3;
      btn.style.transition = "transform .15s ease-out";
      btn.style.transform = `translate(${x}px,${y}px)`;
      inner.style.transform = `translate(${x * 0.4}px,${y * 0.4}px)`;
      if (icon) icon.style.transform = "rotate(45deg)";
    };
    const onLeave = () => {
      btn.style.transition = "transform .4s cubic-bezier(.34,1.56,.64,1)";
      btn.style.transform = "translate(0,0)";
      inner.style.transform = "translate(0,0)";
      if (icon) icon.style.transform = "rotate(0deg)";
    };
    btn.addEventListener("mousemove", onMove);
    btn.addEventListener("mouseleave", onLeave);
    return () => {
      btn.removeEventListener("mousemove", onMove);
      btn.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      // Carry the pricing-page selection (?plan=pro / ?plan=agency) into signup so
      // the register handler can start the 7-day DB trial for paid plans.
      const planParam = new URLSearchParams(window.location.search).get("plan");
      const plan = planParam === "pro" || planParam === "agency" ? planParam : "free";
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, plan }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Registration failed");
        setLoading(false);
        return;
      }
      await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });
      const callbackUrl = new URLSearchParams(window.location.search).get("callbackUrl");
      router.push(callbackUrl || "/onboarding");
    } catch {
      setError("Something went wrong. Try again.");
      setLoading(false);
    }
  }

  const theme = dark ? "dark" : "light";
  const S = { color: "var(--muted)" } as React.CSSProperties;

  return (
    <div data-theme={theme} style={{ minHeight: "100vh" }}>
      <div style={{ position: "relative", background: "var(--bg)", color: "var(--ink)", fontFamily: "'General Sans', system-ui, sans-serif", minHeight: "100vh", WebkitFontSmoothing: "antialiased" }}>
        <div className="au-grain" aria-hidden="true" />

        <div className="au-grid">
          {/* ===== LEFT: FORM ===== */}
          <div style={{ position: "relative", zIndex: 10, display: "flex", flexDirection: "column", padding: "clamp(24px, 4vw, 44px) clamp(22px, 5vw, 72px)" }}>
            {/* top row */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", color: "var(--ink)", fontFamily: "'General Sans'", fontWeight: 700, fontSize: 21, letterSpacing: "-0.02em" }}>
                <span style={{ width: 22, height: 22, background: "var(--sig)", display: "inline-flex", alignItems: "center", justifyContent: "center", borderRadius: 5 }}>
                  <svg width="12" height="12" viewBox="0 0 40 40" fill="var(--onSig)"><path d="M20 0c3 13 7 17 20 20-13 3-17 7-20 20-3-13-7-17-20-20C13 17 17 13 20 0Z" /></svg>
                </span>
                MIQSX
              </Link>
              <button
                onClick={() => setDark(!dark)}
                aria-label="Toggle theme"
                style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "7px 7px 7px 14px", borderRadius: 999, border: "1px solid var(--line)", background: "var(--surface)", color: "var(--ink)", fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", cursor: "pointer" }}
              >
                {dark ? "Dark" : "Light"}
                <span style={{ width: 24, height: 24, borderRadius: "50%", background: "var(--sig)", color: "var(--onSig)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>
                  {dark ? "☾" : "☀"}
                </span>
              </button>
            </div>

            {/* form body */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "clamp(28px, 5vh, 60px) 0" }}>
              <div style={{ width: "100%", maxWidth: 408, margin: "0 auto" }}>
                <div data-reveal="" style={{ display: "inline-flex", alignItems: "center", gap: 9, fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--terra)", marginBottom: 16 }}>
                  <span style={{ width: 18, height: 1, background: "var(--terra)" }} />
                  Get started
                </div>

                <h1 data-reveal="" style={{ fontFamily: "'General Sans'", fontWeight: 600, fontSize: "clamp(30px, 3.4vw, 42px)", lineHeight: 1.04, letterSpacing: "-0.03em", margin: "0 0 10px" }}>
                  Create your{" "}
                  <span style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic", fontWeight: 400, color: "var(--sig)" }}>brand brain.</span>
                </h1>
                <p data-reveal="" style={{ fontFamily: "'Newsreader', serif", fontSize: 16, lineHeight: 1.55, color: "var(--muted)", margin: "0 0 28px" }}>
                  One Brand DNA that keeps every asset on-brand — set it up in minutes.
                </p>

                {/* social buttons 
                <div data-reveal="" style={{ display: "flex", flexDirection: "column", gap: 11 }}>
                  <button className="au-social" type="button">
                    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
                      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.6 2.4 30.2 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.3 17.7 9.5 24 9.5z" />
                      <path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.4c-.5 2.9-2.1 5.4-4.6 7.1l7.2 5.6c4.2-3.9 6.6-9.6 6.6-16.2z" />
                      <path fill="#FBBC05" d="M10.5 28.3c-.5-1.4-.8-2.9-.8-4.3s.3-3 .8-4.3l-7.9-6.1C1 16.8 0 20.3 0 24s1 7.2 2.6 10.4l7.9-6.1z" />
                      <path fill="#34A853" d="M24 48c6.2 0 11.5-2 15.3-5.6l-7.2-5.6c-2 1.4-4.6 2.2-8.1 2.2-6.3 0-11.6-3.8-13.5-9.2l-7.9 6.1C6.5 42.6 14.6 48 24 48z" />
                    </svg>
                    Continue with Google
                  </button>
                  <button className="au-social" type="button" style={{ background: "#25D366", borderColor: "#25D366", color: "#fff" }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff" aria-hidden="true">
                      <path d="M.06 24l1.68-6.16A11.87 11.87 0 0 1 .13 11.9C.12 5.33 5.46 0 12.03 0a11.82 11.82 0 0 1 8.42 3.49 11.82 11.82 0 0 1 3.48 8.42c0 6.57-5.34 11.9-11.91 11.9a11.9 11.9 0 0 1-5.7-1.45L.06 24zM6.6 20.2c1.68.99 3.28 1.59 5.42 1.59 5.46 0 9.91-4.44 9.91-9.9 0-5.47-4.43-9.9-9.9-9.9-5.47 0-9.9 4.43-9.9 9.9 0 2.25.66 3.93 1.76 5.7l-.99 3.62 3.7-.99zM17.9 14.7c-.07-.12-.27-.2-.56-.34-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.76-1.65-2.05-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.6-.92-2.2-.24-.58-.49-.5-.67-.5l-.57-.02c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.22 3.08.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2-1.41.25-.7.25-1.29.18-1.41z" />
                    </svg>
                    Continue with WhatsApp
                  </button>
                </div>

                <div data-reveal="" style={{ display: "flex", alignItems: "center", gap: 14, margin: "22px 0" }}>
                  <span style={{ flex: 1, height: 1, background: "var(--line)" }} />
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--muted)" }}>or with email</span>
                  <span style={{ flex: 1, height: 1, background: "var(--line)" }} />
                </div>
                */}

                {/* registration form */}
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 13 }}>
                  <label data-reveal="" style={{ display: "block" }}>
                    <span style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--muted)", marginBottom: 6 }}>Full name</span>
                    <input
                      className="au-input"
                      type="text"
                      placeholder="Ayesha Khan"
                      autoComplete="name"
                      required
                      value={form.name}
                      onChange={update("name")}
                    />
                  </label>

                  <label data-reveal="" style={{ display: "block" }}>
                    <span style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--muted)", marginBottom: 6 }}>Email</span>
                    <input
                      className="au-input"
                      type="email"
                      placeholder="you@studio.pk"
                      autoComplete="email"
                      required
                      value={form.email}
                      onChange={update("email")}
                    />
                  </label>

                  <label data-reveal="" style={{ display: "block" }}>
                    <span style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--muted)", marginBottom: 6 }}>Password</span>
                    <span style={{ position: "relative", display: "block" }}>
                      <input
                        className="au-input"
                        type={showPw ? "text" : "password"}
                        placeholder="Min. 8 characters"
                        autoComplete="new-password"
                        required
                        minLength={8}
                        style={{ paddingRight: 58 }}
                        value={form.password}
                        onChange={update("password")}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPw(!showPw)}
                        aria-label="Toggle password visibility"
                        style={{ position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", padding: 8, color: "var(--muted)", fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }}
                      >
                        {showPw ? "HIDE" : "SHOW"}
                      </button>
                    </span>
                  </label>

                  {error && (
                    <div style={{ display: "flex", alignItems: "center", gap: 9, fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "var(--terra)", background: "color-mix(in oklab, var(--terra) 12%, transparent)", border: "1px solid color-mix(in oklab, var(--terra) 32%, transparent)", borderRadius: 10, padding: "11px 13px" }}>
                      <span>✕</span> {error}
                    </div>
                  )}

                  <button
                    ref={btnRef}
                    data-reveal=""
                    type="submit"
                    disabled={loading}
                    style={{ position: "relative", marginTop: 6, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 12, padding: "15px 24px", borderRadius: 12, border: "none", background: "var(--sig)", color: "var(--onSig)", fontFamily: "'General Sans'", fontWeight: 600, fontSize: 16, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.72 : 1, width: "100%" }}
                  >
                    <span ref={innerRef} style={{ display: "inline-flex", alignItems: "center", gap: 12 }}>
                      {loading ? "Creating account…" : "Create account"}
                      <span style={{ width: 26, height: 26, borderRadius: "50%", background: "var(--onSig)", color: "var(--sig)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                        <svg
                          ref={iconRef}
                          width="15" height="15"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          style={{ transition: "transform .35s cubic-bezier(.2,.7,.2,1)" }}
                        >
                          <path d="M7 17 17 7M9 7h8v8" />
                        </svg>
                      </span>
                    </span>
                  </button>
                </form>

                <p data-reveal="" style={{ textAlign: "center", fontSize: 14, color: "var(--muted)", margin: "24px 0 0" }}>
                  Already have an account?{" "}
                  <Link href="/auth/login" style={{ fontFamily: "'General Sans'", fontWeight: 600, fontSize: 14, color: "var(--sig)", textDecoration: "underline", textUnderlineOffset: 3 }}>
                    Log in
                  </Link>
                </p>
                <p data-reveal="" style={{ textAlign: "center", fontSize: 11, lineHeight: 1.5, color: "var(--muted)", margin: "18px auto 0", maxWidth: 320 }}>
                  By continuing you agree to our{" "}
                  <a href="#" style={S}>Terms</a> &amp; <a href="#" style={S}>Privacy Policy</a>.
                </p>
              </div>
            </div>

            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: ".08em", color: "var(--muted)", textAlign: "center" }}>
              Made in Pakistan · 🇵🇰
            </div>
          </div>

          {/* ===== RIGHT: SHOWCASE ===== */}
          <div className="au-showcase" style={{ position: "relative", zIndex: 10, overflow: "hidden", background: "var(--sig)", color: "var(--onSig)", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "clamp(36px, 4vw, 60px)" }}>
            <div aria-hidden="true" style={{ position: "absolute", inset: 0, opacity: .1, backgroundImage: "radial-gradient(rgba(255,255,255,.7) 1px, transparent 1px)", backgroundSize: "26px 26px", pointerEvents: "none" }} />
            <svg width="200" height="200" viewBox="0 0 40 40" fill="rgba(255,255,255,0.06)" style={{ position: "absolute", bottom: -52, right: -44, animation: "au-spin 30s linear infinite" }} aria-hidden="true">
              <path d="M20 0c3 13 7 17 20 20-13 3-17 7-20 20-3-13-7-17-20-20C13 17 17 13 20 0Z" />
            </svg>
            <svg aria-hidden="true" width="26" height="26" viewBox="0 0 40 40" fill="var(--terra)" style={{ position: "absolute", top: "11%", right: "14%", animation: "au-twinkle 3.3s ease-in-out infinite" }}>
              <path d="M20 0c3 13 7 17 20 20-13 3-17 7-20 20-3-13-7-17-20-20C13 17 17 13 20 0Z" />
            </svg>

            <div style={{ position: "relative", maxWidth: "30ch" }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", opacity: .7, marginBottom: 18 }}>The AI Brand Operating System</div>
              <p style={{ fontFamily: "'General Sans'", fontWeight: 600, fontSize: "clamp(26px, 2.5vw, 36px)", lineHeight: 1.12, letterSpacing: "-0.02em", margin: 0 }}>
                Branding that <span style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic", fontWeight: 400, color: "#E0A93C" }}>runs itself.</span>
              </p>
            </div>

            {/* floating brand DNA card */}
            <div style={{ position: "relative", alignSelf: "center", width: "min(310px, 92%)", margin: "24px 0" }}>
              <div style={{ position: "relative", borderRadius: 20, color: "var(--ink)", border: "1px solid rgba(255,255,255,.5)", boxShadow: "0 40px 80px -34px rgba(0,0,0,.6)", padding: 20, transform: "rotate(-2deg)", background: "var(--surface)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--muted)" }}>Brand DNA · 001</span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "var(--leaf)" }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--leaf)" }} />
                    LIVE
                  </span>
                </div>
                <div style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic", fontSize: 30, marginBottom: 14 }}>Saha &amp; Co.</div>
                <div style={{ display: "flex", gap: 7, marginBottom: 16 }}>
                  <span style={{ flex: 1, height: 32, borderRadius: 7, background: "var(--terra)" }} />
                  <span style={{ flex: 1, height: 32, borderRadius: 7, background: "#E0A93C" }} />
                  <span style={{ flex: 1, height: 32, borderRadius: 7, background: "var(--sig)" }} />
                  <span style={{ flex: 1, height: 32, borderRadius: 7, background: "var(--ink)" }} />
                </div>
                <div style={{ borderTop: "1px solid var(--line)", paddingTop: 13, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--muted)" }}>Consistency</span>
                  <span style={{ fontFamily: "'General Sans'", fontWeight: 700, fontSize: 18, color: "var(--sig)" }}>98</span>
                </div>
              </div>
              <div style={{ position: "absolute", top: -16, left: -18, width: 70, height: 70, borderRadius: "50%", background: "#E0A93C", color: "#3a2a18", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", boxShadow: "0 18px 36px -16px rgba(0,0,0,.5)", transform: "rotate(-11deg)", animation: "au-f1 6s ease-in-out infinite", border: "2px dashed rgba(58,42,24,.35)" }}>
                <span style={{ fontFamily: "'General Sans'", fontWeight: 700, fontSize: 20, lineHeight: 1 }}>98</span>
                <span style={{ fontSize: 8, letterSpacing: ".1em", textTransform: "uppercase" }}>on-brand</span>
              </div>
              <div style={{ position: "absolute", bottom: -14, right: -16, background: "var(--surface)", color: "var(--ink)", borderRadius: 13, padding: "10px 13px", boxShadow: "0 18px 36px -16px rgba(0,0,0,.5)", transform: "rotate(5deg)", animation: "au-f2 7s ease-in-out infinite" }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "var(--terra)" }}>EN · اردو · Roman</div>
              </div>
            </div>

            {/* testimonial */}
            <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ display: "flex" }}>
                <span style={{ width: 34, height: 34, borderRadius: "50%", background: "var(--terra)", border: "2px solid var(--sig)" }} />
                <span style={{ width: 34, height: 34, borderRadius: "50%", background: "#E0A93C", border: "2px solid var(--sig)", marginLeft: -11 }} />
                <span style={{ width: 34, height: 34, borderRadius: "50%", background: "var(--bg)", border: "2px solid var(--sig)", marginLeft: -11 }} />
              </div>
              <div>
                <div style={{ color: "#E0A93C", fontSize: 13, letterSpacing: ".05em" }}>★★★★★</div>
                <div style={{ fontSize: 13, opacity: .85 }}>Loved by <strong style={{ fontWeight: 700 }}>200+</strong> studios &amp; founders</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
