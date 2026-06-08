import * as React from "react";

/** Square/round icon-only button. Always pass `label` for accessibility. */
export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** @default "secondary" */
  variant?: "secondary" | "primary" | "cta" | "ghost";
  /** @default "md" */
  size?: "sm" | "md" | "lg";
  /** Accessible label (also the tooltip). Required. */
  label: string;
  /** Icon node (Lucide / inline SVG). */
  children?: React.ReactNode;
}

export declare function IconButton(props: IconButtonProps): JSX.Element;
