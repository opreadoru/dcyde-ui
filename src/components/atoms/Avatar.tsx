import { useState } from "react";
import { avatarClass } from "../../lib/tokens";
import { cx } from "../../lib/cx";

export interface AvatarProps {
  /** Picks the initial and the fallback color. */
  name: string;
  photoURL?: string | null;
  size?: "sm" | "md" | "lg";
  /**
   * Give the avatar its own accessible name only when no visible name sits
   * next to it. Otherwise it stays decorative, so screen readers don't read
   * the name twice.
   */
  label?: string;
}

const SIZE = {
  sm: "size-5 text-2xs",
  md: "size-7 text-xs",
  lg: "size-9 text-sm",
};

export default function Avatar({ name, photoURL, size = "md", label }: AvatarProps) {
  const [imgFailed, setImgFailed] = useState(false);
  const a11y = label ? { role: "img", "aria-label": label } : { "aria-hidden": true };

  if (photoURL && !imgFailed) {
    return (
      <img
        src={photoURL}
        alt={label ?? ""}
        loading="lazy"
        referrerPolicy="no-referrer"
        onError={() => setImgFailed(true)}
        className={cx("shrink-0 rounded-full border border-default object-cover", SIZE[size])}
      />
    );
  }

  return (
    <span
      {...a11y}
      className={cx(
        "inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-on-solid select-none",
        avatarClass(name),
        SIZE[size],
      )}
    >
      {(name || "?").charAt(0).toUpperCase()}
    </span>
  );
}
