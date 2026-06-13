/**
 * MOCK packing lists - TEMPORARY. Per-profile + a shared family list, sectioned,
 * with tick state and CRUD. Module memory; resets on restart. Swap target: BE
 * `GET|PATCH /trips/:id/packing`.
 */
import type { PackingList, PackingSection } from "./types";

let counter = 0;
const uid = (p: string) => `${p}_${(counter += 1)}`;

function seed(): PackingList[] {
  const mk = (label: string, labels: string[]): PackingSection => ({
    id: uid("sec"),
    label,
    items: labels.map((l) => ({ id: uid("item"), label: l, checked: false })),
  });
  return [
    {
      id: "p_savy",
      label: "Savy",
      sections: [
        mk("Clothes & shoes", ["Reef shoes", "Swimmers", "Sun hat", "Light raincoat"]),
        mk("Tech", ["Headphones", "Charger", "Tablet"]),
      ],
    },
    {
      id: "p_tay",
      label: "Tay",
      sections: [
        mk("Clothes & shoes", ["Swimmers", "Sandals", "Sun hat"]),
        mk("Fun stuff", ["Switch", "Colouring book"]),
      ],
    },
    {
      id: "p_lenny",
      label: "Lenny",
      sections: [
        mk("Clothes & sleep", ["Rashie", "Pull-ups", "Comfort toy"]),
        mk("Lenny essentials", ["EpiPen x2", "Antihistamine", "Safe snacks", "Kids Panadol"]),
      ],
    },
    {
      id: "family",
      label: "Family",
      sections: [
        mk("Documents & money", ["5 passports", "SGD cash", "EZ-Link cards"]),
        mk("Day bag", ["Sunscreen", "Water bottles", "Wet wipes", "Allergy cards"]),
      ],
    },
  ];
}

const store = new Map<string, PackingList[]>();

function lists(tripId: string): PackingList[] {
  if (!store.has(tripId)) store.set(tripId, seed());
  return store.get(tripId)!;
}

export function getPacking(tripId: string): PackingList[] {
  return lists(tripId);
}

export function tickItem(tripId: string, listId: string, itemId: string, checked: boolean): PackingList[] {
  for (const l of lists(tripId)) {
    if (l.id !== listId) continue;
    for (const s of l.sections) {
      const it = s.items.find((i) => i.id === itemId);
      if (it) it.checked = checked;
    }
  }
  return lists(tripId);
}

export function addItem(tripId: string, listId: string, sectionId: string, label: string, qty?: number): PackingList[] {
  for (const l of lists(tripId)) {
    if (l.id !== listId) continue;
    const s = l.sections.find((x) => x.id === sectionId);
    if (s) s.items.push({ id: uid("item"), label, qty, checked: false });
  }
  return lists(tripId);
}

export function deleteItem(tripId: string, listId: string, itemId: string): PackingList[] {
  for (const l of lists(tripId)) {
    if (l.id !== listId) continue;
    for (const s of l.sections) {
      s.items = s.items.filter((i) => i.id !== itemId);
    }
  }
  return lists(tripId);
}

export function resetTicks(tripId: string): PackingList[] {
  for (const l of lists(tripId)) {
    for (const s of l.sections) {
      for (const it of s.items) it.checked = false;
    }
  }
  return lists(tripId);
}
