"use client";

import { SessionProvider } from "next-auth/react";
import { SWRConfig } from "swr";
import { fetcher } from "@/lib/fetcher";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <SWRConfig
        value={{
          fetcher,
          revalidateOnFocus: true, // switch back to the tab → data refreshes
          revalidateOnReconnect: true,
          dedupingInterval: 2000, // collapse duplicate requests in a 2s window
          keepPreviousData: true, // no flash of empty state while revalidating
        }}
      >
        {children}
      </SWRConfig>
    </SessionProvider>
  );
}
