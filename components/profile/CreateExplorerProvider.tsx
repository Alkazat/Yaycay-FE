"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { Modal } from "@/components/ui/Modal";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { MODE_EMOJI, MODE_LABEL } from "@/lib/profile/access";
import type { ProfileType } from "@/lib/contract-mock/types";

interface CreateExplorerContextValue {
  /**
   * Open the "add a person" dialog from anywhere in the app. Pass a type to lock
   * it (e.g. opened from the Explorers column); omit it to let the family choose
   * explorer vs grown-up in the dialog.
   */
  openCreateExplorer: (type?: ProfileType) => void;
}

const Ctx = createContext<CreateExplorerContextValue | null>(null);

/** Access the app-wide "add an explorer" action. */
export function useCreateExplorer(): CreateExplorerContextValue {
  const value = useContext(Ctx);
  if (!value) {
    throw new Error("useCreateExplorer must be used within a CreateExplorerProvider");
  }
  return value;
}

/** A child age band (explorers) vs the grown-up voice (parents/carers). */
const TYPE_CHOICES: { type: ProfileType; emoji: string; label: string }[] = [
  { type: "child", emoji: "🧭", label: "Explorer" },
  { type: "parent_carer", emoji: MODE_EMOJI.standard, label: MODE_LABEL.standard },
];

/**
 * Mounts a single create-profile dialog at the app shell so any surface - the
 * top bar, a trip, the planning chat - can add an explorer or grown-up without
 * routing to the Explorers page. The form (and its ["profiles"] invalidation)
 * is the same one the Explorers library uses, so a new person shows up everywhere
 * at once.
 */
export function CreateExplorerProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  // When opened with a fixed type we hide the chooser; otherwise the family picks.
  const [locked, setLocked] = useState<ProfileType | null>(null);
  const [choice, setChoice] = useState<ProfileType>("child");

  const openCreateExplorer = useCallback((type?: ProfileType) => {
    setLocked(type ?? null);
    setChoice(type ?? "child");
    setOpen(true);
  }, []);

  const close = useCallback(() => setOpen(false), []);
  const type: ProfileType = locked ?? choice;

  return (
    <Ctx.Provider value={{ openCreateExplorer }}>
      {children}
      {open ? (
        <Modal title={type === "child" ? "Add explorer" : "Add grown-up"} onClose={close}>
          {locked === null ? (
            <div
              role="group"
              aria-label="Who are you adding?"
              style={{ display: "flex", gap: "var(--space-2)", marginBottom: "var(--space-3)" }}
            >
              {TYPE_CHOICES.map((c) => (
                <button
                  key={c.type}
                  type="button"
                  aria-pressed={choice === c.type}
                  onClick={() => setChoice(c.type)}
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "var(--space-2)",
                    padding: "var(--space-2) var(--space-3)",
                    borderRadius: "var(--radius-md, 10px)",
                    cursor: "pointer",
                    fontWeight: 800,
                    border:
                      choice === c.type
                        ? "2.5px solid var(--sky-500)"
                        : "2px solid var(--sand-200, #e7e2d8)",
                    background: choice === c.type ? "var(--sky-50)" : "var(--surface, #fff)",
                  }}
                >
                  <span style={{ fontSize: 20 }}>{c.emoji}</span>
                  {c.label}
                </button>
              ))}
            </div>
          ) : null}
          {/* Remount the form when the chosen type changes so it re-seeds its band. */}
          <ProfileForm key={type} lockedType={type} onDone={close} onCancel={close} />
        </Modal>
      ) : null}
    </Ctx.Provider>
  );
}
