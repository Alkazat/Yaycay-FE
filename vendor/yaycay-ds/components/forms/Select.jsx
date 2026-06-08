import React from "react";

const CSS = `
.yc-select-field { display: flex; flex-direction: column; gap: 6px; font-family: var(--font-body); }
.yc-select-field__label { font-family: var(--font-display); font-weight: 600; font-size: var(--fs-sm); color: var(--royal-700); }
.yc-select-wrap { position: relative; display: flex; align-items: center; }
.yc-select {
  appearance: none; -webkit-appearance: none;
  width: 100%; box-sizing: border-box;
  font-family: var(--font-body); font-weight: 700; font-size: var(--fs-base);
  color: var(--ink); background: #fff;
  border: 2.5px solid var(--sand-300); border-radius: var(--radius-md);
  min-height: var(--control-md);
  padding: 8px 44px 8px 16px;
  cursor: pointer;
  box-shadow: inset 0 2px 4px rgba(7,61,114,.06);
  transition: border-color var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out);
}
.yc-select:hover { border-color: var(--sky-300); }
.yc-select:focus { outline: none; border-color: var(--sky-500); box-shadow: var(--ring-focus); }
.yc-select[disabled] { background: var(--cream-200); color: var(--sand-400); cursor: not-allowed; }
.yc-select-wrap__chev { position: absolute; right: 14px; pointer-events: none; color: var(--royal-500); display: inline-flex; }
.yc-select-wrap__chev svg { width: 20px; height: 20px; }
`;

function ensure(id, css) {
  if (typeof document === "undefined") return;
  if (document.getElementById(id)) return;
  const el = document.createElement("style");
  el.id = id; el.textContent = css; document.head.appendChild(el);
}

export function Select({ label, options = [], placeholder, id, className = "", children, ...rest }) {
  ensure("yc-select-css", CSS);
  const selId = id || (label ? `yc-${label.replace(/\s+/g, "-").toLowerCase()}` : undefined);
  return (
    <div className="yc-select-field">
      {label ? <label className="yc-select-field__label" htmlFor={selId}>{label}</label> : null}
      <div className="yc-select-wrap">
        <select id={selId} className={"yc-select " + className} {...rest}>
          {placeholder ? <option value="" disabled>{placeholder}</option> : null}
          {children}
          {options.map((o) => {
            const opt = typeof o === "string" ? { value: o, label: o } : o;
            return <option key={opt.value} value={opt.value}>{opt.label}</option>;
          })}
        </select>
        <span className="yc-select-wrap__chev">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
        </span>
      </div>
    </div>
  );
}
