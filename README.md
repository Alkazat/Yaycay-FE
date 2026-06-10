# Yaycay - Front-end (Customer PWA)

> For families making memories.

The customer-facing PWA: the free demo, the two paid planning modes (use-our-AI
chat and BYO-AI), and the in-trip "holidaying" experience, on web, phone and
iPad from one codebase.

This thread is a **consumer** of the back-end contract (`@alkazat/contracts`).
It never invents endpoints or content fields; a genuine gap is a PR against
`Yaycay-BE`. Read `00-MODEL-CONTEXT.md` and `01-FRONTEND-HANDOFF.md` for the
shared architecture.

## Stack

- **Next.js (App Router)** + TypeScript, deployed on Vercel.
- **PWA** via `@ducanh2912/next-pwa` (install + shell baseline; offline cache and
  background sync for paid tiers land in Phase 1).
- **TanStack Query** for server-state.
- **Supabase** (`@supabase/ssr`) for auth + realtime (wired in Phase 1).
- **Design system**: vendored under `vendor/yaycay-ds` (see below).

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in when BE/infra provide values
npm run dev                  # http://localhost:3000
```

Then open `/demo` to build a sample day.

## Scripts

| Script | What |
|---|---|
| `npm run dev` | Next dev server |
| `npm run build` / `start` | Production build / serve |
| `npm run lint` | ESLint (next/core-web-vitals) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run test` | Vitest unit tests |
| `npm run test:e2e` | Playwright E2E at phone/tablet/desktop |
| `npm run format` | Prettier |

## Project layout

```
app/                      App Router routes
  (app)/                  Signed-in routes, wrapped in the AppShell nav
    layout.tsx            Persistent shell (top nav + mobile tab bar)
    trips/ profiles/ account/
  demo/                   /demo - free one-day render + countdown + signup CTA
  auth/                   /auth - placeholder (magic link + 2FA in Phase 1)
  checkout/mock/          MOCK Stripe Checkout landing (redirect target)
  api/                    MOCK route handlers (active until NEXT_PUBLIC_API_BASE is set)
components/
  ds.ts                   Single import surface for the design system
  shell/AppShell.tsx      Persistent app chrome + responsive navigation
  Countdown.tsx           "Sleeps to go" countdown to the holiday start
  renderer/               The TripContent renderer (kind routing + variant select)
lib/
  contract-mock/          TEMPORARY stand-in for @alkazat/contracts (see its README)
  render/                 Pure renderer logic (unit-tested)
  countdown.ts            Pure countdown math (unit-tested)
  entitlements.ts         Tier gating (unit-tested)
  api/                    Typed API client (mock route or live BE)
  supabase/               Browser + server clients
vendor/yaycay-ds/         Vendored Yaycay design system (tokens, fonts, components)
tests/unit/               Vitest
tests/e2e/                Playwright
```

## The design system

No npm package was supplied, so the design system is **vendored** under
`vendor/yaycay-ds` as `.jsx` source plus token CSS and webfonts. Global tokens,
fonts and base styles load once in `app/layout.tsx` via the vendored
`styles.css`; the components used in server-rendered markup also have their CSS
mirrored in `app/ds-components.css` to avoid a first-paint flash (the components
otherwise self-inject CSS only on the client). Import components from
`@/components/ds`. If a real design-system package is later published, repoint
that barrel - app code does not change.

## Contract status

The real `@alkazat/contracts` package is **not yet published**. Until it is, the
app uses the in-repo mock in `lib/contract-mock` and serves
`POST /demo/generate-day` from a local route handler. Set `NEXT_PUBLIC_API_BASE`
to point at the live BE; the API client prefers it automatically. See
`lib/contract-mock/README.md` for the swap-out steps.

## Touch hard-rules

Enforced in E2E: one scroll context per view (no nested scroll traps), min ~44px
tap targets, no hover-only controls, iOS safe-area insets honoured. A layout
that breaks touch fails the build.

## Deploy

`develop` -> staging, `main` -> production (Vercel). Smoke test on every deploy
hits `/demo` and a rendered trip.
