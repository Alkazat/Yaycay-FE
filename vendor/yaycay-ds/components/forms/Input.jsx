import React from "react";

const CSS = `
.yc-field { display: flex; flex-direction: column; gap: 6px; font-family: var(--font-body); }
.yc-field__label { font-family: var(--font-display); font-weight: 600; font-size: var(--fs-sm); color: var(--royal-700); }
.yc-field__hint { font-size: var(--fs-xs); font-weight: 700; color: var(--text-muted); }
.yc-field__hint--err { color: var(--coral-500); }
.yc-input-wrap { position: relative; display: flex; align-items: center; }
.yc-input-wrap__icon { position: absolute; left: 14px; display: inline-flex; color: var(--sand-400); pointer-events: none; }
.yc-input-wrap__icon svg { width: 18px; height: 18px; }
.yc-input {
  width: 100%; box-sizing: border-box;
  font-family: var(--font-body); font-weight: 600; font-size: var(--fs-base);
  color: var(--ink);
  background: #fff;
  border: 2.5px solid var(--sand-300);
  border-radius: var(--radius-md);
  min-height: var(--control-md);
  padding: 8px 16px;
  box-shadow: inset 0 2px 4px rgba(7,61,114,.06);
  transition: border-color var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out);
}
.yc-input::placeholder { color: var(--sand-400); font-weight: 600; }
.yc-input--with-icon { padding-left: 42px; }
.yc-input:hover { border-color: var(--sky-300); }
.yc-input:focus { outline: none; border-color: var(--sky-500); box-shadow: var(--ring-focus); }
.yc-input--err { border-color: var(--coral-400); }
.yc-input--err:focus { box-shadow: 0 0 0 3px var(--cream-100), 0 0 0 6px var(--coral-300); }
.yc-input[disabled] { background: var(--cream-200); color: var(--sand-400); cursor: not-allowed; }
`;

function ensure(id, css) {
  if (typeof document === "undefined") return;
  if (document.getElementById(id)) return;
  const el = document.createElement("style");
  el.id = id; el.textContent = css; document.head.appendChild(el);
}

export function Input({
  label,
  hint,
  error,
  icon = null,
  id,
  className = "",
  ...rest
}) {
  ensure("yc-input-css", CSS);
  const inputId = id || (label ? `yc-${label.replace(/\s+/g, "-").toLowerCase()}` : undefined);
  const inputCls = [
    "yc-input",
    icon ? "yc-input--with-icon" : "",
    error ? "yc-input--err" : "",
    className,
  ].filter(Boolean).join(" ");
  return (
    <div className="yc-field">
      {label ? <label className="yc-field__label" htmlFor={inputId}>{label}</label> : null}
      <div className="yc-input-wrap">
        {icon ? <span className="yc-input-wrap__icon">{icon}</span> : null}
        <input id={inputId} className={inputCls} aria-invalid={!!error} {...rest} />
      </div>
      {error ? <span className="yc-field__hint yc-field__hint--err">{error}</span>
        : hint ? <span className="yc-field__hint">{hint}</span> : null}
    </div>
  );
}
