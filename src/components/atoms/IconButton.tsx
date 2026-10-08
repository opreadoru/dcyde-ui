import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cx } from "../../lib/cx";

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Required: an icon has no text, so this is what screen readers announce. */
  "aria-label": string;
  children: ReactNode;
}

/** The round accent button that starts the main action, like adding a decision. */
export default function IconButton({ className, children, type = "button", ...rest }: IconButtonProps) {
  return (
    <button
      type={type}
      className={cx(
        "inline-flex size-11 cursor-pointer items-center justify-center rounded-md bg-accent text-on-solid shadow-md",
        "transition-[transform,background-color] duration-(--duration-base) ease-out hover:scale-105 hover:bg-accent-hover active:scale-100",
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
