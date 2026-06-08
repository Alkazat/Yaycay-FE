import * as React from "react";

/** Checkbox (default) or radio (`radio`) with a springy glossy box. */
export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  checked?: boolean;
  /** Trailing label text. */
  label?: string;
  /** Render as a radio button instead of a checkbox. */
  radio?: boolean;
  disabled?: boolean;
}

export declare function Checkbox(props: CheckboxProps): JSX.Element;
