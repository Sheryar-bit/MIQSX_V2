"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Zap, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    setToken(new URLSearchParams(window.location.search).get("token"));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const d = await res.json();
      if (!res.ok) {
        setError(d.error || "Could not reset password.");
      } else {
        setDone(true);
        setTimeout(() => router.push("/auth/login"), 1500);
      }
    } catch {
      setError("Network error.");
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
          {done ? (
            <div className="text-center space-y-3">
              <h1 className="text-2xl font-bold text-text">Password updated</h1>
              <p className="text-text-muted text-sm">Redirecting you to sign in…</p>
            </div>
          ) : token === null ? (
            <div className="text-center space-y-3">
              <h1 className="text-xl font-bold text-text">Invalid link</h1>
              <p className="text-text-muted text-sm">This reset link is missing its token.</p>
              <Link href="/auth/forgot-password" className="text-primary-light hover:underline text-sm">
                Request a new one
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-text mb-1">Set a new password</h1>
              <p className="text-text-muted text-sm mb-8">Choose a strong password (min. 8 characters).</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  id="password"
                  type="password"
                  label="New password"
                  placeholder="••••••••"
                  icon={<Lock className="h-4 w-4" />}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={8}
                  required
                />
                {error && (
                  <p className="text-sm text-error bg-error/10 border border-error/20 rounded-xl px-4 py-3">
                    {error}
                  </p>
                )}
                <Button type="submit" className="w-full" loading={loading}>
                  Update password
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
