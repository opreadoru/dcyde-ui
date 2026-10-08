import type { ComponentProps } from "react";
import { cx } from "../../lib/cx";

export interface ButtonProps extends ComponentProps<"button"> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md";
  /** Shows `loadingLabel` and blocks clicks while an action runs. */
  loading?: boolean;
  loadingLabel?: string;
}

const VARIANT = {
  primary: "bg-accent text-on-solid hover:enabled:bg-accent-hover",
  secondary: "border border-strong bg-surface text-primary hover:enabled:bg-hover",
  danger: "bg-danger text-on-solid hover:enabled:brightness-90",
  ghost: "text-secondary hover:enabled:bg-hover hover:enabled:text-primary",
};

const SIZE = {
  sm: "min-h-8 px-3 text-sm",
  md: "min-h-10 px-4 text-md",
};

export default function Button({
  variant = "secondary",
  size = "md",
  loading = false,
  loadingLabel,
  disabled,
  className,
  children,
  type = "button",
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cx(
        "inline-flex cursor-pointer items-center justify-center gap-2 rounded-md font-semibold whitespace-nowrap select-none",
        "transition-[background-color,color,filter] duration-(--duration-fast) ease-standard",
        "disabled:cursor-not-allowed disabled:opacity-50",
        VARIANT[variant],
        SIZE[size],
        className,
      )}
      {...rest}
    >
      {loading && loadingLabel ? loadingLabel : children}
    </button>
  );
}
