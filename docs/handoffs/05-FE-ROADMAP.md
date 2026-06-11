# Yaycay FE - Roadmap (amendments + feature additions)

> Derived from `00-LANDSCAPE-ADDENDUM.md` and the PRD. Mock-first per the existing
> `SERVED` pattern: each domain ships with mock types + routes + UI now and flips
> to live when BE ships its handler. Any content field not in the contract is a PR
> on `Yaycay-BE` (see section D). Writing rule: no em-dashes.

## A. Amendments to what is already built

| # | Amendment | Mockable now? | Effort |
|---|---|---|---|
| A1 | Three-way explorer modes - add `standard` baseline beside `little`/`explorer_plus`; mode toggle so Explorer+ is reachable | yes | S |
| A2 | Progress = doing - per-activity done-check rows (per profile, stable activity id); day completion, day-nav rings, overview + trip progress | yes (mock `trip_progress`) | L |
| A3 | Renderer content enrichment - did-you-know, fact bubbles, typed challenges (`quiz`/`spot`/`photo`/`challenge`) with reveal, weather strip, hotel/move badge | yes (needs content fields, section D) | M |
| A4 | Read-aloud (TTS) per activity (never the answer) | yes (FE only) | S |
| A5 | Allergy/safety surfacing - kid-page callouts on food activities; EpiPen protocol + per-venue avoid-lists in grown-ups | yes | S |
| A6 | Grown-ups guide enrichment - per-day logistics cards, persisted booking checklist, accommodation phases | yes | M |
| A7 | Journal enrichment - mood picker + export keepsake; photo upload UI | mood/export yes; photo upload blocked on `/media/sign-upload` | M |

## B. New features

| # | Feature | Mockable now? | Effort |
|---|---|---|---|
| B1 | Reward economy - star bank, SGD value, per-child balance, claim flow | yes (mock stars) | M |
| B2 | Per-day mini-games (tap-collect / colouring / spot-it), win -> star + progress | yes (`day.game` + local completion) | L |
| B3 | Star challenges - per-child per-day reveal + claim | yes | M |
| B4 | Packing lists - per child + family, sections, tick, CRUD, print, reset | yes (mock `packing`) | L |
| B5 | Map - Leaflet + geo pins + per-activity deep-link + offline fallback | yes (`location`) | M |
| B6 | Offline cache + sync - persist query cache (read); sync on reconnect | read yes; sync blocked on BE | M |

## C. Platform / live integration (needs infra)

| # | Work | Needs |
|---|---|---|
| C1 | Auth - magic link + 2FA, route guards on `(app)` | Supabase creds + `/auth/2fa/verify` (served) |
| C2 | Real planning chat - SSE UI for `POST /trips/:id/plan/chat` | served; build against a mock stream now |
| C3 | Flip served endpoints live | `@alkazat/contracts` published + API deployed + `NEXT_PUBLIC_API_BASE` |

## D. Contract additions to raise on BE

Content fields: `variants.standard`, `activity.challenge` (typed + answer),
`activity.facts[]`, `day.did_you_know`, `day.weather`, `day.hotel`/move,
`day.game`, `day.star_challenge`, `location.zoom`; `ChildProfile` medical flags.
Endpoints (already deferred in `CONTRACT-STATUS.md`): stars, packing, progress,
journal (+ mood/stars/media_ref), `media/sign-upload`.

## E. Recommended sequence

1. A1 modes -> A3 content enrichment -> A5 safety (renderer foundation)
2. A2 progress model (foundational; gates games/stars/completion)
3. B1 stars + B3 star challenges + B2 mini-games (the reward loop)
4. A6 grown-ups + A7 journal (mood/export) + B4 packing
5. B5 map + A4 read-aloud
6. B6 offline read-cache, then C2 chat (mock stream)
7. C1 auth + C3 go-live flip; photo upload + sync when BE ships media/journal

Cross-cutting every step: touch hard-rules, reduced-motion, >=44px, brand voice;
unit-test the pure logic (3-way variant selection, progress derivation, star
math, packing counts) and E2E the journeys.

## Status

- **Step 1 (A1 + A3 + A5)**: in progress / this PR.
- Everything else: queued in the order above.
