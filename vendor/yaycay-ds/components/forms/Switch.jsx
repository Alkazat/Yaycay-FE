import React from "react";

const CSS = `
.yc-switch { display: inline-flex; align-items: center; gap: 10px; cursor: pointer; font-family: var(--font-body); font-weight: 700; color: var(--royal-700); -webkit-tap-highlight-color: transparent; }
.yc-switch input { position: absolute; opacity: 0; width: 0; height: 0; }
.yc-switch__track {
  width: 52px; height: 30px; border-radius: var(--radius-pill);
  background: var(--sand-300); border: 2.5px solid var(--royal-600);
  position: relative; transition: background var(--dur-base) var(--ease-out);
  box-shadow: inset 0 2px 3px rgba(7,61,114,.18);
  flex: none;
}
.yc-switch__thumb {
  position: absolute; top: 1px; left: 1px; width: 22px; height: 22px;
  border-radius: var(--radius-pill); background: #fff; border: 2px solid var(--royal-600);
  box-shadow: var(--gloss-top);
  transition: transform var(--dur-base) var(--ease-bounce);
}
.yc-switch input:checked + .yc-switch__track { background: var(--meadow-400); }
.yc-switch input:checked + .yc-switch__track .yc-switch__thumb { transform: translateX(22px); }
.yc-switch input:focus-visible + .yc-switch__track { box-shadow: var(--ring-focus); }
.yc-switch input:disabled + .yc-switch__track { opacity: .5; }
.yc-switch--disabled { cursor: not-allowed; opacity: .7; }
`;

function ensure(id, css) {
  if (typeof document === "undefined") return;
  if (document.getElementById(id)) return;
  const el = document.createElement("style");
  el.id = id; el.textContent = css; document.head.appendChild(el);
}

export function Switch({ checked, defaultChecked, onChange, label, disabled, ...rest }) {
  ensure("yc-switch-css", CSS);
  return (
    <label className={"yc-switch" + (disabled ? " yc-switch--disabled" : "")}>
      <input
        type="checkbox"
        checked={checked}
        defaultChecked={defaultChecked}
        onChange={onChange}
        disabled={disabled}
        {...rest}
      />
      <span className="yc-switch__track"><span className="yc-switch__thumb" /></span>
      {label ? <span>{label}</span> : null}
    </label>
  );
}
