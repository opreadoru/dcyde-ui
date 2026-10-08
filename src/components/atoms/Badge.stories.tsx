import type { Meta, StoryObj } from "@storybook/react-vite";
import Badge from "./Badge";

const meta = {
  title: "Atoms/Badge",
  component: Badge,
  tags: ["autodocs"],
  args: { label: "design" },
  parameters: {
    docs: {
      description: {
        component:
          "A compact label for a tag or a priority. Priorities get a colored dot. The text carries the meaning, so the dot is never the only signal.",
      },
    },
  },
} satisfies Meta<typeof Badge>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Tag: Story = {};
export const PriorityLow: Story = { args: { label: "low" } };
export const PriorityMedium: Story = { args: { label: "medium" } };
export const PriorityHigh: Story = { args: { label: "high" } };
export const LongText: Story = { args: { label: "cross-platform accessibility review" } };

export const All: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      {["product", "design", "engineering", "process", "content", "low", "medium", "high"].map((label) => (
        <Badge key={label} label={label} />
      ))}
    </div>
  ),
};
