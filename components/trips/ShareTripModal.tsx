"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { shareTrip } from "@/lib/api/trips";
import { Modal } from "@/components/ui/Modal";
import { Button, Input } from "@/components/ds";
import type { TripSummary } from "@/lib/contract-mock/types";

/**
 * Share a trip read-only. Optionally emails a recipient; always returns a public
 * link to copy. Recipients open a read-only view and can duplicate it into their
 * own (paid) trip - "hi, have a look at the trip we did."
 */
export function ShareTripModal({ trip, onClose }: { trip: TripSummary; onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [copied, setCopied] = useState(false);

  const share = useMutation({
    mutationFn: () => shareTrip(trip.id, email),
  });
  const result = share.data;

  const copy = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.share_url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard blocked; the link is visible to copy by hand
    }
  };

  return (
    <Modal title={`Share ${trip.destination}`} onClose={onClose}>
      <div className="yc-stack" style={{ gap: "var(--space-3)" }}>
        <p style={{ margin: 0, color: "var(--text-muted)", fontWeight: 700 }}>
          Send someone a read-only view of this trip. They can look around and duplicate it into
          their own holiday - they can&rsquo;t change yours.
        </p>

        <Input
          label="Email (optional)"
          type="email"
          placeholder="friend@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <Button variant="cta" block onClick={() => share.mutate()} disabled={share.isPending}>
          {share.isPending ? "Creating link…" : email.trim() ? "Send & create link" : "Create link"}
        </Button>

        {share.isError ? (
          <p style={{ margin: 0, color: "var(--coral-500)", fontWeight: 700 }}>
            We couldn&rsquo;t create the share link. Give it another go?
          </p>
        ) : null}

        {result ? (
          <div className="yc-stack" data-testid="share-result" style={{ gap: "var(--space-2)" }}>
            {result.emailed ? (
              <p style={{ margin: 0, color: "var(--meadow-600, #2f8a4e)", fontWeight: 800 }}>
                ✓ Invite emailed to {email.trim()}.
              </p>
            ) : null}
            <div style={{ display: "flex", gap: "var(--space-2)", alignItems: "stretch" }}>
              <input
                readOnly
                aria-label="Shareable link"
                value={result.share_url}
                onFocus={(e) => e.currentTarget.select()}
                style={{
                  flex: 1,
                  minWidth: 0,
                  borderRadius: "var(--radius-md)",
                  border: "2px solid var(--sand-200)",
                  padding: "0 12px",
                  fontWeight: 600,
                  background: "var(--surface-sunk)",
                }}
              />
              <Button variant="secondary" onClick={copy}>
                {copied ? "Copied!" : "Copy"}
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </Modal>
  );
}
