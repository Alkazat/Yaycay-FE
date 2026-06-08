// Marketing site sections for Yaycay. Composes DS components + Scene/Icon helpers.

function SiteNav({ onGetStarted }) {
  const links = ["How it works", "Destinations", "Families", "Pricing"];
  return (
    <header style={{ position: "sticky", top: 0, zIndex: 20, background: "rgba(251,247,236,.85)", backdropFilter: "blur(8px)", borderBottom: "2.5px solid var(--sand-200)" }}>
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "12px 28px", display: "flex", alignItems: "center", gap: 24 }}>
        <img src="../../assets/brand/yaycay-logo-transparent.png" alt="Yaycay" style={{ width: 118 }} />
        <nav style={{ display: "flex", gap: 6, marginLeft: 12 }}>
          {links.map((l) => (
            <a key={l} href="#" style={{ padding: "8px 14px", borderRadius: "var(--radius-pill)", color: "var(--royal-700)", fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 15, textDecoration: "none" }}>{l}</a>
          ))}
        </nav>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
          <a href="#" style={{ color: "var(--royal-700)", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 15, textDecoration: "none" }}>Log in</a>
          <Button variant="cta" onClick={onGetStarted}>Get started — free</Button>
        </div>
      </div>
    </header>
  );
}

function FloatCard({ scene, title, sub, tag, tagTone, style }) {
  return (
    <div style={{ width: 230, background: "#fff", border: "3px solid var(--royal-600)", borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-lg)", overflow: "hidden", ...style }}>
      <div style={{ position: "relative" }}>
        <Scene variant={scene} height={92} />
        <div style={{ position: "absolute", top: 10, left: 10 }}><Badge tone={tagTone}>{tag}</Badge></div>
      </div>
      <div style={{ padding: "12px 14px" }}>
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, color: "var(--royal-800)", fontSize: 16 }}>{title}</div>
        <div style={{ fontWeight: 800, color: "var(--text-muted)", fontSize: 12, marginTop: 2 }}>{sub}</div>
      </div>
    </div>
  );
}

function Hero({ onGetStarted }) {
  return (
    <section style={{ position: "relative", overflow: "hidden", background: "var(--grad-scene)", borderBottom: "3px solid var(--royal-600)" }}>
      {/* clouds */}
      <div style={{ position: "absolute", width: 140, height: 42, top: 26, left: 150, background: "var(--cream-50)", borderRadius: 999, opacity: .9, boxShadow: "54px -16px 0 -6px var(--cream-50)" }} />
      <div style={{ position: "absolute", width: 110, height: 34, top: 96, right: 220, background: "var(--cream-50)", borderRadius: 999, opacity: .8 }} />
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "72px 28px 90px", display: "grid", gridTemplateColumns: "1.05fr .95fr", gap: 40, alignItems: "center" }}>
        <div>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8, whiteSpace: "nowrap", background: "rgba(255,255,255,.85)", border: "2.5px solid var(--royal-500)", borderRadius: "var(--radius-pill)", padding: "6px 14px", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 13, color: "var(--royal-700)", textTransform: "uppercase", letterSpacing: ".06em" }}>
            <Icon name="star" size={14} /> For families making memories
          </span>
          <h1 style={{
            margin: "20px 0 0", fontSize: 64, lineHeight: 1, color: "var(--cream-50)",
            WebkitTextStroke: "5px var(--royal-600)", paintOrder: "stroke fill",
            textShadow: "1px 1px 0 var(--royal-700),2px 2px 0 var(--royal-700),3px 3px 0 var(--royal-700),4px 4px 0 var(--royal-700),5px 7px 9px rgba(4,34,63,.4)",
          }}>Plan the trip.<br />Keep the yay.</h1>
          <p style={{ fontSize: 19, fontWeight: 700, color: "var(--royal-800)", maxWidth: 440, marginTop: 22, lineHeight: 1.5 }}>
            Build the itinerary, split the packing list, and count down the sleeps — together. Yaycay turns trip admin into part of the fun.
          </p>
          <div style={{ display: "flex", gap: 14, marginTop: 26, flexWrap: "wrap" }}>
            <Button variant="cta" size="lg" icon={<Icon name="plane" size={20} />} onClick={onGetStarted}>Start planning free</Button>
            <Button variant="secondary" size="lg" icon={<Icon name="play" size={18} />}>Watch the tour</Button>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 22 }}>
            <AvatarGroup>
              <Avatar name="A B" tone="sun" size={34} /><Avatar name="C D" tone="aqua" size={34} /><Avatar name="E F" tone="coral" size={34} /><Avatar name="G H" tone="sky" size={34} />
            </AvatarGroup>
            <span style={{ fontWeight: 800, color: "var(--royal-700)", fontSize: 14 }}>Loved by 200k+ families worldwide</span>
          </div>
        </div>
        {/* floating card cluster */}
        <div style={{ position: "relative", height: 420 }}>
          <FloatCard scene="sunset" tag="Beach" tagTone="sun" title="Sicily with the kids" sub="7 days · 12 sleeps to go" style={{ position: "absolute", top: 10, left: 30, transform: "rotate(-4deg)" }} />
          <FloatCard scene="sky" tag="City" tagTone="sky" title="Lisbon weekend" sub="3 days · planning" style={{ position: "absolute", top: 150, right: 0, transform: "rotate(4deg)", zIndex: 3 }} />
          <FloatCard scene="meadow" tag="Outdoors" tagTone="meadow" title="Lake District" sub="3 days · 55 sleeps" style={{ position: "absolute", bottom: 0, left: 60, transform: "rotate(2deg)", zIndex: 2 }} />
        </div>
      </div>
    </section>
  );
}
