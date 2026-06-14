# MCP connector + OAuth - handoff

**From:** Yaycay-FE
**Date:** 2026-06-14
**Writing rule:** no em-dashes.

The FE now ships a working remote **MCP server** so a parent can connect their
own AI (Claude, ChatGPT/Codex, Gemini) and have it plan trips through the Yaycay
contract. It is OAuth-protected and self-service: clients self-register, the
parent signs in once and approves, no tokens to copy. This doc covers what is
live, how it works, and the few pieces that need BE-grade hardening before a
production rollout.

## What shipped (FE)

- **MCP endpoint** `POST/GET/DELETE /api/mcp` (Streamable HTTP) exposing tools:
  `list_trips`, `get_trip`, `get_trip_content`, `get_packing_list` (scope
  `yaycay.read`) and `plan_trip` (scope `yaycay.plan`). Each tool calls the
  Yaycay contract as the connected parent (live BE when `NEXT_PUBLIC_API_BASE`
  is set, otherwise the in-repo mock).
- **OAuth 2.1 authorization server** (Yaycay is its own AS), delegating the
  human sign-in to the existing Supabase `/auth`:
  - Discovery: `/.well-known/oauth-protected-resource` (RFC 9728) and
    `/.well-known/oauth-authorization-server` (RFC 8414).
  - Dynamic Client Registration `POST /api/oauth/register` (RFC 7591).
  - Authorization-code + PKCE (S256 only): `/api/oauth/authorize` (with a real
    consent screen at `/connect/authorize`) and `/api/oauth/token`
    (code exchange + refresh-token rotation).
- **`/connect`** - the one-paste setup page with per-assistant instructions and
  copy buttons (Claude chat + Claude Code/Cowork, ChatGPT + Codex, Gemini, and a
  generic `mcpServers` config). The planner's "Bring your own AI" card links here.

Verified end to end against the production build: discovery -> register ->
consent -> code -> PKCE token exchange -> authenticated `tools/list` and
`tools/call list_trips` returning real data. Unit tests cover PKCE, the store,
request validation, the token exchange + refresh, and tool scope-gating.

## How a parent connects (the happy path)

1. Their AI reads `/.well-known/oauth-protected-resource`, finds the AS,
   registers itself, and starts the auth flow.
2. They are sent to Yaycay, sign in with Supabase (`/auth`, which now honours a
   `next` param so it returns to the flow), and approve on the consent screen.
3. The AI exchanges the code for an access token and calls `/api/mcp`. Done.

## What BE needs to harden

### 1. Durable, shared OAuth store (REQUIRED before prod)

`lib/mcp/store.ts` ships an **in-memory** `OAuthStore` (registered clients,
auth codes, grants + the parent's Supabase tokens). It is single-instance and
non-durable: state is lost on redeploy / cold start and is not shared across
serverless instances, so tokens issued on one instance will not validate on
another. Production must implement the same `OAuthStore` interface backed by a
shared store (Supabase tables or Redis). Suggested tables: `oauth_clients`,
`oauth_codes` (short TTL), `oauth_grants` (with the parent's Supabase refresh
token, encrypted at rest). Swapping the implementation is the only change needed
on the FE side.

### 2. Supabase token lifecycle

Each grant captures the parent's Supabase access + refresh token at consent time
so tools can call the contract as them. The in-memory build uses the stored
access token directly and does **not** refresh it, so a long-lived connector
session will see the Supabase access token expire (~1h). The durable store
should refresh using the stored Supabase refresh token (or BE should mint a
dedicated scoped service token per grant and avoid stashing user refresh tokens
at all - preferred). Decide which and tell us if the tool-side call contract
changes.

### 3. Confirm the auth model vs the existing `POST /connectors/byo-ai`

The contract already has `ByoConnectorRequest`/`ByoConnectorResponse`
(`{ connector_id, token, mcp_url }`), i.e. a **per-trip scoped token** model.
The shipped OAuth flow is **account-scoped** (all the parent's trips, gated by
read/plan scopes) which is what general MCP clients expect. Two options:
   - keep OAuth as the primary path and treat `/connectors/byo-ai` as a
     power-user "static token" alternative (the MCP endpoint can accept either a
     grant token or a BE-issued connector token in `verifyMcpToken`), or
   - make `/connectors/byo-ai` mint a per-trip OAuth grant.
Our recommendation: OAuth as primary; have `verifyMcpToken` also accept connector
tokens once BE issues them. Flag your preference.

### 4. Scopes + revocation

Scopes are coarse (`yaycay.read`, `yaycay.plan`). If you want per-trip or
per-surface scoping, propose the vocabulary. We also need a revocation surface
(list + revoke a parent's connectors) - the existing `GET /connectors` +
`ConnectorStatus` can back a "Connected assistants" management UI; say the word
and we will build it.

## Open question for product

Per-assistant deep links: where an official one exists we link to it
(`claude.ai/settings/connectors`, `chatgpt.com` connectors). For the CLI tools we
emit the exact `claude mcp add` / Codex `config.toml` / `gemini mcp add` snippet.
If any vendor ships a true one-click "add this MCP server" deep link, point us at
it and we will wire the button.

---

## Round 2 - response to the Admin thread (2026-06-14)

Acting on `HANDOFF-connectors-FE-response.md`. What the FE shipped in response and
what is still on BE.

### Shipped (FE)

- **Parent self-service "Connected assistants" screen** at `/account/connections`
  (linked from the account page and `/connect`): per-assistant list with
  read / can-write badges, connected + last-used dates, and a **Disconnect** kill
  switch. Backed by the OAuth grant store, which is exactly what `verifyMcpToken`
  reads, so a parent revoke cuts access on the next call.
- **Revocation is centrally effective.** Grants now carry `status` and a stable
  `connection_id` (survives token refresh). `revokeConnection` flips status and
  drops the token indexes; `getGrantByAccessToken` returns null for revoked or
  expired grants, so `verifyMcpToken` rejects immediately.
- **`plan_trip` is observable.** The tool now sends `x-yaycay-source: connector`
  and `x-yaycay-connection-id: <id>` on its `POST /trips/:id/plan/chat` call.
- **last-used tracking** stamped on every authenticated MCP call.

### Still on BE (the coupling)

1. **One shared revocation state across surfaces.** Parent (this screen) and
   Admin (`GET /admin/connectors` + `POST /admin/connectors/{id}/revoke`) must
   read/write the **same** grant records, and the contract `/connectors` +
   `/connectors/{id}/revoke` should map to them. That requires the durable shared
   `OAuthStore` (item 1 above). Until then, the FE in-memory store only makes
   revoke effective within a single instance.
2. **Honour the `plan_trip` markers.** On a request carrying
   `x-yaycay-source: connector`, BE must write an `ai_jobs` row with
   `source='connector'` (so it shows in Admin Jobs and counts against the daily
   cap) and route the written `trip_content` through Content Review / flag it.
   This is the child-safety item; the FE marker is in place and waiting on BE.
3. **Token security (confirmed direction).** Per Admin, mint a dedicated scoped
   service token per grant in the durable store and do not stash the parent's
   Supabase refresh token. The grant model already isolates the token fields, so
   this is a store-implementation change, not an API change.

### Auth model - resolved

Admin confirmed account-scoped OAuth as primary and does not need per-trip
tokens. `/connectors/byo-ai` stays as the optional static-token alternative; both
kinds must be listed + revocable through the shared store. `verifyMcpToken` is
ready to also accept BE-issued connector tokens once they exist.
