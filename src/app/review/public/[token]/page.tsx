"use client";

import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Loader2, AlertCircle, Zap } from "lucide-react";

interface ReviewData {
  _id: string;
  title: string;
  description?: string;
  assetType: string;
  assetContent: string;
  status: string;
  clientName?: string;
  clientDecidedAt?: string;
}

export default function PublicApprovalPage({ params }: { params: Promise<{ token: string }> }) {
  const [token, setToken] = useState<string | null>(null);
  const [review, setReview] = useState<ReviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clientName, setClientName] = useState("");
  const [clientComment, setClientComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [decided, setDecided] = useState<"approved" | "needs_changes" | null>(null);

  useEffect(() => {
    params.then(({ token: t }) => setToken(t));
  }, [params]);

  useEffect(() => {
    if (!token) return;
    fetch(`/api/review/public/${token}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setReview(data.review);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load approval request");
        setLoading(false);
      });
  }, [token]);

  const handleDecision = async (decision: "approved" | "needs_changes") => {
    if (!token) return;
    setSubmitting(true);
    const res = await fetch(`/api/review/public/${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ decision, clientName: clientName || "Client", clientComment }),
    });
    if (res.ok) {
      setDecided(decision);
    }
    setSubmitting(false);
  };

  const alreadyDecided = review?.status === "approved" || review?.status === "needs_changes";

  if (loading) {
    return (
      <div className="min-h-screen bg-[#08090F] flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-[#7C3AED] animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#08090F] flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-white mb-2">Link Invalid or Expired</h1>
          <p className="text-gray-400 text-sm">{error}</p>
          <p className="text-gray-500 text-xs mt-4">Ask the sender for a new approval link.</p>
        </div>
      </div>
    );
  }

  if (decided) {
    return (
      <div className="min-h-screen bg-[#08090F] flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          {decided === "approved" ? (
            <>
              <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-white mb-2">Approved!</h1>
              <p className="text-gray-400">Your approval has been recorded. The team has been notified.</p>
            </>
          ) : (
            <>
              <XCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-white mb-2">Changes Requested</h1>
              <p className="text-gray-400">Your feedback has been sent to the team.</p>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#08090F] text-white">
      {/* Header */}
      <header className="border-b border-[#1E2435] px-6 py-4 flex items-center gap-2.5">
        <div className="h-8 w-8 rounded-lg bg-[#7C3AED] flex items-center justify-center">
          <Zap className="h-4 w-4 text-white" />
        </div>
        <span className="font-bold text-white">MIQSX</span>
        <span className="text-gray-500 text-sm">· Approval Request</span>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-10">
        {/* Title */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#7C3AED]/20 border border-[#7C3AED]/30 text-[#A78BFA] text-xs font-medium mb-3">
            Review Request
          </div>
          <h1 className="text-2xl font-bold text-white">{review?.title}</h1>
          {review?.description && (
            <p className="text-gray-400 text-sm mt-1">{review.description}</p>
          )}
          <p className="text-gray-500 text-xs mt-2">
            Type: {review?.assetType?.charAt(0).toUpperCase()}{review?.assetType?.slice(1)}
          </p>
        </div>

        {/* Asset preview */}
        <div className="rounded-2xl bg-[#0F1117] border border-[#1E2435] p-5 mb-6">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">Asset Content</p>
          {review?.assetContent.trim().startsWith("<svg") ? (
            <div className="flex items-center justify-center py-8">
              <div
                className="max-w-full max-h-48"
                dangerouslySetInnerHTML={{ __html: review.assetContent }}
              />
            </div>
          ) : review?.assetContent.startsWith("http") ? (
            <img
              src={review.assetContent}
              alt="Asset"
              className="max-w-full max-h-64 rounded-xl object-contain mx-auto"
            />
          ) : (
            <div className="bg-[#171B26] rounded-xl p-4">
              <p className="text-white text-lg leading-relaxed whitespace-pre-wrap">{review?.assetContent}</p>
            </div>
          )}
        </div>

        {alreadyDecided ? (
          <div className="rounded-2xl bg-[#171B26] border border-[#1E2435] p-5 text-center">
            <p className="text-gray-400 text-sm">
              This item has already been {review?.status === "approved" ? "approved" : "sent back for changes"}
              {review?.clientName ? ` by ${review.clientName}` : ""}.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Client name */}
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2 block">
                Your Name (optional)
              </label>
              <input
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Your name"
                className="w-full rounded-xl bg-[#0F1117] border border-[#1E2435] px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#7C3AED]/50"
              />
            </div>

            {/* Comment */}
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2 block">
                Comment (optional)
              </label>
              <textarea
                value={clientComment}
                onChange={(e) => setClientComment(e.target.value)}
                placeholder="Add your feedback, requested changes, or anything else..."
                rows={3}
                className="w-full rounded-xl bg-[#0F1117] border border-[#1E2435] px-4 py-3 text-sm text-white placeholder:text-gray-600 resize-none focus:outline-none focus:border-[#7C3AED]/50"
              />
            </div>

            {/* Decision buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => handleDecision("needs_changes")}
                disabled={submitting}
                className="flex items-center justify-center gap-2 py-3.5 rounded-xl border border-red-500/40 bg-red-500/10 text-red-300 font-semibold hover:bg-red-500/20 transition-all disabled:opacity-40 text-sm"
              >
                <XCircle className="h-5 w-5" />
                Request Changes
              </button>
              <button
                onClick={() => handleDecision("approved")}
                disabled={submitting}
                className="flex items-center justify-center gap-2 py-3.5 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-500 transition-all disabled:opacity-40 text-sm"
              >
                {submitting ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <CheckCircle className="h-5 w-5" />
                )}
                Approve
              </button>
            </div>

            <p className="text-center text-xs text-gray-600 pt-2">
              By clicking Approve, you confirm this asset is ready to publish.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
