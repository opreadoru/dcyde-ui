import { useId, useState } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { useTranslation } from "react-i18next";
import PickerDialog from "./PickerDialog";
import RemovableChip from "./RemovableChip";
import Avatar from "../../atoms/Avatar";
import Button from "../../atoms/Button";
import { ADD_BUTTON, FIELD_HINT, FIELD_LABEL } from "./styles";
import { CheckIcon, PlusIcon } from "../../../lib/icons";
import type { Member } from "../../../types";

export interface OwnerFieldProps {
  value: string[];
  onChange: (uids: string[]) => void;
  members: Member[];
  currentUserId?: string;
  /** Optional cap. When reached, the Add button hides and a note explains why. */
  max?: number;
}

export default function OwnerField({ value, onChange, members, currentUserId, max }: OwnerFieldProps) {
  const { t } = useTranslation("compose");
  const labelId = useId();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const full = max !== undefined && value.length >= max;
  const nameOf = (uid: string) => members.find((m) => m.uid === uid)?.displayName ?? uid;
  const q = query.trim().toLowerCase();
  const matches = members.filter((m) => !q || m.displayName.toLowerCase().includes(q));

  function toggle(uid: string) {
    if (value.includes(uid)) onChange(value.filter((id) => id !== uid));
    else if (!full) onChange([...value, uid]);
  }

  return (
    <div role="group" aria-labelledby={labelId}>
      <span id={labelId} className={FIELD_LABEL}>
        {t("fields.responsibleLabel")}
      </span>
      <ul className="flex flex-wrap items-center gap-1.5">
        {value.map((uid) => (
          <RemovableChip key={uid} label={nameOf(uid)} icon={<Avatar name={nameOf(uid)} size="sm" />} onRemove={() => toggle(uid)} />
        ))}
        <li>
          <PickerDialog
            open={open}
            onOpenChange={(next) => {
              setOpen(next);
              if (!next) setQuery("");
            }}
            trigger={
              <Dialog.Trigger className={ADD_BUTTON}>
                <PlusIcon size={11} />
                {t("fields.addResponsible")}
              </Dialog.Trigger>
            }
            title={t("responsiblePicker.title")}
            searchLabel={t("responsiblePicker.search")}
            query={query}
            onQueryChange={setQuery}
            footer={
              <Dialog.Close render={<Button variant="primary" className="w-full" />}>
                {value.length > 0 ? t("responsiblePicker.done", { count: value.length }) : t("responsiblePicker.doneEmpty")}
              </Dialog.Close>
            }
          >
            {matches.length === 0 ? (
              <p className="px-3 py-2 text-md text-muted">{t("responsiblePicker.empty")}</p>
            ) : (
              <ul>
                {matches.map((m) => {
                  const selected = value.includes(m.uid);
                  return (
                    <li key={m.uid}>
                      <button
                        type="button"
                        aria-pressed={selected}
                        disabled={!selected && full}
                        onClick={() => toggle(m.uid)}
                        className="flex w-full cursor-pointer items-center gap-2.5 rounded-md px-3 py-2 text-left text-md text-primary hover:bg-hover disabled:cursor-not-allowed disabled:opacity-50 aria-pressed:bg-sunken"
                      >
                        <Avatar name={m.displayName} photoURL={m.photoURL} size="md" />
                        <span className="flex-1">
                          {m.uid === currentUserId ? t("responsiblePicker.you", { name: m.displayName }) : m.displayName}
                        </span>
                        {selected && <CheckIcon size={16} className="text-accent" />}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
            {full && <p className={`${FIELD_HINT} px-3`}>{t("fields.ownerLimit", { count: max })}</p>}
          </PickerDialog>
        </li>
      </ul>
    </div>
  );
}
