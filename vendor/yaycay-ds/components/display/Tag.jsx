import React from "react";

const CSS = `
.yc-tag {
  display: inline-flex; align-items: center; gap: 7px;
  font-family: var(--font-body); font-weight: 800; font-size: var(--fs-sm);
  color: var(--royal-700);
  background: #fff; border: 2.5px solid var(--royal-500);
  border-radius: var(--radius-pill);
  padding: 6px 14px;
  box-shadow: 0 3px 0 var(--sand-300);
}
.yc-tag__emoji-free svg { width: 16px; height: 16px; }
.yc-tag--active { background: var(--sky-500); color: #fff; border-color: var(--royal-600); box-shadow: 0 3px 0 var(--royal-600), var(--gloss-top); }
.yc-tag--clickable { cursor: pointer; transition: transform var(--dur-fast) var(--ease-bounce); -webkit-tap-highlight-color: transparent; }
.yc-tag--clickable:hover { transform: translateY(-2px); }
.yc-tag--clickable:active { transform: translateY(1px); }
.yc-tag__x { display: inline-grid; place-items: center; width: 18px; height: 18px; border-radius: 50%; background: rgba(7,61,114,.12); cursor: pointer; }
.yc-tag--active .yc-tag__x { background: rgba(255,255,255,.28); }
.yc-tag__x svg { width: 11px; height: 11px; stroke-width: 3.5; }
`;

function ensure(id, css) {
  if (typeof document === "undefined") return;
  if (document.getElementById(id)) return;
  const el = document.createElement("style");
  el.id = id; el.textContent = css; document.head.appendChild(el);
}

export function Tag({ icon = null, active = false, onRemove, onClick, className = "", children, ...rest }) {
  ensure("yc-tag-css", CSS);
  const clickable = !!onClick;
  const cls = ["yc-tag", active ? "yc-tag--active" : "", clickable ? "yc-tag--clickable" : "", className]
    .filter(Boolean).join(" ");
  return (
    <span className={cls} onClick={onClick} {...rest}>
      {icon ? <span className="yc-tag__emoji-free">{icon}</span> : null}
      {children}
      {onRemove ? (
        <span className="yc-tag__x" onClick={(e) => { e.stopPropagation(); onRemove(e); }} role="button" aria-label="Remove">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
        </span>
      ) : null}
    </span>
  );
}
