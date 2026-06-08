/**
 * ============================================================================
 * MOCK CONTRACT TYPES - TEMPORARY
 * ============================================================================
 * These mirror the canonical content model in 00-MODEL-CONTEXT.md (section 5)
 * and the FE handoff. They exist ONLY so the app builds and runs before the
 * real `@yaycay/contracts` package is published.
 *
 * WHEN THE REAL CONTRACT LANDS:
 *   1. `npm i @yaycay/contracts@^0.1.0`
 *   2. Replace imports of `@/lib/contract-mock/types` with `@yaycay/contracts`.
 *   3. Delete this directory.
 *
 * Do NOT add fields here that are not in the documented model. A genuine gap is
 * a PR against Yaycay-BE (model context section 3), never a local invention.
 * ============================================================================
 */

/** Routes an activity to a view. */
export type ActivityKind = "kid" | "shared" | "adult";

/** Tagged render variants by the active child profile's mode/age. */
export type ProfileMode = "little" | "explorer_plus";

/** Time-of-day slot for a moment. */
export type MomentSlot = "morning" | "afternoon" | "evening" | "anytime";

/** Trip purchase tier. */
export type Tier = "free" | "byo" | "ours";

export interface GeoLocation {
  name: string;
  lat?: number;
  lng?: number;
}

export interface ActivityQuiz {
  q: string;
  a: string;
}

export interface ActivityVariant {
  body?: string;
  fact?: string;
  quiz?: ActivityQuiz;
}

export interface ActivityBooking {
  name: string;
  time?: string;
}

export interface ActivitySafety {
  note: string;
}

export interface Activity {
  id: string;
  kind: ActivityKind;
  title: string;
  body?: string;
  /** Mode/age-tagged overrides; the renderer picks by active profile. */
  variants?: Partial<Record<ProfileMode, ActivityVariant>>;
  booking?: ActivityBooking;
  /** Dietary / medical flags surfaced in the grown-ups view. */
  safety?: ActivitySafety;
  media_ref?: string[];
}

export interface Moment {
  id: string;
  slot: MomentSlot;
  title: string;
  time_hint?: string;
  location?: GeoLocation;
  activities: Activity[];
}

export interface TripDay {
  id: string;
  date: string;
  label: string;
  summary?: string;
  moments: Moment[];
}

export interface TripMeta {
  id: string;
  destination: string;
  start_date: string;
  end_date: string;
  /** IANA timezone, e.g. "Asia/Singapore". Drives the countdown. */
  timezone: string;
  currency?: string;
}

export interface GrownupsGuide {
  essentials?: string;
  checklist?: string[];
  transport?: string;
}

/** The full canonical payload: Holiday -> Days -> Moments -> Activities. */
export interface TripContent {
  trip: TripMeta;
  days: TripDay[];
  grownups?: GrownupsGuide;
}

/* --------------------------------------------------------------------------
 * Profiles + trip listing DTOs
 * ------------------------------------------------------------------------ */

/** A child profile under the account (model context section 4). */
export interface ChildProfile {
  id: string;
  name: string;
  avatar?: string;
  age?: number;
  /** Render mode/age band the kid view selects variants by. */
  mode: ProfileMode;
}

export type TripStatus = "planning" | "ready" | "complete";

/** A trip as it appears on the trips home (cards). */
export interface TripSummary {
  id: string;
  destination: string;
  start_date: string;
  end_date: string;
  timezone: string;
  tier: Tier;
  status: TripStatus;
  cover?: string;
  day_count: number;
}

/* --------------------------------------------------------------------------
 * Demo endpoint DTOs (POST /demo/generate-day)
 * ------------------------------------------------------------------------ */

export interface DemoGenerateDayRequest {
  destination: string;
  start_date: string;
  end_date: string;
}

/**
 * The demo returns one AI-built day plus enough trip meta to drive the
 * countdown (start_date + timezone). The "one AI action" is never advertised.
 */
export interface DemoGenerateDayResponse {
  trip: TripMeta;
  day: TripDay;
  /** A short teaser of the grown-ups guide. */
  grownups_teaser?: string;
}
