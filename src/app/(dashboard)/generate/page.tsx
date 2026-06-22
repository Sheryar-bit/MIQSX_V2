import Link from "next/link";
import { PenTool, Type, Globe, Image as ImageIcon, Download, Star } from "lucide-react";

const tools = [
  {
    href: "/generate/logo",
    icon: PenTool,
    title: "Logo Generator",
    desc: "Compose vector-first SVG logos from your Brand DNA — plus AI logo concepts via FLUX.",
    badge: "Vector-first",
    color: "from-violet-500/20 to-purple-500/10 border-violet-500/20",
    iconColor: "text-violet-400",
  },
  {
    href: "/generate/taglines",
    icon: Type,
    title: "Tagline Generator",
    desc: "8 taglines in distinct emotional styles — bold, witty, aspirational, Urdu-inspired.",
    badge: "Groq",
    color: "from-amber-500/20 to-orange-500/10 border-amber-500/20",
    iconColor: "text-amber-400",
  },
  {
    href: "/generate/captions",
    icon: Globe,
    title: "Trilingual Captions",
    desc: "One post topic → English + اردو + Roman Urdu captions in your brand voice.",
    badge: "Pakistan-first",
    color: "from-green-500/20 to-emerald-500/10 border-green-500/20",
    iconColor: "text-green-400",
  },
  {
    href: "/generate/imagery",
    icon: ImageIcon,
    title: "Post Imagery",
    desc: "Cloudflare Workers AI brand imagery with style filters: Realism, Neon, Minimalist, Vintage, 3D, and more.",
    badge: "Workers AI",
    color: "from-blue-500/20 to-cyan-500/10 border-blue-500/20",
    iconColor: "text-blue-400",
  },
  {
    href: "/generate/imagery",
    icon: Download,
    title: "Social Media Kit",
    desc: "Auto-export any image to all platform sizes — Instagram, Facebook, LinkedIn, Twitter, YouTube.",
    badge: "Built-in",
    color: "from-pink-500/20 to-rose-500/10 border-pink-500/20",
    iconColor: "text-pink-400",
  },
  {
    href: "/generate/festive",
    icon: Star,
    title: "Festive Variants",
    desc: "AI festive posters for Eid, Ramadan, 14 August & New Year — FLUX-generated, share-ready.",
    badge: "Desi",
    color: "from-yellow-500/20 to-green-500/10 border-yellow-500/20",
    iconColor: "text-yellow-400",
  },
];

export default function GenerateHubPage() {
  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-text">Generate</h1>
        <p className="text-text-muted mt-1">
          Every generator pulls your Brand DNA automatically — colors, tone, and style are always consistent.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {tools.map((t) => (
          <Link
            key={t.href + t.title}
            href={t.href}
            className={`rounded-2xl border bg-gradient-to-br p-6 hover:scale-[1.02] transition-all duration-200 ${t.color}`}
          >
            <div className="flex items-start justify-between mb-4">
              <t.icon className={`h-7 w-7 ${t.iconColor}`} />
              <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-text-muted font-medium">
                {t.badge}
              </span>
            </div>
            <h3 className="font-semibold text-text mb-1">{t.title}</h3>
            <p className="text-sm text-text-muted leading-relaxed">{t.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
