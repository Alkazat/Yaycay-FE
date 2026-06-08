import type { Metadata } from "next";
import { ProfilesClient } from "./ProfilesClient";

export const metadata: Metadata = {
  title: "Explorers - Yaycay",
};

/** /profiles - manage child profiles, pick the active profile. */
export default function ProfilesPage() {
  return (
    <main className="yc-shell">
      <div className="yc-container">
        <ProfilesClient />
      </div>
    </main>
  );
}
