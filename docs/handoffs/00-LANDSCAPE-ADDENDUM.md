# Landscape addendum - what evolved

> Read `00-MODEL-CONTEXT.md` first. This addendum records how the product's
> functional and non-functional landscape has grown since the original model
> context, drawn from the reverse-engineered PRD of the "Our Singapore
> Adventure" prototype (the single-file proof of the full kid-facing
> experience). It is the shared basis for the back-end, admin and AI-prompts
> handoffs that sit beside it.
>
> Writing rule (all docs): no em-dashes; use hyphens, commas, or rewrite.

## Why this exists

The prototype was a private, PIN-locked, single-file web app for one family's
12-day Singapore trip, with all state in `localStorage` and no server. It is not
the product we are shipping, but it is the most complete statement we have of
what the **kid-facing holidaying experience should contain**. The job now is to
lift those features out of one hand-authored HTML file and into the multi-tenant
Yaycay platform: AI-generated per family, contract-driven, RLS-isolated, synced,
and paid for.

This addendum lists the feature domains the prototype surfaced that the platform
must now support, and flags the prototype's known defects so we do not rebuild
them.

## New / expanded feature domains

1. **Explorer modes as a first-class axis.** Three render modes, not two:
   `standard` (baseline), `little` (Lenny: simpler read-aloud copy, bigger type,
   no challenge blocks, daily tap games), `explorer_plus` (deeper fact + harder
   quiz + a per-day reflective capture). The content model's `variants` must
   cover all three; the prototype's bug of an unreachable Explorer+ mode is a
   warning, not a spec.

2. **Reward economy (stars).** A per-child star ledger. Stars are earned (one per
   completed mini-game day for the youngest; one per claimed per-day star
   challenge for older children), claimed idempotently once per child per day,
   and carry a configurable cash value (prototype: 1 star = 3 SGD) shown as a
   "star bank". This is a new data domain and a new set of endpoints.

3. **Per-day kid mini-games.** A themed game per day (tap-to-collect, colouring,
   spot-it), tied to that day's itinerary. Completion records progress and grants
   a star. Game type + theme are authored content (AI-generated, admin-curated).

4. **Star challenges.** Per-child, per-day, age-differentiated question with a
   reveal-answer then claim-star flow.

5. **Travel journal, enriched.** Per activity: mood, 1-5 star rating, rich text,
   and photos. Per profile (separation enforced server-side, unlike the
   prototype). Plus an "export keepsake" that becomes a natural **photo-book**
   upsell.

6. **Packing lists.** Per child and a shared "family" list, sectioned, with
   per-item tick state and full CRUD (edit/add/delete), print, and reset.
   Generated from trip + ages + weather.

7. **Grown-ups guide, logistics-grade.** Per-day bookings, multi-currency costs,
   transport with fare estimates, tips, and a **persisted** booking checklist
   (the prototype's did not persist). Organised by accommodation phase.

8. **Allergy / safety layer (cross-cutting, critical).** A child may carry
   anaphylaxis flags (prototype: nuts and legumes). Safety guidance is woven
   through the whole product: per-venue avoid-lists, cross-contamination rules,
   buffet/restaurant flagging, an EpiPen protocol, and packing entries. This is
   sensitive medical data and accuracy is a safety requirement, not a nicety.

9. **Geo / map.** Every venue is geo-coded; each activity deep-links to a map
   that flies to the venue. Offline fallback required.

10. **Richer activity content.** Did-you-know intros, fact bubbles, typed
    challenges (`quiz` / `spot` / `photo` / `challenge`), read-aloud-friendly
    copy, hotel/move badges, weather strips.

11. **Progress derived from doing.** Trip progress is computed from ticking real
    activities, keyed by a **stable activity id** (never label text), per
    profile.

## Non-functional landscape

- **Accessibility is a requirement, not a retrofit:** reduced-motion, >=44px
  targets, visible focus, ARIA roles, keyboard activation, read-aloud (TTS) copy,
  one done-control per activity.
- **Offline-tolerant:** the trip is readable and journal/photo capture works
  offline for paid tiers; sync on reconnect (last-writer-wins per journal row,
  media uploads resume).
- **Privacy:** the customer app is `noindex` and PIN-feel private; the platform
  replaces the prototype's client-side PIN with real auth (magic link + 2FA) and
  RLS. Children's data is minimised and parent-owned.
- **Performance / storage:** photos are compressed (prototype: <=1200px, JPEG
  ~0.75) and held as print-grade media behind signed URLs, not base64 in the
  client.
- **Brand + tone:** kid-first, parent-discreet; warm, sentence case in UI;
  display lockups uppercase; tagline fixed: "For families making memories."

## Prototype defects to NOT reproduce (lessons)

- Journal user resolution was broken (all entries fell into one bucket): enforce
  per-profile ownership server-side via RLS, never client globals.
- Explorer+ mode was orphaned and unreachable: modes must be selectable and the
  content for each must always be produced.
- The grown-ups booking checklist did not persist: every checklist is real state.
- Activity progress was keyed by label text (rename/dupe collisions): key by
  stable id.
- Hard-coded year ("2025") and stale labels leaked into content: dates and
  content are generated/validated, with a year/consistency check.
- Client-side PIN and base64 photo storage do not scale or secure: real auth,
  real media storage, real quotas.

## How the threads divide this

- **Back-end** (`02-BACKEND-HANDOFF.md`): the data model, endpoints, AI harness,
  payments and safety that produce and serve all of the above behind the
  contract.
- **Admin** (`03-ADMIN-HANDOFF.md`): prompt/model management, AI-content QA
  (allergy correctness above all), reward-economy configuration, job
  troubleshooting, audit.
- **AI prompts** (`04-AI-PROMPTS-HANDOFF.md`): the versioned generation tasks
  that turn a destination + dates + family into all of this content, with
  guardrails and schema-valid output.
