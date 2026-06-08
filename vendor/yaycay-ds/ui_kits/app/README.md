# Yaycay app — UI kit (trip planner)

A high-fidelity, click-through recreation of the **Yaycay** product: where families plan a trip
together, day by day.

## Run it
Open `index.html`. It composes the design-system components (loaded from the compiled
`_ds_bundle.js`) with the kit's own screen code.

## Screens & flow
- **Home dashboard** (`TripsHome.jsx`) — greeting, a sunset **"sleeps to go" countdown hero**, and a
  grid of trip cards. Click any trip (or "Open plan") to open it.
- **Trip planner** (`TripPlanner.jsx`) — a single trip with pill **Tabs**: *Day plan* (a dashed
  timeline of activities with coloured kind-icons), *Packing* (shared checklists), *Budget* (progress
  meters by category). "All trips" returns home.
- **New-trip sheet** (`NewTripSheet.jsx`) — the "Start a trip" modal; creating one fires a success toast.

## Files
- `index.html` — composed, runnable page (built from the sources below).
- `data.js` — fake trips, day plans, packing lists (`window.YC_DATA`).
- `shared.jsx` — brand **Scene** tiles (sky/sunset/meadow/aqua gradient illustrations) + inline
  **Icon** set (Lucide-style, stroke 2.5) used across the kit.
- `AppShell.jsx` — left rail + sticky top bar chrome.
- `TripsHome.jsx` · `TripPlanner.jsx` · `NewTripSheet.jsx` — the screens.

## Notes
- Destination imagery uses the brand **Scene** gradient tiles (no stock photos were supplied). Drop
  real warm, sunny family photos into `CardMedia` to finish.
- Components come from the system (`Button`, `Card`, `Tabs`, `Badge`, `ProgressMeter`, …) — the kit
  never re-implements them.
