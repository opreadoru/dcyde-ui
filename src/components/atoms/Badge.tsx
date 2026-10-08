import { PRIORITY_KEYS, capitalize, tagDotClass } from "../../lib/tokens";
import { cx } from "../../lib/cx";

export interface BadgeProps {
  /** A tag or priority name. Priorities (low, medium, high) also get a colored dot. */
  label: string;
  className?: string;
}

export default function Badge({ label, className }: BadgeProps) {
  const isPriority = PRIORITY_KEYS.has(label.toLowerCase());
  return (
    <span
      className={cx(
        "inline-flex shrink-0 items-center gap-1.5 rounded-sm border border-default bg-sunken px-2 py-0.5 text-xs whitespace-nowrap text-secondary",
        className,
      )}
    >
      {isPriority && <span aria-hidden="true" className={cx("size-1.5 shrink-0 rounded-full", tagDotClass(label))} />}
      {capitalize(label)}
    </span>
  );
}
