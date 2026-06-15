# MCP change protocol (FE view)

**Writing rule:** no em-dashes.

The BYO-AI MCP is a contract shared across BE, FE, and ADMIN. This protocol makes
sure any FE change with MCP implications is caught and propagated. The canonical
copy lives in Yaycay-BE (`docs/handoff/MCP-CHANGE-PROTOCOL.md`); this is the FE
view.

## Single source of truth

`@alkazat/contracts` exposes `MCP_TOOLS`, `CONNECTOR_DEFAULT_SCOPES`,
`MCP_OAUTH_SCOPES`, `TRIP_INTENT_FIELDS`, and `MCP_TABLES` from
`packages/contracts/src/mcp-surface.ts` (in Yaycay-BE). When the FE OAuth AS or
MCP code needs tool names or the scope vocabulary, **import them from the package
rather than hardcoding**, so FE cannot drift from BE/ADMIN. BE's
`contracts:validate` step is the hard drift check against the live MCP code.

## What the guard catches

`.github/workflows/mcp-guard.yml` flags any PR that touches an MCP-sensitive FE
surface (`lib/mcp/`, `lib/supabase/service`, the OAuth AS routes under `app/`,
connect/consent UI) and stays red until acknowledged (the `mcp-impact: reviewed`
label or a ticked `- [x] MCP impact reviewed` in the PR description).

## Dimensions to review

Intent, Context, Data, Scopes, Tools, Auth, Cross-repo propagation, Stakeholders.
See the canonical protocol in Yaycay-BE for the full descriptions.

## FE specifics

- The OAuth AS issues tokens whose hash BE's `/mcp` validates. Any change to the
  token shape, scopes, or grant lifecycle is an MCP implication for BE.
- The "Connected assistants" UI consumes BE's unified `GET /connectors`; changes
  to that contract are MCP implications.
- Once the AS is built, its tool/scope constants must come from `@alkazat/contracts`.
