import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { CloseIcon } from "../../../lib/icons";

/** A picked value (scope, owner, link) with its own labeled remove button. */
export default function RemovableChip({ label, icon, onRemove }: { label: string; icon?: ReactNode; onRemove: () => void }) {
  const { t } = useTranslation();
  return (
    <li className="flex max-w-full items-center gap-1.5 rounded-md border border-default bg-sunken py-0.5 pr-0.5 pl-2 text-sm text-primary">
      {icon}
      <span className="truncate">{label}</span>
      <button
        type="button"
        onClick={onRemove}
        aria-label={t("actions.remove", { name: label })}
        className="inline-flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-sm text-muted hover:bg-hover hover:text-primary"
      >
        <CloseIcon size={11} strokeWidth={3} />
      </button>
    </li>
  );
}
