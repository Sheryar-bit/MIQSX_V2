"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Zap, CheckCircle2, AlertCircle } from "lucide-react";

export default function VerifyEmailPage() {
  const [state, setState] = useState<"loading" | "ok" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token");
    if (!token) {
      setState("error");
      setMessage("No verification token found in the link.");
      return;
    }
    fetch("/api/auth/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then((r) => r.json().then((d) => ({ ok: r.ok, d })))
      .then(({ ok, d }) => {
        if (ok) setState("ok");
        else {
          setState("error");
          setMessage(d.error || "Verification failed.");
        }
      })
      .catch(() => {
        setState("error");
        setMessage("Network error.");
      });
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="h-10 w-10 rounded-xl bg-gradient-brand flex items-center justify-center">
            <Zap className="h-5 w-5 text-white" />
          </div>
        </div>

        {state === "loading" && <p className="text-text-muted">Verifying your email…</p>}

        {state === "ok" && (
          <div className="space-y-3">
            <CheckCircle2 className="h-10 w-10 text-success mx-auto" />
            <h1 className="text-xl font-bold text-text">Email verified</h1>
            <Link href="/auth/login" className="text-primary-light hover:underline text-sm">
              Continue to sign in
            </Link>
          </div>
        )}

        {state === "error" && (
          <div className="space-y-3">
            <AlertCircle className="h-10 w-10 text-error mx-auto" />
            <h1 className="text-xl font-bold text-text">Couldn&apos;t verify</h1>
            <p className="text-text-muted text-sm">{message}</p>
            <Link href="/dashboard" className="text-primary-light hover:underline text-sm">
              Go to dashboard
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
