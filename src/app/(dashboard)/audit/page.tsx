"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, ShieldCheck, X, AlertTriangle, CheckCircle, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface AuditResult {
  overallScore: number;
  colorScore: number;
  typographyScore: number;
  styleScore: number;
  detectedColors: string[];
  detectedFonts: string[];
  violations: Array<{ type: string; description: string; severity: "low" | "medium" | "high" }>;
  strengths: string[];
  recommendations: string[];
}

function ScoreRing({ score, label }: { score: number; label: string }) {
  const color = score >= 80 ? "#10B981" : score >= 60 ? "#F59E0B" : "#EF4444";
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative h-20 w-20">
        <svg className="h-20 w-20 -rotate-90" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r="30" fill="none" stroke="#1E2435" strokeWidth="8" />
          <circle
            cx="40" cy="40" r="30" fill="none"
            stroke={color} strokeWidth="8"
            strokeDasharray={`${(score / 100) * 188.5} 188.5`}
            strokeLinecap="round"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-text">
          {score}
        </span>
      </div>
      <p className="text-xs text-text-muted text-center">{label}</p>
    </div>
  );
}

export default function AuditPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [error, setError] = useState("");

  const onDrop = useCallback((accepted: File[]) => {
    const newFiles = [...files, ...accepted].slice(0, 6);
    setFiles(newFiles);
    const newPreviews = newFiles.map((f) => URL.createObjectURL(f));
    setPreviews(newPreviews);
  }, [files]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".png", ".jpg", ".jpeg", ".webp"] },
    maxFiles: 6,
  });

  function removeFile(i: number) {
    setFiles((prev) => prev.filter((_, idx) => idx !== i));
    setPreviews((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function runAudit() {
    if (!files.length) return;
    setLoading(true);
    setError("");
    setResult(null);

    const fd = new FormData();
    files.forEach((f) => fd.append("images", f));

    try {
      const res = await fetch("/api/audit", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Audit failed");
      setResult(data.audit);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Audit failed");
    }
    setLoading(false);
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <ShieldCheck className="h-6 w-6 text-primary-light" />
          <h1 className="text-3xl font-bold text-text">Brand Audit</h1>
        </div>
        <p className="text-text-muted">
          Upload 2–6 brand assets (logos, posts, banners). AI scores consistency across color, typography, and style.
        </p>
      </div>

      {/* Drop zone */}
      <div
        {...getRootProps()}
        className={cn(
          "rounded-2xl border-2 border-dashed p-12 text-center cursor-pointer transition-all duration-200",
          isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/40 hover:bg-surface-2"
        )}
      >
        <input {...getInputProps()} />
        <Upload className={cn("h-10 w-10 mx-auto mb-3", isDragActive ? "text-primary" : "text-text-dim")} />
        <p className="text-text font-medium">
          {isDragActive ? "Drop your assets here" : "Drag & drop brand assets"}
        </p>
        <p className="text-text-muted text-sm mt-1">or click to browse · PNG, JPG, WebP · Up to 6 files</p>
      </div>

      {/* Previews */}
      {previews.length > 0 && (
        <div className="mt-4 grid grid-cols-3 md:grid-cols-6 gap-3">
          {previews.map((p, i) => (
            <div key={i} className="relative group aspect-square">
              <img src={p} alt="" className="w-full h-full object-cover rounded-xl border border-border" />
              <button
                onClick={() => removeFile(i)}
                className="absolute top-1 right-1 h-5 w-5 rounded-full bg-error flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3 text-white" />
              </button>
            </div>
          ))}
        </div>
      )}

      {error && (
        <p className="mt-4 text-sm text-error bg-error/10 border border-error/20 rounded-xl px-4 py-3">{error}</p>
      )}

      <Button
        onClick={runAudit}
        disabled={files.length < 1 || loading}
        loading={loading}
        className="mt-6"
        size="lg"
      >
        <ShieldCheck className="h-4 w-4" />
        {loading ? "Auditing your brand..." : `Audit ${files.length} asset${files.length !== 1 ? "s" : ""}`}
      </Button>

      {/* Results */}
      {result && (
        <div className="mt-10 space-y-6 animate-fade-in">
          {/* Score overview */}
          <div className="rounded-2xl border border-border bg-surface p-8">
            <h2 className="text-lg font-semibold text-text mb-6">Audit Results</h2>
            <div className="flex flex-wrap gap-8 justify-center">
              <ScoreRing score={result.overallScore} label="Overall Score" />
              <ScoreRing score={result.colorScore} label="Color Consistency" />
              <ScoreRing score={result.typographyScore} label="Typography" />
              <ScoreRing score={result.styleScore} label="Visual Style" />
            </div>

            {result.detectedColors && result.detectedColors.length > 0 && (
              <div className="mt-6 pt-6 border-t border-border">
                <p className="text-xs text-text-dim mb-2">Detected colors</p>
                <div className="flex flex-wrap gap-2">
                  {result.detectedColors.map((c) => (
                    <div key={c} className="flex items-center gap-1.5">
                      <div className="h-4 w-4 rounded border border-border" style={{ backgroundColor: c }} />
                      <span className="text-xs text-text-muted font-mono">{c}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Issues */}
          {result.violations && result.violations.length > 0 && (
            <div className="rounded-2xl border border-border bg-surface p-6">
              <h3 className="font-semibold text-text mb-4 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-warning" />
                Issues found ({result.violations.length})
              </h3>
              <div className="space-y-3">
                {result.violations.map((v, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-surface-2 border border-border">
                    <Badge variant={v.severity === "high" ? "error" : v.severity === "medium" ? "warning" : "outline"}>
                      {v.severity}
                    </Badge>
                    <div>
                      <p className="text-sm font-medium text-text">{v.type}</p>
                      <p className="text-sm text-text-muted mt-0.5">{v.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Strengths + Recommendations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {result.strengths && result.strengths.length > 0 && (
              <div className="rounded-2xl border border-success/20 bg-success/5 p-6">
                <h3 className="font-semibold text-success mb-3 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Strengths
                </h3>
                <ul className="space-y-2">
                  {result.strengths.map((s) => (
                    <li key={s} className="text-sm text-text-muted flex items-start gap-2">
                      <span className="text-success mt-0.5">✓</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {result.recommendations && result.recommendations.length > 0 && (
              <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6">
                <h3 className="font-semibold text-primary-light mb-3 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Recommendations
                </h3>
                <ul className="space-y-2">
                  {result.recommendations.map((r) => (
                    <li key={r} className="text-sm text-text-muted flex items-start gap-2">
                      <span className="text-primary-light mt-0.5">→</span> {r}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
