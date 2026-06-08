import * as React from "react";

/**
 * Yaycay primary button — chunky, glossy, pressable "box-art" control.
 *
 * @startingPoint section="Buttons" subtitle="Chunky glossy 3D button with pop shadow" viewport="700x220"
 */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style. @default "primary" */
  variant?: "primary" | "cta" | "accent" | "danger" | "secondary" | "ghost";
  /** Size / hit target. @default "md" */
  size?: "sm" | "md" | "lg";
  /** Stretch to full container width. */
  block?: boolean;
  /** Leading icon node (e.g. a Lucide / inline SVG). */
  icon?: React.ReactNode;
  /** Trailing icon node. */
  iconRight?: React.ReactNode;
  children?: React.ReactNode;
}

export declare function Button(props: ButtonProps): JSX.Element;
