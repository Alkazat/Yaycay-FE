"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

const STORAGE_KEY = "yaycay.activeProfileId";

interface ActiveProfileValue {
  /** The chosen profile id, or null until one is picked / restored. */
  activeProfileId: string | null;
  setActiveProfileId: (id: string) => void;
}

const ActiveProfileContext = createContext<ActiveProfileValue | null>(null);

/**
 * Holds the active child profile across the signed-in app so switching the
 * explorer in one place (profiles, trip view, journal) carries everywhere.
 * Persisted to localStorage so it survives reloads. The selection is a single
 * id; pages fall back to their first profile when it is null.
 */
export function ActiveProfileProvider({ children }: { children: ReactNode }) {
  const [activeProfileId, setId] = useState<string | null>(null);

  // Restore on mount (client only - keeps SSR markup stable).
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) setId(stored);
    } catch {
      // localStorage unavailable (private mode etc.) - fall back to in-memory.
    }
  }, []);

  const setActiveProfileId = (id: string) => {
    setId(id);
    try {
      window.localStorage.setItem(STORAGE_KEY, id);
    } catch {
      // ignore persistence failures
    }
  };

  return (
    <ActiveProfileContext.Provider value={{ activeProfileId, setActiveProfileId }}>
      {children}
    </ActiveProfileContext.Provider>
  );
}

export function useActiveProfile(): ActiveProfileValue {
  const ctx = useContext(ActiveProfileContext);
  if (!ctx) {
    throw new Error("useActiveProfile must be used within ActiveProfileProvider");
  }
  return ctx;
}
