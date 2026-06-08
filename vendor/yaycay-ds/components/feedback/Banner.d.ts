import * as React from "react";

/** Inline message banner / toast with tone colour, icon and optional dismiss. */
export interface BannerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** @default "info" */
  tone?: "success" | "warning" | "danger" | "info";
  title?: React.ReactNode;
  /** Override the default tone icon. */
  icon?: React.ReactNode;
  /** Show a close button and call this on dismiss. */
  onClose?: () => void;
  children?: React.ReactNode;
}

export declare function Banner(props: BannerProps): JSX.Element;
