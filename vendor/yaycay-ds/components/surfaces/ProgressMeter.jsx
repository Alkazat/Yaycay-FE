import React from "react";

const CSS = `
.yc-progress { display: flex; flex-direction: column; gap: 6px; font-family: var(--font-body); }
.yc-progress__top { display: flex; justify-content: space-between; align-items: baseline; }
.yc-progress__label { font-family: var(--font-display); font-weight: 600; font-size: var(--fs-sm); color: var(--royal-700); }
.yc-progress__val { font-family: var(--font-display); font-weight: 600; font-size: var(--fs-sm); color: var(--sky-600); }
.yc-progress__track {
  height: 16px; border-radius: var(--radius-pill);
  background: var(--cream-300); border: 2.5px solid var(--royal-600);
  overflow: hidden; box-shadow: inset 0 2px 3px rgba(7,61,114,.18);
}
.yc-progress__fill {
  height: 100%; border-radius: var(--radius-pill);
  background: var(--grad-sky);
  box-shadow: var(--gloss-top);
  transition: width var(--dur-slow) var(--ease-out);
}
.yc-progress--sun .yc-progress__fill { background: var(--grad-sunset); }
.yc-progress--meadow .yc-progress__fill { background: linear-gradient(180deg,#7fd08a,#46b25e); }
.yc-progress--aqua .yc-progress__fill { background: var(--grad-aqua); }
`;

function ensure(id, css) {
  if (typeof document === "undefined") return;
  if (document.getElementById(id)) return;
  const el = document.createElement("style");
  el.id = id; el.textContent = css; document.head.appendChild(el);
}

export function ProgressMeter({ value = 0, max = 100, label, showValue = true, valueText, tone = "sky", className = "", ...rest }) {
  ensure("yc-progress-css", CSS);
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className={["yc-progress", `yc-progress--${tone}`, className].filter(Boolean).join(" ")} {...rest}>
      {(label || showValue) && (
        <div className="yc-progress__top">
          {label ? <span className="yc-progress__label">{label}</span> : <span />}
          {showValue ? <span className="yc-progress__val">{valueText || `${Math.round(pct)}%`}</span> : null}
        </div>
      )}
      <div className="yc-progress__track" role="progressbar" aria-valuenow={value} aria-valuemax={max}>
        <div className="yc-progress__fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
