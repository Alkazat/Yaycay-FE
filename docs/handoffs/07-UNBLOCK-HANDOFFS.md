# Unblock handoffs - FE-ready, waiting on contract + BE

**From:** Yaycay-FE
**Date:** 2026-06-14
**Writing rule:** no em-dashes.

Three FE surfaces are built and mock-backed but cannot go live until the
contract and/or BE ship their side. Each prompt below is self-contained: hand it
to the named thread as-is. The FE work behind each is small and ready; the only
thing in the way is the dependency described.

Routing recap (how the FE flips a surface live): an endpoint hits the live BE
only when `NEXT_PUBLIC_API_BASE` is set AND its flag in `lib/api/http.ts`
`SERVED` is `true`. `account` and `media` are `false` today; everything else is
`true`. Live calls go to Supabase Edge Functions where the FIRST path segment is
the function name, so any contract path with multiple leading segments deploys
as a single hyphenated function and the FE passes an explicit `livePath`
(e.g. mock `/demo/generate-day` -> live `/demo-generate-day`).

---

## 1. Affiliate code passthrough on Checkout (CONTRACT + BE)

**Status:** contract field missing. FE checkout flow is otherwise complete
(`lib/api/account.ts#createCheckoutSession`, `POST /checkout/session`).

**What we need**

- **Contract:** add an optional affiliate/referral code to
  `CheckoutSessionRequest` (`dto.ts` + `openapi.yaml` schema
  `CheckoutSessionRequest`, currently `price_id`, `trip_id?`, `success_url?`,
  `cancel_url?`):

  ```ts
  export interface CheckoutSessionRequest {
    price_id: string;
    trip_id?: string;
    success_url?: string;
    cancel_url?: string;
    /** Affiliate / referral / promo code captured by the FE (e.g. from ?code=). */
    code?: string;
  }
  ```

  Bump the contract minor (0.15 -> 0.16) and publish so the FE can `npm i`.

- **BE:** when `code` is present on `POST /checkout/session`, validate it and
  apply it to the Stripe Checkout session - as a promotion code / coupon and/or
  as affiliate attribution metadata on the session (your call on the economics;
  the FE only forwards the string). An unknown or expired code should not hard
  fail the session; decide whether to ignore it or 422, and tell us which so the
  FE can message it.

**FE follow-up once shipped (small):** capture `?code=` on entry, persist it
(localStorage), and pass `code` into `createCheckoutSession`. No flag flip
needed (`checkout` is already `served`).

---

## 2. Media sign-upload (BE ONLY - contract is done)

**Status:** contract is complete as of `@alkazat/contracts@0.15`
(`SignUploadRequest` / `SignUploadResponse` and the `/media/sign-upload` path
already exist). FE client is `lib/api/media.ts#signUpload`; `SERVED.media` is
`false`, mock route at `app/api/media/sign-upload/route.ts`.

**What we need**

- **BE:** deploy the signing handler as Edge Function **`media-sign-upload`**
  (single hyphenated name, since the contract path `/media/sign-upload` is two
  segments). For `POST { trip_id, content_type? }` from an owner of a **paid**
  trip (byo or ours), return `SignUploadResponse`:

  ```ts
  { media_ref: string;   // stable id stored on journal entries / trip content
    path: string;        // owner-prefixed Storage object path
    upload_url: string;  // short-lived signed URL the client PUTs bytes to
    token: string; }
  ```

- **BE (read side):** `media_ref` values stored on `JournalEntry.media_ref[]`
  must resolve to signed read URLs when journal entries are returned. Confirm
  where that resolution happens (journal read endpoint) so photos actually
  display, not just upload.

**FE follow-up once shipped (one line):** flip `SERVED.media = true` in
`lib/api/http.ts` and pass `livePath: "/media-sign-upload"` in
`lib/api/media.ts`. We verify upload + display end to end, then promote.

---

## 3. Account summary (CONTRACT + BE)

**Status:** no contract handler. `GET /account` and the account schema are
FE-local today (`AccountSummary` in `lib/contract-mock/types.ts`), mock route at
`app/api/account/route.ts`, `SERVED.account` is `false`. UI consumer is
`app/(app)/account/AccountClient.tsx`.

**What we need**

- **Contract:** adopt the account summary. Add `GET /account` to `openapi.yaml`
  and an `AccountSummary` schema to `dto.ts` matching what the FE already renders
  (re-using the existing `Tier = 'free' | 'byo' | 'ours'`):

  ```ts
  export interface AccountSummary {
    email: string;
    /** Secondary email for password reset / recovery. */
    secondary_email?: string;
    tier: Tier;
  }
  ```

  If BE wants to return more (e.g. billing status, retention summary), propose it
  and we will adopt it; the three fields above are the current minimum. Ship in
  the same 0.16 bump as #1 if convenient.

- **BE:** deploy Edge Function **`account`** returning the `AccountSummary` for
  the signed-in user (authenticated; JWT carried by the FE).

**FE follow-up once shipped (small):** flip `SERVED.account = true`, drop the
local `AccountSummary` in favor of the contract re-export, retire the mock route.

---

## Summary

| # | Surface | Contract | BE | FE flip |
|---|---------|----------|----|---------|
| 1 | Checkout affiliate `code` | add `code?` to `CheckoutSessionRequest` | honor `code` in Stripe session | pass `code` (no flag) |
| 2 | Media sign-upload | done (@0.15) | deploy `media-sign-upload` + read-side signing | `SERVED.media=true` + `livePath` |
| 3 | Account summary | add `GET /account` + `AccountSummary` | deploy `account` fn | `SERVED.account=true` |
