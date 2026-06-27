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
  // Trip management (v0.31): archive/share request + response, and the public
  // read-only shared view resolved from a share token.
  ArchiveTripRequest,
  ShareTripRequest,
  ShareTripResponse,
  SharedTrip,
  // Billing/transaction history (v0.31): Stripe-sourced, each line carries trip_id.
  Transaction,
  CheckoutSessionRequest,
  CheckoutSessionResponse,
  // Account (v0.18): the owner account summary (email, secondary_email, tier, ...).
  AccountSummary,
  // Account update (v0.18): the recovery email is the only consumer-mutable field.
  AccountUpdate,
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
  // During-trip companion + reopenable planning chat (contract v0.21/0.22).
  ChatRole,
  ChatHistoryMessageKind,
  ChatHistoryMessage,
  ChatHistory,
  CompanionOption,
  CompanionRainPlan,
  CompanionCard,
  CompanionResponse,
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

/**
 * A profile's optional own login (`GET|POST|DELETE /profiles/:id/login`). Kept
 * local until the FE adopts `@alkazat/contracts@0.29` (these mirror its
 * `ExplorerLogin*` DTOs). A linked explorer gets read-only access to the family's
 * trips and their own profile; no login => the parent account + profile switch.
 */
export interface ExplorerLoginStatus {
  enabled: boolean;
  email: string | null;
  invited_at: string | null;
  disabled_at: string | null;
}

export interface ExplorerLoginRequest {
  email: string;
}

export interface ExplorerLoginEnableResponse extends ExplorerLoginStatus {
  /** One-time magic-link sign-in URL to hand to the explorer; present on fresh provisioning. */
  action_link?: string | null;
}

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

/** A stall/option on a meal card. `risk` orders + emphasises; the label is the truth. */
export interface MealStall {
  name: string;
  /** Text label shown to the parent, e.g. "Tree-nut: flagged". Never colour alone. */
  label: string;
  risk: "flagged" | "lower";
  note?: string;
}

/** A bilingual "ask the kitchen" phrase card. */
export interface AskKitchenCard {
  /** Local language name, e.g. "Mandarin". */
  language: string;
  /** The phrase in the local language. */
  phrase: string;
  /** The same phrase in English. */
  english: string;
}

/** The pre-meal reminder: an amber "confirm before you order" checklist. */
export interface MealReminder {
  confirm: string[];
}

/**
 * Structured allergy-aware meal card for a meal activity. Frames everything as
 * flags / checks / reminders - never "safe" - so the final confirmation stays
 * with the parent.
 */
export interface MealCard {
  venue: string;
  /** Headline allergy text label, e.g. "Tree-nut allergy: flagged". */
  allergy_label: string;
  /** "What we checked" reasoning rows. */
  checked: string[];
  /** "Confirm on the day" rows. */
  confirm_on_day: string[];
  /** Flagged vs lower-risk stalls. */
  stalls: MealStall[];
  ask_kitchen: AskKitchenCard;
  reminder?: MealReminder;
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
  /** Structured allergy-aware meal card (lunch/dinner activities). */
  meal?: MealCard;
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

/* --------------------------------------------------------------------------
 * Per-explorer feature toggles (FE view-model; BE `/trips/:id/features`).
 *
 * Sparse OVERRIDES of `lib/features` keys on top of each explorer's age-band
 * defaults, one row per (trip, profile). Kept local (like the other per-trip
 * view-models) rather than in the published contract.
 * ------------------------------------------------------------------------ */

export interface TripFeatureRow {
  profile_id: string;
  /** Sparse map of feature key -> bool; absent keys fall back to the band preset. */
  overrides: Record<string, boolean>;
  updated_at?: string;
}

export interface TripFeaturesResponse {
  features: TripFeatureRow[];
}

export interface FeaturesUpdateRequest {
  profile_id: string;
  overrides: Record<string, boolean>;
}

/* --------------------------------------------------------------------------
 * Trip economics (kept local - not yet in the published contract).
 *
 * Four new per-trip surfaces shipped in the economics layer:
 *   GET /trips/:id/challenges?profile=<uuid?>  → per-child quiz/spot/photo tasks
 *   GET /trips/:id/budget                      → cash budget + exchange rate
 *   GET /trips/:id/costs                       → itemised spend per day/node
 *   GET /trips/:id/rewards                     → star → cash reward config
 * ------------------------------------------------------------------------ */

/** Kind of per-child challenge attached to a day/node. */
export type TripChallengeKind = "quiz" | "spot" | "photo" | "challenge";

/** A single per-child challenge for a trip day/node. */
export interface TripChallenge {
  id: string;
  trip_id: string;
  profile_id: string;
  day: string;
  node_ref: string;
  kind: TripChallengeKind;
  prompt: string;
  answer: string | null;
  options: string[];
  stars: number;
  created_at: string;
  updated_at: string;
}

export interface ChallengesResponse {
  challenges: TripChallenge[];
}

/** Cash budget and exchange rate for a trip. Null when not yet configured. */
export interface TripBudget {
  trip_id: string;
  base_currency: string;
  home_currency: string;
  exchange_rate: number | null;
  rate_as_of: string | null;
  cash_budget: number | null;
  daily_cash_budget: number | null;
  updated_at: string;
}

export interface BudgetResponse {
  budget: TripBudget | null;
}

/** A single itemised cost line for a trip day/node. */
export interface TripCost {
  id: string;
  trip_id: string;
  reservation_id: string | null;
  day: string;
  node_ref: string;
  label: string;
  amount_base: number | null;
  amount_home: number | null;
  currency_base: string;
  currency_home: string;
  paid: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CostsResponse {
  costs: TripCost[];
}

/** Reward config: how many stars a child needs to earn a cash reward. */
export interface TripRewardConfig {
  id: string;
  trip_id: string;
  profile_id: string | null;
  star_value: number | null;
  currency: string;
  star_target: number | null;
  star_budget: number | null;
  updated_at: string;
}

export interface RewardsResponse {
  rewards: TripRewardConfig[];
}
