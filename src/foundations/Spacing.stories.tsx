import type { Meta, StoryObj } from "@storybook/react-vite";

// Tailwind's spacing scale: each step is 4px, so p-4 is 16px and gap-2 is 8px.
const STEPS = [1, 2, 3, 4, 5, 6, 8];

const RADII = [
  { name: "rounded-sm", px: "6px", use: "Chips, small buttons" },
  { name: "rounded-md", px: "8px", use: "Buttons, inputs" },
  { name: "rounded-lg", px: "14px", use: "Cards and dialogs" },
  { name: "rounded-pill", px: "999px", use: "Scope chips, badges" },
];

const SHADOWS = [
  { name: "shadow-sm", use: "Cards at rest" },
  { name: "shadow-md", use: "Cards on hover, toasts" },
  { name: "shadow-lg", use: "Dialogs and popovers" },
];

const heading = "mb-3 text-xs font-bold tracking-wider text-muted uppercase";

const meta: Meta = {
  title: "Foundations/Spacing",
  parameters: {
    docs: {
      description: {
        component:
          "Spacing follows a 4px grid. Radius grows with the size of the surface. Shadows are tokens too, and get stronger in dark mode so surfaces stay apart.",
      },
    },
  },
};
export default meta;

export const Scale: StoryObj = {
  render: () => (
    <div className="flex max-w-3xl flex-col gap-10 text-primary">
      <section aria-labelledby="spacing-steps">
        <h2 id="spacing-steps" className={heading}>
          Spacing (4px steps)
        </h2>
        <ul className="flex flex-col gap-2">
          {STEPS.map((n) => (
            <li key={n} className="flex items-center gap-4 text-sm">
              <code className="w-10 text-muted">{n}</code>
              <span className="w-12 text-muted">{n * 4}px</span>
              <span aria-hidden="true" className="h-3 rounded-sm bg-accent" style={{ width: n * 4 }} />
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="spacing-radius">
        <h2 id="spacing-radius" className={heading}>
          Radius
        </h2>
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {RADII.map(({ name, px, use }) => (
            <li key={name} className="flex flex-col gap-2 text-sm">
              <span aria-hidden="true" className={`h-16 border border-strong bg-surface ${name}`} />
              <code>{name}</code>
              <span className="text-muted">
                {px}, {use}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="spacing-shadow">
        <h2 id="spacing-shadow" className={heading}>
          Elevation
        </h2>
        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {SHADOWS.map(({ name, use }) => (
            <li key={name} className={`flex h-24 flex-col justify-end rounded-lg border border-default bg-surface p-3 text-sm ${name}`}>
              <code>{name}</code>
              <span className="text-muted">{use}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  ),
};
