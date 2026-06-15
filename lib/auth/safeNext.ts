/**
 * Resolve a post-sign-in redirect target safely.
 *
 * Accepts a relative same-origin path (e.g. `/trips`), or a same-origin ABSOLUTE
 * URL reduced to its path + query - the OAuth authorize hand-back redirects to
 * `/auth?next=https://<origin>/api/oauth/authorize?...`, an absolute same-origin
 * URL, and we must return the user there to finish the grant. Anything
 * cross-origin, protocol-relative (`//evil`), or unparseable falls back to
 * `/trips`, so this can never be turned into an open redirect.
 */
export function safeNextPath(raw: string | null | undefined, origin: string): string {
  if (!raw) return "/trips";
  if (raw.startsWith("//")) return "/trips";
  if (raw.startsWith("/")) return raw;
  try {
    const u = new URL(raw, origin || undefined);
    if (origin && u.origin === origin) return `${u.pathname}${u.search}`;
  } catch {
    /* not a parseable same-origin URL */
  }
  return "/trips";
}
