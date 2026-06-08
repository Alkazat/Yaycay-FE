import React from "react";

const CSS = `
.yc-card {
  background: var(--surface-card);
  border: 2.5px solid var(--royal-500);
  border-radius: var(--radius-xl);
  box-shadow: var(--card-lift);
  overflow: hidden;
  display: flex; flex-direction: column;
  font-family: var(--font-body);
}
.yc-card--flat { box-shadow: var(--shadow-sm); }
.yc-card--soft { border-color: var(--sand-200); box-shadow: var(--shadow-md); }
.yc-card--interactive { cursor: pointer; transition: transform var(--dur-base) var(--ease-bounce), box-shadow var(--dur-base) var(--ease-bounce); }
.yc-card--interactive:hover { transform: translateY(-4px); box-shadow: var(--shadow-lg); }
.yc-card--interactive:active { transform: translateY(-1px); }
.yc-card__media { position: relative; display: block; background: var(--grad-scene); }
.yc-card__media img { width: 100%; height: 100%; object-fit: cover; display: block; }
.yc-card__media-tag { position: absolute; top: 12px; left: 12px; }
.yc-card__media-fav { position: absolute; top: 12px; right: 12px; }
.yc-card__body { padding: var(--space-5); display: flex; flex-direction: column; gap: var(--space-2); }
.yc-card__title { font-family: var(--font-display); font-weight: 600; font-size: var(--fs-h4); color: var(--royal-800); margin: 0; }
.yc-card__sub { color: var(--text-muted); font-weight: 700; font-size: var(--fs-sm); margin: 0; }
.yc-card__footer { padding: var(--space-4) var(--space-5); border-top: 2px dashed var(--sand-200); display: flex; align-items: center; justify-content: space-between; gap: var(--space-3); }
`;

function ensure(id, css) {
  if (typeof document === "undefined") return;
  if (document.getElementById(id)) return;
  const el = document.createElement("style");
  el.id = id; el.textContent = css; document.head.appendChild(el);
}

export function Card({ variant = "default", interactive = false, className = "", children, ...rest }) {
  ensure("yc-card-css", CSS);
  const cls = [
    "yc-card",
    variant === "flat" ? "yc-card--flat" : "",
    variant === "soft" ? "yc-card--soft" : "",
    interactive ? "yc-card--interactive" : "",
    className,
  ].filter(Boolean).join(" ");
  return <div className={cls} {...rest}>{children}</div>;
}

export function CardMedia({ src, alt = "", height = 160, tag, fav, children, style, ...rest }) {
  ensure("yc-card-css", CSS);
  return (
    <div className="yc-card__media" style={{ height, ...style }} {...rest}>
      {src ? <img src={src} alt={alt} /> : children}
      {tag ? <span className="yc-card__media-tag">{tag}</span> : null}
      {fav ? <span className="yc-card__media-fav">{fav}</span> : null}
    </div>
  );
}

export function CardBody({ title, subtitle, className = "", children, ...rest }) {
  ensure("yc-card-css", CSS);
  return (
    <div className={"yc-card__body " + className} {...rest}>
      {title ? <h3 className="yc-card__title">{title}</h3> : null}
      {subtitle ? <p className="yc-card__sub">{subtitle}</p> : null}
      {children}
    </div>
  );
}

export function CardFooter({ className = "", children, ...rest }) {
  ensure("yc-card-css", CSS);
  return <div className={"yc-card__footer " + className} {...rest}>{children}</div>;
}
