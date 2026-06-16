"use client";

import { useState } from "react";
import { Globe, AlertTriangle, Lightbulb, MapPin, CheckCircle } from "lucide-react";

type CulturalFit = "excellent" | "good" | "neutral" | "risky" | "problematic";

interface Flag {
  category: string;
  severity: "critical" | "warning" | "suggestion";
  issue: string;
  explanation: string;
  fix: string;
}

interface CulturalResult {
  overallScore: number;
  culturalFit: CulturalFit;
  flags: Flag[];
  strengths: string[];
  opportunities: string[];
  regionalNotes: Record<string, string>;
  urduSuggestion: string | null;
  romanUrduSuggestion: string | null;
  summary: string;
}

const fitConfig: Record<CulturalFit, { color: string; bg: string; border: string; label: string }> = {
  excellent: { color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/30", label: "Excellent fit" },
  good: { color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30", label: "Good fit" },
  neutral: { color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/30", label: "Neutral" },
  risky: { color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/30", label: "Risky" },
  problematic: { color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/30", label: "Problematic" },
};

const severityConfig = {
  critical: { color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/30" },
  warning: { color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/30" },
  suggestion: { color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/30" },
};

const ASSET_TYPES = ["caption", "tagline", "ad copy", "campaign concept", "product name", "website copy"];

export default function CulturalCheckPage() {
  const [content, setContent] = useState("");
  const [assetType, setAssetType] = useState("caption");
  const [targetRegion, setTargetRegion] = useState("Pakistan (all provinces)");
  const [includeUrdu, setIncludeUrdu] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CulturalResult | null>(null);

  const handleSubmit = async () => {
    if (!content.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/validate/cultural", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, assetType, targetRegion, includeUrduCheck: includeUrdu }),
      });
      setResult(await res.json());
    } finally {
      setLoading(false);
    }
  };

  const fit = result ? fitConfig[result.culturalFit] ?? fitConfig.neutral : null;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8 flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-rose-500/20 flex items-center justify-center">
          <Globe className="h-5 w-5 text-rose-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-text">Cultural Check</h1>
          <p className="text-sm text-text-muted">AI reviews content for Pakistani cultural sensitivity</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input */}
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {ASSET_TYPES.map((t) => (
              <button
                key={t}
                onClick={() => setAssetType(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  assetType === t
                    ? "bg-rose-500/20 border-rose-500/40 text-rose-300"
                    : "bg-surface-2 border-border text-text-muted hover:text-text"
                }`}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Paste your copy here — English, Urdu, or Roman Urdu all work..."
            rows={6}
            className="w-full rounded-xl bg-surface-2 border border-border px-4 py-3 text-sm text-text placeholder:text-text-dim resize-none focus:outline-none focus:border-rose-500/40"
          />

          <div>
            <label className="text-xs font-semibold text-text-dim uppercase tracking-widest mb-2 block">
              Target Region
            </label>
            <select
              value={targetRegion}
              onChange={(e) => setTargetRegion(e.target.value)}
              className="w-full rounded-xl bg-surface-2 border border-border px-4 py-2.5 text-sm text-text focus:outline-none focus:border-rose-500/40"
            >
              <option>Pakistan (all provinces)</option>
              <option>Karachi</option>
              <option>Lahore</option>
              <option>Islamabad / Rawalpindi</option>
              <option>Peshawar / KPK</option>
              <option>Multan / South Punjab</option>
              <option>Interior Sindh</option>
            </select>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <div
              onClick={() => setIncludeUrdu(!includeUrdu)}
              className={`h-5 w-9 rounded-full transition-colors relative ${includeUrdu ? "bg-rose-500" : "bg-surface"}`}
            >
              <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${includeUrdu ? "translate-x-4" : "translate-x-0.5"}`} />
            </div>
            <span className="text-sm text-text-muted">Include Urdu translation suggestion</span>
          </label>

          <button
            onClick={handleSubmit}
            disabled={loading || !content.trim()}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 text-white text-sm font-semibold disabled:opacity-40 hover:opacity-90 transition-opacity"
          >
            {loading ? "Analyzing cultural fit..." : "Run Cultural Check"}
          </button>
        </div>

        {/* Results */}
        <div>
          {!result && !loading && (
            <div className="h-full flex items-center justify-center rounded-xl border border-dashed border-border bg-surface-2/20 p-8 text-center">
              <div>
                <Globe className="h-12 w-12 text-text-dim mx-auto mb-3 opacity-20" />
                <p className="text-text-dim text-sm">Cultural analysis will appear here</p>
              </div>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center h-full min-h-48 gap-4">
              <div className="h-10 w-10 rounded-full border-2 border-rose-400 border-t-transparent animate-spin" />
              <p className="text-text-dim text-sm">Consulting Pakistani cultural guidelines...</p>
            </div>
          )}

          {result && fit && (
            <div className="space-y-4">
              {/* Score */}
              <div className={`rounded-xl border p-4 ${fit.bg} ${fit.border}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-3xl font-bold text-text">{result.overallScore}</span>
                      <span className={`text-sm font-semibold ${fit.color}`}>{fit.label}</span>
                    </div>
                    <p className="text-xs text-text-dim mt-0.5">Cultural Fit Score</p>
                  </div>
                </div>
                <p className="text-sm text-text-muted mt-3 border-t border-white/5 pt-3">{result.summary}</p>
              </div>

              {/* Flags */}
              {result.flags?.length > 0 && (
                <div className="space-y-2">
                  {result.flags.map((f, i) => {
                    const cfg = severityConfig[f.severity];
                    return (
                      <div key={i} className={`p-3 rounded-xl border ${cfg.bg} ${cfg.border} space-y-1`}>
                        <div className="flex items-center gap-2">
                          <AlertTriangle className={`h-3.5 w-3.5 ${cfg.color}`} />
                          <span className={`text-xs font-semibold ${cfg.color}`}>{f.category} · {f.severity}</span>
                        </div>
                        <p className="text-sm text-text">{f.issue}</p>
                        <p className="text-xs text-text-muted">{f.explanation}</p>
                        <p className="text-xs text-text-dim border-t border-white/5 pt-1 mt-1">
                          Fix: {f.fix}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {result && (
        <div className="mt-6 space-y-6">
          {/* Regional breakdown */}
          {result.regionalNotes && Object.keys(result.regionalNotes).length > 0 && (
            <div>
              <p className="text-xs font-semibold text-text-dim uppercase tracking-widest mb-3">Regional Reception</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {Object.entries(result.regionalNotes).map(([city, note]) => (
                  <div key={city} className="rounded-xl bg-surface-2 border border-border p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin className="h-3.5 w-3.5 text-text-dim" />
                      <span className="text-xs font-semibold text-text capitalize">{city}</span>
                    </div>
                    <p className="text-xs text-text-muted">{note}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Strengths + Opportunities */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {result.strengths?.length > 0 && (
              <div className="rounded-xl bg-green-500/5 border border-green-500/20 p-4">
                <p className="text-xs font-semibold text-green-400 mb-2">Cultural Strengths</p>
                <ul className="space-y-1">
                  {result.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-text-muted">
                      <CheckCircle className="h-3.5 w-3.5 text-green-400 mt-0.5 flex-shrink-0" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {result.opportunities?.length > 0 && (
              <div className="rounded-xl bg-primary/5 border border-primary/20 p-4">
                <p className="text-xs font-semibold text-primary-light mb-2">Local Hook Opportunities</p>
                <ul className="space-y-1">
                  {result.opportunities.map((o, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-text-muted">
                      <Lightbulb className="h-3.5 w-3.5 text-primary-light mt-0.5 flex-shrink-0" />
                      {o}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Urdu suggestions */}
          {(result.urduSuggestion || result.romanUrduSuggestion) && (
            <div className="rounded-xl bg-surface-2 border border-border p-4 space-y-3">
              <p className="text-xs font-semibold text-text-dim uppercase tracking-widest">Language Variants</p>
              {result.urduSuggestion && (
                <div>
                  <p className="text-xs text-text-dim mb-1">اردو</p>
                  <p className="text-lg text-text" dir="rtl" style={{ fontFamily: "serif" }}>
                    {result.urduSuggestion}
                  </p>
                </div>
              )}
              {result.romanUrduSuggestion && (
                <div>
                  <p className="text-xs text-text-dim mb-1">Roman Urdu</p>
                  <p className="text-base text-text italic">{result.romanUrduSuggestion}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
