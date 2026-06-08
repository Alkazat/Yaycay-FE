/* @ds-bundle: {"format":3,"namespace":"YaycayDesignSystem_f48296","components":[{"name":"Button","sourcePath":"components/buttons/Button.jsx"},{"name":"IconButton","sourcePath":"components/buttons/IconButton.jsx"},{"name":"Avatar","sourcePath":"components/display/Avatar.jsx"},{"name":"AvatarGroup","sourcePath":"components/display/Avatar.jsx"},{"name":"Badge","sourcePath":"components/display/Badge.jsx"},{"name":"Tag","sourcePath":"components/display/Tag.jsx"},{"name":"Banner","sourcePath":"components/feedback/Banner.jsx"},{"name":"Checkbox","sourcePath":"components/forms/Checkbox.jsx"},{"name":"Input","sourcePath":"components/forms/Input.jsx"},{"name":"Select","sourcePath":"components/forms/Select.jsx"},{"name":"Switch","sourcePath":"components/forms/Switch.jsx"},{"name":"Tabs","sourcePath":"components/navigation/Tabs.jsx"},{"name":"Card","sourcePath":"components/surfaces/Card.jsx"},{"name":"CardMedia","sourcePath":"components/surfaces/Card.jsx"},{"name":"CardBody","sourcePath":"components/surfaces/Card.jsx"},{"name":"CardFooter","sourcePath":"components/surfaces/Card.jsx"},{"name":"ProgressMeter","sourcePath":"components/surfaces/ProgressMeter.jsx"},{"name":"Stat","sourcePath":"components/surfaces/Stat.jsx"}],"sourceHashes":{"components/buttons/Button.jsx":"8d798f1bb87b","components/buttons/IconButton.jsx":"9d8c16a5a736","components/display/Avatar.jsx":"ac737749fa77","components/display/Badge.jsx":"e68ef0d5d5f2","components/display/Tag.jsx":"4dff3051f031","components/feedback/Banner.jsx":"615f7db493f5","components/forms/Checkbox.jsx":"7ab4daebc1ff","components/forms/Input.jsx":"6ab08ca9610e","components/forms/Select.jsx":"561f7cf03db5","components/forms/Switch.jsx":"daba6716c24b","components/navigation/Tabs.jsx":"1852d4b40b1f","components/surfaces/Card.jsx":"2aacbaf71ffa","components/surfaces/ProgressMeter.jsx":"824603ce067c","components/surfaces/Stat.jsx":"86fc8fc049fa","ui_kits/app/AppShell.jsx":"3a6cbd3186cc","ui_kits/app/NewTripSheet.jsx":"84f11d481407","ui_kits/app/TripPlanner.jsx":"c474c39d90e3","ui_kits/app/TripsHome.jsx":"7889c3c139b2","ui_kits/app/data.js":"765de92be9f8","ui_kits/app/shared.jsx":"38d3285d29d8","ui_kits/web/Hero.jsx":"3a777b2cc428","ui_kits/web/Sections.jsx":"4f4355387c7b","ui_kits/web/shared.jsx":"38d3285d29d8"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.YaycayDesignSystem_f48296 = window.YaycayDesignSystem_f48296 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/buttons/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
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
  el.id = id;
  el.textContent = css;
  document.head.appendChild(el);
}
function Button({
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
  const cls = ["yc-btn", `yc-btn--${variant}`, `yc-btn--${size}`, block ? "yc-btn--block" : "", className].filter(Boolean).join(" ");
  return /*#__PURE__*/React.createElement("button", _extends({
    type: type,
    className: cls
  }, rest), icon ? /*#__PURE__*/React.createElement("span", {
    className: "yc-btn__icon"
  }, icon) : null, children, iconRight ? /*#__PURE__*/React.createElement("span", {
    className: "yc-btn__icon"
  }, iconRight) : null);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/buttons/Button.jsx", error: String((e && e.message) || e) }); }

// components/buttons/IconButton.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
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
  el.id = id;
  el.textContent = css;
  document.head.appendChild(el);
}
function IconButton({
  variant = "secondary",
  size = "md",
  label,
  type = "button",
  className = "",
  children,
  ...rest
}) {
  ensure("yc-iconbtn-css", CSS);
  const cls = ["yc-iconbtn", `yc-iconbtn--${variant}`, `yc-iconbtn--${size}`, className].filter(Boolean).join(" ");
  return /*#__PURE__*/React.createElement("button", _extends({
    type: type,
    className: cls,
    "aria-label": label,
    title: label
  }, rest), children);
}
Object.assign(__ds_scope, { IconButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/buttons/IconButton.jsx", error: String((e && e.message) || e) }); }

// components/display/Avatar.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
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
  el.id = id;
  el.textContent = css;
  document.head.appendChild(el);
}
function initials(name = "") {
  return name.trim().split(/\s+/).slice(0, 2).map(w => w[0]).join("").toUpperCase();
}
function Avatar({
  name = "",
  src,
  tone = "sky",
  size = 44,
  ring = false,
  className = "",
  style,
  ...rest
}) {
  ensure("yc-avatar-css", CSS);
  const cls = ["yc-avatar", `yc-avatar--${tone}`, ring ? "yc-avatar__ring" : "", className].filter(Boolean).join(" ");
  const fontSize = Math.round(size * 0.4);
  return /*#__PURE__*/React.createElement("span", _extends({
    className: cls,
    style: {
      "--_size": `${size}px`,
      fontSize,
      ...style
    },
    title: name
  }, rest), src ? /*#__PURE__*/React.createElement("img", {
    src: src,
    alt: name
  }) : initials(name));
}
function AvatarGroup({
  children,
  className = "",
  ...rest
}) {
  ensure("yc-avatar-css", CSS);
  return /*#__PURE__*/React.createElement("span", _extends({
    className: "yc-avatar-group " + className
  }, rest), children);
}
Object.assign(__ds_scope, { Avatar, AvatarGroup });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/display/Avatar.jsx", error: String((e && e.message) || e) }); }

// components/display/Badge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const CSS = `
.yc-badge {
  --_bg: var(--sky-500); --_fg: #fff; --_bd: var(--royal-600);
  display: inline-flex; align-items: center; gap: 6px;
  font-family: var(--font-display); font-weight: 600;
  font-size: var(--fs-xs); line-height: 1;
  padding: 6px 12px; border-radius: var(--radius-pill);
  background: var(--_bg); color: var(--_fg);
  border: 2px solid var(--_bd);
  box-shadow: var(--gloss-top);
  white-space: nowrap;
}
.yc-badge svg { width: 13px; height: 13px; }
.yc-badge--sky    { --_bg: var(--sky-500);  --_bd: var(--royal-600); --_fg:#fff; }
.yc-badge--sun    { --_bg: var(--sun-400);  --_bd: var(--sun-600);   --_fg: var(--royal-800); }
.yc-badge--aqua   { --_bg: var(--aqua-400); --_bd: var(--aqua-600);  --_fg: var(--royal-800); }
.yc-badge--meadow { --_bg: var(--meadow-400);--_bd: var(--meadow-600);--_fg:#fff; }
.yc-badge--coral  { --_bg: var(--coral-400);--_bd: var(--coral-600); --_fg:#fff; }
.yc-badge--ink    { --_bg: var(--royal-700);--_bd: var(--royal-800); --_fg: var(--cream-100); }
.yc-badge--soft   { --_bg: var(--sky-50); --_bd: var(--sky-200); --_fg: var(--royal-600); box-shadow: none; }
.yc-badge--dot::before { content:""; width: 7px; height: 7px; border-radius: 50%; background: currentColor; }
`;
function ensure(id, css) {
  if (typeof document === "undefined") return;
  if (document.getElementById(id)) return;
  const el = document.createElement("style");
  el.id = id;
  el.textContent = css;
  document.head.appendChild(el);
}
function Badge({
  tone = "sky",
  dot = false,
  icon = null,
  className = "",
  children,
  ...rest
}) {
  ensure("yc-badge-css", CSS);
  const cls = ["yc-badge", `yc-badge--${tone}`, dot ? "yc-badge--dot" : "", className].filter(Boolean).join(" ");
  return /*#__PURE__*/React.createElement("span", _extends({
    className: cls
  }, rest), icon ? icon : null, children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/display/Badge.jsx", error: String((e && e.message) || e) }); }

// components/display/Tag.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
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
  el.id = id;
  el.textContent = css;
  document.head.appendChild(el);
}
function Tag({
  icon = null,
  active = false,
  onRemove,
  onClick,
  className = "",
  children,
  ...rest
}) {
  ensure("yc-tag-css", CSS);
  const clickable = !!onClick;
  const cls = ["yc-tag", active ? "yc-tag--active" : "", clickable ? "yc-tag--clickable" : "", className].filter(Boolean).join(" ");
  return /*#__PURE__*/React.createElement("span", _extends({
    className: cls,
    onClick: onClick
  }, rest), icon ? /*#__PURE__*/React.createElement("span", {
    className: "yc-tag__emoji-free"
  }, icon) : null, children, onRemove ? /*#__PURE__*/React.createElement("span", {
    className: "yc-tag__x",
    onClick: e => {
      e.stopPropagation();
      onRemove(e);
    },
    role: "button",
    "aria-label": "Remove"
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M6 6l12 12M18 6L6 18"
  }))) : null);
}
Object.assign(__ds_scope, { Tag });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/display/Tag.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Banner.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
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
  el.id = id;
  el.textContent = css;
  document.head.appendChild(el);
}
const ICONS = {
  success: /*#__PURE__*/React.createElement("path", {
    d: "M5 13l4 4L19 7"
  }),
  warning: /*#__PURE__*/React.createElement("g", null, /*#__PURE__*/React.createElement("path", {
    d: "M12 9v4"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 17h.01"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M10.3 3.9 2.4 18a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"
  })),
  danger: /*#__PURE__*/React.createElement("g", null, /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "9"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 8v5M12 16h.01"
  })),
  info: /*#__PURE__*/React.createElement("g", null, /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "9"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 11v5M12 8h.01"
  }))
};
function Banner({
  tone = "info",
  title,
  children,
  icon,
  onClose,
  className = "",
  ...rest
}) {
  ensure("yc-banner-css", CSS);
  return /*#__PURE__*/React.createElement("div", _extends({
    className: ["yc-banner", `yc-banner--${tone}`, className].filter(Boolean).join(" "),
    role: "status"
  }, rest), /*#__PURE__*/React.createElement("span", {
    className: "yc-banner__icon"
  }, icon || /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.6",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, ICONS[tone] || ICONS.info)), /*#__PURE__*/React.createElement("div", {
    className: "yc-banner__body"
  }, title ? /*#__PURE__*/React.createElement("span", {
    className: "yc-banner__title"
  }, title) : null, children ? /*#__PURE__*/React.createElement("span", {
    className: "yc-banner__msg"
  }, children) : null), onClose ? /*#__PURE__*/React.createElement("button", {
    className: "yc-banner__close",
    onClick: onClose,
    "aria-label": "Dismiss"
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M6 6l12 12M18 6L6 18"
  }))) : null);
}
Object.assign(__ds_scope, { Banner });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Banner.jsx", error: String((e && e.message) || e) }); }

// components/forms/Checkbox.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
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
  el.id = id;
  el.textContent = css;
  document.head.appendChild(el);
}
function Checkbox({
  checked,
  defaultChecked,
  onChange,
  label,
  disabled,
  radio = false,
  name,
  value,
  ...rest
}) {
  ensure("yc-check-css", CSS);
  return /*#__PURE__*/React.createElement("label", {
    className: "yc-check" + (radio ? " yc-check--radio" : "") + (disabled ? " yc-check--disabled" : "")
  }, /*#__PURE__*/React.createElement("input", _extends({
    type: radio ? "radio" : "checkbox",
    checked: checked,
    defaultChecked: defaultChecked,
    onChange: onChange,
    disabled: disabled,
    name: name,
    value: value
  }, rest)), /*#__PURE__*/React.createElement("span", {
    className: "yc-check__box"
  }, radio ? /*#__PURE__*/React.createElement("span", {
    className: "yc-check__dot"
  }) : /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 24 24"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M5 13l4 4L19 7"
  }))), label ? /*#__PURE__*/React.createElement("span", {
    className: "yc-check__label"
  }, label) : null);
}
Object.assign(__ds_scope, { Checkbox });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Checkbox.jsx", error: String((e && e.message) || e) }); }

// components/forms/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
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
  el.id = id;
  el.textContent = css;
  document.head.appendChild(el);
}
function Input({
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
  const inputCls = ["yc-input", icon ? "yc-input--with-icon" : "", error ? "yc-input--err" : "", className].filter(Boolean).join(" ");
  return /*#__PURE__*/React.createElement("div", {
    className: "yc-field"
  }, label ? /*#__PURE__*/React.createElement("label", {
    className: "yc-field__label",
    htmlFor: inputId
  }, label) : null, /*#__PURE__*/React.createElement("div", {
    className: "yc-input-wrap"
  }, icon ? /*#__PURE__*/React.createElement("span", {
    className: "yc-input-wrap__icon"
  }, icon) : null, /*#__PURE__*/React.createElement("input", _extends({
    id: inputId,
    className: inputCls,
    "aria-invalid": !!error
  }, rest))), error ? /*#__PURE__*/React.createElement("span", {
    className: "yc-field__hint yc-field__hint--err"
  }, error) : hint ? /*#__PURE__*/React.createElement("span", {
    className: "yc-field__hint"
  }, hint) : null);
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Input.jsx", error: String((e && e.message) || e) }); }

// components/forms/Select.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
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
  el.id = id;
  el.textContent = css;
  document.head.appendChild(el);
}
function Select({
  label,
  options = [],
  placeholder,
  id,
  className = "",
  children,
  ...rest
}) {
  ensure("yc-select-css", CSS);
  const selId = id || (label ? `yc-${label.replace(/\s+/g, "-").toLowerCase()}` : undefined);
  return /*#__PURE__*/React.createElement("div", {
    className: "yc-select-field"
  }, label ? /*#__PURE__*/React.createElement("label", {
    className: "yc-select-field__label",
    htmlFor: selId
  }, label) : null, /*#__PURE__*/React.createElement("div", {
    className: "yc-select-wrap"
  }, /*#__PURE__*/React.createElement("select", _extends({
    id: selId,
    className: "yc-select " + className
  }, rest), placeholder ? /*#__PURE__*/React.createElement("option", {
    value: "",
    disabled: true
  }, placeholder) : null, children, options.map(o => {
    const opt = typeof o === "string" ? {
      value: o,
      label: o
    } : o;
    return /*#__PURE__*/React.createElement("option", {
      key: opt.value,
      value: opt.value
    }, opt.label);
  })), /*#__PURE__*/React.createElement("span", {
    className: "yc-select-wrap__chev"
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "3",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M6 9l6 6 6-6"
  })))));
}
Object.assign(__ds_scope, { Select });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Select.jsx", error: String((e && e.message) || e) }); }

// components/forms/Switch.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
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
  el.id = id;
  el.textContent = css;
  document.head.appendChild(el);
}
function Switch({
  checked,
  defaultChecked,
  onChange,
  label,
  disabled,
  ...rest
}) {
  ensure("yc-switch-css", CSS);
  return /*#__PURE__*/React.createElement("label", {
    className: "yc-switch" + (disabled ? " yc-switch--disabled" : "")
  }, /*#__PURE__*/React.createElement("input", _extends({
    type: "checkbox",
    checked: checked,
    defaultChecked: defaultChecked,
    onChange: onChange,
    disabled: disabled
  }, rest)), /*#__PURE__*/React.createElement("span", {
    className: "yc-switch__track"
  }, /*#__PURE__*/React.createElement("span", {
    className: "yc-switch__thumb"
  })), label ? /*#__PURE__*/React.createElement("span", null, label) : null);
}
Object.assign(__ds_scope, { Switch });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Switch.jsx", error: String((e && e.message) || e) }); }

// components/navigation/Tabs.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const CSS = `
.yc-tabs { display: inline-flex; gap: 4px; padding: 5px; background: var(--cream-200); border: 2.5px solid var(--royal-500); border-radius: var(--radius-pill); }
.yc-tab {
  font-family: var(--font-display); font-weight: 600; font-size: var(--fs-sm);
  color: var(--royal-600);
  background: transparent; border: none; cursor: pointer;
  padding: 8px 18px; border-radius: var(--radius-pill);
  display: inline-flex; align-items: center; gap: 7px;
  transition: background var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out), transform var(--dur-fast) var(--ease-bounce);
  -webkit-tap-highlight-color: transparent; white-space: nowrap;
}
.yc-tab svg { width: 16px; height: 16px; }
.yc-tab:hover { color: var(--royal-800); }
.yc-tab--active { background: var(--sky-500); color: #fff; box-shadow: 0 3px 0 var(--royal-600), var(--gloss-top); }
.yc-tab--active:hover { color: #fff; }
.yc-tab:focus-visible { outline: none; box-shadow: var(--ring-focus); }
.yc-tab__count { font-family: var(--font-body); font-weight: 800; font-size: 11px; background: rgba(7,61,114,.12); padding: 1px 7px; border-radius: 999px; }
.yc-tab--active .yc-tab__count { background: rgba(255,255,255,.28); }
`;
function ensure(id, css) {
  if (typeof document === "undefined") return;
  if (document.getElementById(id)) return;
  const el = document.createElement("style");
  el.id = id;
  el.textContent = css;
  document.head.appendChild(el);
}
function Tabs({
  tabs = [],
  value,
  onChange,
  className = "",
  ...rest
}) {
  ensure("yc-tabs-css", CSS);
  return /*#__PURE__*/React.createElement("div", _extends({
    className: "yc-tabs " + className,
    role: "tablist"
  }, rest), tabs.map(t => {
    const tab = typeof t === "string" ? {
      value: t,
      label: t
    } : t;
    const active = tab.value === value;
    return /*#__PURE__*/React.createElement("button", {
      key: tab.value,
      role: "tab",
      "aria-selected": active,
      className: "yc-tab" + (active ? " yc-tab--active" : ""),
      onClick: () => onChange && onChange(tab.value)
    }, tab.icon ? tab.icon : null, tab.label, tab.count != null ? /*#__PURE__*/React.createElement("span", {
      className: "yc-tab__count"
    }, tab.count) : null);
  }));
}
Object.assign(__ds_scope, { Tabs });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/Tabs.jsx", error: String((e && e.message) || e) }); }

// components/surfaces/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
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
  el.id = id;
  el.textContent = css;
  document.head.appendChild(el);
}
function Card({
  variant = "default",
  interactive = false,
  className = "",
  children,
  ...rest
}) {
  ensure("yc-card-css", CSS);
  const cls = ["yc-card", variant === "flat" ? "yc-card--flat" : "", variant === "soft" ? "yc-card--soft" : "", interactive ? "yc-card--interactive" : "", className].filter(Boolean).join(" ");
  return /*#__PURE__*/React.createElement("div", _extends({
    className: cls
  }, rest), children);
}
function CardMedia({
  src,
  alt = "",
  height = 160,
  tag,
  fav,
  children,
  style,
  ...rest
}) {
  ensure("yc-card-css", CSS);
  return /*#__PURE__*/React.createElement("div", _extends({
    className: "yc-card__media",
    style: {
      height,
      ...style
    }
  }, rest), src ? /*#__PURE__*/React.createElement("img", {
    src: src,
    alt: alt
  }) : children, tag ? /*#__PURE__*/React.createElement("span", {
    className: "yc-card__media-tag"
  }, tag) : null, fav ? /*#__PURE__*/React.createElement("span", {
    className: "yc-card__media-fav"
  }, fav) : null);
}
function CardBody({
  title,
  subtitle,
  className = "",
  children,
  ...rest
}) {
  ensure("yc-card-css", CSS);
  return /*#__PURE__*/React.createElement("div", _extends({
    className: "yc-card__body " + className
  }, rest), title ? /*#__PURE__*/React.createElement("h3", {
    className: "yc-card__title"
  }, title) : null, subtitle ? /*#__PURE__*/React.createElement("p", {
    className: "yc-card__sub"
  }, subtitle) : null, children);
}
function CardFooter({
  className = "",
  children,
  ...rest
}) {
  ensure("yc-card-css", CSS);
  return /*#__PURE__*/React.createElement("div", _extends({
    className: "yc-card__footer " + className
  }, rest), children);
}
Object.assign(__ds_scope, { Card, CardMedia, CardBody, CardFooter });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/surfaces/Card.jsx", error: String((e && e.message) || e) }); }

// components/surfaces/ProgressMeter.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const CSS = `
.yc-progress { display: flex; flex-direction: column; gap: 6px; font-family: var(--font-body); }
.yc-progress__top { display: flex; justify-content: space-between; align-items: baseline; }
.yc-progress__label { font-family: var(--font-display); font-weight: 600; font-size: var(--fs-sm); color: var(--royal-700); }
.yc-progress__val { font-family: var(--font-display); font-weight: 600; font-size: var(--fs-sm); color: var(--sky-600); }
.yc-progress__track {
  height: 16px; border-radius: var(--radius-pill);
  background: var(--cream-300); border: 2.5px solid var(--royal-600);
  overflow: hidden; box-shadow: inset 0 2px 3px rgba(7,61,114,.18);
}
.yc-progress__fill {
  height: 100%; border-radius: var(--radius-pill);
  background: var(--grad-sky);
  box-shadow: var(--gloss-top);
  transition: width var(--dur-slow) var(--ease-out);
}
.yc-progress--sun .yc-progress__fill { background: var(--grad-sunset); }
.yc-progress--meadow .yc-progress__fill { background: linear-gradient(180deg,#7fd08a,#46b25e); }
.yc-progress--aqua .yc-progress__fill { background: var(--grad-aqua); }
`;
function ensure(id, css) {
  if (typeof document === "undefined") return;
  if (document.getElementById(id)) return;
  const el = document.createElement("style");
  el.id = id;
  el.textContent = css;
  document.head.appendChild(el);
}
function ProgressMeter({
  value = 0,
  max = 100,
  label,
  showValue = true,
  valueText,
  tone = "sky",
  className = "",
  ...rest
}) {
  ensure("yc-progress-css", CSS);
  const pct = Math.max(0, Math.min(100, value / max * 100));
  return /*#__PURE__*/React.createElement("div", _extends({
    className: ["yc-progress", `yc-progress--${tone}`, className].filter(Boolean).join(" ")
  }, rest), (label || showValue) && /*#__PURE__*/React.createElement("div", {
    className: "yc-progress__top"
  }, label ? /*#__PURE__*/React.createElement("span", {
    className: "yc-progress__label"
  }, label) : /*#__PURE__*/React.createElement("span", null), showValue ? /*#__PURE__*/React.createElement("span", {
    className: "yc-progress__val"
  }, valueText || `${Math.round(pct)}%`) : null), /*#__PURE__*/React.createElement("div", {
    className: "yc-progress__track",
    role: "progressbar",
    "aria-valuenow": value,
    "aria-valuemax": max
  }, /*#__PURE__*/React.createElement("div", {
    className: "yc-progress__fill",
    style: {
      width: `${pct}%`
    }
  })));
}
Object.assign(__ds_scope, { ProgressMeter });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/surfaces/ProgressMeter.jsx", error: String((e && e.message) || e) }); }

// components/surfaces/Stat.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const CSS = `
.yc-stat {
  display: flex; flex-direction: column; gap: 2px;
  font-family: var(--font-body);
  background: var(--surface-card);
  border: 2.5px solid var(--royal-500);
  border-radius: var(--radius-lg);
  padding: var(--space-4) var(--space-5);
  box-shadow: 0 5px 0 var(--cream-300);
  min-width: 120px;
}
.yc-stat__icon { display: inline-grid; place-items: center; width: 38px; height: 38px; border-radius: var(--radius-md); margin-bottom: 6px; color: #fff; }
.yc-stat__icon svg { width: 20px; height: 20px; }
.yc-stat__value { font-family: var(--font-display); font-weight: 600; font-size: 2rem; line-height: 1; color: var(--royal-800); }
.yc-stat__label { font-weight: 800; font-size: var(--fs-sm); color: var(--text-muted); }
.yc-stat--sky .yc-stat__icon { background: var(--sky-500); }
.yc-stat--sun .yc-stat__icon { background: var(--sun-400); color: var(--royal-800); }
.yc-stat--meadow .yc-stat__icon { background: var(--meadow-400); }
.yc-stat--coral .yc-stat__icon { background: var(--coral-400); }
`;
function ensure(id, css) {
  if (typeof document === "undefined") return;
  if (document.getElementById(id)) return;
  const el = document.createElement("style");
  el.id = id;
  el.textContent = css;
  document.head.appendChild(el);
}
function Stat({
  value,
  label,
  icon = null,
  tone = "sky",
  className = "",
  ...rest
}) {
  ensure("yc-stat-css", CSS);
  return /*#__PURE__*/React.createElement("div", _extends({
    className: ["yc-stat", `yc-stat--${tone}`, className].filter(Boolean).join(" ")
  }, rest), icon ? /*#__PURE__*/React.createElement("span", {
    className: "yc-stat__icon"
  }, icon) : null, /*#__PURE__*/React.createElement("span", {
    className: "yc-stat__value"
  }, value), /*#__PURE__*/React.createElement("span", {
    className: "yc-stat__label"
  }, label));
}
Object.assign(__ds_scope, { Stat });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/surfaces/Stat.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/AppShell.jsx
try { (() => {
// App chrome: left rail + top bar. Children render in the content area.
function NavItem({
  icon,
  label,
  active,
  onClick
}) {
  return /*#__PURE__*/React.createElement("button", {
    onClick: onClick,
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      width: "100%",
      padding: "11px 14px",
      borderRadius: "var(--radius-md)",
      cursor: "pointer",
      border: "2.5px solid " + (active ? "var(--royal-600)" : "transparent"),
      background: active ? "var(--sky-500)" : "transparent",
      color: active ? "#fff" : "var(--royal-600)",
      boxShadow: active ? "0 4px 0 var(--royal-600), var(--gloss-top)" : "none",
      fontFamily: "var(--font-display)",
      fontWeight: 600,
      fontSize: 15,
      transition: "all .15s var(--ease-bounce)"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: icon,
    size: 20
  }), label);
}
function AppShell({
  nav = "home",
  onNav,
  children
}) {
  const D = window.YC_DATA;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      minHeight: "100%",
      background: "var(--cream-100)",
      fontFamily: "var(--font-body)"
    }
  }, /*#__PURE__*/React.createElement("aside", {
    style: {
      width: 248,
      flex: "none",
      background: "var(--cream-50)",
      borderRight: "2.5px solid var(--sand-200)",
      padding: 20,
      display: "flex",
      flexDirection: "column",
      gap: 24,
      position: "sticky",
      top: 0,
      alignSelf: "flex-start",
      height: "100vh"
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/brand/yaycay-logo-transparent.png",
    alt: "Yaycay",
    style: {
      width: 140,
      marginLeft: 4
    }
  }), /*#__PURE__*/React.createElement("nav", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 6
    }
  }, /*#__PURE__*/React.createElement(NavItem, {
    icon: "home",
    label: "Home",
    active: nav === "home",
    onClick: () => onNav && onNav("home")
  }), /*#__PURE__*/React.createElement(NavItem, {
    icon: "compass",
    label: "Explore",
    active: nav === "explore",
    onClick: () => onNav && onNav("explore")
  }), /*#__PURE__*/React.createElement(NavItem, {
    icon: "map",
    label: "My trips",
    active: nav === "trips",
    onClick: () => onNav && onNav("trips")
  }), /*#__PURE__*/React.createElement(NavItem, {
    icon: "coin",
    label: "Budgets",
    active: nav === "budget",
    onClick: () => onNav && onNav("budget")
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: "auto",
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: 10,
      background: "var(--cream-200)",
      borderRadius: "var(--radius-lg)"
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    name: D.user.name,
    tone: "sky",
    size: 38
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      lineHeight: 1.2
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: 600,
      color: "var(--royal-800)",
      fontSize: 14
    }
  }, D.user.name), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 700,
      color: "var(--text-muted)"
    }
  }, "Family plan")))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0,
      display: "flex",
      flexDirection: "column"
    }
  }, /*#__PURE__*/React.createElement("header", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 16,
      padding: "16px 28px",
      borderBottom: "2.5px solid var(--sand-200)",
      background: "var(--cream-50)",
      position: "sticky",
      top: 0,
      zIndex: 5
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      flex: 1,
      maxWidth: 420,
      background: "#fff",
      border: "2.5px solid var(--sand-300)",
      borderRadius: "var(--radius-pill)",
      padding: "9px 16px",
      color: "var(--sand-400)"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "search",
    size: 18
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 700,
      fontSize: 14,
      whiteSpace: "nowrap"
    }
  }, "Search trips & places\u2026")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginLeft: "auto",
      display: "flex",
      alignItems: "center",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(IconButton, {
    label: "Notifications",
    variant: "secondary"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "bell",
    size: 18
  })), /*#__PURE__*/React.createElement(Button, {
    variant: "cta",
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "plus",
      size: 18
    }),
    onClick: () => onNav && onNav("new")
  }, "Start a trip"))), /*#__PURE__*/React.createElement("main", {
    style: {
      padding: "28px 28px 48px",
      flex: 1
    }
  }, children)));
}
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/AppShell.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/NewTripSheet.jsx
try { (() => {
// "Start a trip" modal sheet.
function NewTripSheet({
  onClose,
  onCreate
}) {
  const [name, setName] = React.useState("");
  const [pace, setPace] = React.useState("relaxed");
  return /*#__PURE__*/React.createElement("div", {
    onClick: onClose,
    style: {
      position: "fixed",
      inset: 0,
      background: "var(--surface-overlay)",
      backdropFilter: "blur(3px)",
      display: "grid",
      placeItems: "center",
      zIndex: 50,
      padding: 24
    }
  }, /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      width: 480,
      maxWidth: "100%",
      background: "var(--cream-100)",
      border: "3px solid var(--royal-600)",
      borderRadius: "var(--radius-2xl)",
      boxShadow: "var(--shadow-xl)",
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative"
    }
  }, /*#__PURE__*/React.createElement(Scene, {
    variant: "sky",
    height: 108
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      inset: 0,
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      gap: 4,
      paddingLeft: 24
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      color: "#fff",
      textShadow: "0 2px 8px rgba(4,34,63,.35)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "yc-eyebrow"
  }, "New adventure"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: 600,
      fontSize: 26,
      lineHeight: 1,
      whiteSpace: "nowrap"
    }
  }, "Start a trip"))), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      right: 14,
      top: 14
    }
  }, /*#__PURE__*/React.createElement(IconButton, {
    label: "Close",
    variant: "secondary",
    size: "sm",
    onClick: onClose
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 24 24",
    width: "16",
    height: "16",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "3",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M6 6l12 12M18 6L6 18"
  }))))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 24,
      display: "flex",
      flexDirection: "column",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(Input, {
    label: "Where are you off to?",
    placeholder: "e.g. Sicily, Italy",
    value: name,
    onChange: e => setName(e.target.value),
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "map",
      size: 18
    })
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 14
    }
  }, /*#__PURE__*/React.createElement(Input, {
    label: "From",
    placeholder: "Jul 12"
  }), /*#__PURE__*/React.createElement(Input, {
    label: "To",
    placeholder: "Jul 19"
  })), /*#__PURE__*/React.createElement(Select, {
    label: "Who's coming?",
    options: ["Just us two", "Family of 4", "Big group"],
    defaultValue: "Family of 4"
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: 600,
      fontSize: 14,
      color: "var(--royal-700)",
      marginBottom: 8
    }
  }, "Trip pace"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 18
    }
  }, /*#__PURE__*/React.createElement(Checkbox, {
    radio: true,
    name: "pace",
    label: "Relaxed",
    checked: pace === "relaxed",
    onChange: () => setPace("relaxed")
  }), /*#__PURE__*/React.createElement(Checkbox, {
    radio: true,
    name: "pace",
    label: "Action-packed",
    checked: pace === "action",
    onChange: () => setPace("action")
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 12,
      marginTop: 4
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    onClick: onClose
  }, "Maybe later"), /*#__PURE__*/React.createElement(Button, {
    variant: "cta",
    block: true,
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "plane",
      size: 18
    }),
    onClick: () => onCreate(name || "New trip")
  }, "Create trip")))));
}
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/NewTripSheet.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/TripPlanner.jsx
try { (() => {
// Single-trip planner: header, tabs, day-by-day plan, packing & budget views.
function PlanItem({
  item
}) {
  const tone = KIND_TONE[item.kind] || "sky";
  const toneColor = {
    sky: "var(--sky-500)",
    sun: "var(--sun-400)",
    aqua: "var(--aqua-400)",
    meadow: "var(--meadow-400)"
  }[tone];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 14,
      padding: "12px 14px",
      background: "#fff",
      border: "2.5px solid var(--sand-200)",
      borderRadius: "var(--radius-lg)",
      boxShadow: "var(--shadow-sm)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 42,
      height: 42,
      flex: "none",
      borderRadius: "var(--radius-md)",
      background: toneColor,
      color: tone === "sun" ? "var(--royal-800)" : "#fff",
      display: "grid",
      placeItems: "center",
      boxShadow: "var(--gloss-top)"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: KIND_ICON[item.kind],
    size: 20
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: 600,
      color: "var(--royal-800)",
      fontSize: 16
    }
  }, item.title), /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 800,
      color: "var(--text-muted)",
      fontSize: 13
    }
  }, item.time)), /*#__PURE__*/React.createElement(IconButton, {
    label: "Edit",
    variant: "ghost",
    size: "sm"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "chevL",
    size: 18,
    style: {
      transform: "scaleX(-1)"
    }
  })));
}
function DayPlan() {
  const D = window.YC_DATA;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 22
    }
  }, D.plan.map((day, di) => /*#__PURE__*/React.createElement("div", {
    key: di
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement(Badge, {
    tone: di === 0 ? "sky" : "soft"
  }, `Day ${di + 1}`), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: 600,
      color: "var(--royal-800)",
      fontSize: 18
    }
  }, day.label), /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 800,
      color: "var(--text-muted)",
      fontSize: 13
    }
  }, day.day)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 10,
      paddingLeft: 6,
      borderLeft: "3px dashed var(--sand-300)",
      marginLeft: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      paddingLeft: 14,
      display: "flex",
      flexDirection: "column",
      gap: 10
    }
  }, day.items.map((it, ii) => /*#__PURE__*/React.createElement(PlanItem, {
    key: ii,
    item: it
  })), /*#__PURE__*/React.createElement("button", {
    style: {
      alignSelf: "flex-start",
      marginLeft: 0,
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      background: "transparent",
      border: "2.5px dashed var(--sky-300)",
      color: "var(--sky-600)",
      fontFamily: "var(--font-display)",
      fontWeight: 600,
      padding: "9px 16px",
      borderRadius: "var(--radius-pill)",
      cursor: "pointer"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "plus",
    size: 16
  }), " Add to this day"))))));
}
function Packing() {
  const D = window.YC_DATA;
  const [checked, setChecked] = React.useState({});
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 20
    }
  }, D.packing.map((grp, gi) => /*#__PURE__*/React.createElement(Card, {
    key: gi,
    variant: "soft"
  }, /*#__PURE__*/React.createElement(CardBody, {
    title: grp.group
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 12,
      marginTop: 6
    }
  }, grp.items.map((it, ii) => {
    const key = gi + "-" + ii;
    return /*#__PURE__*/React.createElement(Checkbox, {
      key: ii,
      label: it,
      checked: !!checked[key],
      onChange: () => setChecked(c => ({
        ...c,
        [key]: !c[key]
      }))
    });
  }))))));
}
function Budget({
  trip
}) {
  const rows = [{
    label: "Flights",
    tone: "sky",
    spent: 640
  }, {
    label: "Stay",
    tone: "aqua",
    spent: 520
  }, {
    label: "Food & treats",
    tone: "sun",
    spent: 180
  }, {
    label: "Days out",
    tone: "meadow",
    spent: 60
  }];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 560,
      display: "flex",
      flexDirection: "column",
      gap: 18
    }
  }, /*#__PURE__*/React.createElement(Card, {
    variant: "soft"
  }, /*#__PURE__*/React.createElement(CardBody, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "baseline"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: 600,
      fontSize: 18,
      color: "var(--royal-800)"
    }
  }, "Trip budget"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: 600,
      fontSize: 22,
      color: "var(--sky-600)"
    }
  }, "\xA3", trip.budget.spent, " ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--text-muted)",
      fontSize: 15
    }
  }, "/ \xA3", trip.budget.total))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 12
    }
  }, /*#__PURE__*/React.createElement(ProgressMeter, {
    value: trip.budget.spent,
    max: trip.budget.total,
    tone: "meadow",
    showValue: false
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 12
    }
  }, rows.map((r, i) => /*#__PURE__*/React.createElement(ProgressMeter, {
    key: i,
    value: r.spent,
    max: trip.budget.total,
    tone: r.tone,
    label: r.label,
    valueText: `£${r.spent}`
  }))));
}
function TripPlanner({
  trip,
  onBack
}) {
  const [tab, setTab] = React.useState("plan");
  return /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 880,
      margin: "0 auto",
      display: "flex",
      flexDirection: "column",
      gap: 22
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onBack,
    style: {
      alignSelf: "flex-start",
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      background: "transparent",
      border: "none",
      color: "var(--sky-600)",
      fontFamily: "var(--font-display)",
      fontWeight: 600,
      fontSize: 15,
      cursor: "pointer"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "chevL",
    size: 18
  }), " All trips"), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      overflow: "hidden",
      borderRadius: "var(--radius-2xl)",
      border: "3px solid var(--royal-600)",
      boxShadow: "var(--card-lift)"
    }
  }, /*#__PURE__*/React.createElement(Scene, {
    variant: trip.scene,
    height: 184
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: 30,
      right: 30,
      bottom: 20,
      color: "#fff",
      textShadow: "0 2px 8px rgba(4,34,63,.35)",
      display: "flex",
      flexDirection: "column",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "yc-eyebrow"
  }, trip.where), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: 600,
      fontSize: 32,
      lineHeight: 1.08
    }
  }, trip.title), /*#__PURE__*/React.createElement("span", {
    style: {
      alignSelf: "flex-start",
      fontWeight: 800,
      fontSize: 14,
      whiteSpace: "nowrap",
      background: "rgba(4,34,63,.28)",
      padding: "5px 13px",
      borderRadius: "var(--radius-pill)"
    }
  }, trip.dates)), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      right: 24,
      top: 20,
      display: "flex",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(IconButton, {
    label: "Share",
    variant: "secondary"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "share",
    size: 18
  })), /*#__PURE__*/React.createElement(Badge, {
    tone: "ink"
  }, trip.sleeps, " sleeps to go"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(Tabs, {
    value: tab,
    onChange: setTab,
    tabs: [{
      value: "plan",
      label: "Day plan",
      icon: /*#__PURE__*/React.createElement(Icon, {
        name: "calendar",
        size: 16
      })
    }, {
      value: "pack",
      label: "Packing",
      icon: /*#__PURE__*/React.createElement(Icon, {
        name: "bag",
        size: 16
      })
    }, {
      value: "budget",
      label: "Budget",
      icon: /*#__PURE__*/React.createElement(Icon, {
        name: "coin",
        size: 16
      })
    }]
  }), /*#__PURE__*/React.createElement(Button, {
    variant: "cta",
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "plus",
      size: 18
    })
  }, "Add a day")), tab === "plan" && /*#__PURE__*/React.createElement(DayPlan, null), tab === "pack" && /*#__PURE__*/React.createElement(Packing, null), tab === "budget" && /*#__PURE__*/React.createElement(Budget, {
    trip: trip
  }));
}
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/TripPlanner.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/TripsHome.jsx
try { (() => {
// Home dashboard: greeting, next-trip countdown hero, trip card grid.
function TripCard({
  trip,
  onOpen
}) {
  const crew = trip.crew;
  return /*#__PURE__*/React.createElement(Card, {
    interactive: true,
    onClick: () => onOpen(trip),
    style: {
      width: "100%"
    }
  }, /*#__PURE__*/React.createElement(CardMedia, {
    height: 150,
    tag: /*#__PURE__*/React.createElement(Badge, {
      tone: trip.scene === "sunset" ? "sun" : trip.scene === "meadow" ? "meadow" : "sky"
    }, trip.tag),
    fav: /*#__PURE__*/React.createElement(Badge, {
      tone: "ink"
    }, trip.sleeps, " sleeps")
  }, /*#__PURE__*/React.createElement(Scene, {
    variant: trip.scene,
    height: 150
  })), /*#__PURE__*/React.createElement(CardBody, {
    title: trip.title,
    subtitle: `${trip.where} · ${trip.dates}`
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 8
    }
  }, /*#__PURE__*/React.createElement(ProgressMeter, {
    value: trip.planned,
    max: trip.days,
    tone: "sky",
    label: "Day plan",
    valueText: `${trip.planned} of ${trip.days} days`
  }))), /*#__PURE__*/React.createElement(CardFooter, null, /*#__PURE__*/React.createElement(AvatarGroup, null, crew.map((c, i) => /*#__PURE__*/React.createElement(Avatar, {
    key: i,
    name: c.name,
    tone: c.tone,
    size: 34
  }))), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: 600,
      color: "var(--sky-600)",
      display: "inline-flex",
      alignItems: "center",
      gap: 4
    }
  }, "Open ", /*#__PURE__*/React.createElement(Icon, {
    name: "chevL",
    size: 16,
    style: {
      transform: "scaleX(-1)"
    }
  }))));
}
function TripsHome({
  onOpen
}) {
  const D = window.YC_DATA;
  const next = D.trips[0];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1040,
      margin: "0 auto",
      display: "flex",
      flexDirection: "column",
      gap: 28
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "yc-eyebrow",
    style: {
      color: "var(--sky-600)"
    }
  }, "For families making memories"), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontSize: 38,
      margin: "4px 0 0"
    }
  }, "Hey Jo \u2014 let's plan the next adventure")), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      overflow: "hidden",
      borderRadius: "var(--radius-2xl)",
      border: "3px solid var(--royal-600)",
      boxShadow: "var(--card-lift)"
    }
  }, /*#__PURE__*/React.createElement(Scene, {
    variant: "sunset",
    height: 234
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      inset: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 24,
      padding: "0 38px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      color: "#fff",
      textShadow: "0 2px 8px rgba(4,34,63,.35)",
      flex: "1 1 auto",
      minWidth: 0,
      display: "flex",
      flexDirection: "column",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "yc-eyebrow"
  }, "Next up \xB7 ", next.where), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: 600,
      fontSize: 30,
      lineHeight: 1.1
    }
  }, next.title), /*#__PURE__*/React.createElement("span", {
    style: {
      alignSelf: "flex-start",
      fontWeight: 800,
      fontSize: 14,
      whiteSpace: "nowrap",
      background: "rgba(4,34,63,.28)",
      padding: "5px 13px",
      borderRadius: "var(--radius-pill)"
    }
  }, next.dates)), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "var(--cream-50)",
      border: "3px solid var(--royal-600)",
      borderRadius: "var(--radius-xl)",
      padding: "16px 22px",
      textAlign: "center",
      boxShadow: "0 6px 0 var(--royal-700)",
      flex: "none"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: 600,
      fontSize: 48,
      lineHeight: 1,
      color: "var(--royal-800)"
    }
  }, next.sleeps), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: 600,
      fontSize: 13,
      color: "var(--sun-500)",
      letterSpacing: ".04em",
      whiteSpace: "nowrap"
    }
  }, "SLEEPS TO GO"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 12
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "sm",
    onClick: () => onOpen(next)
  }, "Open plan"))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between"
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      fontSize: 26
    }
  }, "Your trips"), /*#__PURE__*/React.createElement(Tag, {
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "plus",
      size: 16
    }),
    onClick: () => {}
  }, "New trip")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
      gap: 22
    }
  }, D.trips.map(t => /*#__PURE__*/React.createElement(TripCard, {
    key: t.id,
    trip: t,
    onOpen: onOpen
  }))));
}
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/TripsHome.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/data.js
try { (() => {
// Fake data for the Yaycay trip-planner UI kit.
window.YC_DATA = {
  user: {
    name: "Jo Ross",
    initials: "JO"
  },
  trips: [{
    id: "sicily",
    title: "Sicily with the kids",
    where: "Taormina, Italy",
    dates: "Jul 12 – 19",
    sleeps: 12,
    scene: "sunset",
    tag: "Beach",
    days: 7,
    planned: 3,
    packing: 0.4,
    budget: {
      spent: 1400,
      total: 2000
    },
    crew: [{
      name: "Jo Ross",
      tone: "sky"
    }, {
      name: "Mia Ross",
      tone: "sun"
    }, {
      name: "Theo Ross",
      tone: "aqua"
    }]
  }, {
    id: "lakes",
    title: "Lake District escape",
    where: "Windermere, UK",
    dates: "Aug 24 – 27",
    sleeps: 55,
    scene: "meadow",
    tag: "Outdoors",
    days: 3,
    planned: 1,
    packing: 0.1,
    budget: {
      spent: 220,
      total: 900
    },
    crew: [{
      name: "Jo Ross",
      tone: "sky"
    }, {
      name: "Sam Ross",
      tone: "coral"
    }]
  }, {
    id: "lisbon",
    title: "Lisbon long weekend",
    where: "Lisbon, Portugal",
    dates: "Oct 3 – 6",
    sleeps: 95,
    scene: "sky",
    tag: "City",
    days: 3,
    planned: 0,
    packing: 0,
    budget: {
      spent: 0,
      total: 1200
    },
    crew: [{
      name: "Jo Ross",
      tone: "sky"
    }]
  }],
  // day plan for the Sicily trip
  plan: [{
    day: "Sat 12 Jul",
    label: "Arrive & settle in",
    items: [{
      time: "14:00",
      title: "Land at Catania",
      kind: "travel"
    }, {
      time: "16:30",
      title: "Check in — Casa Limone",
      kind: "stay"
    }, {
      time: "19:00",
      title: "Pizza on the piazza",
      kind: "food"
    }]
  }, {
    day: "Sun 13 Jul",
    label: "Beach day",
    items: [{
      time: "10:00",
      title: "Isola Bella beach",
      kind: "play"
    }, {
      time: "13:00",
      title: "Gelato stop",
      kind: "food"
    }, {
      time: "17:00",
      title: "Rock pools with the kids",
      kind: "play"
    }]
  }, {
    day: "Mon 14 Jul",
    label: "Mount Etna",
    items: [{
      time: "08:30",
      title: "Cable car up Etna",
      kind: "play"
    }, {
      time: "12:00",
      title: "Picnic at the craters",
      kind: "food"
    }]
  }],
  packing: [{
    group: "Everyone",
    items: ["Passports", "Sun cream", "Reusable bottles", "Travel adapters"]
  }, {
    group: "Kids",
    items: ["Swim things", "Buckets & spades", "Tablet + headphones", "Snacks"]
  }]
};
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/data.js", error: String((e && e.message) || e) }); }

// ui_kits/app/shared.jsx
try { (() => {
// Shared bits for the Yaycay app kit: brand scene tiles, icons, app chrome.
const SCENE_GRAD = {
  sunset: "var(--grad-sunset)",
  meadow: "linear-gradient(180deg,#8fd8e8 0%,#bfe6a8 55%,#7fd08a 100%)",
  sky: "var(--grad-sky)",
  aqua: "var(--grad-aqua)"
};
function Scene({
  variant = "sky",
  height = 150,
  children,
  round = 0,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      height,
      width: "100%",
      overflow: "hidden",
      background: SCENE_GRAD[variant] || SCENE_GRAD.sky,
      borderRadius: round,
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      width: 86,
      height: 26,
      top: 20,
      left: 22,
      background: "var(--cream-50)",
      borderRadius: 999,
      opacity: .92,
      boxShadow: "32px -9px 0 -4px var(--cream-50)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      width: 58,
      height: 18,
      top: 38,
      right: 26,
      background: "var(--cream-50)",
      borderRadius: 999,
      opacity: .85
    }
  }), variant === "sunset" && /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      width: 60,
      height: 60,
      bottom: -22,
      left: "50%",
      transform: "translateX(-50%)",
      background: "radial-gradient(circle, #fff3c4 0%, #ffd778 60%, transparent 72%)",
      borderRadius: 999
    }
  }), children);
}

// Inline Lucide-style icons (stroke 2.5 to match the brand)
const I = {
  plane: "M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z",
  bed: "M3 7v11M3 12h18v6M21 12V9a2 2 0 0 0-2-2h-7v5M7 11h.01",
  food: "M4 3v7a3 3 0 0 0 6 0V3M7 3v18M17 3c-1.5 0-3 1.5-3 5s1.5 4 3 4 3-1 3-4-1.5-5-3-5ZM17 16v5",
  play: "M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7Z|9 22h6",
  calendar: "M3 5h18v16H3zM3 9h18M8 3v4M16 3v4",
  bag: "M5 8h14l-1 12H6L5 8ZM9 8V6a3 3 0 0 1 6 0v2",
  coin: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18ZM12 7v10M9.5 9.5h4a1.5 1.5 0 0 1 0 3h-3a1.5 1.5 0 0 0 0 3h4",
  home: "M3 11l9-8 9 8M5 10v10h14V10",
  compass: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18ZM15.5 8.5l-2 5-5 2 2-5 5-2Z",
  plus: "M12 5v14M5 12h14",
  search: "M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14ZM20 20l-3.5-3.5",
  bell: "M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0",
  check: "M5 13l4 4L19 7",
  chevL: "M15 6l-6 6 6 6",
  star: "M12 3l2.6 5.3 5.9.9-4.2 4.1 1 5.8L12 16.9 6.7 19.2l1-5.8L3.5 9.2l5.9-.9z",
  map: "M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2ZM9 4v14M15 6v14",
  share: "M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M16 6l-4-4-4 4M12 2v13"
};
function Icon({
  name,
  size = 22,
  stroke = 2.5,
  fill = "none",
  style
}) {
  const paths = (I[name] || "").split("|");
  return /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 24 24",
    width: size,
    height: size,
    fill: fill,
    stroke: "currentColor",
    strokeWidth: stroke,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    style: {
      display: "block",
      ...style
    }
  }, paths.map((d, i) => /*#__PURE__*/React.createElement("path", {
    key: i,
    d: d
  })));
}
const KIND_ICON = {
  travel: "plane",
  stay: "bed",
  food: "food",
  play: "play"
};
const KIND_TONE = {
  travel: "sky",
  stay: "aqua",
  food: "sun",
  play: "meadow"
};
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/shared.jsx", error: String((e && e.message) || e) }); }

// ui_kits/web/Hero.jsx
try { (() => {
// Marketing site sections for Yaycay. Composes DS components + Scene/Icon helpers.

function SiteNav({
  onGetStarted
}) {
  const links = ["How it works", "Destinations", "Families", "Pricing"];
  return /*#__PURE__*/React.createElement("header", {
    style: {
      position: "sticky",
      top: 0,
      zIndex: 20,
      background: "rgba(251,247,236,.85)",
      backdropFilter: "blur(8px)",
      borderBottom: "2.5px solid var(--sand-200)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1180,
      margin: "0 auto",
      padding: "12px 28px",
      display: "flex",
      alignItems: "center",
      gap: 24
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/brand/yaycay-logo-transparent.png",
    alt: "Yaycay",
    style: {
      width: 118
    }
  }), /*#__PURE__*/React.createElement("nav", {
    style: {
      display: "flex",
      gap: 6,
      marginLeft: 12
    }
  }, links.map(l => /*#__PURE__*/React.createElement("a", {
    key: l,
    href: "#",
    style: {
      padding: "8px 14px",
      borderRadius: "var(--radius-pill)",
      color: "var(--royal-700)",
      fontFamily: "var(--font-display)",
      fontWeight: 500,
      fontSize: 15,
      textDecoration: "none"
    }
  }, l))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginLeft: "auto",
      display: "flex",
      alignItems: "center",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: "#",
    style: {
      color: "var(--royal-700)",
      fontFamily: "var(--font-display)",
      fontWeight: 600,
      fontSize: 15,
      textDecoration: "none"
    }
  }, "Log in"), /*#__PURE__*/React.createElement(Button, {
    variant: "cta",
    onClick: onGetStarted
  }, "Get started \u2014 free"))));
}
function FloatCard({
  scene,
  title,
  sub,
  tag,
  tagTone,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width: 230,
      background: "#fff",
      border: "3px solid var(--royal-600)",
      borderRadius: "var(--radius-xl)",
      boxShadow: "var(--shadow-lg)",
      overflow: "hidden",
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative"
    }
  }, /*#__PURE__*/React.createElement(Scene, {
    variant: scene,
    height: 92
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      top: 10,
      left: 10
    }
  }, /*#__PURE__*/React.createElement(Badge, {
    tone: tagTone
  }, tag))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "12px 14px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: 600,
      color: "var(--royal-800)",
      fontSize: 16
    }
  }, title), /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 800,
      color: "var(--text-muted)",
      fontSize: 12,
      marginTop: 2
    }
  }, sub)));
}
function Hero({
  onGetStarted
}) {
  return /*#__PURE__*/React.createElement("section", {
    style: {
      position: "relative",
      overflow: "hidden",
      background: "var(--grad-scene)",
      borderBottom: "3px solid var(--royal-600)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      width: 140,
      height: 42,
      top: 26,
      left: 150,
      background: "var(--cream-50)",
      borderRadius: 999,
      opacity: .9,
      boxShadow: "54px -16px 0 -6px var(--cream-50)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      width: 110,
      height: 34,
      top: 96,
      right: 220,
      background: "var(--cream-50)",
      borderRadius: 999,
      opacity: .8
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1180,
      margin: "0 auto",
      padding: "72px 28px 90px",
      display: "grid",
      gridTemplateColumns: "1.05fr .95fr",
      gap: 40,
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      whiteSpace: "nowrap",
      background: "rgba(255,255,255,.85)",
      border: "2.5px solid var(--royal-500)",
      borderRadius: "var(--radius-pill)",
      padding: "6px 14px",
      fontFamily: "var(--font-display)",
      fontWeight: 600,
      fontSize: 13,
      color: "var(--royal-700)",
      textTransform: "uppercase",
      letterSpacing: ".06em"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "star",
    size: 14
  }), " For families making memories"), /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: "20px 0 0",
      fontSize: 64,
      lineHeight: 1,
      color: "var(--cream-50)",
      WebkitTextStroke: "5px var(--royal-600)",
      paintOrder: "stroke fill",
      textShadow: "1px 1px 0 var(--royal-700),2px 2px 0 var(--royal-700),3px 3px 0 var(--royal-700),4px 4px 0 var(--royal-700),5px 7px 9px rgba(4,34,63,.4)"
    }
  }, "Plan the trip.", /*#__PURE__*/React.createElement("br", null), "Keep the yay."), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 19,
      fontWeight: 700,
      color: "var(--royal-800)",
      maxWidth: 440,
      marginTop: 22,
      lineHeight: 1.5
    }
  }, "Build the itinerary, split the packing list, and count down the sleeps \u2014 together. Yaycay turns trip admin into part of the fun."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 14,
      marginTop: 26,
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "cta",
    size: "lg",
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "plane",
      size: 20
    }),
    onClick: onGetStarted
  }, "Start planning free"), /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    size: "lg",
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "play",
      size: 18
    })
  }, "Watch the tour")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      marginTop: 22
    }
  }, /*#__PURE__*/React.createElement(AvatarGroup, null, /*#__PURE__*/React.createElement(Avatar, {
    name: "A B",
    tone: "sun",
    size: 34
  }), /*#__PURE__*/React.createElement(Avatar, {
    name: "C D",
    tone: "aqua",
    size: 34
  }), /*#__PURE__*/React.createElement(Avatar, {
    name: "E F",
    tone: "coral",
    size: 34
  }), /*#__PURE__*/React.createElement(Avatar, {
    name: "G H",
    tone: "sky",
    size: 34
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 800,
      color: "var(--royal-700)",
      fontSize: 14
    }
  }, "Loved by 200k+ families worldwide"))), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      height: 420
    }
  }, /*#__PURE__*/React.createElement(FloatCard, {
    scene: "sunset",
    tag: "Beach",
    tagTone: "sun",
    title: "Sicily with the kids",
    sub: "7 days \xB7 12 sleeps to go",
    style: {
      position: "absolute",
      top: 10,
      left: 30,
      transform: "rotate(-4deg)"
    }
  }), /*#__PURE__*/React.createElement(FloatCard, {
    scene: "sky",
    tag: "City",
    tagTone: "sky",
    title: "Lisbon weekend",
    sub: "3 days \xB7 planning",
    style: {
      position: "absolute",
      top: 150,
      right: 0,
      transform: "rotate(4deg)",
      zIndex: 3
    }
  }), /*#__PURE__*/React.createElement(FloatCard, {
    scene: "meadow",
    tag: "Outdoors",
    tagTone: "meadow",
    title: "Lake District",
    sub: "3 days \xB7 55 sleeps",
    style: {
      position: "absolute",
      bottom: 0,
      left: 60,
      transform: "rotate(2deg)",
      zIndex: 2
    }
  }))));
}
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/web/Hero.jsx", error: String((e && e.message) || e) }); }

// ui_kits/web/Sections.jsx
try { (() => {
// How-it-works steps, destinations showcase, testimonial, CTA band, footer.

function Section({
  children,
  style
}) {
  return /*#__PURE__*/React.createElement("section", {
    style: {
      maxWidth: 1180,
      margin: "0 auto",
      padding: "84px 28px",
      ...style
    }
  }, children);
}
function Eyebrow({
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: 600,
      fontSize: 14,
      letterSpacing: ".08em",
      textTransform: "uppercase",
      color: "var(--sky-600)"
    }
  }, children);
}
function HowItWorks() {
  const steps = [{
    icon: "compass",
    tone: "sky",
    title: "Dream it up",
    body: "Browse family-friendly spots and save the ones that spark a yay."
  }, {
    icon: "calendar",
    tone: "sun",
    title: "Plan together",
    body: "Drag activities into a day-by-day plan everyone can see and edit."
  }, {
    icon: "bag",
    tone: "meadow",
    title: "Pack & go",
    body: "Shared packing lists, a live budget, and a countdown to take-off."
  }];
  const toneBg = {
    sky: "var(--sky-500)",
    sun: "var(--sun-400)",
    meadow: "var(--meadow-400)"
  };
  return /*#__PURE__*/React.createElement(Section, null, /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      maxWidth: 640,
      margin: "0 auto 52px"
    }
  }, /*#__PURE__*/React.createElement(Eyebrow, null, "How Yaycay works"), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: 42,
      margin: "10px 0 0"
    }
  }, "Three steps from \"where shall we go?\" to \"we're here!\"")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(3,1fr)",
      gap: 26
    }
  }, steps.map((s, i) => /*#__PURE__*/React.createElement(Card, {
    key: i,
    variant: "soft"
  }, /*#__PURE__*/React.createElement(CardBody, null, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 60,
      height: 60,
      borderRadius: "var(--radius-lg)",
      background: toneBg[s.tone],
      color: s.tone === "sun" ? "var(--royal-800)" : "#fff",
      display: "grid",
      placeItems: "center",
      border: "2.5px solid var(--royal-600)",
      boxShadow: "0 4px 0 var(--royal-600), var(--gloss-top)"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: s.icon,
    size: 28
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      top: -6,
      right: 6,
      fontFamily: "var(--font-display)",
      fontWeight: 600,
      fontSize: 44,
      color: "var(--cream-300)"
    }
  }, i + 1)), /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: "0 0 6px",
      fontSize: 22
    }
  }, s.title), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      color: "var(--text-body)",
      fontWeight: 600
    }
  }, s.body))))));
}
function Destinations() {
  const dests = [{
    scene: "sunset",
    name: "Sun & sand",
    sub: "42 family beaches",
    tag: "Popular",
    tone: "sun"
  }, {
    scene: "meadow",
    name: "Great outdoors",
    sub: "28 trails & lakes",
    tag: "New",
    tone: "meadow"
  }, {
    scene: "sky",
    name: "City breaks",
    sub: "60 kid-friendly cities",
    tag: "Easy",
    tone: "sky"
  }, {
    scene: "aqua",
    name: "Theme parks",
    sub: "19 big-thrill days",
    tag: "Thrills",
    tone: "aqua"
  }];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: "var(--cream-200)",
      borderTop: "2.5px solid var(--sand-200)",
      borderBottom: "2.5px solid var(--sand-200)"
    }
  }, /*#__PURE__*/React.createElement(Section, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "flex-end",
      justifyContent: "space-between",
      marginBottom: 40,
      flexWrap: "wrap",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Eyebrow, null, "Where to next"), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: 42,
      margin: "10px 0 0"
    }
  }, "Adventures for every kind of family")), /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    iconRight: /*#__PURE__*/React.createElement(Icon, {
      name: "chevL",
      size: 18,
      style: {
        transform: "scaleX(-1)"
      }
    })
  }, "Browse all")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(4,1fr)",
      gap: 22
    }
  }, dests.map((d, i) => /*#__PURE__*/React.createElement(Card, {
    key: i,
    interactive: true
  }, /*#__PURE__*/React.createElement(CardMedia, {
    height: 150,
    tag: /*#__PURE__*/React.createElement(Badge, {
      tone: d.tone
    }, d.tag)
  }, /*#__PURE__*/React.createElement(Scene, {
    variant: d.scene,
    height: 150
  })), /*#__PURE__*/React.createElement(CardBody, {
    title: d.name,
    subtitle: d.sub
  }))))));
}
function Testimonial() {
  return /*#__PURE__*/React.createElement(Section, {
    style: {
      paddingTop: 84,
      paddingBottom: 84
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 860,
      margin: "0 auto",
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "inline-flex",
      gap: 4,
      marginBottom: 18,
      color: "var(--sun-400)"
    }
  }, [0, 1, 2, 3, 4].map(i => /*#__PURE__*/React.createElement(Icon, {
    key: i,
    name: "star",
    size: 26,
    fill: "var(--sun-400)",
    stroke: "var(--royal-600)"
  }))), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: 500,
      fontSize: 30,
      lineHeight: 1.3,
      color: "var(--royal-800)",
      margin: 0
    }
  }, "\"We planned our whole Italy trip on the sofa with the kids picking the beaches. The countdown had everyone buzzing for weeks.\""), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 12,
      marginTop: 26
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    name: "Priya Shah",
    tone: "aqua",
    size: 48,
    ring: true
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "left"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: 600,
      color: "var(--royal-800)"
    }
  }, "Priya & the Shah family"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 800,
      color: "var(--text-muted)",
      fontSize: 14
    }
  }, "Manchester, UK")))));
}
function CTABand({
  onGetStarted
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: "var(--grad-sky)",
      borderTop: "3px solid var(--royal-600)",
      borderBottom: "3px solid var(--royal-600)",
      position: "relative",
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      width: 130,
      height: 40,
      top: 30,
      left: 90,
      background: "var(--cream-50)",
      borderRadius: 999,
      opacity: .85,
      boxShadow: "50px -14px 0 -6px var(--cream-50)"
    }
  }), /*#__PURE__*/React.createElement(Section, {
    style: {
      paddingTop: 70,
      paddingBottom: 70,
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: 46,
      color: "var(--cream-50)",
      margin: 0,
      WebkitTextStroke: "4px var(--royal-600)",
      paintOrder: "stroke fill",
      textShadow: "3px 4px 0 var(--royal-700)"
    }
  }, "Your next adventure starts here"), /*#__PURE__*/React.createElement("p", {
    style: {
      color: "#fff",
      fontWeight: 800,
      fontSize: 18,
      margin: "16px 0 28px",
      textShadow: "0 1px 4px rgba(4,34,63,.3)"
    }
  }, "Free to start. No card needed. Just bring the family."), /*#__PURE__*/React.createElement(Button, {
    variant: "cta",
    size: "lg",
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "plane",
      size: 20
    }),
    onClick: onGetStarted
  }, "Start planning free")));
}
function SiteFooter() {
  const cols = [{
    h: "Product",
    links: ["How it works", "Destinations", "Pricing", "Mobile app"]
  }, {
    h: "Families",
    links: ["Travelling with kids", "Group trips", "Accessibility", "Help centre"]
  }, {
    h: "Company",
    links: ["About us", "Careers", "Press", "Contact"]
  }];
  return /*#__PURE__*/React.createElement("footer", {
    style: {
      background: "var(--royal-700)",
      color: "var(--cream-100)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1180,
      margin: "0 auto",
      padding: "56px 28px 36px",
      display: "grid",
      gridTemplateColumns: "1.4fr 1fr 1fr 1fr",
      gap: 32
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/brand/yaycay-logo-transparent.png",
    alt: "Yaycay",
    style: {
      width: 150
    }
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      marginTop: 16,
      color: "var(--sky-200)",
      fontWeight: 700,
      maxWidth: 240
    }
  }, "For families making memories \u2014 one trip at a time.")), cols.map(c => /*#__PURE__*/React.createElement("div", {
    key: c.h
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: 600,
      color: "#fff",
      marginBottom: 14
    }
  }, c.h), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 10
    }
  }, c.links.map(l => /*#__PURE__*/React.createElement("a", {
    key: l,
    href: "#",
    style: {
      color: "var(--sky-200)",
      fontWeight: 700,
      fontSize: 14,
      textDecoration: "none"
    }
  }, l)))))), /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: "2px solid var(--royal-600)",
      padding: "18px 28px",
      textAlign: "center",
      color: "var(--sky-300)",
      fontWeight: 700,
      fontSize: 13
    }
  }, "\xA9 2026 Yaycay \xB7 Made for families, everywhere \u2600"));
}
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/web/Sections.jsx", error: String((e && e.message) || e) }); }

// ui_kits/web/shared.jsx
try { (() => {
// Shared bits for the Yaycay app kit: brand scene tiles, icons, app chrome.
const SCENE_GRAD = {
  sunset: "var(--grad-sunset)",
  meadow: "linear-gradient(180deg,#8fd8e8 0%,#bfe6a8 55%,#7fd08a 100%)",
  sky: "var(--grad-sky)",
  aqua: "var(--grad-aqua)"
};
function Scene({
  variant = "sky",
  height = 150,
  children,
  round = 0,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      height,
      width: "100%",
      overflow: "hidden",
      background: SCENE_GRAD[variant] || SCENE_GRAD.sky,
      borderRadius: round,
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      width: 86,
      height: 26,
      top: 20,
      left: 22,
      background: "var(--cream-50)",
      borderRadius: 999,
      opacity: .92,
      boxShadow: "32px -9px 0 -4px var(--cream-50)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      width: 58,
      height: 18,
      top: 38,
      right: 26,
      background: "var(--cream-50)",
      borderRadius: 999,
      opacity: .85
    }
  }), variant === "sunset" && /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      width: 60,
      height: 60,
      bottom: -22,
      left: "50%",
      transform: "translateX(-50%)",
      background: "radial-gradient(circle, #fff3c4 0%, #ffd778 60%, transparent 72%)",
      borderRadius: 999
    }
  }), children);
}

// Inline Lucide-style icons (stroke 2.5 to match the brand)
const I = {
  plane: "M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z",
  bed: "M3 7v11M3 12h18v6M21 12V9a2 2 0 0 0-2-2h-7v5M7 11h.01",
  food: "M4 3v7a3 3 0 0 0 6 0V3M7 3v18M17 3c-1.5 0-3 1.5-3 5s1.5 4 3 4 3-1 3-4-1.5-5-3-5ZM17 16v5",
  play: "M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7Z|9 22h6",
  calendar: "M3 5h18v16H3zM3 9h18M8 3v4M16 3v4",
  bag: "M5 8h14l-1 12H6L5 8ZM9 8V6a3 3 0 0 1 6 0v2",
  coin: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18ZM12 7v10M9.5 9.5h4a1.5 1.5 0 0 1 0 3h-3a1.5 1.5 0 0 0 0 3h4",
  home: "M3 11l9-8 9 8M5 10v10h14V10",
  compass: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18ZM15.5 8.5l-2 5-5 2 2-5 5-2Z",
  plus: "M12 5v14M5 12h14",
  search: "M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14ZM20 20l-3.5-3.5",
  bell: "M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0",
  check: "M5 13l4 4L19 7",
  chevL: "M15 6l-6 6 6 6",
  star: "M12 3l2.6 5.3 5.9.9-4.2 4.1 1 5.8L12 16.9 6.7 19.2l1-5.8L3.5 9.2l5.9-.9z",
  map: "M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2ZM9 4v14M15 6v14",
  share: "M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M16 6l-4-4-4 4M12 2v13"
};
function Icon({
  name,
  size = 22,
  stroke = 2.5,
  fill = "none",
  style
}) {
  const paths = (I[name] || "").split("|");
  return /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 24 24",
    width: size,
    height: size,
    fill: fill,
    stroke: "currentColor",
    strokeWidth: stroke,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    style: {
      display: "block",
      ...style
    }
  }, paths.map((d, i) => /*#__PURE__*/React.createElement("path", {
    key: i,
    d: d
  })));
}
const KIND_ICON = {
  travel: "plane",
  stay: "bed",
  food: "food",
  play: "play"
};
const KIND_TONE = {
  travel: "sky",
  stay: "aqua",
  food: "sun",
  play: "meadow"
};
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/web/shared.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Button = __ds_scope.Button;

__ds_ns.IconButton = __ds_scope.IconButton;

__ds_ns.Avatar = __ds_scope.Avatar;

__ds_ns.AvatarGroup = __ds_scope.AvatarGroup;

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Tag = __ds_scope.Tag;

__ds_ns.Banner = __ds_scope.Banner;

__ds_ns.Checkbox = __ds_scope.Checkbox;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.Select = __ds_scope.Select;

__ds_ns.Switch = __ds_scope.Switch;

__ds_ns.Tabs = __ds_scope.Tabs;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.CardMedia = __ds_scope.CardMedia;

__ds_ns.CardBody = __ds_scope.CardBody;

__ds_ns.CardFooter = __ds_scope.CardFooter;

__ds_ns.ProgressMeter = __ds_scope.ProgressMeter;

__ds_ns.Stat = __ds_scope.Stat;

})();
