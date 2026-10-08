import type { Meta, StoryObj } from "@storybook/react-vite";
import Avatar from "./Avatar";

const meta = {
  title: "Atoms/Avatar",
  component: Avatar,
  tags: ["autodocs"],
  args: { name: "Priya Nair" },
  parameters: {
    docs: {
      description: {
        component:
          "A person's photo, or their initial on a color picked from their name, so the same person always gets the same color. It is decorative by default because a visible name usually sits next to it. Pass `label` when it stands alone.",
      },
    },
  },
} satisfies Meta<typeof Avatar>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Initial: Story = {};

export const Sizes: Story = {
  render: (args) => (
    <div className="flex items-center gap-3">
      <Avatar {...args} size="sm" />
      <Avatar {...args} size="md" />
      <Avatar {...args} size="lg" />
    </div>
  ),
};

/** The four fallback colors. White initials pass AA on each, in both themes. */
export const FallbackColors: Story = {
  render: () => (
    <ul className="flex flex-col gap-2">
      {["Priya Nair", "Tom Reilly", "Sarah Kim", "Mara Lind", "Jonas Berg", "Léa Martin"].map((name) => (
        <li key={name} className="flex items-center gap-2 text-sm">
          <Avatar name={name} />
          {name}
        </li>
      ))}
    </ul>
  ),
};

/** A broken photo link falls back to the initial instead of showing a broken image. */
export const BrokenPhoto: Story = {
  args: { photoURL: "https://example.com/missing.png", label: "Priya Nair" },
};

/** With no visible name next to it, the avatar announces the name itself. */
export const Standalone: Story = { args: { label: "Priya Nair", size: "lg" } };

export const EmptyName: Story = { args: { name: "", label: "Unknown member" } };
