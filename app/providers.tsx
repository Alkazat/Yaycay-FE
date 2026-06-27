"use client";

import { useEffect, useState, type ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { persistQueryClient } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { makeQueryClient } from "@/lib/query/client";

/**
 * Client providers. TanStack Query for server-state, persisted to localStorage
 * so a visited trip / journal / account is readable offline (the next-pwa
 * service worker caches the shell). Write-sync on reconnect is a later slice
 * that needs BE.
 *
 * IMPORTANT — hydration safety: we render the SAME provider tree on the server
 * and on the first client render. The persisted cache is restored in an effect
 * (i.e. after hydration), never during render. Restoring synchronously during
 * render — as PersistQueryClientProvider does with a sync storage persister —
 * makes the first client render show cached data while the server rendered the
 * empty/loading state, which trips React's hydration mismatch on every page.
 */
export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(makeQueryClient);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const persister = createSyncStoragePersister({
      storage: window.localStorage,
      key: "yaycay.query-cache",
    });
    const [unsubscribe] = persistQueryClient({
      queryClient,
      persister,
      maxAge: 24 * 60 * 60 * 1000,
    });
    return unsubscribe;
  }, [queryClient]);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
