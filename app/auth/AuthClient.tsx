"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { hasSupabase } from "@/lib/env";
import { safeNextPath } from "@/lib/auth/safeNext";
import { Button, Card, CardBody, Input, Banner } from "@/components/ds";

/**
 * Magic link + a one-time second factor. Real auth runs only when Supabase is
 * configured; otherwise this shows a clear notice (and the app stays open on the
 * mock). Route guards (middleware) are likewise gated on configuration.
 */
/** Friendly copy for an error handed back by the magic-link callback. */
function callbackError(code: string): string | null {
  if (code === "link_expired") return "That sign-in link has expired. Enter your email for a fresh one.";
  if (code === "missing_code") return "That sign-in link looked off. Let's try again.";
  return null;
}

export function AuthClient({
  prefillEmail,
  initialError = "",
}: {
  prefillEmail: string;
  initialError?: string;
}) {
  const router = useRouter();
  const configured = hasSupabase();
  const [email, setEmail] = useState(prefillEmail);
  const [step, setStep] = useState<"email" | "code">("email");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(callbackError(initialError));
  const [busy, setBusy] = useState(false);

  const sendLink = async () => {
    const supabase = createClient();
    if (!supabase) return;
    setBusy(true);
    setError(null);
    // Point the magic link at our callback so clicking it exchanges the code for
    // a session and lands in the app; carry any `next` so it returns there.
    const next = new URLSearchParams(window.location.search).get("next");
    const emailRedirectTo = `${window.location.origin}/auth/callback${
      next ? `?next=${encodeURIComponent(next)}` : ""
    }`;
    const { error: e } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo } });
    setBusy(false);
    if (e) setError(e.message);
    else setStep("code");
  };

  const verify = async () => {
    const supabase = createClient();
    if (!supabase) return;
    setBusy(true);
    setError(null);
    try {
      const { error: e } = await supabase.auth.verifyOtp({ email, token: code, type: "email" });
      if (e) throw e;
      // First factor done. Hand off to the second factor (enrol on first
      // sign-in, or step up an existing authenticator), carrying any `next` so
      // it returns there once the session reaches AAL2.
      const next = new URLSearchParams(window.location.search).get("next");
      const safe = safeNextPath(next, window.location.origin);
      router.push(`/auth/mfa?next=${encodeURIComponent(safe)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="yc-shell">
      <div className="yc-container yc-stack">
        <div style={{ textAlign: "center" }}>
          <Image
            src="/icons/yaycay-wordmark.png"
            alt="Yaycay"
            width={168}
            height={117}
            priority
            style={{ display: "inline-block", height: "auto", maxWidth: "70%" }}
          />
        </div>
        <h1 style={{ textAlign: "center" }}>Sign in</h1>

        {!configured ? (
          <Card variant="soft">
            <CardBody>
              <Banner tone="info" title="Almost there">
                Magic-link sign-in with a one-time code activates once Supabase is connected.
              </Banner>
              {email ? (
                <p style={{ margin: "var(--space-3) 0 0", color: "var(--text-muted)", fontWeight: 700 }}>
                  We will send your link to <strong>{email}</strong>.
                </p>
              ) : null}
            </CardBody>
          </Card>
        ) : (
          <Card>
            <CardBody>
              {step === "email" ? (
                <>
                  <Input
                    label="Your email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                  />
                  <Button variant="cta" block onClick={sendLink} disabled={busy || !email}>
                    {busy ? "Sending..." : "Send my magic link"}
                  </Button>
                </>
              ) : (
                <>
                  <Input
                    label="One-time code"
                    inputMode="numeric"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="6-digit code"
                  />
                  <Button variant="cta" block onClick={verify} disabled={busy || code.length < 6}>
                    {busy ? "Checking..." : "Verify and continue"}
                  </Button>
                </>
              )}
              {error ? (
                <p style={{ margin: 0, color: "var(--coral-500)", fontWeight: 700 }}>{error}</p>
              ) : null}
            </CardBody>
          </Card>
        )}

        <p style={{ color: "var(--text-muted)", fontWeight: 700, textAlign: "center" }}>
          For families making memories.
        </p>
      </div>
    </main>
  );
}
