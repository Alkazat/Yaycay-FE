/**
 * Live "what's nearby" provider for the Yaycay connector.
 *
 * Yaycay's own curated picks ALWAYS lead. This optional layer adds real,
 * current places from an external maps provider WHEN one is configured (the
 * server-only `PLACES_API_KEY`), so the connector can surface live nearby ideas
 * rather than only curated picks plus the model's training knowledge. With no
 * key set it degrades silently to "not available" and `whats_nearby` falls back
 * to curated + the assistant's own area knowledge. It never throws into the tool
 * path: any provider hiccup just returns `available:false`.
 *
 * The key/provider are read straight from `process.env` (never `NEXT_PUBLIC_*`)
 * so the secret stays server-only, like the other privileged keys in this repo.
 */

export interface NearbyPlace {
  name: string;
  category?: string;
  address?: string;
  rating?: number;
  /** A short, family-lens reason this is worth a look (the assistant expands it). */
  for_the_family: string;
}

export interface NearbyResult {
  available: boolean;
  source: string | null;
  places: NearbyPlace[];
}

const UNAVAILABLE: NearbyResult = { available: false, source: null, places: [] };

/** Provider + key are server-only secrets. Returns null when nothing is set up. */
function config(): { provider: string; key: string } | null {
  const key = (process.env.PLACES_API_KEY ?? "").trim();
  if (!key) return null;
  const provider = (process.env.PLACES_PROVIDER ?? "google").trim().toLowerCase();
  return { provider, key };
}

/** True when a live places provider is wired up (used for tool framing). */
export function placesConfigured(): boolean {
  return config() !== null;
}

/**
 * Best-effort live nearby lookup for a destination. Returns already-branded
 * places, or `available:false` when no provider is configured or the lookup
 * fails. Safe to call unconditionally - it never throws.
 */
export async function fetchNearbyPlaces(
  destination: string,
  opts: { limit?: number } = {},
): Promise<NearbyResult> {
  const cfg = config();
  if (!cfg || !destination.trim()) return UNAVAILABLE;
  const limit = Math.min(Math.max(opts.limit ?? 6, 1), 10);
  try {
    if (cfg.provider === "foursquare") return await fromFoursquare(destination, limit, cfg.key);
    return await fromGoogle(destination, limit, cfg.key);
  } catch {
    return UNAVAILABLE; // never break the tool - Yaycay's curated picks still lead
  }
}

/** Google Places API (Text Search) - family-friendly things to do near a place. */
async function fromGoogle(destination: string, limit: number, key: string): Promise<NearbyResult> {
  const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "X-Goog-Api-Key": key,
      "X-Goog-FieldMask":
        "places.displayName,places.formattedAddress,places.rating,places.primaryTypeDisplayName",
    },
    body: JSON.stringify({
      textQuery: `family-friendly things to do in ${destination}`,
      pageSize: limit,
    }),
  });
  if (!res.ok) return UNAVAILABLE;
  const data = (await res.json()) as {
    places?: {
      displayName?: { text?: string };
      formattedAddress?: string;
      rating?: number;
      primaryTypeDisplayName?: { text?: string };
    }[];
  };
  const places = (data.places ?? [])
    .slice(0, limit)
    .map((p) => ({
      name: p.displayName?.text ?? "",
      category: p.primaryTypeDisplayName?.text,
      address: p.formattedAddress,
      rating: p.rating,
      for_the_family: brandReason(p.primaryTypeDisplayName?.text),
    }))
    .filter((p) => p.name);
  return places.length ? { available: true, source: "google", places } : UNAVAILABLE;
}

/** Foursquare Places search - a second supported provider. */
async function fromFoursquare(
  destination: string,
  limit: number,
  key: string,
): Promise<NearbyResult> {
  const url = new URL("https://api.foursquare.com/v3/places/search");
  url.searchParams.set("near", destination);
  url.searchParams.set("query", "family friendly");
  url.searchParams.set("limit", String(limit));
  const res = await fetch(url, { headers: { Authorization: key, accept: "application/json" } });
  if (!res.ok) return UNAVAILABLE;
  const data = (await res.json()) as {
    results?: {
      name?: string;
      location?: { formatted_address?: string };
      categories?: { name?: string }[];
    }[];
  };
  const places = (data.results ?? [])
    .slice(0, limit)
    .map((r) => ({
      name: r.name ?? "",
      category: r.categories?.[0]?.name,
      address: r.location?.formatted_address,
      for_the_family: brandReason(r.categories?.[0]?.name),
    }))
    .filter((p) => p.name);
  return places.length ? { available: true, source: "foursquare", places } : UNAVAILABLE;
}

/** A light Yaycay-lens hint; the assistant expands it warmly + age-appropriately. */
function brandReason(category?: string): string {
  const c = (category ?? "").toLowerCase();
  if (/park|garden|beach|zoo|aquarium|playground/.test(c))
    return "Easy outdoor win - room for the kids to roam.";
  if (/museum|gallery|science|library/.test(c))
    return "A 'did you know' stop - curious kids will love it.";
  if (/restaurant|cafe|food|bakery|ice cream/.test(c))
    return "A relaxed family meal or treat stop.";
  return "Worth a look for the whole family.";
}
