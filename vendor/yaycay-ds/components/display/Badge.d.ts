import * as React from "react";

/** Small status / category pill with a glossy top. */
export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Colour tone. @default "sky" */
  tone?: "sky" | "sun" | "aqua" | "meadow" | "coral" | "ink" | "soft";
  /** Show a leading status dot. */
  dot?: boolean;
  /** Leading icon node. */
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

export declare function Badge(props: BadgeProps): JSX.Element;
