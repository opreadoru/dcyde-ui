import { useId, type KeyboardEvent, type ReactNode } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { useTranslation } from "react-i18next";
import { cx } from "../../../lib/cx";
import { DIALOG_BACKDROP, DIALOG_POPUP } from "../../../lib/dialogStyles";
import { CloseIcon, SearchIcon } from "../../../lib/icons";

export interface PickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The button that opens the picker. Focus returns to it on close. */
  trigger: ReactNode;
  title: string;
  searchLabel: string;
  query: string;
  onQueryChange: (query: string) => void;
  onSearchKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void;
  children: ReactNode;
  footer?: ReactNode;
}

/**
 * A small searchable dialog opened from inside the compose dialog. Base UI
 * handles the nesting: Escape closes only this one, and focus goes back to
 * the button that opened it.
 */
export default function PickerDialog({
  open,
  onOpenChange,
  trigger,
  title,
  searchLabel,
  query,
  onQueryChange,
  onSearchKeyDown,
  children,
  footer,
}: PickerDialogProps) {
  const { t } = useTranslation();
  const searchId = useId();
  return (
    <Dialog.Root open={open} onOpenChange={(next) => onOpenChange(next)}>
      {trigger}
      <Dialog.Portal>
        <Dialog.Backdrop className={DIALOG_BACKDROP} />
        <Dialog.Popup className={cx(DIALOG_POPUP, "flex max-h-[80vh] w-[min(400px,calc(100vw-2rem))] flex-col")}>
          <div className="flex items-center justify-between border-b border-default px-5 py-3.5">
            <Dialog.Title className="text-md font-semibold">{title}</Dialog.Title>
            <Dialog.Close
              aria-label={t("actions.close")}
              className="inline-flex size-8 cursor-pointer items-center justify-center rounded-md text-muted hover:bg-hover hover:text-primary"
            >
              <CloseIcon size={14} />
            </Dialog.Close>
          </div>
          <div className="px-5 pt-4">
            <div className="relative">
              <label htmlFor={searchId} className="sr-only">
                {searchLabel}
              </label>
              <SearchIcon size={14} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted" />
              <input
                id={searchId}
                type="text"
                value={query}
                placeholder={searchLabel}
                autoComplete="off"
                onChange={(e) => onQueryChange(e.target.value)}
                onKeyDown={onSearchKeyDown}
                className="w-full rounded-md border border-input bg-surface py-2.5 pr-3 pl-9 text-md text-primary"
              />
            </div>
          </div>
          <div className="mt-3 min-h-0 flex-1 overflow-y-auto px-3 pb-3">{children}</div>
          {footer && <div className="border-t border-default px-5 py-3.5">{footer}</div>}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
