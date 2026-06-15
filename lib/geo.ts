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

/**
 * The active geocoder. Defaults to the local curated set; point this at a live
 * provider (returning the same `City[]`) to get every city in the world.
 */
export const GEOCODER: { search(query: string): Promise<City[]> } = {
  search: async (query) => localSearch(query),
};

export function searchCities(query: string): Promise<City[]> {
  return GEOCODER.search(query);
}

/** Best-effort flag for a destination string by matching its trailing country. */
export function flagForDestination(destination: string): string {
  const lower = destination.toLowerCase();
  const match = CITIES.find((c) => lower.endsWith(c.country.toLowerCase()) || lower.includes(c.country.toLowerCase()));
  return match ? flagEmoji(match.cc) : "";
}
