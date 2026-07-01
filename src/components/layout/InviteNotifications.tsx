"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Mail, Check, X } from "lucide-react";

interface Invitation {
  token: string;
  role: string;
  orgId: string;
  workspaceName: string;
  inviterName: string;
}

export function InviteNotifications() {
  const { update } = useSession();
  const [invites, setInvites] = useState<Invitation[]>([]);
  const [busy, setBusy] = useState("");

  useEffect(() => {
    let active = true;
    const refresh = () =>
      fetch("/api/invitations")
        .then((r) => r.json())
        .then((d) => {
          if (active) setInvites(d.invitations ?? []);
        })
        .catch(() => {});

    refresh();
    // Poll so a freshly-sent invite appears without a manual refresh, and
    // refetch whenever the user returns to the tab.
    const interval = setInterval(refresh, 30_000);
    const onFocus = () => document.visibilityState === "visible" && refresh();
    document.addEventListener("visibilitychange", onFocus);
    window.addEventListener("focus", refresh);

    return () => {
      active = false;
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onFocus);
      window.removeEventListener("focus", refresh);
    };
  }, []);

  if (invites.length === 0) return null;

  async function accept(inv: Invitation) {
    setBusy(inv.token);
    try {
      const res = await fetch(`/api/team/invite/${inv.token}`, { method: "POST" });
      if (res.ok) {
        // Switch the session into the newly joined workspace, then reload so all
        // data (sidebar, switcher, brands) reflects it.
        await update({ activeOrgId: inv.orgId });
        window.location.reload();
      } else {
        const d = await res.json();
        alert(d.error || "Could not accept invite");
        setBusy("");
      }
    } catch {
      setBusy("");
    }
  }

  async function decline(inv: Invitation) {
    setBusy(inv.token);
    try {
      await fetch("/api/invitations", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: inv.token }),
      });
      setInvites((prev) => prev.filter((i) => i.token !== inv.token));
    } finally {
      setBusy("");
    }
  }

  return (
    <div className="space-y-2">
      {invites.map((inv) => (
        <div
          key={inv.token}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border border-primary/30 bg-primary/10 px-4 py-3"
        >
          <div className="flex items-center gap-2.5 text-sm text-text">
            <Mail className="w-4 h-4 text-primary-light flex-shrink-0" />
            <span>
              <strong>{inv.inviterName}</strong> invited you to join{" "}
              <strong>{inv.workspaceName}</strong> as{" "}
              <span className="capitalize text-primary-light">{inv.role}</span>.
            </span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => accept(inv)}
              disabled={busy === inv.token}
              className="inline-flex items-center gap-1.5 bg-primary hover:bg-primary-hover text-white px-3 py-1.5 rounded-lg text-xs font-medium disabled:opacity-50"
            >
              <Check className="w-3.5 h-3.5" /> Accept
            </button>
            <button
              onClick={() => decline(inv)}
              disabled={busy === inv.token}
              className="inline-flex items-center gap-1.5 border border-border text-text-muted hover:text-text px-3 py-1.5 rounded-lg text-xs disabled:opacity-50"
            >
              <X className="w-3.5 h-3.5" /> Decline
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
