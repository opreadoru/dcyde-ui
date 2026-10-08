import { useEffect, useRef, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { contrastRatio, resolveColor } from "./contrast";

const SWATCHES: { group: string; tokens: string[] }[] = [
  {
    group: "Surfaces",
    tokens: ["bg", "surface", "surface-sunken", "surface-raised", "surface-hover", "overlay"],
  },
  { group: "Borders", tokens: ["border", "border-strong", "border-input"] },
  { group: "Text", tokens: ["text", "text-secondary", "text-muted", "text-on-solid"] },
  {
    group: "Accent",
    tokens: ["accent", "accent-solid", "accent-solid-hover", "accent-subtle", "accent-subtle-text", "focus-ring"],
  },
  {
    group: "Status",
    tokens: ["danger", "danger-solid", "danger-subtle", "success", "success-subtle", "highlight", "highlight-text", "favorite"],
  },
  { group: "Tags", tokens: ["tag-1", "tag-2", "tag-3", "tag-4", "tag-5"] },
  { group: "Priority", tokens: ["priority-low", "priority-medium", "priority-high"] },
  { group: "Avatars", tokens: ["avatar-1", "avatar-2", "avatar-3", "avatar-4"] },
];

// Every pair the components use. Text needs 4.5:1. Borders and icons that
// identify a control need 3:1 (WCAG 2.2, criteria 1.4.3 and 1.4.11).
// `on` is the opaque surface under a see-through background (default: surface).
const PAIRS: { fg: string; bg: string; min: 4.5 | 3; use: string; on?: string }[] = [
  { fg: "text", bg: "surface", min: 4.5, use: "Body text on cards" },
  { fg: "text", bg: "bg", min: 4.5, use: "Body text on the page" },
  { fg: "text-secondary", bg: "surface", min: 4.5, use: "Rationale text" },
  { fg: "text-muted", bg: "surface", min: 4.5, use: "Dates, labels, hints" },
  { fg: "text-muted", bg: "bg", min: 4.5, use: "Group labels on the page" },
  { fg: "text-muted", bg: "surface-raised", min: 4.5, use: "Hints in dialogs" },
  { fg: "accent", bg: "surface", min: 4.5, use: "Links and mentions" },
  { fg: "accent", bg: "bg", min: 4.5, use: "Mark all read" },
  { fg: "text-on-solid", bg: "accent-solid", min: 4.5, use: "Primary button label" },
  { fg: "text-on-solid", bg: "danger-solid", min: 4.5, use: "Delete button label" },
  { fg: "accent-subtle-text", bg: "accent-subtle", min: 4.5, use: "Scope chip" },
  { fg: "accent-subtle-text", bg: "accent-subtle", min: 4.5, use: "Highlighted option in a dialog", on: "surface-raised" },
  { fg: "danger", bg: "surface-raised", min: 4.5, use: "Danger title in a dialog" },
  { fg: "danger", bg: "danger-subtle", min: 4.5, use: "Error alert in a dialog", on: "surface-raised" },
  { fg: "danger", bg: "danger-subtle", min: 4.5, use: "Favorites bar on the page", on: "bg" },
  { fg: "danger", bg: "surface", min: 4.5, use: "Error message" },
  { fg: "success", bg: "success-subtle", min: 4.5, use: "Aligned vote" },
  { fg: "highlight-text", bg: "highlight", min: 4.5, use: "Vote badge" },
  { fg: "text-on-solid", bg: "avatar-1", min: 4.5, use: "Avatar initial" },
  { fg: "text-on-solid", bg: "avatar-4", min: 4.5, use: "Avatar initial" },
  { fg: "border-input", bg: "surface", min: 3, use: "Input and checkbox outline" },
  { fg: "focus-ring", bg: "bg", min: 3, use: "Focus ring" },
  { fg: "focus-ring", bg: "surface", min: 3, use: "Focus ring on cards" },
  { fg: "rail-icon", bg: "rail", min: 3, use: "Card action icons" },
  { fg: "favorite", bg: "surface", min: 3, use: "Favorite heart" },
  { fg: "tag-1", bg: "surface", min: 3, use: "Tag dot" },
  { fg: "tag-3", bg: "surface", min: 3, use: "Tag dot (lowest of the five)" },
  { fg: "priority-medium", bg: "surface", min: 3, use: "Priority dot" },
];

const cell = "border-b border-default p-2 text-left align-middle";

function ThemePanel({ theme }: { theme: "light" | "dark" }) {
  const ref = useRef<HTMLElement>(null);
  const [ratios, setRatios] = useState<number[]>([]);

  useEffect(() => {
    const scope = ref.current;
    if (!scope) return;
    const color = (token: string) => resolveColor(`var(--color-${token})`, scope);
    setRatios(PAIRS.map(({ fg, bg, on = "surface" }) => contrastRatio(color(fg), color(bg), color(on))));
  }, []);

  const failures = ratios.filter((r, i) => r < PAIRS[i].min).length;

  return (
    <section ref={ref} data-theme={theme} aria-labelledby={`colors-${theme}`} className="bg-page px-6 py-8 text-primary">
      <h2 id={`colors-${theme}`} className="mb-4 text-xl font-bold">
        {theme === "light" ? "Light" : "Dark"}
      </h2>

      {SWATCHES.map(({ group, tokens }) => (
        <div key={group}>
          <h3 className="mt-6 mb-2 text-xs font-bold tracking-wider text-muted uppercase">{group}</h3>
          <ul className="grid grid-cols-[repeat(auto-fill,minmax(190px,1fr))] gap-2">
            {tokens.map((token) => (
              <li key={token} className="flex items-center gap-2 text-xs">
                <span
                  className="size-7 shrink-0 rounded-sm border border-strong"
                  style={{ background: `var(--color-${token})` }}
                />
                <code>--color-{token}</code>
              </li>
            ))}
          </ul>
        </div>
      ))}

      <h3 className="mt-6 mb-2 text-xs font-bold tracking-wider text-muted uppercase">Contrast</h3>
      <p className="mb-2">
        {ratios.length === 0 ? "Measuring…" : failures === 0 ? `All ${PAIRS.length} pairs pass.` : `${failures} pairs fail.`}
      </p>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="text-muted">
              <th scope="col" className={cell}>Pair</th>
              <th scope="col" className={cell}>Used for</th>
              <th scope="col" className={cell}>Ratio</th>
              <th scope="col" className={cell}>Needs</th>
            </tr>
          </thead>
          <tbody>
            {PAIRS.map((pair, i) => {
              const ratio = ratios[i];
              const pass = ratio !== undefined && ratio >= pair.min;
              return (
                <tr key={`${pair.fg}-${pair.bg}-${i}`}>
                  <td className={cell}>
                    {/* Text pairs get a text sample. 3:1 pairs are borders and icons, so they get a shape. */}
                    <span
                      className="mr-2 inline-flex h-6 w-8 items-center justify-center rounded-sm border border-default text-center font-bold align-middle"
                      style={{ color: `var(--color-${pair.fg})`, background: `var(--color-${pair.bg})` }}
                    >
                      {pair.min === 4.5 ? "Aa" : <span aria-hidden="true" className="size-3 rounded-full bg-current" />}
                    </span>
                    <code>{pair.fg}</code> on <code>{pair.bg}</code>
                    {pair.on && (
                      <>
                        {" "}
                        over <code>{pair.on}</code>
                      </>
                    )}
                  </td>
                  <td className={cell}>{pair.use}</td>
                  <td className={cell}>{ratio === undefined ? "" : `${ratio.toFixed(2)}:1`}</td>
                  <td className={cell}>
                    {pair.min}:1{" "}
                    <span className={`font-bold ${pass ? "text-success" : "text-danger"}`}>{pass ? "Pass" : "Fail"}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

const meta: Meta = {
  title: "Foundations/Colors",
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Semantic color tokens in both themes. Components only use these, never raw hex values. The contrast table is measured live from the tokens, so it updates whenever a value changes.",
      },
    },
  },
};
export default meta;

/** Both themes side by side, whatever the toolbar is set to. */
export const Palette: StoryObj = {
  render: () => (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(420px,1fr))]">
      <ThemePanel theme="light" />
      <ThemePanel theme="dark" />
    </div>
  ),
  // The test fails if any measured pair drops below its WCAG minimum, in either theme.
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findAllByText(/pairs (pass|fail)\.$/);
    const failing = canvas.queryAllByText("Fail").map((cell) => cell.closest("tr")?.textContent);
    await expect(failing).toEqual([]);
  },
};
