"use client";

/**
 * Single import surface for the Yaycay design system. The system is currently
 * vendored under /vendor/yaycay-ds as .jsx source (no npm package was supplied);
 * its global tokens/fonts are loaded once in app/layout.tsx via styles.css, and
 * each used component's CSS is mirrored in app/ds-components.css to avoid an
 * SSR flash.
 *
 * If a real @yaycay/design-system package is ever published, repoint these
 * re-exports to it - the consuming app code does not change.
 */

export { Button } from "@/vendor/yaycay-ds/components/buttons/Button";
export type { ButtonProps } from "@/vendor/yaycay-ds/components/buttons/Button";

export { IconButton } from "@/vendor/yaycay-ds/components/buttons/IconButton";

export { Input } from "@/vendor/yaycay-ds/components/forms/Input";
export type { InputProps } from "@/vendor/yaycay-ds/components/forms/Input";

export { Select } from "@/vendor/yaycay-ds/components/forms/Select";

export {
  Card,
  CardMedia,
  CardBody,
  CardFooter,
} from "@/vendor/yaycay-ds/components/surfaces/Card";

export { ProgressMeter } from "@/vendor/yaycay-ds/components/surfaces/ProgressMeter";

export { Badge } from "@/vendor/yaycay-ds/components/display/Badge";
export { Tag } from "@/vendor/yaycay-ds/components/display/Tag";
export { Avatar, AvatarGroup } from "@/vendor/yaycay-ds/components/display/Avatar";

export { Banner } from "@/vendor/yaycay-ds/components/feedback/Banner";
export { Tabs } from "@/vendor/yaycay-ds/components/navigation/Tabs";
