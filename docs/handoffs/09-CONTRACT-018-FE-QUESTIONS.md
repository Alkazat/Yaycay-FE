# FE questions for BE: contract 0.18 adoption

**From:** Yaycay-FE. **Date:** 2026-06-14.
**Re:** `@alkazat/contracts` advanced `0.15 -> 0.18`. Three surfaces the FE can
light up the moment BE confirms the handlers are live. Writing rule: no em-dashes.

The contract now *defines* these shapes/paths, but a contract type is not a
deployed handler. The FE keeps a per-endpoint `SERVED` flag: `true` routes to the
live BE, `false` falls back to the in-repo mock. We will not flip a flag (and
risk a live 404/500 for users) until you confirm the endpoint is actually served
on the configured `NEXT_PUBLIC_API_BASE`.

## 1. Account - `GET /account` and `PATCH /account`

Contract 0.18 adds `AccountSummary` (`email`, `tier`, `secondary_email`, ...) and
`AccountUpdate` (`{ secondary_email?: string | null }`, send `null` to clear).
The FE account page currently renders against the mock.

- **Is `GET /account` deployed and serving `AccountSummary`?**
- **Is `PATCH /account` deployed and accepting `AccountUpdate`?**
- Auth: confirm it expects the parent's Supabase JWT as `Authorization: Bearer`
  plus the anon `apikey` header (same as the trips endpoints).

If both are live, the FE flips `SERVED.account = true` and wires the recovery
email editor. If only `GET` is live, say so and we will ship read-only first.

## 2. Media - `POST /media/sign-upload`

The `/media/sign-upload` path is in the contract. The FE uses it for journal
photo uploads (currently mock).

- **Is `POST /media/sign-upload` deployed?**
- Confirm the request/response shape the live handler expects vs the contract,
  and the storage bucket + any size/type limits we should enforce client-side.

If live, the FE flips `SERVED.media = true`.

## 3. Checkout affiliate code - `CheckoutSessionRequest.code`

Contract 0.18 adds an optional `code` to `CheckoutSessionRequest` ("affiliate
discount/attribution code from the /go/<slug> funnel"). `POST /checkout/session`
is already `SERVED` and live.

- **Does the live `POST /checkout/session` honour `code`** (apply the discount /
  record attribution), or is it accepted-and-ignored for now?
- Confirm the canonical capture path: is the code delivered via `/go/<slug>` ->
  cookie, or as a `?code=` query param the FE should read and forward?
- What should the FE do with an invalid/expired code: pass it through and let
  Stripe/BE reject, or validate first?

This one is FE work (capture + forward); we just need the behaviour confirmed so
we match it.

## Pointer: connector hardening

Separately, the MCP connector's BE items (durable shared OAuth store, honouring
the `plan_trip` `x-yaycay-source: connector` markers for `ai_jobs` + Content
Review, per-grant scoped service tokens) are in
`docs/handoffs/08-MCP-CONNECTOR-HANDOFF.md`. Not part of the 0.18 adoption above,
flagging so it is not lost.

## What unblocks on a "yes"

| Endpoint | FE change on confirmation |
| --- | --- |
| `GET /account` | flip `SERVED.account`, render live account |
| `PATCH /account` | recovery-email editor |
| `POST /media/sign-upload` | flip `SERVED.media`, live journal photo upload |
| `code` on checkout | capture `/go/<slug>` or `?code=`, forward to checkout |
