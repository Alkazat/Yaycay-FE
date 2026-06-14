import { CompanionClient } from "./CompanionClient";

export const metadata = {
  title: "While you're there - Yaycay",
};

export default async function CompanionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CompanionClient tripId={id} />;
}
