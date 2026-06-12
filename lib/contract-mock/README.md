# contract-mock (temporary)

This directory is a **stand-in for `@alkazat/contracts`**, which is owned and
published by the BE thread (`Yaycay-BE`) and was not yet available when the FE
scaffold was built.

It contains:

- `types.ts` - TypeScript types mirroring the canonical content model in
  `00-MODEL-CONTEXT.md` section 5 (Holiday -> Days -> Moments -> Activities)
  plus the demo endpoint DTOs.
- `generateDemoDay.ts` - a mock implementation of the BE's
  `POST /demo/generate-day` (the "one AI action") so the demo flow, renderer,
  and countdown can be built and tested before the real API exists.

## When the real contract is published

The package is **`@alkazat/contracts`** on GitHub Packages (registry already
mapped in the repo `.npmrc`). Per `Yaycay-BE/docs/CONTRACT-STATUS.md` the latest
is **v0.8**, but only some endpoints are served yet (see the `SERVED` map in
`lib/api/http.ts`).

1. Provide a `read:packages` token: locally `export NODE_AUTH_TOKEN=ghp_xxx`; in
   CI add a `PACKAGES_TOKEN` secret and write the auth line before `npm ci`.
2. `npm i @alkazat/contracts@^0.8.0` and pin it.
3. Replace imports of `@/lib/contract-mock/types` with `@alkazat/contracts`
   **for the served endpoints**; keep the mock types for the still-deferred ones
   until their handler ships.
4. Set `NEXT_PUBLIC_API_BASE` to the BE host (staging:
   `https://staging.api.yaycay.ai`). The client (`lib/api/http.ts`) routes only
   `SERVED` endpoints to the live API and keeps the rest on the mock.
5. As each deferred endpoint ships, flip its flag in `SERVED` and delete its mock
   route + types. When all are live, delete this directory.

## Rules (from the model context)

- Never read a field or call an endpoint that is not in the contract.
- A genuine gap is a PR against `Yaycay-BE`, never a local invention here.
