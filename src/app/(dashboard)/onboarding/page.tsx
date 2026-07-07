"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { ChatMessage } from "@/types/brand";

const TOTAL_STEPS = 10;

const WELCOME = `Hi! I'm your AI Brand Strategist. I'm going to ask you 10 questions to build your complete Brand DNA — the structured foundation that keeps every asset you create consistent.

This takes about 5 minutes. Let's start:

What's your brand name, and what inspired it?`;

export default function OnboardingPage() {
  const router = useRouter();
  const [brandId, setBrandId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: WELCOME },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [dnaComplete, setDnaComplete] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingText]);

  useEffect(() => {
    if (!loading) inputRef.current?.focus();
  }, [loading]);

  async function createBrand(firstMessage: string) {
    const name = firstMessage.split(/\s+/).slice(0, 3).join(" ") || "My Brand";
    try {
      const res = await fetch("/api/brand", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description: firstMessage }),
      });
      const data = await res.json();
      if (data.brand?._id) return data.brand._id as string;
    } catch { /* fall through */ }
    return "DEMO";
  }

  async function sendMessage() {
    const userMsg = input.trim();
    if (!userMsg || loading) return;
    setInput("");

    const newMessages: ChatMessage[] = [...messages, { role: "user", content: userMsg }];
    setMessages(newMessages);
    setLoading(true);
    setStreamingText("");

    let bid = brandId;
    if (!bid) {
      bid = await createBrand(userMsg);
      setBrandId(bid);
    }

    const history = newMessages.map((m) => ({ role: m.role, content: m.content }));

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ brandId: bid, message: userMsg, history: history.slice(0, -1) }),
    });

    if (!res.body) { setLoading(false); return; }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let accumulated = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split("\n");
      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const payload = line.slice(6);
        if (payload === "[DONE]") {
          setMessages((prev) => [...prev, { role: "assistant", content: accumulated }]);
          setStreamingText("");
          setStep((s) => Math.min(s + 1, TOTAL_STEPS));
          break;
        }
        try {
          const { text, dnaComplete: done } = JSON.parse(payload);
          if (text) { accumulated += text; setStreamingText(accumulated); }
          if (done) setDnaComplete(true);
        } catch { /* ignore */ }
      }
    }

    setLoading(false);
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  function autosize(el: HTMLTextAreaElement) {
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 140) + "px";
  }

  const progressPct = Math.round((dnaComplete ? TOTAL_STEPS : step) / TOTAL_STEPS * 100);

  /* ---- DNA Complete screen ---- */
  if (dnaComplete) {
    const isDemo = brandId === "DEMO";
    return (
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "clamp(32px, 6vh, 80px) 24px" }}>
        <div style={{ animation: "nb-pop .6s cubic-bezier(.34,1.56,.64,1) both", width: "min(460px, 100%)", borderRadius: 22, border: "1px solid var(--line)", background: "var(--surface)", boxShadow: "0 30px 70px -34px rgba(0,0,0,.5)", padding: 26, textAlign: "center", position: "relative", overflow: "hidden" }}>
          <svg aria-hidden="true" width="20" height="20" viewBox="0 0 40 40" fill="var(--terra)" style={{ position: "absolute", top: 16, right: 18, animation: "ds-twinkle 3s ease-in-out infinite" }}><path d="M20 0c3 13 7 17 20 20-13 3-17 7-20 20-3-13-7-17-20-20C13 17 17 13 20 0Z"/></svg>
          <span style={{ display: "inline-flex", width: 58, height: 58, borderRadius: 16, background: "var(--sig)", color: "var(--onSig)", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
            <svg width="28" height="28" viewBox="0 0 40 40" fill="currentColor"><path d="M20 0c3 13 7 17 20 20-13 3-17 7-20 20-3-13-7-17-20-20C13 17 17 13 20 0Z"/></svg>
          </span>
          <h2 style={{ fontFamily: "'General Sans'", fontWeight: 600, fontSize: 25, letterSpacing: "-0.02em", margin: "0 0 8px" }}>Your Brand DNA is{" "}
            <span style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic", fontWeight: 400, color: "var(--sig)" }}>ready.</span>
          </h2>
          <p style={{ fontFamily: "'Newsreader', serif", fontSize: 15, lineHeight: 1.55, color: "var(--muted)", margin: "0 0 18px" }}>
            {isDemo
              ? "Your Brand DNA has been synthesised. Connect MongoDB to save brands permanently — use the tools below to generate assets."
              : "Every asset you generate now flows from this core. You can refine it anytime."}
          </p>
          {isDemo && (
            <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "var(--muted)", background: "var(--surf2)", border: "1px solid var(--line)", borderRadius: 10, padding: "10px 14px", marginBottom: 16 }}>Demo mode — brand not persisted. Add MONGODB_URI to enable saving.</p>
          )}
          <div style={{ display: "flex", gap: 7, marginBottom: 20 }}>
            {["var(--terra)", "#E0A93C", "var(--sig)", "var(--ink)"].map((c, i) => (
              <span key={i} style={{ flex: 1, height: 34, borderRadius: 8, background: c }} />
            ))}
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <button
              onClick={() => router.push("/generate/taglines")}
              style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "13px 22px", borderRadius: 999, border: "none", background: "var(--sig)", color: "var(--onSig)", fontFamily: "'General Sans'", fontWeight: 600, fontSize: 15, cursor: "pointer" }}
            >
              Generate Taglines
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
            </button>
            {!isDemo && (
              <button
                onClick={() => router.push(`/brand/${brandId}`)}
                style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "13px 22px", borderRadius: 999, border: "1px solid var(--line)", background: "var(--surface)", color: "var(--ink)", fontFamily: "'General Sans'", fontWeight: 600, fontSize: 15, cursor: "pointer" }}
              >
                View Brand DNA
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* ---- Main chat UI ---- */
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>

      {/* Header */}
      <div style={{ position: "sticky", top: 0, zIndex: 20, borderBottom: "1px solid var(--line)", background: "color-mix(in oklab, var(--bg) 94%, transparent)", backdropFilter: "blur(14px)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px clamp(20px, 4vw, 44px)" }}>
          <button
            onClick={() => router.push("/dashboard")}
            aria-label="Back"
            style={{ flex: "0 0 auto", width: 38, height: 38, borderRadius: 10, border: "1px solid var(--line)", background: "var(--surface)", color: "var(--ink)", display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <span style={{ flex: "0 0 auto", width: 40, height: 40, borderRadius: 11, background: "var(--sig)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="20" height="20" viewBox="0 0 40 40" fill="var(--onSig)"><path d="M20 0c3 13 7 17 20 20-13 3-17 7-20 20-3-13-7-17-20-20C13 17 17 13 20 0Z"/></svg>
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: "'General Sans'", fontWeight: 700, fontSize: 17, letterSpacing: "-0.01em", display: "flex", alignItems: "center", gap: 8 }}>
              AI Brand Strategist
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, fontWeight: 500, letterSpacing: ".08em", color: "var(--leaf)", background: "color-mix(in oklab, var(--leaf) 14%, transparent)", padding: "3px 8px", borderRadius: 999 }}>ONLINE</span>
            </div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
              Question {Math.min(step + 1, TOTAL_STEPS)} of {TOTAL_STEPS}
            </div>
          </div>
        </div>
        {/* Progress bar */}
        <div style={{ height: 4, background: "var(--surf2)" }}>
          <div style={{ height: "100%", width: `${progressPct}%`, background: "linear-gradient(90deg, var(--sig), var(--leaf))", transition: "width .5s cubic-bezier(.2,.7,.2,1)" }} />
        </div>
      </div>

      {/* Messages */}
      <div className="ds-scroll" style={{ minHeight: "calc(100vh - 340px)", padding: "clamp(22px, 4vh, 40px) clamp(16px, 4vw, 44px)" }}>
        <div style={{ maxWidth: 760, margin: "0 auto", display: "flex", flexDirection: "column", gap: 18 }}>

          {messages.map((msg, i) => {
            const isAI = msg.role === "assistant";
            return (
              <div key={i} className="nb-msg" style={{ display: "flex", gap: 12, flexDirection: isAI ? "row" : "row-reverse" }}>
                <span style={{ flex: "0 0 auto", width: 34, height: 34, borderRadius: "50%", background: isAI ? "var(--sig)" : "var(--terra)", color: isAI ? "var(--onSig)" : "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontFamily: "'General Sans'", fontWeight: 700, fontSize: 13 }}>
                  {isAI ? <svg width="17" height="17" viewBox="0 0 40 40" fill="currentColor"><path d="M20 0c3 13 7 17 20 20-13 3-17 7-20 20-3-13-7-17-20-20C13 17 17 13 20 0Z"/></svg> : "U"}
                </span>
                <div style={{ maxWidth: "78%", background: isAI ? "var(--surface)" : "var(--sig)", color: isAI ? "var(--ink)" : "var(--onSig)", border: `1px solid ${isAI ? "var(--line)" : "var(--sig)"}`, borderRadius: isAI ? "4px 16px 16px 16px" : "16px 4px 16px 16px", padding: "14px 17px", fontSize: 15.5, lineHeight: 1.55, whiteSpace: "pre-wrap" }}>
                  {msg.content}
                </div>
              </div>
            );
          })}

          {/* Streaming text */}
          {streamingText && (
            <div className="nb-msg" style={{ display: "flex", gap: 12 }}>
              <span style={{ flex: "0 0 auto", width: 34, height: 34, borderRadius: "50%", background: "var(--sig)", color: "var(--onSig)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="17" height="17" viewBox="0 0 40 40" fill="currentColor"><path d="M20 0c3 13 7 17 20 20-13 3-17 7-20 20-3-13-7-17-20-20C13 17 17 13 20 0Z"/></svg>
              </span>
              <div style={{ maxWidth: "78%", background: "var(--surface)", color: "var(--ink)", border: "1px solid var(--line)", borderRadius: "4px 16px 16px 16px", padding: "14px 17px", fontSize: 15.5, lineHeight: 1.55, whiteSpace: "pre-wrap" }}>
                {streamingText}
                <span style={{ display: "inline-block", width: 2, height: 16, background: "var(--sig)", marginLeft: 2, animation: "nb-blink 1.2s ease-in-out infinite" }} />
              </div>
            </div>
          )}

          {/* Typing indicator */}
          {loading && !streamingText && (
            <div className="nb-msg" style={{ display: "flex", gap: 12 }}>
              <span style={{ flex: "0 0 auto", width: 34, height: 34, borderRadius: "50%", background: "var(--sig)", color: "var(--onSig)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="17" height="17" viewBox="0 0 40 40" fill="currentColor"><path d="M20 0c3 13 7 17 20 20-13 3-17 7-20 20-3-13-7-17-20-20C13 17 17 13 20 0Z"/></svg>
              </span>
              <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "4px 16px 16px 16px", padding: "15px 18px", display: "flex", gap: 5 }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--muted)", animation: "nb-blink 1.2s ease-in-out infinite" }} />
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--muted)", animation: "nb-blink 1.2s ease-in-out infinite .2s" }} />
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--muted)", animation: "nb-blink 1.2s ease-in-out infinite .4s" }} />
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Composer */}
      <div style={{ position: "sticky", bottom: 0, zIndex: 20, borderTop: "1px solid var(--line)", background: "color-mix(in oklab, var(--bg) 94%, transparent)", backdropFilter: "blur(14px)", padding: "14px clamp(16px, 4vw, 44px) 18px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 10, background: "var(--field)", border: "1px solid var(--line)", borderRadius: 16, padding: "8px 8px 8px 16px" }}>
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              onChange={(e) => { setInput(e.target.value); autosize(e.target); }}
              onKeyDown={handleKey}
              placeholder="Type your answer…"
              disabled={loading}
              style={{ flex: 1, resize: "none", border: "none", outline: "none", background: "none", color: "var(--ink)", fontFamily: "'General Sans', sans-serif", fontSize: 15.5, lineHeight: 1.5, maxHeight: 140, padding: "7px 0", opacity: loading ? 0.5 : 1 }}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              aria-label="Send"
              style={{ flex: "0 0 auto", width: 42, height: 42, borderRadius: 12, border: "none", background: !input.trim() || loading ? "var(--surf2)" : "var(--sig)", color: !input.trim() || loading ? "var(--muted)" : "var(--onSig)", cursor: !input.trim() || loading ? "not-allowed" : "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" }}
            >
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4z"/></svg>
            </button>
          </div>
          <div style={{ textAlign: "center", fontFamily: "'JetBrains Mono', monospace", fontSize: 10.5, color: "var(--muted)", marginTop: 8 }}>Press Enter to send · Shift+Enter for new line</div>
        </div>
      </div>
    </div>
  );
}
