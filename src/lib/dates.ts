// Date formatting with the browser's built-in Intl APIs, so every language
// gets its own date order, month names and words like "yesterday".

/** "5 Jun 2026" in English, "5 juin 2026" in French. */
export function formatDate(iso: string, locale: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric" }).format(date);
}

export type TimeGroup = "today" | "yesterday" | "lastWeek" | "earlier";

/** Which feed group a date falls into, compared with `now`. */
export function timeGroupOf(iso: string, now: Date = new Date()): TimeGroup {
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const date = new Date(iso);
  const daysAgo = (startOfToday.getTime() - date.getTime()) / 86_400_000;
  if (daysAgo <= 0) return "today";
  if (daysAgo <= 1) return "yesterday";
  if (daysAgo <= 7) return "lastWeek";
  return "earlier";
}

/**
 * The group heading in the reader's language: "Today", "Yesterday",
 * "Last week". "Earlier" has no Intl equivalent, so it comes from the locale file.
 */
export function timeGroupLabel(group: Exclude<TimeGroup, "earlier">, locale: string): string {
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  const text =
    group === "today" ? rtf.format(0, "day") : group === "yesterday" ? rtf.format(-1, "day") : rtf.format(-1, "week");
  return text.charAt(0).toLocaleUpperCase(locale) + text.slice(1);
}
