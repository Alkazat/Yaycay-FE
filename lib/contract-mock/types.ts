/**
 * ============================================================================
 * MOCK CONTRACT TYPES - TEMPORARY
 * ============================================================================
 * These mirror the canonical content model in 00-MODEL-CONTEXT.md (section 5)
 * and the FE handoff. They exist ONLY so the app builds and runs before the
 * real `@alkazat/contracts` package is published.
 *
 * WHEN THE REAL CONTRACT LANDS:
 *   1. `npm i @alkazat/contracts@^0.4.0` (GitHub Packages; see ./README.md).
 *   2. Replace imports of `@/lib/contract-mock/types` with `@alkazat/contracts`.
 *   3. Delete this directory.
 *
 * Do NOT add fields here that are not in the documented model. A genuine gap is
 * a PR against Yaycay-BE (model context section 3), never a local invention.
 * ============================================================================
 */

/** Routes an activity to a view. */
export type ActivityKind = "kid" | "shared" | "adult";

/** Tagged render variants by the active child profile's mode/age. */
export type ProfileMode = "standard" | "little" | "explorer_plus";

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

/** Typed challenge attached to an activity. Hidden in `little` mode. */
export type ChallengeType = "quiz" | "spot" | "photo" | "challenge";

export interface ActivityChallenge {
  type: ChallengeType;
  question: string;
  /** Revealed on demand; never read aloud. */
  answer: string;
}

export interface Activity {
  id: string;
  kind: ActivityKind;
  title: string;
  body?: string;
  /** Mode/age-tagged overrides; the renderer picks by active profile. */
  variants?: Partial<Record<ProfileMode, ActivityVariant>>;
  /** Blue "wow fact" callouts. */
  facts?: string[];
  /** Typed challenge (quiz/spot/photo/challenge); hidden in little mode. */
  challenge?: ActivityChallenge;
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
  /** Yellow "today's journey" intro fact. */
  did_you_know?: string;
  /** Short weather note, e.g. "Singapore is HOT! About 32C". */
  weather?: string;
  /** Hotel / move badge copy, e.g. "Tonight: Village Hotel Sentosa". */
  hotel?: string;
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
  /** Render mode/age band the kid view selects variants by (default). */
  mode: ProfileMode;
  /** Dietary/medical flags (sensitive). Surfaced to grown-ups only. */
  allergies?: string[];
  anaphylaxis?: boolean;
}

// Full lifecycle enum per the published contract (v0.4). The FE only drives the
// middle of this range, but BE can return any value, so render defensively.
export type TripStatus =
  | "draft"
  | "planning"
  | "ready"
  | "holidaying"
  | "complete"
  | "archived";

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
  /** When trip data is scheduled for deletion (12 months post-holiday). */
  retention_expires_at?: string;
  /** True once a data-keep token has been bought for this trip. */
  data_kept?: boolean;
}

/* --------------------------------------------------------------------------
 * Account + billing
 * ------------------------------------------------------------------------ */

export interface AccountSummary {
  email: string;
  /** Secondary email required for password reset / recovery. */
  secondary_email?: string;
  tier: Tier;
}

/** Catalogue product the FE can open a Checkout session for. */
export type ProductId =
  | "price_holiday_byo"
  | "price_holiday_ai"
  | "price_datakeep_annual"
  | "price_destination_addon"
  | "price_photobook";

/**
 * Body for `POST /checkout/session` (the canonical path - not `/checkout`).
 * BE creates the Stripe Checkout session and returns its hosted URL.
 */
export interface CheckoutRequest {
  price_id: ProductId;
  /** Optional trip the purchase applies to (e.g. a data-keep token). */
  trip_id?: string;
}

export interface CheckoutResponse {
  /** Stripe Checkout URL to redirect to (BE creates the session). */
  url: string;
}

/* --------------------------------------------------------------------------
 * Journal (notes + star ratings, per profile/day)
 * ------------------------------------------------------------------------ */

export interface JournalEntry {
  id: string;
  trip_id: string;
  profile_id: string;
  day_id: string;
  note?: string;
  /** 1-5 stars, or undefined when only a note was left. */
  stars?: number;
  created_at: string;
}

/** Payload to create a journal entry (id + created_at assigned by BE). */
export interface JournalEntryInput {
  trip_id: string;
  profile_id: string;
  day_id: string;
  note?: string;
  stars?: number;
}

/* --------------------------------------------------------------------------
 * BYO-AI connector status
 * ------------------------------------------------------------------------ */

export type ConnectorStatus = "not_connected" | "connected" | "error";

export interface Connector {
  status: ConnectorStatus;
  /** Provider label when connected, e.g. "Claude", "ChatGPT", "Gemini". */
  provider?: string;
  last_synced_at?: string;
}

/* --------------------------------------------------------------------------
 * Signup capture (POST /signup/capture) - account + email, synced to Brevo
 * ------------------------------------------------------------------------ */

export interface SignupCaptureRequest {
  email: string;
  /** Marketing consent state captured at signup. */
  consent?: boolean;
}

export interface SignupCaptureResponse {
  ok: boolean;
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
