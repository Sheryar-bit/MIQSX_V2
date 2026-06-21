"use client";

import { useEffect, useState } from "react";
import { Globe, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface Profile {
  name: string;
  email: string;
  plan: string;
  profileSlug?: string;
  profilePublic: boolean;
  profileBio?: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [bio, setBio] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
    fetch("/api/user/profile")
      .then((r) => r.json())
      .then((d: Profile & { error?: string }) => {
        if (d.error) return;
        setProfile(d);
        setName(d.name ?? "");
        setSlug(d.profileSlug ?? "");
        setBio(d.profileBio ?? "");
        setIsPublic(!!d.profilePublic);
      })
      .finally(() => setLoading(false));
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setNotice("");
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, profileSlug: slug, profileBio: bio, profilePublic: isPublic }),
      });
      const d = await res.json();
      if (!res.ok) {
        setNotice(d.error || "Could not save");
      } else {
        setNotice("Saved.");
        if (d.profileSlug) setSlug(d.profileSlug);
      }
    } catch {
      setNotice("Network error");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const publicUrl = slug ? `${origin}/brands/${slug}` : "";

  return (
    <div className="p-6 md:p-8 max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-text flex items-center gap-2">
          <Globe className="w-6 h-6 text-primary-light" />
          Public Profile
        </h1>
        <p className="text-text-muted mt-1">Control your public-facing brand showcase.</p>
      </div>

      <form onSubmit={save} className="rounded-2xl border border-border bg-surface p-6 space-y-5">
        <Input label="Display name" value={name} onChange={(e) => setName(e.target.value)} />

        <div>
          <Input
            label="Profile URL"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="acme-studio"
          />
          {publicUrl && (
            <a
              href={publicUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-1.5 inline-flex items-center gap-1 text-xs text-primary-light hover:underline"
            >
              {publicUrl} <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>

        <Textarea
          label="Bio"
          value={bio}
          maxLength={300}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Tell visitors about your brand work (max 300 chars)"
        />

        <label className="flex items-center justify-between rounded-xl border border-border bg-surface-2 px-4 py-3 cursor-pointer">
          <div>
            <p className="text-text text-sm font-medium">Make profile public</p>
            <p className="text-text-dim text-xs">When on, anyone with your URL can view your active brands.</p>
          </div>
          <input
            type="checkbox"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
            className="h-5 w-5 accent-primary"
          />
        </label>

        <div className="flex items-center gap-3">
          <Button type="submit" loading={saving}>
            Save changes
          </Button>
          {notice && <span className="text-sm text-text-muted">{notice}</span>}
        </div>
      </form>
    </div>
  );
}
