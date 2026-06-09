import type { ReactNode } from "react";
import { AppShell } from "@/components/shell/AppShell";

/** Shared chrome for the signed-in app routes (trips, profiles, account). */
export default function AppLayout({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
