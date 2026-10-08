import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import Button from "./Button";

const meta = {
  title: "Atoms/Button",
  component: Button,
  tags: ["autodocs"],
  args: { children: "Save changes", onClick: fn() },
  parameters: {
    docs: {
      description: {
        component:
          "The one button used across the library. Four variants: primary for the main action, secondary for the alternative, danger for destructive actions, ghost for low-emphasis actions. While `loading` is on, the label changes and clicks are blocked.",
      },
    },
  },
} satisfies Meta<typeof Button>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = { args: { variant: "primary" } };
export const Secondary: Story = { args: { variant: "secondary", children: "Cancel" } };
export const Danger: Story = { args: { variant: "danger", children: "Delete" } };
export const Ghost: Story = { args: { variant: "ghost", children: "Clear all" } };
export const Small: Story = { args: { variant: "primary", size: "sm", children: "Apply" } };
export const Disabled: Story = { args: { variant: "primary", disabled: true } };

export const Loading: Story = {
  args: { variant: "primary", loading: true, loadingLabel: "Saving…" },
  play: async ({ canvasElement, args }) => {
    const button = within(canvasElement).getByRole("button");
    await expect(button).toBeDisabled();
    await expect(button).toHaveAttribute("aria-busy", "true");
    await userEvent.click(button);
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};

export const LongText: Story = {
  args: { variant: "secondary", children: "Enregistrer les modifications et revenir au fil" },
};

/** Reached with Tab, so the focus ring shows. */
export const FocusVisible: Story = {
  args: { variant: "primary" },
  play: async ({ canvasElement }) => {
    await userEvent.tab();
    await expect(within(canvasElement).getByRole("button")).toHaveFocus();
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button variant="primary">Post</Button>
      <Button variant="secondary">Cancel</Button>
      <Button variant="danger">Delete</Button>
      <Button variant="ghost">Clear all</Button>
      <Button variant="primary" disabled>
        Post
      </Button>
    </div>
  ),
};
