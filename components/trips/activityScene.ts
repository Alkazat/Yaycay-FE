/**
 * A decorative "scene" (emoji + gradient) per activity card - emulating the gold
 * standard's illustrated banners. Derived from the activity title where a theme is
 * obvious, else a stable per-id pick, so a card always looks the same. Purely
 * presentational; the contract carries no per-activity art.
 */
export interface ActivityScene {
  emoji: string;
  gradient: string;
}

const GRADIENT = {
  aqua: "linear-gradient(135deg, var(--aqua-200), var(--sky-400))",
  sunset: "linear-gradient(135deg, var(--sun-300), var(--coral-300))",
  sky: "linear-gradient(135deg, var(--sky-200), var(--sky-500))",
  meadow: "linear-gradient(135deg, var(--meadow-200), var(--aqua-300))",
  sun: "linear-gradient(135deg, var(--sun-200), var(--sun-500))",
  night: "linear-gradient(135deg, var(--royal-500), var(--sky-700))",
  coral: "linear-gradient(135deg, var(--coral-200), var(--sun-300))",
  violet: "linear-gradient(135deg, #b9a8ff, var(--sky-300))",
} as const;

type Theme = keyof typeof GRADIENT;

const THEMES: { test: RegExp; emoji: string; theme: Theme }[] = [
  { test: /beach|sand|sea|shore|snorkel|swim|pool|water|wave|splash/i, emoji: "🏖️", theme: "aqua" },
  {
    test: /eat|food|lunch|dinner|breakfast|caf|shack|satay|noodle|hawker|dining|meal|restaurant|buffet|ice ?cream|affogato|coffee|treat/i,
    emoji: "🍽️",
    theme: "sunset",
  },
  { test: /fly|flight|plane|airport|arriv|depart|home time/i, emoji: "✈️", theme: "sky" },
  { test: /garden|forest|tree|botanic|park|nature|jungle|trail/i, emoji: "🌳", theme: "meadow" },
  { test: /zoo|safari|animal|orangutan|wildlife|bird|aquar|fish|merlion/i, emoji: "🦁", theme: "sun" },
  { test: /night|light|fireworks|evening|dark|show/i, emoji: "🌃", theme: "night" },
  { test: /ride|luge|coaster|universal|theme ?park|cable|tower|wheel|express/i, emoji: "🎢", theme: "coral" },
  { test: /museum|art|science|teamlab|gallery|culture|temple|chinatown|india/i, emoji: "🎨", theme: "violet" },
];

const FALLBACK: { emoji: string; theme: Theme }[] = [
  { emoji: "🌟", theme: "sky" },
  { emoji: "🎈", theme: "coral" },
  { emoji: "🧭", theme: "aqua" },
  { emoji: "🍀", theme: "meadow" },
  { emoji: "🎉", theme: "sunset" },
  { emoji: "🌈", theme: "violet" },
];

export function activityScene(key: string, title: string): ActivityScene {
  for (const t of THEMES) {
    if (t.test.test(title)) return { emoji: t.emoji, gradient: GRADIENT[t.theme] };
  }
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  const f = FALLBACK[h % FALLBACK.length];
  return { emoji: f.emoji, gradient: GRADIENT[f.theme] };
}
