import type { Meta, StoryObj } from "@storybook/react-vite";
import TagDot from "./TagDot";

const meta = {
  title: "Atoms/TagDot",
  component: TagDot,
  tags: ["autodocs"],
  args: { tag: "product" },
  parameters: {
    docs: {
      description: {
        component:
          "A small color mark for a tag. It is hidden from screen readers and always sits next to the tag name. Every dot color has at least 3:1 contrast with the surface in both themes.",
      },
    },
  },
} satisfies Meta<typeof TagDot>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Medium: Story = { args: { size: "md" } };

export const AllTags: Story = {
  render: () => (
    <ul className="flex flex-col gap-2 text-sm">
      {["product", "design", "engineering", "process", "content", "research", "launch", "low", "medium", "high", "unknown"].map(
        (tag) => (
          <li key={tag} className="flex items-center gap-2">
            <TagDot tag={tag} size="md" />
            {tag}
          </li>
        ),
      )}
    </ul>
  ),
};
