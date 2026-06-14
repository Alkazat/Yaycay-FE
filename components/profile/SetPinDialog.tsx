"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { setProfilePin } from "@/lib/api/profiles";
import { Button, Card, CardBody } from "@/components/ds";

interface SetPinDialogProps {
  profileId: string;
  profileName: string;
  /** Whether a PIN is already configured (changes the copy). */
  hasPin: boolean;
  onDone: () => void;
  onCancel: () => void;
}

const pinInputStyle: React.CSSProperties = {
  fontFamily: "var(--font-display)",
  fontSize: "var(--fs-xl)",
  letterSpacing: "0.5em",
  textAlign: "center",
  padding: "var(--space-3)",
  borderRadius: "var(--radius-md)",
  border: "2.5px solid var(--sand-300)",
  minHeight: "var(--control-md)",
};

/**
 * Set or change a parent/carer's 4-digit Grown-ups PIN. Asks for the PIN twice to
 * avoid typos, then writes it via `POST /profiles/:id/pin` (write-only; the PIN
 * is never returned, only `pin_set` flips true).
 */
export function SetPinDialog({
  profileId,
  profileName,
  hasPin,
  onDone,
  onCancel,
}: SetPinDialogProps) {
  const queryClient = useQueryClient();
  const [pin, setPin] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);

  const save = useMutation({
    mutationFn: () => setProfilePin(profileId, pin),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
      onDone();
    },
    onError: () => setError("Couldn't save that PIN. Please try again."),
  });

  const valid = /^\d{4}$/.test(pin);
  const matches = pin === confirm;
  const canSave = valid && matches && !save.isPending;

  const onDigits = (set: (v: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    set(e.target.value.replace(/\D/g, "").slice(0, 4));
    if (error) setError(null);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Set Grown-ups PIN"
      data-testid="set-pin"
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
        <CardBody title={hasPin ? `Change ${profileName}'s PIN` : `Set ${profileName}'s PIN`}>
          <p style={{ margin: 0, color: "var(--text-muted)", fontWeight: 700 }}>
            Pick a 4-digit PIN for the Grown-ups area. Keep it away from little eyes.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (canSave) save.mutate();
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
              aria-label="New 4-digit PIN"
              data-testid="set-pin-input"
              onChange={onDigits(setPin)}
              style={pinInputStyle}
            />
            <input
              type="password"
              inputMode="numeric"
              autoComplete="off"
              maxLength={4}
              value={confirm}
              aria-label="Confirm PIN"
              data-testid="set-pin-confirm"
              onChange={onDigits(setConfirm)}
              style={pinInputStyle}
            />

            {confirm.length > 0 && !matches ? (
              <p role="alert" style={{ margin: 0, color: "var(--coral-500)", fontWeight: 700 }}>
                Those PINs don&apos;t match.
              </p>
            ) : null}
            {error ? (
              <p
                role="alert"
                data-testid="set-pin-error"
                style={{ margin: 0, color: "var(--coral-500)", fontWeight: 700 }}
              >
                {error}
              </p>
            ) : null}

            <div style={{ display: "flex", gap: "var(--space-3)" }}>
              <Button type="submit" disabled={!canSave} data-testid="set-pin-save">
                {save.isPending ? "Saving..." : "Save PIN"}
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
