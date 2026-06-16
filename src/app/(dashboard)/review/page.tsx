"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus, MessageSquare, CheckCircle2, Clock, AlertCircle,
  Share2, Trash2, ChevronDown, ChevronUp, Send, Copy
} from "lucide-react";

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

const statusConfig: Record<Status, { label: string; icon: React.ElementType; color: string; bg: string; border: string }> = {
  draft: { label: "Draft", icon: Clock, color: "text-text-dim", bg: "bg-surface", border: "border-border" },
  in_review: { label: "In Review", icon: Clock, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/30" },
  approved: { label: "Approved", icon: CheckCircle2, color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/30" },
  needs_changes: { label: "Needs Changes", icon: AlertCircle, color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/30" },
};

function StatusBadge({ status }: { status: Status }) {
  const cfg = statusConfig[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${cfg.bg} ${cfg.border} ${cfg.color}`}>
      <cfg.icon className="h-3 w-3" />
      {cfg.label}
    </span>
  );
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-surface border border-border p-6 space-y-4">
        <h2 className="text-lg font-bold text-text">New Review Item</h2>

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title (e.g. 'Final Logo v3')"
          className="w-full rounded-xl bg-surface-2 border border-border px-4 py-2.5 text-sm text-text placeholder:text-text-dim focus:outline-none focus:border-primary/50"
        />

        <select
          value={assetType}
          onChange={(e) => setAssetType(e.target.value as AssetType)}
          className="w-full rounded-xl bg-surface-2 border border-border px-4 py-2.5 text-sm text-text focus:outline-none"
        >
          {(["logo", "caption", "image", "tagline", "design"] as AssetType[]).map((t) => (
            <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
          ))}
        </select>

        <textarea
          value={assetContent}
          onChange={(e) => setAssetContent(e.target.value)}
          placeholder="Paste the asset content — tagline text, SVG code, image URL, caption copy..."
          rows={5}
          className="w-full rounded-xl bg-surface-2 border border-border px-4 py-3 text-sm text-text placeholder:text-text-dim resize-none focus:outline-none focus:border-primary/50"
        />

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brief description or context (optional)"
          rows={2}
          className="w-full rounded-xl bg-surface-2 border border-border px-4 py-3 text-sm text-text placeholder:text-text-dim resize-none focus:outline-none"
        />

        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded-xl bg-surface-2 border border-border text-sm text-text-muted hover:text-text">
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={submitting || !title || !assetContent}
            className="px-4 py-2 rounded-xl bg-gradient-brand text-white text-sm font-semibold disabled:opacity-40"
          >
            {submitting ? "Creating..." : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ReviewCard({ review, onRefresh }: { review: Review; onRefresh: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const [comment, setComment] = useState("");
  const [posting, setPosting] = useState(false);
  const [generatingToken, setGeneratingToken] = useState(false);
  const [copied, setCopied] = useState(false);

  const cfg = statusConfig[review.status];

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
      navigator.clipboard.writeText(approvalLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this review item?")) return;
    await fetch(`/api/review/${review._id}`, { method: "DELETE" });
    onRefresh();
  };

  const previewContent = review.assetContent.length > 120
    ? review.assetContent.slice(0, 120) + "..."
    : review.assetContent;

  return (
    <div className={`rounded-2xl bg-surface-2 border ${cfg.border} overflow-hidden transition-all`}>
      {/* Header */}
      <div className="p-4 flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-text">{review.title}</h3>
            <StatusBadge status={review.status} />
            <span className="text-xs text-text-dim px-2 py-0.5 rounded-full bg-surface border border-border">
              {review.assetType}
            </span>
          </div>
          <p className="text-xs text-text-dim mt-1 font-mono truncate">{previewContent}</p>
          {review.clientDecidedAt && review.clientName && (
            <p className="text-xs text-text-dim mt-1">
              Client decision by {review.clientName} · {new Date(review.clientDecidedAt).toLocaleDateString()}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={() => setExpanded(!expanded)}
            className="h-8 w-8 rounded-lg bg-surface border border-border flex items-center justify-center hover:bg-surface-2 text-text-dim"
          >
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          <button onClick={handleDelete} className="h-8 w-8 rounded-lg bg-surface border border-border flex items-center justify-center hover:bg-red-500/10 text-text-dim hover:text-red-400">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Expanded panel */}
      {expanded && (
        <div className="border-t border-border p-4 space-y-4">
          {/* Full asset content */}
          <div>
            <p className="text-xs font-semibold text-text-dim mb-2">Asset Content</p>
            <div className="rounded-xl bg-surface border border-border p-3 max-h-40 overflow-y-auto">
              <pre className="text-xs text-text-muted whitespace-pre-wrap break-all">{review.assetContent}</pre>
            </div>
          </div>

          {/* Status controls */}
          <div>
            <p className="text-xs font-semibold text-text-dim mb-2">Status</p>
            <div className="flex gap-2 flex-wrap">
              {(["draft", "in_review", "approved", "needs_changes"] as Status[]).map((s) => (
                <button
                  key={s}
                  onClick={() => handleStatusChange(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    review.status === s
                      ? `${statusConfig[s].bg} ${statusConfig[s].border} ${statusConfig[s].color}`
                      : "bg-surface border-border text-text-dim hover:text-text"
                  }`}
                >
                  {statusConfig[s].label}
                </button>
              ))}
            </div>
          </div>

          {/* WhatsApp approval */}
          <div>
            <p className="text-xs font-semibold text-text-dim mb-2">Client Approval Link</p>
            {approvalLink ? (
              <div className="flex items-center gap-2">
                <input
                  readOnly
                  value={approvalLink}
                  className="flex-1 rounded-xl bg-surface border border-border px-3 py-2 text-xs text-text-muted font-mono truncate"
                />
                <button onClick={handleCopy}
                  className="h-9 w-9 rounded-xl bg-surface border border-border flex items-center justify-center hover:bg-surface-2">
                  <Copy className={`h-4 w-4 ${copied ? "text-green-400" : "text-text-dim"}`} />
                </button>
              </div>
            ) : (
              <button
                onClick={handleGenerateToken}
                disabled={generatingToken}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface border border-border text-sm text-text-muted hover:text-text hover:border-primary/40 transition-all disabled:opacity-40"
              >
                <Share2 className="h-4 w-4" />
                {generatingToken ? "Generating..." : "Generate approval link"}
              </button>
            )}
            {review.tokenExpiry && (
              <p className="text-xs text-text-dim mt-1">
                Expires: {new Date(review.tokenExpiry).toLocaleDateString()}
              </p>
            )}
          </div>

          {/* Comments */}
          <div>
            <p className="text-xs font-semibold text-text-dim mb-2">
              Comments ({review.comments?.length || 0})
            </p>
            <div className="space-y-2 mb-3 max-h-48 overflow-y-auto">
              {review.comments?.map((c, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-surface border border-border">
                  <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 text-xs font-bold text-primary-light">
                    {c.author.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-text">{c.author}</span>
                      <span className="text-[10px] text-text-dim">{c.role}</span>
                      <span className="text-[10px] text-text-dim ml-auto">{new Date(c.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-xs text-text-muted mt-0.5">{c.content}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleComment()}
                placeholder="Add a comment..."
                className="flex-1 rounded-xl bg-surface border border-border px-3 py-2 text-sm text-text placeholder:text-text-dim focus:outline-none focus:border-primary/50"
              />
              <button
                onClick={handleComment}
                disabled={posting || !comment.trim()}
                className="h-9 px-3 rounded-xl bg-primary/20 border border-primary/30 text-primary-light hover:bg-primary/30 disabled:opacity-40 transition-all"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Client feedback */}
          {review.clientComment && (
            <div className="rounded-xl bg-surface border border-border p-3">
              <p className="text-xs font-semibold text-text-dim mb-1">Client Feedback</p>
              <p className="text-sm text-text-muted">{review.clientComment}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ReviewBoardPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [filter, setFilter] = useState<Status | "all">("all");

  const fetchReviews = useCallback(async () => {
    const res = await fetch("/api/review");
    const data = await res.json();
    setReviews(data.reviews || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchReviews();
    const interval = setInterval(fetchReviews, 10000); // poll every 10s
    return () => clearInterval(interval);
  }, [fetchReviews]);

  const filtered = filter === "all" ? reviews : reviews.filter((r) => r.status === filter);

  const counts = {
    all: reviews.length,
    draft: reviews.filter((r) => r.status === "draft").length,
    in_review: reviews.filter((r) => r.status === "in_review").length,
    approved: reviews.filter((r) => r.status === "approved").length,
    needs_changes: reviews.filter((r) => r.status === "needs_changes").length,
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Review Board</h1>
          <p className="text-sm text-text-muted mt-1">Draft → In Review → Approved workflow</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-brand text-white text-sm font-semibold hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          New Item
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap mb-6">
        {(["all", "draft", "in_review", "approved", "needs_changes"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              filter === s
                ? "bg-primary/15 border-primary/30 text-primary-light"
                : "bg-surface-2 border-border text-text-muted hover:text-text"
            }`}
          >
            {s === "all" ? "All" : statusConfig[s].label}
            <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-surface text-text-dim text-[10px]">
              {counts[s]}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-surface-2/30 p-12 text-center">
          <MessageSquare className="h-12 w-12 text-text-dim mx-auto mb-3 opacity-30" />
          <p className="text-text-dim text-sm">
            {filter === "all" ? "No review items yet. Create your first item above." : `No ${filter} items.`}
          </p>
          {filter === "all" && (
            <p className="text-xs text-text-dim mt-2">
              MongoDB must be connected to persist review items.
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((review) => (
            <ReviewCard key={review._id} review={review} onRefresh={fetchReviews} />
          ))}
        </div>
      )}

      {showCreate && (
        <CreateModal onClose={() => setShowCreate(false)} onCreated={fetchReviews} />
      )}
    </div>
  );
}
