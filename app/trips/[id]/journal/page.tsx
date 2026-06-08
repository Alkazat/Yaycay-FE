import { JournalClient } from "./JournalClient";

/** /trips/[id]/journal - per-profile notes + star ratings. */
export default async function JournalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <main className="yc-shell">
      <div className="yc-container">
        <JournalClient tripId={id} />
      </div>
    </main>
  );
}
