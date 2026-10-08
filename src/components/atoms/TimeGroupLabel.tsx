import { cx } from "../../lib/cx";

export interface TimeGroupLabelProps {
  label: string;
  /** Adds the warning mark used for the pinned "Important" group. */
  important?: boolean;
  /** Heading level, so the label fits the page outline. */
  level?: 2 | 3;
  className?: string;
}

/** A centered heading between two fading rules, used to split a list by time. */
export default function TimeGroupLabel({ label, important = false, level = 2, className }: TimeGroupLabelProps) {
  const Heading = level === 2 ? "h2" : "h3";
  return (
    <div className={cx("flex items-center gap-3 py-2", className)}>
      <span aria-hidden="true" className="h-px flex-1 bg-linear-to-r from-transparent to-(--color-border-strong)" />
      <Heading className="flex shrink-0 flex-col items-center gap-0.5 text-xs font-semibold tracking-widest text-muted uppercase">
        {label}
        {important && (
          <svg width="28" height="28" viewBox="0 0 443 438" fill="currentColor" aria-hidden="true" className="opacity-40">
            <path d="M226.144 25.608c10.692-.851 24.379 3.594 32.551 10.531 12.56 10.662 17.813 23.466 19.423 39.504.525 5.243.325 9.388.305 14.575l-.025 18.094v63.155l.005 57.243c.002 3.378.052 6.77.007 10.158-.107 8.014.423 15.987-.862 23.947-2.353 14.585-9.598 29.21-22.308 37.373-8.196 5.265-15.604 7.187-24.929 8.017-30.807 1.133-50.599-22.467-52.513-51.372-.299-4.515-.15-9.188-.144-13.72l.016-21.821-.003-69.71-.008-49.892c-.005-7.579-.294-15.601.057-23.151 1.313-28.242 18.499-51.173 48.428-52.931Z" />
            <path d="M297.19 155.385c.45.413 2.485 4.184 2.94 4.975l7.695 13.334 27.635 47.865 64.627 111.939c10.763 18.64 21.565 37.307 32.308 55.962 1.222 1.99 1.8 4.25 1.902 6.583.248 5.677-4.575 11.52-10.217 12.287-3.478.473-7.773.27-11.378.263l-19.075-.03-69.252.007-34.685-.017c2.52-4.988 4.385-10.28 5.547-15.745.63-3.08.98-6.168 1.653-9.068l103.195-.005c-2.055-3.07-5.528-9.545-7.523-12.997l-15.97-27.705-49.932-86.475-23.07-40.03c-1.128-1.995-5.895-9.538-6.13-11.062-.563-3.677-.323-11.979-.318-16.015l.048-33.866Z" />
            <path d="M158.611 155.431c.07.125.159.242.211.377.214.567.425 47.368-.349 49.795-1 3.138-3.505 6.214-5.143 9.103l-18.329 31.846-52.714 91.323c-8.67 15.01-17.933 30.542-26.268 45.662l103.446.033c.374 8.007 3.187 18.015 6.988 25.037-2.888-.212-8.252-.052-11.318-.05l-21.76.013-66.97-.008-21.012.028c-4.514.007-12.901.61-16.738-1.323-3.01-1.502-5.287-4.155-6.317-7.357-2.256-6.908 2.25-11.871 5.425-17.594 1.996-3.597 4.104-7.157 6.163-10.72l22.791-39.487 67.585-117.036 22.381-38.756c3.668-6.354 8.659-14.467 11.927-20.892Z" />
            <path d="M225.754 330.87c27.461-1.245 50.739 19.992 52.011 47.452 1.273 27.46-19.942 50.76-47.401 52.058-27.496 1.3-50.834-19.95-52.108-47.448-1.273-27.497 19.999-50.815 47.498-52.062Z" />
          </svg>
        )}
      </Heading>
      <span aria-hidden="true" className="h-px flex-1 bg-linear-to-l from-transparent to-(--color-border-strong)" />
    </div>
  );
}
