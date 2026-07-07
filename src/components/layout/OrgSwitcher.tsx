"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Building2, User, Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { useWorkspaces, type Workspace } from "@/lib/hooks";
import { cn } from "@/lib/utils";

const PLAN_STYLES: Record<string, string> = {
  free: "text-text-dim",
  pro: "text-primary-light",
  agency: "text-accent",
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
      className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface-2 text-left transition-colors"
    >
      <div
        className={cn(
          "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg",
          ws.isPersonal ? "bg-surface-2" : "bg-primary/15"
        )}
      >
        {ws.isPersonal ? (
          <User className="h-4 w-4 text-text-muted" />
        ) : (
          <Building2 className="h-4 w-4 text-primary-light" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-text">{ws.name}</p>
        <p className="text-[11px] text-text-dim">
          {ws.isPersonal ? "Personal" : `Team · ${ws.memberCount} members`}
          <span className={cn("ml-1.5 capitalize", PLAN_STYLES[ws.plan] ?? "text-text-dim")}>
            · {ws.plan}
          </span>
        </p>
      </div>
      {active && <Check className="h-4 w-4 flex-shrink-0 text-primary-light" />}
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
        className="flex items-center gap-2.5 rounded-xl border border-border bg-surface px-3 py-2 hover:border-primary/40 transition-colors min-w-[200px]"
      >
        <div
          className={cn(
            "flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg",
            active?.isPersonal ? "bg-surface-2" : "bg-primary/15"
          )}
        >
          {switching ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-text-muted" />
          ) : active?.isPersonal ? (
            <User className="h-3.5 w-3.5 text-text-muted" />
          ) : (
            <Building2 className="h-3.5 w-3.5 text-primary-light" />
          )}
        </div>
        <div className="min-w-0 flex-1 text-left">
          <p className="truncate text-sm font-medium text-text leading-tight">
            {active?.name ?? "Workspace"}
          </p>
          <p className="text-[11px] text-text-dim capitalize leading-tight">
            {active ? `${active.role} · ${active.plan}` : ""}
          </p>
        </div>
        <ChevronsUpDown className="h-4 w-4 flex-shrink-0 text-text-dim" />
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-72 rounded-xl border border-border bg-surface p-2 shadow-xl">
          {personal.length > 0 && (
            <>
              <p className="px-3 pb-1 pt-1.5 text-[10px] font-semibold uppercase tracking-widest text-text-dim">
                Personal
              </p>
              {personal.map((ws) => (
                <WorkspaceRow key={ws.orgId} ws={ws} active={ws.orgId === activeId} onSelect={() => switchTo(ws.orgId)} />
              ))}
            </>
          )}
          {teams.length > 0 && (
            <>
              <p className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-widest text-text-dim">
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
