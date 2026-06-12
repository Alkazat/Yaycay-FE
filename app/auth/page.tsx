import { PREFILL_EMAIL_PARAM } from "@/lib/constants";
import { AuthClient } from "./AuthClient";

/** /auth - magic link + one-time 2FA (active once Supabase is configured). */
export default async function AuthPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const raw = params[PREFILL_EMAIL_PARAM];
  const email = Array.isArray(raw) ? raw[0] : (raw ?? "");
  return <AuthClient prefillEmail={email} />;
}
