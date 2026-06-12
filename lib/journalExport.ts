import type { JournalEntry, TripDay } from "@/lib/contract-mock/types";

/** Mood options for the journal (words, not emoji, per the brand UI rule). */
export const MOODS: { value: string; label: string }[] = [
  { value: "happy", label: "Happy" },
  { value: "loved", label: "Loved it" },
  { value: "wow", label: "Wow" },
  { value: "tired", label: "Tired" },
  { value: "funny", label: "Funny" },
];

export function moodLabel(value?: string): string | undefined {
  return MOODS.find((m) => m.value === value)?.label;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Build a standalone, print-friendly keepsake HTML document from a profile's
 * journal entries. Pure (no DOM), so it is unit-testable; the client wraps the
 * result in a Blob download. Year is taken from the trip, never hard-coded (the
 * prototype shipped a "2025" bug).
 */
export function buildKeepsakeHtml(args: {
  profileName: string;
  destination: string;
  year: string;
  days: TripDay[];
  entries: JournalEntry[];
}): string {
  const { profileName, destination, year, days, entries } = args;
  const byDay = new Map<string, JournalEntry[]>();
  for (const e of entries) {
    byDay.set(e.day_id, [...(byDay.get(e.day_id) ?? []), e]);
  }

  const sections = days
    .map((day) => {
      const dayEntries = byDay.get(day.id) ?? [];
      const rows = dayEntries.length
        ? dayEntries
            .map((e) => {
              const bits = [
                e.mood ? `<em>${escapeHtml(moodLabel(e.mood) ?? e.mood)}</em>` : "",
                e.stars ? `${"*".repeat(e.stars)} (${e.stars}/5)` : "",
                e.note ? escapeHtml(e.note) : "",
                e.media_ref?.length ? `${e.media_ref.length} photo(s)` : "",
              ].filter(Boolean);
              return `<li>${bits.join(" &middot; ")}</li>`;
            })
            .join("")
        : "<li>No entry written.</li>";
      return `<section><h2>${escapeHtml(day.label)}</h2><ul>${rows}</ul></section>`;
    })
    .join("");

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<title>${escapeHtml(profileName)}'s ${escapeHtml(destination)} Adventure</title>
<style>
  body { font-family: system-ui, sans-serif; max-width: 720px; margin: 2rem auto; padding: 0 1rem; color: #1c2733; }
  h1 { color: #0a4c8b; }
  section { page-break-inside: avoid; }
  ul { padding-left: 1.2rem; }
</style></head>
<body>
  <h1>${escapeHtml(profileName)}'s ${escapeHtml(destination)} Adventure</h1>
  <p>${escapeHtml(destination)} ${escapeHtml(year)} &middot; For families making memories.</p>
  ${sections}
</body></html>`;
}
