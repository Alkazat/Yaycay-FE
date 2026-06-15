import { MfaClient } from "./MfaClient";

/**
 * /auth/mfa - the second factor. Reached right after the first factor (the
 * 6-digit OTP form or the magic-link callback), it enrols a TOTP authenticator
 * on first sign-in or steps up an existing one, then continues to `next`.
 */
export default async function MfaPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const raw = params.next;
  const next = Array.isArray(raw) ? raw[0] : (raw ?? "/trips");
  return <MfaClient next={next} />;
}
