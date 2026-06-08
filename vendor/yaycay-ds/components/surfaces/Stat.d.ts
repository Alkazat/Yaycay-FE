import * as React from "react";

/** Big friendly figure with a label and optional icon tile. */
export interface StatProps extends React.HTMLAttributes<HTMLDivElement> {
  /** The figure, e.g. "12" or "7 days". */
  value?: React.ReactNode;
  label?: React.ReactNode;
  icon?: React.ReactNode;
  /** Icon tile colour. @default "sky" */
  tone?: "sky" | "sun" | "meadow" | "coral";
}

export declare function Stat(props: StatProps): JSX.Element;
