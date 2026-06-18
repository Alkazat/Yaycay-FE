"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Card, CardBody } from "@/components/ds";

/** Lightweight overlay modal: backdrop-click + Escape close, centred card. */
export function Modal({
  title,
  onClose,
  children,
  maxWidth = 460,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  maxWidth?: number;
}) {
  // Portal to <body> so the overlay escapes any transformed / overflow-hidden
  // ancestor (e.g. a trip card with a hover-lift transform), which would
  // otherwise trap `position: fixed` inside the card and clip it. SSR-gated.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!mounted) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
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
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <Card variant="soft" style={{ width: "100%", maxWidth }}>
        <CardBody title={title}>{children}</CardBody>
      </Card>
    </div>,
    document.body,
  );
}
