import React from "react";

const CSS = `
.yc-btn {
  --_pop: var(--pop-sky);
  --_bg: var(--sky-500);
  --_fg: #fff;
  --_bd: var(--royal-600);
  font-family: var(--font-display);
  font-weight: 600;
  border: 2.5px solid var(--_bd);
  background: var(--_bg);
  color: var(--_fg);
  border-radius: var(--radius-pill);
  display: inline-flex; align-items: center; justify-content: center;
  gap: var(--space-2);
  cursor: pointer;
  white-space: nowrap;
  box-shadow: var(--_pop), var(--gloss-top);
  transition: transform var(--dur-fast) var(--ease-bounce),
              box-shadow var(--dur-fast) var(--ease-bounce),
              filter var(--dur-fast) var(--ease-out);
  -webkit-tap-highlight-color: transparent;
}
.yc-btn:hover { transform: translateY(-2px); filter: saturate(1.06) brightness(1.03); }
.yc-btn:active { transform: translateY(3px); box-shadow: 0 1px 0 var(--_bd), var(--gloss-top); }
.yc-btn:focus-visible { outline: none; box-shadow: var(--_pop), var(--gloss-top), var(--ring-focus); }
.yc-btn[disabled] { opacity: .5; cursor: not-allowed; transform: none; filter: grayscale(.3); box-shadow: 0 3px 0 var(--_bd); }

/* sizes */
.yc-btn--sm { font-size: var(--fs-sm);  padding: 0 16px; min-height: var(--control-sm); }
.yc-btn--md { font-size: var(--fs-base);padding: 0 22px; min-height: var(--control-md); }
.yc-btn--lg { font-size: var(--fs-lg);  padding: 0 30px; min-height: var(--control-lg); }
.yc-btn--block { display: flex; width: 100%; }

/* variants */
.yc-btn--primary  { --_bg: var(--sky-500);  --_bd: var(--royal-600); --_pop: var(--pop-sky);  --_fg:#fff; }
.yc-btn--cta      { --_bg: var(--sun-400);  --_bd: var(--sun-600);   --_pop: var(--pop-sun);  --_fg: var(--royal-800); }
.yc-btn--accent   { --_bg: var(--aqua-400); --_bd: var(--aqua-600);  --_pop: var(--pop-aqua); --_fg: var(--royal-800); }
.yc-btn--danger   { --_bg: var(--coral-400);--_bd: var(--coral-600); --_pop: var(--pop-coral);--_fg:#fff; }
.yc-btn--secondary{ --_bg: #fff; --_bd: var(--royal-500); --_pop: 0 5px 0 var(--sand-300); --_fg: var(--royal-700); }
.yc-btn--ghost {
  background: transparent; border-color: transparent; box-shadow: none;
  color: var(--royal-600);
}
.yc-btn--ghost:hover { background: var(--sky-50); transform: translateY(-1px); }
.yc-btn--ghost:active { transform: translateY(0); box-shadow: none; }
.yc-btn .yc-btn__icon { display: inline-flex; }
.yc-btn .yc-btn__icon svg { display: block; width: 1.15em; height: 1.15em; }
`;

function ensure(id, css) {
  if (typeof document === "undefined") return;
  if (document.getElementById(id)) return;
  const el = document.createElement("style");
  el.id = id; el.textContent = css; document.head.appendChild(el);
}

export function Button({
  variant = "primary",
  size = "md",
  block = false,
  icon = null,
  iconRight = null,
  type = "button",
  className = "",
  children,
  ...rest
}) {
  ensure("yc-button-css", CSS);
  const cls = [
    "yc-btn",
    `yc-btn--${variant}`,
    `yc-btn--${size}`,
    block ? "yc-btn--block" : "",
    className,
  ].filter(Boolean).join(" ");
  return (
    <button type={type} className={cls} {...rest}>
      {icon ? <span className="yc-btn__icon">{icon}</span> : null}
      {children}
      {iconRight ? <span className="yc-btn__icon">{iconRight}</span> : null}
    </button>
  );
}
