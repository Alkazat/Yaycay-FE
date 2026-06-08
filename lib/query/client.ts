import { QueryClient } from "@tanstack/react-query";

/**
 * App-wide TanStack Query defaults. Paid tiers will persist this cache for
 * offline use (Phase 1); the persister is layered on in the provider.
 */
export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        gcTime: 24 * 60 * 60 * 1000,
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  });
}
