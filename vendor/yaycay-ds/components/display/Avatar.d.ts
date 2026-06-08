import * as React from "react";

/** Round avatar with initials fallback and a glossy ring. */
export interface AvatarProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Full name — used for initials + tooltip. */
  name?: string;
  /** Image URL (overrides initials). */
  src?: string;
  /** Gradient tone. @default "sky" */
  tone?: "sky" | "sun" | "aqua" | "coral";
  /** Pixel diameter. @default 44 */
  size?: number;
  /** Add a sunshine focus ring. */
  ring?: boolean;
}

export declare function Avatar(props: AvatarProps): JSX.Element;

/** Overlapping row of avatars. */
export interface AvatarGroupProps extends React.HTMLAttributes<HTMLSpanElement> {
  children?: React.ReactNode;
}
export declare function AvatarGroup(props: AvatarGroupProps): JSX.Element;
