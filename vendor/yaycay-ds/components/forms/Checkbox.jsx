import React from "react";

const CSS = `
.yc-check { display: inline-flex; align-items: flex-start; gap: 10px; cursor: pointer; font-family: var(--font-body); font-weight: 700; color: var(--royal-700); -webkit-tap-highlight-color: transparent; }
.yc-check input { position: absolute; opacity: 0; width: 0; height: 0; }
.yc-check__box {
  width: 26px; height: 26px; flex: none; border-radius: var(--radius-sm);
  background: #fff; border: 2.5px solid var(--royal-600);
  display: grid; place-items: center;
  box-shadow: var(--gloss-top);
  transition: background var(--dur-fast) var(--ease-bounce), transform var(--dur-fast) var(--ease-bounce);
}
.yc-check__box svg { width: 16px; height: 16px; stroke: #fff; stroke-width: 4; fill: none; stroke-linecap: round; stroke-linejoin: round; opacity: 0; transform: scale(.4); transition: opacity var(--dur-fast) var(--ease-bounce), transform var(--dur-fast) var(--ease-bounce); }
.yc-check input:checked + .yc-check__box { background: var(--sky-500); }
.yc-check input:checked + .yc-check__box svg { opacity: 1; transform: scale(1); }
.yc-check:hover .yc-check__box { transform: translateY(-1px); }
.yc-check input:focus-visible + .yc-check__box { box-shadow: var(--ring-focus); }
.yc-check__label { padding-top: 2px; line-height: 1.3; }
.yc-check--radio .yc-check__box { border-radius: var(--radius-pill); }
.yc-check--radio input:checked + .yc-check__box { background: #fff; }
.yc-check--radio .yc-check__dot { width: 12px; height: 12px; border-radius: var(--radius-pill); background: var(--sky-500); opacity: 0; transform: scale(.3); transition: opacity var(--dur-fast) var(--ease-bounce), transform var(--dur-fast) var(--ease-bounce); }
.yc-check--radio input:checked + .yc-check__box .yc-check__dot { opacity: 1; transform: scale(1); }
.yc-check--disabled { opacity: .5; cursor: not-allowed; }
`;

function ensure(id, css) {
  if (typeof document === "undefined") return;
  if (document.getElementById(id)) return;
  const el = document.createElement("style");
  el.id = id; el.textContent = css; document.head.appendChild(el);
}

export function Checkbox({ checked, defaultChecked, onChange, label, disabled, radio = false, name, value, ...rest }) {
  ensure("yc-check-css", CSS);
  return (
    <label className={"yc-check" + (radio ? " yc-check--radio" : "") + (disabled ? " yc-check--disabled" : "")}>
      <input
        type={radio ? "radio" : "checkbox"}
        checked={checked}
        defaultChecked={defaultChecked}
        onChange={onChange}
        disabled={disabled}
        name={name}
        value={value}
        {...rest}
      />
      <span className="yc-check__box">
        {radio
          ? <span className="yc-check__dot" />
          : <svg viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" /></svg>}
      </span>
      {label ? <span className="yc-check__label">{label}</span> : null}
    </label>
  );
}
