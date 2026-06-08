/**
 * MOCK sample data - TEMPORARY. Stands in for BE-served trips/profiles until
 * `@yaycay/contracts` and the live API exist. Lets the trips home, trip view,
 * renderer and profile switching be built and tested now.
 *
 * Swap target: live BE endpoints (list trips, get trip, list profiles).
 * See ./README.md.
 */
import type {
  ChildProfile,
  TripContent,
  TripSummary,
} from "./types";

export const MOCK_PROFILES: ChildProfile[] = [
  { id: "p_lenny", name: "Lenny", age: 5, mode: "little" },
  { id: "p_mara", name: "Mara", age: 9, mode: "explorer_plus" },
];

export const MOCK_TRIPS: TripSummary[] = [
  {
    id: "t_sg",
    destination: "Singapore",
    start_date: "2026-06-26",
    end_date: "2026-06-28",
    timezone: "Asia/Singapore",
    tier: "ours",
    status: "ready",
    day_count: 3,
  },
];

/** A small but complete multi-day trip exercising kid/shared/adult + variants. */
const SINGAPORE_TRIP: TripContent = {
  trip: {
    id: "t_sg",
    destination: "Singapore",
    start_date: "2026-06-26",
    end_date: "2026-06-28",
    timezone: "Asia/Singapore",
    currency: "SGD",
  },
  days: [
    {
      id: "d_1",
      date: "2026-06-26",
      label: "Arrival",
      summary: "Land, settle in, and dip your toes in the day with an easy first afternoon.",
      moments: [
        {
          id: "d1_m1",
          slot: "afternoon",
          title: "Sentosa beaches",
          time_hint: "15:00",
          location: { name: "Siloso Beach", lat: 1.255, lng: 103.81 },
          activities: [
            {
              id: "d1_a1",
              kind: "kid",
              title: "Beach treasure hunt",
              body: "Find a smooth pebble, a seashell, and the funniest-shaped cloud.",
              variants: {
                little: { body: "Can you find a shell and a smooth pebble? Hold them up high!" },
                explorer_plus: {
                  fact: "Siloso Beach sand was brought in from nearby islands.",
                  quiz: { q: "What do you call sand that is made of tiny shells?", a: "Coral sand." },
                },
              },
            },
            {
              id: "d1_a2",
              kind: "adult",
              title: "Sunset drinks",
              booking: { name: "Ola Beach Club", time: "18:30" },
              safety: { note: "Lenny: anaphylactic, nuts/legumes - confirm with kitchen." },
            },
          ],
        },
      ],
    },
    {
      id: "d_2",
      date: "2026-06-27",
      label: "Explorers",
      summary: "A big day out among gardens, clouds, and very tall trees.",
      moments: [
        {
          id: "d2_m1",
          slot: "morning",
          title: "Gardens by the Bay",
          time_hint: "09:30",
          location: { name: "Cloud Forest" },
          activities: [
            {
              id: "d2_a1",
              kind: "shared",
              title: "Cloud Forest mountain",
              body: "Ride to the top and walk down through the mist and waterfalls together.",
            },
            {
              id: "d2_a2",
              kind: "kid",
              title: "Spot the carnivorous plants",
              body: "Hunt for the pitcher plants that catch bugs for dinner.",
              variants: {
                explorer_plus: {
                  fact: "Pitcher plants drown insects in a pool of digestive juice.",
                  quiz: { q: "Do pitcher plants eat meat?", a: "Yes - mostly insects!" },
                },
              },
            },
          ],
        },
        {
          id: "d2_m2",
          slot: "evening",
          title: "Supertree light show",
          time_hint: "19:45",
          location: { name: "Supertree Grove" },
          activities: [
            {
              id: "d2_a3",
              kind: "shared",
              title: "Garden Rhapsody",
              body: "Lie back on the lawn and watch the trees sing in light.",
            },
          ],
        },
      ],
    },
    {
      id: "d_3",
      date: "2026-06-28",
      label: "Last splash",
      summary: "One more adventure before home time.",
      moments: [
        {
          id: "d3_m1",
          slot: "morning",
          title: "River Wonders",
          time_hint: "10:00",
          location: { name: "Mandai" },
          activities: [
            {
              id: "d3_a1",
              kind: "kid",
              title: "Find the giant otters",
              body: "Watch the otter family zoom and splash at feeding time.",
              variants: {
                little: { body: "Wave hello to the splashy otters!" },
              },
            },
            {
              id: "d3_a2",
              kind: "adult",
              title: "Quiet coffee stop",
              body: "Grab a flat white while the kids watch the manatees.",
            },
          ],
        },
      ],
    },
  ],
  grownups: {
    essentials: "Passports, EZ-Link cards, sunscreen, refillable water bottles.",
    checklist: ["Confirm allergy cards in English + Mandarin", "Download offline map", "Charge the camera"],
    transport: "MRT covers everything; grab a taxi only for late nights.",
  },
};

const TRIPS_BY_ID: Record<string, TripContent> = {
  t_sg: SINGAPORE_TRIP,
};

export function getMockTrip(id: string): TripContent | undefined {
  return TRIPS_BY_ID[id];
}
