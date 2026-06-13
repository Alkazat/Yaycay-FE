# Back-end priorities (from the FE)

> What to build next, in order, to unlock the most product value. The FE is
> effectively complete and live-ready: every screen is built, the served
> endpoints are wired to the live API, and every deferred endpoint already has a
> mock route the FE falls back to. So the bottleneck is now BE. As each item
> ships, tell FE and it flips one `SERVED` flag (`lib/api/http.ts`).
> Writing rule: no em-dashes.

## Live today (v0.8) - working end to end
`demo-generate-day`, `signup-capture`, `auth-2fa-verify`, `GET /trips`,
`POST /trips`, `GET /trips/:id`, `PATCH /trips/:id/content`,
`POST /trips/:id/plan/chat` (SSE), `POST /trips/:id/ingest`. The FE calls these
on the live Edge Functions with the Supabase `apikey` and, on authenticated
routes, the signed-in user's JWT.

## Priority order

### P0 - Make generation real (stop falling back)
The single biggest gap. The live demo returns the **`fallback` template**
(`generated_by: "fallback"`) - identical content across destinations. Same risk
applies to full trip generation and plan-chat. Get the AI harness actually
producing destination-specific, rich, schema-valid content (per-mode variants,
`facts`, typed `challenge`, `did_you_know`, allergy `safety`). Details:
`BE-DEMO-FALLBACK.md` and `04-AI-PROMPTS-HANDOFF.md`. **The FE already renders
all of it the moment it is sent.** Without P0, the product is templates.

### P1 - Auth end to end + real trips data
Unlocks the entire signed-in app (trips home, the renderer, plan-chat). The FE
ships magic-link + one-time 2FA UI, a route guard, and attaches the user JWT.
Confirm: magic link + `auth-2fa-verify` complete a session; the gateway accepts
the FE's `Authorization: Bearer <user JWT>` (aal2); `GET /trips` and
`GET /trips/:id` return that user's real trips. Today these 401/empty without a
real signed-in user.

### P2 - Profiles + progress
`GET /profiles` and `GET|PATCH /trips/:id/progress`. Profiles gate the whole
per-child experience (explorer modes, journal, stars); progress is the "doing"
loop (done-checks -> day/trip completion). Both fully built on the FE behind the
mock. Note the contract's profile mode enum is `little|explorer|explorer_plus`
(baseline `explorer`); FE currently uses `standard` and will rename on wiring.

### P3 - Journal + media
`GET|POST /trips/:id/journal` and `POST /media/sign-upload`. The memory book and
print-grade photos. FE has the editor (notes, mood, 1-5 stars), the keepsake
export, and the sign-upload + object-URL preview wired to the mock; real photo
persistence/display needs the media endpoints.

### P4 - Reward economy + packing + grown-ups checklist
`GET /trips/:id/stars` + `POST /trips/:id/stars/claim` (idempotent per child per
day per source), `GET|PATCH /trips/:id/packing` (tick + CRUD), and
`GET|PATCH /trips/:id/grownups/checklist` (persisted ticks). These are
FE-shaped (see `05-FE-ROADMAP.md` section D) and need adding to the published
contract so the FE can pin types instead of the local mock. High engagement, all
built on the FE.

### P5 - Stripe checkout + webhook
`POST /checkout/session` `{ price_id, trip_id? } -> { url, session_id }` and
`POST /webhooks/stripe` (idempotent entitlement -> `purchases`). Monetisation.
The demo -> signup funnel works without it, so it follows the experience being
real, but it gates actual purchase + the data-keep token.

### P6 - BYO-AI connector + MCP
`POST /connectors/byo-ai`, `GET /connectors`, `POST /mcp`. The $59 tier. The FE
shows a connector-status screen behind the mock. Last, after the use-our-AI path
is solid.

## Cross-cutting
- **Publish the contract per release** so consumers pin `@alkazat/contracts`
  instead of the FE's local stub. The FE-shaped P4 endpoints need to enter the
  contract.
- **`generated_by` everywhere** (demo, plan-chat, ingest) so the FE and Admin
  can show ai-vs-fallback and you can alert on a high fallback rate.
- **Notify FE when each endpoint ships** - flipping it from mock to live is a
  one-line `SERVED` change plus a type swap.

## TL;DR for sequencing
P0 (real AI) and P1 (auth + trips) first - together they turn the live app from
"templated demo" into "a real signed-in trip". Then P2/P3 light up the per-child
experience and memory book, P4 the fun + parent surfaces, P5 the money, P6 BYO.
