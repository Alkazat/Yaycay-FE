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
  ChatHistoryMessage,
  ChildProfile,
  CompanionCard,
  Trip,
  TripContent,
  TripSummary,
} from "./types";
import type { Transaction } from "@/lib/api/transactions";

export const MOCK_ACCOUNT: AccountSummary & { name: string | null } = {
  email: "family@example.com",
  name: "The Yeates Family",
  secondary_email: "backup@example.com",
  tier: "ours",
  role: "user",
  two_factor_enrolled: false,
  deletion_requested_at: null,
  created_at: "2026-01-01T00:00:00.000Z",
};

/** MOCK pricing catalogue (BE sources live amounts from Stripe). */
export const MOCK_CATALOGUE = [
  {
    price_id: "price_holiday_ai" as const,
    name: "Full holiday - our AI",
    price_usd: 129,
    blurb: "Plan with our guardrailed AI chat. Every day unlocked, journal, photos and offline.",
  },
  {
    price_id: "price_holiday_byo" as const,
    name: "Full holiday - your own AI",
    price_usd: 59,
    blurb: "Connect your own ChatGPT, Claude or Gemini. Every day unlocked, journal and offline.",
  },
  {
    price_id: "price_datakeep_annual" as const,
    name: "Keep your memories",
    price_usd: 9,
    blurb: "Hold onto this trip's memories for another 12 months.",
  },
];

/** MOCK billing history (no contract endpoint yet; USD, US$129/US$59 pricing). */
export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: "txn_3",
    date: "2026-05-20T09:14:00.000Z",
    description: "Keep my memories (12 months)",
    amount_usd: 19,
    status: "paid",
    trip_id: "t_sg",
    trip_name: "Singapore",
  },
  {
    id: "txn_2",
    date: "2026-05-02T18:40:00.000Z",
    description: "Holiday - full (our AI planning)",
    amount_usd: 129,
    status: "paid",
    trip_id: "t_sg",
    trip_name: "Singapore",
  },
  {
    id: "txn_1",
    date: "2026-04-15T11:05:00.000Z",
    description: "Holiday - bring your own AI",
    amount_usd: 59,
    status: "refunded",
    // An older purchase whose trip is no longer around: not every line links.
    trip_id: null,
    trip_name: null,
  },
];

/**
 * One family across all four user types: a parent/carer (Grown Ups, PIN-locked)
 * plus three children at the three explorer bands. `type` gates the views;
 * `mode` drives the renderer voice. See the user-types handoff.
 */
export const MOCK_PROFILES: ChildProfile[] = [
  {
    id: "p_mum",
    name: "Mum",
    age: 38,
    type: "parent_carer",
    mode: "standard",
    pin_set: true,
    interests: [],
    dietary: [],
    medical: [],
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "p_savy",
    name: "Savy",
    age: 13,
    type: "child",
    mode: "explorer_plus",
    pin_set: false,
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
    type: "child",
    mode: "explorer",
    pin_set: false,
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
    type: "child",
    mode: "little",
    pin_set: false,
    interests: [],
    // FE allergies fold into the contract's dietary string[].
    dietary: ["nuts", "legumes"],
    // anaphylaxis modelled as a medical flag.
    medical: ["anaphylaxis"],
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
  },
];

/**
 * Parent/carer PINs (profile id -> 4-digit PIN). Kept separate from the profile
 * records, mirroring the contract rule that a PIN is never returned by the API.
 * Demo PIN for the Grown-ups gate is `1234`.
 */
export const MOCK_PINS: Record<string, string> = {
  p_mum: "1234",
};

export const MOCK_TRIPS: TripSummary[] = [
  {
    id: "t_sg",
    destination: "Singapore",
    start_date: "2026-06-26",
    end_date: "2026-07-07",
    timezone: "Asia/Singapore",
    tier: "ours",
    status: "ready",
    day_count: 12,
    // 12 months after the holiday ends, unless a keep-token is bought.
    retention_expires_at: "2027-07-07",
    data_kept: false,
  },
];

/** A small but complete multi-day trip exercising kid/shared/adult + variants. */
const SINGAPORE_TRIP: TripContent = {
  trip: {
    id: "t_sg",
    destination: "Singapore",
    start_date: "2026-06-26",
    end_date: "2026-07-07",
    timezone: "Asia/Singapore",
    currency: "SGD",
  },
  days: [
    {
      id: "d_1",
      date: "2026-06-26",
      label: "Arrival",
      summary: "Land, settle in, and dip your toes in the day with an easy first afternoon.",
      did_you_know:
        "Singapore is one whole country made of one big island and lots of little ones!",
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
                  quiz: {
                    q: "What do you call sand that is made of tiny shells?",
                    a: "Coral sand.",
                  },
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
          id: "d2_m_lunch",
          slot: "afternoon",
          title: "Lunch at Satay by the Bay",
          time_hint: "12:30",
          location: { name: "Satay by the Bay" },
          activities: [
            {
              id: "d2_a_lunch",
              kind: "shared",
              title: "Lunch at Satay by the Bay",
              body: "An open-air food garden by the water - lots of stalls to choose from.",
              meal: {
                venue: "Satay by the Bay",
                allergy_label: "Tree-nut allergy: flagged",
                checked: [
                  "Satay peanut sauce is on the menu across several stalls.",
                  "Seafood and chicken-rice stalls don't list nut sauces.",
                ],
                confirm_on_day: [
                  "Ask each stall before ordering - recipes and oils change.",
                  "Keep Pip's antihistamine and EpiPen on you, not in the bag.",
                ],
                stalls: [
                  {
                    name: "Satay stalls (peanut sauce)",
                    label: "Tree-nut: flagged",
                    risk: "flagged",
                    note: "Peanut sauce is central here. Best avoided for Pip.",
                  },
                  {
                    name: "Seafood BBQ stall",
                    label: "Tree-nut: lower risk",
                    risk: "lower",
                    note: "No nut sauces on the standard dishes. Still confirm on the day.",
                  },
                  {
                    name: "Hainanese chicken rice",
                    label: "Tree-nut: lower risk",
                    risk: "lower",
                    note: "Plain rice + chicken. Ask about the chilli/ginger sides.",
                  },
                ],
                ask_kitchen: {
                  language: "Mandarin",
                  phrase:
                    "请问这道菜里有坚果或坚果油吗?我女儿对坚果有严重过敏。",
                  english:
                    "Does this dish contain any nuts or nut oils? My daughter has a serious tree-nut allergy.",
                },
                reminder: {
                  confirm: [
                    "Tell the stall: serious tree-nut allergy.",
                    "Ask about nuts and nut oils in the dish and the sides.",
                    "Confirm before you order, not after.",
                  ],
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
    {
      id: "d_4",
      date: "2026-06-29",
      label: "Waterpark",
      summary: "A whole day of slides, waves and snorkelling with real fish at Adventure Cove.",
      did_you_know:
        "We picked Monday for Adventure Cove because it's the quietest day - shorter queues mean more rides!",
      weather: {
        summary: "Hot and sunny. The ground gets scorching, so reef shoes are a must!",
        high: 32,
        low: 27,
      },
      hotel: {
        name: "Village Hotel Sentosa",
        phase: "stay",
        note: "Still on Sentosa, a short walk from the park.",
      },
      star_challenge: {
        question: "What do we call a fish that lives near coral and is bright orange, like Nemo?",
        answer: "A clownfish!",
      },
      game: {
        type: "tap",
        theme: "Catch the splashes before they fall!",
        items: ["💦", "🦆", "🌊", "🐠", "🫧", "🏄"],
        goal: 10,
      },
      moments: [
        {
          id: "d4_m1",
          slot: "morning",
          title: "Adventure Cove Waterpark",
          time_hint: "10:00",
          location: { name: "Adventure Cove", lat: 1.2569, lng: 103.8207 },
          activities: [
            {
              id: "d4_a1",
              kind: "shared",
              title: "Adventure Cove Waterpark",
              body: "An epic waterpark where you can snorkel right alongside real tropical fish and rays at Rainbow Reef, then ride the Riptide Rocket, race the Dueling Racer and float the whole Adventure River.",
              facts: [
                "Riptide Rocket is Asia's first hydromagnetic coaster waterslide - a water slide that suddenly goes UP, not just down!",
                "The sea around Singapore stays about 28-30C all year because it is so close to the Equator.",
              ],
              variants: {
                little: {
                  body: "So many slides and splashes! Swim with the colourful fish and float around the lazy river.",
                },
                explorer: {
                  fact: "Adventure River is a 620-metre lazy river that floats you all the way around the park.",
                },
                explorer_plus: {
                  fact: "A hydromagnetic coaster uses magnets to push the raft uphill, so a water slide can suddenly climb instead of only dropping.",
                  quiz: {
                    q: "Why does the sea at Adventure Cove feel warmer than an Adelaide beach?",
                    a: "Singapore is tropical and near the Equator, so the sea stays about 28-30C all year.",
                  },
                },
              },
              challenge: {
                type: "spot",
                prompt:
                  "In the snorkel lagoon, find a fish for every colour of the rainbow: red, orange, yellow, green, blue, purple.",
                answer:
                  "Clownfish are bright orange, surgeonfish are blue - keep your eyes near the coral for the purple ones!",
              },
            },
          ],
        },
        {
          id: "d4_m2",
          slot: "afternoon",
          title: "Poolside lunch",
          time_hint: "13:00",
          location: { name: "Resorts World" },
          activities: [
            {
              id: "d4_a2",
              kind: "adult",
              title: "Quick lunch at Resorts World",
              body: "Grab a fast bite between rides and keep a locker and waterproof phone case handy.",
              safety: {
                note: "Lenny: anaphylactic, nuts/legumes - confirm fryer oils and sauces with the kitchen before ordering.",
              },
            },
          ],
        },
      ],
    },
    {
      id: "d_5",
      date: "2026-06-30",
      label: "Night Safari",
      summary: "Move to the rainforest, meet giant pandas by day and roaming animals after dark.",
      did_you_know: "Night Safari is the world's FIRST zoo built just for night-time animals!",
      weather: {
        summary: "Warm and humid, cooler after dark. Bring insect repellent for the jungle!",
        high: 31,
        low: 26,
      },
      hotel: {
        name: "Mandai Rainforest Resort",
        phase: "move",
        note: "We sleep in the actual rainforest tonight!",
      },
      star_challenge: {
        question: "What do we call animals that sleep in the day and come out at night?",
        answer: "Nocturnal animals - like the ones at Night Safari!",
      },
      game: {
        type: "colour",
        theme: "Colour the safari night!",
        items: ["🌙", "⭐", "🦁", "🐘", "🦒", "🦜", "🌿", "🔦"],
        goal: 8,
      },
      moments: [
        {
          id: "d5_m1",
          slot: "morning",
          title: "River Wonders",
          time_hint: "11:00",
          location: { name: "River Wonders", lat: 1.4043, lng: 103.793 },
          activities: [
            {
              id: "d5_a1",
              kind: "shared",
              title: "River Wonders",
              body: "Asia's first river-themed wildlife park - explore eight river habitats from the Amazon to the Yangtze, ride the Amazon boat safari, and meet the giant pandas.",
              facts: [
                "River Wonders is one of the only places in the world where you can see giant pandas.",
                "Giant pandas eat mostly bamboo - up to 14 hours a day, because bamboo isn't very nutritious!",
              ],
              variants: {
                little: { body: "Wave to the giant pandas and float past the river animals on a boat!" },
                explorer: {
                  fact: "Pandas can eat 12 to 38 kg of bamboo a day to get enough energy.",
                  quiz: { q: "What is a panda's favourite food?", a: "Bamboo!" },
                },
                explorer_plus: {
                  fact: "Giant pandas are loaned between countries as a friendship gift, nicknamed 'panda diplomacy'.",
                  quiz: {
                    q: "China lends pandas to other countries as a friendly gesture. What is this nicknamed?",
                    a: "Panda diplomacy - China lends pandas to build friendships with other countries.",
                  },
                },
              },
              challenge: {
                type: "quiz",
                prompt: "Giant pandas eat mostly one thing. What is it, and how many hours a day do they spend eating?",
                answer: "Bamboo! And they eat for up to 14 hours a day.",
              },
            },
          ],
        },
        {
          id: "d5_m2",
          slot: "evening",
          title: "Night Safari",
          time_hint: "19:15",
          location: { name: "Night Safari", lat: 1.4043, lng: 103.793 },
          activities: [
            {
              id: "d5_a2",
              kind: "shared",
              title: "Night Safari tram and trails",
              body: "The world's first nocturnal zoo - over 900 animals roam freely. Ride the famous tram or walk the trails to spot tapirs, lions, civets and leopards in the dark.",
              facts: [
                "A leopard can see about 7 times better than a human at night.",
                "The Malayan tapir looks like a mix of a pig and an anteater but is actually related to horses and rhinos!",
              ],
              variants: {
                little: { body: "Ride the tram through the dark and look for animals with shiny eyes!" },
                explorer: {
                  fact: "It takes about 20 minutes for your eyes to fully adjust to the dark.",
                },
                explorer_plus: {
                  fact: "The Night Safari opened in 1994 and was the world's first zoo built just for night-time animals.",
                  quiz: {
                    q: "Night Safari was the world's first nocturnal zoo. In which decade did it open?",
                    a: "The 1990s - specifically 1994! It took seven years to plan and build.",
                  },
                },
              },
              challenge: {
                type: "challenge",
                prompt:
                  "Without using your phone light, try to spot 5 animals using only your night-vision eyes. The longer you stay in the dark, the better your eyes get!",
                answer:
                  "It takes about 20 minutes for your eyes to fully adjust - and the animals can see you far better than you can see them!",
              },
              safety: {
                note: "Lenny: anaphylactic, nuts/legumes - confirm any park snacks/sauces with staff before ordering.",
              },
            },
          ],
        },
      ],
    },
    {
      id: "d_6",
      date: "2026-07-01",
      label: "Orangutans",
      summary: "Breakfast beside the orangutans, then explore a brand-new rainforest adventure park.",
      did_you_know: "Today might be the most magical morning of the whole trip - breakfast WITH orangutans!",
      weather: {
        summary: "Hot and humid in the rainforest. Light clothes and plenty of water.",
        high: 31,
        low: 26,
      },
      hotel: {
        name: "Treetops Singapore, Bukit Timah",
        phase: "move",
        note: "Check in this afternoon - our home for the next 6 nights.",
      },
      star_challenge: {
        question: "What does the word 'orangutan' mean in Malay?",
        answer: "Person of the forest! ('orang' = person, 'utan' = forest)",
      },
      game: {
        type: "spot",
        theme: "Spot the jungle friends!",
        items: ["🦧", "🦁", "🐍", "🦜", "🌿", "🦋", "🍌", "🦎"],
        goal: 4,
      },
      moments: [
        {
          id: "d6_m1",
          slot: "morning",
          title: "Breakfast with Orangutans",
          time_hint: "09:00",
          location: { name: "Singapore Zoo", lat: 1.4043, lng: 103.793 },
          activities: [
            {
              id: "d6_a1",
              kind: "shared",
              title: "Breakfast with Orangutans",
              body: "Eat breakfast in the open-air orangutan habitat while these gentle giants swing around nearby. They are one of our closest animal relatives - so smart they can use tools and even paint!",
              facts: [
                "'Orangutan' comes from the Malay words 'orang' (person) and 'utan' (forest) - person of the forest!",
                "Orangutans are about 7 times stronger than a human, with an arm span wider than they are tall.",
              ],
              variants: {
                little: { body: "Eat your breakfast while big friendly orangutans swing in the trees!" },
                explorer: {
                  fact: "Orangutans are apes, not monkeys - the easiest way to tell is that apes have no tail!",
                  quiz: { q: "Is an orangutan an ape or a monkey?", a: "An ape - apes have no tail!" },
                },
                explorer_plus: {
                  fact: "Orangutans share around 97% of their DNA with humans and live wild on only two islands on Earth.",
                  quiz: {
                    q: "Orangutans live wild on only two islands. Can you name them?",
                    a: "Borneo and Sumatra, in South-East Asia.",
                  },
                },
              },
              meal: {
                venue: "Breakfast with Orangutans, Singapore Zoo",
                allergy_label: "Tree-nut & legume allergy: flagged",
                checked: [
                  "Buffet breakfast - spreads and pastries may contain nuts, and some dishes use soy.",
                  "Plain eggs, fresh fruit and toast are the lower-risk options.",
                ],
                confirm_on_day: [
                  "Tell staff about Lenny's anaphylactic nut and legume allergy when you arrive.",
                  "Keep the EpiPen on the table, not in the bag.",
                ],
                stalls: [
                  {
                    name: "Pastry & spreads station",
                    label: "Tree-nut: flagged",
                    risk: "flagged",
                    note: "Spreads and baked goods may contain nuts. Best avoided for Lenny.",
                  },
                  {
                    name: "Eggs & fresh fruit station",
                    label: "Tree-nut: lower risk",
                    risk: "lower",
                    note: "Plain eggs and fruit. Still confirm no shared utensils with nut dishes.",
                  },
                ],
                ask_kitchen: {
                  language: "Mandarin",
                  phrase:
                    "请问这道菜里有坚果或坚果油吗?我儿子对坚果有严重过敏。",
                  english:
                    "Does this dish contain any nuts or nut oils? My son has a serious tree-nut allergy.",
                },
                reminder: {
                  confirm: [
                    "Tell staff: serious tree-nut and legume allergy.",
                    "Ask about nuts, soy and bean curd in the dish and the sides.",
                    "Confirm before you order, not after.",
                  ],
                },
              },
              challenge: {
                type: "photo",
                prompt:
                  "Get a photo that looks like an orangutan is sitting right behind you - like it is photobombing your breakfast! Ask the keeper to help position it.",
                answer: "This will be one of the best photos of the whole trip. Frame it when you get home!",
              },
              safety: {
                note: "Lenny: anaphylactic, nuts/legumes - buffet breakfast, confirm every dish with staff and keep the EpiPen close.",
              },
            },
          ],
        },
        {
          id: "d6_m2",
          slot: "afternoon",
          title: "Rainforest Wild Adventure",
          time_hint: "15:00",
          location: { name: "Rainforest Wild ASIA", lat: 1.4043, lng: 103.793 },
          activities: [
            {
              id: "d6_a2",
              kind: "kid",
              title: "Rainforest Wild Adventure",
              body: "A brand-new adventure wildlife park - some of the first people ever to explore it! Walk through real rainforest, then try Wild Apex climbing, the Wild Cavern crawl and the treetop walk.",
              facts: [
                "This is Asia's very first adventure-based wildlife park, just opened in 2025.",
              ],
              variants: {
                little: { body: "Climb, crawl and walk high in the trees - a real jungle adventure!" },
                explorer_plus: {
                  fact: "Karst rock, like the cliffs you climb here, is made of limestone slowly dissolved by rainwater over millions of years.",
                },
              },
              challenge: {
                type: "spot",
                prompt:
                  "Find these 4 things hiding in the rainforest: a lizard on a rock, a butterfly, a flower growing on a tree, and a mushroom or fungus.",
                answer:
                  "Look low for lizards (they like warm rocks), look high for butterflies, and check tree trunks for flowers and fungi!",
              },
            },
          ],
        },
      ],
    },
    {
      id: "d_7",
      date: "2026-07-02",
      label: "Botanic Gardens",
      summary: "A gentle day: a UNESCO garden in the morning, then a museum made entirely of ice cream.",
      did_you_know:
        "The Singapore Botanic Gardens is a UNESCO World Heritage Site - one of the most special places on Earth!",
      weather: {
        summary: "Warm and humid. Do the gardens early before the heat builds.",
        high: 32,
        low: 27,
      },
      hotel: {
        name: "Treetops Singapore, Bukit Timah",
        phase: "stay",
        note: "Right by the Botanic Gardens.",
      },
      star_challenge: {
        question: "What is Singapore's national flower?",
        answer: "The Vanda Miss Joaquim orchid - purple and white!",
      },
      game: {
        type: "tap",
        theme: "Catch the ice creams before they melt!",
        items: ["🍦", "🍨", "🧁", "🍭", "🌈", "🍬"],
        goal: 10,
      },
      moments: [
        {
          id: "d7_m1",
          slot: "morning",
          title: "Singapore Botanic Gardens",
          time_hint: "10:00",
          location: { name: "Singapore Botanic Gardens", lat: 1.3294, lng: 103.8019 },
          activities: [
            {
              id: "d7_a1",
              kind: "shared",
              title: "Singapore Botanic Gardens",
              body: "A UNESCO World Heritage garden that's been growing for over 160 years. Find the Children's Garden with water play, tree houses and nature trails, then visit the National Orchid Garden.",
              facts: [
                "The National Orchid Garden has over 1,000 types of orchids.",
                "Singapore's national flower is the Vanda Miss Joaquim - a purple and white orchid.",
              ],
              variants: {
                little: { body: "Splash in the water play and look for the prettiest flowers!" },
                explorer: {
                  fact: "Orchids can grow on other plants and even on bare rock, soaking up water from the air.",
                },
                explorer_plus: {
                  fact: "Experiments with rubber trees at these Gardens in the 1890s helped launch all of South-East Asia's rubber industry.",
                  quiz: {
                    q: "Why was the Vanda Miss Joaquim orchid chosen as the national flower?",
                    a: "It's a tough, year-round-blooming hybrid - the first orchid hybrid registered in Singapore, back in 1893.",
                  },
                },
              },
              challenge: {
                type: "photo",
                prompt:
                  "Find and photograph Singapore's national flower, the Vanda Miss Joaquim orchid - it's purple and white. First one to find it wins!",
                answer:
                  "Head to the National Orchid Garden - it has over 1,000 types of orchids. Look for the purple and white one!",
              },
            },
          ],
        },
        {
          id: "d7_m2",
          slot: "afternoon",
          title: "Museum of Ice Cream",
          time_hint: "14:00",
          location: { name: "Museum of Ice Cream", lat: 1.3047, lng: 103.8108 },
          activities: [
            {
              id: "d7_a2",
              kind: "kid",
              title: "Museum of Ice Cream",
              body: "Not a boring museum at all - over 18 colourful rooms of slides, ball pits and art, and you taste ice cream in every single one. There's even a pool you swim in filled with rainbow sprinkles!",
              variants: {
                little: { body: "Jump in the sprinkle pool and taste ice cream in every room!" },
                explorer_plus: {
                  fact: "Sprinkles, sometimes called 'hundreds and thousands', are made mostly of sugar and a little starch.",
                },
              },
              challenge: {
                type: "challenge",
                prompt:
                  "Try the most unusual flavour you can find - the weirdest one! No chickening out. Rate it 1-10 and tell everyone what it tastes like.",
                answer: "Being brave with food is a superpower - even if it's gross, you'll have a great story!",
              },
            },
          ],
        },
        {
          id: "d7_m3",
          slot: "evening",
          title: "Newton Food Centre",
          time_hint: "18:30",
          location: { name: "Newton Food Centre", lat: 1.3122, lng: 103.8398 },
          activities: [
            {
              id: "d7_a3",
              kind: "shared",
              title: "Dinner at Newton Food Centre",
              body: "A classic Singapore hawker centre - lots of open-air stalls each cooking one special dish. Try laksa, BBQ stingray and oyster omelette.",
              meal: {
                venue: "Newton Food Centre",
                allergy_label: "Tree-nut & legume allergy: flagged",
                checked: [
                  "Satay stalls use peanut sauce throughout - high-risk for Lenny.",
                  "BBQ stingray, oyster omelette and laksa stalls don't centre on nuts, but open hawker cooking carries cross-contamination risk.",
                ],
                confirm_on_day: [
                  "Order one dish at a time and ask each stall holder before Lenny tries anything.",
                  "Keep the EpiPen on the table.",
                ],
                stalls: [
                  {
                    name: "Satay stalls (peanut sauce)",
                    label: "Tree-nut: flagged",
                    risk: "flagged",
                    note: "Peanut sauce is central. Best avoided for Lenny.",
                  },
                  {
                    name: "BBQ stingray stall",
                    label: "Tree-nut: lower risk",
                    risk: "lower",
                    note: "Grilled fish in sambal - confirm no peanut or bean paste in the sauce.",
                  },
                  {
                    name: "Oyster omelette stall",
                    label: "Tree-nut: lower risk",
                    risk: "lower",
                    note: "Egg and oyster. Ask about soy sauce and shared woks.",
                  },
                ],
                ask_kitchen: {
                  language: "Mandarin",
                  phrase:
                    "请问这道菜里有坚果、花生、豆类或豆制品吗?我儿子有严重过敏。",
                  english:
                    "Does this dish contain any nuts, peanuts, beans or soy products? My son has a serious allergy.",
                },
                reminder: {
                  confirm: [
                    "Tell the stall: serious tree-nut and legume allergy.",
                    "Avoid satay, bean curd, tofu and soy-heavy dishes.",
                    "Confirm before you order, not after.",
                  ],
                },
              },
              challenge: {
                type: "challenge",
                prompt:
                  "Savy and Tay must try one thing they've never eaten before - be brave! Rate your mystery food 1-10. Mum or Dad checks anything for Lenny first.",
                answer:
                  "Singapore hawker food is some of the best in the world - even the weird-looking stuff is usually delicious!",
              },
              safety: {
                note: "Lenny: anaphylactic, nuts/legumes - open hawker stalls are high-risk. Avoid satay/tofu/soy, confirm every dish, EpiPen on the table.",
              },
            },
          ],
        },
      ],
    },
    {
      id: "d_8",
      date: "2026-07-03",
      label: "teamLab",
      summary: "Digital art you can touch, then the colours of Little India and Chinatown.",
      did_you_know: "Every Friday at teamLab, kids under 12 get in FREE with an adult ticket!",
      weather: {
        summary: "Hot outside, cool indoors at teamLab. Save the neighbourhoods for late afternoon.",
        high: 32,
        low: 27,
      },
      hotel: {
        name: "Treetops Singapore, Bukit Timah",
        phase: "stay",
        note: "Kids go free at teamLab today!",
      },
      star_challenge: {
        question: "How many official languages does Singapore have, and can you name one?",
        answer: "Four! English, Malay, Mandarin Chinese and Tamil.",
      },
      game: {
        type: "colour",
        theme: "Colour the glowing art!",
        items: ["🌈", "⭐", "💫", "🎨", "🔮", "🎯", "🎪", "🎠"],
        goal: 8,
      },
      moments: [
        {
          id: "d8_m1",
          slot: "morning",
          title: "teamLab Future World",
          time_hint: "10:00",
          location: { name: "teamLab Future World", lat: 1.2863, lng: 103.8593 },
          activities: [
            {
              id: "d8_a1",
              kind: "shared",
              title: "teamLab Future World",
              body: "A mind-blowing art experience where everything is digital and interactive. Flowers bloom under your feet, water ripples when you step in it - and in the Sketch Aquarium, the sea creature you colour in comes alive on a giant screen!",
              facts: [
                "In the Crystal Universe you walk inside a room of thousands of sparkling lights - like floating in outer space.",
                "Arrive at 10am when it opens - the magic rooms are better before the 11am crowds.",
              ],
              variants: {
                little: { body: "Colour a fish and watch it swim on the wall, then dance in the twinkly lights!" },
                explorer: {
                  fact: "Your drawing is scanned and added to the screen, so no two visits ever look the same.",
                },
                explorer_plus: {
                  fact: "Singapore has four official languages - English, Malay, Mandarin and Tamil - and the anthem is sung in Malay.",
                  quiz: {
                    q: "teamLab's artworks change as you move near them. How is that possible?",
                    a: "Sensors and computers generate the art live in real time - it's made by code, not pre-recorded video.",
                  },
                },
              },
              challenge: {
                type: "photo",
                prompt:
                  "In the Crystal Universe room, hold very still for 3 seconds while someone takes the shot. The lights will blur into magic trails around you!",
                answer:
                  "Use portrait mode and hold very still - the twinkling lights will look incredible around you.",
              },
            },
          ],
        },
        {
          id: "d8_m2",
          slot: "afternoon",
          title: "Little India",
          time_hint: "15:00",
          location: { name: "Little India", lat: 1.3066, lng: 103.8518 },
          activities: [
            {
              id: "d8_a2",
              kind: "kid",
              title: "Little India",
              body: "One of the most colourful neighbourhoods in Singapore - streets draped in marigold garlands and the smell of spices in the air. Singapore celebrates four cultures, and this is the heart of the Indian community.",
              facts: [
                "Most signs in Singapore show all four official languages: English, Mandarin, Malay and Tamil.",
              ],
              variants: {
                little: { body: "Look at all the bright orange flowers and the pretty temples!" },
                explorer_plus: {
                  fact: "Tamil is one of the world's oldest living languages, written in beautiful curvy script.",
                },
              },
              challenge: {
                type: "spot",
                prompt:
                  "Find all 4 in Little India: a garland of marigold flowers, a Hindu temple, a spice being sold, and a sign in Tamil script.",
                answer:
                  "Tamil script looks like beautiful curvy squiggles. The Sri Veeramakaliamman Temple on Serangoon Road is stunning.",
              },
            },
          ],
        },
        {
          id: "d8_m3",
          slot: "evening",
          title: "Chinatown",
          time_hint: "17:30",
          location: { name: "Chinatown", lat: 1.2812, lng: 103.8447 },
          activities: [
            {
              id: "d8_a3",
              kind: "shared",
              title: "Chinatown",
              body: "Hop one MRT line from Little India to Chinatown - red lanterns, temples and shops everywhere. The Buddha Tooth Relic Temple holds a real 1,500-year-old tooth, and Maxwell Food Centre serves famous chicken rice.",
              facts: [
                "About 75% of Singapore's people are Chinese, which is why Chinese culture is such a big part of the city.",
                "Maxwell's Tian Tian Chicken Rice has been called the best chicken rice in the world!",
              ],
              variants: {
                little: { body: "Count the red lanterns and look up at the big golden temple!" },
                explorer: {
                  fact: "The Buddha Tooth Relic Temple took its design from the Buddhist art of the Tang dynasty.",
                  quiz: { q: "What colour are the lanterns all over Chinatown?", a: "Red - it means good luck!" },
                },
                explorer_plus: {
                  fact: "teamLab, which you saw this morning, is a digital art collective founded in Tokyo, Japan in 2001.",
                  quiz: {
                    q: "How old is the tooth inside the Buddha Tooth Relic Temple - 500, 1,500 or 2,500 years?",
                    a: "About 1,500 years old, believed to belong to the historical Buddha.",
                  },
                },
              },
              meal: {
                venue: "Maxwell Food Centre, Chinatown",
                allergy_label: "Tree-nut & legume allergy: flagged",
                checked: [
                  "Tian Tian Chicken Rice (plain rice + chicken) is one of the lower-risk dishes.",
                  "Rojak (peanuts), bean curd, tofu and soy-heavy dishes are higher-risk and best avoided.",
                ],
                confirm_on_day: [
                  "Ask each stall about nuts, peanuts and soy before ordering for Lenny.",
                  "Keep the EpiPen on the table.",
                ],
                stalls: [
                  {
                    name: "Tian Tian Chicken Rice",
                    label: "Tree-nut: lower risk",
                    risk: "lower",
                    note: "Plain rice and chicken. Ask about the chilli and ginger sides.",
                  },
                  {
                    name: "Rojak stall",
                    label: "Tree-nut: flagged",
                    risk: "flagged",
                    note: "Rojak is tossed in peanut sauce. Best avoided for Lenny.",
                  },
                  {
                    name: "Bean curd / tofu stalls",
                    label: "Legume: flagged",
                    risk: "flagged",
                    note: "Tofu and bean curd are made from soy. Avoid for Lenny.",
                  },
                ],
                ask_kitchen: {
                  language: "Mandarin",
                  phrase:
                    "请问这道菜里有坚果、花生、豆类或豆制品吗?我儿子有严重过敏。",
                  english:
                    "Does this dish contain any nuts, peanuts, beans or soy products? My son has a serious allergy.",
                },
                reminder: {
                  confirm: [
                    "Tell the stall: serious tree-nut and legume allergy.",
                    "Avoid rojak, bean curd, tofu and soy-heavy dishes.",
                    "Confirm before you order, not after.",
                  ],
                },
              },
              safety: {
                note: "Lenny: anaphylactic, nuts/legumes - chicken rice is lower-risk; avoid rojak/tofu/soy and confirm each dish.",
              },
            },
          ],
        },
      ],
    },
    {
      id: "d_9",
      date: "2026-07-04",
      label: "Gardens by the Bay",
      summary: "Specialty coffee in Joo Chiat, then the Cloud Forest and two free light shows.",
      did_you_know:
        "The Cloud Forest has a 35-metre indoor waterfall - taller than a 10-storey building!",
      weather: {
        summary: "Warm and humid, cool and misty inside the Cloud Forest.",
        high: 32,
        low: 27,
      },
      hotel: {
        name: "Treetops Singapore, Bukit Timah",
        phase: "stay",
      },
      star_challenge: {
        question: "What are the giant glowing tree-like structures at Gardens by the Bay called?",
        answer: "Supertrees - they're covered in plants and light up at night!",
      },
      game: {
        type: "spot",
        theme: "Spot the garden friends!",
        items: ["🦋", "🐝", "🌸", "🍄", "🌻", "🐞", "🌿", "🪷"],
        goal: 4,
      },
      moments: [
        {
          id: "d9_m1",
          slot: "morning",
          title: "Big Short Coffee, Joo Chiat",
          time_hint: "08:00",
          location: { name: "Big Short Coffee", lat: 1.3083, lng: 103.9017 },
          activities: [
            {
              id: "d9_a1",
              kind: "adult",
              title: "Big Short Coffee",
              body: "A tiny but legendary coffee stand in Joo Chiat, famous for cocktail-inspired specialty drinks (~S$8-9). Stroll to Koon Seng Road for Singapore's most-photographed Peranakan shophouses, then Grab 20 minutes to Gardens by the Bay.",
              facts: [
                "Joo Chiat is packed with Peranakan heritage shophouses in vivid pinks, greens and blues.",
              ],
              safety: {
                note: "Lenny: anaphylactic, nuts/legumes - Big Short sometimes offers pistachio cream drinks (tree nut); skip those and ask the barista about today's menu.",
              },
            },
          ],
        },
        {
          id: "d9_m2",
          slot: "afternoon",
          title: "Cloud Forest + Flower Dome",
          time_hint: "14:00",
          location: { name: "Cloud Forest", lat: 1.2816, lng: 103.8636 },
          activities: [
            {
              id: "d9_a2",
              kind: "shared",
              title: "Cloud Forest + Flower Dome",
              body: "Step into a misty mountain wrapped in tropical plants, with a massive 35-metre indoor waterfall - the tallest in the world. Walk the suspended bridges up to the very top and look down on plants from everywhere.",
              facts: [
                "The Cloud Forest stays at just 23-25C - much cooler than outside - to mimic a misty mountain.",
                "The waterfall is about 35 metres tall, taller than a 10-storey building!",
              ],
              variants: {
                little: { body: "Walk in the cool mist and stand next to the GIANT waterfall!" },
                explorer: {
                  fact: "Machines spray a fine fog so the mountain plants feel right at home.",
                },
                explorer_plus: {
                  fact: "The Supertrees are giant vertical gardens; several collect rainwater and have solar panels that power the night show.",
                  quiz: {
                    q: "The Cloud Forest dome holds one of the world's tallest indoor waterfalls. Roughly how tall is it?",
                    a: "About 35 metres - taller than a 10-storey building.",
                  },
                },
              },
              challenge: {
                type: "challenge",
                prompt:
                  "Walk to the very top of the Cloud Forest without taking the lift - count every step on the spiral walkway! First one up picks dessert.",
                answer: "It's about 35 metres high - that's taller than a 10-storey building. The top views are worth it!",
              },
            },
          ],
        },
        {
          id: "d9_m3",
          slot: "evening",
          title: "Double light show night",
          time_hint: "19:45",
          location: { name: "Supertree Grove", lat: 1.2816, lng: 103.8636 },
          activities: [
            {
              id: "d9_a3",
              kind: "shared",
              title: "Garden Rhapsody + Spectra",
              body: "Two free shows in one night! First the Supertrees glow and pulse to music at 7:45pm (Garden Rhapsody), then walk to Marina Bay Sands for Spectra at 9pm - water jets, lasers and light on a screen of mist.",
              facts: [
                "The Supertrees work like real trees - collecting rainwater, generating solar power and filtering air.",
              ],
              variants: {
                little: { body: "Lie back and watch the giant trees sing in colourful lights!" },
                explorer_plus: {
                  fact: "There are 18 Supertrees at Gardens by the Bay, ranging from 25m to 50m tall.",
                },
              },
              challenge: {
                type: "photo",
                prompt:
                  "Take your best photo during each show - Supertrees and Spectra. Who got the most magical shot?",
                answer:
                  "Turn off your flash, hold still, and try to put people in the foreground with the lights behind them.",
              },
            },
          ],
        },
      ],
    },
    {
      id: "d_10",
      date: "2026-07-05",
      label: "Orchard Road",
      summary: "Souvenir hunting along Singapore's famous shopping street, then a huge world buffet.",
      did_you_know:
        "Orchard Road is named after the fruit orchards and nutmeg plantations that grew here in the 1800s!",
      weather: {
        summary: "Hot outside, cool in the malls. Easy day with plenty of air-con breaks.",
        high: 32,
        low: 27,
      },
      hotel: {
        name: "Treetops Singapore, Bukit Timah",
        phase: "stay",
      },
      star_challenge: {
        question: "Singapore uses the Singapore Dollar. Is it worth more or less than the Australian Dollar?",
        answer: "A bit more! Around 1 SGD is roughly A$1.10.",
      },
      game: {
        type: "tap",
        theme: "Fill the shopping bag with treats!",
        items: ["🎀", "⭐", "🧸", "🎊", "🎁", "🛍️"],
        goal: 10,
      },
      moments: [
        {
          id: "d10_m1",
          slot: "afternoon",
          title: "Orchard Road shopping",
          time_hint: "13:00",
          location: { name: "Orchard Road", lat: 1.304, lng: 103.8318 },
          activities: [
            {
              id: "d10_a1",
              kind: "kid",
              title: "Orchard Road souvenir hunt",
              body: "Singapore's most famous shopping street - one giant mall after another for about 2 kilometres. The perfect place to find souvenirs and gifts to take home.",
              facts: [
                "Good souvenirs to look for: Merlion toys, chilli crab chips, kaya jam, and anything with Singapore's flag.",
              ],
              variants: {
                little: { body: "Pick out a little treat or a toy to take home!" },
                explorer_plus: {
                  fact: "Chilli crab was invented in Singapore in the 1950s and is now one of its most famous dishes.",
                },
              },
              challenge: {
                type: "challenge",
                prompt:
                  "Each kid has a mission: find the perfect souvenir for one person back home (friend, teacher, grandparent). Budget: S$10. Go!",
                answer:
                  "Think about what that person likes, not just what looks cool to you. A thoughtful gift beats an expensive one!",
              },
            },
          ],
        },
        {
          id: "d10_m2",
          slot: "evening",
          title: "The Line buffet",
          time_hint: "18:00",
          location: { name: "The Line, Shangri-La", lat: 1.3107, lng: 103.8276 },
          activities: [
            {
              id: "d10_a2",
              kind: "shared",
              title: "The Line buffet - eat the world",
              body: "One of Singapore's most famous buffets - over 300 dishes from all around the world, all you can eat. Japanese, Italian, Indian, Chinese, live cooking stations, and a dessert section that goes on forever.",
              facts: [
                "Try one dish from every country here and you'd eat food from over 15 nations in one sitting!",
              ],
              meal: {
                venue: "The Line, Shangri-La",
                allergy_label: "Tree-nut & legume allergy: flagged",
                checked: [
                  "The hotel kitchen is trained for serious allergies and can guide you to safe dishes at each live station.",
                  "Far lower-risk than open hawker stalls, but a huge buffet still has many allergens present.",
                ],
                confirm_on_day: [
                  "Call ahead to flag Lenny's anaphylactic nut and legume allergy, then speak to the maitre d' on arrival.",
                  "Keep the EpiPen on the table.",
                ],
                stalls: [
                  {
                    name: "Live carving & grill stations",
                    label: "Tree-nut: lower risk",
                    risk: "lower",
                    note: "Plain grilled meats - staff can identify allergen-free options.",
                  },
                  {
                    name: "Asian & satay station",
                    label: "Tree-nut: flagged",
                    risk: "flagged",
                    note: "Satay and some sauces use peanut. Best avoided for Lenny.",
                  },
                  {
                    name: "Dessert & pastry spread",
                    label: "Tree-nut: flagged",
                    risk: "flagged",
                    note: "Many cakes and pastries contain nuts. Ask staff which are nut-free.",
                  },
                ],
                ask_kitchen: {
                  language: "Mandarin",
                  phrase:
                    "请问这道菜里有坚果、花生、豆类或豆制品吗?我儿子有严重过敏。",
                  english:
                    "Does this dish contain any nuts, peanuts, beans or soy products? My son has a serious allergy.",
                },
                reminder: {
                  confirm: [
                    "Speak to the maitre d' first: serious tree-nut and legume allergy.",
                    "Let staff point out safe dishes at each station before Lenny eats.",
                    "Confirm before you order, not after.",
                  ],
                },
              },
              challenge: {
                type: "challenge",
                prompt:
                  "How many different countries can you eat food from in one dinner? Japanese sushi, Italian pasta, Indian curry, French pastry - count them up! Most countries wins.",
                answer:
                  "Save room for dessert - the chocolate fountain and ice cream station are legendary. Strategic buffet planning is key!",
              },
              safety: {
                note: "Lenny: anaphylactic, nuts/legumes - hotel kitchen is safer than hawkers; call ahead, brief the maitre d', EpiPen on the table.",
              },
            },
          ],
        },
      ],
    },
    {
      id: "d_11",
      date: "2026-07-06",
      label: "Universal Studios",
      summary: "A scenic cable car in, then a full day of coasters at Universal Studios.",
      did_you_know:
        "The Battlestar Galactica coasters reopen on exactly 6 July - our day! We planned this perfectly!",
      weather: {
        summary: "Hot and sunny. Hat, water and sunscreen for the queues.",
        high: 32,
        low: 27,
      },
      hotel: {
        name: "Treetops Singapore, Bukit Timah",
        phase: "stay",
        note: "All coasters open today!",
      },
      star_challenge: {
        question: "Universal Studios Singapore opened in 2010. Was it the first Universal Studios in Asia?",
        answer: "No - Japan was first (2001). Singapore was the first in South-East Asia!",
      },
      game: {
        type: "colour",
        theme: "Colour the theme park!",
        items: ["🎢", "🎡", "🎠", "🎪", "⭐", "🎉", "🏰", "🚀"],
        goal: 8,
      },
      moments: [
        {
          id: "d11_m1",
          slot: "morning",
          title: "Singapore Cable Car",
          time_hint: "09:00",
          location: { name: "Mount Faber Cable Car", lat: 1.2541, lng: 103.8238 },
          activities: [
            {
              id: "d11_a1",
              kind: "shared",
              title: "Singapore Cable Car",
              body: "Ride the cable car one way into Sentosa to start the day in style - flying over the water with views of the harbour, ships and city skyline, all the way to Universal's front door.",
              facts: [
                "The Singapore Cable Car has been running since 1974 and even passes through an office building!",
              ],
              variants: {
                little: { body: "Fly high over the water in the cable car and wave at the ships!" },
                explorer: {
                  fact: "Ask for a SkyOrb cabin - some have glass floors so you can look straight down at the ocean.",
                },
                explorer_plus: {
                  fact: "Universal Studios Singapore is the smallest Universal park in the world, but packs seven themed zones inside.",
                  quiz: {
                    q: "Singapore is one of the world's busiest ports. Roughly how many ships might wait in the harbour?",
                    a: "Over 100 at once - the port handles about 1 in 5 of the world's shipping containers.",
                  },
                },
              },
              challenge: {
                type: "spot",
                prompt:
                  "From the cable car, spot and count: ships in the harbour, construction cranes, palm trees on Sentosa, and how many skyscrapers you can see.",
                answer:
                  "Singapore is one of the world's busiest ports - you might spot over 100 ships waiting in the harbour!",
              },
            },
          ],
        },
        {
          id: "d11_m2",
          slot: "afternoon",
          title: "Universal Studios Singapore",
          time_hint: "11:00",
          location: { name: "Universal Studios Singapore", lat: 1.2541, lng: 103.8238 },
          activities: [
            {
              id: "d11_a2",
              kind: "kid",
              title: "Universal Studios Singapore",
              body: "Seven themed zones packed with rides! Race the duelling Battlestar Galactica coasters, battle robots on Transformers, brave Jurassic World's river rapids, and explore the brand-new Minion Land and Super Nintendo World.",
              facts: [
                "Battlestar Galactica is the world's tallest pair of duelling roller coasters - two trains racing side by side!",
                "Go to Sci-Fi City first when the park opens - the queues double after 11am.",
              ],
              variants: {
                little: { body: "Meet the Minions and ride the gentle rides with a grown-up!" },
                explorer: {
                  fact: "Super Nintendo World and Minion Land are both brand new for 2026.",
                  quiz: { q: "What yellow cartoon characters have their own land here?", a: "The Minions!" },
                },
                explorer_plus: {
                  fact: "Universal Studios Singapore opened in 2010 - the second in Asia after Japan (2001), and the first in South-East Asia.",
                  quiz: {
                    q: "Battlestar Galactica is a 'duelling' coaster. What makes it special?",
                    a: "Two trains launch and race side-by-side on separate tracks, passing within metres of each other.",
                  },
                },
              },
              challenge: {
                type: "photo",
                prompt:
                  "Collect a photo with a character from each of the 7 zones! Minions, Transformers, Puss in Boots, Shrek, a dinosaur, a mummy and a Nintendo character.",
                answer:
                  "Characters rotate around the park - ask a staff member for the meet-and-greet schedule at the entrance.",
              },
              safety: {
                note: "Lenny: anaphylactic, nuts/legumes - confirm sauces and snack ingredients at park food outlets before ordering.",
              },
            },
          ],
        },
      ],
    },
    {
      id: "d_12",
      date: "2026-07-07",
      label: "Fly Home",
      summary: "One last wonder at Jewel Changi, then the flight home with a heart full of memories.",
      did_you_know:
        "Jewel Changi has the world's tallest indoor waterfall - the Rain Vortex, 40 metres tall!",
      weather: {
        summary: "Warm and humid. An easy last day before the night flight.",
        high: 32,
        low: 27,
      },
      hotel: {
        name: "Treetops Singapore, Bukit Timah",
        phase: "depart",
        note: "Checkout today - flight QF82 departs 9pm.",
      },
      star_challenge: {
        question: "Jewel Changi has the world's tallest indoor waterfall. What is it called?",
        answer: "The Rain Vortex - 40 metres tall, as tall as a 13-storey building!",
      },
      game: {
        type: "spot",
        theme: "Spot the travel treasures at Jewel!",
        items: ["✈️", "💎", "🌈", "🎁", "🧳", "🗺️", "🌟", "🌿"],
        goal: 4,
      },
      moments: [
        {
          id: "d12_m1",
          slot: "afternoon",
          title: "Jewel Changi Airport",
          time_hint: "14:00",
          location: { name: "Jewel Changi Airport", lat: 1.3592, lng: 103.9894 },
          activities: [
            {
              id: "d12_a1",
              kind: "shared",
              title: "Jewel Changi Airport",
              body: "Voted the world's best airport nearly every year - and Jewel is why. A giant glass dome with the HSBC Rain Vortex, the world's tallest indoor waterfall at 40 metres, plus Canopy Park upstairs with slides, bouncy nets and a hedge maze.",
              facts: [
                "The Rain Vortex uses rainwater collected from the glass roof, with a coloured light show at night.",
              ],
              variants: {
                little: { body: "Watch the giant waterfall and bounce in the play nets one last time!" },
                explorer: {
                  fact: "Water takes only about 2-3 seconds to fall the full 40 metres of the Rain Vortex.",
                },
                explorer_plus: {
                  fact: "Jewel's glass dome uses about 9,000 glass panels and was designed by architect Moshe Safdie.",
                  quiz: {
                    q: "Changi is often voted the world's best airport. Name one surprising thing inside it.",
                    a: "An indoor waterfall, a butterfly garden, slides and rooftop gardens - inside the terminals!",
                  },
                },
              },
              challenge: {
                type: "challenge",
                prompt:
                  "Stand at the edge of the Rain Vortex and count: how many seconds does one drop of water take to fall from the top to the bottom?",
                answer: "It's 40 metres tall, so water takes about 2-3 seconds to fall - the height of a 13-storey building!",
              },
            },
          ],
        },
        {
          id: "d12_m2",
          slot: "evening",
          title: "Flying home",
          time_hint: "18:00",
          location: { name: "Changi Airport", lat: 1.3592, lng: 103.9894 },
          activities: [
            {
              id: "d12_a2",
              kind: "shared",
              title: "Last dinner and flying home",
              body: "A final sit-down dinner at Jewel before flight QF82 leaves at 9pm for Sydney overnight, then home to Adelaide. Time to look through all your photos and remember every amazing moment!",
              meal: {
                venue: "Din Tai Fung, Changi (Terminal 3)",
                allergy_label: "Tree-nut & legume allergy: flagged",
                checked: [
                  "Din Tai Fung has a clean kitchen and good allergen awareness - a safer bet for Lenny than hawker stalls.",
                  "Dumplings and noodles are the lower-risk options; dipping sauces contain soy.",
                ],
                confirm_on_day: [
                  "Tell staff about Lenny's anaphylactic nut and legume allergy and ask them to flag soy in any dish.",
                  "Keep the EpiPen on you - not the moment to take risks before a long flight.",
                ],
                stalls: [
                  {
                    name: "Steamed dumplings & noodles",
                    label: "Tree-nut: lower risk",
                    risk: "lower",
                    note: "Clean kitchen, but ask about soy in fillings and skip the soy dipping sauce for Lenny.",
                  },
                  {
                    name: "Jewel hawker-style stalls",
                    label: "Tree-nut: flagged",
                    risk: "flagged",
                    note: "Open cooking - avoid on the last day before the flight.",
                  },
                ],
                ask_kitchen: {
                  language: "Mandarin",
                  phrase:
                    "请问这道菜里有坚果、花生、豆类或豆制品吗?我儿子有严重过敏。",
                  english:
                    "Does this dish contain any nuts, peanuts, beans or soy products? My son has a serious allergy.",
                },
                reminder: {
                  confirm: [
                    "Tell staff: serious tree-nut and legume allergy.",
                    "Ask them to flag soy in fillings and sauces.",
                    "Confirm before you order, not after.",
                  ],
                },
              },
              challenge: {
                type: "quiz",
                prompt:
                  "Everyone answer: what was your number one favourite moment of the whole trip? And what food would you eat again right now if you could?",
                answer: "These memories are yours forever. Singapore will always be part of your story!",
              },
              safety: {
                note: "Lenny: anaphylactic, nuts/legumes - Din Tai Fung is lower-risk; brief staff, watch soy, keep the EpiPen on you before the flight.",
              },
            },
          ],
        },
      ],
    },
  ],
  grownups: {
    essentials: "Passports, EZ-Link cards, sunscreen, refillable water bottles.",
    checklist: [
      "Confirm allergy cards in English + Mandarin",
      "Download offline map",
      "Charge the camera",
    ],
    transport: "MRT covers everything; grab a taxi only for late nights.",
    phases: [
      { label: "Village Hotel Sentosa", range: "nights 1-4" },
      { label: "Mandai Rainforest Resort", range: "night 5" },
      { label: "Treetops Bukit Timah (self-catering)", range: "nights 6-11" },
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
      {
        day_id: "d_4",
        bookings: ["Adventure Cove tickets + cabana (book at purchase)"],
        costs: ["Adventure Cove ~S$40 / A$44 adult; cabana extra"],
        transport: ["On-island, short walk from the hotel"],
        tips: [
          "Monday is the lightest crowd day - grab a locker and a waterproof phone case",
          "Pack reef shoes; surfaces get scorching",
        ],
        allergy: ["Quick lunch at Resorts World: confirm fryer oils and sauces before ordering for Lenny"],
      },
      {
        day_id: "d_5",
        bookings: [
          "River Wonders + Night Safari combo (book ahead)",
          "Compare the Mandai multi-park pass",
        ],
        costs: [
          "River Wonders ~S$43 / A$47 adult",
          "Night Safari ~S$56 / A$61 adult - a bundle saves",
        ],
        transport: ["Checkout Village ~11am; Grab Sentosa to Mandai ~S$35-40 / A$38-44, 45 min"],
        tips: ["Insect repellent is essential", "Early dinner at the resort before the Night Safari"],
        allergy: ["Park F&B and resort dinner: confirm dishes with staff before ordering for Lenny"],
      },
      {
        day_id: "d_6",
        bookings: [
          "Breakfast with Orangutans (pre-booked, 9:00am)",
          "Rainforest Wild ASIA - Wild Cavern Bundle (2 tickets, S$90, paid)",
        ],
        costs: ["Orangutan breakfast ~S$35pp", "Rainforest Wild Cavern Bundle S$90 for 2 (paid)"],
        transport: ["Checkout Mandai; Grab to Treetops Bukit Timah ~S$30 / A$33"],
        tips: [
          "Treetops is self-catering for 6 nights - stock up at Cold Storage / FairPrice on arrival",
          "Confirm the Treetops check-in time",
        ],
        allergy: [
          "Orangutan breakfast is a buffet (nuts in pastries, soy in some dishes) - brief staff, favour plain eggs/fruit/toast, keep the EpiPen on the table",
        ],
      },
      {
        day_id: "d_7",
        bookings: ["Museum of Ice Cream"],
        costs: [
          "Botanic Gardens free; National Orchid Garden ~S$15 / A$16",
          "Museum of Ice Cream ~S$42 / A$46",
        ],
        transport: ["Treetops is near the Botanic Gardens; Grab or MRT for the rest"],
        tips: ["Do the Botanic Gardens early, before the heat builds"],
        allergy: [
          "Newton Food Centre dinner: order BBQ stingray, oyster omelette, laksa; avoid satay stalls (peanut sauce) and any tofu/bean curd. Open hawker cooking is high cross-contamination risk - keep the EpiPen on the table and order one dish at a time for Lenny after checking with the stall holder",
        ],
      },
      {
        day_id: "d_8",
        bookings: ["teamLab 10am (Family Friday - Tay and Lenny free)"],
        costs: ["teamLab ~S$38 / A$41 adult"],
        transport: ["MRT day - Little India (NE line) then Chinatown (DT/NE)"],
        tips: ["Cool indoor morning at teamLab, neighbourhoods in the late afternoon"],
        allergy: [
          "Lunch at Maxwell Food Centre: order Tian Tian Chicken Rice (lower-risk) and check each dish. Skip a full meal in Little India - Indian hawker food is very high-risk (dhal, lentils, chickpeas, soy). Avoid rojak (peanuts), bean curd, tofu and soy-heavy dishes for Lenny",
        ],
      },
      {
        day_id: "d_9",
        bookings: ["Cloud Forest + Flower Dome combo", "Big Short Coffee opens Sat 8am"],
        costs: ["Combo ~S$53 / A$58 adult; the Supertree show and Spectra are FREE"],
        transport: [
          "Grab ~20 min Joo Chiat to Gardens by the Bay",
          "MRT to Bayfront for the gardens",
        ],
        tips: ["Garden Rhapsody at the Supertrees 7:45pm; Spectra on the MBS waterfront 9pm"],
        allergy: [
          "Big Short Coffee: skip pistachio cream drinks (tree nut) for Lenny - espresso and seasonal cold brews are fine after asking",
          "Dinner at Marina Bay Sands restaurants before the shows; avoid Satay by the Bay entirely (peanut sauce throughout, high cross-contamination risk)",
        ],
      },
      {
        day_id: "d_10",
        bookings: [
          "The Line at Shangri-La (book ahead; call to flag Lenny's anaphylactic nut and legume allergy - staff are trained for this)",
        ],
        costs: [
          "Shopping budget",
          "The Line ~S$88-98 / A$96-107 adult; children's rate reduced - confirm when booking",
        ],
        transport: ["Short Grab from Orchard Road direct to Shangri-La - about 5 min, S$8-10"],
        tips: ["Book an early sitting (6pm) so the kids aren't too tired from Orchard Road"],
        allergy: [
          "Speak to the maitre d' on arrival. The hotel kitchen is far safer than hawker stalls - staff can identify allergen-free dishes at each live station for Lenny",
        ],
      },
      {
        day_id: "d_11",
        bookings: ["Universal Studios + Express Pass (pre-booked)"],
        costs: ["USS ~S$88 / A$96 adult; Express Pass ~S$50-80 extra (worth it in peak)"],
        transport: ["Cable car into Sentosa (Mount Faber / HarbourFront line) for a scenic entry"],
        tips: ["Battlestar Galactica reopens today - ride it early before the queues"],
        allergy: ["Eat inside USS or back at Resorts World; confirm sauces and snacks before ordering for Lenny"],
      },
      {
        day_id: "d_12",
        bookings: ["Confirm QF82 SIN to SYD 9:00pm - be at Changi around 6pm"],
        costs: ["Jewel free to wander; Rain Vortex show free; Canopy Park ~S$10 / A$11"],
        transport: ["Checkout Treetops; store bags or arrange a late checkout if you can"],
        tips: ["Jewel is at Changi - do it before check-in, and spend any leftover SGD"],
        allergy: [
          "Last meal at Din Tai Fung (T3) is a safer bet for Lenny (clean kitchen, dumplings and noodles, good allergen awareness; watch soy). Avoid hawker-style stalls at Jewel on the last day before a long flight",
        ],
      },
    ],
  },
};

const TRIPS_BY_ID: Record<string, TripContent> = {
  t_sg: SINGAPORE_TRIP,
};

/**
 * During-trip companion cards for the Walker Singapore trip. Pre-loaded "what's
 * nearby" answers with tree-nut text flags + confirm-on-the-day notes already
 * applied, plus a one-tap rain plan. Tree-nut allergy language never says "safe".
 */
const COMPANION_BY_TRIP: Record<string, CompanionCard[]> = {
  t_sg: [
    {
      id: "comp_satay",
      near_label: "Near Gardens by the Bay",
      prompt: "What's good to eat near here?",
      options: [
        {
          name: "Satay by the Bay - seafood stalls",
          flags: ["Tree-nut allergy: flagged"],
          note: "Satay sauce is peanut-based. Ask the kitchen and confirm on the day before ordering.",
        },
        {
          name: "Supertree Food Hall - grilled chicken rice",
          flags: ["Tree-nut allergy: lower risk"],
          note: "No nut sauces on the standard dish. Still confirm with the stall before you order.",
        },
      ],
      rain_plan: {
        title: "If it rains: ArtScience Museum",
        body: "A 10-minute covered walk. Pre-booked as your indoor anchor for the afternoon.",
      },
      created_at: "2025-09-15T03:00:00.000Z",
    },
  ],
};

/**
 * Reopenable planning-chat transcript for the Walker trip: the opening
 * three-question conversation plus a forwarded hotel-confirmation import chip.
 */
const CHAT_BY_TRIP: Record<string, ChatHistoryMessage[]> = {
  t_sg: [
    {
      id: "m1",
      role: "assistant",
      kind: "text",
      content: "Where are you headed, and who's coming along?",
      seq: 1,
      created_at: "2025-08-01T09:00:00.000Z",
    },
    {
      id: "m2",
      role: "user",
      kind: "text",
      content: "Singapore in September - two grown-ups and three kids (9, 6 and 3).",
      seq: 2,
      created_at: "2025-08-01T09:00:30.000Z",
    },
    {
      id: "m3",
      role: "user",
      kind: "import_chip",
      content: "Hotel confirmation - Marina Bay, 14-18 Sep",
      meta: { source: "email", kind: "hotel_confirmation" },
      seq: 3,
      created_at: "2025-08-01T09:01:00.000Z",
    },
    {
      id: "m4",
      role: "assistant",
      kind: "text",
      content: "Got it. Anything we should plan around - allergies, nap times, must-dos?",
      seq: 4,
      created_at: "2025-08-01T09:01:20.000Z",
    },
    {
      id: "m5",
      role: "user",
      kind: "text",
      content: "Pip has a tree-nut allergy. Theo (3) still naps after lunch.",
      seq: 5,
      created_at: "2025-08-01T09:01:50.000Z",
    },
    {
      id: "m6",
      role: "assistant",
      kind: "text",
      content:
        "Perfect - I'll flag tree nuts on every meal and keep Theo's afternoons gentle. Building your Singapore days now.",
      seq: 6,
      created_at: "2025-08-01T09:02:10.000Z",
    },
  ],
};

export function getMockCompanion(tripId: string): CompanionCard[] {
  return COMPANION_BY_TRIP[tripId] ?? [];
}

export function getMockChatHistory(tripId: string): ChatHistoryMessage[] {
  return CHAT_BY_TRIP[tripId] ?? [];
}

export function getMockTrip(id: string): TripContent | undefined {
  return TRIPS_BY_ID[id];
}

/** The `Trip` record (row) for `GET /trips/:id`, derived from the list summary. */
export function getMockTripRecord(id: string): Trip | undefined {
  const s = MOCK_TRIPS.find((t) => t.id === id);
  if (!s) return undefined;
  const { day_count: _dc, data_kept: _dk, ...trip } = s;
  return trip;
}

// --- Trip management mocks (archive / duplicate / share) --------------------
// These mutate the in-memory MOCK_TRIPS so the dev/mock experience reflects the
// change. Production flips the SERVED flags to the live BE (see docs/handoffs/13).

/** Flip a trip's archived state in the mock store; returns the updated row. */
export function archiveMockTrip(id: string, archived: boolean): Trip | undefined {
  const s = MOCK_TRIPS.find((t) => t.id === id);
  if (!s) return undefined;
  s.status = archived ? "archived" : "ready";
  return getMockTripRecord(id);
}

/** Duplicate a trip into a fresh free draft, registering its content too. */
export function duplicateMockTrip(id: string): Trip | undefined {
  const src = MOCK_TRIPS.find((t) => t.id === id);
  if (!src) return undefined;
  const newId = `t_${Math.random().toString(36).slice(2, 8)}`;
  const copy: TripSummary = {
    ...src,
    id: newId,
    destination: `${src.destination} (copy)`,
    tier: "free",
    status: "draft",
  };
  MOCK_TRIPS.unshift(copy);
  const content = TRIPS_BY_ID[id];
  if (content) {
    TRIPS_BY_ID[newId] = {
      ...content,
      trip: { ...content.trip, id: newId, destination: copy.destination },
    };
  }
  const { day_count: _dc, data_kept: _dk, ...trip } = copy;
  return trip;
}

/** In-memory share-token -> trip id map for the mock shared view. */
const SHARES_BY_TOKEN: Record<string, string> = {};

/** Mint (or reuse) a share token for a trip in the mock store. */
export function shareMockTrip(id: string): string | undefined {
  if (!MOCK_TRIPS.some((t) => t.id === id)) return undefined;
  const token = `shr_${id}_${Math.random().toString(36).slice(2, 8)}`;
  SHARES_BY_TOKEN[token] = id;
  return token;
}

/** Resolve a mock share token to its read-only trip content. */
export function getMockSharedTrip(token: string): { shared_by: string; content: TripContent } | undefined {
  // Tolerate tokens minted in another worker by parsing the embedded trip id.
  const id = SHARES_BY_TOKEN[token] ?? token.split("_").slice(1, -1).join("_");
  const content = TRIPS_BY_ID[id];
  if (!content) return undefined;
  return { shared_by: "A Yaycay family", content };
}
