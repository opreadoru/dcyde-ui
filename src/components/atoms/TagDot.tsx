import { tagDotClass } from "../../lib/tokens";
import { cx } from "../../lib/cx";

export interface TagDotProps {
  tag: string;
  size?: "sm" | "md";
}

/** A small color mark for a tag. Decorative: always show the tag name next to it. */
export default function TagDot({ tag, size = "sm" }: TagDotProps) {
  return (
    <span
      aria-hidden="true"
      className={cx("inline-block shrink-0 rounded-full", size === "sm" ? "size-1.5" : "size-2", tagDotClass(tag))}
    />
  );
}
