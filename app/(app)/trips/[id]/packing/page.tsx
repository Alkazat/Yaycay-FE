import { PackingClient } from "./PackingClient";

/** /trips/[id]/packing - per-profile + family packing lists. */
export default async function PackingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PackingClient tripId={id} />;
}
