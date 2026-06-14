"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { verifyTwoFactor } from "@/lib/api/auth";
import { hasSupabase } from "@/lib/env";
import { Button, Card, CardBody, Input, Banner } from "@/components/ds";

/**
 * Magic link + a one-time second factor. Real auth runs only when Supabase is
 * configured; otherwise this shows a clear notice (and the app stays open on the
 * mock). Route guards (middleware) are likewise gated on configuration.
 */
export function AuthClient({ prefillEmail }: { prefillEmail: string }) {
  const router = useRouter();
  const configured = hasSupabase();
  const [email, setEmail] = useState(prefillEmail);
  const [step, setStep] = useState<"email" | "code">("email");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const sendLink = async () => {
    const supabase = createClient();
    if (!supabase) return;
    setBusy(true);
    setError(null);
    const { error: e } = await supabase.auth.signInWithOtp({ email });
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
      // Second factor on every sign-in.
      const { verified } = await verifyTwoFactor(email, code);
      if (!verified) throw new Error("That code did not check out.");
      // Honour a same-origin `next` (e.g. returning to an OAuth connector
      // authorization). Reject anything that is not a local path to avoid an
      // open redirect; API routes need a full navigation, not client routing.
      const next = new URLSearchParams(window.location.search).get("next");
      if (next && next.startsWith("/") && !next.startsWith("//")) {
        window.location.href = next;
      } else {
        router.push("/trips");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="yc-shell">
      <div className="yc-container yc-stack">
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
