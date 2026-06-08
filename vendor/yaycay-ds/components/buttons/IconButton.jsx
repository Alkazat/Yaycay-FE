import React from "react";

const CSS = `
.yc-iconbtn {
  --_bg: #fff; --_bd: var(--royal-500); --_fg: var(--royal-700); --_pop: 0 4px 0 var(--sand-300);
  font-family: var(--font-display);
  display: inline-grid; place-items: center;
  border: 2.5px solid var(--_bd);
  background: var(--_bg); color: var(--_fg);
  border-radius: var(--radius-pill);
  cursor: pointer;
  box-shadow: var(--_pop), var(--gloss-top);
  transition: transform var(--dur-fast) var(--ease-bounce), box-shadow var(--dur-fast) var(--ease-bounce), filter var(--dur-fast) var(--ease-out);
  -webkit-tap-highlight-color: transparent;
}
.yc-iconbtn:hover { transform: translateY(-2px); filter: brightness(1.03); }
.yc-iconbtn:active { transform: translateY(2px); box-shadow: 0 1px 0 var(--_bd), var(--gloss-top); }
.yc-iconbtn:focus-visible { outline: none; box-shadow: var(--_pop), var(--gloss-top), var(--ring-focus); }
.yc-iconbtn[disabled] { opacity: .5; cursor: not-allowed; transform: none; }
.yc-iconbtn svg { display: block; width: 1.25em; height: 1.25em; }
.yc-iconbtn--sm { width: var(--control-sm); height: var(--control-sm); font-size: 15px; }
.yc-iconbtn--md { width: var(--control-md); height: var(--control-md); font-size: 18px; }
.yc-iconbtn--lg { width: var(--control-lg); height: var(--control-lg); font-size: 22px; }
.yc-iconbtn--primary { --_bg: var(--sky-500); --_bd: var(--royal-600); --_fg:#fff; --_pop: var(--pop-sky); }
.yc-iconbtn--cta     { --_bg: var(--sun-400); --_bd: var(--sun-600);   --_fg: var(--royal-800); --_pop: var(--pop-sun); }
.yc-iconbtn--ghost   { background: transparent; border-color: transparent; box-shadow: none; }
.yc-iconbtn--ghost:hover { background: var(--sky-50); }
.yc-iconbtn--ghost:active { box-shadow: none; }
`;

function ensure(id, css) {
  if (typeof document === "undefined") return;
  if (document.getElementById(id)) return;
  const el = document.createElement("style");
  el.id = id; el.textContent = css; document.head.appendChild(el);
}

export function IconButton({
  variant = "secondary",
  size = "md",
  label,
  type = "button",
  className = "",
  children,
  ...rest
}) {
  ensure("yc-iconbtn-css", CSS);
  const cls = ["yc-iconbtn", `yc-iconbtn--${variant}`, `yc-iconbtn--${size}`, className]
    .filter(Boolean).join(" ");
  return (
    <button type={type} className={cls} aria-label={label} title={label} {...rest}>
      {children}
    </button>
  );
}
