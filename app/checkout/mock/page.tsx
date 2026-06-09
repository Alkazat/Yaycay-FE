import Link from "next/link";

/**
 * MOCK checkout landing - stands in for Stripe's hosted Checkout page. The real
 * flow redirects to Stripe and entitlement is granted by the BE webhook; card
 * data never touches the FE. This page only proves the redirect works.
 */
export default async function MockCheckoutPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const product = Array.isArray(params.price_id) ? params.price_id[0] : params.price_id;

  return (
    <main className="yc-shell">
      <div className="yc-container yc-stack" style={{ textAlign: "center" }} data-testid="mock-checkout">
        <h1>Checkout (mock)</h1>
        <p style={{ fontSize: "var(--fs-lg)" }}>
          The real flow opens Stripe Checkout here. Card details never touch Yaycay.
        </p>
        {product ? (
          <p style={{ color: "var(--text-muted)", fontWeight: 700 }}>
            Product: <strong>{product}</strong>
          </p>
        ) : null}
        <Link href="/account" className="yc-btn yc-btn--secondary" style={{ textDecoration: "none" }}>
          Back to account
        </Link>
      </div>
    </main>
  );
}
