"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Mail, Check, X } from "lucide-react";
import { useInvitations, useWorkspaces, type Invitation } from "@/lib/hooks";

export function InviteNotifications() {
  const { update } = useSession();
  const router = useRouter();
  const { invitations, mutate: mutateInvites } = useInvitations();
  const { mutate: mutateWorkspaces } = useWorkspaces();
  const [busy, setBusy] = useState("");

  if (invitations.length === 0) return null;

  async function accept(inv: Invitation) {
    setBusy(inv.token);
    try {
      const res = await fetch(`/api/team/invite/${inv.token}`, { method: "POST" });
      if (res.ok) {
        // Switch into the new workspace + revalidate everything live (no reload).
        await update({ activeOrgId: inv.orgId });
        await Promise.all([mutateInvites(), mutateWorkspaces()]);
        router.refresh();
      } else {
        const d = await res.json().catch(() => ({}));
        alert(d.error || "Could not accept invite");
      }
    } finally {
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
      // Optimistically drop it, then revalidate.
      mutateInvites(
        { invitations: invitations.filter((i) => i.token !== inv.token) },
        { revalidate: true }
      );
    } finally {
      setBusy("");
    }
  }

  return (
    <div className="space-y-2">
      {invitations.map((inv) => (
        <div
          key={inv.token}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl px-4 py-3"
          style={{ border: "1px solid color-mix(in oklab, var(--sig) 30%, var(--line))", background: "color-mix(in oklab, var(--sig) 10%, transparent)" }}
        >
          <div className="flex items-center gap-2.5 text-sm" style={{ color: "var(--ink)" }}>
            <Mail className="w-4 h-4 flex-shrink-0" style={{ color: "var(--sig)" }} />
            <span>
              <strong>{inv.inviterName}</strong> invited you to join{" "}
              <strong>{inv.workspaceName}</strong> as{" "}
              <span className="capitalize" style={{ color: "var(--sig)" }}>{inv.role}</span>.
            </span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => accept(inv)}
              disabled={busy === inv.token}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium disabled:opacity-50"
              style={{ background: "var(--sig)", color: "var(--onSig)", border: "none", cursor: "pointer" }}
            >
              <Check className="w-3.5 h-3.5" /> Accept
            </button>
            <button
              onClick={() => decline(inv)}
              disabled={busy === inv.token}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs disabled:opacity-50"
              style={{ border: "1px solid var(--line)", color: "var(--muted)", background: "none", cursor: "pointer" }}
            >
              <X className="w-3.5 h-3.5" /> Decline
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
