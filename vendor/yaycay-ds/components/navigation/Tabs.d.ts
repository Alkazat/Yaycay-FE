import * as React from "react";

export interface TabItem {
  value: string;
  label: string;
  icon?: React.ReactNode;
  /** Optional count pill. */
  count?: number;
}

/** Segmented pill tabs. Controlled via `value` / `onChange`. */
export interface TabsProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  /** Strings or `{value,label,icon,count}` objects. */
  tabs: (string | TabItem)[];
  /** Active tab value. */
  value?: string;
  onChange?: (value: string) => void;
}

export declare function Tabs(props: TabsProps): JSX.Element;
