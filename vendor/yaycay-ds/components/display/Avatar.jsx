import React from "react";

const CSS = `
.yc-avatar {
  --_size: 44px;
  width: var(--_size); height: var(--_size);
  border-radius: var(--radius-pill);
  border: 2.5px solid var(--royal-600);
  background: var(--grad-sky);
  display: inline-grid; place-items: center;
  font-family: var(--font-display); font-weight: 600; color: #fff;
  box-shadow: var(--gloss-top); overflow: hidden;
  flex: none; position: relative;
}
.yc-avatar img { width: 100%; height: 100%; object-fit: cover; }
.yc-avatar--sun  { background: var(--grad-sunset); color: var(--royal-800); border-color: var(--sun-600); }
.yc-avatar--aqua { background: var(--grad-aqua); color: var(--royal-800); border-color: var(--aqua-600); }
.yc-avatar--coral{ background: linear-gradient(180deg,#ff9b7a,#ff6f4d); border-color: var(--coral-600); }
.yc-avatar__ring { box-shadow: var(--gloss-top), 0 0 0 3px var(--cream-100), 0 0 0 5px var(--sun-300); }
.yc-avatar-group { display: inline-flex; }
.yc-avatar-group .yc-avatar { margin-left: -12px; }
.yc-avatar-group .yc-avatar:first-child { margin-left: 0; }
`;

function ensure(id, css) {
  if (typeof document === "undefined") return;
  if (document.getElementById(id)) return;
  const el = document.createElement("style");
  el.id = id; el.textContent = css; document.head.appendChild(el);
}

function initials(name = "") {
  return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

export function Avatar({ name = "", src, tone = "sky", size = 44, ring = false, className = "", style, ...rest }) {
  ensure("yc-avatar-css", CSS);
  const cls = ["yc-avatar", `yc-avatar--${tone}`, ring ? "yc-avatar__ring" : "", className]
    .filter(Boolean).join(" ");
  const fontSize = Math.round(size * 0.4);
  return (
    <span className={cls} style={{ "--_size": `${size}px`, fontSize, ...style }} title={name} {...rest}>
      {src ? <img src={src} alt={name} /> : initials(name)}
    </span>
  );
}

export function AvatarGroup({ children, className = "", ...rest }) {
  ensure("yc-avatar-css", CSS);
  return <span className={"yc-avatar-group " + className} {...rest}>{children}</span>;
}
