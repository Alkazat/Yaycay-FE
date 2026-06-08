// Shared bits for the Yaycay app kit: brand scene tiles, icons, app chrome.
const SCENE_GRAD = {
  sunset: "var(--grad-sunset)",
  meadow: "linear-gradient(180deg,#8fd8e8 0%,#bfe6a8 55%,#7fd08a 100%)",
  sky: "var(--grad-sky)",
  aqua: "var(--grad-aqua)",
};

function Scene({ variant = "sky", height = 150, children, round = 0, style }) {
  return (
    <div style={{
      position: "relative", height, width: "100%", overflow: "hidden",
      background: SCENE_GRAD[variant] || SCENE_GRAD.sky, borderRadius: round, ...style,
    }}>
      <div style={{ position: "absolute", width: 86, height: 26, top: 20, left: 22, background: "var(--cream-50)", borderRadius: 999, opacity: .92, boxShadow: "32px -9px 0 -4px var(--cream-50)" }} />
      <div style={{ position: "absolute", width: 58, height: 18, top: 38, right: 26, background: "var(--cream-50)", borderRadius: 999, opacity: .85 }} />
      {variant === "sunset" && (
        <div style={{ position: "absolute", width: 60, height: 60, bottom: -22, left: "50%", transform: "translateX(-50%)", background: "radial-gradient(circle, #fff3c4 0%, #ffd778 60%, transparent 72%)", borderRadius: 999 }} />
      )}
      {children}
    </div>
  );
}

// Inline Lucide-style icons (stroke 2.5 to match the brand)
const I = {
  plane: "M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z",
  bed: "M3 7v11M3 12h18v6M21 12V9a2 2 0 0 0-2-2h-7v5M7 11h.01",
  food: "M4 3v7a3 3 0 0 0 6 0V3M7 3v18M17 3c-1.5 0-3 1.5-3 5s1.5 4 3 4 3-1 3-4-1.5-5-3-5ZM17 16v5",
  play: "M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7Z|9 22h6",
  calendar: "M3 5h18v16H3zM3 9h18M8 3v4M16 3v4",
  bag: "M5 8h14l-1 12H6L5 8ZM9 8V6a3 3 0 0 1 6 0v2",
  coin: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18ZM12 7v10M9.5 9.5h4a1.5 1.5 0 0 1 0 3h-3a1.5 1.5 0 0 0 0 3h4",
  home: "M3 11l9-8 9 8M5 10v10h14V10",
  compass: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18ZM15.5 8.5l-2 5-5 2 2-5 5-2Z",
  plus: "M12 5v14M5 12h14",
  search: "M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14ZM20 20l-3.5-3.5",
  bell: "M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0",
  check: "M5 13l4 4L19 7",
  chevL: "M15 6l-6 6 6 6",
  star: "M12 3l2.6 5.3 5.9.9-4.2 4.1 1 5.8L12 16.9 6.7 19.2l1-5.8L3.5 9.2l5.9-.9z",
  map: "M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2ZM9 4v14M15 6v14",
  share: "M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M16 6l-4-4-4 4M12 2v13",
};

function Icon({ name, size = 22, stroke = 2.5, fill = "none", style }) {
  const paths = (I[name] || "").split("|");
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill={fill} stroke="currentColor"
      strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" style={{ display: "block", ...style }}>
      {paths.map((d, i) => <path key={i} d={d} />)}
    </svg>
  );
}

const KIND_ICON = { travel: "plane", stay: "bed", food: "food", play: "play" };
const KIND_TONE = { travel: "sky", stay: "aqua", food: "sun", play: "meadow" };
