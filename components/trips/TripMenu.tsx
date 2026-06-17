"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { archiveTrip, duplicateTrip } from "@/lib/api/trips";
import { ShareTripModal } from "@/components/trips/ShareTripModal";
import type { TripSummary } from "@/lib/contract-mock/types";

/**
 * The per-tile overflow (⋯) menu: Share, Duplicate, and Archive/Unarchive. Sits
 * top-right of a trip card. Archive moves the trip into the Archive list (it is
 * never destroyed); from there it can be restored, shared or duplicated.
 */
export function TripMenu({ trip }: { trip: TripSummary }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [sharing, setSharing] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const archived = trip.status === "archived";

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const invalidate = () => qc.invalidateQueries({ queryKey: ["trips"] });

  const archive = useMutation({
    mutationFn: () => archiveTrip(trip.id, !archived),
    onSuccess: invalidate,
  });
  const duplicate = useMutation({
    mutationFn: () => duplicateTrip(trip.id),
    onSuccess: invalidate,
  });

  const busy = archive.isPending || duplicate.isPending;

  function run(fn: () => void) {
    setOpen(false);
    fn();
  }

  return (
    <div ref={wrapRef} style={{ position: "absolute", top: 8, right: 8, zIndex: 5 }}>
      <button
        type="button"
        aria-label="Trip actions"
        aria-haspopup="menu"
        aria-expanded={open}
        data-testid="trip-menu-button"
        onClick={() => setOpen((o) => !o)}
        disabled={busy}
        style={{
          width: 34,
          height: 34,
          borderRadius: "var(--radius-pill, 999px)",
          border: "2px solid var(--sand-200, #e7e2d8)",
          background: "var(--surface-card, #fff)",
          cursor: busy ? "wait" : "pointer",
          fontWeight: 800,
          lineHeight: 1,
          color: "var(--royal-700)",
        }}
      >
        {busy ? "…" : "⋯"}
      </button>

      {open ? (
        <div
          role="menu"
          data-testid="trip-menu"
          style={{
            position: "absolute",
            top: 40,
            right: 0,
            minWidth: 180,
            padding: 6,
            background: "var(--surface-card, #fff)",
            border: "2px solid var(--sand-200, #e7e2d8)",
            borderRadius: "var(--radius-md, 12px)",
            boxShadow: "var(--shadow-md, 0 8px 24px rgba(16,24,40,.18))",
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <MenuItem label="🔗 Share…" onClick={() => run(() => setSharing(true))} />
          <MenuItem label="📋 Duplicate" onClick={() => run(() => duplicate.mutate())} />
          <MenuItem
            label={archived ? "♻️ Restore" : "🗄️ Archive"}
            onClick={() => run(() => archive.mutate())}
          />
        </div>
      ) : null}

      {sharing ? <ShareTripModal trip={trip} onClose={() => setSharing(false)} /> : null}
    </div>
  );
}

function MenuItem({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      style={{
        display: "block",
        width: "100%",
        textAlign: "left",
        padding: "var(--space-2) var(--space-3)",
        border: "none",
        background: "transparent",
        borderRadius: "var(--radius-sm, 8px)",
        cursor: "pointer",
        fontWeight: 700,
        color: "var(--text-body)",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-sunk)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      {label}
    </button>
  );
}
