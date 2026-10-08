import { useId, type ReactNode } from "react";
import { Switch } from "@base-ui/react/switch";
import { cx } from "../../lib/cx";

export interface ToggleSwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label: string;
  /** A short explanation under the label, read out after the label. */
  detail?: string;
  /** A small status at the end of the row, like "On" or a count. */
  trailing?: ReactNode;
  disabled?: boolean;
}

/**
 * An on/off setting. Built on Base UI Switch, so it is a real role="switch"
 * with aria-checked, works with Space and Enter, and the whole row is clickable.
 */
export default function ToggleSwitch({ checked, onCheckedChange, label, detail, trailing, disabled }: ToggleSwitchProps) {
  const detailId = useId();
  return (
    <div>
      <label
        className={cx(
          "flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-secondary",
          disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:bg-hover",
        )}
      >
        <Switch.Root
          checked={checked}
          onCheckedChange={(next) => onCheckedChange(next)}
          disabled={disabled}
          aria-describedby={detail ? detailId : undefined}
          className="relative flex h-4 w-7 shrink-0 rounded-pill bg-input p-0.5 transition-colors duration-(--duration-fast) ease-standard data-checked:bg-accent"
        >
          <Switch.Thumb className="size-3 rounded-full bg-on-solid shadow-sm transition-transform duration-(--duration-fast) ease-standard data-checked:translate-x-3" />
        </Switch.Root>
        {label}
        {trailing && (
          <span
            className={cx(
              "ml-auto text-xs font-medium transition-colors duration-(--duration-fast)",
              checked ? "text-success" : "text-muted",
            )}
          >
            {trailing}
          </span>
        )}
      </label>
      {detail && (
        <span id={detailId} className="block px-2 pt-0.5 text-xs text-muted">
          {detail}
        </span>
      )}
    </div>
  );
}
