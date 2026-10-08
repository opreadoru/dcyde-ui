import type { Meta, StoryObj } from "@storybook/react-vite";
import TimeGroupLabel from "./TimeGroupLabel";
import { timeGroupLabel } from "../../lib/dates";

const meta = {
  title: "Atoms/TimeGroupLabel",
  component: TimeGroupLabel,
  tags: ["autodocs"],
  args: { label: "Today" },
  decorators: [(Story) => <div className="max-w-xl">{Story()}</div>],
  parameters: {
    docs: {
      description: {
        component:
          "A heading that splits a list by time. It is a real heading (h2 or h3), so screen reader users can jump between groups. The rules on each side are decorative.",
      },
    },
  },
} satisfies Meta<typeof TimeGroupLabel>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Important: Story = { args: { label: "Important", important: true } };
export const LongText: Story = { args: { label: "Decisions from the March planning offsite" } };

/** Labels come from Intl.RelativeTimeFormat, so they follow the language without translation files. */
export const FromIntl: Story = {
  render: () => (
    <div className="flex flex-col">
      {(["en", "fr", "de", "ja"] as const).map((locale) => (
        <TimeGroupLabel key={locale} level={3} label={`${timeGroupLabel("yesterday", locale)} (${locale})`} />
      ))}
    </div>
  ),
};
