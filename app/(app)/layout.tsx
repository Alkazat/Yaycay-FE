import type { ReactNode } from "react";
import { AppShell } from "@/components/shell/AppShell";
import { ActiveProfileProvider } from "@/components/profile/ActiveProfileProvider";
import { FirstRunChecklist } from "@/components/firstrun/FirstRunChecklist";

/** Shared chrome for the signed-in app routes (trips, profiles, account). */
export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <ActiveProfileProvider>
      <AppShell>{children}</AppShell>
      <FirstRunChecklist />
    </ActiveProfileProvider>
  );
}
