"use client";

import { useState } from "react";
import {
  MessageSquare, AlertTriangle, CheckCircle, HelpCircle,
  Tag, Calendar, DollarSign, Users, Lightbulb, ChevronRight
} from "lucide-react";

interface BriefResult {
  projectTitle: string;
  clientName?: string;
  projectType: string;
  industry: string;
  deliverables: string[];
  colors: { mentioned: string[]; implied: string[] };
  style: { adjectives: string[]; references: string[] };
  targetAudience: string;
  budget: { mentioned: boolean; amount: string | null; flexibility: string };
  deadline: { mentioned: boolean; date: string | null; urgency: string };
  contradictions: { issue: string; messageA: string; messageB: string; recommendation: string }[];
  missingInfo: { field: string; question: string }[];
  impliedPreferences: string[];
  redFlags: string[];
  clarificationPriority: string[];
  structuredBrief: string;
  language: string;
}

const EXAMPLE = `Ahmed: bhai logo chahiye, fashion brand ke liye
Me: kaunsa style? minimalist ya bold?
Ahmed: premium lagni chahiye, aur simple bhi
Me: colors?
Ahmed: green aur white, ya kuch modern... actually gold bhi acha hai
Me: deadline kya hai?
Ahmed: kal tak de do bhai, presentation hai
Me: budget?
Ahmed: bohat zada nahi, thora flexible
Ahmed: aur ha, full brand identity bhi chahiye, social media ke liye bhi
Me: matlab logo k saath kya kya chahiye?
Ahmed: bas logo, aur shayad business card bhi`;

export default function BriefPage() {
  const [conversation, setConversation] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BriefResult | null>(null);

  const handleSubmit = async () => {
    if (conversation.trim().length < 20) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/brief/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversation }),
      });
      setResult(await res.json());
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8 flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-green-500/20 flex items-center justify-center">
          <MessageSquare className="h-5 w-5 text-green-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-text">WhatsApp Brief Parser</h1>
          <p className="text-sm text-text-muted">Paste a messy client conversation — AI extracts a clean brief</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input */}
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-text-dim uppercase tracking-widest">
                Paste Conversation
              </label>
              <button
                onClick={() => setConversation(EXAMPLE)}
                className="text-xs text-primary-light hover:underline"
              >
                Load example
              </button>
            </div>
            <textarea
              value={conversation}
              onChange={(e) => setConversation(e.target.value)}
              placeholder="Paste your WhatsApp conversation here — works with English, Urdu, and Roman Urdu..."
              rows={16}
              className="w-full rounded-xl bg-surface-2 border border-border px-4 py-3 text-sm text-text placeholder:text-text-dim resize-none focus:outline-none focus:border-primary/50 font-mono"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading || conversation.trim().length < 20}
            className="w-full py-3 rounded-xl bg-gradient-brand text-white font-semibold disabled:opacity-40 hover:opacity-90 transition-opacity"
          >
            {loading ? "Parsing brief..." : "Extract Structured Brief"}
          </button>

          <div className="rounded-xl bg-surface-2 border border-border p-4">
            <p className="text-xs font-semibold text-text-dim mb-2">Works with</p>
            <div className="flex flex-wrap gap-2">
              {["English", "Roman Urdu", "Urdu mixed", "Punjabi slang", "Code-switching"].map((t) => (
                <span key={t} className="text-xs px-2 py-1 rounded-full bg-surface border border-border text-text-dim">
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Output */}
        <div>
          {!result && !loading && (
            <div className="h-full flex items-center justify-center rounded-xl border border-dashed border-border bg-surface-2/20 p-8 text-center min-h-64">
              <div>
                <MessageSquare className="h-12 w-12 text-text-dim mx-auto mb-3 opacity-20" />
                <p className="text-text-dim text-sm">Structured brief will appear here</p>
              </div>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center min-h-64 gap-4">
              <div className="h-10 w-10 rounded-full border-2 border-green-400 border-t-transparent animate-spin" />
              <p className="text-text-dim text-sm">Reading between the lines...</p>
            </div>
          )}

          {result && (
            <div className="space-y-4 max-h-[80vh] overflow-y-auto pr-1">
              {/* Project header */}
              <div className="rounded-xl bg-surface-2 border border-border p-4">
                <h2 className="font-bold text-text text-lg">{result.projectTitle}</h2>
                {result.clientName && <p className="text-sm text-text-dim">Client: {result.clientName}</p>}
                <div className="flex gap-2 mt-2 flex-wrap">
                  <span className="text-xs px-2 py-1 rounded-full bg-primary/15 border border-primary/30 text-primary-light">
                    {result.projectType}
                  </span>
                  <span className="text-xs px-2 py-1 rounded-full bg-surface border border-border text-text-dim">
                    {result.industry}
                  </span>
                </div>
              </div>

              {/* Key details grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-surface-2 border border-border p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <DollarSign className="h-3.5 w-3.5 text-text-dim" />
                    <span className="text-xs font-semibold text-text-dim">Budget</span>
                  </div>
                  <p className="text-sm text-text">{result.budget?.amount || "Not specified"}</p>
                  <p className="text-xs text-text-dim">{result.budget?.flexibility}</p>
                </div>
                <div className="rounded-xl bg-surface-2 border border-border p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Calendar className="h-3.5 w-3.5 text-text-dim" />
                    <span className="text-xs font-semibold text-text-dim">Deadline</span>
                  </div>
                  <p className="text-sm text-text">{result.deadline?.date || "Not specified"}</p>
                  <p className="text-xs text-text-dim">{result.deadline?.urgency}</p>
                </div>
              </div>

              {/* Deliverables */}
              {result.deliverables?.length > 0 && (
                <div className="rounded-xl bg-surface-2 border border-border p-3">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Tag className="h-3.5 w-3.5 text-text-dim" />
                    <span className="text-xs font-semibold text-text-dim">Deliverables</span>
                  </div>
                  <ul className="space-y-1">
                    {result.deliverables.map((d, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-text-muted">
                        <CheckCircle className="h-3.5 w-3.5 text-green-400 flex-shrink-0" />
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Target audience */}
              {result.targetAudience && (
                <div className="rounded-xl bg-surface-2 border border-border p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Users className="h-3.5 w-3.5 text-text-dim" />
                    <span className="text-xs font-semibold text-text-dim">Target Audience</span>
                  </div>
                  <p className="text-sm text-text-muted">{result.targetAudience}</p>
                </div>
              )}

              {/* Contradictions */}
              {result.contradictions?.length > 0 && (
                <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 p-3">
                  <div className="flex items-center gap-1.5 mb-2">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                    <span className="text-xs font-semibold text-amber-400">Contradictions Found</span>
                  </div>
                  {result.contradictions.map((c, i) => (
                    <div key={i} className="mb-2 last:mb-0">
                      <p className="text-sm font-medium text-amber-300">{c.issue}</p>
                      <p className="text-xs text-text-muted mt-0.5">"{c.messageA}" vs "{c.messageB}"</p>
                      <p className="text-xs text-amber-400/70 mt-0.5">Resolve: {c.recommendation}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Missing info */}
              {result.missingInfo?.length > 0 && (
                <div className="rounded-xl bg-surface-2 border border-border p-3">
                  <div className="flex items-center gap-1.5 mb-2">
                    <HelpCircle className="h-3.5 w-3.5 text-text-dim" />
                    <span className="text-xs font-semibold text-text-dim">Missing Info</span>
                  </div>
                  {result.missingInfo.map((m, i) => (
                    <div key={i} className="flex items-start gap-2 mb-1 last:mb-0">
                      <ChevronRight className="h-3.5 w-3.5 text-text-dim flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-text-muted">{m.question}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Red flags */}
              {result.redFlags?.length > 0 && (
                <div className="rounded-xl bg-red-500/10 border border-red-500/30 p-3">
                  <p className="text-xs font-semibold text-red-400 mb-2">Red Flags</p>
                  {result.redFlags.map((f, i) => (
                    <div key={i} className="flex items-start gap-2 mb-1 last:mb-0">
                      <AlertTriangle className="h-3.5 w-3.5 text-red-400 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-text-muted">{f}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Clarification priority */}
              {result.clarificationPriority?.length > 0 && (
                <div className="rounded-xl bg-primary/5 border border-primary/20 p-3">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Lightbulb className="h-3.5 w-3.5 text-primary-light" />
                    <span className="text-xs font-semibold text-primary-light">Ask Client First</span>
                  </div>
                  {result.clarificationPriority.map((q, i) => (
                    <div key={i} className="flex items-start gap-2 mb-1.5 last:mb-0">
                      <span className="text-xs font-bold text-primary-light flex-shrink-0">{i + 1}.</span>
                      <p className="text-xs text-text-muted">{q}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Structured brief */}
      {result?.structuredBrief && (
        <div className="mt-6 rounded-2xl bg-surface-2 border border-border p-5">
          <h3 className="text-sm font-bold text-text mb-3">Structured Brief (Ready to Share)</h3>
          <p className="text-sm text-text-muted leading-relaxed whitespace-pre-line">{result.structuredBrief}</p>
        </div>
      )}
    </div>
  );
}
