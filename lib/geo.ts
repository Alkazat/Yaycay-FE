/**
 * Lightweight geocoding for the destination picker. A real "every city in the
 * world" search wants a geocoder API (Google Places / Mapbox / OSM Nominatim);
 * this ships a curated set of popular family destinations plus a flag helper so
 * the picker works offline and out of the box. The `searchCities` signature is
 * what a live provider would implement, so swapping it in later is a one-function
 * change (set GEOCODER below).
 */

export interface City {
  name: string;
  /** State / province / region. */
  region: string;
  country: string;
  /** ISO 3166-1 alpha-2 country code. */
  cc: string;
}

/** ISO-2 country code -> flag emoji (regional indicator pair). */
export function flagEmoji(cc: string): string {
  const code = cc.trim().toUpperCase();
  if (code.length !== 2 || !/^[A-Z]{2}$/.test(code)) return "";
  return String.fromCodePoint(...[...code].map((c) => 127397 + c.charCodeAt(0)));
}

/** "City, Region, Country" (Region omitted when same as the city/empty). */
export function formatCity(c: City): string {
  const parts = [c.name];
  if (c.region && c.region !== c.name) parts.push(c.region);
  parts.push(c.country);
  return parts.join(", ");
}

// Curated destinations. [name, region, country, cc].
const RAW: [string, string, string, string][] = [
  ["Singapore", "", "Singapore", "SG"],
  ["Tokyo", "Kanto", "Japan", "JP"],
  ["Osaka", "Kansai", "Japan", "JP"],
  ["Kyoto", "Kansai", "Japan", "JP"],
  ["Seoul", "", "South Korea", "KR"],
  ["Bangkok", "", "Thailand", "TH"],
  ["Phuket", "Phuket", "Thailand", "TH"],
  ["Bali", "Bali", "Indonesia", "ID"],
  ["Hong Kong", "", "Hong Kong", "HK"],
  ["Hanoi", "", "Vietnam", "VN"],
  ["Kuala Lumpur", "", "Malaysia", "MY"],
  ["Mumbai", "Maharashtra", "India", "IN"],
  ["Delhi", "Delhi", "India", "IN"],
  ["Dubai", "Dubai", "United Arab Emirates", "AE"],
  ["Sydney", "New South Wales", "Australia", "AU"],
  ["Melbourne", "Victoria", "Australia", "AU"],
  ["Brisbane", "Queensland", "Australia", "AU"],
  ["Gold Coast", "Queensland", "Australia", "AU"],
  ["Perth", "Western Australia", "Australia", "AU"],
  ["Auckland", "", "New Zealand", "NZ"],
  ["Queenstown", "Otago", "New Zealand", "NZ"],
  ["London", "England", "United Kingdom", "GB"],
  ["Edinburgh", "Scotland", "United Kingdom", "GB"],
  ["Paris", "Ile-de-France", "France", "FR"],
  ["Nice", "Provence", "France", "FR"],
  ["Disneyland Paris", "Ile-de-France", "France", "FR"],
  ["Barcelona", "Catalonia", "Spain", "ES"],
  ["Madrid", "", "Spain", "ES"],
  ["Lisbon", "", "Portugal", "PT"],
  ["Rome", "Lazio", "Italy", "IT"],
  ["Venice", "Veneto", "Italy", "IT"],
  ["Florence", "Tuscany", "Italy", "IT"],
  ["Amsterdam", "North Holland", "Netherlands", "NL"],
  ["Berlin", "", "Germany", "DE"],
  ["Munich", "Bavaria", "Germany", "DE"],
  ["Vienna", "", "Austria", "AT"],
  ["Zurich", "", "Switzerland", "CH"],
  ["Athens", "", "Greece", "GR"],
  ["Santorini", "South Aegean", "Greece", "GR"],
  ["Istanbul", "", "Turkey", "TR"],
  ["Reykjavik", "", "Iceland", "IS"],
  ["Copenhagen", "", "Denmark", "DK"],
  ["Stockholm", "", "Sweden", "SE"],
  ["Oslo", "", "Norway", "NO"],
  ["Dublin", "", "Ireland", "IE"],
  ["New York", "New York", "United States", "US"],
  ["Orlando", "Florida", "United States", "US"],
  ["Los Angeles", "California", "United States", "US"],
  ["San Francisco", "California", "United States", "US"],
  ["Honolulu", "Hawaii", "United States", "US"],
  ["Las Vegas", "Nevada", "United States", "US"],
  ["Toronto", "Ontario", "Canada", "CA"],
  ["Vancouver", "British Columbia", "Canada", "CA"],
  ["Cancun", "Quintana Roo", "Mexico", "MX"],
  ["Mexico City", "", "Mexico", "MX"],
  ["Rio de Janeiro", "", "Brazil", "BR"],
  ["Buenos Aires", "", "Argentina", "AR"],
  ["Lima", "", "Peru", "PE"],
  ["Cape Town", "Western Cape", "South Africa", "ZA"],
  ["Marrakesh", "", "Morocco", "MA"],
  ["Cairo", "", "Egypt", "EG"],
  ["Nairobi", "", "Kenya", "KE"],
  ["Fiji", "", "Fiji", "FJ"],
];

export const CITIES: City[] = RAW.map(([name, region, country, cc]) => ({ name, region, country, cc }));

/** Local, prefix/substring search over the curated set (case-insensitive). */
function localSearch(query: string, limit = 8): City[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const scored = CITIES.map((c) => {
    const name = c.name.toLowerCase();
    const hay = `${name} ${c.region.toLowerCase()} ${c.country.toLowerCase()}`;
    let score = -1;
    if (name.startsWith(q)) score = 0;
    else if (name.includes(q)) score = 1;
    else if (hay.includes(q)) score = 2;
    return { c, score };
  }).filter((s) => s.score >= 0);
  scored.sort((a, b) => a.score - b.score || a.c.name.localeCompare(b.c.name));
  return scored.slice(0, limit).map((s) => s.c);
}

export interface Geocoder {
  search(query: string, signal?: AbortSignal): Promise<City[]>;
}

/**
 * Photon (https://photon.komoot.io) is an OpenStreetMap-backed geocoder built
 * for type-ahead: free, keyless and CORS-enabled, so it runs straight from the
 * browser. We bias toward populated places (city/town/village/...) so the picker
 * returns real destinations rather than streets or shops.
 */
const PHOTON_URL = "https://photon.komoot.io/api/";
const PLACE_TYPES = new Set(["city", "town", "village", "hamlet", "municipality", "locality", "island"]);

function featureToCity(f: {
  properties?: Record<string, string | undefined>;
}): City | null {
  const p = f.properties ?? {};
  const name = p.name?.trim();
  const country = p.country?.trim();
  if (!name || !country) return null;
  const cc = (p.countrycode ?? "").trim().toUpperCase();
  const region = (p.state ?? p.county ?? p.region ?? "").trim();
  return { name, region, country, cc };
}

/** De-dupe by name+country+region, keeping first-seen order. */
function dedupe(cities: City[]): City[] {
  const seen = new Set<string>();
  const out: City[] = [];
  for (const c of cities) {
    const key = `${c.name}|${c.cc}|${c.region}`.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(c);
  }
  return out;
}

export const photonGeocoder: Geocoder = {
  async search(query, signal) {
    const url = `${PHOTON_URL}?q=${encodeURIComponent(query)}&limit=10&lang=en`;
    const res = await fetch(url, { signal });
    if (!res.ok) return [];
    const json = (await res.json()) as { features?: { properties?: Record<string, string> }[] };
    const feats = json.features ?? [];
    const cities = feats
      .filter((f) => {
        const t = f.properties?.osm_value ?? f.properties?.type ?? "";
        // Keep populated places; also keep when the type is unknown but it reads
        // like a place (has a country code), rather than dropping good matches.
        return PLACE_TYPES.has(t) || (!f.properties?.osm_value && !!f.properties?.countrycode);
      })
      .map(featureToCity)
      .filter((c): c is City => c !== null);
    return cities;
  },
};

/**
 * The active geocoder. Live Photon search with the curated set as an instant,
 * always-available fallback (offline, CI, or if Photon is slow/unreachable).
 */
export const GEOCODER: Geocoder = photonGeocoder;

/** Abort the live lookup if it outruns this budget; the local set still answers. */
const REMOTE_TIMEOUT_MS = 4000;

/**
 * Search for cities. Curated favourites surface first (instant, offline), then
 * the long tail of every city in the world from the live geocoder. A network
 * failure or timeout simply leaves the curated matches — the picker never blocks.
 */
export async function searchCities(query: string, signal?: AbortSignal): Promise<City[]> {
  const q = query.trim();
  if (q.length < 2) return [];

  const local = localSearch(q, 6);

  let remote: City[] = [];
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), REMOTE_TIMEOUT_MS);
    if (signal) signal.addEventListener("abort", () => ctrl.abort(), { once: true });
    try {
      remote = await GEOCODER.search(q, ctrl.signal);
    } finally {
      clearTimeout(timer);
    }
  } catch {
    remote = [];
  }

  return dedupe([...local, ...remote]).slice(0, 10);
}

/** Best-effort flag for a destination string by matching its trailing country. */
export function flagForDestination(destination: string): string {
  const lower = destination.toLowerCase();
  const match = CITIES.find((c) => lower.endsWith(c.country.toLowerCase()) || lower.includes(c.country.toLowerCase()));
  return match ? flagEmoji(match.cc) : "";
}
