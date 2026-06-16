"use client";

import { useState } from "react";
import { Users, Star, MessageSquare, TrendingUp } from "lucide-react";

interface Persona {
  name: string;
  age: number;
  city: string;
  occupation: string;
  background: string;
  reaction: string;
  score: number;
  quote: string;
  suggestion: string;
}

interface FocusGroupResult {
  personas: Persona[];
  groupConsensus: string;
  averageScore: number;
  topConcern: string;
  topStrength: string;
  recommendation: string;
}

const ASSET_TYPES = ["caption", "tagline", "logo description", "ad concept", "product name", "slogan"];

function StarRating({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 10 }).map((_, i) => (
        <div
          key={i}
          className={`h-1.5 w-1.5 rounded-full ${i < score ? "bg-accent" : "bg-surface"}`}
        />
      ))}
      <span className="text-xs text-text-dim ml-1">{score}/10</span>
    </div>
  );
}

export default function FocusGroupPage() {
  const [assetType, setAssetType] = useState("caption");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FocusGroupResult | null>(null);

  const handleSubmit = async () => {
    if (!content.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/validate/focus-group", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, assetType }),
      });
      const data = await res.json();
      setResult(data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8 flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-accent/20 flex items-center justify-center">
          <Users className="h-5 w-5 text-accent" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-text">AI Focus Group</h1>
          <p className="text-sm text-text-muted">5 synthetic Pakistani consumers react to your asset</p>
        </div>
      </div>

      {/* Input */}
      <div className="rounded-2xl bg-surface-2 border border-border p-6 mb-6 space-y-4">
        <div className="flex gap-2 flex-wrap">
          {ASSET_TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setAssetType(t)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                assetType === t
                  ? "bg-accent/20 border-accent/40 text-accent"
                  : "bg-surface border-border text-text-muted hover:text-text"
              }`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={`Enter your ${assetType} here...`}
          rows={4}
          className="w-full rounded-xl bg-surface border border-border px-4 py-3 text-sm text-text placeholder:text-text-dim resize-none focus:outline-none focus:border-primary/50"
        />

        <button
          onClick={handleSubmit}
          disabled={loading || !content.trim()}
          className="px-6 py-2.5 rounded-xl bg-gradient-brand text-white text-sm font-semibold disabled:opacity-40 hover:opacity-90 transition-opacity"
        >
          {loading ? "Gathering reactions..." : "Run Focus Group"}
        </button>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <div className="h-12 w-12 rounded-full border-2 border-accent border-t-transparent animate-spin" />
          <p className="text-text-dim text-sm">Assembling your Pakistani focus group...</p>
        </div>
      )}

      {result && (
        <div className="space-y-6">
          {/* Summary bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-xl bg-surface-2 border border-border p-4 text-center">
              <div className="text-3xl font-bold text-text">{result.averageScore?.toFixed(1)}</div>
              <div className="text-xs text-text-dim mt-1">Avg Score /10</div>
            </div>
            <div className="rounded-xl bg-surface-2 border border-border p-4 col-span-3">
              <p className="text-xs text-text-dim mb-1">Group Consensus</p>
              <p className="text-sm text-text">{result.groupConsensus}</p>
            </div>
          </div>

          {/* Personas grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {result.personas?.map((p, i) => (
              <div key={i} className="rounded-2xl bg-surface-2 border border-border p-5 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-text">{p.name}</h3>
                    <p className="text-xs text-text-dim">{p.age}y · {p.city} · {p.occupation}</p>
                  </div>
                  <div className={`text-2xl font-bold ${p.score >= 7 ? "text-green-400" : p.score >= 5 ? "text-amber-400" : "text-red-400"}`}>
                    {p.score}
                  </div>
                </div>

                <StarRating score={p.score} />

                <p className="text-xs text-text-muted leading-relaxed">{p.reaction}</p>

                <div className="p-3 rounded-xl bg-surface border border-border">
                  <MessageSquare className="h-3 w-3 text-text-dim mb-1" />
                  <p className="text-xs italic text-text-muted">"{p.quote}"</p>
                </div>

                <div className="flex items-start gap-2">
                  <TrendingUp className="h-3 w-3 text-primary-light mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-text-dim">{p.suggestion}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Final insights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-xl bg-green-500/10 border border-green-500/20 p-4">
              <p className="text-xs font-semibold text-green-400 mb-2">Top Strength</p>
              <p className="text-sm text-text-muted">{result.topStrength}</p>
            </div>
            <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4">
              <p className="text-xs font-semibold text-red-400 mb-2">Top Concern</p>
              <p className="text-sm text-text-muted">{result.topConcern}</p>
            </div>
            <div className="rounded-xl bg-primary/10 border border-primary/20 p-4">
              <p className="text-xs font-semibold text-primary-light mb-2">Recommendation</p>
              <p className="text-sm text-text-muted">{result.recommendation}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
