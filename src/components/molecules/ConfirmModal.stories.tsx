import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, screen, userEvent, waitFor, within } from "storybook/test";
import ConfirmModal, { type ConfirmModalProps } from "./ConfirmModal";
import Button from "../atoms/Button";
import i18n from "../../i18n";

// Names come from the locale files, so the tests pass in every language.
const t = i18n.t.bind(i18n);

/** A trigger button plus the modal, so stories can test where focus goes. */
function Demo(args: ConfirmModalProps) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        Open dialog
      </Button>
      <ConfirmModal
        {...args}
        open={open}
        onClose={() => {
          setOpen(false);
          args.onClose();
        }}
        onConfirm={(value) => {
          args.onConfirm(value);
          setOpen(false);
        }}
      />
    </>
  );
}

const openDialog = async () => {
  await userEvent.click(screen.getByRole("button", { name: "Open dialog" }));
  return screen.findByRole("alertdialog");
};

const meta = {
  title: "Molecules/ConfirmModal",
  component: ConfirmModal,
  tags: ["autodocs"],
  render: (args) => <Demo {...args} />,
  args: {
    open: false,
    title: "Archive this room?",
    message: "The room and its decisions become read-only. You can restore it from settings at any time.",
    confirmLabel: "Archive",
    onClose: fn(),
    onConfirm: fn(),
  },
  parameters: {
    docs: {
      description: {
        component:
          "Asks the user to confirm an action, built on Base UI AlertDialog. Tab stays inside the dialog, Escape closes it, and focus returns to the button that opened it. Focus starts on Cancel so an accidental Enter never runs the action. The message should say what is removed, what is kept and whether it can be undone.",
      },
    },
  },
} satisfies Meta<typeof ConfirmModal>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async () => {
    const dialog = await openDialog();
    await expect(within(dialog).getByRole("button", { name: t("common:actions.cancel") })).toHaveFocus();
  },
};

export const Danger: Story = {
  args: {
    danger: true,
    title: "Delete decision",
    message: "\"Move the primary CTA to yellow\" will be removed for everyone in the room. You can't undo this.",
    confirmLabel: "Delete",
  },
  play: async () => {
    await openDialog();
  },
};

/** Confirm stays disabled until the exact name is typed. Enter then confirms. */
export const TypedConfirmation: Story = {
  args: {
    danger: true,
    title: "Delete room",
    message: "All 48 decisions in Mobile Platform will be removed for everyone. You can't undo this.",
    confirmLabel: "Delete room",
    confirmInput: "Mobile Platform",
  },
  play: async ({ args }) => {
    const dialog = await openDialog();
    const input = within(dialog).getByRole("textbox", { name: t("common:actions.typeToConfirm", { value: "Mobile Platform" }) });
    const confirm = within(dialog).getByRole("button", { name: "Delete room" });
    await waitFor(() => expect(input).toHaveFocus());
    await expect(confirm).toBeDisabled();
    await userEvent.type(input, "Mobile Platform");
    await expect(confirm).toBeEnabled();
    await userEvent.keyboard("{Enter}");
    await expect(args.onConfirm).toHaveBeenCalledWith("Mobile Platform");
  },
};

export const Loading: Story = {
  args: { loading: true },
  play: async () => {
    const dialog = await openDialog();
    await expect(within(dialog).getByRole("button", { name: t("common:actions.working") })).toBeDisabled();
  },
};

export const LongText: Story = {
  args: {
    title: "Move 12 decisions from Mobile Platform to the Design System room?",
    message:
      "The decisions keep their authors, dates, votes and links. People who follow Mobile Platform stop getting updates about them, and people who follow Design System start getting them. You can move them back later.",
    confirmLabel: "Move decisions",
  },
  play: async () => {
    await openDialog();
  },
};

/**
 * Keyboard flow: open with Enter, Tab stays inside the dialog,
 * Escape closes it and focus goes back to the button that opened it.
 */
export const KeyboardFlow: Story = {
  play: async ({ args }) => {
    const trigger = screen.getByRole("button", { name: "Open dialog" });
    await userEvent.tab();
    await expect(trigger).toHaveFocus();
    await userEvent.keyboard("{Enter}");

    const dialog = await screen.findByRole("alertdialog");
    const cancel = within(dialog).getByRole("button", { name: t("common:actions.cancel") });
    const confirm = within(dialog).getByRole("button", { name: "Archive" });
    await waitFor(() => expect(cancel).toHaveFocus());

    await userEvent.tab();
    await expect(confirm).toHaveFocus();
    // Tab past the last button wraps back to the first one: focus never leaves the dialog
    await userEvent.tab();
    await waitFor(() => expect(cancel).toHaveFocus());
    await userEvent.tab({ shift: true });
    await waitFor(() => expect(confirm).toHaveFocus());

    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument());
    await expect(args.onClose).toHaveBeenCalled();
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};
