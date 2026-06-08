import { JournalClient } from "./JournalClient";

/** /trips/[id]/journal - per-profile notes + star ratings. */
export default async function JournalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <JournalClient tripId={id} />;
}
