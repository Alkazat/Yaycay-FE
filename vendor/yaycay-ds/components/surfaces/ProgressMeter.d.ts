import * as React from "react";

/** Chunky outlined progress bar (e.g. "Day 3 of 7 planned"). */
export interface ProgressMeterProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  /** @default 100 */
  max?: number;
  label?: string;
  /** Show the right-hand value. @default true */
  showValue?: boolean;
  /** Override the auto "%" text, e.g. "Day 3 of 7". */
  valueText?: string;
  /** Fill gradient. @default "sky" */
  tone?: "sky" | "sun" | "meadow" | "aqua";
}

export declare function ProgressMeter(props: ProgressMeterProps): JSX.Element;
