"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Building2, User, Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { useWorkspaces, type Workspace } from "@/lib/hooks";

const PLAN_COLOR: Record<string, string> = {
  free: "var(--muted)",
  pro: "var(--peri)",
  agency: "var(--terra)",
};

function WorkspaceRow({
  ws,
  active,
  onSelect,
}: {
  ws: Workspace;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors"
      style={{ background: "none", border: "none", cursor: "pointer" }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surf2)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
    >
      <div
        className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg"
        style={{ background: ws.isPersonal ? "var(--surf2)" : "color-mix(in oklab, var(--sig) 15%, transparent)" }}
      >
        {ws.isPersonal ? (
          <User className="h-4 w-4" style={{ color: "var(--muted)" }} />
        ) : (
          <Building2 className="h-4 w-4" style={{ color: "var(--sig)" }} />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm" style={{ color: "var(--ink)" }}>{ws.name}</p>
        <p className="text-[11px]" style={{ color: "var(--muted)" }}>
          {ws.isPersonal ? "Personal" : `Team · ${ws.memberCount} members`}
          <span className="ml-1.5 capitalize" style={{ color: PLAN_COLOR[ws.plan] ?? "var(--muted)" }}>
            · {ws.plan}
          </span>
        </p>
      </div>
      {active && <Check className="h-4 w-4 flex-shrink-0" style={{ color: "var(--sig)" }} />}
    </button>
  );
}

export function OrgSwitcher() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const { workspaces, mutate } = useWorkspaces();
  const [open, setOpen] = useState(false);
  const [switching, setSwitching] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const activeId = session?.user?.activeOrgId ?? workspaces[0]?.orgId;
  const active = workspaces.find((w) => w.orgId === activeId);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  if (workspaces.length === 0) return null;

  async function switchTo(orgId: string) {
    setOpen(false);
    if (orgId === activeId) return;
    setSwitching(true);
    await update({ activeOrgId: orgId });
    await mutate();
    router.refresh();
    setSwitching(false);
  }

  const personal = workspaces.filter((w) => w.isPersonal);
  const teams = workspaces.filter((w) => !w.isPersonal);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2.5 rounded-xl px-3 py-2 transition-colors min-w-[200px]"
        style={{ border: "1px solid var(--line)", background: "var(--surface)", cursor: "pointer" }}
        onMouseEnter={(e) => (e.currentTarget.style.borderColor = "color-mix(in oklab, var(--sig) 40%, var(--line))")}
        onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--line)")}
      >
        <div
          className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg"
          style={{ background: active?.isPersonal ? "var(--surf2)" : "color-mix(in oklab, var(--sig) 15%, transparent)" }}
        >
          {switching ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" style={{ color: "var(--muted)" }} />
          ) : active?.isPersonal ? (
            <User className="h-3.5 w-3.5" style={{ color: "var(--muted)" }} />
          ) : (
            <Building2 className="h-3.5 w-3.5" style={{ color: "var(--sig)" }} />
          )}
        </div>
        <div className="min-w-0 flex-1 text-left">
          <p className="truncate text-sm font-medium leading-tight" style={{ color: "var(--ink)" }}>
            {active?.name ?? "Workspace"}
          </p>
          <p className="text-[11px] capitalize leading-tight" style={{ color: "var(--muted)" }}>
            {active ? `${active.role} · ${active.plan}` : ""}
          </p>
        </div>
        <ChevronsUpDown className="h-4 w-4 flex-shrink-0" style={{ color: "var(--muted)" }} />
      </button>

      {open && (
        <div
          className="absolute right-0 z-50 mt-2 w-72 rounded-xl p-2"
          style={{ border: "1px solid var(--line)", background: "var(--surface)", boxShadow: "var(--shadow-sm, 0 20px 44px -28px rgba(0,0,0,.4))" }}
        >
          {personal.length > 0 && (
            <>
              <p className="px-3 pb-1 pt-1.5 text-[10px] font-semibold uppercase tracking-widest" style={{ color: "var(--muted)" }}>
                Personal
              </p>
              {personal.map((ws) => (
                <WorkspaceRow key={ws.orgId} ws={ws} active={ws.orgId === activeId} onSelect={() => switchTo(ws.orgId)} />
              ))}
            </>
          )}
          {teams.length > 0 && (
            <>
              <p className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-widest" style={{ color: "var(--muted)" }}>
                Teams
              </p>
              {teams.map((ws) => (
                <WorkspaceRow key={ws.orgId} ws={ws} active={ws.orgId === activeId} onSelect={() => switchTo(ws.orgId)} />
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
