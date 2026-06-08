import React from "react";

const CSS = `
.yc-stat {
  display: flex; flex-direction: column; gap: 2px;
  font-family: var(--font-body);
  background: var(--surface-card);
  border: 2.5px solid var(--royal-500);
  border-radius: var(--radius-lg);
  padding: var(--space-4) var(--space-5);
  box-shadow: 0 5px 0 var(--cream-300);
  min-width: 120px;
}
.yc-stat__icon { display: inline-grid; place-items: center; width: 38px; height: 38px; border-radius: var(--radius-md); margin-bottom: 6px; color: #fff; }
.yc-stat__icon svg { width: 20px; height: 20px; }
.yc-stat__value { font-family: var(--font-display); font-weight: 600; font-size: 2rem; line-height: 1; color: var(--royal-800); }
.yc-stat__label { font-weight: 800; font-size: var(--fs-sm); color: var(--text-muted); }
.yc-stat--sky .yc-stat__icon { background: var(--sky-500); }
.yc-stat--sun .yc-stat__icon { background: var(--sun-400); color: var(--royal-800); }
.yc-stat--meadow .yc-stat__icon { background: var(--meadow-400); }
.yc-stat--coral .yc-stat__icon { background: var(--coral-400); }
`;

function ensure(id, css) {
  if (typeof document === "undefined") return;
  if (document.getElementById(id)) return;
  const el = document.createElement("style");
  el.id = id; el.textContent = css; document.head.appendChild(el);
}

export function Stat({ value, label, icon = null, tone = "sky", className = "", ...rest }) {
  ensure("yc-stat-css", CSS);
  return (
    <div className={["yc-stat", `yc-stat--${tone}`, className].filter(Boolean).join(" ")} {...rest}>
      {icon ? <span className="yc-stat__icon">{icon}</span> : null}
      <span className="yc-stat__value">{value}</span>
      <span className="yc-stat__label">{label}</span>
    </div>
  );
}
