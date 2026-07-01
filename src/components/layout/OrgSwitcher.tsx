"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Building2 } from "lucide-react";

interface Org {
  orgId: string;
  name: string;
  plan: string;
  role: string;
}

export function OrgSwitcher() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [switching, setSwitching] = useState(false);

  useEffect(() => {
    fetch("/api/orgs")
      .then((r) => r.json())
      .then((d) => setOrgs(d.orgs ?? []))
      .catch(() => setOrgs([]));
  }, []);

  // Solo users (one workspace) never see the switcher — tenancy stays invisible.
  if (orgs.length <= 1) return null;

  const active = session?.user?.activeOrgId ?? orgs[0]?.orgId;

  async function switchOrg(orgId: string) {
    if (orgId === active) return;
    setSwitching(true);
    await update({ activeOrgId: orgId });
    router.refresh();
    setSwitching(false);
  }

  return (
    <div className="flex items-center gap-2">
      <Building2 className="w-4 h-4 text-text-muted" />
      <select
        value={active}
        disabled={switching}
        onChange={(e) => switchOrg(e.target.value)}
        className="h-9 rounded-lg border border-border bg-surface px-3 text-sm text-text focus:outline-none focus:border-primary disabled:opacity-50"
      >
        {orgs.map((o) => (
          <option key={o.orgId} value={o.orgId} className="bg-surface">
            {o.name} · {o.role}
          </option>
        ))}
      </select>
    </div>
  );
}
