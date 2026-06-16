"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Send, Sparkles, ArrowLeft, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
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
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingText]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [loading]);

  async function createBrand(firstMessage: string) {
    // Extract name from first message (heuristic)
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
    // MongoDB not connected — run in demo mode (AI still works, nothing is saved)
    return "DEMO";
  }

  async function sendMessage() {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
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
          if (text) {
            accumulated += text;
            setStreamingText(accumulated);
          }
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

  if (dnaComplete) {
    const isDemo = brandId === "DEMO";
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="h-20 w-20 rounded-full bg-success/10 border-2 border-success/30 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-9 w-9 text-success" />
          </div>
          <h1 className="text-3xl font-bold text-text mb-3">Brand DNA created!</h1>
          <p className="text-text-muted mb-4">
            {isDemo
              ? "Your Brand DNA has been synthesised. Connect MongoDB to save brands permanently — for now, use the tools below to generate assets."
              : "Your brand's complete DNA has been saved. Every asset you create will now be conditioned on this foundation."}
          </p>
          {isDemo && (
            <p className="text-xs text-text-dim mb-6 bg-surface-2 border border-border rounded-xl px-4 py-3">
              Demo mode — brand not persisted. Add MONGODB_URI to .env.local to enable saving.
            </p>
          )}
          <div className="flex gap-3 justify-center">
            <Button onClick={() => router.push("/generate/taglines")}>
              Generate Taglines
              <ArrowLeft className="h-4 w-4 rotate-180" />
            </Button>
            {!isDemo && (
              <Button variant="outline" onClick={() => router.push(`/brand/${brandId}`)}>
                View Brand DNA
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="border-b border-border bg-surface px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary-light" />
              <span className="font-semibold text-text text-sm">AI Brand Strategist</span>
            </div>
            <p className="text-xs text-text-dim">
              Question {Math.min(step + 1, TOTAL_STEPS)} of {TOTAL_STEPS}
            </p>
          </div>
        </div>
        <div className="w-48">
          <Progress value={step} max={TOTAL_STEPS} color="primary" />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6 chat-scrollbar">
        <div className="max-w-2xl mx-auto space-y-6">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
            >
              {msg.role === "assistant" && (
                <div className="h-8 w-8 rounded-full bg-gradient-brand flex-shrink-0 flex items-center justify-center mt-0.5">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-primary text-white rounded-tr-sm"
                    : "bg-surface-2 border border-border text-text rounded-tl-sm"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {/* Streaming */}
          {streamingText && (
            <div className="flex gap-3">
              <div className="h-8 w-8 rounded-full bg-gradient-brand flex-shrink-0 flex items-center justify-center mt-0.5">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <div className="max-w-[80%] rounded-2xl rounded-tl-sm px-4 py-3 text-sm leading-relaxed bg-surface-2 border border-border text-text">
                {streamingText}
                <span className="inline-block w-0.5 h-4 bg-primary ml-0.5 animate-typing" />
              </div>
            </div>
          )}

          {/* Typing indicator */}
          {loading && !streamingText && (
            <div className="flex gap-3">
              <div className="h-8 w-8 rounded-full bg-gradient-brand flex-shrink-0 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <div className="bg-surface-2 border border-border rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex gap-1">
                  <span className="h-2 w-2 rounded-full bg-text-dim animate-bounce [animation-delay:0ms]" />
                  <span className="h-2 w-2 rounded-full bg-text-dim animate-bounce [animation-delay:150ms]" />
                  <span className="h-2 w-2 rounded-full bg-text-dim animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-border bg-surface px-8 py-4">
        <div className="max-w-2xl mx-auto flex gap-3">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Type your answer..."
            disabled={loading}
            className="flex-1 h-12 rounded-xl border border-border bg-surface-2 px-4 text-sm text-text placeholder:text-text-dim focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all disabled:opacity-50"
          />
          <Button onClick={sendMessage} disabled={!input.trim() || loading} size="icon" className="h-12 w-12">
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-center text-xs text-text-dim mt-2">Press Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  );
}
