/**
 * MOCK demo-day generator - TEMPORARY. Mirrors the BE's
 * `POST /demo/generate-day` contract shape (one day + a grown-ups teaser; no
 * trip object). Used only when NEXT_PUBLIC_API_BASE is unset.
 */
import type {
  DemoGenerateDayRequest,
  DemoGenerateDayResponse,
  TripDay,
} from "./types";

function buildArrivalDay(destination: string, name: string, date?: string): TripDay {
  const place = destination.trim() || "your destination";
  const who = name.trim() || "explorer";
  return {
    id: "d_demo_1",
    date: date ?? "",
    label: "Arrival",
    summary: `Touch down in ${place} and ease into the adventure with a gentle first afternoon.`,
    moments: [
      {
        id: "m_demo_1",
        slot: "afternoon",
        title: `First steps in ${place}`,
        time_hint: "15:00",
        location: { name: `${place} waterfront` },
        activities: [
          {
            id: "a_demo_kid",
            kind: "kid",
            title: "Explorer scavenger hunt",
            body: `Spot five new things in ${place}, ${who}: a flag, a funny sign, a tasty smell, a friendly animal, and the biggest building you can see.`,
            variants: {
              little: { body: `Can you find a flag and something yummy-smelling in ${place}? Point and shout "yay!"` },
              explorer_plus: {
                fact: `${place} has its own stories waiting in every street - keep your explorer eyes open.`,
                quiz: { q: `What is the first new thing you want to find in ${place}?`, a: "Any answer counts - the hunt is yours!" },
              },
            },
          },
          {
            id: "a_demo_shared",
            kind: "shared",
            title: "Sunset stroll together",
            body: "Walk the waterfront as a family and pick tomorrow's first adventure.",
          },
          {
            id: "a_demo_adult",
            kind: "adult",
            title: "Easy first-night dinner",
            body: "A relaxed, kid-friendly spot near the hotel so nobody melts down on day one.",
            booking: { name: "Local family bistro", time: "18:30" },
            safety: { note: "Confirm allergy-safe options with the kitchen before ordering." },
          },
        ],
      },
    ],
  };
}

export function generateDemoDay(req: DemoGenerateDayRequest): DemoGenerateDayResponse {
  return {
    day: buildArrivalDay(req.destination, req.child.name, req.date),
    grownups_teaser:
      "Your grown-ups guide gathers packing lists, transport notes, and every booking in one calm place. Unlock it with the full holiday.",
    generated_by: "fallback",
  };
}
