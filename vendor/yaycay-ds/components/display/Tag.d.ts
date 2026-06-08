import * as React from "react";

/** Filter / category chip. Outlined by default; `active` fills it sky. */
export interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Leading icon node. */
  icon?: React.ReactNode;
  /** Selected/filled state. */
  active?: boolean;
  /** Show a remove "×" and call this when clicked. */
  onRemove?: (e: React.MouseEvent) => void;
  children?: React.ReactNode;
}

export declare function Tag(props: TagProps): JSX.Element;
