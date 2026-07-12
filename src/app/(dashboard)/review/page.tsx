"use client";

import { useState, useEffect, useCallback } from "react";

type Status = "draft" | "in_review" | "approved" | "needs_changes";
type AssetType = "logo" | "caption" | "image" | "tagline" | "design";

interface Comment {
  author: string;
  role: string;
  content: string;
  createdAt: string;
}

interface Review {
  _id: string;
  title: string;
  description?: string;
  assetType: AssetType;
  assetContent: string;
  status: Status;
  publicToken?: string;
  tokenExpiry?: string;
  clientName?: string;
  clientComment?: string;
  clientDecidedAt?: string;
  comments: Comment[];
  createdAt: string;
  updatedAt: string;
}

const COLUMNS: { id: Status; label: string; dot: string }[] = [
  { id: "draft",          label: "Draft",         dot: "var(--muted)" },
  { id: "in_review",      label: "In Review",     dot: "#C58A1E" },
  { id: "approved",       label: "Approved",      dot: "var(--leaf)" },
  { id: "needs_changes",  label: "Needs Changes", dot: "var(--red)" },
];

const THUMB: Record<AssetType, { bg: string; fg: string }> = {
  logo:     { bg: "linear-gradient(150deg, var(--sig), var(--leaf))",    fg: "#fff" },
  caption:  { bg: "var(--surf2)",                                         fg: "var(--ink)" },
  image:    { bg: "linear-gradient(150deg, var(--terra), #D4A043)",      fg: "#fff" },
  tagline:  { bg: "linear-gradient(150deg, var(--olive), var(--sig))",   fg: "#fff" },
  design:   { bg: "linear-gradient(150deg, var(--terra), var(--olive))", fg: "#fff" },
};

const TYPE_LABELS: Record<AssetType, string> = {
  logo: "Logo", caption: "Caption", image: "Image", tagline: "Tagline", design: "Design",
};

function timeSince(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return "just now";
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function CreateModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assetType, setAssetType] = useState<AssetType>("design");
  const [assetContent, setAssetContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleCreate = async () => {
    if (!title || !assetContent) return;
    setSubmitting(true);
    await fetch("/api/review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, assetType, assetContent }),
    });
    setSubmitting(false);
    onCreated();
    onClose();
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, background: "rgba(0,0,0,.5)", backdropFilter: "blur(6px)" }}>
      <div style={{ width: "100%", maxWidth: 520, borderRadius: 22, background: "var(--surface)", border: "1px solid var(--line)", padding: "clamp(20px, 3vw, 28px)", display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h2 style={{ fontFamily: "'General Sans'", fontWeight: 700, fontSize: 18, margin: 0, color: "var(--ink)" }}>New Review Item</h2>
          <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: "50%", background: "var(--surf2)", border: "1px solid var(--line)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title (e.g. 'Final Logo v3')"
          className="gf-field"
        />

        <select
          value={assetType}
          onChange={(e) => setAssetType(e.target.value as AssetType)}
          style={{ width: "100%", fontFamily: "'General Sans', sans-serif", fontSize: 15, color: "var(--ink)", background: "var(--field)", border: "1px solid var(--line)", borderRadius: 12, padding: "12px 14px", outline: "none", appearance: "none" as const }}
        >
          {(["logo", "caption", "image", "tagline", "design"] as AssetType[]).map((t) => (
            <option key={t} value={t}>{TYPE_LABELS[t]}</option>
          ))}
        </select>

        <textarea
          value={assetContent}
          onChange={(e) => setAssetContent(e.target.value)}
          placeholder="Paste the asset content — tagline text, SVG code, image URL, caption copy..."
          className="gf-field"
          style={{ minHeight: 100, resize: "vertical", fontFamily: "'General Sans', sans-serif" }}
        />

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brief description or context (optional)"
          className="gf-field"
          style={{ minHeight: 60, resize: "vertical", fontFamily: "'General Sans', sans-serif" }}
        />

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ padding: "9px 18px", borderRadius: 12, background: "var(--surf2)", border: "1px solid var(--line)", fontFamily: "'General Sans'", fontSize: 14, color: "var(--muted)", cursor: "pointer" }}>
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={submitting || !title || !assetContent}
            style={{ padding: "9px 18px", borderRadius: 12, background: "var(--sig)", color: "var(--onSig)", border: "none", fontFamily: "'General Sans'", fontWeight: 600, fontSize: 14, cursor: submitting || !title || !assetContent ? "not-allowed" : "pointer", opacity: submitting || !title || !assetContent ? 0.5 : 1 }}
          >
            {submitting ? "Creating…" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ReviewCard({
  review,
  onRefresh,
  onDragStart,
  onDragEnd,
  animationDelay,
}: {
  review: Review;
  onRefresh: () => void;
  onDragStart: () => void;
  onDragEnd: () => void;
  animationDelay?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const [comment, setComment] = useState("");
  const [posting, setPosting] = useState(false);
  const [generatingToken, setGeneratingToken] = useState(false);
  const [copied, setCopied] = useState(false);

  const thumb = THUMB[review.assetType] ?? THUMB.design;

  const handleStatusChange = async (status: Status) => {
    await fetch(`/api/review/${review._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    onRefresh();
  };

  const handleComment = async () => {
    if (!comment.trim()) return;
    setPosting(true);
    await fetch(`/api/review/${review._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ comment }),
    });
    setComment("");
    setPosting(false);
    onRefresh();
  };

  const handleGenerateToken = async () => {
    setGeneratingToken(true);
    await fetch(`/api/review?action=generate-token&id=${review._id}`, { method: "PATCH" });
    setGeneratingToken(false);
    onRefresh();
  };

  const approvalLink = review.publicToken
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/review/public/${review.publicToken}`
    : null;

  const handleCopy = () => {
    if (approvalLink) {
      navigator.clipboard.writeText(approvalLink).catch(() => {});
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this review item?")) return;
    await fetch(`/api/review/${review._id}`, { method: "DELETE" });
    onRefresh();
  };

  const sendWhatsApp = () => {
    if (!approvalLink) return;
    const msg = encodeURIComponent(`Please review and approve: "${review.title}"\n${approvalLink}`);
    window.open(`https://wa.me/?text=${msg}`, "_blank");
  };

  return (
    <div
      className="rv-card"
      draggable
      onDragStart={(e) => { e.stopPropagation(); onDragStart(); }}
      onDragEnd={onDragEnd}
      style={{ borderRadius: 13, border: "1px solid var(--line)", background: "var(--surface)", overflow: "hidden", animationDelay }}
    >
      {/* Thumbnail */}
      <div style={{ height: 80, background: thumb.bg, position: "relative", display: "flex", alignItems: "flex-end", padding: "8px 10px" }}>
        <span style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic", fontSize: 14, color: thumb.fg, opacity: 0.85, lineHeight: 1.2, wordBreak: "break-word" as const, maxWidth: "80%" }}>
          {review.title.length > 18 ? review.title.slice(0, 18) + "…" : review.title}
        </span>
        <span style={{ position: "absolute", top: 7, right: 7, fontFamily: "'JetBrains Mono', monospace", fontSize: 9, fontWeight: 700, padding: "3px 7px", borderRadius: 999, background: "rgba(0,0,0,.28)", color: "#fff", letterSpacing: ".05em" }}>
          {TYPE_LABELS[review.assetType]}
        </span>
      </div>

      {/* Info row */}
      <div style={{ padding: "10px 12px" }}>
        <div
          onClick={() => setExpanded(!expanded)}
          style={{ cursor: "pointer" }}
        >
          <div style={{ fontFamily: "'General Sans'", fontWeight: 600, fontSize: 13, color: "var(--ink)", marginBottom: 3 }}>{review.title}</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "var(--muted)" }}>
            {TYPE_LABELS[review.assetType]} · {timeSince(review.createdAt)}
            {review.comments?.length > 0 && ` · ${review.comments.length} comment${review.comments.length !== 1 ? "s" : ""}`}
          </div>
        </div>

        {/* WhatsApp button for approved */}
        {review.status === "approved" && (
          <div style={{ marginTop: 9, display: "flex", gap: 6 }}>
            {approvalLink ? (
              <>
                <button
                  onClick={sendWhatsApp}
                  style={{ flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "7px 10px", borderRadius: 9, border: "none", background: "#25D366", color: "#fff", fontFamily: "'General Sans'", fontWeight: 600, fontSize: 11, cursor: "pointer" }}
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="#fff"><path d="M.06 24l1.68-6.16A11.87 11.87 0 0 1 .13 11.9C.12 5.33 5.46 0 12.03 0a11.82 11.82 0 0 1 8.42 3.49 11.82 11.82 0 0 1 3.48 8.42c0 6.57-5.34 11.9-11.91 11.9a11.9 11.9 0 0 1-5.7-1.45L.06 24z"/></svg>
                  Send to client
                </button>
                <button onClick={handleCopy} style={{ width: 30, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 9, border: "1px solid var(--line)", background: "var(--surf2)", cursor: "pointer" }}>
                  <svg width="12" height="12" fill="none" stroke={copied ? "var(--sig)" : "var(--muted)"} strokeWidth="1.8" viewBox="0 0 24 24"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 012-2h10"/></svg>
                </button>
              </>
            ) : (
              <button
                onClick={handleGenerateToken}
                disabled={generatingToken}
                style={{ width: "100%", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "7px", borderRadius: 9, border: "1px solid var(--line)", background: "var(--surf2)", color: "var(--muted)", fontFamily: "'General Sans'", fontWeight: 600, fontSize: 11, cursor: "pointer" }}
              >
                {generatingToken ? "Generating…" : "Generate approval link"}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Expanded panel */}
      {expanded && (
        <div style={{ borderTop: "1px solid var(--line)", padding: "12px", display: "flex", flexDirection: "column", gap: 11 }}>
          {/* Asset content preview */}
          <div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase" as const, color: "var(--muted)", marginBottom: 5 }}>Content</div>
            <div style={{ borderRadius: 10, background: "var(--surf2)", border: "1px solid var(--line)", padding: "9px 11px", maxHeight: 90, overflowY: "auto" }}>
              <pre style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10.5, color: "var(--muted)", margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-all" as const }}>
                {review.assetContent.length > 180 ? review.assetContent.slice(0, 180) + "…" : review.assetContent}
              </pre>
            </div>
          </div>

          {/* Status chips */}
          <div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase" as const, color: "var(--muted)", marginBottom: 6 }}>Move to</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {COLUMNS.map((col) => (
                <button
                  key={col.id}
                  onClick={() => handleStatusChange(col.id)}
                  style={{
                    fontFamily: "'General Sans'", fontSize: 11, fontWeight: review.status === col.id ? 700 : 500,
                    padding: "4px 9px", borderRadius: 8, cursor: "pointer",
                    border: `1px solid ${review.status === col.id ? col.dot : "var(--line)"}`,
                    background: review.status === col.id ? `color-mix(in oklab, ${col.dot} 12%, var(--surface))` : "var(--surface)",
                    color: review.status === col.id ? col.dot : "var(--muted)",
                  }}
                >
                  {col.label}
                </button>
              ))}
            </div>
          </div>

          {/* Approval link */}
          <div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase" as const, color: "var(--muted)", marginBottom: 6 }}>Client approval</div>
            {approvalLink ? (
              <div style={{ display: "flex", gap: 5 }}>
                <input readOnly value={approvalLink} style={{ flex: 1, fontFamily: "'JetBrains Mono', monospace", fontSize: 10, background: "var(--surf2)", border: "1px solid var(--line)", borderRadius: 9, padding: "6px 9px", color: "var(--muted)", outline: "none", minWidth: 0 }} />
                <button onClick={handleCopy} style={{ width: 30, height: 30, borderRadius: 9, border: "1px solid var(--line)", background: "var(--surf2)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg width="12" height="12" fill="none" stroke={copied ? "var(--sig)" : "var(--muted)"} strokeWidth="1.8" viewBox="0 0 24 24"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 012-2h10"/></svg>
                </button>
              </div>
            ) : (
              <button onClick={handleGenerateToken} disabled={generatingToken} style={{ fontFamily: "'General Sans'", fontSize: 12, color: "var(--muted)", background: "var(--surf2)", border: "1px solid var(--line)", borderRadius: 9, padding: "6px 12px", cursor: "pointer", opacity: generatingToken ? 0.5 : 1 }}>
                {generatingToken ? "Generating…" : "Generate link"}
              </button>
            )}
            {review.tokenExpiry && (
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9.5, color: "var(--muted)", marginTop: 4 }}>Expires: {new Date(review.tokenExpiry).toLocaleDateString()}</div>
            )}
          </div>

          {/* Comments */}
          <div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase" as const, color: "var(--muted)", marginBottom: 6 }}>Comments ({review.comments?.length || 0})</div>
            {review.comments?.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: 7, maxHeight: 130, overflowY: "auto" }}>
                {review.comments.map((c, i) => (
                  <div key={i} style={{ display: "flex", gap: 7, background: "var(--surf2)", borderRadius: 10, padding: "7px 9px", border: "1px solid var(--line)" }}>
                    <div style={{ width: 24, height: 24, borderRadius: "50%", background: "color-mix(in oklab, var(--sig) 20%, var(--surface))", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontFamily: "'General Sans'", fontWeight: 700, fontSize: 10, color: "var(--sig)" }}>
                      {c.author.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 1 }}>
                        <span style={{ fontFamily: "'General Sans'", fontSize: 11, fontWeight: 600, color: "var(--ink)" }}>{c.author}</span>
                        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "var(--muted)" }}>{c.role}</span>
                      </div>
                      <p style={{ fontFamily: "'Newsreader', serif", fontSize: 12, color: "var(--muted)", margin: 0, lineHeight: 1.45 }}>{c.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div style={{ display: "flex", gap: 5 }}>
              <input
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleComment()}
                placeholder="Add a comment…"
                style={{ flex: 1, fontFamily: "'General Sans'", fontSize: 12, background: "var(--surf2)", border: "1px solid var(--line)", borderRadius: 9, padding: "6px 10px", color: "var(--ink)", outline: "none" }}
              />
              <button onClick={handleComment} disabled={posting || !comment.trim()} style={{ width: 30, height: 30, borderRadius: 9, border: "none", background: "var(--sig)", color: "var(--onSig)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, opacity: posting || !comment.trim() ? 0.4 : 1 }}>
                <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 2L11 13M22 2L15 22 11 13 2 9l20-7z"/></svg>
              </button>
            </div>
          </div>

          {/* Client feedback */}
          {review.clientComment && (
            <div style={{ borderRadius: 10, background: "var(--surf2)", border: "1px solid var(--line)", padding: "9px 11px" }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9.5, letterSpacing: ".1em", textTransform: "uppercase" as const, color: "var(--muted)", marginBottom: 4 }}>Client feedback</div>
              <p style={{ fontFamily: "'Newsreader', serif", fontSize: 13, color: "var(--ink)", margin: 0 }}>{review.clientComment}</p>
              {review.clientName && review.clientDecidedAt && (
                <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9.5, color: "var(--muted)", marginTop: 5 }}>{review.clientName} · {new Date(review.clientDecidedAt).toLocaleDateString()}</p>
              )}
            </div>
          )}

          {/* Delete */}
          <button
            onClick={handleDelete}
            style={{ alignSelf: "flex-start", fontFamily: "'General Sans'", fontSize: 11, color: "var(--red)", background: "color-mix(in oklab, var(--red) 8%, var(--surface))", border: "1px solid color-mix(in oklab, var(--red) 20%, var(--line))", borderRadius: 8, padding: "5px 10px", cursor: "pointer" }}
          >
            Delete item
          </button>
        </div>
      )}
    </div>
  );
}

export default function ReviewBoardPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    const res = await fetch("/api/review");
    const data = await res.json();
    setReviews(data.reviews || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchReviews();
    const interval = setInterval(fetchReviews, 10000);
    return () => clearInterval(interval);
  }, [fetchReviews]);

  const handleDrop = async (targetStatus: Status) => {
    if (!dragId) return;
    const review = reviews.find((r) => r._id === dragId);
    if (review && review.status !== targetStatus) {
      await fetch(`/api/review/${dragId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: targetStatus }),
      });
      fetchReviews();
    }
    setDragId(null);
    setOverId(null);
  };

  return (
    <div style={{ padding: "clamp(24px, 3.5vw, 44px) clamp(20px, 4vw, 52px) 90px" }}>
      <div style={{ maxWidth: 1140, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 20, flexWrap: "wrap", marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ width: 46, height: 46, borderRadius: 13, background: "color-mix(in oklab, var(--sig) 14%, transparent)", color: "var(--sig)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24"><rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4h6v3H9zM8 11h8M8 15h5"/></svg>
            </span>
            <div>
              <h1 style={{ fontFamily: "'General Sans'", fontWeight: 600, fontSize: "clamp(26px, 3vw, 36px)", lineHeight: 1.05, letterSpacing: "-0.03em", margin: 0 }}>
                Review <span style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic", fontWeight: 400, color: "var(--sig)" }}>Board</span>
              </h1>
              <p style={{ fontFamily: "'Newsreader', serif", fontSize: 16, color: "var(--muted)", margin: "5px 0 0" }}>
                Drag cards across columns. Send approval links to clients.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 20px", borderRadius: 999, border: "none", background: "var(--sig)", color: "var(--onSig)", fontFamily: "'General Sans'", fontWeight: 600, fontSize: 14, cursor: "pointer" }}
          >
            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>
            New Item
          </button>
        </div>

        {/* Kanban board */}
        {loading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 0" }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", border: "3px solid var(--line)", borderTop: "3px solid var(--sig)", animation: "ds-spin 1s linear infinite" }} />
          </div>
        ) : (
          <div className="rv-board" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, alignItems: "start" }}>
            {COLUMNS.map((col) => {
              const colReviews = reviews.filter((r) => r.status === col.id);
              const isOver = overId === col.id;
              return (
                <div
                  key={col.id}
                  style={{
                    borderRadius: 18,
                    border: `1px solid ${isOver ? "color-mix(in oklab, var(--sig) 35%, var(--line))" : "var(--line)"}`,
                    background: isOver ? "color-mix(in oklab, var(--sig) 7%, var(--surf2))" : "var(--surf2)",
                    padding: 13,
                    minHeight: 220,
                    transition: "background .2s, border-color .2s",
                  }}
                  onDragOver={(e) => { e.preventDefault(); setOverId(col.id); }}
                  onDragLeave={(e) => {
                    if (!(e.currentTarget as Element).contains(e.relatedTarget as Node)) {
                      setOverId(null);
                    }
                  }}
                  onDrop={() => handleDrop(col.id)}
                >
                  {/* Column header */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 13, padding: "0 3px" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 7, fontFamily: "'General Sans'", fontWeight: 700, fontSize: 13.5, color: "var(--ink)" }}>
                      <span style={{ width: 9, height: 9, borderRadius: "50%", background: col.dot, flexShrink: 0 }} />
                      {col.label}
                    </span>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "var(--muted)", background: "var(--surface)", border: "1px solid var(--line)", padding: "2px 8px", borderRadius: 999 }}>
                      {colReviews.length}
                    </span>
                  </div>

                  {/* Cards */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {colReviews.map((review, i) => (
                      <ReviewCard
                        key={review._id}
                        review={review}
                        onRefresh={fetchReviews}
                        onDragStart={() => setDragId(review._id)}
                        onDragEnd={() => { setDragId(null); setOverId(null); }}
                        animationDelay={`${i * 0.06}s`}
                      />
                    ))}

                    {/* Empty dropzone hint */}
                    {colReviews.length === 0 && (
                      <div style={{ height: 56, display: "flex", alignItems: "center", justifyContent: "center", border: "1.5px dashed var(--line)", borderRadius: 11 }}>
                        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "var(--muted)", letterSpacing: ".08em" }}>drop here</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty state when no reviews at all */}
        {!loading && reviews.length === 0 && (
          <div style={{ marginTop: 16, borderRadius: 20, border: "1.5px dashed var(--line)", background: "var(--surface)", padding: "clamp(32px,4vw,56px)", textAlign: "center" }}>
            <span style={{ display: "inline-flex", width: 64, height: 64, borderRadius: 16, background: "color-mix(in oklab, var(--sig) 10%, transparent)", color: "var(--sig)", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
              <svg width="30" height="30" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4h6v3H9zM8 11h8M8 15h5"/></svg>
            </span>
            <div style={{ fontFamily: "'General Sans'", fontWeight: 600, fontSize: 18, color: "var(--ink)", marginBottom: 8 }}>No review items yet</div>
            <p style={{ fontFamily: "'Newsreader', serif", fontSize: 15, color: "var(--muted)", margin: "0 0 18px" }}>Create your first item to start the review workflow.</p>
            <button onClick={() => setShowCreate(true)} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 20px", borderRadius: 999, border: "none", background: "var(--sig)", color: "var(--onSig)", fontFamily: "'General Sans'", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>
              Create first item
            </button>
          </div>
        )}
      </div>

      {/* Create modal */}
      {showCreate && <CreateModal onClose={() => setShowCreate(false)} onCreated={fetchReviews} />}
    </div>
  );
}
