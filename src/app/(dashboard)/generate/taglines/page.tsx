"use client";

import { useState } from "react";
import { Type, Sparkles, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Tagline {
  tagline: string;
  style: string;
  note: string;
}

const STYLE_COLORS: Record<string, string> = {
  bold: "bg-red-500/10 text-red-400 border-red-500/20",
  witty: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  aspirational: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  empathetic: "bg-green-500/10 text-green-400 border-green-500/20",
  minimalist: "bg-gray-500/10 text-gray-400 border-gray-500/20",
  action: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  "urdu-inspired": "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  cultural: "bg-purple-500/10 text-purple-400 border-purple-500/20",
};

function TaglineCard({ tagline, style, note }: Tagline) {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(tagline);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-5 hover:border-primary/30 transition-all group">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <p className="text-xl font-semibold text-text leading-snug mb-2">"{tagline}"</p>
          <p className="text-xs text-text-dim">{note}</p>
        </div>
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <span className={cn("text-xs px-2 py-0.5 rounded-full border font-medium", STYLE_COLORS[style] ?? STYLE_COLORS.bold)}>
            {style}
          </span>
          <button
            onClick={copy}
            className="p-1.5 rounded-lg hover:bg-surface-2 transition-colors opacity-0 group-hover:opacity-100"
          >
            {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4 text-text-dim" />}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TaglinesPage() {
  const [form, setForm] = useState({ brandName: "", industry: "", tone: "", audience: "", uniqueValue: "" });
  const [taglines, setTaglines] = useState<Tagline[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function update(k: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));
  }

  async function generate() {
    if (!form.brandName.trim()) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/generate/taglines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandName: form.brandName,
          industry: form.industry,
          tone: form.tone ? form.tone.split(",").map((t) => t.trim()) : [],
          audience: form.audience,
          uniqueValue: form.uniqueValue,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setTaglines(data.taglines);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Generation failed");
    }
    setLoading(false);
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8 flex items-center gap-3">
        <Type className="h-6 w-6 text-accent" />
        <div>
          <h1 className="text-3xl font-bold text-text">Tagline Generator</h1>
          <p className="text-text-muted text-sm mt-0.5">8 taglines across emotional styles — including Urdu-inspired options</p>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Brand name *"
            placeholder="e.g. Zindagi Organics"
            value={form.brandName}
            onChange={update("brandName")}
          />
          <Input
            label="Industry"
            placeholder="e.g. Organic food, SaaS, Fashion"
            value={form.industry}
            onChange={update("industry")}
          />
          <Input
            label="Tone descriptors"
            placeholder="e.g. bold, warm, playful (comma-separated)"
            value={form.tone}
            onChange={update("tone")}
          />
          <Input
            label="Target audience"
            placeholder="e.g. Urban Pakistani women 25–40"
            value={form.audience}
            onChange={update("audience")}
          />
          <Input
            label="Unique value"
            placeholder="e.g. Only brand using 100% desi ingredients"
            value={form.uniqueValue}
            onChange={update("uniqueValue")}
            className="md:col-span-2"
          />
        </div>

        {error && (
          <p className="mt-4 text-sm text-error bg-error/10 border border-error/20 rounded-xl px-4 py-3">{error}</p>
        )}

        <Button
          onClick={generate}
          loading={loading}
          disabled={!form.brandName.trim()}
          className="mt-5"
          size="lg"
        >
          <Sparkles className="h-4 w-4" />
          {loading ? "Writing taglines..." : "Generate 8 taglines"}
        </Button>
      </div>

      {taglines && (
        <div className="space-y-3 animate-fade-in">
          <p className="text-xs text-text-dim mb-2">{taglines.length} taglines generated · Click to copy</p>
          {taglines.map((t, i) => <TaglineCard key={i} {...t} />)}
        </div>
      )}
    </div>
  );
}
