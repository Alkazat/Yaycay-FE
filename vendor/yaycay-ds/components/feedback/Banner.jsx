import React from "react";

const CSS = `
.yc-banner {
  --_bg: var(--sky-50); --_bd: var(--sky-300); --_ic: var(--sky-500); --_fg: var(--royal-700);
  display: flex; align-items: flex-start; gap: 12px;
  font-family: var(--font-body); font-weight: 700; color: var(--_fg);
  background: var(--_bg); border: 2.5px solid var(--_bd);
  border-radius: var(--radius-lg);
  padding: 14px 16px;
  box-shadow: var(--shadow-sm);
}
.yc-banner__icon { flex: none; width: 34px; height: 34px; border-radius: var(--radius-md); display: grid; place-items: center; background: var(--_ic); color: #fff; box-shadow: var(--gloss-top); }
.yc-banner__icon svg { width: 19px; height: 19px; }
.yc-banner__body { flex: 1; display: flex; flex-direction: column; gap: 2px; padding-top: 4px; }
.yc-banner__title { font-family: var(--font-display); font-weight: 600; font-size: var(--fs-base); color: var(--royal-800); }
.yc-banner__msg { font-size: var(--fs-sm); color: var(--text-body); font-weight: 600; }
.yc-banner__close { flex: none; background: transparent; border: none; cursor: pointer; color: var(--sand-400); padding: 4px; border-radius: 8px; display: grid; place-items: center; }
.yc-banner__close:hover { color: var(--royal-600); background: rgba(7,61,114,.08); }
.yc-banner__close svg { width: 16px; height: 16px; stroke-width: 3; }
.yc-banner--success { --_bg:#eaf7ee; --_bd: var(--meadow-300); --_ic: var(--meadow-400); }
.yc-banner--warning { --_bg: var(--sun-50); --_bd: var(--sun-200); --_ic: var(--sun-400); }
.yc-banner--danger  { --_bg:#fff0ec; --_bd: var(--coral-300); --_ic: var(--coral-400); }
.yc-banner--info    { --_bg: var(--sky-50); --_bd: var(--sky-300); --_ic: var(--sky-500); }
`;

function ensure(id, css) {
  if (typeof document === "undefined") return;
  if (document.getElementById(id)) return;
  const el = document.createElement("style");
  el.id = id; el.textContent = css; document.head.appendChild(el);
}

const ICONS = {
  success: <path d="M5 13l4 4L19 7" />,
  warning: <g><path d="M12 9v4" /><path d="M12 17h.01" /><path d="M10.3 3.9 2.4 18a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" /></g>,
  danger:  <g><circle cx="12" cy="12" r="9" /><path d="M12 8v5M12 16h.01" /></g>,
  info:    <g><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></g>,
};

export function Banner({ tone = "info", title, children, icon, onClose, className = "", ...rest }) {
  ensure("yc-banner-css", CSS);
  return (
    <div className={["yc-banner", `yc-banner--${tone}`, className].filter(Boolean).join(" ")} role="status" {...rest}>
      <span className="yc-banner__icon">
        {icon || (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
            {ICONS[tone] || ICONS.info}
          </svg>
        )}
      </span>
      <div className="yc-banner__body">
        {title ? <span className="yc-banner__title">{title}</span> : null}
        {children ? <span className="yc-banner__msg">{children}</span> : null}
      </div>
      {onClose ? (
        <button className="yc-banner__close" onClick={onClose} aria-label="Dismiss">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
        </button>
      ) : null}
    </div>
  );
}
