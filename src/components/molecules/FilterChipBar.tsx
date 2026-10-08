import { useId, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Popover } from "@base-ui/react/popover";
import { Checkbox } from "@base-ui/react/checkbox";
import { Radio } from "@base-ui/react/radio";
import { RadioGroup } from "@base-ui/react/radio-group";
import { Toggle } from "@base-ui/react/toggle";
import Avatar from "../atoms/Avatar";
import Button from "../atoms/Button";
import TagDot from "../atoms/TagDot";
import { DATE_PRESETS } from "../../lib/tokens";
import { cx } from "../../lib/cx";
import { CalendarIcon, CheckIcon, CloseIcon, FilterIcon, FollowIcon, HeartIcon, SearchIcon } from "../../lib/icons";
import type { Author, DateRange } from "../../types";

export interface FilterChipBarProps {
  /**
   * The filters that are on. Scopes are stored by name, authors as
   * "author:<uid>", and the alignment type as "__alignment".
   */
  activeFilters: Set<string>;
  onChange: (filters: Set<string>) => void;
  scopes: string[];
  authors: Author[];
  dateRange: DateRange | null;
  onDateRangeChange: (range: DateRange | null) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  favoritesOnly?: boolean;
  onToggleFavorites?: (on: boolean) => void;
  followingCount?: number;
  onOpenFollowing?: () => void;
}

const ALIGNMENT = "__alignment";

const BAR_BUTTON =
  "inline-flex min-h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-md border border-default bg-surface px-3 text-md font-medium text-secondary transition-colors duration-(--duration-fast) hover:bg-hover";

function ActiveChip({ label, icon, removeLabel, onRemove }: { label: string; icon?: ReactNode; removeLabel: string; onRemove: () => void }) {
  return (
    <li className="flex items-center gap-1 rounded-md border border-default bg-surface py-0.5 pr-0.5 pl-2 text-sm font-medium text-primary">
      {icon}
      {label}
      <button
        type="button"
        onClick={onRemove}
        aria-label={removeLabel}
        className="inline-flex size-6 cursor-pointer items-center justify-center rounded-sm text-muted hover:bg-hover hover:text-primary"
      >
        <CloseIcon size={12} strokeWidth={3} />
      </button>
    </li>
  );
}

function CheckRow({ label, icon, checked, onCheckedChange }: { label: string; icon?: ReactNode; checked: boolean; onCheckedChange: (on: boolean) => void }) {
  return (
    <label className="flex min-h-8 cursor-pointer items-center gap-2 rounded-sm px-2 text-md text-secondary hover:bg-hover has-data-checked:text-primary">
      <Checkbox.Root
        checked={checked}
        onCheckedChange={(on) => onCheckedChange(on)}
        className="flex size-4 shrink-0 items-center justify-center rounded-sm border border-input bg-surface text-on-solid data-checked:border-accent data-checked:bg-accent"
      >
        <Checkbox.Indicator className="flex data-unchecked:hidden">
          <CheckIcon size={11} />
        </Checkbox.Indicator>
      </Checkbox.Root>
      {icon}
      {label}
    </label>
  );
}

function Section({ title, children, className }: { title: string; children: ReactNode; className?: string }) {
  return (
    <fieldset className={cx("flex min-w-0 flex-col gap-0.5", className)}>
      <legend className="mb-2 px-2 text-xs font-semibold tracking-wider text-muted uppercase">{title}</legend>
      {children}
    </fieldset>
  );
}

/**
 * Search plus a filter panel for the decision feed. The panel is a Base UI
 * Popover: it opens from the Filter button, closes on Escape or a click
 * outside, and returns focus to the button. Inside, scopes, type and authors
 * are checkboxes and the date is a radio group, grouped with fieldsets.
 */
export default function FilterChipBar({
  activeFilters,
  onChange,
  scopes,
  authors,
  dateRange,
  onDateRangeChange,
  searchQuery = "",
  onSearchChange,
  favoritesOnly = false,
  onToggleFavorites,
  followingCount = 0,
  onOpenFollowing,
}: FilterChipBarProps) {
  const { t } = useTranslation("filters");
  const [open, setOpen] = useState(false);
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const searchId = useId();
  const fromId = useId();
  const toId = useId();

  const activeCount = activeFilters.size + (dateRange ? 1 : 0);

  function setFilter(key: string, on: boolean) {
    const next = new Set(activeFilters);
    if (on) next.add(key);
    else next.delete(key);
    onChange(next);
  }

  function clearAll() {
    onChange(new Set());
    onDateRangeChange(null);
  }

  function selectPreset(labelKey: string) {
    const preset = DATE_PRESETS.find((p) => p.labelKey === labelKey);
    if (!preset || preset.days === null) return onDateRangeChange(null);
    const from = new Date();
    from.setDate(from.getDate() - preset.days);
    from.setHours(0, 0, 0, 0);
    onDateRangeChange({ from: from.toISOString(), to: null, labelKey });
  }

  function applyCustomRange() {
    if (!customFrom) return;
    const from = new Date(customFrom);
    from.setHours(0, 0, 0, 0);
    const to = customTo ? new Date(customTo) : null;
    to?.setHours(23, 59, 59, 999);
    onDateRangeChange({ from: from.toISOString(), to: to?.toISOString() ?? null, labelKey: "customLabel" });
  }

  const authorKey = (a: Author) => `author:${a.uid}`;

  const chips = [...activeFilters].map((key) => {
    if (key === ALIGNMENT) {
      return { key, label: t("type.alignment") };
    }
    if (key.startsWith("author:")) {
      const author = authors.find((a) => authorKey(a) === key);
      const name = author?.name ?? key.slice(7);
      return { key, label: name, icon: <Avatar name={name} photoURL={author?.photoURL} size="sm" /> };
    }
    return { key, label: key, icon: <TagDot tag={key} /> };
  });

  return (
    <div className="flex flex-col gap-2">
      {/* Row 1: filter button, search, view toggles */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Popover.Root open={open} onOpenChange={setOpen}>
          <Popover.Trigger className={cx(BAR_BUTTON, "data-popup-open:border-accent data-popup-open:text-accent")}>
            <FilterIcon size={14} />
            {t("buttons.filter")}
            {activeCount > 0 && (
              <span className="inline-flex h-4.5 min-w-4.5 items-center justify-center rounded-pill bg-accent px-1.5 text-xs font-semibold text-on-solid">
                {activeCount}
                <span className="sr-only">, {t("buttons.activeCount", { count: activeCount })}</span>
              </span>
            )}
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Positioner sideOffset={8} align="start" collisionPadding={16} className="z-(--z-popover)">
              <Popover.Popup
                className={cx(
                  "max-h-[70vh] w-[min(760px,calc(100vw-2rem))] overflow-auto rounded-lg border border-default bg-raised text-primary shadow-lg outline-none",
                  "origin-(--transform-origin) transition-[opacity,scale] duration-(--duration-base) ease-out data-starting-style:scale-95 data-starting-style:opacity-0 data-ending-style:scale-95 data-ending-style:opacity-0",
                )}
              >
                <div className="flex items-center justify-between border-b border-default px-4 py-3">
                  <Popover.Title className="text-md font-semibold">{t("panel.title")}</Popover.Title>
                  <div className="flex items-center gap-2">
                    {activeCount > 0 && (
                      <Button variant="ghost" size="sm" onClick={clearAll}>
                        {t("buttons.resetAll")}
                      </Button>
                    )}
                    <Popover.Close
                      aria-label={t("panel.close")}
                      className="inline-flex size-8 cursor-pointer items-center justify-center rounded-md border border-default text-muted hover:bg-hover hover:text-primary"
                    >
                      <CloseIcon size={14} />
                    </Popover.Close>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-x-4 gap-y-6 p-4 sm:grid-cols-2 md:grid-cols-4">
                  <Section title={t("panel.scopes")}>
                    {scopes.map((scope) => (
                      <CheckRow
                        key={scope}
                        label={scope}
                        icon={<TagDot tag={scope} />}
                        checked={activeFilters.has(scope)}
                        onCheckedChange={(on) => setFilter(scope, on)}
                      />
                    ))}
                  </Section>

                  <Section title={t("panel.type")}>
                    <CheckRow label={t("type.alignment")} checked={activeFilters.has(ALIGNMENT)} onCheckedChange={(on) => setFilter(ALIGNMENT, on)} />
                  </Section>

                  <Section title={t("panel.date")}>
                    <RadioGroup
                      value={dateRange?.labelKey ?? "allTime"}
                      onValueChange={(value) => selectPreset(String(value))}
                      className="flex flex-col gap-0.5"
                    >
                      {DATE_PRESETS.map((preset) => (
                        <label
                          key={preset.labelKey}
                          className="flex min-h-8 cursor-pointer items-center gap-2 rounded-sm px-2 text-md text-secondary hover:bg-hover has-data-checked:text-primary"
                        >
                          <Radio.Root
                            value={preset.labelKey}
                            className="flex size-4 shrink-0 items-center justify-center rounded-full border border-input bg-surface data-checked:border-accent"
                          >
                            <Radio.Indicator className="size-2 rounded-full bg-accent data-unchecked:hidden" />
                          </Radio.Root>
                          {t(`date.${preset.labelKey}`)}
                        </label>
                      ))}
                    </RadioGroup>

                    <div className="mt-3 flex flex-col gap-2 border-t border-default px-2 pt-3">
                      <span className="text-xs font-semibold text-muted">{t("date.customRange")}</span>
                      <div className="grid grid-cols-2 gap-2">
                        <label htmlFor={fromId} className="flex flex-col gap-1 text-xs text-muted">
                          {t("date.from")}
                          <input
                            id={fromId}
                            type="date"
                            value={customFrom}
                            onChange={(e) => setCustomFrom(e.target.value)}
                            className="min-w-0 rounded-sm border border-input bg-surface px-2 py-1.5 text-xs text-primary"
                          />
                        </label>
                        <label htmlFor={toId} className="flex flex-col gap-1 text-xs text-muted">
                          {t("date.to")}
                          <input
                            id={toId}
                            type="date"
                            value={customTo}
                            min={customFrom || undefined}
                            onChange={(e) => setCustomTo(e.target.value)}
                            className="min-w-0 rounded-sm border border-input bg-surface px-2 py-1.5 text-xs text-primary"
                          />
                        </label>
                      </div>
                      <Button variant="primary" size="sm" disabled={!customFrom} onClick={applyCustomRange}>
                        {t("date.applyRange")}
                      </Button>
                    </div>
                  </Section>

                  {authors.length > 0 && (
                    <Section title={t("panel.authors")}>
                      {authors.map((author) => (
                        <CheckRow
                          key={author.uid}
                          label={author.name}
                          icon={<Avatar name={author.name} photoURL={author.photoURL} size="sm" />}
                          checked={activeFilters.has(authorKey(author))}
                          onCheckedChange={(on) => setFilter(authorKey(author), on)}
                        />
                      ))}
                    </Section>
                  )}
                </div>
              </Popover.Popup>
            </Popover.Positioner>
          </Popover.Portal>
        </Popover.Root>

        {onSearchChange && (
          <div role="search" className="relative flex w-full max-w-90 items-center">
            <label htmlFor={searchId} className="sr-only">
              {t("buttons.searchLabel")}
            </label>
            <SearchIcon size={14} className="pointer-events-none absolute left-2.5 text-muted" />
            <input
              id={searchId}
              type="search"
              value={searchQuery}
              placeholder={t("buttons.searchPlaceholder")}
              onChange={(e) => onSearchChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape" && searchQuery) {
                  e.preventDefault();
                  onSearchChange("");
                }
              }}
              className="min-h-9 w-full rounded-md border border-input bg-surface py-1.5 pr-9 pl-8 text-md text-primary [&::-webkit-search-cancel-button]:hidden"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                aria-label={t("buttons.clearSearch")}
                className="absolute right-1.5 inline-flex size-6 cursor-pointer items-center justify-center rounded-sm text-muted hover:bg-hover hover:text-primary"
              >
                <CloseIcon size={12} strokeWidth={2.5} />
              </button>
            )}
          </div>
        )}

        {onToggleFavorites && (
          <Toggle
            pressed={favoritesOnly}
            onPressedChange={(on) => onToggleFavorites(on)}
            aria-label={t("iconTitles.showFavoritesOnly")}
            title={t("iconTitles.showFavoritesOnly")}
            className={cx(BAR_BUTTON, "size-9 justify-center px-0 data-pressed:border-favorite data-pressed:text-favorite")}
          >
            <HeartIcon size={14} filled={favoritesOnly} />
          </Toggle>
        )}

        {onOpenFollowing && (
          <button type="button" onClick={onOpenFollowing} className={cx(BAR_BUTTON, followingCount > 0 && "text-accent")}>
            <FollowIcon size={14} />
            <span className="sr-only">{t("iconTitles.following")}</span>
            {followingCount > 0 && <span className="text-sm">{followingCount}</span>}
          </button>
        )}
      </div>

      {/* Row 2: what is filtered right now, each removable */}
      {(chips.length > 0 || dateRange) && (
        <div className="flex flex-wrap items-center justify-center gap-1.5">
          <ul className="contents">
            {chips.map((chip) => (
              <ActiveChip
                key={chip.key}
                label={chip.label}
                icon={chip.icon}
                removeLabel={t("buttons.removeFilter", { name: chip.label })}
                onRemove={() => setFilter(chip.key, false)}
              />
            ))}
            {dateRange && (
              <ActiveChip
                label={t(`date.${dateRange.labelKey}`)}
                icon={<CalendarIcon size={12} />}
                removeLabel={t("buttons.removeFilter", { name: t(`date.${dateRange.labelKey}`) })}
                onRemove={() => onDateRangeChange(null)}
              />
            )}
          </ul>
          <Button variant="ghost" size="sm" onClick={clearAll}>
            {t("buttons.clearAll")}
          </Button>
        </div>
      )}
    </div>
  );
}
