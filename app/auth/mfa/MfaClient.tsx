"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button, Card, CardBody, Input, Banner } from "@/components/ds";
import { safeNextPath } from "@/lib/auth/safeNext";

/**
 * Second factor, enforced on every sign-in. Both the 6-digit OTP form
 * (AuthClient) and the magic-link callback route the freshly-signed-in (AAL1)
 * user here. If they have no authenticator yet we enrol one (TOTP: show the QR +
 * secret, verify a code); if they already have one we step it up. Either way the
 * session is elevated to AAL2 before they reach the app.
 *
 * All of this runs on the browser Supabase client against the current session;
 * there is no BE round-trip and no credential leaves the device.
 */

type Phase = "loading" | "enroll" | "verify" | "error";

export function MfaClient({ next }: { next: string }) {
  // Same-origin only (relative path, or the absolute OAuth authorize hand-back).
  const dest = safeNextPath(next, typeof window !== "undefined" ? window.location.origin : "");
  const [phase, setPhase] = useState<Phase>("loading");
  const [factorId, setFactorId] = useState("");
  const [qr, setQr] = useState("");
  const [secret, setSecret] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const supabase = createClient();
      // Mock / unconfigured: no second factor to run, continue into the app.
      if (!supabase) {
        window.location.href = dest;
        return;
      }
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        window.location.href = `/auth?next=${encodeURIComponent(dest)}`;
        return;
      }
      // Already stepped up (e.g. a refresh): nothing to do.
      const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (aal?.currentLevel === "aal2") {
        window.location.href = dest;
        return;
      }
      const { data: factors, error: listErr } = await supabase.auth.mfa.listFactors();
      if (listErr) {
        if (!cancelled) {
          setError(listErr.message);
          setPhase("error");
        }
        return;
      }
      const all = factors?.all ?? [];
      const verified = all.find((f) => f.factor_type === "totp" && f.status === "verified");
      if (verified) {
        if (!cancelled) {
          setFactorId(verified.id);
          setPhase("verify");
        }
        return;
      }
      // First-time setup: clear any abandoned unverified factors, then enrol.
      for (const f of all) {
        if (f.factor_type === "totp" && f.status === "unverified") {
          await supabase.auth.mfa.unenroll({ factorId: f.id });
        }
      }
      const { data: enrolled, error: enrolErr } = await supabase.auth.mfa.enroll({
        factorType: "totp",
      });
      if (enrolErr || !enrolled) {
        if (!cancelled) {
          setError(enrolErr?.message ?? "Could not start authenticator setup.");
          setPhase("error");
        }
        return;
      }
      if (!cancelled) {
        setFactorId(enrolled.id);
        setQr(enrolled.totp.qr_code);
        setSecret(enrolled.totp.secret);
        setPhase("enroll");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [dest]);

  const submit = async () => {
    const supabase = createClient();
    if (!supabase) return;
    setBusy(true);
    setError(null);
    try {
      const { data: challenge, error: chErr } = await supabase.auth.mfa.challenge({ factorId });
      if (chErr || !challenge) throw chErr ?? new Error("Could not start verification.");
      const { error: vErr } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challenge.id,
        code,
      });
      if (vErr) throw vErr;
      window.location.href = dest;
    } catch (err) {
      setError(err instanceof Error ? err.message : "That code did not check out.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="yc-shell">
      <div className="yc-container yc-stack">
        <h1 style={{ textAlign: "center" }}>Two-factor</h1>
        <Card>
          <CardBody>
            {phase === "loading" ? (
              <p style={{ margin: 0, color: "var(--text-muted)", fontWeight: 700 }}>Loading...</p>
            ) : phase === "error" ? (
              <Banner tone="warning" title="Setup unavailable">
                {error ?? "Something went wrong. Please try signing in again."}
              </Banner>
            ) : (
              <>
                {phase === "enroll" ? (
                  <>
                    <Banner tone="info" title="Set up your authenticator">
                      Scan this with an authenticator app (Google Authenticator, 1Password,
                      Authy), then enter the 6-digit code it shows.
                    </Banner>
                    {qr ? (
                      <div style={{ textAlign: "center", margin: "var(--space-4) 0" }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={qr}
                          alt="Authenticator QR code"
                          width={180}
                          height={180}
                          style={{ maxWidth: "100%", height: "auto" }}
                        />
                      </div>
                    ) : null}
                    {secret ? (
                      <p
                        style={{
                          margin: "0 0 var(--space-3)",
                          color: "var(--text-muted)",
                          fontWeight: 700,
                          wordBreak: "break-all",
                        }}
                      >
                        Can&apos;t scan? Enter this key: <code>{secret}</code>
                      </p>
                    ) : null}
                  </>
                ) : (
                  <Banner tone="info" title="Enter your code">
                    Open your authenticator app and enter the current 6-digit code.
                  </Banner>
                )}
                <Input
                  label="6-digit code"
                  inputMode="numeric"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="123456"
                />
                <Button variant="cta" block onClick={submit} disabled={busy || code.length < 6}>
                  {busy ? "Verifying..." : phase === "enroll" ? "Verify and finish setup" : "Verify"}
                </Button>
                {error ? (
                  <p style={{ margin: 0, color: "var(--coral-500)", fontWeight: 700 }}>{error}</p>
                ) : null}
              </>
            )}
          </CardBody>
        </Card>
      </div>
    </main>
  );
}
