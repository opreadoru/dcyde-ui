import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import DecisionFeed from "./DecisionFeed";
import type { Decision, Member } from "../../types";
import i18n from "../../i18n";
import { timeGroupLabel } from "../../lib/dates";

// Names come from the locale files, so the tests pass in every language.
const t = i18n.t.bind(i18n);

const MEMBERS: Member[] = [
  { uid: "u1", displayName: "Priya Nair" },
  { uid: "u2", displayName: "Tom Reilly" },
  { uid: "u3", displayName: "Sarah Kim" },
  { uid: "u9", displayName: "Mara Lind" },
];

const daysAgo = (n: number) => new Date(Date.now() - n * 86_400_000).toISOString();

const DECISIONS: Decision[] = [
  {
    id: "d1",
    title: "Onboarding checklist replaces the product tour",
    rationale: "Few people finished the tour. A checklist lets them go at their own pace. @Sarah Kim owns the copy.",
    tags: ["Onboarding", "UX"],
    createdAt: daysAgo(0),
    authorId: "u1",
    authorName: "Priya Nair",
  },
  {
    id: "d2",
    title: "API pagination uses cursors, not offsets",
    rationale: "Better performance at scale, and no skipped items when data changes.",
    tags: ["API", "Backend"],
    createdAt: daysAgo(1),
    authorId: "u2",
    authorName: "Tom Reilly",
    source: "slack",
  },
  {
    id: "d3",
    title: "Design tokens live in CSS custom properties",
    rationale: "No runtime cost, no flash of unstyled content, simpler theming.",
    tags: ["Design System"],
    createdAt: daysAgo(4),
    authorId: "u3",
    authorName: "Sarah Kim",
    source: "figma",
  },
  {
    id: "d4",
    title: "Ship weekly instead of every two weeks",
    rationale: "Smaller releases, faster feedback, easier rollbacks.",
    createdAt: daysAgo(20),
    authorId: "u9",
    authorName: "Mara Lind",
  },
];

const PINNED: Decision = {
  id: "d0",
  title: "Every new page is designed mobile-first",
  rationale: "Most traffic is mobile, and desktop layouts adapt more easily than the reverse.",
  createdAt: daysAgo(30),
  authorId: "u2",
  authorName: "Tom Reilly",
  pinned: true,
};

const meta = {
  title: "Organisms/DecisionFeed",
  component: DecisionFeed,
  tags: ["autodocs"],
  args: {
    decisions: DECISIONS,
    totalCount: DECISIONS.length,
    members: MEMBERS,
    currentUserId: "u9",
    permissionsFor: (d: Decision) => ({ canEdit: d.authorId === "u9", canDelete: d.authorId === "u9" }),
    onToggleFavorite: fn(),
    onEditDecision: fn(),
    onDeleteDecision: fn(),
    onMarkRead: fn(),
    onFollowPerson: fn(),
    onFollowScope: fn(),
  },
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "The decision list. Pinned decisions come first under Important, then groups by time. Group names (Today, Yesterday, Last week) come from Intl.RelativeTimeFormat, so they follow the reader's language. Each group is a heading plus a list. Covers loading, error, an empty room, no favorites and no search results.",
      },
    },
  },
} satisfies Meta<typeof DecisionFeed>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithPinned: Story = { args: { decisions: [PINNED, ...DECISIONS], totalCount: 5 } };

export const WithUnread: Story = { args: { unreadIds: new Set(["d1", "d2"]), onMarkAllRead: fn() } };

/** Screen readers hear "Loading decisions" while four placeholder cards shimmer. */
export const Loading: Story = {
  args: { loading: true },
  play: async ({ canvasElement }) => {
    const status = within(canvasElement).getByText(t("feed:loading"));
    await expect(status).toHaveAttribute("role", "status");
    await expect(status.parentElement).toHaveAttribute("aria-busy", "true");
  },
};

export const Error: Story = {
  args: { error: true, onRetry: fn() },
  play: async ({ canvasElement, args }) => {
    const alert = within(canvasElement).getByRole("alert");
    await userEvent.click(within(alert).getByRole("button", { name: t("feed:error.retry") }));
    await expect(args.onRetry).toHaveBeenCalledOnce();
  },
};

export const EmptyRoom: Story = { args: { decisions: [], totalCount: 0 } };

export const NoFavorites: Story = { args: { decisions: [], favoritesOnly: true, onClearFavorites: fn() } };

export const NoResults: Story = { args: { decisions: [] } };

export const FavoritesOnly: Story = {
  args: { decisions: DECISIONS.slice(0, 2), favoritesOnly: true, favoriteIds: new Set(["d1", "d2"]), onClearFavorites: fn() },
};

export const LoadMore: Story = { args: { hasMore: true, remainingCount: 24, onLoadMore: fn() } };

export const LoadingMore: Story = { args: { hasMore: true, remainingCount: 24, loadingMore: true, onLoadMore: fn() } };

export const French: Story = { globals: { locale: "fr" }, args: { decisions: [PINNED, ...DECISIONS], totalCount: 5 } };

/** The outline a screen reader user navigates: one heading and one list per group. */
export const Structure: Story = {
  args: { decisions: [PINNED, ...DECISIONS], totalCount: 5 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const groups = canvas.getAllByRole("heading", { level: 2 }).map((h) => h.textContent);
    await expect(groups).toEqual([
      t("feed:timeGroup.important"),
      timeGroupLabel("today", i18n.language),
      timeGroupLabel("yesterday", i18n.language),
      timeGroupLabel("lastWeek", i18n.language),
      t("feed:timeGroup.earlier"),
    ]);
    const feedLists = canvas.getAllByRole("list").filter((list) => !list.closest("article"));
    await expect(feedLists).toHaveLength(5);
    await expect(canvas.getAllByRole("article")).toHaveLength(5);
  },
};
