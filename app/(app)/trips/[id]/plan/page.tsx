import { PlanClient } from "./PlanClient";

/** /trips/[id]/plan - our-AI chat (later) or BYO-AI connector status. */
export default async function PlanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PlanClient tripId={id} />;
}
