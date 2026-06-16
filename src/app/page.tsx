import Link from "next/link";
import { ArrowRight, Zap, Shield, Brain, Users, Globe, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Brain,
    title: "Brand DNA Engine",
    desc: "A structured brand object — colors, fonts, tone, audience, rules — stored as the single source of truth for every asset you ever create.",
  },
  {
    icon: Zap,
    title: "AI Brand Strategist",
    desc: "An AI interviewer asks 10 adaptive questions and synthesizes your answers into a complete Brand DNA. No forms, just conversation.",
  },
  {
    icon: Shield,
    title: "Brand Guardian",
    desc: "Every generated asset is validated against your Brand DNA. Catches inconsistencies before your client does.",
  },
  {
    icon: Globe,
    title: "Pakistan-First Localization",
    desc: "Urdu typography, Roman Urdu copy, Pakistani cultural context, desi content calendar, and PKR pricing. No global tool will ever build this.",
  },
  {
    icon: Users,
    title: "Review Board",
    desc: "Team approval workflows, roles, and login-free client approval via WhatsApp link. Built for agencies managing 5–20 brands.",
  },
  {
    icon: Brain,
    title: "Learning Feedback Loop",
    desc: "Every piece of feedback trains your brand's preferences. Features can be copied; your client's feedback history cannot.",
  },
];

const comparisons = [
  { cap: "Cross-asset consistency engine", looka: false, canva: false, miqsx: true },
  { cap: "Brand audit of existing brands", looka: false, canva: false, miqsx: true },
  { cap: "Asset validation (stress test, print, a11y)", looka: false, canva: false, miqsx: true },
  { cap: "Learns from feedback over time", looka: false, canva: false, miqsx: true },
  { cap: "Team approval workflow", looka: false, canva: "partial", miqsx: true },
  { cap: "Client approval without login", looka: false, canva: false, miqsx: true },
  { cap: "Urdu / Roman Urdu / cultural context", looka: false, canva: false, miqsx: true },
  { cap: "Brand name + domain checker", looka: false, canva: false, miqsx: true },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-gradient-brand flex items-center justify-center">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold">MIQSX</span>
            <span className="text-xs text-text-dim font-medium px-2 py-0.5 rounded-full border border-border ml-1">Brand OS</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/login">
              <Button variant="ghost" size="sm">Sign in</Button>
            </Link>
            <Link href="/auth/signup">
              <Button size="sm">Get started free</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-hero-glow pointer-events-none" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-4 py-1.5 text-xs text-primary-light font-medium mb-8">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            Pakistan's first AI Brand Operating System
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold leading-[1.08] tracking-tight mb-6">
            <span className="text-gradient">Looka makes a logo.</span>
            <br />
            <span className="text-text">MIQSX runs</span>
            <br />
            <span className="text-text">your brand.</span>
          </h1>

          <p className="text-xl text-text-muted max-w-2xl mx-auto mb-10 leading-relaxed">
            One Brand DNA keeps every asset consistent. AI validates before you publish.
            Learns from your feedback. Built for freelancers and agencies in Pakistan — in Urdu, Roman Urdu, and English.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth/signup">
              <Button size="lg" className="gap-2 px-8">
                Build your Brand DNA free
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/audit">
              <Button variant="outline" size="lg">
                Audit your existing brand →
              </Button>
            </Link>
          </div>

          <p className="text-sm text-text-dim mt-6">
            Free forever for 1 brand · No credit card required · Works in Urdu
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Generation is a commodity.{" "}
              <span className="text-gradient">Judgment is not.</span>
            </h2>
            <p className="text-text-muted max-w-xl mx-auto">
              Every tool generates. MIQSX checks, validates, learns, and enforces — so your brand stays consistent whether you have a team of 1 or 20.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-border bg-surface p-6 hover:border-primary/30 hover:bg-surface-2 transition-all duration-300"
              >
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <f.icon className="h-5 w-5 text-primary-light" />
                </div>
                <h3 className="font-semibold text-text mb-2">{f.title}</h3>
                <p className="text-sm text-text-muted leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-24 px-6 bg-surface border-t border-border">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">How we stack up</h2>
            <p className="text-text-muted">The features that matter — not the ones that look good in demos.</p>
          </div>
          <div className="rounded-2xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-2">
                  <th className="text-left px-6 py-4 text-text-muted font-medium">Capability</th>
                  <th className="text-center px-4 py-4 text-text-muted font-medium">Looka</th>
                  <th className="text-center px-4 py-4 text-text-muted font-medium">Canva</th>
                  <th className="text-center px-4 py-4 text-primary-light font-semibold">MIQSX</th>
                </tr>
              </thead>
              <tbody>
                {comparisons.map((row, i) => (
                  <tr key={row.cap} className={i % 2 === 0 ? "bg-surface" : "bg-surface/50"}>
                    <td className="px-6 py-3.5 text-text-muted">{row.cap}</td>
                    <td className="text-center px-4 py-3.5">
                      {row.looka ? <CheckCircle className="h-4 w-4 text-success mx-auto" /> : <XCircle className="h-4 w-4 text-border-light mx-auto" />}
                    </td>
                    <td className="text-center px-4 py-3.5">
                      {row.canva === "partial"
                        ? <span className="text-text-dim text-xs">Partial</span>
                        : row.canva
                          ? <CheckCircle className="h-4 w-4 text-success mx-auto" />
                          : <XCircle className="h-4 w-4 text-border-light mx-auto" />}
                    </td>
                    <td className="text-center px-4 py-3.5">
                      <CheckCircle className="h-4 w-4 text-success mx-auto" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 border-t border-border text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl font-bold mb-4">
            Your brand deserves a{" "}
            <span className="text-gradient">nervous system.</span>
          </h2>
          <p className="text-text-muted mb-8 text-lg">
            Start with one brand, free. Upgrade when you're ready to manage more.
          </p>
          <Link href="/auth/signup">
            <Button size="lg" className="px-10">
              Get started — it's free
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-gradient-brand flex items-center justify-center">
              <Zap className="h-3 w-3 text-white" />
            </div>
            <span className="text-sm font-semibold">MIQSX</span>
            <span className="text-xs text-text-dim">Brand OS</span>
          </div>
          <p className="text-xs text-text-dim">
            © 2026 MIQSX · Made in Pakistan 🇵🇰
          </p>
          <div className="flex gap-4 text-xs text-text-dim">
            <a href="#" className="hover:text-text transition-colors">Privacy</a>
            <a href="#" className="hover:text-text transition-colors">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
