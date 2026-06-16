"use client";

import type { ChildProfile } from "@/lib/contract-mock/types";

interface ProfileSwitcherProps {
  profiles: ChildProfile[];
  activeId: string | null;
  onSelect: (id: string) => void;
}

/**
 * Compact "who's exploring" switcher - a single scrollable row of explorer chips.
 * The active explorer is highlighted; the trip view renders that explorer's band.
 * (The warm full picker lives on the trip cover; this is the always-there switch.)
 */
export function ProfileSwitcher({ profiles, activeId, onSelect }: ProfileSwitcherProps) {
  return (
    <div role="radiogroup" aria-label="Active explorer" className="yc-switcher">
      {profiles.map((p) => {
        const active = p.id === activeId;
        return (
          <button
            key={p.id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onSelect(p.id)}
            className="yc-switcher__chip"
            data-active={active ? "true" : undefined}
          >
            <span className="yc-switcher__badge" aria-hidden="true">
              {p.avatar ?? (p.name.trim()[0] ?? "?").toUpperCase()}
            </span>
            <span>{p.name}</span>
          </button>
        );
      })}
      <style>{`
        .yc-switcher {
          display: flex; gap: var(--space-2);
          overflow-x: auto; padding-bottom: 2px;
          -webkit-overflow-scrolling: touch; scrollbar-width: none;
        }
        .yc-switcher::-webkit-scrollbar { display: none; }
        .yc-switcher__chip {
          display: inline-flex; align-items: center; gap: var(--space-2);
          min-height: var(--control-md, 44px);
          padding: var(--space-1) var(--space-3) var(--space-1) var(--space-1);
          border-radius: var(--radius-pill, 999px);
          white-space: nowrap; cursor: pointer;
          border: 2.5px solid var(--sand-300, #ddd0b8);
          background: var(--surface-card, #fff);
          font-family: var(--font-display); font-weight: 600;
          color: var(--royal-700, #0a4c8b);
          transition: transform var(--dur-sm, .15s) var(--ease-bounce, ease);
        }
        .yc-switcher__chip[data-active="true"] {
          border: var(--border-ink, 2.5px solid #0a4c8b);
          background: var(--sky-50, #eaf6ff);
          box-shadow: var(--pop-sky);
        }
        .yc-switcher__chip:active { transform: scale(.96); }
        .yc-switcher__badge {
          display: grid; place-items: center;
          width: 30px; height: 30px;
          border-radius: var(--radius-pill, 999px);
          background: var(--sky-100, #d6ecff);
          font-size: 15px; font-weight: 800;
        }
      `}</style>
    </div>
  );
}
