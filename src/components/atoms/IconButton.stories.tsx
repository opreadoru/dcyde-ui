import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import IconButton from "./IconButton";
import { PlusIcon } from "../../lib/icons";

const meta = {
  title: "Atoms/IconButton",
  component: IconButton,
  tags: ["autodocs"],
  args: { "aria-label": "Add a decision", children: <PlusIcon size={20} />, onClick: fn() },
  parameters: {
    docs: {
      description: {
        component:
          "The round accent button for the main action on a page. `aria-label` is a required prop in TypeScript, so an icon-only button can't ship without a name. 44px square, above the 24px minimum target size.",
      },
    },
  },
} satisfies Meta<typeof IconButton>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const FocusVisible: Story = {
  play: async ({ canvasElement, args }) => {
    await userEvent.tab();
    const button = within(canvasElement).getByRole("button", { name: "Add a decision" });
    await expect(button).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect(args.onClick).toHaveBeenCalledOnce();
  },
};
