"use client";

import { useState, type FormEvent } from "react";
import { verifyProfilePin } from "@/lib/api/profiles";
import { Card, CardBody } from "@/components/ds";

/**
 * The Grown-ups gate: a parent/carer enters their 4-digit PIN to unlock the
 * Grown-ups view. Verification is server-side; this is a child-safety speed-bump
 * (low-entropy PIN), not a hardened boundary.
 */
export function GrownupsPinGate({
  profileId,
  onUnlock,
}: {
  profileId: string;
  onUnlock: () => void;
}) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!/^[0-9]{4}$/.test(pin)) {
      setError("Enter your 4-digit PIN.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await verifyProfilePin(profileId, pin);
      if (res.verified) {
        onUnlock();
        return;
      }
      if (res.locked_until) {
        setError("Too many tries - the gate is locked for a bit. Try again later.");
      } else {
        const left =
          typeof res.attempts_remaining === "number"
            ? ` - ${res.attempts_remaining} ${res.attempts_remaining === 1 ? "try" : "tries"} left`
            : "";
        setError(`That PIN didn't match${left}.`);
      }
      setPin("");
    } catch {
      setError("Couldn't check that PIN. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card variant="soft">
      <CardBody title="Grown-ups only">
        <p style={{ margin: 0, color: "var(--text-muted)", fontWeight: 700 }}>
          Enter the Parent / Carer PIN to open the Grown-ups view.
        </p>
        <form
          onSubmit={submit}
          style={{ display: "flex", gap: "var(--space-2)", marginTop: "var(--space-3)" }}
        >
          <input
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={4}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
            aria-label="4-digit PIN"
            autoFocus
            style={{
              width: "6rem",
              padding: "var(--space-2) var(--space-3)",
              fontSize: "1.25rem",
              letterSpacing: "0.3em",
              textAlign: "center",
              border: "2.5px solid var(--royal-200)",
              borderRadius: "var(--radius-md)",
            }}
          />
          <button type="submit" className="yc-btn yc-btn--primary yc-btn--sm" disabled={busy}>
            {busy ? "Checking..." : "Unlock"}
          </button>
        </form>
        {error ? (
          <p style={{ margin: "var(--space-2) 0 0", color: "var(--coral-500)", fontWeight: 700 }}>
            {error}
          </p>
        ) : null}
      </CardBody>
    </Card>
  );
}
