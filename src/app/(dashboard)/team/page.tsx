"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { Users, Mail, Clock, Shield, Copy, Check, Activity, AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Member {
  userId: string;
  name: string;
  email: string;
  role: string;
  joinedAt: string;
}

interface ActivityEntry {
  actorName: string;
  action: string;
  detail?: string;
  createdAt: string;
}

interface Invite {
  _id: string;
  email: string;
  role: string;
  status: string;
  expiresAt: string;
  token?: string;
}

const ROLES = ["editor", "viewer", "admin"];

function acceptUrl(token: string) {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  return `${origin}/team/accept/${token}`;
}

export default function TeamPage() {
  const router = useRouter();

  // Live data — members/invites/activity auto-refresh so an accepted invite or
  // a new member appears on its own, no manual reload.
  const { data: mData, mutate: mutateMembers, isLoading } = useSWR<{
    members: Member[];
    myRole: string;
    workspaceName?: string;
    plan?: string;
  }>("/api/team/members", { refreshInterval: 4000, refreshWhenHidden: true });

  const members = mData?.members ?? [];
  const myRole = mData?.myRole ?? "";
  const workspace = mData?.workspaceName ? { name: mData.workspaceName, plan: mData.plan ?? "free" } : null;
  const canManage = myRole === "owner" || myRole === "admin";
  const isOwner = myRole === "owner";

  const { data: iData, mutate: mutateInvites } = useSWR<{ invites: Invite[] }>(
    canManage ? "/api/team/invite" : null,
    { refreshInterval: 4000, refreshWhenHidden: true }
  );
  const invites = iData?.invites ?? [];

  const { data: aData, mutate: mutateActivity } = useSWR<{ activity: ActivityEntry[] }>(
    canManage ? "/api/team/activity" : null,
    { refreshInterval: 8000 }
  );
  const activity = aData?.activity ?? [];

  const [email, setEmail] = useState("");
  const [role, setRole] = useState("editor");
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState("");
  const [locked, setLocked] = useState(false);
  const [copied, setCopied] = useState("");
  const [transferTo, setTransferTo] = useState("");

  const loading = isLoading;

  function reloadAll() {
    mutateMembers();
    if (canManage) {
      mutateInvites();
      mutateActivity();
    }
  }

  async function leaveWorkspace() {
    if (!confirm("Leave this workspace? You'll lose access to its brands.")) return;
    const res = await fetch("/api/team/leave", { method: "POST" });
    if (res.ok) window.location.href = "/dashboard";
    else setNotice((await res.json()).error || "Could not leave");
  }

  async function transferOwnership() {
    if (!transferTo) return;
    if (!confirm("Transfer ownership? You'll become an Admin and can't undo this yourself.")) return;
    const res = await fetch("/api/team/transfer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: transferTo }),
    });
    if (res.ok) {
      router.refresh();
      reloadAll();
    } else setNotice((await res.json()).error || "Could not transfer");
  }

  async function deleteWorkspace() {
    if (!confirm("Permanently delete this workspace and ALL its brands/reviews? This cannot be undone.")) return;
    const res = await fetch("/api/team/workspace", { method: "DELETE" });
    if (res.ok) window.location.href = "/dashboard";
    else setNotice((await res.json()).error || "Could not delete");
  }

  async function revokeInvite(inviteId: string) {
    if (!confirm("Revoke this invite? The person will no longer be able to join with it.")) return;
    await fetch("/api/team/invite", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inviteId }),
    });
    reloadAll();
  }

  async function copyLink(token: string, key: string) {
    try {
      await navigator.clipboard.writeText(acceptUrl(token));
      setCopied(key);
      setTimeout(() => setCopied(""), 2000);
    } catch {
      setNotice(acceptUrl(token));
    }
  }

  async function sendInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setSending(true);
    setNotice("");
    try {
      const res = await fetch("/api/team/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), role }),
      });
      const d = await res.json();
      if (res.status === 403) {
        setLocked(true);
        setNotice(d.error || "Team invites aren't available on your plan.");
      } else if (!res.ok) {
        setNotice(d.error || "Could not send invite");
      } else {
        setNotice(`Invite created for ${d.email}. Use the “Copy link” button below to share it.`);
        setEmail("");
        reloadAll();
      }
    } catch {
      setNotice("Network error");
    } finally {
      setSending(false);
    }
  }

  async function changeRole(userId: string, role: string) {
    await fetch("/api/team/members", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, role }),
    });
    reloadAll();
  }

  async function removeMember(userId: string) {
    await fetch("/api/team/members", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    reloadAll();
  }

  const pending = invites.filter((i) => i.status === "pending");

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-text flex items-center gap-2">
          <Users className="w-6 h-6 text-primary-light" />
          Team
        </h1>
        <p className="text-text-muted mt-1">
          {workspace ? (
            <>
              <span className="text-text">{workspace.name}</span>
              <span className="mx-1.5">·</span>
              <span className="capitalize text-primary-light">{workspace.plan} plan</span>
            </>
          ) : canManage ? (
            "Invite collaborators to your workspace."
          ) : (
            "Members of this workspace."
          )}
        </p>
      </div>

      {/* Invite form — owner/admin only */}
      {canManage && (
        <form onSubmit={sendInvite} className="rounded-2xl border border-border bg-surface p-5 space-y-4">
          <h2 className="text-text font-semibold flex items-center gap-2">
            <Mail className="w-4 h-4 text-text-muted" /> Invite a member
          </h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Input
                type="email"
                placeholder="teammate@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={locked}
              />
            </div>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              disabled={locked}
              className="h-10 rounded-xl border border-border bg-surface px-4 text-sm text-text focus:outline-none focus:border-primary"
            >
              {ROLES.map((r) => (
                <option key={r} value={r} className="bg-surface capitalize">
                  {r}
                </option>
              ))}
            </select>
            <Button type="submit" loading={sending} disabled={locked}>
              Send invite
            </Button>
          </div>
          {notice && <p className="text-sm text-text-muted break-all">{notice}</p>}
        </form>
      )}

      {/* Pending invites — owner/admin only, with copy-link */}
      {canManage && (
        <div>
          <h2 className="text-text font-semibold mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-text-muted" /> Pending invites
          </h2>
          {loading ? (
            <p className="text-text-dim text-sm">Loading…</p>
          ) : pending.length === 0 ? (
            <p className="text-text-dim text-sm">No pending invites.</p>
          ) : (
            <div className="space-y-2">
              {pending.map((i) => (
                <div
                  key={i._id}
                  className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3"
                >
                  <div>
                    <p className="text-text text-sm">{i.email}</p>
                    <p className="text-text-dim text-xs capitalize">
                      {i.role} · expires {new Date(i.expiresAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    {i.token && (
                      <button
                        onClick={() => copyLink(i.token!, i._id)}
                        className="inline-flex items-center gap-1.5 text-xs text-primary-light hover:underline"
                      >
                        {copied === i._id ? (
                          <>
                            <Check className="w-3.5 h-3.5" /> Copied
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" /> Copy invite link
                          </>
                        )}
                      </button>
                    )}
                    <button
                      onClick={() => revokeInvite(i._id)}
                      className="text-xs text-error hover:underline"
                    >
                      Revoke
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Members — visible to everyone; controls only for managers */}
      <div>
        <h2 className="text-text font-semibold mb-3 flex items-center gap-2">
          <Shield className="w-4 h-4 text-text-muted" /> Members
        </h2>
        {loading ? (
          <p className="text-text-dim text-sm">Loading…</p>
        ) : members.length === 0 ? (
          <p className="text-text-dim text-sm">No team members yet.</p>
        ) : (
          <div className="space-y-2">
            {members.map((m) => (
              <div
                key={m.userId}
                className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3"
              >
                <div>
                  <p className="text-text text-sm">{m.name}</p>
                  <p className="text-text-dim text-xs">{m.email}</p>
                </div>
                {canManage && m.role !== "owner" ? (
                  <div className="flex items-center gap-2">
                    <select
                      value={m.role}
                      onChange={(e) => changeRole(m.userId, e.target.value)}
                      className="h-8 rounded-lg border border-border bg-surface px-2 text-xs text-text focus:outline-none focus:border-primary capitalize"
                    >
                      {["admin", "editor", "viewer"].map((r) => (
                        <option key={r} value={r} className="bg-surface capitalize">
                          {r}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => removeMember(m.userId)}
                      className="text-xs text-error hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary-light border border-primary/20 capitalize">
                    {m.role}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Activity feed — owner/admin */}
      {canManage && activity.length > 0 && (
        <div>
          <h2 className="text-text font-semibold mb-3 flex items-center gap-2">
            <Activity className="w-4 h-4 text-text-muted" /> Recent activity
          </h2>
          <div className="rounded-xl border border-border bg-surface divide-y divide-border">
            {activity.map((a, idx) => (
              <div key={idx} className="flex items-center justify-between px-4 py-2.5 text-sm">
                <span className="text-text-muted">
                  <strong className="text-text">{a.actorName}</strong> {a.detail || a.action}
                </span>
                <span className="text-xs text-text-dim">
                  {new Date(a.createdAt).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Workspace controls */}
      {!loading && !isOwner && myRole && (
        <button onClick={leaveWorkspace} className="text-sm text-error hover:underline">
          Leave this workspace
        </button>
      )}

      {isOwner && (
        <div className="rounded-2xl border border-error/30 bg-error/5 p-5 space-y-4">
          <h2 className="text-text font-semibold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-error" /> Danger zone
          </h2>

          {members.filter((m) => m.role !== "owner").length > 0 && (
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <select
                value={transferTo}
                onChange={(e) => setTransferTo(e.target.value)}
                className="h-9 rounded-lg border border-border bg-surface px-3 text-sm text-text focus:outline-none focus:border-primary"
              >
                <option value="">Transfer ownership to…</option>
                {members
                  .filter((m) => m.role !== "owner")
                  .map((m) => (
                    <option key={m.userId} value={m.userId} className="bg-surface">
                      {m.name} ({m.email})
                    </option>
                  ))}
              </select>
              <button
                onClick={transferOwnership}
                disabled={!transferTo}
                className="text-sm border border-border rounded-lg px-3 py-1.5 text-text hover:bg-surface-2 disabled:opacity-50"
              >
                Transfer
              </button>
            </div>
          )}

          <div className="flex items-center justify-between pt-1">
            <p className="text-text-muted text-sm">Permanently delete this workspace and all its data.</p>
            <button
              onClick={deleteWorkspace}
              className="text-sm bg-error/90 hover:bg-error text-white px-3 py-1.5 rounded-lg"
            >
              Delete workspace
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
