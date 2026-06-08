# contract-mock (temporary)

This directory is a **stand-in for `@yaycay/contracts`**, which is owned and
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

1. `npm i @yaycay/contracts@^0.1.0` (pin the version).
2. Replace every import of `@/lib/contract-mock/types` with `@yaycay/contracts`.
3. Point `lib/api/demo.ts` at the live endpoint by setting `NEXT_PUBLIC_API_BASE`
   (the client already prefers it over the local mock route when present).
4. Delete this directory.

## Rules (from the model context)

- Never read a field or call an endpoint that is not in the contract.
- A genuine gap is a PR against `Yaycay-BE`, never a local invention here.
