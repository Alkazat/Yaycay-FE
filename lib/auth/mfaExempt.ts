/**
 * Forced-2FA exemptions.
 *
 * Protected demo / seed accounts are exempt from the AAL2 step-up gate so an
 * AAL1 (e.g. password-grant) session reaches app content directly. This keeps
 * automated marketing screenshot capture from being blocked by the "set up your
 * authenticator" redirect. The Walker marketing demo is built in; additional
 * ids can be supplied via the `MFA_EXEMPT_USER_IDS` env var (comma-separated).
 *
 * These are non-secret Supabase user ids for accounts that intentionally hold no
 * real data; exemption only skips the second factor, nothing else.
 */
const BUILT_IN_EXEMPT = [
  "43d7f92a-e17f-44cf-9fc7-60c23b889906", // demo.walker@yaycay.example (marketing demo)
];

/** The current exemption set (built-in + env), read at call time. */
export function mfaExemptUserIds(): Set<string> {
  const fromEnv = (process.env.MFA_EXEMPT_USER_IDS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return new Set([...BUILT_IN_EXEMPT, ...fromEnv]);
}

/** Whether a user id is exempt from the forced-2FA gate. */
export function isMfaExempt(userId: string | null | undefined): boolean {
  if (!userId) return false;
  return mfaExemptUserIds().has(userId);
}
