"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Image as ImageIcon, Upload, X, Sparkles, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MoodboardResult {
  stylePersonality: string;
  colorPalette: {
    primary?: string;
    secondary?: string;
    accent?: string;
    neutrals?: string[];
  };
  typographyFeel: string;
  visualKeywords: string[];
  moodDescriptors: string[];
  layoutStyle: string;
  brandArchetype: string;
  summary: string;
}

export default function MoodboardPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MoodboardResult | null>(null);
  const [error, setError] = useState("");

  const onDrop = useCallback((accepted: File[]) => {
    const newFiles = [...files, ...accepted].slice(0, 5);
    setFiles(newFiles);
    setPreviews(newFiles.map((f) => URL.createObjectURL(f)));
  }, [files]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    maxFiles: 5,
  });

  function removeFile(i: number) {
    const nf = files.filter((_, idx) => idx !== i);
    setFiles(nf);
    setPreviews(nf.map((f) => URL.createObjectURL(f)));
  }

  async function analyze() {
    if (files.length < 2) return;
    setLoading(true);
    setError("");
    setResult(null);

    const fd = new FormData();
    files.forEach((f) => fd.append("images", f));

    try {
      const res = await fetch("/api/moodboard", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data.result);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Analysis failed");
    }
    setLoading(false);
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <ImageIcon className="h-6 w-6 text-primary-light" />
          <h1 className="text-3xl font-bold text-text">Reverse Moodboard</h1>
        </div>
        <p className="text-text-muted">
          Upload 2–5 images you love from any brand. AI extracts the shared visual DNA and merges it into your brand style.
        </p>
      </div>

      <div
        {...getRootProps()}
        className={cn(
          "rounded-2xl border-2 border-dashed p-12 text-center cursor-pointer transition-all duration-200 mb-4",
          isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/40 hover:bg-surface-2"
        )}
      >
        <input {...getInputProps()} />
        <Upload className={cn("h-10 w-10 mx-auto mb-3", isDragActive ? "text-primary" : "text-text-dim")} />
        <p className="text-text font-medium">
          {isDragActive ? "Drop inspiration images" : "Drop inspiration images here"}
        </p>
        <p className="text-text-muted text-sm mt-1">
          Logos, ads, Instagram posts, anything you find visually inspiring · Up to 5 images
        </p>
      </div>

      {previews.length > 0 && (
        <div className="grid grid-cols-5 gap-3 mb-6">
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
        <p className="text-sm text-error bg-error/10 border border-error/20 rounded-xl px-4 py-3 mb-4">{error}</p>
      )}

      <Button
        onClick={analyze}
        disabled={files.length < 2 || loading}
        loading={loading}
        size="lg"
      >
        <Sparkles className="h-4 w-4" />
        {loading ? "Extracting your style DNA..." : "Extract style DNA"}
      </Button>
      {files.length < 2 && <p className="text-xs text-text-dim mt-2">Upload at least 2 images to analyze</p>}

      {/* Results */}
      {result && (
        <div className="mt-10 space-y-6 animate-fade-in">
          {/* Style summary */}
          <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 p-6">
            <div className="flex items-center gap-3 mb-2">
              <Sparkles className="h-5 w-5 text-primary-light" />
              <h2 className="text-lg font-semibold text-text">{result.stylePersonality}</h2>
              <span className="ml-auto text-xs px-3 py-1 rounded-full bg-primary/10 text-primary-light border border-primary/20">
                {result.brandArchetype}
              </span>
            </div>
            <p className="text-text-muted text-sm">{result.summary}</p>
          </div>

          {/* Color palette */}
          {result.colorPalette && (
            <div className="rounded-2xl border border-border bg-surface p-6">
              <h3 className="font-semibold text-text mb-4 flex items-center gap-2">
                <Palette className="h-4 w-4 text-primary-light" />
                Extracted Color Palette
              </h3>
              <div className="flex flex-wrap gap-4">
                {[
                  { label: "Primary", color: result.colorPalette.primary },
                  { label: "Secondary", color: result.colorPalette.secondary },
                  { label: "Accent", color: result.colorPalette.accent },
                  ...(result.colorPalette.neutrals || []).map((c, i) => ({ label: `Neutral ${i + 1}`, color: c })),
                ].filter((c) => c.color).map(({ label, color }) => (
                  <div key={label} className="flex flex-col items-center gap-2">
                    <div className="h-14 w-14 rounded-xl border-2 border-border" style={{ backgroundColor: color }} />
                    <div className="text-center">
                      <p className="text-xs text-text font-medium">{label}</p>
                      <p className="text-xs text-text-dim font-mono">{color}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Keywords */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {result.visualKeywords && (
              <div className="rounded-2xl border border-border bg-surface p-6">
                <h3 className="font-semibold text-text mb-3">Visual Keywords</h3>
                <div className="flex flex-wrap gap-2">
                  {result.visualKeywords.map((k) => (
                    <span key={k} className="text-sm px-3 py-1 rounded-full bg-surface-2 border border-border text-text-muted">
                      {k}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {result.moodDescriptors && (
              <div className="rounded-2xl border border-border bg-surface p-6">
                <h3 className="font-semibold text-text mb-3">Mood</h3>
                <div className="flex flex-wrap gap-2">
                  {result.moodDescriptors.map((m) => (
                    <span key={m} className="text-sm px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Typography + Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {result.typographyFeel && (
              <div className="rounded-2xl border border-border bg-surface p-6">
                <h3 className="font-semibold text-text mb-2">Typography Feel</h3>
                <p className="text-sm text-text-muted">{result.typographyFeel}</p>
              </div>
            )}
            {result.layoutStyle && (
              <div className="rounded-2xl border border-border bg-surface p-6">
                <h3 className="font-semibold text-text mb-2">Layout Style</h3>
                <p className="text-sm text-text-muted">{result.layoutStyle}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
