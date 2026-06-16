"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { listTrips } from "@/lib/api/trips";
import { clearSessionHint, setSessionHint } from "@/lib/sessionHint";
import { phaseFromTrips } from "@/lib/tripPhase";

/**
 * Keeps the cross-app `yc_state` hint cookie in sync with the auth session, so
 * the marketing site can swap its CTA for a returning visitor ("Keep planning /
 * travelling"). Mounted once in the signed-in app layout; renders nothing.
 *
 * Presence is driven by Supabase auth, which covers login, logout and token
 * expiry in one place. The planning-vs-travelling phase is read from the user's
 * trips, reusing the same query cache as the trips home (no extra fetch once
 * those are loaded). When Supabase is unconfigured (the mock scaffold) it does
 * nothing, so it never sets a false "signed in" hint.
 */
export function SessionHint() {
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return; // mock / unconfigured: nothing to sync
    let active = true;
    void supabase.auth.getSession().then(({ data }) => {
      if (active) setAuthed(Boolean(data.session));
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthed(Boolean(session));
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const { data: trips } = useQuery({
    queryKey: ["trips"],
    queryFn: ({ signal }) => listTrips(signal),
    enabled: authed === true,
  });

  useEffect(() => {
    if (authed === null) return; // unknown until the first session check resolves
    if (!authed) {
      clearSessionHint();
      return;
    }
    setSessionHint(trips ? phaseFromTrips(trips) : "planning");
  }, [authed, trips]);

  return null;
}
