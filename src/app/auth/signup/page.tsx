"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Zap, User, Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(k: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed");
        setLoading(false);
        return;
      }

      await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });
      const callbackUrl = new URLSearchParams(window.location.search).get("callbackUrl");
      router.push(callbackUrl || "/onboarding");
    } catch {
      setError("Something went wrong. Try again.");
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
          <h1 className="text-2xl font-bold text-text mb-1">Build your Brand DNA</h1>
          <p className="text-text-muted text-sm mb-8">Free forever for 1 brand. No credit card.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="name"
              label="Your name"
              placeholder="Ali Hassan"
              icon={<User className="h-4 w-4" />}
              value={form.name}
              onChange={update("name")}
              required
            />
            <Input
              id="email"
              type="email"
              label="Email"
              placeholder="you@brand.com"
              icon={<Mail className="h-4 w-4" />}
              value={form.email}
              onChange={update("email")}
              required
            />
            <Input
              id="password"
              type="password"
              label="Password"
              placeholder="Min. 8 characters"
              icon={<Lock className="h-4 w-4" />}
              value={form.password}
              onChange={update("password")}
              minLength={8}
              required
            />

            {error && (
              <p className="text-sm text-error bg-error/10 border border-error/20 rounded-xl px-4 py-3">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full" loading={loading}>
              Create free account
            </Button>
          </form>

          <p className="text-center text-sm text-text-muted mt-6">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-primary-light hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
