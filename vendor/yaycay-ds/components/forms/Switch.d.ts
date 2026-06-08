import * as React from "react";

/** On/off toggle. Green when on, with a glossy thumb that springs across. */
export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  /** Controlled checked state. */
  checked?: boolean;
  /** Optional trailing label. */
  label?: string;
  disabled?: boolean;
}

export declare function Switch(props: SwitchProps): JSX.Element;
