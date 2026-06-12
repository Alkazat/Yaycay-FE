import type { TripContent } from "@/lib/contract-mock/types";

export interface MapPin {
  id: string;
  name: string;
  lat: number;
  lng: number;
  dayLabel: string;
  title: string;
}

/** Collect geo-coded venues (moments with lat/lng) across the trip. */
export function collectPins(trip: TripContent): MapPin[] {
  const pins: MapPin[] = [];
  for (const day of trip.days) {
    for (const moment of day.moments) {
      const loc = moment.location;
      if (loc && typeof loc.lat === "number" && typeof loc.lng === "number") {
        pins.push({
          id: moment.id,
          name: loc.name,
          lat: loc.lat,
          lng: loc.lng,
          dayLabel: day.label,
          title: moment.title,
        });
      }
    }
  }
  return pins;
}

/**
 * Project a pin's lat/lng to x/y percentages within the pin set's bounding box.
 * Latitude is inverted (north is up). A zero-range axis centres at 50%.
 */
export function projectPins(pins: MapPin[]): Array<MapPin & { x: number; y: number }> {
  if (pins.length === 0) return [];
  const lats = pins.map((p) => p.lat);
  const lngs = pins.map((p) => p.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const span = (v: number, min: number, max: number) => (max === min ? 0.5 : (v - min) / (max - min));
  // Pad to keep pins off the edges.
  const pad = (t: number) => 8 + t * 84;
  return pins.map((p) => ({
    ...p,
    x: pad(span(p.lng, minLng, maxLng)),
    y: pad(1 - span(p.lat, minLat, maxLat)),
  }));
}
