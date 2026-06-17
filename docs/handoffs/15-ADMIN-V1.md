# RFC + BE spec: Admin v1

**From:** Yaycay-FE. **For:** Yaycay-BE + product/admin.
**Date:** 2026-06-17.
**Why:** the new consumer surfaces (trip Share / Duplicate / Archive in handoff 13,
account profile + transactions in handoff 14) open up support, safety, and finance
needs that have no home today. There is no Admin surface in the app yet: no
`/admin` route, no role gating, and the contract's `role: 'user' | 'admin'` on
`AccountSummary` is currently unused. This spec proposes a mock-first Admin v1 and
the BE endpoints it needs. Writing rule: no em-dashes.

This is net-new. Everything here is cross-user data, so unlike handoffs 13/14
(which the FE could stand up behind mocks immediately) Admin is BE-gated from day
one: the FE cannot mock another user's account. The FE will still build behind
`SERVED` flags + local mock data so the screens exist before BE lands.

---

## 0. Access model

- New route group `/admin`, gated on `account.role === 'admin'`.
- Middleware: non-admins get a 404/redirect, same posture as the auth gate.
- **BE must authorize server-side on every admin endpoint** (never trust the FE
  gate). Admin endpoints live under `/admin/*` and require an admin JWT.
- All admin mutations should be **audit-logged** (actor, action, target, at).

---

## 1. Share token governance (P0)

A shared link is the only public, unauthenticated read path into a trip
(handoff 13, `GET /shared/:token`). Admin needs to see and kill them.

- `GET /admin/shares` -> list active share tokens:
  ```
  { "shares": [ {
      "token": "shr_...", "trip_id": "t_sg", "owner_email": "...",
      "created_at": "...", "expires_at": "..." | null,
      "view_count": 12, "revoked": false
  } ] }
  ```
- `POST /admin/shares/:token/revoke` -> revoke a token (404s the public link
  thereafter). Returns the updated row.
- Filters: by owner, by trip, revoked vs active. Surfaces leaked/abused links and
  trips shared unusually widely.

## 2. Data-deletion queue + true purge (P0)

`AccountSummary.deletion_requested_at` already exists and currently goes nowhere.
Consumer trips are **archive-only by design** (no permanent delete), so GDPR /
retention purges must live admin-side.

- `GET /admin/deletion-requests` -> accounts with `deletion_requested_at` set,
  oldest first, with retention context.
- `POST /admin/accounts/:id/purge` -> hard-delete the account's data (trips,
  media, journal, chat). Irreversible; audit-logged; ideally a two-step confirm.
- `POST /admin/trips/:id/delete` -> hard-delete a single trip (distinct from the
  consumer archive, which only sets `status: "archived"`).

## 3. Trip support actions (P1)

Support staff acting on a user's behalf. Reuses the handoff-13 verbs, admin-scoped:

- `GET /admin/trips?owner=:email` -> a user's trips (active + archived).
- `POST /admin/trips/:id/archive` and `/restore`, `/duplicate` -> same semantics
  as the consumer endpoints but executed by an admin for the owner.

## 4. Account support view (P1)

- `GET /admin/accounts?query=:email` -> find an account.
- `GET /admin/accounts/:id` -> profile (name, emails, tier, `two_factor_enrolled`,
  `deletion_requested_at`, created_at) + a trips/transactions summary.
- `PATCH /admin/accounts/:id` -> edit recovery email / name on the user's behalf;
  reset 2FA enrolment. No password access; reuse the existing auth flows.

## 5. Transactions + refunds (P1, depends on handoff 14)

Once transactions are Stripe-sourced with `trip_id` (handoff 14):

- `GET /admin/transactions?owner=:email|trip=:id` -> charges, filterable.
- `POST /admin/transactions/:id/refund` -> issue a Stripe refund + adjust
  entitlement. Audit-logged.
- `POST /admin/accounts/:id/grant` -> comp an entitlement (e.g. `tier: "ours"`)
  without a charge, for support/goodwill.
- Per-trip revenue rollups become possible now that each line carries `trip_id`.

---

## FE plan (mock-first)

- `/admin` route group gated on `role === 'admin'`; add `/admin` to a new
  admin-only middleware check (NOT the public allowlist).
- New `SERVED` flags, all `false` to start: `adminShares`, `adminDeletionQueue`,
  `adminAccounts`, `adminTrips`, `adminTransactions`.
- Local mock data + `app/api/admin/*` routes so the screens render pre-BE.
- Reuse existing DS table styles (see the transactions/data tables in
  `app/(app)/account/AccountClient.tsx`).

## Phasing / recommendation

- **P0 (ship first):** Share-token governance (#1) and the deletion queue (#2).
  Both close real gaps we just opened (a public read path; an existing field that
  goes nowhere) and are the least ambiguous to spec.
- **P1:** support views + refunds (#3, #4, #5), gated behind handoff 14 for the
  finance pieces.

## Open questions for product/BE

1. Who gets `role: 'admin'` and how is it granted (manual DB flag, or an admin
   management screen later)?
2. Audit log: does BE already have one we write to, or is it net-new?
3. Purge: hard-delete immediately, or soft-delete with a grace window first?
4. Impersonation / "view as user" - in scope for v1, or read-only support views
   only? (Read-only is the safer default.)

## Flip checklist

| Capability | FE flag | BE endpoints |
| --- | --- | --- |
| Share governance | `adminShares` | `GET /admin/shares`, `POST /admin/shares/:token/revoke` |
| Deletion queue + purge | `adminDeletionQueue` | `GET /admin/deletion-requests`, `POST /admin/accounts/:id/purge`, `POST /admin/trips/:id/delete` |
| Trip support | `adminTrips` | `GET /admin/trips`, archive/restore/duplicate (admin-scoped) |
| Account support | `adminAccounts` | `GET`/`PATCH /admin/accounts/:id`, search |
| Transactions + refunds | `adminTransactions` | `GET /admin/transactions`, refund, grant |
