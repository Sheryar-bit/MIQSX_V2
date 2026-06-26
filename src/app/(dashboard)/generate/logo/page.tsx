"use client";

import { useState } from "react";
import { PenTool, Download, RefreshCw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { ICON_CATEGORIES, FONT_OPTIONS, type IconName, type FontId } from "@/lib/svg-icons";
import type { LogoLayout } from "@/lib/logo-composer";

const LAYOUTS: { id: LogoLayout; label: string }[] = [
  { id: "horizontal", label: "Horizontal" },
  { id: "stacked", label: "Stacked" },
  { id: "icon-only", label: "Icon Only" },
  { id: "wordmark", label: "Wordmark" },
];

function SvgPreview({ svg, label }: { svg: string; label: string }) {
  function downloadSvg() {
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `logo-${label.toLowerCase()}.svg`;
    a.click();
  }

  return (
    <div className="rounded-2xl border border-border bg-surface-2 p-4">
      <p className="text-xs text-text-dim font-medium uppercase tracking-widest mb-3">{label}</p>
      <div
        className="flex items-center justify-center bg-white rounded-xl min-h-[120px] p-4"
        dangerouslySetInnerHTML={{ __html: svg }}
      />
      <Button variant="ghost" size="sm" onClick={downloadSvg} className="mt-3 w-full">
        <Download className="h-3.5 w-3.5" />
        Download SVG
      </Button>
    </div>
  );
}

export default function LogoGeneratorPage() {
  const [brandName, setBrandName] = useState("");
  const [tagline, setTagline] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#7C3AED");
  const [bgColor, setBgColor] = useState("transparent");
  const [selectedIcon, setSelectedIcon] = useState<IconName>("hexagon");
  const [selectedFont, setSelectedFont] = useState<FontId>("space-grotesk");
  const [activeLayout, setActiveLayout] = useState<LogoLayout | "all">("all");
  const [variants, setVariants] = useState<Record<string, string> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [aiImages, setAiImages] = useState<string[] | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");

  async function generate() {
    if (!brandName.trim()) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/generate/logo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandName,
          tagline,
          icon: selectedIcon,
          fontId: selectedFont,
          primaryColor,
          bgColor: bgColor === "transparent" ? undefined : bgColor,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setVariants(data.variants);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed");
    }
    setLoading(false);
  }

  async function generateAi() {
    if (!brandName.trim()) return;
    setAiLoading(true);
    setAiError("");
    setAiImages(null);

    try {
      const res = await fetch("/api/generate/logo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "ai",
          prompt: aiPrompt,
          brandName,
          tagline,
          icon: selectedIcon,
          primaryColor,
          bgColor: bgColor === "transparent" ? undefined : bgColor,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setAiImages(data.images);
    } catch (e: unknown) {
      setAiError(e instanceof Error ? e.message : "AI generation failed");
    }
    setAiLoading(false);
  }

  const displayedVariants = variants
    ? activeLayout === "all"
      ? Object.entries(variants)
      : Object.entries(variants).filter(([key]) => key === activeLayout)
    : [];

  return (
    <div className="p-8 max-w-6xl">
      <div className="mb-8 flex items-center gap-3">
        <PenTool className="h-6 w-6 text-primary-light" />
        <div>
          <h1 className="text-3xl font-bold text-text">Logo Generator</h1>
          <p className="text-text-muted text-sm mt-0.5">
            Crisp vector SVG logos — plus AI concepts from FLUX on Cloudflare Workers AI.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Controls */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-border bg-surface p-6 space-y-4">
            <h2 className="font-semibold text-text text-sm uppercase tracking-widest text-text-dim">Brand Info</h2>
            <Input
              label="Brand name *"
              placeholder="e.g. Kiran Studio"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
            />
            <Input
              label="Tagline (optional)"
              placeholder="e.g. Build what matters"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
            />
            <div>
              <Textarea
                label="AI logo prompt (optional)"
                placeholder={'Describe your ideal logo for AI concepts — e.g. "a minimal geometric fox head inside a hexagon, bold and friendly"'}
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                className="min-h-[70px]"
              />
              <p className="text-xs text-text-dim mt-1.5">
                Guides the <span className="text-text-muted">Generate AI concepts</span> button only. Leave blank to use the selected icon. Vector variants ignore this.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-text-muted">Primary color</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="h-9 w-9 rounded-lg border border-border cursor-pointer bg-transparent"
                  />
                  <input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="flex-1 h-9 rounded-lg border border-border bg-surface px-3 text-xs font-mono text-text focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-text-muted">Background</label>
                <select
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="h-9 rounded-lg border border-border bg-surface px-3 text-sm text-text focus:outline-none focus:border-primary"
                >
                  <option value="transparent">Transparent</option>
                  <option value="#ffffff">White</option>
                  <option value="#000000">Black</option>
                  <option value="#F8F8F8">Off-white</option>
                </select>
              </div>
            </div>
          </div>

          {/* Font picker */}
          <div className="rounded-2xl border border-border bg-surface p-6">
            <h2 className="font-semibold text-sm uppercase tracking-widest text-text-dim mb-3">Font</h2>
            <div className="space-y-2">
              {FONT_OPTIONS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setSelectedFont(f.id)}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-all",
                    selectedFont === f.id
                      ? "bg-primary/15 border border-primary/30 text-primary-light"
                      : "border border-transparent hover:bg-surface-2 text-text-muted"
                  )}
                >
                  <span>{f.label}</span>
                  <span className="text-xs opacity-50">{f.style}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Icon picker */}
          <div className="rounded-2xl border border-border bg-surface p-6">
            <h2 className="font-semibold text-sm uppercase tracking-widest text-text-dim mb-3">Icon Mark</h2>
            <div className="space-y-4">
              {Object.entries(ICON_CATEGORIES).map(([category, icons]) => (
                <div key={category}>
                  <p className="text-xs text-text-dim mb-2">{category}</p>
                  <div className="flex flex-wrap gap-2">
                    {icons.map((icon) => (
                      <button
                        key={icon}
                        onClick={() => setSelectedIcon(icon)}
                        className={cn(
                          "text-xs px-2.5 py-1 rounded-lg border transition-all",
                          selectedIcon === icon
                            ? "border-primary/40 bg-primary/15 text-primary-light"
                            : "border-border text-text-muted hover:border-border-light hover:text-text"
                        )}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-sm text-error bg-error/10 border border-error/20 rounded-xl px-4 py-3">{error}</p>
          )}

          <div className="space-y-2">
            <Button onClick={generate} loading={loading} disabled={!brandName.trim()} className="w-full" size="lg">
              <RefreshCw className="h-4 w-4" />
              {loading ? "Composing logo..." : "Generate vector variants"}
            </Button>
            <Button
              onClick={generateAi}
              loading={aiLoading}
              disabled={!brandName.trim()}
              variant="outline"
              className="w-full"
              size="lg"
            >
              <Sparkles className="h-4 w-4" />
              {aiLoading ? "Generating with FLUX..." : "Generate AI concepts"}
            </Button>
            {aiError && (
              <p className="text-sm text-error bg-error/10 border border-error/20 rounded-xl px-4 py-3">{aiError}</p>
            )}
          </div>
        </div>

        {/* Preview */}
        <div className="lg:col-span-3 space-y-6">
          {/* AI concepts (FLUX) */}
          {(aiImages || aiLoading) && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-4 w-4 text-primary-light" />
                <h3 className="font-semibold text-sm text-text">
                  AI Concepts <span className="text-text-dim font-normal">· FLUX</span>
                </h3>
              </div>
              {aiLoading && !aiImages ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="rounded-2xl border border-border bg-surface-2 aspect-square animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {aiImages?.map((src, i) => (
                    <div key={i} className="rounded-2xl border border-border bg-surface-2 overflow-hidden">
                      <img src={src} alt={`AI logo concept ${i + 1}`} className="w-full bg-white" />
                      <a
                        href={src}
                        download={`logo-ai-${i + 1}.png`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block"
                      >
                        <Button variant="ghost" size="sm" className="w-full rounded-none">
                          <Download className="h-3.5 w-3.5" />
                          Download
                        </Button>
                      </a>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-xs text-text-dim mt-2">
                AI concepts are raster ideas — the brand name may not be spelled exactly. Use the vector variants for production.
              </p>
            </div>
          )}

          {/* Vector SVG variants */}
          {variants ? (
            <div>
              {/* Layout filter tabs */}
              <div className="flex gap-2 mb-5 flex-wrap">
                {(["all", ...LAYOUTS.map((l) => l.id)] as const).map((l) => (
                  <button
                    key={l}
                    onClick={() => setActiveLayout(l as LogoLayout | "all")}
                    className={cn(
                      "text-xs px-3 py-1.5 rounded-lg border transition-all capitalize",
                      activeLayout === l
                        ? "bg-primary/15 border-primary/30 text-primary-light"
                        : "border-border text-text-muted hover:text-text"
                    )}
                  >
                    {l === "all" ? "All layouts" : l}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {displayedVariants.map(([layout, svg]) => (
                  <SvgPreview key={layout} svg={svg} label={layout} />
                ))}
              </div>
            </div>
          ) : (
            !aiImages &&
            !aiLoading && (
              <div className="rounded-2xl border border-dashed border-border h-full min-h-[400px] flex items-center justify-center">
                <div className="text-center">
                  <PenTool className="h-12 w-12 text-text-dim mx-auto mb-3" />
                  <p className="text-text-muted text-sm">Configure your logo on the left and hit Generate</p>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
