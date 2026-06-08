// App chrome: left rail + top bar. Children render in the content area.
function NavItem({ icon, label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      display: "flex", alignItems: "center", gap: 12, width: "100%",
      padding: "11px 14px", borderRadius: "var(--radius-md)", cursor: "pointer",
      border: "2.5px solid " + (active ? "var(--royal-600)" : "transparent"),
      background: active ? "var(--sky-500)" : "transparent",
      color: active ? "#fff" : "var(--royal-600)",
      boxShadow: active ? "0 4px 0 var(--royal-600), var(--gloss-top)" : "none",
      fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 15,
      transition: "all .15s var(--ease-bounce)",
    }}>
      <Icon name={icon} size={20} />
      {label}
    </button>
  );
}

function AppShell({ nav = "home", onNav, children }) {
  const D = window.YC_DATA;
  return (
    <div style={{ display: "flex", minHeight: "100%", background: "var(--cream-100)", fontFamily: "var(--font-body)" }}>
      {/* left rail */}
      <aside style={{
        width: 248, flex: "none", background: "var(--cream-50)",
        borderRight: "2.5px solid var(--sand-200)", padding: 20,
        display: "flex", flexDirection: "column", gap: 24, position: "sticky", top: 0, alignSelf: "flex-start", height: "100vh",
      }}>
        <img src="../../assets/brand/yaycay-logo-transparent.png" alt="Yaycay" style={{ width: 140, marginLeft: 4 }} />
        <nav style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <NavItem icon="home" label="Home" active={nav === "home"} onClick={() => onNav && onNav("home")} />
          <NavItem icon="compass" label="Explore" active={nav === "explore"} onClick={() => onNav && onNav("explore")} />
          <NavItem icon="map" label="My trips" active={nav === "trips"} onClick={() => onNav && onNav("trips")} />
          <NavItem icon="coin" label="Budgets" active={nav === "budget"} onClick={() => onNav && onNav("budget")} />
        </nav>
        <div style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: 10, padding: 10, background: "var(--cream-200)", borderRadius: "var(--radius-lg)" }}>
          <Avatar name={D.user.name} tone="sky" size={38} />
          <div style={{ lineHeight: 1.2 }}>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, color: "var(--royal-800)", fontSize: 14 }}>{D.user.name}</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)" }}>Family plan</div>
          </div>
        </div>
      </aside>

      {/* main column */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <header style={{
          display: "flex", alignItems: "center", gap: 16, padding: "16px 28px",
          borderBottom: "2.5px solid var(--sand-200)", background: "var(--cream-50)",
          position: "sticky", top: 0, zIndex: 5,
        }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 10, flex: 1, maxWidth: 420,
            background: "#fff", border: "2.5px solid var(--sand-300)", borderRadius: "var(--radius-pill)",
            padding: "9px 16px", color: "var(--sand-400)",
          }}>
            <Icon name="search" size={18} />
            <span style={{ fontWeight: 700, fontSize: 14, whiteSpace: "nowrap" }}>Search trips &amp; places…</span>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
            <IconButton label="Notifications" variant="secondary"><Icon name="bell" size={18} /></IconButton>
            <Button variant="cta" icon={<Icon name="plus" size={18} />} onClick={() => onNav && onNav("new")}>Start a trip</Button>
          </div>
        </header>
        <main style={{ padding: "28px 28px 48px", flex: 1 }}>{children}</main>
      </div>
    </div>
  );
}
