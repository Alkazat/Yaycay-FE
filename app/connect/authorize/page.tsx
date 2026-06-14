/**
 * Connector consent screen. Reached from `/api/oauth/authorize` once the parent
 * is signed in. Shows which assistant is asking and what it will be able to do,
 * then posts the decision back to the authorize endpoint.
 *
 * Rendered as a server component with a native form so it works without client
 * JS and cannot be driven by cross-site script.
 */
import { redirect } from "next/navigation";
import { validateAuthRequest, parentSession } from "@/lib/mcp/oauthFlow";
import { SCOPES } from "@/lib/mcp/config";

const SCOPE_LABELS: Record<string, string> = {
  [SCOPES.read]: "Read your trips, day-by-day plans and packing lists",
  [SCOPES.plan]: "Use the Yaycay planner to help shape your trips",
};

type SP = Record<string, string | string[] | undefined>;

function toParams(sp: SP): URLSearchParams {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) {
    if (typeof v === "string") p.set(k, v);
    else if (Array.isArray(v) && v[0]) p.set(k, v[0]);
  }
  return p;
}

export default async function ConsentPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const params = toParams(await searchParams);

  const session = await parentSession();
  if (!session) {
    redirect(`/auth?next=${encodeURIComponent(`/api/oauth/authorize?${params.toString()}`)}`);
  }

  const result = await validateAuthRequest(params);
  if (!result.ok) {
    return (
      <main className="yc-stack" style={{ maxWidth: 520, margin: "0 auto", padding: "var(--space-6)" }}>
        <h1>We could not start that connection</h1>
        <p style={{ color: "var(--text-muted)" }}>
          {result.error}: {result.description}
        </p>
      </main>
    );
  }

  const { req } = result;
  const who = req.client.client_name || "An AI assistant";
  const scopes = req.scope.split(" ").filter(Boolean);

  const fieldNames = [
    "response_type",
    "client_id",
    "redirect_uri",
    "code_challenge",
    "code_challenge_method",
    "scope",
    "state",
  ];

  return (
    <main
      className="yc-stack"
      style={{ maxWidth: 520, margin: "0 auto", padding: "var(--space-6)", gap: "var(--space-4)" }}
    >
      <h1 style={{ margin: 0 }}>Connect {who} to Yaycay?</h1>
      <p style={{ margin: 0, color: "var(--text-muted)", fontWeight: 700 }}>
        It will act on your account and be able to:
      </p>
      <ul style={{ margin: 0, paddingLeft: "var(--space-5)", color: "var(--text-body)" }}>
        {scopes.map((s) => (
          <li key={s}>{SCOPE_LABELS[s] ?? s}</li>
        ))}
      </ul>

      <form method="post" action="/api/oauth/authorize" className="yc-stack" style={{ gap: "var(--space-3)" }}>
        {fieldNames.map((name) => (
          <input key={name} type="hidden" name={name} value={params.get(name) ?? ""} />
        ))}
        <div style={{ display: "flex", gap: "var(--space-3)" }}>
          <button
            type="submit"
            name="decision"
            value="approve"
            style={{
              flex: 1,
              padding: "var(--space-3)",
              fontWeight: 800,
              borderRadius: "var(--radius-md, 12px)",
              border: "none",
              background: "var(--color-primary, #1f6feb)",
              color: "white",
              cursor: "pointer",
            }}
          >
            Approve
          </button>
          <button
            type="submit"
            name="decision"
            value="deny"
            style={{
              flex: 1,
              padding: "var(--space-3)",
              fontWeight: 800,
              borderRadius: "var(--radius-md, 12px)",
              border: "1px solid var(--border, #ccc)",
              background: "transparent",
              color: "var(--text-body)",
              cursor: "pointer",
            }}
          >
            Not now
          </button>
        </div>
      </form>
      <p style={{ margin: 0, fontSize: "var(--fs-sm)", color: "var(--text-muted)" }}>
        Signed in as your Yaycay account. You can remove this connection at any time.
      </p>
    </main>
  );
}
