// Scopes label what a decision touches (iOS, Design System, Onboarding...).
// A room can add its own scopes on top of this list.

export const PREDEFINED_SCOPES = [
  "iOS",
  "Android",
  "Web",
  "Mobile",
  "Desktop",
  "Frontend",
  "Backend",
  "API",
  "Database",
  "Design",
  "Design System",
  "UX",
  "UI",
  "Accessibility",
  "Performance",
  "Navigation",
  "Onboarding",
  "Search",
  "Settings",
  "Notifications",
  "Analytics",
  "Testing",
  "Documentation",
  "Copy",
  "Branding",
];

/**
 * All scopes for the picker: the room's own scopes first (most used at the
 * top), then the predefined ones in alphabetical order.
 * `roomScopes` maps a scope name to how often it has been used.
 */
export function getAllScopes(roomScopes: Record<string, number> = {}): string[] {
  const usage: Record<string, number> = { ...roomScopes };
  for (const s of PREDEFINED_SCOPES) {
    const known = Object.keys(usage).some((k) => k.toLowerCase() === s.toLowerCase());
    if (!known) usage[s] = 0;
  }
  return Object.keys(usage).sort((a, b) => usage[b] - usage[a] || a.localeCompare(b));
}

/** Scopes that contain the query, minus the ones already picked. */
export function filterScopes(query: string, allScopes: string[], selected: string[] = []): string[] {
  const q = query.trim().toLowerCase();
  return allScopes.filter((s) => !selected.includes(s) && (!q || s.toLowerCase().includes(q)));
}
