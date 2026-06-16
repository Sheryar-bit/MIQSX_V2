"use client";

import { useState } from "react";
import { Globe, Sparkles, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface CaptionResult {
  english: { caption: string; hashtags: string[]; charCount: number };
  urdu: { caption: string; note: string };
  romanUrdu: { caption: string; note: string };
}

const PLATFORMS = ["instagram", "facebook", "linkedin", "twitter", "whatsapp"] as const;
const POST_TYPES = ["product launch", "behind the scenes", "quote", "offer/sale", "milestone", "educational", "festive"] as const;

function CaptionBox({ title, content, lang, note }: { title: string; content: string; lang: string; note?: string }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm text-text">{title}</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-surface-2 border border-border text-text-dim">{lang}</span>
        </div>
        <button
          onClick={copy}
          className="p-1.5 rounded-lg hover:bg-surface-2 transition-colors"
        >
          {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4 text-text-dim" />}
        </button>
      </div>
      <p
        className={cn(
          "text-sm text-text leading-relaxed whitespace-pre-wrap",
          lang === "اردو" && "text-right font-medium text-base"
        )}
        dir={lang === "اردو" ? "rtl" : "ltr"}
      >
        {content}
      </p>
      {note && <p className="text-xs text-text-dim mt-2 italic">{note}</p>}
    </div>
  );
}

export default function CaptionsPage() {
  const [topic, setTopic] = useState("");
  const [brandName, setBrandName] = useState("");
  const [platform, setPlatform] = useState<string>("instagram");
  const [postType, setPostType] = useState<string>("product launch");
  const [result, setResult] = useState<CaptionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function generate() {
    if (!topic.trim()) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/generate/captions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, brandName, platform, postType }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data.captions);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Generation failed");
    }
    setLoading(false);
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8 flex items-center gap-3">
        <Globe className="h-6 w-6 text-success" />
        <div>
          <h1 className="text-3xl font-bold text-text">Trilingual Captions</h1>
          <p className="text-text-muted text-sm mt-0.5">
            One topic → English + <span className="font-urdu">اردو</span> + Roman Urdu — in your brand voice
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-6 mb-6 space-y-4">
        <Textarea
          label="What's this post about? *"
          placeholder="e.g. We just launched our new summer collection with 5 limited-edition fragrances, handcrafted in Lahore"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="min-h-[80px]"
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Brand name"
            placeholder="e.g. Itr House"
            value={brandName}
            onChange={(e) => setBrandName(e.target.value)}
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-muted">Platform</label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="h-10 rounded-xl border border-border bg-surface px-3 text-sm text-text focus:outline-none focus:border-primary"
            >
              {PLATFORMS.map((p) => (
                <option key={p} value={p} className="capitalize">{p.charAt(0).toUpperCase() + p.slice(1)}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-muted">Post type</label>
            <select
              value={postType}
              onChange={(e) => setPostType(e.target.value)}
              className="h-10 rounded-xl border border-border bg-surface px-3 text-sm text-text focus:outline-none focus:border-primary"
            >
              {POST_TYPES.map((p) => (
                <option key={p} value={p} className="capitalize">{p.charAt(0).toUpperCase() + p.slice(1)}</option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <p className="text-sm text-error bg-error/10 border border-error/20 rounded-xl px-4 py-3">{error}</p>
        )}

        <Button onClick={generate} loading={loading} disabled={!topic.trim()} size="lg">
          <Sparkles className="h-4 w-4" />
          {loading ? "Writing in 3 languages..." : "Generate trilingual captions"}
        </Button>
      </div>

      {result && (
        <div className="space-y-4 animate-fade-in">
          <CaptionBox
            title="English"
            lang="EN"
            content={result.english?.caption || ""}
          />
          <CaptionBox
            title="Urdu"
            lang="اردو"
            content={result.urdu?.caption || ""}
            note={result.urdu?.note}
          />
          <CaptionBox
            title="Roman Urdu"
            lang="Roman"
            content={result.romanUrdu?.caption || ""}
            note={result.romanUrdu?.note}
          />
        </div>
      )}
    </div>
  );
}
