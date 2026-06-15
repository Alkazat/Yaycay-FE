"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { listTrips, listProfiles } from "@/lib/api/trips";
import { isChild, isParentCarer } from "@/lib/profile/access";
import { firstRunMilestones, completedCount, allDone, coreComplete } from "@/lib/firstrun";
import type { ConnectionView } from "@/lib/mcp/store";

const HIDDEN_KEY = "yc_firstrun_hidden";

async function fetchConnections(): Promise<ConnectionView[]> {
  const res = await fetch("/api/mcp/connections");
  if (!res.ok) return [];
  return ((await res.json()) as { connections: ConnectionView[] }).connections;
}

/**
 * A small floating checklist shown on a user's first runs. Milestones auto-tick
 * from live state; the user can collapse it or hide it for good. Once everything
 * is done it shows a celebratory state and offers to dismiss.
 */
export function FirstRunChecklist() {
  const [mounted, setMounted] = useState(false);
  const [hidden, setHidden] = useState(true);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      setHidden(window.localStorage.getItem(HIDDEN_KEY) === "1");
    } catch {
      setHidden(false);
    }
  }, []);

  const trips = useQuery({ queryKey: ["trips"], queryFn: ({ signal }) => listTrips(signal), enabled: mounted && !hidden });
  const profiles = useQuery({ queryKey: ["profiles"], queryFn: ({ signal }) => listProfiles(signal), enabled: mounted && !hidden });
  const connections = useQuery({ queryKey: ["mcp-connections"], queryFn: fetchConnections, enabled: mounted && !hidden });

  if (!mounted || hidden) return null;

  const profileList = profiles.data ?? [];
  const milestones = firstRunMilestones({
    tripCount: trips.data?.length ?? 0,
    hasExplorer: profileList.some(isChild),
    hasGrownupPin: profileList.some((p) => isParentCarer(p) && !!p.pin_set),
    connectedAssistants: (connections.data ?? []).filter((c) => c.status === "active").length,
  });
  const done = completedCount(milestones);
  const finished = allDone(milestones);

  // Retire the checklist once the core milestones are done (optional ones, like
  // connecting an AI, don't keep nagging). New users still see it from scratch.
  if (coreComplete(milestones)) return null;

  const hide = () => {
    try {
      window.localStorage.setItem(HIDDEN_KEY, "1");
    } catch {
      // storage blocked; just hide for this session
    }
    setHidden(true);
  };

  return (
    <aside
      className="yc-firstrun"
      aria-label="First-run checklist"
      style={{
        background: "var(--surface-card, #fff)",
        border: "2.5px solid var(--royal-500)",
        borderRadius: "var(--radius-lg, 16px)",
        boxShadow: "var(--shadow-md, 0 8px 24px rgba(16,24,40,.18))",
        width: "min(300px, calc(100vw - 32px))",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--space-2)",
          padding: "var(--space-3)",
          background: "var(--sky-50, #f0f7ff)",
          borderBottom: collapsed ? "none" : "2px solid var(--sky-200, #cfe4fb)",
        }}
      >
        <strong style={{ flex: 1, fontFamily: "var(--font-display)", color: "var(--royal-800)" }}>
          {finished ? "All set! 🎉" : "Make your first trip work for you"}
        </strong>
        <span style={{ fontWeight: 800, fontSize: "var(--fs-sm)", color: "var(--royal-600)" }}>
          {done}/{milestones.length}
        </span>
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? "Expand checklist" : "Collapse checklist"}
          style={{ border: "none", background: "transparent", cursor: "pointer", fontWeight: 800, fontSize: 16 }}
        >
          {collapsed ? "▸" : "▾"}
        </button>
        <button
          type="button"
          onClick={hide}
          aria-label="Hide checklist"
          style={{ border: "none", background: "transparent", cursor: "pointer", fontWeight: 800, fontSize: 16, color: "var(--text-muted)" }}
        >
          ✕
        </button>
      </div>

      {collapsed ? null : (
        <div style={{ padding: "var(--space-3)" }}>
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
            {milestones.map((m) => (
              <li key={m.key}>
                <Link
                  href={m.href}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "var(--space-2)",
                    textDecoration: "none",
                    color: m.done ? "var(--text-muted)" : "var(--text-body)",
                    fontWeight: 700,
                  }}
                >
                  <span
                    aria-hidden
                    style={{
                      width: 20,
                      height: 20,
                      flex: "none",
                      borderRadius: "50%",
                      display: "grid",
                      placeItems: "center",
                      fontSize: 12,
                      color: "#fff",
                      background: m.done ? "var(--meadow-500, #3aa657)" : "var(--sand-300, #d8d0c0)",
                    }}
                  >
                    {m.done ? "✓" : ""}
                  </span>
                  <span style={{ textDecoration: m.done ? "line-through" : "none" }}>{m.label}</span>
                </Link>
              </li>
            ))}
          </ul>
          {finished ? (
            <button
              type="button"
              onClick={hide}
              className="yc-btn yc-btn--cta yc-btn--sm"
              style={{ marginTop: "var(--space-3)", width: "100%" }}
            >
              Done - hide this
            </button>
          ) : null}
        </div>
      )}
    </aside>
  );
}
