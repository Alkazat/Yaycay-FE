import { TripView } from "./TripView";

/** /trips/[id] - the trip view: day nav -> moments -> activities, by profile. */
export default async function TripPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <main className="yc-shell">
      <div className="yc-container">
        <TripView tripId={id} />
      </div>
    </main>
  );
}
