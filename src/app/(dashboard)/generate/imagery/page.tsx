"use client";

import { useState } from "react";
import { Image as ImageIcon, Sparkles, Download, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const STYLES = [
  { id: "realism", label: "Realism", emoji: "📸" },
  { id: "minimalist", label: "Minimalist", emoji: "◻️" },
  { id: "neon", label: "Neon", emoji: "🌆" },
  { id: "vintage-retro", label: "Vintage / Retro", emoji: "🎞️" },
  { id: "3d-render", label: "3D Render", emoji: "🎲" },
  { id: "watercolor", label: "Watercolor", emoji: "🎨" },
  { id: "flat-design", label: "Flat Design", emoji: "📐" },
  { id: "animated", label: "Animated", emoji: "✨" },
] as const;

const SIZES = [
  { id: "square", label: "Square (1:1)", desc: "Instagram post" },
  { id: "landscape", label: "Landscape (4:3)", desc: "Facebook, blog" },
  { id: "portrait", label: "Portrait (4:3)", desc: "Pinterest" },
  { id: "story", label: "Story (9:16)", desc: "Instagram Story" },
] as const;

const EXPORT_FORMATS = [
  { slug: "instagram-post", label: "Instagram Post", size: "1080×1080" },
  { slug: "instagram-story", label: "Story", size: "1080×1920" },
  { slug: "facebook-cover", label: "Facebook Cover", size: "820×312" },
  { slug: "linkedin-banner", label: "LinkedIn Banner", size: "1584×396" },
  { slug: "twitter-header", label: "Twitter Header", size: "1500×500" },
  { slug: "youtube-thumb", label: "YouTube Thumb", size: "1280×720" },
  { slug: "whatsapp-dp", label: "WhatsApp DP", size: "500×500" },
];

export default function ImageryPage() {
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("realism");
  const [size, setSize] = useState("square");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");
  const [selectedFormats, setSelectedFormats] = useState<string[]>(["instagram-post", "instagram-story"]);

  async function generate() {
    if (!prompt.trim()) return;
    setLoading(true);
    setError("");
    setImageUrl(null);

    try {
      const res = await fetch("/api/generate/imagery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, style, size }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setImageUrl(data.imageUrl);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Generation failed");
    }
    setLoading(false);
  }

  async function exportKit() {
    if (!imageUrl) return;
    setExporting(true);
    try {
      const res = await fetch("/api/generate/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl, formats: selectedFormats }),
      });
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "social-media-kit.zip";
      a.click();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Export failed");
    }
    setExporting(false);
  }

  function toggleFormat(slug: string) {
    setSelectedFormats((prev) =>
      prev.includes(slug) ? prev.filter((f) => f !== slug) : [...prev, slug]
    );
  }

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-8 flex items-center gap-3">
        <ImageIcon className="h-6 w-6 text-blue-400" />
        <div>
          <h1 className="text-3xl font-bold text-text">Post Imagery</h1>
          <p className="text-text-muted text-sm mt-0.5">FLUX.1 on Cloudflare Workers AI · 8 style filters · Brand DNA auto-injected</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Controls */}
        <div className="space-y-5">
          <div className="rounded-2xl border border-border bg-surface p-6 space-y-4">
            <Textarea
              label="Describe the image *"
              placeholder={'e.g. A bold café poster with the headline text "MORNING BREW" above a steaming latte'}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[90px]"
            />
            <p className="text-xs text-text-dim -mt-2">
              💡 Want text on a poster? Put the exact words in quotes — e.g. a sign that says{" "}
              <span className="text-text-muted">&quot;GRAND OPENING&quot;</span>. Keep it short (1–4 words) for the sharpest letters.
            </p>

            {/* Style filter */}
            <div>
              <label className="text-sm font-medium text-text-muted mb-2 block">Style filter</label>
              <div className="grid grid-cols-4 gap-2">
                {STYLES.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setStyle(s.id)}
                    className={cn(
                      "flex flex-col items-center gap-1 py-2 px-1 rounded-xl border text-xs transition-all",
                      style === s.id
                        ? "border-primary/40 bg-primary/10 text-primary-light"
                        : "border-border text-text-muted hover:border-border-light hover:text-text"
                    )}
                  >
                    <span className="text-base">{s.emoji}</span>
                    <span className="text-center leading-tight">{s.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Size */}
            <div>
              <label className="text-sm font-medium text-text-muted mb-2 block">Aspect ratio</label>
              <div className="grid grid-cols-2 gap-2">
                {SIZES.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSize(s.id)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-xl border text-sm transition-all text-left",
                      size === s.id
                        ? "border-primary/40 bg-primary/10 text-primary-light"
                        : "border-border text-text-muted hover:border-border-light"
                    )}
                  >
                    <div>
                      <p className="font-medium text-xs">{s.label}</p>
                      <p className="text-[10px] opacity-60">{s.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <p className="text-sm text-error bg-error/10 border border-error/20 rounded-xl px-4 py-3">{error}</p>
            )}

            <Button onClick={generate} loading={loading} disabled={!prompt.trim()} className="w-full" size="lg">
              <Sparkles className="h-4 w-4" />
              {loading ? "Generating with Workers AI..." : "Generate image"}
            </Button>
          </div>

          {/* Export kit */}
          {imageUrl && (
            <div className="rounded-2xl border border-border bg-surface p-6">
              <div className="flex items-center gap-2 mb-3">
                <Package className="h-4 w-4 text-pink-400" />
                <h3 className="font-semibold text-sm text-text">Social Media Kit</h3>
              </div>
              <p className="text-xs text-text-muted mb-3">Select formats to include in zip export:</p>
              <div className="space-y-2 mb-4">
                {EXPORT_FORMATS.map((f) => (
                  <label key={f.slug} className="flex items-center gap-2.5 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={selectedFormats.includes(f.slug)}
                      onChange={() => toggleFormat(f.slug)}
                      className="rounded border-border accent-violet-500"
                    />
                    <span className="text-sm text-text-muted group-hover:text-text transition-colors flex-1">{f.label}</span>
                    <span className="text-xs text-text-dim font-mono">{f.size}</span>
                  </label>
                ))}
              </div>
              <Button
                onClick={exportKit}
                loading={exporting}
                disabled={selectedFormats.length === 0}
                variant="outline"
                className="w-full"
              >
                <Download className="h-4 w-4" />
                {exporting ? "Exporting..." : `Export ${selectedFormats.length} format${selectedFormats.length !== 1 ? "s" : ""} as ZIP`}
              </Button>
            </div>
          )}
        </div>

        {/* Preview */}
        <div>
          {imageUrl ? (
            <div className="rounded-2xl border border-border overflow-hidden">
              <img src={imageUrl} alt="Generated" className="w-full" />
              <div className="p-4 bg-surface flex justify-between items-center">
                <span className="text-xs text-text-dim capitalize">{style} · {size}</span>
                <a href={imageUrl} download="generated.png" target="_blank" rel="noopener noreferrer">
                  <Button size="sm" variant="outline">
                    <Download className="h-3.5 w-3.5" />
                    Download
                  </Button>
                </a>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border min-h-[400px] flex items-center justify-center">
              <div className="text-center">
                <ImageIcon className="h-14 w-14 text-text-dim mx-auto mb-3" />
                <p className="text-text-muted text-sm">Your generated image will appear here</p>
                <p className="text-xs text-text-dim mt-1">Requires Cloudflare Workers AI keys in .env.local</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
