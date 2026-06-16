import Link from "next/link";
import { Users, Shield, Zap, Globe } from "lucide-react";

const tools = [
  {
    href: "/validate/guardian",
    icon: Shield,
    label: "Brand Guardian",
    description: "Score any asset 0-100 against your Brand DNA. Color compliance, tone match, style alignment.",
    tag: "F13",
    color: "from-primary/20 to-primary/5",
    border: "border-primary/30",
  },
  {
    href: "/validate/focus-group",
    icon: Users,
    label: "AI Focus Group",
    description: "5 synthetic Pakistani personas react to your content with honest scores and feedback.",
    tag: "F12",
    color: "from-accent/20 to-accent/5",
    border: "border-accent/30",
  },
  {
    href: "/validate/stress-test",
    icon: Zap,
    label: "Logo Stress Test",
    description: "Favicon, B&W, inverted, colorblind simulations + WCAG contrast ratios.",
    tag: "F14",
    color: "from-green-500/20 to-green-500/5",
    border: "border-green-500/30",
  },
  {
    href: "/validate/cultural",
    icon: Globe,
    label: "Cultural Check",
    description: "AI reviews your copy for Pakistani cultural missteps, Urdu tone, and regional sensitivity.",
    tag: "F15",
    color: "from-rose-500/20 to-rose-500/5",
    border: "border-rose-500/30",
  },
];

export default function ValidateHub() {
  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-text">Validate & Test</h1>
        <p className="text-text-muted mt-2">
          Run your brand assets through AI-powered compliance checks before publishing.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {tools.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className={`group relative p-6 rounded-2xl border ${tool.border} bg-gradient-to-br ${tool.color} hover:scale-[1.02] transition-all duration-200`}
          >
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl bg-surface-2/80 flex items-center justify-center flex-shrink-0">
                <tool.icon className="h-6 w-6 text-text" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-lg font-semibold text-text">{tool.label}</h2>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-surface-2/60 text-text-dim border border-border">
                    {tool.tag}
                  </span>
                </div>
                <p className="text-sm text-text-muted leading-relaxed">{tool.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
