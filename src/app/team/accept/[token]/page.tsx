"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Users, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface InviteInfo {
  email: string;
  role: string;
  status: string;
  inviterName: string;
  valid: boolean;
}

export default function AcceptInvitePage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const { status: authStatus } = useSession();

  const [invite, setInvite] = useState<InviteInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [accepting, setAccepting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    fetch(`/api/team/invite/${token}`)
      .then((r) => r.json())
      .then((d) => (d.error ? setError(d.error) : setInvite(d)))
      .catch(() => setError("Could not load this invite."))
      .finally(() => setLoading(false));
  }, [token]);

  async function accept() {
    setAccepting(true);
    setError("");
    try {
      const res = await fetch(`/api/team/invite/${token}`, { method: "POST" });
      const d = await res.json();
      if (!res.ok) {
        setError(d.error || "Could not accept the invite.");
      } else {
        setDone(true);
        setTimeout(() => router.push("/dashboard"), 1500);
      }
    } catch {
      setError("Network error.");
    } finally {
      setAccepting(false);
    }
  }

  const callbackUrl = `/team/accept/${token}`;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-8 text-center">
        <div className="flex justify-center mb-5">
          <div className="h-12 w-12 rounded-xl bg-gradient-brand flex items-center justify-center">
            <Users className="h-6 w-6 text-white" />
          </div>
        </div>

        {loading ? (
          <p className="text-text-muted">Loading invite…</p>
        ) : error && !invite ? (
          <div className="space-y-3">
            <AlertCircle className="h-8 w-8 text-error mx-auto" />
            <p className="text-text">{error}</p>
            <Link href="/dashboard" className="text-primary-light hover:underline text-sm">
              Go to dashboard
            </Link>
          </div>
        ) : done ? (
          <div className="space-y-3">
            <CheckCircle2 className="h-10 w-10 text-success mx-auto" />
            <h1 className="text-xl font-bold text-text">You&apos;re in!</h1>
            <p className="text-text-muted text-sm">Redirecting you to the dashboard…</p>
          </div>
        ) : invite && !invite.valid ? (
          <div className="space-y-3">
            <AlertCircle className="h-8 w-8 text-error mx-auto" />
            <p className="text-text">
              This invite is {invite.status === "pending" ? "no longer valid" : invite.status}.
            </p>
            <Link href="/dashboard" className="text-primary-light hover:underline text-sm">
              Go to dashboard
            </Link>
          </div>
        ) : invite ? (
          <div className="space-y-5">
            <div>
              <h1 className="text-xl font-bold text-text">Join a workspace</h1>
              <p className="text-text-muted text-sm mt-2">
                <strong className="text-text">{invite.inviterName}</strong> invited you to collaborate
                on MIQSX as a <strong className="text-primary-light capitalize">{invite.role}</strong>.
              </p>
            </div>

            {error && (
              <p className="text-sm text-error bg-error/10 border border-error/20 rounded-xl px-4 py-3">
                {error}
              </p>
            )}

            {authStatus === "authenticated" ? (
              <Button className="w-full" loading={accepting} onClick={accept}>
                Accept invite
              </Button>
            ) : (
              <div className="space-y-2">
                <p className="text-text-dim text-xs">Sign in or create an account to accept.</p>
                <div className="flex gap-2">
                  <Link
                    href={`/auth/login?callbackUrl=${encodeURIComponent(callbackUrl)}`}
                    className="flex-1 h-10 rounded-xl bg-primary text-white text-sm font-medium flex items-center justify-center hover:bg-primary-hover"
                  >
                    Sign in
                  </Link>
                  <Link
                    href={`/auth/signup?callbackUrl=${encodeURIComponent(callbackUrl)}`}
                    className="flex-1 h-10 rounded-xl border border-border text-text text-sm font-medium flex items-center justify-center hover:bg-surface-2"
                  >
                    Sign up
                  </Link>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
