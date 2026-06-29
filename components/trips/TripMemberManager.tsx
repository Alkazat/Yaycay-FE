"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { listProfiles } from "@/lib/api/trips";
import { useTripMembers } from "@/components/trips/useTripMembers";
import { resolvedAge } from "@/lib/age";
import { isChild, isParentCarer, modeForProfile } from "@/lib/profile/access";
import { Button } from "@/components/ds";
import type { ChildProfile } from "@/lib/contract-mock/types";

interface TripMemberManagerProps {
  tripId: string;
  tripStartDate?: string;
}

/** Avatar initial fallback. */
function initial(name: string): string {
  return (name.trim()[0] ?? "?").toUpperCase();
}

/**
 * Trip member manager: shows the current roster for this trip, allows removing
 * members, and provides an "Add explorer" sheet that lists account profiles not
 * yet on the roster.
 *
 * Displayed in the trip's Planning panel (grown-ups view). Keeps it simple:
 * no modal library, just an inline slide-down list.
 */
export function TripMemberManager({ tripId, tripStartDate }: TripMemberManagerProps) {
  const [addOpen, setAddOpen] = useState(false);

  const { query: membersQuery, add, remove } = useTripMembers(tripId);
  const allProfilesQuery = useQuery({
    queryKey: ["profiles"],
    queryFn: ({ signal }) => listProfiles(signal),
  });

  const members = membersQuery.data?.members ?? [];
  const allProfiles = allProfilesQuery.data ?? [];

  // Profiles not yet on this trip's roster - available to add.
  const memberIds = new Set(members.map((m) => m.id));
  const available = allProfiles.filter((p) => !memberIds.has(p.id));

  function renderMember(p: ChildProfile & { date_of_birth?: string | null }) {
    const displayAge = resolvedAge(p.date_of_birth, p.age, tripStartDate);
    const isGrown = isParentCarer(p);
    return (
      <div
        key={p.id}
        className="yc-tmm__member"
        data-testid="trip-member-row"
        data-grown={isGrown ? "true" : undefined}
      >
        <span className="yc-tmm__avatar" aria-hidden="true">
          {p.avatar ?? initial(p.name)}
        </span>
        <div className="yc-tmm__info">
          <span className="yc-tmm__name">{p.name}</span>
          {displayAge !== null ? (
            <span className="yc-tmm__age">Age {displayAge}</span>
          ) : null}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => remove.mutate(p.id)}
          disabled={remove.isPending}
          aria-label={`Remove ${p.name} from this trip`}
        >
          Remove
        </Button>
      </div>
    );
  }

  function renderAvailable(p: ChildProfile & { date_of_birth?: string | null }) {
    const displayAge = resolvedAge(p.date_of_birth, p.age, tripStartDate);
    return (
      <div key={p.id} className="yc-tmm__avail" data-testid="trip-member-available">
        <span className="yc-tmm__avatar" aria-hidden="true">
          {p.avatar ?? initial(p.name)}
        </span>
        <div className="yc-tmm__info">
          <span className="yc-tmm__name">{p.name}</span>
          {displayAge !== null ? (
            <span className="yc-tmm__age">Age {displayAge}</span>
          ) : null}
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            add.mutate(p.id);
            setAddOpen(false);
          }}
          disabled={add.isPending}
          aria-label={`Add ${p.name} to this trip`}
        >
          Add
        </Button>
      </div>
    );
  }

  const explorers = members.filter(isChild);
  const guides = members.filter(isParentCarer);

  return (
    <section className="yc-tmm" data-testid="trip-member-manager">
      <div className="yc-tmm__header">
        <h3 className="yc-tmm__title">
          <span aria-hidden="true">🧑‍🤝‍🧑</span> Who&apos;s on this trip?
        </h3>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setAddOpen((o) => !o)}
          aria-expanded={addOpen}
          data-testid="trip-member-add-open"
        >
          {addOpen ? "Close" : "Add explorer"}
        </Button>
      </div>

      {membersQuery.isLoading ? (
        <p style={{ margin: 0, color: "var(--text-muted)", fontWeight: 700 }}>Loading roster…</p>
      ) : null}

      {!membersQuery.isLoading && members.length === 0 ? (
        <p style={{ margin: 0, color: "var(--text-muted)", fontWeight: 700 }}>
          No-one on this trip yet. Add explorers or grown-ups above.
        </p>
      ) : null}

      {explorers.length > 0 ? (
        <div className="yc-tmm__group">
          <span className="yc-tmm__group-label">
            <span aria-hidden="true">🧭</span> Explorers
          </span>
          <div className="yc-tmm__list">{explorers.map(renderMember)}</div>
        </div>
      ) : null}

      {guides.length > 0 ? (
        <div className="yc-tmm__group">
          <span className="yc-tmm__group-label">
            <span aria-hidden="true">🛡️</span> Grown-ups
          </span>
          <div className="yc-tmm__list">{guides.map(renderMember)}</div>
        </div>
      ) : null}

      {addOpen ? (
        <div className="yc-tmm__add-panel" role="region" aria-label="Add to trip">
          <p className="yc-tmm__add-heading">
            Profiles in your account — not yet on this trip:
          </p>
          {available.length === 0 ? (
            <p style={{ margin: 0, color: "var(--text-muted)", fontWeight: 700 }}>
              Everyone in your account is already on this trip.
            </p>
          ) : (
            <div className="yc-tmm__list">{available.map(renderAvailable)}</div>
          )}
        </div>
      ) : null}

      <style>{`
        .yc-tmm {
          display: flex; flex-direction: column; gap: var(--space-3);
          padding: var(--space-4);
          border-radius: var(--radius-lg, 16px);
          background: var(--surface-card, #fff);
          border: var(--border-ink, 2.5px solid #0a4c8b);
          box-shadow: var(--gloss-top);
        }
        .yc-tmm__header {
          display: flex; align-items: center; justify-content: space-between; gap: var(--space-3);
        }
        .yc-tmm__title {
          margin: 0;
          font-family: var(--font-display); font-weight: 700;
          font-size: var(--fs-h4, 1.1rem); color: var(--royal-700, #0a4c8b);
          display: flex; align-items: center; gap: var(--space-2);
        }
        .yc-tmm__group { display: flex; flex-direction: column; gap: var(--space-2); }
        .yc-tmm__group-label {
          font-weight: 700; font-size: var(--fs-sm, .85rem);
          color: var(--text-muted, #5b6b7b); letter-spacing: .03em; text-transform: uppercase;
          display: flex; align-items: center; gap: var(--space-1);
        }
        .yc-tmm__list { display: flex; flex-direction: column; gap: var(--space-2); }
        .yc-tmm__member,
        .yc-tmm__avail {
          display: flex; align-items: center; gap: var(--space-3);
          padding: var(--space-2) var(--space-3);
          border-radius: var(--radius-md, 12px);
          background: var(--surface-sunk, #f4eedf);
        }
        .yc-tmm__member[data-grown="true"] {
          background: var(--sky-50, #f0f7ff);
        }
        .yc-tmm__avail { background: var(--sand-50, #fdf9f0); }
        .yc-tmm__avatar {
          display: grid; place-items: center; width: 36px; height: 36px; flex: 0 0 auto;
          border-radius: var(--radius-pill, 999px);
          background: var(--sun-200, #ffe08a); border: 2.5px solid var(--royal-500, #0a4c8b);
          font-family: var(--font-display); font-weight: 800; color: var(--royal-700, #0a4c8b);
        }
        .yc-tmm__info {
          display: flex; flex-direction: column; flex: 1 1 auto; min-width: 0;
        }
        .yc-tmm__name {
          font-family: var(--font-display); font-weight: 700; color: var(--royal-700, #0a4c8b);
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .yc-tmm__age {
          font-size: var(--fs-xs, .72rem); color: var(--text-muted, #5b6b7b); font-weight: 600;
        }
        .yc-tmm__add-panel {
          display: flex; flex-direction: column; gap: var(--space-3);
          padding: var(--space-3);
          border-radius: var(--radius-md, 12px);
          background: var(--sky-50, #f0f7ff);
          border: 2px solid var(--sky-200, #aadcff);
        }
        .yc-tmm__add-heading {
          margin: 0; font-weight: 700; color: var(--royal-700, #0a4c8b);
          font-size: var(--fs-sm, .85rem);
        }
      `}</style>
    </section>
  );
}
