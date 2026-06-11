"use client";

import { useState, type ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { makeQueryClient } from "@/lib/query/client";

/**
 * Client providers. TanStack Query for server-state, persisted to localStorage
 * so a visited trip / journal / account is readable offline (the next-pwa
 * service worker caches the shell). On the server (and where localStorage is
 * unavailable) we fall back to a plain provider. Write-sync on reconnect is a
 * later slice that needs BE.
 */
export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(makeQueryClient);
  const [persister] = useState(() =>
    typeof window === "undefined"
      ? null
      : createSyncStoragePersister({ storage: window.localStorage, key: "yaycay.query-cache" }),
  );

  if (!persister) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister, maxAge: 24 * 60 * 60 * 1000 }}
    >
      {children}
    </PersistQueryClientProvider>
  );
}
