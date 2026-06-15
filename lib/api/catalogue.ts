import { apiFetch, SERVED } from "@/lib/api/http";
import { getAccessToken } from "@/lib/auth/session";
import type { ProductId } from "@/lib/contract-mock/types";

/**
 * A purchasable catalogue product with its live price. Prices are sourced from
 * Stripe via BE (`GET /catalogue`) so the UI never hard-codes amounts. Mock-backed
 * until BE ships the endpoint (`SERVED.catalogue = false`).
 */
export interface CatalogueProduct {
  price_id: ProductId;
  name: string;
  price_usd: number;
  blurb?: string;
}

export async function getCatalogue(signal?: AbortSignal): Promise<CatalogueProduct[]> {
  const accessToken = await getAccessToken();
  const res = await apiFetch("/catalogue", SERVED.catalogue, { signal, accessToken });
  if (!res.ok) throw new Error(`Failed to load catalogue (${res.status})`);
  return ((await res.json()) as { products: CatalogueProduct[] }).products;
}

/** The live price for a product id, falling back to a static amount while loading. */
export function priceOf(
  catalogue: CatalogueProduct[] | undefined,
  priceId: string,
  fallbackUsd: number,
): number {
  return catalogue?.find((p) => p.price_id === priceId)?.price_usd ?? fallbackUsd;
}
