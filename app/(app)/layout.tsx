import type { ReactNode } from "react";
import { AppShell } from "@/components/shell/AppShell";
import { SessionHint } from "@/components/shell/SessionHint";
import { ActiveProfileProvider } from "@/components/profile/ActiveProfileProvider";
import { CreateExplorerProvider } from "@/components/profile/CreateExplorerProvider";
import { FirstRunChecklist } from "@/components/firstrun/FirstRunChecklist";

/** Shared chrome for the signed-in app routes (trips, profiles, account). */
export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <ActiveProfileProvider>
      <CreateExplorerProvider>
        <SessionHint />
        <AppShell>{children}</AppShell>
        <FirstRunChecklist />
      </CreateExplorerProvider>
    </ActiveProfileProvider>
  );
}
