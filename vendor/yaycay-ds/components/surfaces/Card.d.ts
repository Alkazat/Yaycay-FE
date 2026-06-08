import * as React from "react";

/**
 * Outlined "box-art" card — thick royal stroke + soft lift. Compose with
 * `CardMedia`, `CardBody`, `CardFooter`.
 *
 * @startingPoint section="Surfaces" subtitle="Outlined card with media, body & footer" viewport="700x420"
 */
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** @default "default" (royal outline) · "flat" · "soft" (grey outline) */
  variant?: "default" | "flat" | "soft";
  /** Hover-lift + pointer for clickable cards. */
  interactive?: boolean;
  children?: React.ReactNode;
}
export declare function Card(props: CardProps): JSX.Element;

export interface CardMediaProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  /** Media height in px. @default 160 */
  height?: number;
  /** Node pinned top-left (e.g. a Badge). */
  tag?: React.ReactNode;
  /** Node pinned top-right (e.g. a favourite IconButton). */
  fav?: React.ReactNode;
}
export declare function CardMedia(props: CardMediaProps): JSX.Element;

export interface CardBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
}
export declare function CardBody(props: CardBodyProps): JSX.Element;

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}
export declare function CardFooter(props: CardFooterProps): JSX.Element;
