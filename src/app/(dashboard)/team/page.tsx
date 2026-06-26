"use client";

import { useEffect, useState } from "react";
import { Users, Mail, Clock, Shield } from "lucide-react";
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
}

const ROLES = ["editor", "viewer", "admin"];

export default function TeamPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("editor");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState("");
  const [locked, setLocked] = useState(false); // plan doesn't allow teams

  async function load() {
    const [mRes, iRes] = await Promise.all([
      fetch("/api/team/members").then((r) => r.json()),
      fetch("/api/team/invite").then((r) => r.json()),
    ]);
    if (mRes.members) setMembers(mRes.members);
    if (iRes.invites) setInvites(iRes.invites);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

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
        setNotice(`Invite sent to ${d.email}.${d.devToken ? ` Dev accept link: /team/accept/${d.devToken}` : ""}`);
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

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-text flex items-center gap-2">
          <Users className="w-6 h-6 text-primary-light" />
          Team
        </h1>
        <p className="text-text-muted mt-1">Invite collaborators to your workspace (Agency plan).</p>
      </div>

      {/* Invite form */}
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
        {notice && <p className="text-sm text-text-muted">{notice}</p>}
      </form>

      {/* Pending invites */}
      <div>
        <h2 className="text-text font-semibold mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4 text-text-muted" /> Pending invites
        </h2>
        {loading ? (
          <p className="text-text-dim text-sm">Loading…</p>
        ) : invites.filter((i) => i.status === "pending").length === 0 ? (
          <p className="text-text-dim text-sm">No pending invites.</p>
        ) : (
          <div className="space-y-2">
            {invites
              .filter((i) => i.status === "pending")
              .map((i) => (
                <div
                  key={i._id}
                  className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3"
                >
                  <div>
                    <p className="text-text text-sm">{i.email}</p>
                    <p className="text-text-dim text-xs capitalize">{i.role}</p>
                  </div>
                  <span className="text-xs text-text-dim">
                    expires {new Date(i.expiresAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Members */}
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
                {m.role === "owner" ? (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary-light border border-primary/20 capitalize">
                    owner
                  </span>
                ) : (
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
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
