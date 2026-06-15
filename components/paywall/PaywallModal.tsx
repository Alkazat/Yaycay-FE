"use client";

import { useMutation } from "@tanstack/react-query";
import { createCheckoutSession } from "@/lib/api/account";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ds";
import type { Product } from "@/lib/paywall";

/**
 * Paywall modal: shows a catalogue product and opens Stripe Checkout for it
 * (`createCheckoutSession`, which forwards any captured affiliate code). The
 * charge is authoritative on Stripe/BE; entitlement is granted by the webhook.
 */
export function PaywallModal({
  product,
  tripId,
  onClose,
}: {
  product: Product;
  tripId?: string;
  onClose: () => void;
}) {
  const checkout = useMutation({
    mutationFn: () => createCheckoutSession({ price_id: product.id, trip_id: tripId }),
    onSuccess: ({ url }) => {
      window.location.href = url;
    },
  });

  return (
    <Modal title={product.name} onClose={onClose}>
      <p style={{ margin: 0 }}>{product.blurb}</p>
      <p style={{ margin: "var(--space-3) 0", fontSize: "var(--fs-h3)", fontWeight: 800 }}>
        US${product.priceUsd}
      </p>
      <Button variant="cta" block onClick={() => checkout.mutate()} disabled={checkout.isPending}>
        {checkout.isPending ? "Opening checkout..." : `Continue - US$${product.priceUsd}`}
      </Button>
      {checkout.isError ? (
        <p style={{ margin: "var(--space-2) 0 0", color: "var(--coral-500)", fontWeight: 700 }}>
          We couldn&rsquo;t open checkout. Give it another go?
        </p>
      ) : null}
      <button
        type="button"
        onClick={onClose}
        style={{
          marginTop: "var(--space-3)",
          background: "transparent",
          border: "none",
          color: "var(--text-muted)",
          fontWeight: 700,
          cursor: "pointer",
          width: "100%",
        }}
      >
        Not now
      </button>
    </Modal>
  );
}
