// Fake data for the Yaycay trip-planner UI kit.
window.YC_DATA = {
  user: { name: "Jo Ross", initials: "JO" },
  trips: [
    {
      id: "sicily",
      title: "Sicily with the kids",
      where: "Taormina, Italy",
      dates: "Jul 12 – 19",
      sleeps: 12,
      scene: "sunset",
      tag: "Beach",
      days: 7,
      planned: 3,
      packing: 0.4,
      budget: { spent: 1400, total: 2000 },
      crew: [
        { name: "Jo Ross", tone: "sky" },
        { name: "Mia Ross", tone: "sun" },
        { name: "Theo Ross", tone: "aqua" },
      ],
    },
    {
      id: "lakes",
      title: "Lake District escape",
      where: "Windermere, UK",
      dates: "Aug 24 – 27",
      sleeps: 55,
      scene: "meadow",
      tag: "Outdoors",
      days: 3,
      planned: 1,
      packing: 0.1,
      budget: { spent: 220, total: 900 },
      crew: [
        { name: "Jo Ross", tone: "sky" },
        { name: "Sam Ross", tone: "coral" },
      ],
    },
    {
      id: "lisbon",
      title: "Lisbon long weekend",
      where: "Lisbon, Portugal",
      dates: "Oct 3 – 6",
      sleeps: 95,
      scene: "sky",
      tag: "City",
      days: 3,
      planned: 0,
      packing: 0,
      budget: { spent: 0, total: 1200 },
      crew: [{ name: "Jo Ross", tone: "sky" }],
    },
  ],
  // day plan for the Sicily trip
  plan: [
    {
      day: "Sat 12 Jul", label: "Arrive & settle in", items: [
        { time: "14:00", title: "Land at Catania", kind: "travel" },
        { time: "16:30", title: "Check in — Casa Limone", kind: "stay" },
        { time: "19:00", title: "Pizza on the piazza", kind: "food" },
      ],
    },
    {
      day: "Sun 13 Jul", label: "Beach day", items: [
        { time: "10:00", title: "Isola Bella beach", kind: "play" },
        { time: "13:00", title: "Gelato stop", kind: "food" },
        { time: "17:00", title: "Rock pools with the kids", kind: "play" },
      ],
    },
    {
      day: "Mon 14 Jul", label: "Mount Etna", items: [
        { time: "08:30", title: "Cable car up Etna", kind: "play" },
        { time: "12:00", title: "Picnic at the craters", kind: "food" },
      ],
    },
  ],
  packing: [
    { group: "Everyone", items: ["Passports", "Sun cream", "Reusable bottles", "Travel adapters"] },
    { group: "Kids", items: ["Swim things", "Buckets & spades", "Tablet + headphones", "Snacks"] },
  ],
};
