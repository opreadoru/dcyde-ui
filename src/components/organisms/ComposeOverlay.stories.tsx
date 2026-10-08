import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, screen, userEvent, waitFor, within } from "storybook/test";
import ComposeOverlay, { type ComposeOverlayProps } from "./ComposeOverlay";
import IconButton from "../atoms/IconButton";
import { PlusIcon } from "../../lib/icons";
import type { Decision, Member } from "../../types";

const MEMBERS: Member[] = [
  { uid: "u1", displayName: "Priya Nair" },
  { uid: "u2", displayName: "Tom Reilly" },
  { uid: "u3", displayName: "Sarah Kim" },
  { uid: "u9", displayName: "Mara Lind" },
];

const EXISTING: Decision = {
  id: "d1",
  title: "Onboarding checklist replaces the product tour",
  rationale: "Few people finished the tour. A checklist lets them go at their own pace.",
  tags: ["Onboarding", "UX"],
  responsibleIds: ["u3"],
  links: ["https://example.com/research/onboarding"],
  createdAt: "2026-06-05",
  authorId: "u9",
};

/** The add button plus the dialog, so stories can check where focus returns. */
function Demo(args: ComposeOverlayProps) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <IconButton aria-label="Add a decision" onClick={() => setOpen(true)}>
        <PlusIcon size={20} />
      </IconButton>
      <ComposeOverlay
        {...args}
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          args.onOpenChange(next);
        }}
      />
    </>
  );
}

const openCompose = async () => {
  await userEvent.click(screen.getByRole("button", { name: "Add a decision" }));
  const dialog = await screen.findByRole("dialog", { name: /decision/ });
  // Wait for the open animation to finish before checking what is visible
  await waitFor(() => expect(dialog).not.toHaveAttribute("data-starting-style"));
  await waitFor(() => expect(getComputedStyle(dialog).opacity).toBe("1"));
  return dialog;
};

const meta = {
  title: "Organisms/ComposeOverlay",
  component: ComposeOverlay,
  tags: ["autodocs"],
  render: (args) => <Demo {...args} />,
  args: {
    open: false,
    onOpenChange: fn(),
    onSubmit: fn(),
    members: MEMBERS,
    currentUserId: "u9",
    roomScopes: { Checkout: 4, "Design System": 2 },
  },
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Write or edit a decision, built on Base UI Dialog. Full screen on phones, centered on larger screens. Every field has a visible label. Errors are linked to their field and focus moves to the first one. Closing with unsaved text asks first. While saving, Post shows progress and the dialog stays open; if saving fails, the text stays and an alert explains what to do. The scope and owner pickers are nested dialogs, so Escape closes one layer at a time. Limits are optional props: when one is reached, the Add control hides and a note says why.",
      },
    },
  },
} satisfies Meta<typeof ComposeOverlay>;
export default meta;
type Story = StoryObj<typeof meta>;

export const New: Story = {
  play: async () => {
    await openCompose();
    await waitFor(() => expect(screen.getByRole("textbox", { name: /Title/ })).toHaveFocus());
  },
};

export const Edit: Story = {
  args: { initialData: EXISTING },
  play: async () => {
    const dialog = await openCompose();
    await expect(within(dialog).getByRole("heading", { name: "Edit decision" })).toBeVisible();
    await expect(within(dialog).queryByRole("switch")).not.toBeInTheDocument();
  },
};

/** Posting with empty fields shows both errors and moves focus to the first one. */
export const ValidationErrors: Story = {
  play: async ({ args }) => {
    const dialog = await openCompose();
    await userEvent.click(within(dialog).getByRole("button", { name: "Post" }));
    const title = within(dialog).getByRole("textbox", { name: /Title/ });
    await expect(title).toHaveAttribute("aria-invalid", "true");
    await expect(title).toHaveAccessibleDescription(/Add a title so the team can find this decision/);
    await expect(title).toHaveFocus();
    await expect(args.onSubmit).not.toHaveBeenCalled();
  },
};

/** Saving takes a while: Post shows progress and the dialog can't be closed. */
export const Sending: Story = {
  args: { initialData: EXISTING, onSubmit: fn(() => new Promise<void>(() => {})) },
  play: async () => {
    const dialog = await openCompose();
    await userEvent.click(within(dialog).getByRole("button", { name: "Save changes" }));
    await expect(await within(dialog).findByRole("button", { name: "Saving..." })).toBeDisabled();
    await userEvent.keyboard("{Escape}");
    await expect(screen.getByRole("dialog", { name: "Edit decision" })).toBeVisible();
  },
};

/** Saving fails: an alert explains it and the text stays in the form. */
export const SubmitFails: Story = {
  args: { initialData: EXISTING, onSubmit: fn(() => Promise.reject(new Error("offline"))) },
  play: async () => {
    const dialog = await openCompose();
    await userEvent.click(within(dialog).getByRole("button", { name: "Save changes" }));
    await expect(await within(dialog).findByRole("alert")).toHaveTextContent("The decision wasn't saved");
    await expect(within(dialog).getByRole("textbox", { name: /Title/ })).toHaveValue(EXISTING.title);
  },
};

export const LimitsReached: Story = {
  args: { initialData: { ...EXISTING, tags: ["Onboarding", "UX", "Copy"] }, maxScopes: 3, maxLinks: 1 },
  play: async () => {
    const dialog = await openCompose();
    await expect(within(dialog).getByText("You can add up to 3 scopes.")).toBeVisible();
    await expect(within(dialog).getByText("You can add up to 1 links.")).toBeVisible();
    await expect(within(dialog).queryByRole("button", { name: "Add scope" })).not.toBeInTheDocument();
  },
};

export const French: Story = {
  globals: { locale: "fr" },
  play: async () => {
    await userEvent.click(screen.getByRole("button", { name: "Add a decision" }));
    await screen.findByRole("dialog", { name: "Nouvelle décision" });
  },
};

/**
 * Keyboard flow: write a title, press Escape. Because there is text, a
 * confirm asks first. Keep editing goes back; Escape again then Discard
 * closes everything and focus returns to the add button.
 */
export const DiscardFlow: Story = {
  play: async ({ args }) => {
    const dialog = await openCompose();
    const title = within(dialog).getByRole("textbox", { name: /Title/ });
    await waitFor(() => expect(title).toHaveFocus());
    await userEvent.type(title, "Use cursors for pagination");

    await userEvent.keyboard("{Escape}");
    const confirm = await screen.findByRole("alertdialog", { name: "Discard this draft?" });
    await userEvent.click(within(confirm).getByRole("button", { name: "Keep editing" }));
    await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument());
    await expect(title).toHaveValue("Use cursors for pagination");

    title.focus();
    await userEvent.keyboard("{Escape}");
    await userEvent.click(within(await screen.findByRole("alertdialog")).getByRole("button", { name: "Discard" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    await expect(args.onOpenChange).toHaveBeenLastCalledWith(false);
    await waitFor(() => expect(screen.getByRole("button", { name: "Add a decision" })).toHaveFocus());
  },
};

/** Escape inside the mention list closes the list, not the dialog. */
export const MentionInDialog: Story = {
  play: async () => {
    const dialog = await openCompose();
    const context = within(dialog).getByRole("textbox", { name: /Context/ });
    await userEvent.type(context, "Owned by @pri");
    await within(dialog).findByRole("listbox");
    await userEvent.keyboard("{Escape}");
    await expect(within(dialog).queryByRole("listbox")).not.toBeInTheDocument();
    await expect(screen.getByRole("dialog", { name: "New decision" })).toBeVisible();
  },
};

/** Picking a scope: type a new name, Enter creates it, focus returns to Add scope. */
export const ScopePickerFlow: Story = {
  play: async () => {
    const dialog = await openCompose();
    const add = within(dialog).getByRole("button", { name: "Add scope" });
    await userEvent.click(add);
    const picker = await screen.findByRole("dialog", { name: "Select scopes" });
    await userEvent.type(within(picker).getByRole("textbox", { name: /Search or type a new scope/ }), "Pricing{Enter}");
    await waitFor(() => expect(screen.queryByRole("dialog", { name: "Select scopes" })).not.toBeInTheDocument());
    await expect(within(dialog).getByRole("button", { name: "Remove Pricing" })).toBeVisible();
    await waitFor(() => expect(within(dialog).getByRole("button", { name: "Add scope" })).toHaveFocus());
  },
};
