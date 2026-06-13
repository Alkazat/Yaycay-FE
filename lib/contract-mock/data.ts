/**
 * MOCK sample data - TEMPORARY. Stands in for BE-served trips/profiles until
 * `@alkazat/contracts` and the live API exist. Lets the trips home, trip view,
 * renderer and profile switching be built and tested now.
 *
 * Swap target: live BE endpoints (list trips, get trip, list profiles).
 * See ./README.md.
 */
import type {
  AccountSummary,
  ChildProfile,
  TripContent,
  TripSummary,
} from "./types";

export const MOCK_ACCOUNT: AccountSummary = {
  email: "family@example.com",
  secondary_email: "backup@example.com",
  tier: "ours",
};

export const MOCK_PROFILES: ChildProfile[] = [
  {
    id: "p_savy",
    name: "Savy",
    age: 13,
    mode: "standard",
    interests: [],
    dietary: [],
    medical: [],
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "p_tay",
    name: "Tay",
    age: 9,
    mode: "standard",
    interests: [],
    dietary: [],
    medical: [],
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "p_lenny",
    name: "Lenny",
    age: 4,
    mode: "little",
    interests: [],
    // FE allergies fold into the contract's dietary string[].
    dietary: ["nuts", "legumes"],
    // anaphylaxis modelled as a medical flag.
    medical: ["anaphylaxis"],
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
  },
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
    // 12 months after the holiday ends, unless a keep-token is bought.
    retention_expires_at: "2027-06-28",
    data_kept: false,
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
      did_you_know: "Singapore is one whole country made of one big island and lots of little ones!",
      weather: {
        summary: "Singapore is HOT and a bit sticky. Hat, water, sunscreen!",
        high: 31,
        low: 26,
      },
      hotel: {
        name: "Village Hotel Sentosa",
        phase: "arrive",
        note: "We stay here for 4 nights.",
      },
      star_challenge: {
        question: "Which country are we exploring on this whole holiday?",
        answer: "Singapore!",
      },
      game: {
        type: "tap",
        theme: "Catch the beach things before they float away!",
        items: ["shell", "ball", "bucket", "fish", "star", "wave"],
        goal: 8,
      },
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
              facts: [
                "Sentosa means 'peace and tranquillity' in Malay.",
                "The beaches here are man-made, brought in grain by grain.",
              ],
              challenge: {
                type: "spot",
                prompt: "Spot three different colours of beach umbrella.",
                answer: "Look along the shoreline, there are usually red, blue and yellow ones!",
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
      did_you_know: "The Cloud Forest has the tallest indoor waterfall in the world!",
      weather: {
        summary: "Warm and humid. The Cloud Forest inside is cool and misty.",
        high: 32,
        low: 27,
      },
      star_challenge: {
        question: "What do plants need to make their own food?",
        answer: "Sunlight, water and air. They are amazing!",
      },
      game: {
        type: "spot",
        theme: "Spot the hidden rainforest animals!",
        items: ["frog", "bird", "bug", "snail", "leaf", "flower", "rock", "fern"],
        goal: 4,
      },
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
              facts: ["The waterfall is 35 metres tall, taller than ten giraffes!"],
              challenge: {
                type: "quiz",
                prompt: "Why is it so misty inside the Cloud Forest?",
                answer: "Machines spray a cool fog so the mountain plants feel at home.",
              },
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
    phases: [
      { label: "Village Hotel Sentosa", range: "nights 1-4" },
      { label: "Mandai Rainforest Resort", range: "night 5" },
      { label: "Treetops Bukit Timah", range: "nights 6-11" },
    ],
    days: [
      {
        day_id: "d_1",
        bookings: ["Airport transfer to Sentosa", "Dinner: Shake Shack Siloso (walk-in)"],
        costs: ["Transfer ~S$55 / A$60", "Dinner ~S$60 / A$66"],
        transport: ["Grab from Changi, about 35 min"],
        tips: ["Land tired, keep day one easy"],
        allergy: ["Shake Shack: confirm no peanut/soy in sauces before ordering"],
      },
      {
        day_id: "d_2",
        bookings: ["Gardens by the Bay tickets (Cloud Forest + Flower Dome)"],
        costs: ["Garden tickets ~S$53 / A$58 for the family"],
        transport: ["MRT to Bayfront, exit B"],
        tips: ["Cloud Forest is busiest mid-morning, go early"],
      },
    ],
  },
};

const TRIPS_BY_ID: Record<string, TripContent> = {
  t_sg: SINGAPORE_TRIP,
};

export function getMockTrip(id: string): TripContent | undefined {
  return TRIPS_BY_ID[id];
}
