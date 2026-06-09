import type { Metadata } from "next";
import { TripsHome } from "./TripsHome";

export const metadata: Metadata = {
  title: "Your trips - Yaycay",
};

/** /trips - paid. Trips home (cards). */
export default function TripsPage() {
  return <TripsHome />;
}
