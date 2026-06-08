// How-it-works steps, destinations showcase, testimonial, CTA band, footer.

function Section({ children, style }) {
  return <section style={{ maxWidth: 1180, margin: "0 auto", padding: "84px 28px", ...style }}>{children}</section>;
}
function Eyebrow({ children }) {
  return <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 14, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--sky-600)" }}>{children}</div>;
}

function HowItWorks() {
  const steps = [
    { icon: "compass", tone: "sky", title: "Dream it up", body: "Browse family-friendly spots and save the ones that spark a yay." },
    { icon: "calendar", tone: "sun", title: "Plan together", body: "Drag activities into a day-by-day plan everyone can see and edit." },
    { icon: "bag", tone: "meadow", title: "Pack & go", body: "Shared packing lists, a live budget, and a countdown to take-off." },
  ];
  const toneBg = { sky: "var(--sky-500)", sun: "var(--sun-400)", meadow: "var(--meadow-400)" };
  return (
    <Section>
      <div style={{ textAlign: "center", maxWidth: 640, margin: "0 auto 52px" }}>
        <Eyebrow>How Yaycay works</Eyebrow>
        <h2 style={{ fontSize: 42, margin: "10px 0 0" }}>Three steps from "where shall we go?" to "we're here!"</h2>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 26 }}>
        {steps.map((s, i) => (
          <Card key={i} variant="soft">
            <CardBody>
              <div style={{ position: "relative", marginBottom: 14 }}>
                <span style={{ width: 60, height: 60, borderRadius: "var(--radius-lg)", background: toneBg[s.tone], color: s.tone === "sun" ? "var(--royal-800)" : "#fff", display: "grid", placeItems: "center", border: "2.5px solid var(--royal-600)", boxShadow: "0 4px 0 var(--royal-600), var(--gloss-top)" }}>
                  <Icon name={s.icon} size={28} />
                </span>
                <span style={{ position: "absolute", top: -6, right: 6, fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 44, color: "var(--cream-300)" }}>{i + 1}</span>
              </div>
              <h3 style={{ margin: "0 0 6px", fontSize: 22 }}>{s.title}</h3>
              <p style={{ margin: 0, color: "var(--text-body)", fontWeight: 600 }}>{s.body}</p>
            </CardBody>
          </Card>
        ))}
      </div>
    </Section>
  );
}

function Destinations() {
  const dests = [
    { scene: "sunset", name: "Sun & sand", sub: "42 family beaches", tag: "Popular", tone: "sun" },
    { scene: "meadow", name: "Great outdoors", sub: "28 trails & lakes", tag: "New", tone: "meadow" },
    { scene: "sky", name: "City breaks", sub: "60 kid-friendly cities", tag: "Easy", tone: "sky" },
    { scene: "aqua", name: "Theme parks", sub: "19 big-thrill days", tag: "Thrills", tone: "aqua" },
  ];
  return (
    <div style={{ background: "var(--cream-200)", borderTop: "2.5px solid var(--sand-200)", borderBottom: "2.5px solid var(--sand-200)" }}>
      <Section>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 40, flexWrap: "wrap", gap: 16 }}>
          <div>
            <Eyebrow>Where to next</Eyebrow>
            <h2 style={{ fontSize: 42, margin: "10px 0 0" }}>Adventures for every kind of family</h2>
          </div>
          <Button variant="secondary" iconRight={<Icon name="chevL" size={18} style={{ transform: "scaleX(-1)" }} />}>Browse all</Button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 22 }}>
          {dests.map((d, i) => (
            <Card key={i} interactive>
              <CardMedia height={150} tag={<Badge tone={d.tone}>{d.tag}</Badge>}>
                <Scene variant={d.scene} height={150} />
              </CardMedia>
              <CardBody title={d.name} subtitle={d.sub} />
            </Card>
          ))}
        </div>
      </Section>
    </div>
  );
}

function Testimonial() {
  return (
    <Section style={{ paddingTop: 84, paddingBottom: 84 }}>
      <div style={{ maxWidth: 860, margin: "0 auto", textAlign: "center" }}>
        <div style={{ display: "inline-flex", gap: 4, marginBottom: 18, color: "var(--sun-400)" }}>
          {[0, 1, 2, 3, 4].map((i) => <Icon key={i} name="star" size={26} fill="var(--sun-400)" stroke="var(--royal-600)" />)}
        </div>
        <p style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 30, lineHeight: 1.3, color: "var(--royal-800)", margin: 0 }}>
          "We planned our whole Italy trip on the sofa with the kids picking the beaches. The countdown had everyone buzzing for weeks."
        </p>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 12, marginTop: 26 }}>
          <Avatar name="Priya Shah" tone="aqua" size={48} ring />
          <div style={{ textAlign: "left" }}>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, color: "var(--royal-800)" }}>Priya & the Shah family</div>
            <div style={{ fontWeight: 800, color: "var(--text-muted)", fontSize: 14 }}>Manchester, UK</div>
          </div>
        </div>
      </div>
    </Section>
  );
}

function CTABand({ onGetStarted }) {
  return (
    <div style={{ background: "var(--grad-sky)", borderTop: "3px solid var(--royal-600)", borderBottom: "3px solid var(--royal-600)", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", width: 130, height: 40, top: 30, left: 90, background: "var(--cream-50)", borderRadius: 999, opacity: .85, boxShadow: "50px -14px 0 -6px var(--cream-50)" }} />
      <Section style={{ paddingTop: 70, paddingBottom: 70, textAlign: "center" }}>
        <h2 style={{ fontSize: 46, color: "var(--cream-50)", margin: 0, WebkitTextStroke: "4px var(--royal-600)", paintOrder: "stroke fill", textShadow: "3px 4px 0 var(--royal-700)" }}>Your next adventure starts here</h2>
        <p style={{ color: "#fff", fontWeight: 800, fontSize: 18, margin: "16px 0 28px", textShadow: "0 1px 4px rgba(4,34,63,.3)" }}>Free to start. No card needed. Just bring the family.</p>
        <Button variant="cta" size="lg" icon={<Icon name="plane" size={20} />} onClick={onGetStarted}>Start planning free</Button>
      </Section>
    </div>
  );
}

function SiteFooter() {
  const cols = [
    { h: "Product", links: ["How it works", "Destinations", "Pricing", "Mobile app"] },
    { h: "Families", links: ["Travelling with kids", "Group trips", "Accessibility", "Help centre"] },
    { h: "Company", links: ["About us", "Careers", "Press", "Contact"] },
  ];
  return (
    <footer style={{ background: "var(--royal-700)", color: "var(--cream-100)" }}>
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "56px 28px 36px", display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr 1fr", gap: 32 }}>
        <div>
          <img src="../../assets/brand/yaycay-logo-transparent.png" alt="Yaycay" style={{ width: 150 }} />
          <p style={{ marginTop: 16, color: "var(--sky-200)", fontWeight: 700, maxWidth: 240 }}>For families making memories — one trip at a time.</p>
        </div>
        {cols.map((c) => (
          <div key={c.h}>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, color: "#fff", marginBottom: 14 }}>{c.h}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {c.links.map((l) => <a key={l} href="#" style={{ color: "var(--sky-200)", fontWeight: 700, fontSize: 14, textDecoration: "none" }}>{l}</a>)}
            </div>
          </div>
        ))}
      </div>
      <div style={{ borderTop: "2px solid var(--royal-600)", padding: "18px 28px", textAlign: "center", color: "var(--sky-300)", fontWeight: 700, fontSize: 13 }}>
        © 2026 Yaycay · Made for families, everywhere ☀
      </div>
    </footer>
  );
}
