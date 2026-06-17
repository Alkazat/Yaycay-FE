import { SharedTripClient } from "./SharedTripClient";

export const metadata = {
  title: "A shared trip - Yaycay",
};

/** `/shared/:token` - public, read-only view of a trip someone shared. */
export default async function SharedTripPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return (
    <main
      style={{
        minHeight: "100dvh",
        padding: "var(--space-6) var(--gutter, 16px)",
        background: "var(--surface-page)",
      }}
    >
      <SharedTripClient token={token} />
    </main>
  );
}
