/**
 * Per-explorer trip features.
 *
 * Every explorer (child profile) on a trip can have features turned on or off:
 * packing, pocket money (stars), quizzes, journal, games. The parent never has
 * to start from scratch - each explorer band (`mode`) ships a sensible PRESET,
 * and the parent can override any single feature per child on top of it.
 *
 * This module is pure (no React, no storage) so the resolution logic is
 * unit-testable in isolation; persistence lives in `useTripPlanning`.
 */
import type { ExplorerMode } from "@/lib/contract-mock/types";

/** The features a parent can toggle per explorer. */
export type TripFeatureKey = "packing" | "pocket_money" | "quizzes" | "journal" | "games";

export const FEATURE_KEYS: TripFeatureKey[] = [
  "packing",
  "pocket_money",
  "quizzes",
  "journal",
  "games",
];

export interface FeatureMeta {
  label: string;
  emoji: string;
  blurb: string;
}

/** Display copy for each feature (used by the planning toggle grid). */
export const FEATURE_META: Record<TripFeatureKey, FeatureMeta> = {
  packing: { label: "Packing list", emoji: "🧳", blurb: "Their own things to pack." },
  pocket_money: { label: "Pocket money", emoji: "⭐", blurb: "Earn stars towards pocket money." },
  quizzes: { label: "Quizzes", emoji: "🧠", blurb: "Daily star challenges and puzzles." },
  journal: { label: "Journal", emoji: "📖", blurb: "A travel diary with photos." },
  games: { label: "Games", emoji: "🎮", blurb: "Playful mini-games for little ones." },
};

export type ResolvedFeatures = Record<TripFeatureKey, boolean>;
export type FeatureOverrides = Partial<ResolvedFeatures>;

/**
 * Sensible defaults per explorer band. A `little` explorer leads with games and
 * keeps it gentle (no quizzes, no pocket money); older explorers get quizzes +
 * pocket money and grow out of the mini-games. `standard` is the grown-up voice.
 * The parent can override any of these per child.
 */
const PRESETS: Record<ExplorerMode, ResolvedFeatures> = {
  little: { packing: true, pocket_money: false, quizzes: false, journal: true, games: true },
  explorer: { packing: true, pocket_money: true, quizzes: true, journal: true, games: false },
  explorer_plus: { packing: true, pocket_money: true, quizzes: true, journal: true, games: false },
  standard: { packing: true, pocket_money: false, quizzes: false, journal: true, games: false },
};

/** The preset feature set for an explorer band (a fresh copy). */
export function presetFor(mode: ExplorerMode): ResolvedFeatures {
  return { ...PRESETS[mode] };
}

/** The band preset with any explicit per-child overrides applied on top. */
export function resolveFeatures(
  mode: ExplorerMode,
  overrides?: FeatureOverrides,
): ResolvedFeatures {
  const base = presetFor(mode);
  if (!overrides) return base;
  for (const key of FEATURE_KEYS) {
    const v = overrides[key];
    if (typeof v === "boolean") base[key] = v;
  }
  return base;
}

/** Whether a resolved value differs from the band preset (a "customised" hint). */
export function isOverridden(mode: ExplorerMode, key: TripFeatureKey, value: boolean): boolean {
  return presetFor(mode)[key] !== value;
}

/** How many of an explorer's features differ from the band defaults. */
export function overrideCount(mode: ExplorerMode, overrides?: FeatureOverrides): number {
  if (!overrides) return 0;
  const preset = presetFor(mode);
  return FEATURE_KEYS.reduce((n, key) => {
    const v = overrides[key];
    return typeof v === "boolean" && v !== preset[key] ? n + 1 : n;
  }, 0);
}
