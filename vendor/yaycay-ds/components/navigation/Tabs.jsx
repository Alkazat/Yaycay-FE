import React from "react";

const CSS = `
.yc-tabs { display: inline-flex; gap: 4px; padding: 5px; background: var(--cream-200); border: 2.5px solid var(--royal-500); border-radius: var(--radius-pill); }
.yc-tab {
  font-family: var(--font-display); font-weight: 600; font-size: var(--fs-sm);
  color: var(--royal-600);
  background: transparent; border: none; cursor: pointer;
  padding: 8px 18px; border-radius: var(--radius-pill);
  display: inline-flex; align-items: center; gap: 7px;
  transition: background var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out), transform var(--dur-fast) var(--ease-bounce);
  -webkit-tap-highlight-color: transparent; white-space: nowrap;
}
.yc-tab svg { width: 16px; height: 16px; }
.yc-tab:hover { color: var(--royal-800); }
.yc-tab--active { background: var(--sky-500); color: #fff; box-shadow: 0 3px 0 var(--royal-600), var(--gloss-top); }
.yc-tab--active:hover { color: #fff; }
.yc-tab:focus-visible { outline: none; box-shadow: var(--ring-focus); }
.yc-tab__count { font-family: var(--font-body); font-weight: 800; font-size: 11px; background: rgba(7,61,114,.12); padding: 1px 7px; border-radius: 999px; }
.yc-tab--active .yc-tab__count { background: rgba(255,255,255,.28); }
`;

function ensure(id, css) {
  if (typeof document === "undefined") return;
  if (document.getElementById(id)) return;
  const el = document.createElement("style");
  el.id = id; el.textContent = css; document.head.appendChild(el);
}

export function Tabs({ tabs = [], value, onChange, className = "", ...rest }) {
  ensure("yc-tabs-css", CSS);
  return (
    <div className={"yc-tabs " + className} role="tablist" {...rest}>
      {tabs.map((t) => {
        const tab = typeof t === "string" ? { value: t, label: t } : t;
        const active = tab.value === value;
        return (
          <button
            key={tab.value}
            role="tab"
            aria-selected={active}
            className={"yc-tab" + (active ? " yc-tab--active" : "")}
            onClick={() => onChange && onChange(tab.value)}
          >
            {tab.icon ? tab.icon : null}
            {tab.label}
            {tab.count != null ? <span className="yc-tab__count">{tab.count}</span> : null}
          </button>
        );
      })}
    </div>
  );
}
