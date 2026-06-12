"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getTrip } from "@/lib/api/trips";
import { collectPins, projectPins } from "@/lib/map";
import { Card, CardBody, Badge } from "@/components/ds";

/**
 * Offline-friendly trip map: geo-coded venue pins projected into a scene box
 * (no external tiles, so it works offline and in CI), with a focusable pin and
 * a venue list. Live tiles are a later enhancement.
 */
export function MapClient({ tripId }: { tripId: string }) {
  const params = useSearchParams();
  const focusParam = params.get("focus");
  const tripQuery = useQuery({ queryKey: ["trip", tripId], queryFn: ({ signal }) => getTrip(tripId, signal) });
  const [selected, setSelected] = useState<string | null>(null);

  if (tripQuery.isLoading) return <p>Loading the map...</p>;
  if (!tripQuery.data) return <p>We couldn&apos;t open the map.</p>;

  const pins = projectPins(collectPins(tripQuery.data));
  const focus = selected ?? focusParam ?? pins[0]?.id ?? null;
  const focused = pins.find((p) => p.id === focus);

  return (
    <div className="yc-stack" data-testid="map">
      <h1 style={{ margin: 0 }}>Map</h1>
      <p style={{ margin: 0, color: "var(--text-muted)", fontWeight: 700 }}>
        Tap a pin to see what we are doing there.
      </p>

      <div
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "3 / 2",
          background: "var(--grad-aqua)",
          border: "var(--border-ink)",
          borderRadius: "var(--radius-xl)",
          overflow: "hidden",
        }}
        data-testid="map-scene"
      >
        {pins.map((p) => (
          <button
            key={p.id}
            type="button"
            data-testid="map-pin"
            aria-label={p.name}
            onClick={() => setSelected(p.id)}
            style={{
              position: "absolute",
              left: `${p.x}%`,
              top: `${p.y}%`,
              transform: "translate(-50%, -50%)",
              width: p.id === focus ? 28 : 22,
              height: p.id === focus ? 28 : 22,
              borderRadius: "var(--radius-pill)",
              background: p.id === focus ? "var(--sun-400)" : "var(--coral-400)",
              border: "2.5px solid var(--royal-600)",
              boxShadow: "var(--gloss-top)",
              cursor: "pointer",
            }}
          />
        ))}
      </div>

      {focused ? (
        <Card variant="soft">
          <CardBody title={focused.name}>
            <Badge tone="aqua">{focused.dayLabel}</Badge>
            <p style={{ margin: "var(--space-2) 0 0" }}>{focused.title}</p>
          </CardBody>
        </Card>
      ) : null}

      <Card variant="soft">
        <CardBody title="All our places">
          {pins.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setSelected(p.id)}
              style={{
                display: "block",
                width: "100%",
                textAlign: "left",
                minHeight: 44,
                background: "transparent",
                border: "none",
                cursor: "pointer",
                fontWeight: 700,
                color: "var(--royal-700)",
              }}
            >
              {p.name} - {p.dayLabel}
            </button>
          ))}
        </CardBody>
      </Card>
    </div>
  );
}
