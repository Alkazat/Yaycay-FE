import * as React from "react";

export interface SelectOption { value: string; label: string; }

/** Styled native select with a chunky chevron. Pass `options` or `<option>` children. */
export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  /** Options as strings or `{value,label}` objects. */
  options?: (string | SelectOption)[];
  /** Disabled placeholder shown first. */
  placeholder?: string;
}

export declare function Select(props: SelectProps): JSX.Element;
