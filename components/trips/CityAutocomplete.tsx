"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { searchCities, flagEmoji, formatCity, type City } from "@/lib/geo";
import { Input } from "@/components/ds";

/**
 * Destination autocomplete. Suggests cities as you type (flag + City, Region,
 * Country) and hands the chosen city back. Backed by the pluggable geocoder in
 * lib/geo (curated set now; a live provider later).
 */
export function CityAutocomplete({
  value,
  onChange,
  onSelect,
}: {
  value: string;
  onChange: (text: string) => void;
  onSelect: (city: City) => void;
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const { data } = useQuery({
    queryKey: ["cities", value],
    queryFn: ({ signal }) => searchCities(value, signal),
    enabled: open && value.trim().length >= 2,
  });
  const results = data ?? [];

  // Close the suggestion list on an outside click.
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div ref={wrapRef} style={{ position: "relative" }}>
      <Input
        label="Where to?"
        value={value}
        placeholder="Start typing a city…"
        autoComplete="off"
        role="combobox"
        aria-expanded={open && results.length > 0}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
      />
      {open && results.length > 0 ? (
        <ul
          data-testid="city-suggestions"
          style={{
            position: "absolute",
            zIndex: 20,
            left: 0,
            right: 0,
            margin: "4px 0 0",
            padding: 4,
            listStyle: "none",
            background: "var(--surface-card, #fff)",
            border: "2px solid var(--sand-200, #e7e2d8)",
            borderRadius: "var(--radius-md, 12px)",
            boxShadow: "var(--shadow-md, 0 8px 24px rgba(16,24,40,.18))",
            maxHeight: 260,
            overflowY: "auto",
          }}
        >
          {results.map((c) => (
            <li key={`${c.name}-${c.cc}-${c.region}`}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onSelect(c);
                  onChange(formatCity(c));
                  setOpen(false);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--space-2)",
                  width: "100%",
                  textAlign: "left",
                  padding: "var(--space-2) var(--space-3)",
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  borderRadius: "var(--radius-sm, 8px)",
                  fontWeight: 700,
                }}
              >
                <span aria-hidden style={{ fontSize: 20 }}>
                  {flagEmoji(c.cc)}
                </span>
                <span>{formatCity(c)}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
