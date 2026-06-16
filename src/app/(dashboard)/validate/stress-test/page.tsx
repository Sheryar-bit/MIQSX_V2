"use client";

import { useState, useRef } from "react";
import { Zap, Upload, X, CheckCircle, XCircle } from "lucide-react";

interface StressResult {
  meta: { width: number; height: number; format: string };
  results: Record<string, string>;
  dominantColors: string[];
  wcagChecks: { pair: string; ratio: number; passAA: boolean; passAAA: boolean }[];
  checks: { name: string; pass: boolean; detail: string }[];
}

// Colorblind SVG filter matrices
const COLORBLIND_FILTERS = `
<svg xmlns="http://www.w3.org/2000/svg" style="display:none">
  <defs>
    <filter id="deuteranopia">
      <feColorMatrix type="matrix" values="
        0.367 0.861 -0.228 0 0
        0.280 0.673  0.047 0 0
       -0.012 0.043  0.969 0 0
        0 0 0 1 0"/>
    </filter>
    <filter id="protanopia">
      <feColorMatrix type="matrix" values="
        0.152 1.053 -0.205 0 0
        0.115 0.786  0.099 0 0
       -0.004 -0.048 1.052 0 0
        0 0 0 1 0"/>
    </filter>
    <filter id="tritanopia">
      <feColorMatrix type="matrix" values="
        1.256 -0.077 -0.180 0 0
       -0.078  0.931  0.148 0 0
        0.005  0.691  0.304 0 0
        0 0 0 1 0"/>
    </filter>
  </defs>
</svg>`;

function ImgPreview({
  src,
  label,
  cssFilter,
  svgFilter,
  small,
}: {
  src: string;
  label: string;
  cssFilter?: string;
  svgFilter?: string;
  small?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs text-text-dim font-medium">{label}</p>
      <div
        className={`rounded-xl overflow-hidden border border-border bg-checkerboard flex items-center justify-center ${small ? "h-20" : "h-32"}`}
        style={{ background: "repeating-conic-gradient(#1E2435 0% 25%, #171B26 0% 50%) 0 0 / 16px 16px" }}
      >
        <img
          src={`data:image/png;base64,${src}`}
          alt={label}
          className={small ? "h-16 w-16 object-contain" : "h-28 w-full object-contain"}
          style={{ filter: cssFilter, ...(svgFilter ? { filter: `url(#${svgFilter}) ${cssFilter || ""}` } : {}) }}
        />
      </div>
    </div>
  );
}

export default function StressTestPage() {
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<StressResult | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setImagePreview(dataUrl);
      setImageBase64(dataUrl.split(",")[1]);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!imageBase64) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/validate/stress-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64 }),
      });
      setResult(await res.json());
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Hidden SVG filter defs */}
      <div dangerouslySetInnerHTML={{ __html: COLORBLIND_FILTERS }} />

      <div className="mb-8 flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-green-500/20 flex items-center justify-center">
          <Zap className="h-5 w-5 text-green-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-text">Logo Stress Test</h1>
          <p className="text-sm text-text-muted">Favicon, B&W, colorblind simulations + WCAG contrast</p>
        </div>
      </div>

      {/* Upload */}
      <div className="rounded-2xl bg-surface-2 border border-border p-6 mb-6">
        {imagePreview ? (
          <div className="flex items-center gap-4">
            <div className="relative h-24 w-24 rounded-xl overflow-hidden border border-border flex-shrink-0"
              style={{ background: "repeating-conic-gradient(#1E2435 0% 25%, #171B26 0% 50%) 0 0 / 16px 16px" }}>
              <img src={imagePreview} alt="logo" className="h-full w-full object-contain" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-text font-medium">Logo uploaded</p>
              <p className="text-xs text-text-dim mt-1">Ready to run stress tests</p>
            </div>
            <button onClick={() => { setImagePreview(null); setImageBase64(null); setResult(null); }}
              className="h-8 w-8 rounded-full bg-surface flex items-center justify-center hover:bg-surface-2">
              <X className="h-4 w-4 text-text-muted" />
            </button>
          </div>
        ) : (
          <button onClick={() => fileRef.current?.click()}
            className="w-full h-36 rounded-xl border-2 border-dashed border-border bg-surface hover:border-primary/40 flex flex-col items-center justify-center gap-2 transition-all">
            <Upload className="h-6 w-6 text-text-dim" />
            <p className="text-sm text-text-muted">Upload logo (PNG, SVG, WEBP)</p>
            <p className="text-xs text-text-dim">Transparent background recommended</p>
          </button>
        )}
        <input ref={fileRef} type="file" accept="image/*" className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />

        {imageBase64 && (
          <button onClick={handleSubmit} disabled={loading}
            className="mt-4 w-full py-2.5 rounded-xl bg-gradient-brand text-white text-sm font-semibold disabled:opacity-40 hover:opacity-90 transition-opacity">
            {loading ? "Running tests..." : "Run Stress Test"}
          </button>
        )}
      </div>

      {loading && (
        <div className="flex flex-col items-center py-12 gap-4">
          <div className="h-10 w-10 rounded-full border-2 border-green-400 border-t-transparent animate-spin" />
          <p className="text-text-dim text-sm">Running {7} tests...</p>
        </div>
      )}

      {result && (
        <div className="space-y-6">
          {/* Size simulations — using client-side previews of the original with CSS */}
          <div>
            <p className="text-xs font-semibold text-text-dim uppercase tracking-widest mb-3">Size Simulations</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {result.results.thumb && (
                <ImgPreview src={result.results.thumb} label="128px (App Icon)" />
              )}
              {result.results.favicon32 && (
                <ImgPreview src={result.results.favicon32} label="32px (Favicon)" small />
              )}
              {result.results.favicon16 && (
                <ImgPreview src={result.results.favicon16} label="16px (Tiny Favicon)" small />
              )}
              {result.results.pixelated && (
                <ImgPreview src={result.results.pixelated} label="Low Resolution" />
              )}
            </div>
          </div>

          {/* Appearance tests — CSS filters on original */}
          <div>
            <p className="text-xs font-semibold text-text-dim uppercase tracking-widest mb-3">Appearance Tests</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              <ImgPreview src={result.results.thumb || ""} label="Original" />
              {result.results.grayscale && (
                <ImgPreview src={result.results.grayscale} label="Grayscale (B&W)" />
              )}
              <ImgPreview src={result.results.thumb || ""} label="Inverted" cssFilter="invert(1)" />
              <ImgPreview src={result.results.thumb || ""} label="Deuteranopia" svgFilter="deuteranopia" />
              <ImgPreview src={result.results.thumb || ""} label="Protanopia" svgFilter="protanopia" />
            </div>
          </div>

          {/* Dominant colors */}
          {result.dominantColors?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-text-dim uppercase tracking-widest mb-3">Extracted Colors</p>
              <div className="flex gap-3 flex-wrap">
                {result.dominantColors.map((color, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg border border-border" style={{ backgroundColor: color }} />
                    <span className="text-xs font-mono text-text-muted">{color}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* WCAG */}
          {result.wcagChecks?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-text-dim uppercase tracking-widest mb-3">WCAG Contrast Ratios</p>
              <div className="space-y-2">
                {result.wcagChecks.map((c, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-surface-2 border border-border">
                    <span className="text-sm text-text-muted">{c.pair}</span>
                    <div className="flex items-center gap-4">
                      <span className="font-mono text-sm text-text">{c.ratio}:1</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.passAA ? "bg-green-500/15 text-green-400" : "bg-red-500/15 text-red-400"}`}>
                        AA {c.passAA ? "✓" : "✗"}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.passAAA ? "bg-green-500/15 text-green-400" : "bg-amber-500/15 text-amber-400"}`}>
                        AAA {c.passAAA ? "✓" : "✗"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Checks */}
          <div>
            <p className="text-xs font-semibold text-text-dim uppercase tracking-widest mb-3">Print-Ready Checks</p>
            <div className="space-y-2">
              {result.checks.map((c, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-surface-2 border border-border">
                  {c.pass
                    ? <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0 mt-0.5" />
                    : <XCircle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
                  }
                  <div>
                    <p className="text-sm font-medium text-text">{c.name}</p>
                    <p className="text-xs text-text-dim mt-0.5">{c.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
