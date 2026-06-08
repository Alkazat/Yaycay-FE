// "Start a trip" modal sheet.
function NewTripSheet({ onClose, onCreate }) {
  const [name, setName] = React.useState("");
  const [pace, setPace] = React.useState("relaxed");
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "var(--surface-overlay)", backdropFilter: "blur(3px)", display: "grid", placeItems: "center", zIndex: 50, padding: 24 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: 480, maxWidth: "100%", background: "var(--cream-100)", border: "3px solid var(--royal-600)", borderRadius: "var(--radius-2xl)", boxShadow: "var(--shadow-xl)", overflow: "hidden" }}>
        <div style={{ position: "relative" }}>
          <Scene variant="sky" height={108} />
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "center", gap: 4, paddingLeft: 24 }}>
            <div style={{ color: "#fff", textShadow: "0 2px 8px rgba(4,34,63,.35)" }}>
              <div className="yc-eyebrow">New adventure</div>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 26, lineHeight: 1, whiteSpace: "nowrap" }}>Start a trip</div>
            </div>
          </div>
          <div style={{ position: "absolute", right: 14, top: 14 }}>
            <IconButton label="Close" variant="secondary" size="sm" onClick={onClose}>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
            </IconButton>
          </div>
        </div>
        <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
          <Input label="Where are you off to?" placeholder="e.g. Sicily, Italy" value={name} onChange={(e) => setName(e.target.value)} icon={<Icon name="map" size={18} />} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <Input label="From" placeholder="Jul 12" />
            <Input label="To" placeholder="Jul 19" />
          </div>
          <Select label="Who's coming?" options={["Just us two", "Family of 4", "Big group"]} defaultValue="Family of 4" />
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 14, color: "var(--royal-700)", marginBottom: 8 }}>Trip pace</div>
            <div style={{ display: "flex", gap: 18 }}>
              <Checkbox radio name="pace" label="Relaxed" checked={pace === "relaxed"} onChange={() => setPace("relaxed")} />
              <Checkbox radio name="pace" label="Action-packed" checked={pace === "action"} onChange={() => setPace("action")} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 4 }}>
            <Button variant="secondary" onClick={onClose}>Maybe later</Button>
            <Button variant="cta" block icon={<Icon name="plane" size={18} />} onClick={() => onCreate(name || "New trip")}>Create trip</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
