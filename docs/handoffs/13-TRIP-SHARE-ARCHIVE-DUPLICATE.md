# BE spec: trip archive / duplicate / share

**From:** Yaycay-FE. **For:** Yaycay-BE. **Date:** 2026-06-17.
**Why:** the trips home now has a per-tile ⋯ menu (Share, Duplicate, Archive) and
an Archive list, plus a public read-only shared view. The FE is built and live
behind mocks; flip the `SERVED` flags in `lib/api/http.ts` as each endpoint lands.
Writing rule: no em-dashes.

All four are mock-backed today (`SERVED.archiveTrip/duplicateTrip/shareTrip/sharedTrip
= false`). FE shapes live in `lib/api/trips.ts`.

## 1. Archive / restore - `POST /trips/:id/archive`

- Body: `{ "archived": boolean }`
- Returns: the updated `Trip` row (with `status: "archived"` when archived, else a
  normal status such as `"ready"`).
- Auth: owner's parent JWT + anon apikey.
- Archiving is a soft state, never a delete. Archived trips stay listable (they
  carry `status: "archived"`) so the FE can show them in the Archive list.
- `GET /trips` must keep returning archived trips (the FE partitions on `status`).

## 2. Duplicate - `POST /trips/:id/duplicate`

- Body: none.
- Returns: a new `Trip` the caller owns: a fresh id, `tier: "free"`, `status:
  "draft"`, the source destination/dates copied, and the day content deep-copied.
- Upgrading the copy to a full holiday is the normal checkout/paywall.
- Auth: owner's parent JWT.

## 3. Share - `POST /trips/:id/share`

- Body: `{ "email"?: string }`
- Returns: `{ "share_url": string, "emailed": boolean }`
  - `share_url` is a public, read-only link (the FE expects `<origin>/shared/<token>`).
  - When `email` is present, BE also sends the recipient an invite and sets
    `emailed: true`.
- Mint a non-guessable, revocable token mapped to the trip. Consider an expiry and
  a way to unshare/revoke later.
- Auth: owner's parent JWT.

## 4. Resolve a shared trip (public) - `GET /shared/:token`

- No auth (public link). Returns:
  ```
  { "shared_by": string, "content": TripContent }
  ```
  `content` is the same `TripContent` the owner view uses, so the FE renders it
  read-only. `shared_by` is a friendly display name for the "Shared by …" line.
- Return 404 for an unknown/revoked/expired token.
- This is the only place a non-owner reads a trip, so scope it tightly: token to
  one trip, read-only, no profile/PII beyond the itinerary + display name.

## Recipient "duplicate into my account" (next step)

The shared view currently sends recipients to sign-up (`/auth?next=/trips`) to make
their own. To duplicate the *specific* shared trip into a new account, add:

- `POST /shared/:token/duplicate` (auth) → duplicates the shared trip into the
  caller's trips (same shape as #2) and returns the new `Trip`.

Tell us when that exists and we will wire the shared view's "Plan my own version"
button straight to it.

## FE flip checklist

| Endpoint | FE flag | Drop mock route |
| --- | --- | --- |
| `POST /trips/:id/archive` | `SERVED.archiveTrip` | `app/api/trips/[id]/archive` |
| `POST /trips/:id/duplicate` | `SERVED.duplicateTrip` | `app/api/trips/[id]/duplicate` |
| `POST /trips/:id/share` | `SERVED.shareTrip` | `app/api/trips/[id]/share` |
| `GET /shared/:token` | `SERVED.sharedTrip` | `app/api/shared/[token]` |
