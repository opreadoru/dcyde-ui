import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import ToggleSwitch from "./ToggleSwitch";

const meta = {
  title: "Atoms/ToggleSwitch",
  component: ToggleSwitch,
  tags: ["autodocs"],
  args: { checked: false, label: "Ask for alignment", onCheckedChange: fn() },
  decorators: [(Story) => <div className="max-w-xs">{Story()}</div>],
  parameters: {
    docs: {
      description: {
        component:
          "An on/off setting built on Base UI Switch. Screen readers hear a switch with its on or off state, the label, and the detail text. Space toggles it, and the whole row is clickable.",
      },
    },
  },
} satisfies Meta<typeof ToggleSwitch>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Off: Story = {};
export const On: Story = { args: { checked: true } };
export const WithDetail: Story = { args: { detail: "Get a team signal on this decision" } };
export const WithTrailing: Story = { args: { checked: true, trailing: "On" } };
export const Disabled: Story = { args: { disabled: true, detail: "Only room admins can change this." } };
export const LongText: Story = {
  args: {
    label: "Notify everyone who follows this scope when the decision changes",
    detail: "They get one message per change, grouped if several changes happen within a minute.",
  },
};

/** Keyboard: Tab to the switch, Space turns it on, Space again turns it off. */
export const Keyboard: Story = {
  render: function Render(args) {
    const [checked, setChecked] = useState(false);
    return <ToggleSwitch {...args} checked={checked} onCheckedChange={setChecked} />;
  },
  play: async ({ canvasElement }) => {
    const toggle = within(canvasElement).getByRole("switch", { name: "Ask for alignment" });
    await userEvent.tab();
    await expect(toggle).toHaveFocus();
    await expect(toggle).toHaveAttribute("aria-checked", "false");
    await userEvent.keyboard(" ");
    await expect(toggle).toHaveAttribute("aria-checked", "true");
    await userEvent.keyboard(" ");
    await expect(toggle).toHaveAttribute("aria-checked", "false");
  },
};
