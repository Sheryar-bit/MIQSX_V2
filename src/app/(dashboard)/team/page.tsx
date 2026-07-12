"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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

function initialsOf(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function roleStyle(role: string) {
  const r = role.toLowerCase();
  if (r === "owner") return { bg: "color-mix(in oklab, var(--terra) 14%, var(--surface))", fg: "var(--terra)" };
  if (r === "admin") return { bg: "color-mix(in oklab, var(--sig) 14%, var(--surface))", fg: "var(--sig)" };
  return { bg: "var(--surf2)", fg: "var(--muted)" };
}

const AVATAR_COLORS = ["var(--sig)", "var(--terra)", "var(--olive)", "var(--peri)", "var(--leaf)"];

const sectionLabelStyle: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 8,
  fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: ".14em",
  textTransform: "uppercase", color: "var(--muted)", marginBottom: 12,
};

const emptyTextStyle: React.CSSProperties = {
  fontFamily: "'Newsreader', serif", fontStyle: "italic", fontSize: 15, color: "var(--muted)", margin: 0,
};

const rowStyle: React.CSSProperties = {
  display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
  border: "1px solid var(--line)", background: "var(--surface)", borderRadius: 14, padding: "13px 16px",
};

export default function TeamPage() {
  const router = useRouter();
  const [members, setMembers] = useState<Member[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [activity, setActivity] = useState<ActivityEntry[]>([]);
  const [myRole, setMyRole] = useState<string>("");
  const [workspace, setWorkspace] = useState<{ name: string; plan: string } | null>(null);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("editor");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState("");
  const [locked, setLocked] = useState(false);
  const [copied, setCopied] = useState("");
  const [transferTo, setTransferTo] = useState("");

  const canManage = myRole === "owner" || myRole === "admin";
  const isOwner = myRole === "owner";

  async function load() {
    const mRes = await fetch("/api/team/members").then((r) => r.json());
    if (mRes.members) setMembers(mRes.members);
    if (mRes.myRole) setMyRole(mRes.myRole);
    if (mRes.workspaceName) setWorkspace({ name: mRes.workspaceName, plan: mRes.plan });

    // Only managers can list invites + activity (admin-gated endpoints).
    if (mRes.myRole === "owner" || mRes.myRole === "admin") {
      const [iRes, aRes] = await Promise.all([
        fetch("/api/team/invite").then((r) => r.json()),
        fetch("/api/team/activity").then((r) => r.json()),
      ]);
      if (iRes.invites) setInvites(iRes.invites);
      if (aRes.activity) setActivity(aRes.activity);
    }
    setLoading(false);
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
    if (res.ok) router.refresh(), load();
    else setNotice((await res.json()).error || "Could not transfer");
  }

  async function deleteWorkspace() {
    if (!confirm("Permanently delete this workspace and ALL its brands/reviews? This cannot be undone.")) return;
    const res = await fetch("/api/team/workspace", { method: "DELETE" });
    if (res.ok) window.location.href = "/dashboard";
    else setNotice((await res.json()).error || "Could not delete");
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
        setNotice(`Invite created for ${d.email}. Use the "Copy invite link" button below to share it.`);
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
  const transferable = members.filter((m) => m.role !== "owner");

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 260 }}>
        <div style={{ width: 40, height: 40, borderRadius: "50%", border: "3px solid var(--line)", borderTop: "3px solid var(--sig)", animation: "ds-spin 1s linear infinite" }} />
      </div>
    );
  }

  return (
    <div style={{ padding: "clamp(24px, 3.5vw, 44px) clamp(20px, 4vw, 52px) 90px" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 20, flexWrap: "wrap", marginBottom: 28, position: "relative" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ width: 40, height: 40, borderRadius: 12, background: "color-mix(in oklab, var(--sig) 14%, transparent)", color: "var(--sig)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="21" height="21" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24"><circle cx="9" cy="8" r="3" /><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M16 4.5a3 3 0 010 6M21 20c0-2.5-1.5-4.6-3.6-5.5" /></svg>
              </span>
              <h1 style={{ fontFamily: "'General Sans'", fontWeight: 600, fontSize: "clamp(27px, 3.4vw, 38px)", lineHeight: 1.05, letterSpacing: "-0.03em", margin: 0 }}>Team</h1>
            </div>
            <p style={{ fontFamily: "'Newsreader', serif", fontSize: 16, color: "var(--muted)", margin: "8px 0 0" }}>
              {workspace ? (
                <>
                  <span style={{ color: "var(--ink)" }}>{workspace.name}</span>
                  <span style={{ margin: "0 6px" }}>·</span>
                  <span style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic", color: "var(--sig)", textTransform: "capitalize" }}>{workspace.plan} plan</span>
                </>
              ) : canManage ? (
                "Invite collaborators to your workspace."
              ) : (
                "Members of this workspace."
              )}
            </p>
          </div>
          <svg aria-hidden="true" width="26" height="26" viewBox="0 0 40 40" fill="var(--terra)" style={{ position: "absolute", top: 0, right: 0, animation: "ds-twinkle 3.3s ease-in-out infinite" }}><path d="M20 0c3 13 7 17 20 20-13 3-17 7-20 20-3-13-7-17-20-20C13 17 17 13 20 0Z" /></svg>
        </div>

        {/* Invite form — owner/admin only */}
        {canManage && (
          <form onSubmit={sendInvite} className="tm-card" style={{ borderRadius: 20, border: "1px solid var(--line)", background: "var(--surface)", color: "var(--ink)", padding: "clamp(20px, 3vw, 28px)", marginBottom: 30 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 16 }}>
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M4 5h16v14H4z" /><path d="M4 6l8 7 8-7" /></svg>
              <span style={{ fontFamily: "'General Sans'", fontWeight: 700, fontSize: 16 }}>Invite a member</span>
            </div>
            <div className="tm-invite-row" style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: 10 }}>
              <input
                type="email"
                required
                placeholder="teammate@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={locked}
                className="gf-field"
              />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                disabled={locked}
                className="gf-field"
                style={{ cursor: "pointer" }}
              >
                {ROLES.map((r) => (
                  <option key={r} value={r} style={{ textTransform: "capitalize" }}>
                    {r}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                disabled={locked || sending}
                style={{ background: "var(--terra)", color: "#fff", border: "none", borderRadius: 11, padding: "12px 22px", fontFamily: "'General Sans'", fontWeight: 600, fontSize: 14.5, cursor: locked || sending ? "default" : "pointer", opacity: sending ? 0.75 : 1, whiteSpace: "nowrap" }}
              >
                {sending ? "Sending…" : "Send invite"}
              </button>
            </div>
            {notice && <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12.5, color: "var(--muted)", marginTop: 14, marginBottom: 0, wordBreak: "break-all" }}>{notice}</p>}
          </form>
        )}

        {/* Pending invites — owner/admin only, with copy-link */}
        {canManage && (
          <div style={{ marginBottom: 30 }}>
            <div style={sectionLabelStyle}>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" /></svg>
              Pending invites
            </div>
            {pending.length === 0 ? (
              <p style={emptyTextStyle}>No pending invites.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {pending.map((i) => (
                  <div key={i._id} className="tm-row" style={rowStyle}>
                    <div>
                      <div style={{ fontFamily: "'General Sans'", fontWeight: 600, fontSize: 14.5 }}>{i.email}</div>
                      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "var(--muted)", marginTop: 2, textTransform: "capitalize" }}>
                        {i.role} · expires {new Date(i.expiresAt).toLocaleDateString()}
                      </div>
                    </div>
                    {i.token && (
                      <button onClick={() => copyLink(i.token!, i._id)} className="tm-role-btn">
                        {copied === i._id ? "✓ Copied" : "Copy invite link"}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Members — visible to everyone; controls only for managers */}
        <div style={{ marginBottom: 30 }}>
          <div style={sectionLabelStyle}>
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M12 2l8 3v6c0 5-3.5 8.5-8 11-4.5-2.5-8-6-8-11V5z" /></svg>
            Members
          </div>
          {members.length === 0 ? (
            <p style={emptyTextStyle}>No team members yet.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {members.map((m, idx) => {
                const rs = roleStyle(m.role);
                return (
                  <div key={m.userId} className="tm-row" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, border: "1px solid var(--line)", background: "var(--surface)", borderRadius: 14, padding: "14px 18px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
                      <span style={{ width: 38, height: 38, borderRadius: "50%", background: AVATAR_COLORS[idx % AVATAR_COLORS.length], color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontFamily: "'General Sans'", fontWeight: 700, fontSize: 14 }}>
                        {initialsOf(m.name)}
                      </span>
                      <div>
                        <div style={{ fontFamily: "'General Sans'", fontWeight: 600, fontSize: 14.5, color: "var(--ink)" }}>{m.name}</div>
                        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11.5, color: "var(--muted)", marginTop: 2 }}>{m.email}</div>
                      </div>
                    </div>
                    {canManage && m.role !== "owner" ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <select
                          value={m.role}
                          onChange={(e) => changeRole(m.userId, e.target.value)}
                          style={{ height: 32, borderRadius: 8, border: "1px solid var(--line)", background: "var(--field)", padding: "0 8px", fontSize: 12, color: "var(--ink)", textTransform: "capitalize", cursor: "pointer" }}
                        >
                          {["admin", "editor", "viewer"].map((r) => (
                            <option key={r} value={r} style={{ textTransform: "capitalize" }}>
                              {r}
                            </option>
                          ))}
                        </select>
                        <button onClick={() => removeMember(m.userId)} style={{ background: "none", border: "none", color: "var(--red)", fontFamily: "'JetBrains Mono', monospace", fontSize: 11, cursor: "pointer", padding: 0 }}>
                          Remove
                        </button>
                      </div>
                    ) : (
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, padding: "5px 12px", borderRadius: 999, background: rs.bg, color: rs.fg, textTransform: "capitalize" }}>
                        {m.role}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Activity feed — owner/admin */}
        {canManage && activity.length > 0 && (
          <div style={{ marginBottom: 30 }}>
            <div style={sectionLabelStyle}>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></svg>
              Recent activity
            </div>
            <div style={{ borderRadius: 14, border: "1px solid var(--line)", background: "var(--surface)", overflow: "hidden" }}>
              {activity.map((a, idx) => (
                <div key={idx} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "12px 16px", borderBottom: idx < activity.length - 1 ? "1px solid var(--line)" : "none", fontFamily: "'General Sans'", fontSize: 13.5 }}>
                  <span style={{ color: "var(--muted)" }}>
                    <strong style={{ color: "var(--ink)" }}>{a.actorName}</strong> {a.detail || a.action}
                  </span>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "var(--muted)", whiteSpace: "nowrap" }}>
                    {new Date(a.createdAt).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Workspace controls */}
        {!isOwner && myRole && (
          <button onClick={leaveWorkspace} style={{ background: "none", border: "none", padding: 0, color: "var(--red)", fontFamily: "'General Sans'", fontSize: 14, cursor: "pointer", marginBottom: 24 }}>
            Leave this workspace
          </button>
        )}

        {isOwner && (
          <div style={{ borderRadius: 18, border: "1px solid color-mix(in oklab, var(--red) 35%, var(--line))", background: "color-mix(in oklab, var(--red) 8%, var(--surface))", padding: "clamp(18px, 2.5vw, 24px)", display: "flex", flexDirection: "column", gap: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9, fontFamily: "'General Sans'", fontWeight: 700, fontSize: 16, color: "var(--red)" }}>
              <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 9v4M12 17h.01M10.3 3.9L2.8 17a2 2 0 0 0 1.7 3h15a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" /></svg>
              Danger zone
            </div>

            {transferable.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10 }}>
                <select
                  value={transferTo}
                  onChange={(e) => setTransferTo(e.target.value)}
                  className="gf-field"
                  style={{ width: "auto", minWidth: 220, padding: "9px 12px", fontSize: 13.5 }}
                >
                  <option value="">Transfer ownership to…</option>
                  {transferable.map((m) => (
                    <option key={m.userId} value={m.userId}>
                      {m.name} ({m.email})
                    </option>
                  ))}
                </select>
                <button onClick={transferOwnership} disabled={!transferTo} className="tm-role-btn">
                  Transfer
                </button>
              </div>
            )}

            <div className="tm-danger" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap", paddingTop: transferable.length > 0 ? 16 : 0, borderTop: transferable.length > 0 ? "1px solid color-mix(in oklab, var(--red) 22%, var(--line))" : "none" }}>
              <p style={{ fontFamily: "'Newsreader', serif", fontSize: 14.5, color: "var(--muted)", margin: 0 }}>Permanently delete this workspace and all its data.</p>
              <button onClick={deleteWorkspace} className="tm-danger-btn" style={{ background: "var(--red)", color: "#fff", border: "none", borderRadius: 11, padding: "11px 20px", fontFamily: "'General Sans'", fontWeight: 600, fontSize: 14, whiteSpace: "nowrap" }}>
                Delete workspace
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
