/**
 * MOCK demo-day generator - TEMPORARY. Stands in for the BE's
 * `POST /demo/generate-day` (the "one AI action") until the real contract and
 * AI harness exist. Produces a plausible, on-model TripContent-shaped day so
 * the renderer and countdown can be built and tested now.
 *
 * Swap target: the live BE endpoint. See ./types.ts for the migration note.
 */
import type {
  DemoGenerateDayRequest,
  DemoGenerateDayResponse,
  TripDay,
} from "./types";

/** Coarse destination -> timezone guess so the countdown reads sensibly. */
const TZ_BY_HINT: Array<[RegExp, string]> = [
  [/singapore/i, "Asia/Singapore"],
  [/tokyo|japan/i, "Asia/Tokyo"],
  [/sydney|australia/i, "Australia/Sydney"],
  [/london|uk|england/i, "Europe/London"],
  [/paris|france/i, "Europe/Paris"],
  [/new york|nyc|usa/i, "America/New_York"],
  [/bali|indonesia/i, "Asia/Makassar"],
];

function timezoneFor(destination: string): string {
  for (const [re, tz] of TZ_BY_HINT) {
    if (re.test(destination)) return tz;
  }
  return "UTC";
}

function buildArrivalDay(destination: string, date: string): TripDay {
  const place = destination.trim() || "your destination";
  return {
    id: "d_demo_1",
    date,
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
            body: `Spot five new things in ${place}: a flag, a funny sign, a tasty smell, a friendly animal, and the biggest building you can see.`,
            variants: {
              little: {
                body: `Can you find a flag and something yummy-smelling in ${place}? Point and shout "yay!"`,
              },
              explorer_plus: {
                fact: `${place} has its own stories waiting in every street - keep your explorer eyes open.`,
                quiz: {
                  q: `What is the first new thing you want to find in ${place}?`,
                  a: "Any answer counts - the hunt is yours!",
                },
              },
            },
          },
          {
            id: "a_demo_shared",
            kind: "shared",
            title: "Sunset stroll together",
            body: `Walk the waterfront as a family and pick tomorrow's first adventure.`,
          },
          {
            id: "a_demo_adult",
            kind: "adult",
            title: "Easy first-night dinner",
            body: "A relaxed, kid-friendly spot near the hotel so nobody melts down on day one.",
            booking: { name: "Local family bistro", time: "18:30" },
            safety: {
              note: "Confirm allergy-safe options with the kitchen before ordering.",
            },
          },
        ],
      },
    ],
  };
}

export function generateDemoDay(
  req: DemoGenerateDayRequest,
): DemoGenerateDayResponse {
  const timezone = timezoneFor(req.destination);
  return {
    trip: {
      id: "t_demo",
      destination: req.destination,
      start_date: req.start_date,
      end_date: req.end_date,
      timezone,
    },
    day: buildArrivalDay(req.destination, req.start_date),
    grownups_teaser:
      "Your grown-ups guide gathers packing lists, transport notes, and every booking in one calm place. Unlock it with the full holiday.",
  };
}
