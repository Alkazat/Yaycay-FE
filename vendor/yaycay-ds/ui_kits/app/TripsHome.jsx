// Home dashboard: greeting, next-trip countdown hero, trip card grid.
function TripCard({ trip, onOpen }) {
  const crew = trip.crew;
  return (
    <Card interactive onClick={() => onOpen(trip)} style={{ width: "100%" }}>
      <CardMedia height={150}
        tag={<Badge tone={trip.scene === "sunset" ? "sun" : trip.scene === "meadow" ? "meadow" : "sky"}>{trip.tag}</Badge>}
        fav={<Badge tone="ink">{trip.sleeps} sleeps</Badge>}>
        <Scene variant={trip.scene} height={150} />
      </CardMedia>
      <CardBody title={trip.title} subtitle={`${trip.where} · ${trip.dates}`}>
        <div style={{ marginTop: 8 }}>
          <ProgressMeter value={trip.planned} max={trip.days} tone="sky"
            label="Day plan" valueText={`${trip.planned} of ${trip.days} days`} />
        </div>
      </CardBody>
      <CardFooter>
        <AvatarGroup>
          {crew.map((c, i) => <Avatar key={i} name={c.name} tone={c.tone} size={34} />)}
        </AvatarGroup>
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, color: "var(--sky-600)", display: "inline-flex", alignItems: "center", gap: 4 }}>
          Open <Icon name="chevL" size={16} style={{ transform: "scaleX(-1)" }} />
        </span>
      </CardFooter>
    </Card>
  );
}

function TripsHome({ onOpen }) {
  const D = window.YC_DATA;
  const next = D.trips[0];
  return (
    <div style={{ maxWidth: 1040, margin: "0 auto", display: "flex", flexDirection: "column", gap: 28 }}>
      <div>
        <div className="yc-eyebrow" style={{ color: "var(--sky-600)" }}>For families making memories</div>
        <h1 style={{ fontSize: 38, margin: "4px 0 0" }}>Hey Jo — let's plan the next adventure</h1>
      </div>

      {/* countdown hero */}
      <div style={{
        position: "relative", overflow: "hidden", borderRadius: "var(--radius-2xl)",
        border: "3px solid var(--royal-600)", boxShadow: "var(--card-lift)",
      }}>
        <Scene variant="sunset" height={234} />
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24, padding: "0 38px" }}>
          <div style={{ color: "#fff", textShadow: "0 2px 8px rgba(4,34,63,.35)", flex: "1 1 auto", minWidth: 0, display: "flex", flexDirection: "column", gap: 10 }}>
            <div className="yc-eyebrow">Next up · {next.where}</div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 30, lineHeight: 1.1 }}>{next.title}</div>
            <span style={{ alignSelf: "flex-start", fontWeight: 800, fontSize: 14, whiteSpace: "nowrap", background: "rgba(4,34,63,.28)", padding: "5px 13px", borderRadius: "var(--radius-pill)" }}>{next.dates}</span>
          </div>
          <div style={{
            background: "var(--cream-50)", border: "3px solid var(--royal-600)", borderRadius: "var(--radius-xl)",
            padding: "16px 22px", textAlign: "center", boxShadow: "0 6px 0 var(--royal-700)", flex: "none",
          }}>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 48, lineHeight: 1, color: "var(--royal-800)" }}>{next.sleeps}</div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 13, color: "var(--sun-500)", letterSpacing: ".04em", whiteSpace: "nowrap" }}>SLEEPS TO GO</div>
            <div style={{ marginTop: 12 }}>
              <Button variant="primary" size="sm" onClick={() => onOpen(next)}>Open plan</Button>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h2 style={{ margin: 0, fontSize: 26 }}>Your trips</h2>
        <Tag icon={<Icon name="plus" size={16} />} onClick={() => {}}>New trip</Tag>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 22 }}>
        {D.trips.map((t) => <TripCard key={t.id} trip={t} onOpen={onOpen} />)}
      </div>
    </div>
  );
}
