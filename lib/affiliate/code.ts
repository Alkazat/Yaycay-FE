// Affiliate / referral code capture.
//
// The Website affiliate funnel (`/go/<slug>`) lands the visitor on the FE with a
// `?code=` query param. We persist it client-side so it survives navigation and
// sign-in, then forward it on checkout (`CheckoutSessionRequest.code`). BE
// resolves it to a Stripe promotion code / attribution; an unknown code is
// ignored server-side, so we never block checkout on it.

const KEY = "yc_affiliate_code";

/** Codes are short, opaque slugs; guard against junk before persisting. */
const CODE_RE = /^[A-Za-z0-9_-]{1,64}$/;

/** Read `?code=` from the current URL and persist it. Safe to call on every mount. */
export function captureAffiliateCode(): void {
  if (typeof window === "undefined") return;
  const code = new URLSearchParams(window.location.search).get("code");
  if (code && CODE_RE.test(code)) {
    try {
      window.localStorage.setItem(KEY, code);
    } catch {
      // Private mode / storage disabled: a missed attribution is non-fatal.
    }
  }
}

/** The persisted affiliate code, if any, for forwarding on checkout. */
export function getAffiliateCode(): string | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    return window.localStorage.getItem(KEY) ?? undefined;
  } catch {
    return undefined;
  }
}
