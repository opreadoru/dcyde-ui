/** Joins class names, skipping empty or false values. cx("a", isOn && "b") gives "a b" or "a". */
export function cx(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}
