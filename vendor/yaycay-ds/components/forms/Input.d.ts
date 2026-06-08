import * as React from "react";

/** Text field with optional label, leading icon, hint and error state. */
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Field label (rendered above). */
  label?: string;
  /** Helper text below the field. */
  hint?: string;
  /** Error message — turns the field coral and overrides `hint`. */
  error?: string;
  /** Leading icon node. */
  icon?: React.ReactNode;
}

export declare function Input(props: InputProps): JSX.Element;
