import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import MentionTextarea, { type MentionTextareaProps } from "./MentionTextarea";
import type { Member } from "../../types";

const MEMBERS: Member[] = [
  { uid: "u1", displayName: "Priya Nair" },
  { uid: "u2", displayName: "Tom Reilly" },
  { uid: "u3", displayName: "Sarah Kim" },
  { uid: "u4", displayName: "Jonas Berg" },
  { uid: "u5", displayName: "Léa Martin" },
  { uid: "u9", displayName: "Mara Lind" },
];

/** Holds the text in state and gives the field a visible label. */
function Field({ error, ...args }: Partial<MentionTextareaProps> & { error?: string }) {
  const [value, setValue] = useState(args.value ?? "");
  return (
    <div className="flex max-w-md flex-col gap-1.5">
      <label htmlFor="context" className="text-xs font-semibold tracking-wide text-muted uppercase">
        Context
      </label>
      <MentionTextarea
        {...args}
        id="context"
        value={value}
        onChange={setValue}
        members={MEMBERS}
        currentUserId="u9"
        aria-invalid={!!error}
        aria-describedby={error ? "context-error" : undefined}
      />
      {error && (
        <p id="context-error" className="text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

const meta = {
  title: "Molecules/MentionTextarea",
  component: MentionTextarea,
  tags: ["autodocs"],
  args: { value: "", onChange: () => {}, placeholder: "Why was this decided? Type @ to mention someone." },
  render: (args) => <Field {...args} />,
  parameters: {
    docs: {
      description: {
        component:
          "A textarea where typing @ suggests people to mention. Arrow keys move through the list, Enter or Tab inserts the name, Escape closes the list without closing a surrounding dialog. Screen readers hear each highlighted person (aria-activedescendant) and how many people match. You never appear in your own suggestions.",
      },
    },
  },
} satisfies Meta<typeof MentionTextarea>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

export const WithText: Story = {
  args: { value: "We tested both CTAs on the landing hero. @Priya Nair owns the rollout." },
};

export const SuggestionsOpen: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByRole("textbox", { name: "Context" }), "Ask @");
    await expect(await canvas.findByRole("listbox", { name: "People to mention" })).toBeVisible();
  },
};

export const NoMatch: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByRole("textbox", { name: "Context" }), "Ask @zz");
    await expect(canvas.queryByRole("listbox")).not.toBeInTheDocument();
  },
};

export const Error: Story = {
  render: (args) => <Field {...args} error="Add a line on why. It is what people search for later." />,
};

export const LongText: Story = {
  args: {
    rows: 6,
    value:
      "We compared three onboarding flows over four weeks. The checklist beat the guided tour on completion and on week-two retention, and support tickets about setup dropped by a third. @Sarah Kim will remove the tour next sprint, and @Tom Reilly will keep the old flow behind a flag until the end of the month in case we need to roll back.",
  },
};

/** Keyboard flow: type @, arrow down to the second person, Enter inserts the name. */
export const KeyboardFlow: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const textarea = canvas.getByRole("textbox", { name: "Context" });
    await userEvent.type(textarea, "Thanks @");

    const options = await canvas.findAllByRole("option");
    // "all" first, then people in alphabetical order; Mara (the current user) is not offered
    await expect(options.map((o) => o.textContent)).toEqual([
      "A@all Everyone in the room",
      "JJonas Berg",
      "LLéa Martin",
      "PPriya Nair",
      "SSarah Kim",
      "TTom Reilly",
    ]);
    await expect(textarea).toHaveAttribute("aria-activedescendant", options[0].id);

    await userEvent.keyboard("{ArrowDown}");
    await expect(textarea).toHaveAttribute("aria-activedescendant", options[1].id);
    await expect(options[1]).toHaveAttribute("aria-selected", "true");

    await userEvent.keyboard("{Enter}");
    await waitFor(() => expect(textarea).toHaveValue("Thanks @Jonas Berg "));
    await expect(canvas.queryByRole("listbox")).not.toBeInTheDocument();
    await expect(textarea).toHaveFocus();
  },
};

/** Escape closes the list and keeps the text as typed. */
export const EscapeCloses: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const textarea = canvas.getByRole("textbox", { name: "Context" });
    await userEvent.type(textarea, "Ping @to");
    await canvas.findByRole("listbox");
    await userEvent.keyboard("{Escape}");
    await expect(canvas.queryByRole("listbox")).not.toBeInTheDocument();
    await expect(textarea).toHaveValue("Ping @to");
  },
};
