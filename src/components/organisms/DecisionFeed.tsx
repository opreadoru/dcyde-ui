import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import DecisionPin, { type DecisionPinProps } from "../molecules/DecisionPin";
import TimeGroupLabel from "../atoms/TimeGroupLabel";
import Button from "../atoms/Button";
import { timeGroupLabel, timeGroupOf, type TimeGroup } from "../../lib/dates";
import { CheckIcon, HeartIcon, InboxIcon, SearchIcon } from "../../lib/icons";
import type { Decision, Member, Vote } from "../../types";

type Permissions = Pick<DecisionPinProps, "canEdit" | "canDelete" | "canPin">;

export interface DecisionFeedProps {
  decisions: Decision[];
  /** How many decisions exist before search and filters. 0 means the room is empty. */
  totalCount: number;
  loading?: boolean;
  /** Set when loading failed. Shows the error state with a retry button. */
  error?: boolean;
  onRetry?: () => void;
  members?: Member[];
  currentUserId?: string;
  /** What the current user may do with each decision. */
  permissionsFor?: (decision: Decision) => Permissions;
  favoriteIds?: Set<string>;
  unreadIds?: Set<string>;
  myVotes?: Record<string, Vote>;
  favoritesOnly?: boolean;
  followedPeople?: string[];
  followedScopes?: string[];
  hasMore?: boolean;
  remainingCount?: number;
  loadingMore?: boolean;
  onLoadMore?: () => void;
  onClearFavorites?: () => void;
  onMarkAllRead?: () => void;
  onToggleFavorite?: (id: string) => void;
  onEditDecision?: (decision: Decision) => void;
  onDeleteDecision?: (id: string) => void;
  onTogglePinned?: (id: string, pinned: boolean) => void;
  onMarkRead?: (id: string) => void;
  onCastVote?: (id: string, vote: Vote) => void;
  onFollowPerson?: (uid: string, name: string, follow: boolean) => void;
  onFollowScope?: (scope: string, follow: boolean) => void;
}

const GROUP_ORDER: TimeGroup[] = ["today", "yesterday", "lastWeek", "earlier"];

function Message({ icon, heading, subtext, role, children }: { icon: ReactNode; heading: string; subtext: string; role?: "alert"; children?: ReactNode }) {
  return (
    <div role={role} className="flex flex-col items-center px-6 py-16 text-center">
      <span className="mb-3.5 text-muted">{icon}</span>
      <p className="text-lg font-bold text-primary">{heading}</p>
      <p className="mt-1.5 text-md text-muted">{subtext}</p>
      {children && <div className="mt-5">{children}</div>}
    </div>
  );
}

/**
 * The list of decisions, grouped by time with pinned ones on top. Each group
 * is a heading and a list, so screen reader users can jump between groups and
 * hear how many decisions each holds. Covers loading, error and three empty
 * states: an empty room, no favorites, and no search results.
 */
export default function DecisionFeed({
  decisions,
  totalCount,
  loading = false,
  error = false,
  onRetry,
  members = [],
  currentUserId,
  permissionsFor,
  favoriteIds = new Set(),
  unreadIds = new Set(),
  myVotes = {},
  favoritesOnly = false,
  followedPeople = [],
  followedScopes = [],
  hasMore = false,
  remainingCount = 0,
  loadingMore = false,
  onLoadMore,
  onClearFavorites,
  onMarkAllRead,
  onToggleFavorite,
  onEditDecision,
  onDeleteDecision,
  onTogglePinned,
  onMarkRead,
  onCastVote,
  onFollowPerson,
  onFollowScope,
}: DecisionFeedProps) {
  const { t, i18n } = useTranslation("feed");

  if (loading) {
    return (
      <div aria-busy="true" className="mx-auto flex max-w-2xl flex-col gap-4">
        <p role="status" className="sr-only">
          {t("loading")}
        </p>
        {Array.from({ length: 4 }, (_, i) => (
          <div
            key={i}
            aria-hidden="true"
            className="h-33 animate-shimmer rounded-lg border border-default bg-linear-to-r from-(--color-surface-sunken) via-(--color-surface) to-(--color-surface-sunken) bg-size-[800px_100%]"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Message role="alert" icon={<InboxIcon size={36} />} heading={t("error.heading")} subtext={t("error.subtext")}>
        {onRetry && (
          <Button variant="primary" onClick={onRetry}>
            {t("error.retry")}
          </Button>
        )}
      </Message>
    );
  }

  if (totalCount === 0) {
    return <Message icon={<InboxIcon size={36} />} heading={t("empty.noDecisions.heading")} subtext={t("empty.noDecisions.subtext")} />;
  }

  const pinned = favoritesOnly ? [] : decisions.filter((d) => d.pinned);
  const rest = favoritesOnly ? decisions : decisions.filter((d) => !d.pinned);

  if (rest.length === 0 && pinned.length === 0) {
    return favoritesOnly ? (
      <Message icon={<HeartIcon size={36} strokeWidth={1.5} />} heading={t("empty.noFavorites.heading")} subtext={t("empty.noFavorites.subtext")} />
    ) : (
      <Message icon={<SearchIcon size={36} strokeWidth={1.5} />} heading={t("empty.noResults.heading")} subtext={t("empty.noResults.subtext")} />
    );
  }

  const groups = GROUP_ORDER.map((group) => ({ group, items: rest.filter((d) => timeGroupOf(d.createdAt) === group) })).filter(
    (g) => g.items.length > 0,
  );

  const pin = (decision: Decision) => (
    <li key={decision.id}>
      <DecisionPin
        decision={favoritesOnly ? { ...decision, pinned: false } : decision}
        headingLevel={3}
        members={members}
        currentUserId={currentUserId}
        {...permissionsFor?.(decision)}
        isFavorite={favoriteIds.has(decision.id)}
        isUnread={unreadIds.has(decision.id)}
        myVote={myVotes[decision.id] ?? null}
        followedPeople={followedPeople}
        followedScopes={followedScopes}
        onToggleFavorite={onToggleFavorite}
        onEdit={onEditDecision}
        onDelete={onDeleteDecision}
        onTogglePinned={onTogglePinned}
        onMarkRead={onMarkRead}
        onCastVote={decision.alignment?.enabled ? (vote) => onCastVote?.(decision.id, vote) : undefined}
        onFollowPerson={onFollowPerson}
        onFollowScope={onFollowScope}
      />
    </li>
  );

  const groupHeading = "sticky top-0 z-(--z-sticky) bg-page";

  return (
    <section aria-label={t("feedLabel")} className="mx-auto flex max-w-2xl flex-col gap-4">
      {favoritesOnly && (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-default bg-danger-subtle px-4 py-2.5">
          <p className="inline-flex items-center gap-2 text-md font-semibold text-danger">
            <HeartIcon size={15} filled />
            {t("favoritesActive")}
          </p>
          {onClearFavorites && (
            <Button variant="ghost" size="sm" onClick={onClearFavorites}>
              {t("showAllDecisions")}
            </Button>
          )}
        </div>
      )}

      {unreadIds.size > 0 && onMarkAllRead && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onMarkAllRead}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-pill px-3.5 py-2 text-sm font-semibold text-accent hover:underline hover:underline-offset-2"
          >
            <CheckIcon size={14} strokeWidth={2.5} />
            {t("markAllRead", { count: unreadIds.size })}
          </button>
        </div>
      )}

      {pinned.length > 0 && (
        <div>
          <TimeGroupLabel label={t("timeGroup.important")} important className={groupHeading} />
          <ul className="flex flex-col gap-4">{pinned.map(pin)}</ul>
        </div>
      )}

      {groups.map(({ group, items }) => (
        <div key={group}>
          <TimeGroupLabel label={group === "earlier" ? t("timeGroup.earlier") : timeGroupLabel(group, i18n.language)} className={groupHeading} />
          <ul className="flex flex-col gap-4">{items.map(pin)}</ul>
        </div>
      ))}

      {hasMore && onLoadMore && (
        <div className="flex justify-center pt-5">
          <Button variant="secondary" onClick={onLoadMore} loading={loadingMore} loadingLabel={t("loadingMore")}>
            {remainingCount > 0 ? t("showMore", { count: remainingCount }) : t("loadMore")}
          </Button>
        </div>
      )}
    </section>
  );
}
