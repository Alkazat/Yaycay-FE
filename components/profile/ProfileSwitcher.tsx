"use client";

import type { ChildProfile } from "@/lib/contract-mock/types";
import { Avatar } from "@/components/ds";

interface ProfileSwitcherProps {
  profiles: ChildProfile[];
  activeId: string | null;
  onSelect: (id: string) => void;
}

const MODE_LABEL: Record<string, string> = {
  little: "Little explorer",
  explorer_plus: "Explorer+",
};

/** Pick the active child profile; the trip view renders variants by its mode. */
export function ProfileSwitcher({ profiles, activeId, onSelect }: ProfileSwitcherProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Active explorer"
      style={{ display: "flex", gap: "var(--space-3)", flexWrap: "wrap" }}
    >
      {profiles.map((p) => {
        const active = p.id === activeId;
        return (
          <button
            key={p.id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onSelect(p.id)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-2)",
              padding: "var(--space-2) var(--space-4) var(--space-2) var(--space-2)",
              minHeight: "var(--control-md)",
              borderRadius: "var(--radius-pill)",
              border: active ? "var(--border-ink)" : "2.5px solid var(--sand-300)",
              background: active ? "var(--sky-50)" : "var(--surface-card)",
              cursor: "pointer",
              fontFamily: "var(--font-display)",
              fontWeight: 600,
              color: "var(--royal-700)",
            }}
          >
            <Avatar name={p.name} size={32} ring={active} tone={active ? "sky" : "aqua"} />
            <span style={{ display: "flex", flexDirection: "column", textAlign: "left" }}>
              <span>{p.name}</span>
              <span style={{ fontSize: "var(--fs-xs)", color: "var(--text-muted)" }}>
                {MODE_LABEL[p.mode] ?? p.mode}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
