// Maps data (a tag name, a person's name) to a semantic color class.
// The class names are written out in full so Tailwind can find them.

const TAG_DOT: Record<string, string> = {
  product: "bg-tag-1",
  design: "bg-tag-2",
  engineering: "bg-tag-4",
  process: "bg-tag-3",
  content: "bg-tag-5",
  research: "bg-tag-1",
  launch: "bg-tag-2",
  low: "bg-priority-low",
  medium: "bg-priority-medium",
  high: "bg-priority-high",
};

export const PRIORITY_KEYS = new Set(["low", "medium", "high"]);

/** Dot color class for a tag or priority. Unknown tags get the first tag color. */
export function tagDotClass(tag: string): string {
  return TAG_DOT[tag.toLowerCase()] ?? "bg-tag-1";
}

const AVATAR_BG = ["bg-avatar-1", "bg-avatar-2", "bg-avatar-3", "bg-avatar-4"];

function hashName(name: string): number {
  let hash = 0;
  for (const ch of name) hash = ch.charCodeAt(0) + ((hash << 5) - hash);
  return Math.abs(hash);
}

/** The same name always gets the same avatar color. */
export function avatarClass(name: string): string {
  return AVATAR_BG[hashName(name || "?") % AVATAR_BG.length];
}

// labelKey resolves through filters.date.* in i18n. `days` is the source of
// truth; the label is only for display.
export const DATE_PRESETS = [
  { labelKey: "allTime", days: null },
  { labelKey: "last7Days", days: 7 },
  { labelKey: "last2Weeks", days: 14 },
  { labelKey: "last30Days", days: 30 },
  { labelKey: "last3Months", days: 90 },
] as const;

export function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
