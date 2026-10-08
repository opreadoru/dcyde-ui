import type { Meta, StoryObj } from "@storybook/react-vite";

const SIZES = [
  { name: "text-xl", px: 20, use: "Decision titles" },
  { name: "text-lg", px: 17, use: "Dialog titles, empty state headings" },
  { name: "text-base", px: 15, use: "Rationale and form input text" },
  { name: "text-md", px: 14, use: "Default body text, buttons" },
  { name: "text-sm", px: 13, use: "Meta text, chips, hints, errors" },
  { name: "text-xs", px: 12, use: "Field labels, group headings" },
  { name: "text-2xs", px: 10, use: "Avatar initials only" },
];

const WEIGHTS = [
  { name: "font-normal", value: 400 },
  { name: "font-medium", value: 500 },
  { name: "font-semibold", value: 600 },
  { name: "font-bold", value: 700 },
];

const meta: Meta = {
  title: "Foundations/Typography",
  parameters: {
    docs: {
      description: {
        component:
          "One system font stack, six sizes for UI and one for avatar initials. Each size carries its own line height. The smallest size used for reading text is 12px.",
      },
    },
  },
};
export default meta;

export const Scale: StoryObj = {
  render: () => (
    <div className="flex max-w-3xl flex-col gap-8 text-primary">
      <section aria-labelledby="type-sizes">
        <h2 id="type-sizes" className="mb-3 text-xs font-bold tracking-wider text-muted uppercase">
          Sizes
        </h2>
        <table className="w-full border-collapse">
          <thead>
            <tr className="text-left text-xs text-muted">
              <th scope="col" className="border-b border-default p-2">Class</th>
              <th scope="col" className="border-b border-default p-2">Size</th>
              <th scope="col" className="border-b border-default p-2">Sample</th>
              <th scope="col" className="border-b border-default p-2">Used for</th>
            </tr>
          </thead>
          <tbody>
            {SIZES.map(({ name, px, use }) => (
              <tr key={name}>
                <td className="border-b border-default p-2 text-xs">
                  <code>{name}</code>
                </td>
                <td className="border-b border-default p-2 text-xs text-muted">{px}px</td>
                <td className={`border-b border-default p-2 ${name}`}>Decisions your team can find</td>
                <td className="border-b border-default p-2 text-sm text-secondary">{use}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section aria-labelledby="type-weights">
        <h2 id="type-weights" className="mb-3 text-xs font-bold tracking-wider text-muted uppercase">
          Weights
        </h2>
        <ul className="flex flex-col gap-2">
          {WEIGHTS.map(({ name, value }) => (
            <li key={name} className={`text-lg ${name}`}>
              {value} <code className="text-sm font-normal text-muted">{name}</code>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="type-colors">
        <h2 id="type-colors" className="mb-3 text-xs font-bold tracking-wider text-muted uppercase">
          Text colors
        </h2>
        <ul className="flex flex-col gap-1 text-md">
          <li className="text-primary">text-primary: titles and body text</li>
          <li className="text-secondary">text-secondary: rationale and supporting text</li>
          <li className="text-muted">text-muted: dates, labels, hints</li>
          <li className="text-accent">text-accent: links and mentions</li>
          <li className="text-danger">text-danger: errors</li>
        </ul>
      </section>
    </div>
  ),
};
