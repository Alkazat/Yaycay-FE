/**
 * ============================================================================
 * @alkazat/contracts adoption barrel (FE)
 * ============================================================================
 * The FE now pins `@alkazat/contracts@^0.8.0` (GitHub Packages). The wire DTOs
 * that match the published contract are re-exported straight from the package
 * below, so there is a single source of truth for the request/response shapes
 * the FE exchanges with BE.
 *
 * The rest is kept local on purpose, in two groups:
 *
 *  1. The FE content model (TripDay/Activity/Moment/TripContent/...). The FE
 *     keeps a local `TripDay` shape, but its `weather`/`hotel` fields and the
 *     activity `challenge` field now adopt the contract `Weather`/`Hotel`/
 *     `Challenge` types, and `ProfileMode` is widened to the contract
 *     `ExplorerMode`. The remaining drift - the full `TripDay` -> contract
 *     `Day` swap, and the local `GameConfig`/`star_challenge` vs contract
 *     `Game`/`StarChallenge` - is DEFERRED pending mapping decisions, so those
 *     fields stay local.
 *
 *  2. Client-only view models (packing, stars, checklist, per-day progress, the
 *     richer local journal entry, transient connector UI state). These describe
 *     local-first FE state the contract does not - and should not - model.
 * ============================================================================
 */

import type {
  ActivityKind,
  Tier,
  Challenge,
  Weather,
  Hotel,
  ExplorerMode,
} from "@alkazat/contracts";

// ---------------------------------------------------------------------------
// Re-exported verbatim from the published contract (drop-in matches).
// ---------------------------------------------------------------------------
export type {
  ActivityKind,
  Tier,
  Challenge,
  Weather,
  Hotel,
  ExplorerMode,
  // Profiles + the user-types model (adopted from contract @0.15):
  ChildProfile,
  ChildProfilesResponse,
  ChildProfileInput,
  ProfileType,
  PinRequest,
  PinVerifyResponse,
  TripStatus,
  Trip,
  TripSummary,
  ListTripsResponse,
  CreateTripRequest,
  CheckoutSessionRequest,
  CheckoutSessionResponse,
  // Account (v0.18): the owner account summary (email, secondary_email, tier, ...).
  AccountSummary,
  JournalEntry,
  JournalEntryInput,
  JournalListResponse,
  SignUploadRequest,
  SignUploadResponse,
  ConnectorStatus,
  Connector,
  ConnectorsListResponse,
  ByoConnectorRequest,
  ByoConnectorResponse,
  SignupCaptureRequest,
  SignupCaptureResponse,
  TwoFactorVerifyRequest,
  TwoFactorVerifyResponse,
  DemoChildProfile,
  DemoGenerateDayRequest,
  ApiErrorBody,
  ChatMessage,
  PlanChatRequest,
  PlanChatEvent,
  IngestImage,
  IngestRequest,
  // Per-trip surfaces now served by the live contract (adopted wholesale):
  PackingItem,
  PackingSection,
  PackingList,
  PackingResponse,
  PackingPatchRequest,
  TripProgress,
  TripProgressResponse,
  ProgressUpdateRequest,
  StarLedgerEntry,
  StarBalance,
  StarsResponse,
  StarClaimRequest,
  StarClaimResponse,
  ChecklistItem,
  ChecklistResponse,
  ChecklistUpdateRequest,
} from "@alkazat/contracts";

// ===========================================================================
// FE content model (kept local - diverges from contract v0.8; see header).
// ===========================================================================

/**
 * Tagged render variants by the active child profile's mode/age.
 *
 * Widened to the contract {@link ExplorerMode} (adds `explorer`). Kept as a
 * local alias so existing renderer/profile call sites keep their name.
 */
export type ProfileMode = ExplorerMode;

// Profile identity + the user-types model (`ChildProfile.type`/`pin_set`,
// `ProfileType`, `PinRequest`, `PinVerifyResponse`) are now adopted from
// `@alkazat/contracts@0.15` - re-exported in the contract block above.

/** Time-of-day slot for a moment. */
export type MomentSlot = "morning" | "afternoon" | "evening" | "anytime";

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
  challenge?: Challenge;
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
  /** Weather summary + temps for the day (contract {@link Weather}). */
  weather?: Weather;
  /** Hotel / move badge for the day (contract {@link Hotel}). */
  hotel?: Hotel;
  /** Per-day star challenge (claimable once per profile per day). */
  star_challenge?: { question: string; answer: string };
  /** Per-day mini-game config (the youngest explorers). */
  game?: GameConfig;
  moments: Moment[];
}

/** Per-day kid mini-game. */
export type GameType = "tap" | "colour" | "spot";

export interface GameConfig {
  type: GameType;
  theme: string;
  /** Emoji/sticker set the game uses. */
  items: string[];
  /** Tap/spot goal or target count. */
  goal?: number;
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

export interface GrownupsDay {
  day_id: string;
  bookings?: string[];
  costs?: string[];
  transport?: string[];
  tips?: string[];
  allergy?: string[];
}

export interface GrownupsGuide {
  essentials?: string;
  /** Seed labels for the booking checklist (state lives in the checklist API). */
  checklist?: string[];
  transport?: string;
  /** Accommodation phases, e.g. "Sentosa (nights 1-4)". */
  phases?: { label: string; range: string }[];
  /** Per-day logistics cards. */
  days?: GrownupsDay[];
}

/** The full canonical payload: Holiday -> Days -> Moments -> Activities. */
export interface TripContent {
  trip: TripMeta;
  days: TripDay[];
  grownups?: GrownupsGuide;
}

/* --------------------------------------------------------------------------
 * Packing / progress / stars / checklist
 *
 * These per-trip surfaces are now served by the live contract, so their
 * request/response shapes are re-exported from `@alkazat/contracts` above
 * (`PackingResponse`/`PackingList`/..., `TripProgress`, `StarsResponse`,
 * `ChecklistResponse`, ...). The only star type the contract does not model is
 * the FE's claim vocabulary, kept local below.
 * ------------------------------------------------------------------------ */

/**
 * The FE's own claim sources. The contract `StarClaimRequest.source` is a free
 * string (e.g. `challenge:<id>`); the FE only ever claims these two kinds and
 * scopes them by day, so this stays local as the FE-side vocabulary.
 */
export type StarSource = "game" | "challenge";

/* --------------------------------------------------------------------------
 * Account + billing
 * ------------------------------------------------------------------------ */

/** Catalogue product the FE can open a Checkout session for. */
export type ProductId =
  | "price_holiday_byo"
  | "price_holiday_ai"
  | "price_datakeep_annual"
  | "price_destination_addon"
  | "price_photobook";

/* --------------------------------------------------------------------------
 * Journal
 *
 * Now served by the live contract: `JournalEntry`/`JournalEntryInput` carry
 * `day_id`, `mood` and `stars` as of `@alkazat/contracts@0.15`, so the FE's
 * richer per-day memory is modelled by the contract directly (re-exported in
 * the contract block above). No local journal shape remains.
 * ------------------------------------------------------------------------ */

/* --------------------------------------------------------------------------
 * CLIENT-ONLY connector UI state
 *
 * The contract `ConnectorStatus` is `active | revoked`; the FE may want to
 * render extra transient states (not yet connected, error) with no contract
 * counterpart.
 * ------------------------------------------------------------------------ */

export type ConnectorUiStatus = "not_connected" | "connected" | "error";

/* --------------------------------------------------------------------------
 * Demo endpoint response (POST /demo/generate-day)
 *
 * The request DTO is re-exported from the contract above. The response is kept
 * local because its `day` is the FE `TripDay` shape rather than the contract's
 * `Day`.
 * ------------------------------------------------------------------------ */

export interface DemoGenerateDayResponse {
  day: TripDay;
  grownups_teaser: string;
  generated_by?: "ai" | "fallback";
}

/* --------------------------------------------------------------------------
 * AI surfaces (v0.3): planning chat + ingestion patches
 *
 * These reference the FE content model (`TripDay`/`Activity`/`TripContent`),
 * so they stay local alongside it.
 * ------------------------------------------------------------------------ */

/**
 * A structured edit the AI harness emits. Applied to the current trip content,
 * re-validated against the schema, then persisted.
 */
export type PatchOp =
  | { op: "add_day"; day: TripDay }
  | { op: "set_day_summary"; day_id: string; summary: string }
  | { op: "add_moment"; day_id: string; moment: Moment }
  | { op: "add_activity"; day_id: string; moment_id: string; activity: Activity }
  | { op: "update_activity"; activity_id: string; set: Partial<Omit<Activity, "id">> }
  | { op: "move_activity"; activity_id: string; to_moment_id: string }
  | { op: "set_booking"; activity_id: string; booking: ActivityBooking };

export interface TripContentPatch {
  ops: PatchOp[];
  /** Short human-readable note on what changed. */
  note?: string;
}

export interface IngestResponse {
  applied: boolean;
  /** The ai_jobs ledger id for this ingestion (counts to the daily cap). */
  job_id: string | null;
  generated_by: "ai" | "fallback";
  /** The patch the harness produced. */
  patch: TripContentPatch;
  /** The full trip content after applying the patch. */
  content: TripContent;
}
