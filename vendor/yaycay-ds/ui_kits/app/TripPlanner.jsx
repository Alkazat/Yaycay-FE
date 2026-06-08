// Single-trip planner: header, tabs, day-by-day plan, packing & budget views.
function PlanItem({ item }) {
  const tone = KIND_TONE[item.kind] || "sky";
  const toneColor = { sky: "var(--sky-500)", sun: "var(--sun-400)", aqua: "var(--aqua-400)", meadow: "var(--meadow-400)" }[tone];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 14px", background: "#fff", border: "2.5px solid var(--sand-200)", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-sm)" }}>
      <span style={{ width: 42, height: 42, flex: "none", borderRadius: "var(--radius-md)", background: toneColor, color: tone === "sun" ? "var(--royal-800)" : "#fff", display: "grid", placeItems: "center", boxShadow: "var(--gloss-top)" }}>
        <Icon name={KIND_ICON[item.kind]} size={20} />
      </span>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, color: "var(--royal-800)", fontSize: 16 }}>{item.title}</div>
        <div style={{ fontWeight: 800, color: "var(--text-muted)", fontSize: 13 }}>{item.time}</div>
      </div>
      <IconButton label="Edit" variant="ghost" size="sm"><Icon name="chevL" size={18} style={{ transform: "scaleX(-1)" }} /></IconButton>
    </div>
  );
}

function DayPlan() {
  const D = window.YC_DATA;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      {D.plan.map((day, di) => (
        <div key={di}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <Badge tone={di === 0 ? "sky" : "soft"}>{`Day ${di + 1}`}</Badge>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, color: "var(--royal-800)", fontSize: 18 }}>{day.label}</span>
            <span style={{ fontWeight: 800, color: "var(--text-muted)", fontSize: 13 }}>{day.day}</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingLeft: 6, borderLeft: "3px dashed var(--sand-300)", marginLeft: 8 }}>
            <div style={{ paddingLeft: 14, display: "flex", flexDirection: "column", gap: 10 }}>
              {day.items.map((it, ii) => <PlanItem key={ii} item={it} />)}
              <button style={{ alignSelf: "flex-start", marginLeft: 0, display: "inline-flex", alignItems: "center", gap: 8, background: "transparent", border: "2.5px dashed var(--sky-300)", color: "var(--sky-600)", fontFamily: "var(--font-display)", fontWeight: 600, padding: "9px 16px", borderRadius: "var(--radius-pill)", cursor: "pointer" }}>
                <Icon name="plus" size={16} /> Add to this day
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function Packing() {
  const D = window.YC_DATA;
  const [checked, setChecked] = React.useState({});
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
      {D.packing.map((grp, gi) => (
        <Card key={gi} variant="soft">
          <CardBody title={grp.group}>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 6 }}>
              {grp.items.map((it, ii) => {
                const key = gi + "-" + ii;
                return <Checkbox key={ii} label={it} checked={!!checked[key]} onChange={() => setChecked((c) => ({ ...c, [key]: !c[key] }))} />;
              })}
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}

function Budget({ trip }) {
  const rows = [
    { label: "Flights", tone: "sky", spent: 640 },
    { label: "Stay", tone: "aqua", spent: 520 },
    { label: "Food & treats", tone: "sun", spent: 180 },
    { label: "Days out", tone: "meadow", spent: 60 },
  ];
  return (
    <div style={{ maxWidth: 560, display: "flex", flexDirection: "column", gap: 18 }}>
      <Card variant="soft">
        <CardBody>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 18, color: "var(--royal-800)" }}>Trip budget</span>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 22, color: "var(--sky-600)" }}>£{trip.budget.spent} <span style={{ color: "var(--text-muted)", fontSize: 15 }}>/ £{trip.budget.total}</span></span>
          </div>
          <div style={{ marginTop: 12 }}>
            <ProgressMeter value={trip.budget.spent} max={trip.budget.total} tone="meadow" showValue={false} />
          </div>
        </CardBody>
      </Card>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {rows.map((r, i) => (
          <ProgressMeter key={i} value={r.spent} max={trip.budget.total} tone={r.tone} label={r.label} valueText={`£${r.spent}`} />
        ))}
      </div>
    </div>
  );
}

function TripPlanner({ trip, onBack }) {
  const [tab, setTab] = React.useState("plan");
  return (
    <div style={{ maxWidth: 880, margin: "0 auto", display: "flex", flexDirection: "column", gap: 22 }}>
      <button onClick={onBack} style={{ alignSelf: "flex-start", display: "inline-flex", alignItems: "center", gap: 6, background: "transparent", border: "none", color: "var(--sky-600)", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 15, cursor: "pointer" }}>
        <Icon name="chevL" size={18} /> All trips
      </button>

      <div style={{ position: "relative", overflow: "hidden", borderRadius: "var(--radius-2xl)", border: "3px solid var(--royal-600)", boxShadow: "var(--card-lift)" }}>
        <Scene variant={trip.scene} height={184} />
        <div style={{ position: "absolute", left: 30, right: 30, bottom: 20, color: "#fff", textShadow: "0 2px 8px rgba(4,34,63,.35)", display: "flex", flexDirection: "column", gap: 8 }}>
          <div className="yc-eyebrow">{trip.where}</div>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 32, lineHeight: 1.08 }}>{trip.title}</div>
          <span style={{ alignSelf: "flex-start", fontWeight: 800, fontSize: 14, whiteSpace: "nowrap", background: "rgba(4,34,63,.28)", padding: "5px 13px", borderRadius: "var(--radius-pill)" }}>{trip.dates}</span>
        </div>
        <div style={{ position: "absolute", right: 24, top: 20, display: "flex", gap: 10 }}>
          <IconButton label="Share" variant="secondary"><Icon name="share" size={18} /></IconButton>
          <Badge tone="ink">{trip.sleeps} sleeps to go</Badge>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <Tabs value={tab} onChange={setTab} tabs={[
          { value: "plan", label: "Day plan", icon: <Icon name="calendar" size={16} /> },
          { value: "pack", label: "Packing", icon: <Icon name="bag" size={16} /> },
          { value: "budget", label: "Budget", icon: <Icon name="coin" size={16} /> },
        ]} />
        <Button variant="cta" icon={<Icon name="plus" size={18} />}>Add a day</Button>
      </div>

      {tab === "plan" && <DayPlan />}
      {tab === "pack" && <Packing />}
      {tab === "budget" && <Budget trip={trip} />}
    </div>
  );
}
