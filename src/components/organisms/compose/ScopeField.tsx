import { useId, useState } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { useTranslation } from "react-i18next";
import PickerDialog from "./PickerDialog";
import RemovableChip from "./RemovableChip";
import { ADD_BUTTON, FIELD_HINT, FIELD_LABEL } from "./styles";
import { filterScopes } from "../../../lib/scopes";
import { PlusIcon } from "../../../lib/icons";

export interface ScopeFieldProps {
  value: string[];
  onChange: (scopes: string[]) => void;
  allScopes: string[];
  /** Optional cap. When reached, the Add button hides and a note explains why. */
  max?: number;
}

const OPTION = "flex w-full cursor-pointer items-center gap-1.5 rounded-md px-3 py-2 text-left text-md text-primary hover:bg-hover";

export default function ScopeField({ value, onChange, allScopes, max }: ScopeFieldProps) {
  const { t } = useTranslation("compose");
  const labelId = useId();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const full = max !== undefined && value.length >= max;
  const q = query.trim();
  const matches = filterScopes(q, allScopes, value);
  const exists = allScopes.some((s) => s.toLowerCase() === q.toLowerCase()) || value.some((s) => s.toLowerCase() === q.toLowerCase());

  function add(scope: string) {
    if (!full && !value.some((s) => s.toLowerCase() === scope.toLowerCase())) onChange([...value, scope]);
    setQuery("");
    setOpen(false);
  }

  return (
    <div role="group" aria-labelledby={labelId}>
      <span id={labelId} className={FIELD_LABEL}>
        {t("fields.scopeLabel")}
      </span>
      <ul className="flex flex-wrap items-center gap-1.5">
        {value.map((scope) => (
          <RemovableChip key={scope} label={scope} onRemove={() => onChange(value.filter((s) => s !== scope))} />
        ))}
        {!full && (
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
                  {t("fields.addScope")}
                </Dialog.Trigger>
              }
              title={t("scopePicker.title")}
              searchLabel={t("scopePicker.search")}
              query={query}
              onQueryChange={setQuery}
              onSearchKeyDown={(e) => {
                if (e.key === "Enter" && q) {
                  e.preventDefault();
                  add(allScopes.find((s) => s.toLowerCase() === q.toLowerCase()) ?? q);
                }
              }}
            >
              <ul>
                {matches.map((scope) => (
                  <li key={scope}>
                    <button type="button" className={OPTION} onClick={() => add(scope)}>
                      {scope}
                    </button>
                  </li>
                ))}
                {q && !exists && (
                  <li>
                    <button type="button" className={`${OPTION} text-accent`} onClick={() => add(q)}>
                      <PlusIcon size={12} />
                      {t("scopePicker.createScope", { query: q })}
                    </button>
                  </li>
                )}
              </ul>
              {matches.length === 0 && (!q || exists) && <p className="px-3 py-2 text-md text-muted">{t("scopePicker.empty")}</p>}
            </PickerDialog>
          </li>
        )}
      </ul>
      {full && <p className={FIELD_HINT}>{t("fields.scopeLimit", { count: max })}</p>}
    </div>
  );
}
