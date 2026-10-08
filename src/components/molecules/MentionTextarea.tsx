import { useEffect, useId, useLayoutEffect, useRef, useState, type Ref, type RefObject } from "react";
import { useTranslation } from "react-i18next";
import Avatar from "../atoms/Avatar";
import { cx } from "../../lib/cx";
import type { Member } from "../../types";

export interface MentionTextareaProps {
  value: string;
  onChange: (value: string) => void;
  /** People who can be mentioned. */
  members?: Member[];
  /** Left out of the suggestions: you don't mention yourself. */
  currentUserId?: string;
  maxLength?: number;
  placeholder?: string;
  rows?: number;
  /** Pair with a <label htmlFor> so the field has a visible name. */
  id?: string;
  className?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean;
  inputRef?: Ref<HTMLTextAreaElement>;
}

interface Mention {
  /** Where the "@" is in the text */
  start: number;
  /** What was typed after the "@" */
  query: string;
}

interface Suggestion {
  uid: string;
  displayName: string;
  photoURL?: string | null;
  isEveryone?: boolean;
}

const MENU_WIDTH = 260;

/** Finds an "@name" being typed just before the cursor, or null. */
function findMention(text: string, cursor: number, members: Member[]): Mention | null {
  const before = text.slice(0, cursor);
  const at = before.lastIndexOf("@");
  if (at === -1) return null;
  // "@" must start a word, so email addresses don't trigger it
  if (at > 0 && !/\s/.test(before[at - 1])) return null;
  const query = before.slice(at + 1);
  // Names can have spaces, so keep going only while someone still matches
  if (/\s/.test(query)) {
    const stillMatching = members.some((m) => m.displayName.toLowerCase().startsWith(query.toLowerCase()));
    if (!stillMatching) return null;
  }
  return { start: at, query };
}

/** Pixel position of the "@" inside the textarea, using an invisible copy of the text. */
function caretPosition(ta: HTMLTextAreaElement, index: number) {
  const style = window.getComputedStyle(ta);
  const mirror = document.createElement("div");
  for (const prop of ["fontFamily", "fontSize", "fontWeight", "lineHeight", "letterSpacing", "paddingTop", "paddingLeft", "paddingRight", "borderTopWidth", "borderLeftWidth", "boxSizing"] as const) {
    mirror.style[prop] = style[prop];
  }
  Object.assign(mirror.style, { width: style.width, position: "absolute", visibility: "hidden", whiteSpace: "pre-wrap", overflowWrap: "break-word" });
  mirror.textContent = ta.value.slice(0, index);
  const marker = document.createElement("span");
  marker.textContent = "@";
  mirror.appendChild(marker);
  document.body.appendChild(mirror);
  const top = marker.offsetTop + (parseFloat(style.lineHeight) || 20) + 4 - ta.scrollTop;
  const left = marker.offsetLeft;
  mirror.remove();
  return { top, left: Math.max(0, Math.min(left, ta.clientWidth - MENU_WIDTH)) };
}

/**
 * A textarea where typing "@" suggests people to mention.
 *
 * Accessibility: the textarea keeps its textbox role (ARIA does not allow
 * role="combobox" on a textarea). It points at the suggestion list with
 * aria-controls and at the highlighted person with aria-activedescendant, so
 * screen readers read each suggestion while focus stays in the text. A
 * polite status line says how many people match.
 */
export default function MentionTextarea({
  value,
  onChange,
  members = [],
  currentUserId,
  maxLength,
  placeholder,
  rows = 4,
  id,
  className,
  "aria-describedby": describedBy,
  "aria-invalid": invalid,
  inputRef,
}: MentionTextareaProps) {
  const { t } = useTranslation();
  const ownRef = useRef<HTMLTextAreaElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const listId = useId();
  const [mention, setMention] = useState<Mention | null>(null);
  const [active, setActive] = useState(0);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);

  const suggestions: Suggestion[] = (() => {
    if (!mention) return [];
    const q = mention.query.toLowerCase();
    const people = members
      .filter((m) => m.uid !== currentUserId && m.displayName.toLowerCase().includes(q))
      .sort((a, b) => a.displayName.localeCompare(b.displayName, undefined, { sensitivity: "base" }));
    return "all".includes(q) ? [{ uid: "__all__", displayName: "all", isEveryone: true }, ...people] : people;
  })();
  const open = suggestions.length > 0;
  const optionId = (i: number) => `${listId}-option-${i}`;

  // Both refs point at the same textarea: ours for positioning, the parent's for focus
  function setRefs(node: HTMLTextAreaElement | null) {
    ownRef.current = node;
    if (typeof inputRef === "function") inputRef(node);
    else if (inputRef) (inputRef as RefObject<HTMLTextAreaElement | null>).current = node;
  }

  function update(text: string, cursor: number) {
    const next = findMention(text, cursor, members);
    setMention(next);
    if (next?.query !== mention?.query) setActive(0);
  }

  function insert(s: Suggestion) {
    if (!mention) return;
    const before = value.slice(0, mention.start);
    const after = value.slice(mention.start + mention.query.length + 1);
    const text = `@${s.displayName} `;
    const next = before + text + after;
    onChange(maxLength ? next.slice(0, maxLength) : next);
    setMention(null);
    requestAnimationFrame(() => {
      const ta = ownRef.current;
      if (!ta) return;
      const cursor = before.length + text.length;
      ta.focus();
      ta.setSelectionRange(cursor, cursor);
    });
  }

  useLayoutEffect(() => {
    if (!open || !mention || !ownRef.current) return setPosition(null);
    setPosition(caretPosition(ownRef.current, mention.start));
  }, [open, mention, value]);

  // Keep the highlighted person in view while arrowing through a long list
  useEffect(() => {
    listRef.current?.children[active]?.scrollIntoView({ block: "nearest" });
  }, [active]);

  return (
    <div className="relative">
      <textarea
        ref={setRefs}
        id={id}
        value={value}
        rows={rows}
        maxLength={maxLength}
        placeholder={placeholder}
        aria-describedby={describedBy}
        aria-invalid={invalid || undefined}
        aria-autocomplete="list"
        aria-controls={open ? listId : undefined}
        aria-activedescendant={open ? optionId(active) : undefined}
        onChange={(e) => {
          const text = maxLength ? e.target.value.slice(0, maxLength) : e.target.value;
          onChange(text);
          update(text, e.target.selectionStart);
        }}
        onClick={(e) => update(value, e.currentTarget.selectionStart)}
        onBlur={() => setMention(null)}
        onKeyDown={(e) => {
          if (!open) return;
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setActive((i) => (i + 1) % suggestions.length);
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActive((i) => (i - 1 + suggestions.length) % suggestions.length);
          } else if (e.key === "Enter" || e.key === "Tab") {
            e.preventDefault();
            insert(suggestions[active]);
          } else if (e.key === "Escape") {
            // Close the list only, not a dialog the textarea sits in
            e.preventDefault();
            e.stopPropagation();
            setMention(null);
          }
        }}
        className={cx(
          "block w-full resize-y rounded-md border border-input bg-surface px-3 py-2.5 text-base text-primary",
          "aria-invalid:border-danger",
          className,
        )}
      />

      {open && (
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          aria-label={t("mentions.listLabel")}
          style={position ?? { visibility: "hidden" }}
          className="absolute z-(--z-popover) max-h-64 w-65 overflow-y-auto rounded-md border border-strong bg-raised py-1 shadow-lg"
        >
          {suggestions.map((s, i) => (
            <li
              key={s.uid}
              id={optionId(i)}
              role="option"
              aria-selected={i === active}
              // mousedown, not click: keeps focus in the textarea
              onMouseDown={(e) => {
                e.preventDefault();
                insert(s);
              }}
              onMouseEnter={() => setActive(i)}
              className={cx(
                "flex cursor-pointer items-center gap-2 px-3 py-1.5 text-md",
                i === active ? "bg-accent-subtle text-accent-subtle" : "text-primary",
              )}
            >
              <Avatar name={s.displayName} photoURL={s.photoURL} size="sm" />
              <span className="truncate">
                {s.isEveryone ? (
                  <>
                    @all <span className={i === active ? undefined : "text-muted"}>{t("mentions.everyone")}</span>
                  </>
                ) : (
                  s.displayName
                )}
              </span>
            </li>
          ))}
        </ul>
      )}

      <span className="sr-only" role="status" aria-live="polite">
        {open ? t("mentions.count", { count: suggestions.length }) : ""}
      </span>
    </div>
  );
}
