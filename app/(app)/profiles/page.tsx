import type { Metadata } from "next";
import { ProfilesClient } from "./ProfilesClient";

export const metadata: Metadata = {
  title: "Explorers - Yaycay",
};

/** /profiles - manage child profiles, pick the active profile. */
export default function ProfilesPage() {
  return <ProfilesClient />;
}
