/**
 * ============================================================================
 * MOCK CONTRACT TYPES - TEMPORARY
 * ============================================================================
 * These mirror the canonical content model in 00-MODEL-CONTEXT.md (section 5)
 * and the FE handoff. They exist ONLY so the app builds and runs before the
 * real `@alkazat/contracts` package is published.
 *
 * WHEN THE REAL CONTRACT LANDS:
 *   1. `npm i @alkazat/contracts@^0.8.0` (GitHub Packages; see ./README.md).
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

/* --------------------------------------------------------------------------
 * Grown-ups booking checklist (persisted ticks)
 * ------------------------------------------------------------------------ */

export interface ChecklistItem {
  id: string;
  label: string;
  group: string;
  done: boolean;
}

/* --------------------------------------------------------------------------
 * Packing lists (per profile + a shared family list)
 * ------------------------------------------------------------------------ */

export interface PackingItem {
  id: string;
  label: string;
  note?: string;
  qty?: number;
  checked: boolean;
}

export interface PackingSection {
  id: string;
  title: string;
  items: PackingItem[];
}

export interface PackingList {
  /** Profile id, or "family" for the shared list. */
  id: string;
  label: string;
  sections: PackingSection[];
}

export type PackingAction =
  | { action: "tick"; list_id: string; item_id: string; checked: boolean }
  | { action: "add"; list_id: string; section_id: string; label: string; qty?: number }
  | { action: "delete"; list_id: string; item_id: string }
  | { action: "reset" };

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

// Full lifecycle enum per the published contract (v0.8). The FE only drives the
// middle of this range, but BE can return any value, so render defensively.
/* --------------------------------------------------------------------------
 * Per-profile progress (done items, keyed by stable activity id)
 * ------------------------------------------------------------------------ */

export interface ProgressState {
  trip_id: string;
  profile_id: string;
  /** Stable activity ids that are ticked done. Never keyed by label text. */
  done: string[];
}

/* --------------------------------------------------------------------------
 * Reward economy (stars)
 * ------------------------------------------------------------------------ */

/** Where a star came from. */
export type StarSource = "game" | "challenge";

export interface StarsState {
  trip_id: string;
  profile_id: string;
  stars: number;
  /** Idempotency keys already claimed, e.g. "d_2:challenge". */
  claims: string[];
}

export interface StarClaimRequest {
  profile_id: string;
  day_id: string;
  source: StarSource;
}

export type TripStatus =
  | "draft"
  | "planning"
  | "ready"
  | "holidaying"
  | "complete"
  | "archived";

/**
 * The list view of a trip (`GET /trips` -> `{ trips: TripSummary[] }`). Adds the
 * two derived fields the FE list needs on top of the stored trip columns:
 * `day_count` (number of days in the content) and `data_kept` (whether the trip
 * data is still retained, i.e. not past its disposal date).
 */
export interface TripSummary {
  id: string;
  destination: string;
  start_date?: string;
  end_date?: string;
  timezone?: string;
  currency?: string;
  tier: Tier;
  status: TripStatus;
  retention_expires_at?: string;
  /** Number of days currently planned in the trip content. */
  day_count: number;
  /** False once the trip is past its retention/disposal date. */
  data_kept: boolean;
  created_at?: string;
}

/** A single trip's stored metadata (`POST /trips` -> `Trip`). */
export interface Trip {
  id: string;
  destination: string;
  start_date?: string;
  end_date?: string;
  timezone?: string;
  currency?: string;
  tier: Tier;
  status: TripStatus;
  /** When trip data is scheduled for disposal unless a keep-token extends it. */
  retention_expires_at?: string;
  created_at?: string;
}

export interface ListTripsResponse {
  trips: TripSummary[];
}

export interface CreateTripRequest {
  destination: string;
  start_date?: string;
  end_date?: string;
  timezone?: string;
  currency?: string;
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

/** Request body for `POST /checkout/session`. */
export interface CheckoutSessionRequest {
  /** The Stripe price id of a known, active catalogue product. */
  price_id: string;
  /** Optional trip the purchased tier applies to. */
  trip_id?: string;
  /** Redirect targets; fall back to server defaults when omitted. */
  success_url?: string;
  cancel_url?: string;
}

export interface CheckoutSessionResponse {
  /** The Stripe-hosted Checkout URL to redirect the customer to. */
  url: string;
  /** The Stripe Checkout Session id. */
  session_id: string;
}

/* --------------------------------------------------------------------------
 * Journal (notes + star ratings, per profile/day)
 * ------------------------------------------------------------------------ */

export interface JournalEntry {
  id: string;
  trip_id: string;
  /** Optional child profile this entry is tagged to. */
  profile_id?: string | null;
  body: string;
  /** media_ref ids from `/media/sign-upload`, resolved to signed URLs on read. */
  media_ref: string[];
  created_at: string;
}

/** Request body for `POST /trips/{tripId}/journal` (paid: byo or ours). */
export interface JournalEntryInput {
  body?: string;
  profile_id?: string;
  media_ref?: string[];
}

export interface JournalListResponse {
  entries: JournalEntry[];
}

/* --------------------------------------------------------------------------
 * CLIENT-ONLY journal model
 *
 * The contract `JournalEntry` carries `{ body, profile_id?, media_ref }`. The
 * FE journal UI captures a richer per-day memory (a star rating, a mood label,
 * and the day it belongs to) that the contract does not model. These local-only
 * types back the mock store, the keepsake export and the journal screen; they
 * never describe a contract wire shape. A genuine gap is a PR against Yaycay-BE.
 * ------------------------------------------------------------------------ */

export interface JournalEntryLocal {
  id: string;
  trip_id: string;
  profile_id: string;
  day_id: string;
  note?: string;
  /** 1-5 stars, or undefined when only a note was left. */
  stars?: number;
  /** Mood label, e.g. "happy" | "loved" | "wow" | "tired" | "funny". */
  mood?: string;
  /** References to print-grade media (signed-URL flow). */
  media_ref?: string[];
  created_at: string;
}

/** Payload to create a local journal entry (id + created_at assigned by BE). */
export interface JournalEntryLocalInput {
  trip_id: string;
  profile_id: string;
  day_id: string;
  note?: string;
  stars?: number;
  mood?: string;
  media_ref?: string[];
}

/* --------------------------------------------------------------------------
 * Media (signed-URL upload for print-grade photos)
 * ------------------------------------------------------------------------ */

/** Request body for `POST /media/sign-upload` (paid: byo or ours). */
export interface SignUploadRequest {
  /** The trip the media belongs to (must be a paid trip the caller owns). */
  trip_id: string;
  content_type?: string;
}

export interface SignUploadResponse {
  /** Stable reference stored in journal entries / trip content. */
  media_ref: string;
  /** Storage object path (owner-prefixed). */
  path: string;
  /** Short-lived signed URL to PUT the file to. */
  upload_url: string;
  /** Upload token for the signed URL. */
  token: string;
}

/* --------------------------------------------------------------------------
 * BYO-AI connector status
 * ------------------------------------------------------------------------ */

export type ConnectorStatus = "active" | "revoked";

export interface Connector {
  id: string;
  trip_id: string;
  label?: string | null;
  scopes: string[];
  status: ConnectorStatus;
  last_used_at?: string | null;
  created_at: string;
}

export interface ConnectorsListResponse {
  connectors: Connector[];
}

/** Request body for `POST /connectors/byo-ai` (tier=byo). */
export interface ByoConnectorRequest {
  trip_id: string;
  label?: string;
}

export interface ByoConnectorResponse {
  connector_id: string;
  /** The scoped MCP token to add to the parent's own AI as a connector. */
  token: string;
  /** The MCP endpoint URL the token authenticates against. */
  mcp_url: string;
}

/**
 * CLIENT-ONLY richer connector status for the BYO-AI UI. The contract
 * `ConnectorStatus` is `active | revoked`; the FE may want to render extra
 * transient states (not yet connected, error) that have no contract counterpart.
 */
export type ConnectorUiStatus = "not_connected" | "connected" | "error";

/* --------------------------------------------------------------------------
 * Signup capture (POST /signup/capture) - account + email, synced to Brevo
 * ------------------------------------------------------------------------ */

export interface SignupCaptureRequest {
  email: string;
  name?: string;
  /** Funnel source, e.g. `website-demo` or `fe-demo`. */
  source?: string;
  /** Marketing consent state captured at signup. */
  consent: boolean;
  /** Optional free-form attributes synced to Brevo. */
  attributes?: Record<string, unknown>;
}

export interface SignupCaptureResponse {
  contact_id: string;
  status: "created" | "updated";
  synced_to_brevo?: boolean;
}

/* --------------------------------------------------------------------------
 * Auth (second factor)
 * ------------------------------------------------------------------------ */

export interface TwoFactorVerifyRequest {
  code: string;
}

export interface TwoFactorVerifyResponse {
  verified: boolean;
}

/* --------------------------------------------------------------------------
 * Demo endpoint DTOs (POST /demo/generate-day)
 * ------------------------------------------------------------------------ */

export interface DemoChildProfile {
  name: string;
  age?: number;
  /** Explorer mode used to pick the variant block. */
  mode?: "little" | "standard" | "explorer" | "explorer_plus";
  interests?: string[];
  /** Dietary flags surfaced to adults as safety notes. */
  dietary?: string[];
  /** Medical flags surfaced to adults as safety callouts. */
  medical?: string[];
}

export interface DemoGenerateDayRequest {
  destination: string;
  /** Optional day to theme the plan around. */
  date?: string;
  child: DemoChildProfile;
}

/**
 * The demo returns one AI-built day plus a grown-ups teaser. Per the contract
 * there is NO trip object here; the FE drives the demo countdown from the date
 * the family entered.
 */
export interface DemoGenerateDayResponse {
  day: TripDay;
  grownups_teaser: string;
  generated_by?: "ai" | "fallback";
}

/* --------------------------------------------------------------------------
 * Errors
 * ------------------------------------------------------------------------ */

export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    details?: string[];
  };
}

/* --------------------------------------------------------------------------
 * AI surfaces (v0.3): planning chat + ingestion
 *
 * NB: the contract references its content-model `Day`/`Booking`; the FE content
 * model names these `TripDay` / `ActivityBooking`, so they are used here.
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

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

/** Request body for `POST /trips/{tripId}/plan/chat` (use-our-AI, tier=ours). */
export interface PlanChatRequest {
  messages: ChatMessage[];
}

/**
 * The chat response is a `text/event-stream`. Each SSE `data:` frame is one of
 * these JSON objects; the stream ends with a literal `data: [DONE]`.
 */
export type PlanChatEvent =
  | { start: true; generated_by: "ai" | "fallback" }
  | { delta: string }
  | { done: true; job_id: string | null }
  | { error: string };

/** A photo of a receipt/booking/ticket for the vision model. */
export interface IngestImage {
  /** e.g. `image/jpeg`, `image/png`. */
  media_type: string;
  /** base64-encoded image bytes (no `data:` prefix). */
  data: string;
}

/** Request body for `POST /trips/{tripId}/ingest` (paid: byo or ours). */
export interface IngestRequest {
  /** A note, pasted confirmation, or OCR text. One of text/image is required. */
  text?: string;
  image?: IngestImage;
  /** Optional targeting hint. */
  hint?: { day_id?: string; moment_id?: string };
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
