"use client";

import { useState, useRef } from "react";
import { Shield, Upload, X, AlertTriangle, CheckCircle, Info } from "lucide-react";

type AssetType = "caption" | "tagline" | "logo" | "image" | "design";
type Severity = "high" | "medium" | "low";

interface Violation {
  category: string;
  message: string;
  severity: Severity;
}

interface GuardianResult {
  overall: number;
  grade: string;
  scores: Record<string, number>;
  violations: Violation[];
  suggestions: string[];
  summary: string;
}

const severityConfig = {
  high: { color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/30", icon: AlertTriangle },
  medium: { color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/30", icon: Info },
  low: { color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/30", icon: Info },
};

function ScoreRing({ score, label }: { score: number; label: string }) {
  const r = 30;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 80 ? "#22c55e" : score >= 60 ? "#f59e0b" : "#ef4444";

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative h-20 w-20">
        <svg viewBox="0 0 72 72" className="rotate-[-90deg]">
          <circle cx="36" cy="36" r={r} fill="none" stroke="#1E2435" strokeWidth="6" />
          <circle
            cx="36" cy="36" r={r}
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 0.8s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold text-text">{score}</span>
        </div>
      </div>
      <span className="text-xs text-text-dim">{label}</span>
    </div>
  );
}

export default function GuardianPage() {
  const [assetType, setAssetType] = useState<AssetType>("caption");
  const [content, setContent] = useState("");
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GuardianResult | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setImagePreview(dataUrl);
      const b64 = dataUrl.split(",")[1];
      setImageBase64(b64);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!content && !imageBase64) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/validate/guardian", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assetType, content, imageBase64 }),
      });
      const data = await res.json();
      setResult(data);
    } finally {
      setLoading(false);
    }
  };

  const gradeColor = (g: string) =>
    g === "A" ? "text-green-400" :
    g === "B" ? "text-emerald-400" :
    g === "C" ? "text-amber-400" :
    g === "D" ? "text-orange-400" : "text-red-400";

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8 flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center">
          <Shield className="h-5 w-5 text-primary-light" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-text">Brand Guardian</h1>
          <p className="text-sm text-text-muted">Score any asset against your Brand DNA</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input panel */}
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-text-dim uppercase tracking-widest mb-2 block">
              Asset Type
            </label>
            <div className="flex flex-wrap gap-2">
              {(["caption", "tagline", "logo", "image", "design"] as AssetType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setAssetType(t)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                    assetType === t
                      ? "bg-primary/20 border-primary/40 text-primary-light"
                      : "bg-surface-2 border-border text-text-muted hover:text-text"
                  }`}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-text-dim uppercase tracking-widest mb-2 block">
              Content
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste your caption, tagline, or describe the design..."
              rows={5}
              className="w-full rounded-xl bg-surface-2 border border-border px-4 py-3 text-sm text-text placeholder:text-text-dim resize-none focus:outline-none focus:border-primary/50"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-text-dim uppercase tracking-widest mb-2 block">
              Upload Image (optional)
            </label>
            {imagePreview ? (
              <div className="relative rounded-xl overflow-hidden border border-border">
                <img src={imagePreview} alt="Preview" className="w-full h-40 object-cover" />
                <button
                  onClick={() => { setImagePreview(null); setImageBase64(null); }}
                  className="absolute top-2 right-2 h-7 w-7 rounded-full bg-surface-2/90 flex items-center justify-center hover:bg-surface"
                >
                  <X className="h-4 w-4 text-text" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileRef.current?.click()}
                className="w-full h-32 rounded-xl border border-dashed border-border bg-surface-2 hover:border-primary/40 flex flex-col items-center justify-center gap-2 transition-all"
              >
                <Upload className="h-5 w-5 text-text-dim" />
                <span className="text-sm text-text-muted">Drop image or click to upload</span>
              </button>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading || (!content && !imageBase64)}
            className="w-full py-3 rounded-xl bg-gradient-brand text-white font-semibold disabled:opacity-40 hover:opacity-90 transition-opacity"
          >
            {loading ? "Analyzing..." : "Run Guardian Check"}
          </button>
        </div>

        {/* Result panel */}
        <div className="space-y-4">
          {!result && !loading && (
            <div className="h-full flex items-center justify-center rounded-xl border border-dashed border-border bg-surface-2/30 p-8 text-center">
              <div>
                <Shield className="h-12 w-12 text-text-dim mx-auto mb-3 opacity-30" />
                <p className="text-text-dim text-sm">Results will appear here</p>
              </div>
            </div>
          )}

          {loading && (
            <div className="h-full flex items-center justify-center rounded-xl border border-border bg-surface-2/30 p-8">
              <div className="text-center">
                <div className="h-10 w-10 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto mb-4" />
                <p className="text-text-dim text-sm">Analyzing against Brand DNA...</p>
              </div>
            </div>
          )}

          {result && (
            <div className="space-y-4">
              {/* Overall score */}
              <div className="rounded-xl bg-surface-2 border border-border p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-text-muted">Overall Score</p>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-4xl font-bold text-text">{result.overall}</span>
                      <span className={`text-2xl font-bold ${gradeColor(result.grade)}`}>
                        Grade {result.grade}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    {Object.entries(result.scores).map(([key, val]) => (
                      <ScoreRing key={key} score={val} label={key.charAt(0).toUpperCase() + key.slice(1)} />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-text-muted border-t border-border pt-3">{result.summary}</p>
              </div>

              {/* Violations */}
              {result.violations.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-text-dim uppercase tracking-widest">
                    Issues Found ({result.violations.length})
                  </p>
                  {result.violations.map((v, i) => {
                    const cfg = severityConfig[v.severity];
                    return (
                      <div key={i} className={`flex items-start gap-3 p-3 rounded-xl border ${cfg.bg} ${cfg.border}`}>
                        <cfg.icon className={`h-4 w-4 mt-0.5 flex-shrink-0 ${cfg.color}`} />
                        <div>
                          <p className={`text-xs font-semibold ${cfg.color}`}>{v.category}</p>
                          <p className="text-sm text-text-muted mt-0.5">{v.message}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Suggestions */}
              {result.suggestions?.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-text-dim uppercase tracking-widest">Suggestions</p>
                  {result.suggestions.map((s, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl border border-green-500/20 bg-green-500/5">
                      <CheckCircle className="h-4 w-4 mt-0.5 text-green-400 flex-shrink-0" />
                      <p className="text-sm text-text-muted">{s}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
