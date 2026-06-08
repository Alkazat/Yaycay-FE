import { PREFILL_EMAIL_PARAM } from "@/lib/constants";

/**
 * /auth - placeholder. Magic link + one-time 2FA on every sign-in lands in
 * Phase 1. For now this confirms the email handed over from the demo / website.
 */
export default async function AuthPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const raw = params[PREFILL_EMAIL_PARAM];
  const email = Array.isArray(raw) ? raw[0] : raw;

  return (
    <main className="yc-shell">
      <div className="yc-container yc-stack" style={{ textAlign: "center" }}>
        <h1>Almost there</h1>
        <p style={{ fontSize: "var(--fs-lg)" }}>
          Sign-in with a magic link and a one-time code is coming next.
        </p>
        {email ? (
          <p style={{ color: "var(--text-muted)", fontWeight: 700 }}>
            We will send your link to <strong>{email}</strong>.
          </p>
        ) : null}
        <p style={{ color: "var(--text-muted)", fontWeight: 700 }}>
          For families making memories.
        </p>
      </div>
    </main>
  );
}
