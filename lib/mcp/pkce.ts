/**
 * PKCE (RFC 7636) + token-generation helpers for the Yaycay OAuth server.
 * S256 is the only challenge method we accept (the plain method is disallowed
 * by OAuth 2.1).
 */
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

/** URL-safe random identifier used for codes, tokens and client ids. */
export function randomToken(bytes = 32): string {
  return randomBytes(bytes).toString("base64url");
}

/** base64url(SHA-256(input)). */
export function s256(input: string): string {
  return createHash("sha256").update(input).digest("base64url");
}

/**
 * Verify a PKCE code_verifier against the stored S256 challenge. Constant-time
 * to avoid leaking the challenge through timing.
 */
export function verifyPkce(verifier: string, challenge: string): boolean {
  if (!verifier || !challenge) return false;
  const computed = Buffer.from(s256(verifier));
  const expected = Buffer.from(challenge);
  if (computed.length !== expected.length) return false;
  return timingSafeEqual(computed, expected);
}
