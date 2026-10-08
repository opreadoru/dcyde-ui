import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, screen, userEvent, waitFor, within } from "storybook/test";
import FilterChipBar, { type FilterChipBarProps } from "./FilterChipBar";
import type { Author, DateRange } from "../../types";

const AUTHORS: Author[] = [
  { uid: "u1", name: "Priya Nair" },
  { uid: "u2", name: "Tom Reilly" },
  { uid: "u3", name: "Sarah Kim" },
];

const SCOPES = ["Product", "Design", "Engineering", "Process", "Content"];

/** Holds the filter state, the way a feed page would. */
function Bar(props: Partial<FilterChipBarProps>) {
  const [filters, setFilters] = useState(props.activeFilters ?? new Set<string>());
  const [range, setRange] = useState<DateRange | null>(props.dateRange ?? null);
  const [query, setQuery] = useState(props.searchQuery ?? "");
  const [favorites, setFavorites] = useState(props.favoritesOnly ?? false);
  return (
    <FilterChipBar
      scopes={SCOPES}
      authors={AUTHORS}
      {...props}
      activeFilters={filters}
      onChange={setFilters}
      dateRange={range}
      onDateRangeChange={setRange}
      searchQuery={query}
      onSearchChange={setQuery}
      favoritesOnly={favorites}
      onToggleFavorites={setFavorites}
      followingCount={props.followingCount ?? 3}
      onOpenFollowing={() => {}}
    />
  );
}

const meta = {
  title: "Molecules/FilterChipBar",
  component: FilterChipBar,
  tags: ["autodocs"],
  args: {
    activeFilters: new Set<string>(),
    onChange: () => {},
    scopes: SCOPES,
    authors: AUTHORS,
    dateRange: null,
    onDateRangeChange: () => {},
  },
  render: (args) => <Bar {...args} />,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Search and filters for the decision feed. The panel is a Base UI Popover: Escape or a click outside closes it and focus returns to the Filter button. Scopes, type and authors are checkboxes, the date is a radio group, each group is a fieldset with a legend. Every active filter shows below as a chip with its own labeled remove button. The favorites toggle announces its pressed state.",
      },
    },
  },
} satisfies Meta<typeof FilterChipBar>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithActiveFilters: Story = {
  args: {
    activeFilters: new Set(["Design", "author:u1", "__alignment"]),
    dateRange: { from: "2026-06-01", to: null, labelKey: "last30Days" },
  },
};

export const WithSearch: Story = { args: { searchQuery: "onboarding" } };

export const FavoritesOnly: Story = { args: { favoritesOnly: true } };

export const PanelOpen: Story = {
  args: { activeFilters: new Set(["Design"]) },
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: /Filter/ }));
    await screen.findByRole("dialog", { name: "Filters" });
  },
};

export const NoAuthors: Story = {
  args: { authors: [] },
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: /Filter/ }));
    const panel = await screen.findByRole("dialog", { name: "Filters" });
    await expect(within(panel).queryByRole("group", { name: "Authors" })).not.toBeInTheDocument();
  },
};

export const LongText: Story = {
  args: {
    scopes: ["Design System", "Cross-platform accessibility", "Notifications and email digests", "Onboarding"],
    authors: [{ uid: "u7", name: "Anna-Katharina Vasquez-Lindqvist" }, ...AUTHORS],
    activeFilters: new Set(["Cross-platform accessibility", "author:u7", "Notifications and email digests"]),
  },
};

export const French: Story = {
  globals: { locale: "fr" },
  args: { activeFilters: new Set(["Design"]), dateRange: { from: "2026-06-01", to: null, labelKey: "last7Days" } },
};

/**
 * Keyboard flow: open the panel with Enter, check a scope with Space, pick a
 * date with the arrow keys, close with Escape. Focus returns to Filter and
 * the new filters show as removable chips.
 */
export const KeyboardFlow: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "Filter" });
    await userEvent.tab();
    await expect(trigger).toHaveFocus();
    await userEvent.keyboard("{Enter}");

    const panel = await screen.findByRole("dialog", { name: "Filters" });
    await waitFor(() => expect(panel.contains(document.activeElement)).toBe(true));

    const design = within(panel).getByRole("checkbox", { name: "Design" });
    design.focus();
    await userEvent.keyboard(" ");
    await expect(design).toHaveAttribute("aria-checked", "true");

    const allTime = within(panel).getByRole("radio", { name: "All time" });
    allTime.focus();
    await userEvent.keyboard("{ArrowDown}");
    await expect(within(panel).getByRole("radio", { name: "Last 7 days" })).toHaveAttribute("aria-checked", "true");

    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog", { name: "Filters" })).not.toBeInTheDocument());
    await waitFor(() => expect(canvas.getByRole("button", { name: /^Filter/ })).toHaveFocus());

    await expect(canvas.getByRole("button", { name: "Remove filter: Design" })).toBeVisible();
    await expect(canvas.getByRole("button", { name: "Remove filter: Last 7 days" })).toBeVisible();
  },
};

/** Removing a chip with the keyboard turns that filter off. */
export const RemoveChip: Story = {
  args: { activeFilters: new Set(["Design", "Process"]) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Remove filter: Design" }));
    await expect(canvas.queryByRole("button", { name: "Remove filter: Design" })).not.toBeInTheDocument();
    await expect(canvas.getByRole("button", { name: "Remove filter: Process" })).toBeVisible();
  },
};
