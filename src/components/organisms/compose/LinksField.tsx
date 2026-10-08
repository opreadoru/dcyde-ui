import { useId, useState } from "react";
import { useTranslation } from "react-i18next";
import RemovableChip from "./RemovableChip";
import Button from "../../atoms/Button";
import { FIELD_ERROR, FIELD_HINT, FIELD_LABEL, TEXT_INPUT } from "./styles";
import { LinkIcon } from "../../../lib/icons";

export interface LinksFieldProps {
  value: string[];
  onChange: (links: string[]) => void;
  /** Optional cap. When reached, the input hides and a note explains why. */
  max?: number;
}

/** Turns "example.com/page" into "https://example.com/page", or null if it isn't a web address. */
function toUrl(raw: string): string | null {
  const text = raw.trim();
  if (!text) return null;
  const withScheme = /^https?:\/\//i.test(text) ? text : `https://${text}`;
  try {
    const url = new URL(withScheme);
    return url.hostname.includes(".") ? url.href : null;
  } catch {
    return null;
  }
}

function hostOf(url: string): string {
  return new URL(url).hostname.replace(/^www\./, "");
}

export default function LinksField({ value, onChange, max }: LinksFieldProps) {
  const { t } = useTranslation("compose");
  const inputId = useId();
  const errorId = useId();
  const [input, setInput] = useState("");
  const [invalid, setInvalid] = useState(false);

  const full = max !== undefined && value.length >= max;

  function add() {
    if (!input.trim()) return;
    const url = toUrl(input);
    if (!url) return setInvalid(true);
    if (!value.includes(url)) onChange([...value, url]);
    setInput("");
    setInvalid(false);
  }

  return (
    <div>
      <label htmlFor={inputId} className={FIELD_LABEL}>
        {t("fields.linksLabel")}
      </label>
      {value.length > 0 && (
        <ul className="mb-2 flex flex-wrap gap-1.5">
          {value.map((url) => (
            <RemovableChip key={url} label={hostOf(url)} icon={<LinkIcon size={11} className="shrink-0 text-muted" />} onRemove={() => onChange(value.filter((u) => u !== url))} />
          ))}
        </ul>
      )}
      {full ? (
        <p className={FIELD_HINT}>{t("fields.linkLimit", { count: max })}</p>
      ) : (
        <>
          <div className="flex items-center gap-1.5">
            <input
              id={inputId}
              type="text"
              inputMode="url"
              value={input}
              placeholder={t("fields.linksPlaceholder")}
              aria-invalid={invalid || undefined}
              aria-describedby={invalid ? errorId : undefined}
              onChange={(e) => {
                setInput(e.target.value);
                setInvalid(false);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  add();
                }
              }}
              className={TEXT_INPUT}
            />
            <Button variant="secondary" onClick={add}>
              {t("fields.addLink")}
            </Button>
          </div>
          {invalid && (
            <p id={errorId} className={FIELD_ERROR}>
              {t("fields.linkInvalid")}
            </p>
          )}
        </>
      )}
    </div>
  );
}
