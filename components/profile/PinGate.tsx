"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { verifyProfilePin } from "@/lib/api/profiles";
import { Button, Card, CardBody } from "@/components/ds";

interface PinGateProps {
  /** Guardian profile whose PIN unlocks the Grown-ups view. */
  profileId: string;
  profileName: string;
  /** Called once a correct PIN is entered. */
  onUnlock: () => void;
  onCancel: () => void;
}

/**
 * The Grown-ups child-safety gate. Prompts for the guardian's 4-digit PIN and
 * verifies it server-side (mock today). This is a UX speed-bump, not a hardened
 * boundary - 4-digit PINs are low-entropy by design. On success the caller
 * unlocks Grown-ups for the session.
 */
export function PinGate({ profileId, profileName, onUnlock, onCancel }: PinGateProps) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);

  const verify = useMutation({
    mutationFn: () => verifyProfilePin(profileId, pin),
    onSuccess: (ok) => {
      if (ok) {
        onUnlock();
      } else {
        setError("That PIN didn't match. Try again.");
        setPin("");
      }
    },
    onError: () => setError("Couldn't check that PIN. Please try again."),
  });

  const canSubmit = /^\d{4}$/.test(pin) && !verify.isPending;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Grown-ups PIN"
      data-testid="pin-gate"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(16, 24, 40, 0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "var(--space-4)",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <Card variant="soft" style={{ width: "100%", maxWidth: 360 }}>
        <CardBody title="Grown-ups only">
          <p style={{ margin: 0, color: "var(--text-muted)", fontWeight: 700 }}>
            Enter {profileName}&apos;s 4-digit PIN to open the Grown-ups area.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (canSubmit) verify.mutate();
            }}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-3)",
              marginTop: "var(--space-3)",
            }}
          >
            <input
              type="password"
              inputMode="numeric"
              autoComplete="off"
              autoFocus
              maxLength={4}
              value={pin}
              aria-label="4-digit PIN"
              data-testid="pin-input"
              onChange={(e) => {
                setPin(e.target.value.replace(/\D/g, "").slice(0, 4));
                if (error) setError(null);
              }}
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "var(--fs-xl)",
                letterSpacing: "0.5em",
                textAlign: "center",
                padding: "var(--space-3)",
                borderRadius: "var(--radius-md)",
                border: "2.5px solid var(--sand-300)",
                minHeight: "var(--control-md)",
              }}
            />

            {error ? (
              <p
                role="alert"
                data-testid="pin-error"
                style={{ margin: 0, color: "var(--coral-500)", fontWeight: 700 }}
              >
                {error}
              </p>
            ) : null}

            <div style={{ display: "flex", gap: "var(--space-3)" }}>
              <Button type="submit" disabled={!canSubmit} data-testid="pin-submit">
                {verify.isPending ? "Checking..." : "Unlock"}
              </Button>
              <button type="button" onClick={onCancel} className="yc-btn yc-btn--secondary">
                Cancel
              </button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
