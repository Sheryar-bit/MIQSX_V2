"use client";

import { useState } from "react";
import { Type, CheckCircle, XCircle, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface NameResult {
  name: string;
  rationale: string;
  type: string;
  domainCom: { available: boolean; checked: boolean };
  domainPk: { available: boolean; checked: boolean };
}

function AvailBadge({ available, label }: { available: boolean; label: string }) {
  return (
    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${
      available ? "bg-success/10 text-success border border-success/20" : "bg-error/10 text-error border border-error/20"
    }`}>
      {available ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
      {label}
    </span>
  );
}

export default function NamesPage() {
  const [keywords, setKeywords] = useState("");
  const [industry, setIndustry] = useState("");
  const [style, setStyle] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<NameResult[] | null>(null);
  const [error, setError] = useState("");

  async function generate() {
    if (!keywords.trim() && !industry.trim()) return;
    setLoading(true);
    setError("");
    setResults(null);

    try {
      const res = await fetch("/api/names", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keywords, industry, style }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResults(data.names);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Generation failed");
    }
    setLoading(false);
  }

  const typeColors: Record<string, string> = {
    invented: "bg-primary/10 text-primary-light border-primary/20",
    descriptive: "bg-accent/10 text-accent border-accent/20",
    evocative: "bg-success/10 text-success border-success/20",
    founder: "bg-error/10 text-error border-error/20",
    acronym: "bg-border text-text-muted",
  };

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Type className="h-6 w-6 text-primary-light" />
          <h1 className="text-3xl font-bold text-text">Brand Name Generator</h1>
        </div>
        <p className="text-text-muted">
          Generate 10 unique, brandable names and instantly check .com and .pk domain availability.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <Input
            label="Keywords / brand essence"
            placeholder="e.g., fast, clean, digital"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
          />
          <Input
            label="Industry"
            placeholder="e.g., SaaS, F&B, Fashion"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
          />
          <Input
            label="Naming style"
            placeholder="e.g., modern, Urdu-inspired"
            value={style}
            onChange={(e) => setStyle(e.target.value)}
          />
        </div>
        {error && (
          <p className="text-sm text-error bg-error/10 border border-error/20 rounded-xl px-4 py-3 mb-4">{error}</p>
        )}
        <Button onClick={generate} loading={loading} disabled={!keywords.trim() && !industry.trim()}>
          <Search className="h-4 w-4" />
          {loading ? "Generating + checking domains..." : "Generate 10 names"}
        </Button>
      </div>

      {results && (
        <div className="space-y-3 animate-fade-in">
          <p className="text-sm text-text-dim mb-4">
            {results.filter((n) => n.domainCom?.available).length} of {results.length} have .com available
          </p>
          {results.map((n, i) => (
            <div
              key={i}
              className="rounded-2xl border border-border bg-surface p-5 hover:border-primary/30 transition-all duration-200"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-bold text-text">{n.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${typeColors[n.type] || typeColors.acronym}`}>
                      {n.type}
                    </span>
                  </div>
                  <p className="text-sm text-text-muted">{n.rationale}</p>
                </div>
                <div className="flex flex-col gap-1.5 flex-shrink-0">
                  {n.domainCom?.checked && (
                    <AvailBadge available={n.domainCom.available} label=".com" />
                  )}
                  {n.domainPk?.checked && (
                    <AvailBadge available={n.domainPk.available} label=".pk" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
