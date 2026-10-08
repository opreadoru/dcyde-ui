import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import Button from "../components/atoms/Button";

const DURATIONS = [
  { token: "--duration-fast", value: "120ms", cls: "duration-(--duration-fast)", use: "Hover colors, toggles" },
  { token: "--duration-base", value: "160ms", cls: "duration-(--duration-base)", use: "Dialogs, popovers, toasts" },
  { token: "--duration-slow", value: "280ms", cls: "duration-(--duration-slow)", use: "Card expand, chevron turn" },
];

const EASINGS = [
  { name: "ease-out", cls: "ease-out", use: "Things arriving: dialogs, popovers" },
  { name: "ease-in", cls: "ease-in", use: "Things leaving" },
  { name: "ease-standard", cls: "ease-standard", use: "Color and size changes" },
];

const heading = "mb-3 text-xs font-bold tracking-wider text-muted uppercase";

function Track({ moved, className }: { moved: boolean; className: string }) {
  return (
    <span aria-hidden="true" className="relative block h-6 w-56 rounded-pill bg-sunken">
      <span className={`absolute top-1 left-1 size-4 rounded-full bg-accent transition-transform ${className} ${moved ? "translate-x-50" : ""}`} />
    </span>
  );
}

const meta: Meta = {
  title: "Foundations/Motion",
  parameters: {
    docs: {
      description: {
        component:
          "Three durations and three easings, all tokens. When the system asks for reduced motion, the duration tokens drop to zero and a global rule stops every transition and animation, so nothing in the library moves.",
      },
    },
  },
};
export default meta;

export const Tokens: StoryObj = {
  render: function Render() {
    const [moved, setMoved] = useState(false);
    const reduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    return (
      <div className="flex max-w-3xl flex-col gap-8 text-primary">
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="primary" onClick={() => setMoved((m) => !m)}>
            Play
          </Button>
          <p role="status" className="text-sm text-muted">
            {reduced ? "Reduced motion is on in your system settings, so the dots jump instead of sliding." : "Reduced motion is off."}
          </p>
        </div>

        <section aria-labelledby="motion-durations">
          <h2 id="motion-durations" className={heading}>
            Durations
          </h2>
          <ul className="flex flex-col gap-3">
            {DURATIONS.map(({ token, value, cls, use }) => (
              <li key={token} className="flex flex-wrap items-center gap-4 text-sm">
                <Track moved={moved} className={`${cls} ease-out`} />
                <code>{token}</code>
                <span className="text-muted">
                  {value}, {use}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="motion-easings">
          <h2 id="motion-easings" className={heading}>
            Easings
          </h2>
          <ul className="flex flex-col gap-3">
            {EASINGS.map(({ name, cls, use }) => (
              <li key={name} className="flex flex-wrap items-center gap-4 text-sm">
                <Track moved={moved} className={`duration-(--duration-slow) ${cls}`} />
                <code>{name}</code>
                <span className="text-muted">{use}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    );
  },
};
