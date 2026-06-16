"use client";

/**
 * Cross-app "signed in" hint cookie. The marketing site (www.yaycay.ai) and the
 * app (app.yaycay.ai) share the registrable domain yaycay.ai, so a cookie scoped
 * to `.yaycay.ai` set here is readable by the marketing site, which uses it to
 * greet a returning visitor with a "Keep planning / travelling" CTA instead of
 * "Build your free day".
 *
 * It is deliberately a HINT, never an auth token: it carries only a coarse phase
 * (no identifier, no PII) and gates nothing. The real session stays in Supabase's
 * HttpOnly cookies; this one is readable by JS on purpose so the static
 * marketing site can read it.
 */

export type SessionPhase = "planning" | "travelling";

const NAME = "yc_state";
const MAX_AGE = 60 * 60 * 24 * 60; // 60 days; refreshed on every authed app load.

/**
 * The widest domain we can share with the marketing site. On *.yaycay.ai we
 * scope to `.yaycay.ai` so the cookie reaches both apps; anywhere else (preview
 * URLs, localhost) we fall back to a host-only cookie, which simply has no
 * cross-app effect.
 */
function domainAttr(): string {
  const host = (typeof window !== "undefined" ? window.location.hostname : "").split(":")[0];
  if (host === "yaycay.ai" || host.endsWith(".yaycay.ai")) return "; Domain=.yaycay.ai";
  return "";
}

function secureAttr(): string {
  return typeof window !== "undefined" && window.location.protocol === "https:" ? "; Secure" : "";
}

/** The current hint, or null when absent / not a recognised phase. */
export function getSessionHint(): SessionPhase | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(/(?:^|;\s*)yc_state=(planning|travelling)/);
  return m ? (m[1] as SessionPhase) : null;
}

export function setSessionHint(phase: SessionPhase): void {
  if (typeof document === "undefined") return;
  document.cookie = `${NAME}=${phase}; Path=/; Max-Age=${MAX_AGE}; SameSite=Lax${secureAttr()}${domainAttr()}`;
}

export function clearSessionHint(): void {
  if (typeof document === "undefined") return;
  // Clear with the same Domain it was set with, or the browser keeps it.
  document.cookie = `${NAME}=; Path=/; Max-Age=0; SameSite=Lax${secureAttr()}${domainAttr()}`;
}
