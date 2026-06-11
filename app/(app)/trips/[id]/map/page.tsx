import { Suspense } from "react";
import { MapClient } from "./MapClient";

/** /trips/[id]/map - geo-coded venue pins + per-day venues. */
export default async function MapPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Suspense fallback={<p>Loading the map...</p>}>
      <MapClient tripId={id} />
    </Suspense>
  );
}
