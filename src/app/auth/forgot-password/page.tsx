"use client";

import { useState } from "react";
import Link from "next/link";
import { Zap, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setSent(true);
    } catch {
      setSent(true); // generic — never reveal anything
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-xl bg-gradient-brand flex items-center justify-center">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="text-2xl font-bold">MIQSX</span>
          </Link>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-8">
          {sent ? (
            <div className="text-center space-y-3">
              <h1 className="text-2xl font-bold text-text">Check your inbox</h1>
              <p className="text-text-muted text-sm">
                If that email is registered, a password reset link is on its way. It expires in 1 hour.
              </p>
              <Link href="/auth/login" className="text-primary-light hover:underline text-sm inline-block mt-2">
                Back to sign in
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-text mb-1">Reset your password</h1>
              <p className="text-text-muted text-sm mb-8">We&apos;ll email you a reset link.</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  id="email"
                  type="email"
                  label="Email"
                  placeholder="you@brand.com"
                  icon={<Mail className="h-4 w-4" />}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Button type="submit" className="w-full" loading={loading}>
                  Send reset link
                </Button>
              </form>
              <p className="text-center text-sm text-text-muted mt-6">
                Remembered it?{" "}
                <Link href="/auth/login" className="text-primary-light hover:underline font-medium">
                  Sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
