/**
 * Decorative, stable per-day emoji + colour tone for the Exploring book - shared
 * by the Home day-cards and the day-page header so a given day looks the same in
 * both. Purely presentational: the trip content carries no per-day theme, so this
 * is derived from the day's position and never persisted.
 */
export const DAY_EMOJI = [
  "🏝️", "🎡", "🦁", "🌳", "🌃", "🍜", "🛶", "🐠", "🎢", "🌸", "🚀", "✈️",
] as const;

export const DAY_TONE = ["sky", "sun", "aqua", "coral", "meadow"] as const;

export function dayEmoji(index: number): string {
  return DAY_EMOJI[index % DAY_EMOJI.length];
}

export function dayTone(index: number): string {
  return DAY_TONE[index % DAY_TONE.length];
}
