import React from "react";

const CSS = `
.yc-badge {
  --_bg: var(--sky-500); --_fg: #fff; --_bd: var(--royal-600);
  display: inline-flex; align-items: center; gap: 6px;
  font-family: var(--font-display); font-weight: 600;
  font-size: var(--fs-xs); line-height: 1;
  padding: 6px 12px; border-radius: var(--radius-pill);
  background: var(--_bg); color: var(--_fg);
  border: 2px solid var(--_bd);
  box-shadow: var(--gloss-top);
  white-space: nowrap;
}
.yc-badge svg { width: 13px; height: 13px; }
.yc-badge--sky    { --_bg: var(--sky-500);  --_bd: var(--royal-600); --_fg:#fff; }
.yc-badge--sun    { --_bg: var(--sun-400);  --_bd: var(--sun-600);   --_fg: var(--royal-800); }
.yc-badge--aqua   { --_bg: var(--aqua-400); --_bd: var(--aqua-600);  --_fg: var(--royal-800); }
.yc-badge--meadow { --_bg: var(--meadow-400);--_bd: var(--meadow-600);--_fg:#fff; }
.yc-badge--coral  { --_bg: var(--coral-400);--_bd: var(--coral-600); --_fg:#fff; }
.yc-badge--ink    { --_bg: var(--royal-700);--_bd: var(--royal-800); --_fg: var(--cream-100); }
.yc-badge--soft   { --_bg: var(--sky-50); --_bd: var(--sky-200); --_fg: var(--royal-600); box-shadow: none; }
.yc-badge--dot::before { content:""; width: 7px; height: 7px; border-radius: 50%; background: currentColor; }
`;

function ensure(id, css) {
  if (typeof document === "undefined") return;
  if (document.getElementById(id)) return;
  const el = document.createElement("style");
  el.id = id; el.textContent = css; document.head.appendChild(el);
}

export function Badge({ tone = "sky", dot = false, icon = null, className = "", children, ...rest }) {
  ensure("yc-badge-css", CSS);
  const cls = ["yc-badge", `yc-badge--${tone}`, dot ? "yc-badge--dot" : "", className]
    .filter(Boolean).join(" ");
  return (
    <span className={cls} {...rest}>
      {icon ? icon : null}
      {children}
    </span>
  );
}
