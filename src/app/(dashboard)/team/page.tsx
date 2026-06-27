"use client";

import { useEffect, useState } from "react";
import { Users, Mail, Clock, Shield, Copy, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Member {
  userId: string;
  name: string;
  email: string;
  role: string;
  joinedAt: string;
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
  const [members, setMembers] = useState<Member[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [myRole, setMyRole] = useState<string>("");
  const [workspace, setWorkspace] = useState<{ name: string; plan: string } | null>(null);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("editor");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState("");
  const [locked, setLocked] = useState(false);
  const [copied, setCopied] = useState("");

  const canManage = myRole === "owner" || myRole === "admin";

  async function load() {
    const mRes = await fetch("/api/team/members").then((r) => r.json());
    if (mRes.members) setMembers(mRes.members);
    if (mRes.myRole) setMyRole(mRes.myRole);
    if (mRes.workspaceName) setWorkspace({ name: mRes.workspaceName, plan: mRes.plan });

    // Only managers can list invites (the endpoint is admin-gated).
    if (mRes.myRole === "owner" || mRes.myRole === "admin") {
      const iRes = await fetch("/api/team/invite").then((r) => r.json());
      if (iRes.invites) setInvites(iRes.invites);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

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
        load();
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
    load();
  }

  async function removeMember(userId: string) {
    await fetch("/api/team/members", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    load();
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
    </div>
  );
}
