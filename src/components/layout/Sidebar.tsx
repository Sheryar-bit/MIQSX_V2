"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard, Sparkles, Search, Type, Image,
  LogOut, Zap, ChevronRight, PenTool, Globe, Star, ImageIcon,
  Shield, Users, AlertTriangle, MessageSquare, ClipboardList,
} from "lucide-react";
import { cn } from "@/lib/utils";

const brandItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/onboarding", label: "New Brand", icon: Sparkles },
  { href: "/audit", label: "Brand Audit", icon: Search },
  { href: "/names", label: "Name Generator", icon: Type },
  { href: "/moodboard", label: "Moodboard", icon: Image },
];

const generateItems = [
  { href: "/generate/logo", label: "Logo", icon: PenTool },
  { href: "/generate/taglines", label: "Taglines", icon: Type },
  { href: "/generate/captions", label: "Captions (3 langs)", icon: Globe },
  { href: "/generate/imagery", label: "Post Imagery", icon: ImageIcon },
  { href: "/generate/festive", label: "Festive Variants", icon: Star },
];

const validateItems = [
  { href: "/validate/guardian", label: "Brand Guardian", icon: Shield },
  { href: "/validate/focus-group", label: "Focus Group", icon: Users },
  { href: "/validate/stress-test", label: "Stress Test", icon: Zap },
  { href: "/validate/cultural", label: "Cultural Check", icon: Globe },
];

const workflowItems = [
  { href: "/review", label: "Review Board", icon: ClipboardList },
  { href: "/brief", label: "Brief Parser", icon: MessageSquare },
];

function NavItem({ href, label, icon: Icon, exact }: { href: string; label: string; icon: React.ElementType; exact?: boolean }) {
  const pathname = usePathname();
  const active = exact ? pathname === href : pathname === href || pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
        active
          ? "bg-primary/15 text-primary-light border border-primary/20"
          : "text-text-muted hover:text-text hover:bg-surface-2"
      )}
    >
      <Icon className="h-4 w-4 flex-shrink-0" />
      <span className="flex-1">{label}</span>
      {active && <ChevronRight className="h-3 w-3 opacity-60" />}
    </Link>
  );
}

export function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 border-r border-border bg-surface flex flex-col z-40">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-gradient-brand flex items-center justify-center">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <div>
            <span className="text-lg font-bold text-text">MIQSX</span>
            <p className="text-[10px] text-text-dim leading-none mt-0.5">Brand OS</p>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 overflow-y-auto space-y-5">
        {/* Brand section */}
        <div>
          <p className="text-[10px] font-semibold text-text-dim uppercase tracking-widest px-3 mb-2">Brand</p>
          <div className="space-y-1">
            {brandItems.map((item) => <NavItem key={item.href} {...item} />)}
          </div>
        </div>

        {/* Generate section */}
        <div>
          <p className="text-[10px] font-semibold text-text-dim uppercase tracking-widest px-3 mb-2">Generate</p>
          <div className="space-y-1">
            {generateItems.map((item) => <NavItem key={item.href} {...item} />)}
          </div>
        </div>

        {/* Validate section */}
        <div>
          <p className="text-[10px] font-semibold text-text-dim uppercase tracking-widest px-3 mb-2">Validate</p>
          <div className="space-y-1">
            {validateItems.map((item) => <NavItem key={item.href} {...item} />)}
          </div>
        </div>

        {/* Workflow section */}
        <div>
          <p className="text-[10px] font-semibold text-text-dim uppercase tracking-widest px-3 mb-2">Workflow</p>
          <div className="space-y-1">
            {workflowItems.map((item) => <NavItem key={item.href} {...item} />)}
          </div>
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <div className="mb-3 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 border border-border p-3">
          <p className="text-xs font-semibold text-text">Free Plan</p>
          <p className="text-[11px] text-text-dim mt-0.5">1 brand · 5 audits</p>
          <div className="mt-2 h-1.5 rounded-full bg-surface-2">
            <div className="h-full w-1/5 rounded-full bg-gradient-brand" />
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-text-muted hover:text-error hover:bg-error/10 transition-all duration-200"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
