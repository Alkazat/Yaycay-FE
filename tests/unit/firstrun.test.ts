import { describe, it, expect } from "vitest";
import { firstRunMilestones, completedCount, allDone, coreComplete } from "@/lib/firstrun";

describe("first-run checklist", () => {
  it("ticks milestones from live state", () => {
    const ms = firstRunMilestones({
      tripCount: 1,
      hasExplorer: true,
      hasGrownupPin: false,
      connectedAssistants: 0,
    });
    expect(ms.find((m) => m.key === "trip")!.done).toBe(true);
    expect(ms.find((m) => m.key === "pin")!.done).toBe(false);
    expect(completedCount(ms)).toBe(2);
    expect(coreComplete(ms)).toBe(false);
  });

  it("retires once the core is done, even if the optional AI step isn't", () => {
    const ms = firstRunMilestones({
      tripCount: 1,
      hasExplorer: true,
      hasGrownupPin: true,
      connectedAssistants: 0,
    });
    expect(coreComplete(ms)).toBe(true); // core (trip/explorer/pin) done
    expect(allDone(ms)).toBe(false); // optional "connect AI" still open
  });

  it("allDone only when every milestone (incl. optional) is done", () => {
    const ms = firstRunMilestones({
      tripCount: 2,
      hasExplorer: true,
      hasGrownupPin: true,
      connectedAssistants: 1,
    });
    expect(allDone(ms)).toBe(true);
  });
});
