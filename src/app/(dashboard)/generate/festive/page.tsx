"use client";

import { useState } from "react";
import { Star, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const FESTIVALS = [
  { id: "eid", label: "Eid Mubarak", emoji: "🌙", desc: "Crescent moon, stars, golden palette" },
  { id: "ramadan", label: "Ramadan Mubarak", emoji: "🪔", desc: "Lantern, stars, purple & gold" },
  { id: "independence", label: "14 August", emoji: "🇵🇰", desc: "Pakistan flag — crescent & star, forest green" },
  { id: "new-year", label: "New Year", emoji: "🎉", desc: "Confetti, sparkles, celebratory" },
] as const;

export default function FestivePage() {
  const [brandName, setBrandName] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#7C3AED");
  const [selected, setSelected] = useState<string>("eid");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function generate() {
    if (!brandName.trim()) return;
    setLoading(true);
    setError("");
    setImageUrl(null);

    try {
      const res = await fetch("/api/generate/festive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ festival: selected, brandName, primaryColor }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setImageUrl(data.imageUrl);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Generation failed");
    }
    setLoading(false);
  }

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-8 flex items-center gap-3">
        <Star className="h-6 w-6 text-yellow-400" />
        <div>
          <h1 className="text-3xl font-bold text-text">Festive Variants</h1>
          <p className="text-text-muted text-sm mt-0.5">
            AI festive posters for Eid, Ramadan, 14 August & New Year — FLUX on Cloudflare Workers AI
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Controls */}
        <div className="space-y-5">
          <div className="rounded-2xl border border-border bg-surface p-6 space-y-4">
            <Input
              label="Brand name *"
              placeholder="e.g. Kiran Studio"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-text-muted">Brand primary color</label>
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
          </div>

          {/* Festival selector */}
          <div className="rounded-2xl border border-border bg-surface p-6">
            <h2 className="font-semibold text-sm uppercase tracking-widest text-text-dim mb-3">Festival</h2>
            <div className="space-y-2">
              {FESTIVALS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setSelected(f.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all",
                    selected === f.id
                      ? "border-primary/40 bg-primary/10"
                      : "border-border hover:bg-surface-2"
                  )}
                >
                  <span className="text-2xl">{f.emoji}</span>
                  <div>
                    <p className={cn("font-medium text-sm", selected === f.id ? "text-primary-light" : "text-text")}>
                      {f.label}
                    </p>
                    <p className="text-xs text-text-dim">{f.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-sm text-error bg-error/10 border border-error/20 rounded-xl px-4 py-3">{error}</p>
          )}

          <Button onClick={generate} loading={loading} disabled={!brandName.trim()} className="w-full" size="lg">
            <Star className="h-4 w-4" />
            {loading ? "Generating with FLUX..." : "Generate festive poster"}
          </Button>
        </div>

        {/* Preview */}
        <div>
          {imageUrl ? (
            <div className="rounded-2xl border border-border overflow-hidden">
              <img src={imageUrl} alt={`${selected} festive poster`} className="w-full" />
              <div className="p-4 bg-surface flex justify-between items-center">
                <span className="text-xs text-text-dim capitalize">
                  {FESTIVALS.find((f) => f.id === selected)?.label}
                </span>
                <a href={imageUrl} download={`festive-${selected}.png`} target="_blank" rel="noopener noreferrer">
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
                <Star className="h-14 w-14 text-text-dim mx-auto mb-3" />
                <p className="text-text-muted text-sm">Festive poster preview</p>
                <p className="text-xs text-text-dim mt-1">Enter brand name and pick a festival</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
