import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, screen, userEvent, waitFor, within } from "storybook/test";
import DecisionPin from "./DecisionPin";
import type { Decision, Member } from "../../types";

const MEMBERS: Member[] = [
  { uid: "u1", displayName: "Priya Nair" },
  { uid: "u2", displayName: "Tom Reilly" },
  { uid: "u3", displayName: "Sarah Kim" },
  { uid: "u9", displayName: "Mara Lind" },
];

const inDays = (n: number) => new Date(Date.now() + n * 86_400_000).toISOString();

const RICH: Decision = {
  id: "d1",
  title: "Move the primary CTA to yellow across the marketing site",
  rationale:
    "We tested blue and yellow CTAs on the landing hero. Yellow won on contrast and click-through, and it reads as warmer without clashing with the brand blue. @Priya Nair owns the rollout. Full write-up: [test results](https://example.com/ab-test).",
  tags: ["Design", "Branding", "Web"],
  createdAt: "2026-06-05",
  authorName: "Tom Reilly",
  authorId: "u2",
  source: "slack",
  responsibleIds: ["u1", "u3"],
  links: ["https://www.figma.com/file/abc", "https://linear.app/example/issue/DEC-12"],
};

const SIMPLE: Decision = {
  id: "d2",
  title: "Drop the three-column grid on the feed",
  rationale: "Too cramped at small sizes. A single centered column reads better for decision records.",
  createdAt: "2026-06-02",
  authorName: "Sarah Kim",
  authorId: "u3",
};

const meta = {
  title: "Molecules/DecisionPin",
  component: DecisionPin,
  tags: ["autodocs"],
  args: {
    decision: RICH,
    members: MEMBERS,
    currentUserId: "u9",
    onToggleFavorite: fn(),
    onEdit: fn(),
    onDelete: fn(),
    onTogglePinned: fn(),
    onMarkRead: fn(),
    onCastVote: fn(),
    onFollowPerson: fn(),
    onFollowScope: fn(),
  },
  decorators: [(Story) => <div className="mx-auto max-w-2xl">{Story()}</div>],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "One decision in the feed. It shows the author, date, title and the why. Extra detail (scopes, sources, owners, links, an alignment vote) opens in place with the Show details button, a click on the card, and closes with Escape. The rail actions are labeled buttons, and favorite, pin and follow announce their pressed state. Dates use Intl.DateTimeFormat in the reader's language. The parent decides what the user may do (`canEdit`, `canDelete`, `canPin`); the card only shows the matching buttons.",
      },
    },
  },
} satisfies Meta<typeof DecisionPin>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Simple: Story = { args: { decision: SIMPLE } };

export const Unread: Story = { args: { isUnread: true } };

export const Favorite: Story = { args: { isFavorite: true, decision: { ...RICH, editedAt: "2026-06-06" } } };

export const OwnDecision: Story = {
  args: { currentUserId: "u2", canEdit: true, canDelete: true },
};

export const Pinned: Story = {
  args: {
    canPin: true,
    decision: {
      ...SIMPLE,
      id: "d3",
      pinned: true,
      source: "figma",
      figmaPageUrl: "https://www.figma.com/file/abc?node-id=1%3A2",
      figmaPageName: "Feed, pin redesign",
    },
  },
};

export const VoteOpen: Story = {
  args: {
    decision: {
      ...SIMPLE,
      id: "d4",
      title: "Ship weekly digest emails on Mondays",
      rationale: "Monday mornings had the highest open rates in our test.",
      alignment: { enabled: true, votingDeadline: inDays(3), eligibleVoterIds: ["u9", "u1"], totalVoted: 1, eligibleVoterCount: 2 },
    },
  },
};

export const VoteResults: Story = {
  args: {
    decision: {
      ...SIMPLE,
      id: "d5",
      title: "Ship weekly digest emails on Mondays",
      rationale: "Monday mornings had the highest open rates in our test.",
      alignment: { enabled: true, closed: true, votingDeadline: "2026-05-30", aligned: 6, notAligned: 2, totalVoted: 9, eligibleVoterCount: 10 },
    },
  },
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Show details" }));
  },
};

export const ReadOnly: Story = { args: { readOnly: true } };

export const LongText: Story = {
  args: {
    decision: {
      ...RICH,
      title: "Keep the legacy onboarding flow behind a feature flag until every enterprise customer has migrated to the new checklist",
      rationale:
        "The checklist beat the guided tour on completion and on week-two retention, and support tickets about setup dropped by a third. Enterprise customers have custom onboarding scripts that depend on the old tour's step IDs, so removing it now would break their internal training material. We keep the flag on for those accounts only, track who still uses it, and remove the old flow once usage reaches zero.",
      authorName: "Anna-Katharina Vasquez-Lindqvist",
    },
  },
};

export const French: Story = {
  globals: { locale: "fr" },
};

/**
 * Keyboard flow: Tab to Show details, Enter opens the card, Tab reaches the
 * scope buttons inside, Escape closes it and focus goes back to the button.
 */
export const KeyboardFlow: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole("button", { name: "Show details" });
    const firstScope = canvas.getByRole("button", { name: /Design/ });

    // Closed: the scope buttons are inert and out of the Tab order
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await userEvent.tab();
    await expect(toggle).toHaveFocus();

    await userEvent.keyboard("{Enter}");
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    // Reading order: the link in the text comes first, then the scopes
    await userEvent.tab();
    await expect(canvas.getByRole("link", { name: "test results" })).toHaveFocus();
    await userEvent.tab();
    await expect(firstScope).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect(args.onFollowScope).toHaveBeenCalledWith("Design", true);

    await userEvent.keyboard("{Escape}");
    await expect(canvas.getByRole("button", { name: "Show details" })).toHaveFocus();
    await expect(canvas.getByRole("button", { name: "Show details" })).toHaveAttribute("aria-expanded", "false");
  },
};

/** Deleting asks first. Cancel closes the dialog and returns focus to the delete button. */
export const DeleteFlow: Story = {
  args: { currentUserId: "u2", canEdit: true, canDelete: true },
  play: async ({ canvasElement, args }) => {
    const deleteButton = within(canvasElement).getByRole("button", { name: "Delete decision" });
    await userEvent.click(deleteButton);
    const dialog = await screen.findByRole("alertdialog", { name: "Delete decision" });
    await expect(dialog).toHaveTextContent("will be removed for everyone in the room");
    await userEvent.click(within(dialog).getByRole("button", { name: "Cancel" }));
    await waitFor(() => expect(deleteButton).toHaveFocus());
    await expect(args.onDelete).not.toHaveBeenCalled();
  },
};

/** Several cards together, the way the feed shows them. */
export const Column: Story = {
  render: (args) => (
    <div className="flex flex-col gap-4">
      <DecisionPin {...args} decision={RICH} isUnread />
      <DecisionPin {...args} decision={SIMPLE} isFavorite />
      <DecisionPin {...args} decision={VoteOpen.args!.decision!} />
    </div>
  ),
};
