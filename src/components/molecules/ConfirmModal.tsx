import { useId, useRef, useState, type ReactNode } from "react";
import { AlertDialog } from "@base-ui/react/alert-dialog";
import { useTranslation } from "react-i18next";
import Button from "../atoms/Button";
import { cx } from "../../lib/cx";
import { DIALOG_BACKDROP, DIALOG_POPUP } from "../../lib/dialogStyles";

export interface ConfirmModalProps {
  open: boolean;
  /** Called on Cancel, Escape, or after a confirm when the parent closes it. */
  onClose: () => void;
  /** Receives the typed text when `confirmInput` is set. */
  onConfirm: (typedValue?: string) => void;
  title: string;
  /** Say what happens: what is removed, what is kept, whether it can be undone. */
  message?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Red confirm button, for actions that remove something. */
  danger?: boolean;
  /** When set, the confirm button stays disabled until this exact text is typed. */
  confirmInput?: string;
  confirmInputHint?: string;
  /** Shows a working state and blocks closing while the action runs. */
  loading?: boolean;
}

/**
 * Asks the user to confirm an action. Built on Base UI AlertDialog: it is
 * announced as an alert dialog, keeps Tab inside, closes on Escape, and
 * returns focus to whatever opened it. Focus starts on Cancel, so pressing
 * Enter by accident never runs a destructive action.
 */
export default function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel,
  cancelLabel,
  danger = false,
  confirmInput,
  confirmInputHint,
  loading = false,
}: ConfirmModalProps) {
  const { t } = useTranslation();
  const [typed, setTyped] = useState("");
  const cancelRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();

  const canConfirm = (!confirmInput || typed === confirmInput) && !loading;

  function confirm() {
    if (canConfirm) onConfirm(confirmInput ? typed : undefined);
  }

  return (
    <AlertDialog.Root
      open={open}
      onOpenChange={(next) => {
        if (!next && !loading) onClose();
      }}
      onOpenChangeComplete={(isOpen) => {
        if (!isOpen) setTyped("");
      }}
    >
      <AlertDialog.Portal>
        <AlertDialog.Backdrop className={DIALOG_BACKDROP} />
        <AlertDialog.Popup
          initialFocus={confirmInput ? inputRef : cancelRef}
          className={cx(DIALOG_POPUP, "w-[min(400px,calc(100vw-2rem))]")}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              confirm();
            }}
          >
            <div className="flex flex-col gap-2 px-5 pt-5">
              <AlertDialog.Title className={cx("text-lg font-semibold", danger ? "text-danger" : "text-primary")}>
                {title}
              </AlertDialog.Title>
              {message && <AlertDialog.Description className="text-md text-secondary">{message}</AlertDialog.Description>}
            </div>

            {confirmInput && (
              <div className="px-5 pt-4">
                <label htmlFor={inputId} className="mb-1.5 block text-sm text-muted">
                  {confirmInputHint ?? t("actions.typeToConfirm", { value: confirmInput })}
                </label>
                <input
                  id={inputId}
                  ref={inputRef}
                  value={typed}
                  onChange={(e) => setTyped(e.target.value)}
                  autoComplete="off"
                  className="w-full rounded-md border border-input bg-surface px-3 py-2 text-md text-primary"
                />
              </div>
            )}

            <div className="mt-5 flex justify-end gap-2 border-t border-default px-5 py-4">
              <Button ref={cancelRef} variant="secondary" onClick={onClose} disabled={loading}>
                {cancelLabel ?? t("actions.cancel")}
              </Button>
              <Button
                type="submit"
                variant={danger ? "danger" : "primary"}
                disabled={!canConfirm}
                loading={loading}
                loadingLabel={t("actions.working")}
              >
                {confirmLabel ?? t("actions.confirm")}
              </Button>
            </div>
          </form>
        </AlertDialog.Popup>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
