import { useEffect, useId, useMemo, useRef, useState, type MouseEvent as ReactMouseEvent, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import Avatar from "../atoms/Avatar";
import ConfirmModal from "./ConfirmModal";
import { useToast } from "../../lib/toast";
import { formatDate } from "../../lib/dates";
import { cx } from "../../lib/cx";
import {
  BallotIcon,
  CheckIcon,
  ChevronDownIcon,
  EditIcon,
  ExternalIcon,
  FigmaLogo,
  FollowIcon,
  HeartIcon,
  LinkIcon,
  PinIcon,
  PlusIcon,
  SlackLogo,
  TrashIcon,
} from "../../lib/icons";
import type { Decision, Member, Vote } from "../../types";

export interface DecisionPinProps {
  decision: Decision;
  members?: Member[];
  currentUserId?: string;
  /** What the current user may do. The parent decides; the card only shows the buttons. */
  canEdit?: boolean;
  canDelete?: boolean;
  canPin?: boolean;
  isFavorite?: boolean;
  isUnread?: boolean;
  myVote?: Vote | null;
  followedPeople?: string[];
  followedScopes?: string[];
  /** Hides the action rail and makes scopes plain labels. */
  readOnly?: boolean;
  /** Heading level of the title, so the card fits the page outline. */
  headingLevel?: 2 | 3 | 4;
  onToggleFavorite?: (id: string) => void;
  onEdit?: (decision: Decision) => void;
  onDelete?: (id: string) => void;
  onTogglePinned?: (id: string, pinned: boolean) => void;
  onMarkRead?: (id: string) => void;
  onCastVote?: (vote: Vote) => void;
  onFollowPerson?: (uid: string, name: string, follow: boolean) => void;
  onFollowScope?: (scope: string, follow: boolean) => void;
  /** Builds the link that "Copy link" puts on the clipboard. */
  getLink?: (id: string) => string;
}

type Segment = { type: "text"; value: string } | { type: "link"; label: string; url: string } | { type: "mention"; name: string };

/** Splits text into plain text, [label](url) links and @mentions of known members. */
function parseRichText(text: string, memberNames: string[]): Segment[] {
  const link = "\\[([^\\]]+)\\]\\((https?:\\/\\/[^)]+)\\)";
  const names = [...memberNames].sort((a, b) => b.length - a.length).map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const mention = names.length ? `@(${names.join("|")})(?=\\s|$|[.,;:!?])` : null;
  const regex = new RegExp(mention ? `${link}|${mention}` : link, "g");
  const segments: Segment[] = [];
  let last = 0;
  for (const match of text.matchAll(regex)) {
    const index = match.index ?? 0;
    if (index > last) segments.push({ type: "text", value: text.slice(last, index) });
    if (match[1] !== undefined) segments.push({ type: "link", label: match[1], url: match[2] });
    else segments.push({ type: "mention", name: match[3] });
    last = index + match[0].length;
  }
  if (last < text.length) segments.push({ type: "text", value: text.slice(last) });
  return segments;
}

/** Only real web addresses become links. */
function webUrl(url?: string): string | null {
  return typeof url === "string" && /^https?:\/\//i.test(url) ? url : null;
}

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

const SOURCE_NAME = { slack: "Slack", figma: "Figma" } as const;

const RAIL_BUTTON =
  "inline-flex size-8 cursor-pointer items-center justify-center rounded-md text-rail transition-colors duration-(--duration-fast) hover:bg-rail-hover hover:text-rail-hover focus-visible:outline-on-solid";

const LINK_CHIP =
  "inline-flex max-w-60 items-center gap-1.5 rounded-pill border border-default bg-sunken px-3 py-1 text-sm font-medium text-secondary no-underline transition-colors duration-(--duration-fast) hover:border-accent hover:text-accent";

function DetailRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="mt-4 border-t border-default pt-4">
      <h4 className="mb-2 text-xs font-bold tracking-wide text-muted uppercase">{label}</h4>
      {children}
    </div>
  );
}

/**
 * One decision in the feed. Collapsed, it shows the author, title, rationale
 * and date. If there is more (scopes, sources, owners, links, a vote), the
 * "Show details" button expands the card in place. Clicking the card does
 * the same for mouse users, and Escape collapses it again.
 */
export default function DecisionPin({
  decision,
  members = [],
  currentUserId,
  canEdit = false,
  canDelete = false,
  canPin = false,
  isFavorite = false,
  isUnread = false,
  myVote = null,
  followedPeople = [],
  followedScopes = [],
  readOnly = false,
  headingLevel = 3,
  onToggleFavorite,
  onEdit,
  onDelete,
  onTogglePinned,
  onMarkRead,
  onCastVote,
  onFollowPerson,
  onFollowScope,
  getLink = (id) => `${window.location.origin}${window.location.pathname}?pin=${id}`,
}: DecisionPinProps) {
  const { t, i18n } = useTranslation("feed");
  const showToast = useToast();
  const titleId = useId();
  const detailsId = useId();
  const cardRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { title, rationale, tags = [], createdAt, editedAt, source, pinned } = decision;
  const authorName = decision.authorName || t("card.unknownAuthor");
  const memberNames = useMemo(() => members.map((m) => m.displayName).filter(Boolean), [members]);
  const followsAuthor = followedPeople.includes(decision.authorId);
  const Title = `h${headingLevel}` as const;

  const figmaPage = webUrl(decision.figmaPageUrl);
  const figmaFile = webUrl(decision.figmaFileUrl);
  const links = (decision.links ?? []).filter((u) => webUrl(u));
  const responsible = decision.responsibleIds ?? [];

  const a = decision.alignment;
  const voteOpen = !!a?.enabled && !a.closed && new Date() < new Date(a.votingDeadline);
  const isAuthor = decision.authorId === currentUserId;
  const canVote = voteOpen && !isAuthor && !!currentUserId && !!a?.eligibleVoterIds?.includes(currentUserId) && !readOnly;
  const showResults = !!a?.enabled && !voteOpen;
  const needsVote = canVote && (!myVote || myVote === "abstain");

  const hasDetail = tags.length > 0 || !!figmaPage || !!figmaFile || responsible.length > 0 || links.length > 0 || !!a?.enabled;

  // While open: Escape or a click outside the card closes it
  useEffect(() => {
    if (!expanded) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && cardRef.current?.contains(document.activeElement)) {
        setExpanded(false);
        // The details are about to hide, so focus moves back to the button that opened them
        toggleRef.current?.focus();
      }
    };
    const onDown = (e: MouseEvent) => {
      if (confirmDelete) return; // the delete dialog sits outside the card
      if (!cardRef.current?.contains(e.target as Node)) setExpanded(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
    };
  }, [expanded, confirmDelete]);

  function toggle() {
    if (!expanded && isUnread) onMarkRead?.(decision.id);
    setExpanded((v) => !v);
  }

  // Mouse shortcut: a click anywhere on the card that isn't a link, button or selected text
  function onCardClick(e: ReactMouseEvent) {
    if ((e.target as HTMLElement).closest("a, button, input, textarea")) return;
    if (window.getSelection()?.toString()) return;
    if (hasDetail && !expanded) toggle();
    else if (isUnread) onMarkRead?.(decision.id);
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(getLink(decision.id));
      showToast(t("card.actions.linkCopied"), "success");
    } catch {
      // Clipboard can be blocked (permissions, insecure page). Nothing to undo.
    }
  }

  const body = parseRichText(rationale, memberNames).map((seg, i) =>
    seg.type === "mention" ? (
      <span key={i} className="font-semibold text-accent">
        @{seg.name}
      </span>
    ) : seg.type === "link" ? (
      <a key={i} href={seg.url} target="_blank" rel="noopener noreferrer" className="text-accent underline underline-offset-2">
        {seg.label}
      </a>
    ) : (
      <span key={i}>{seg.value}</span>
    ),
  );

  return (
    <>
      {/* The click is a mouse shortcut. Keyboard and screen reader users open the card
          with the "Show details" button, so the article itself needs no key handler. */}
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions */}
      <article
        ref={cardRef}
        aria-labelledby={titleId}
        data-decision-id={decision.id}
        onClick={onCardClick}
        className={cx(
          "relative flex overflow-hidden rounded-lg border bg-surface shadow-sm transition-[box-shadow,border-color] duration-(--duration-base)",
          pinned ? "border-highlight ring-1 ring-(--color-highlight)" : "border-default hover:border-strong",
          expanded ? "shadow-md" : "hover:shadow-md",
          hasDetail && !expanded && "cursor-pointer",
        )}
      >
        {isUnread && <span aria-hidden="true" className="absolute top-4 bottom-4 left-0 w-0.75 rounded-r-sm bg-accent" />}

        <div className="min-w-0 flex-1 px-6 py-5">
          {/* Author, date, status */}
          <div className="flex items-center gap-2.5">
            <Avatar name={authorName} photoURL={decision.authorPhoto} size="lg" />
            <p className="flex min-w-0 flex-wrap items-center gap-x-1.5 text-sm text-muted">
              <span className="text-md font-bold text-primary">{authorName}</span>
              <span aria-hidden="true">·</span>
              <time dateTime={createdAt}>{formatDate(createdAt, i18n.language)}</time>
              {editedAt && <span className="italic">{t("card.edited")}</span>}
              {isUnread && <span className="sr-only">, {t("card.unread")}</span>}
              {pinned && <span className="sr-only">, {t("card.pinned")}</span>}
            </p>
            <div className="ml-auto flex shrink-0 items-center gap-1.5">
              {needsVote && (
                <span className="inline-flex items-center gap-1 rounded-pill bg-highlight px-2 py-0.5 text-xs font-bold text-highlight">
                  <BallotIcon size={12} />
                  {t("card.voteNeeded")}
                </span>
              )}
              {source && (
                <span className="inline-flex size-8 items-center justify-center" title={t("card.sentFrom", { source: SOURCE_NAME[source] })}>
                  {source === "slack" ? <SlackLogo /> : <FigmaLogo />}
                  <span className="sr-only">{t("card.sentFrom", { source: SOURCE_NAME[source] })}</span>
                </span>
              )}
              {hasDetail && (
                <button
                  type="button"
                  ref={toggleRef}
                  onClick={toggle}
                  aria-expanded={expanded}
                  aria-controls={detailsId}
                  aria-label={expanded ? t("card.hideDetails") : t("card.showDetails")}
                  className="inline-flex size-8 cursor-pointer items-center justify-center rounded-md text-muted hover:bg-hover hover:text-primary"
                >
                  <ChevronDownIcon size={18} className={cx("transition-transform duration-(--duration-slow)", expanded && "rotate-180")} />
                </button>
              )}
            </div>
          </div>

          <Title id={titleId} className="mt-3.5 text-xl font-bold tracking-tight text-primary">
            {title}
          </Title>
          <p className="mt-2.5 text-base whitespace-pre-wrap text-secondary">{body}</p>

          {/* Details: the grid row animates from 0 to full height. `inert` keeps hidden links out of the Tab order. */}
          {hasDetail && (
            <div
              id={detailsId}
              inert={!expanded}
              className={cx(
                "grid transition-[grid-template-rows] duration-(--duration-slow) ease-standard",
                expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
              )}
            >
              <div className="min-h-0 overflow-hidden">
                {tags.length > 0 && (
                  <DetailRow label={t("card.tagsLabel")}>
                    <ul className="flex flex-wrap gap-2">
                      {tags.map((tag) => {
                        const followed = followedScopes.includes(tag);
                        return (
                          <li key={tag}>
                            {readOnly || !onFollowScope ? (
                              <span className="inline-flex rounded-pill bg-accent-subtle px-3 py-1 text-sm font-semibold text-accent-subtle">{tag}</span>
                            ) : (
                              <button
                                type="button"
                                aria-pressed={followed}
                                onClick={() => onFollowScope(tag, !followed)}
                                className={cx(
                                  "group inline-flex cursor-pointer items-center gap-1.5 rounded-pill border px-3 py-1 text-sm font-semibold transition-colors duration-(--duration-fast)",
                                  followed
                                    ? "border-transparent bg-accent text-on-solid"
                                    : "border-transparent bg-accent-subtle text-accent-subtle hover:border-accent",
                                )}
                              >
                                {followed ? <CheckIcon size={12} /> : <PlusIcon size={12} />}
                                {tag}
                                <span
                                  aria-hidden="true"
                                  className="hidden border-l border-current pl-1.5 group-hover:inline group-focus-visible:inline"
                                >
                                  {followed ? t("card.scopeTooltip.unfollow") : t("card.scopeTooltip.follow")}
                                </span>
                              </button>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </DetailRow>
                )}

                {(figmaPage || figmaFile) && (
                  <DetailRow label={t("card.sourceLabel")}>
                    <div className="flex flex-wrap gap-2">
                      {figmaPage && (
                        <a href={figmaPage} target="_blank" rel="noopener noreferrer" className={LINK_CHIP}>
                          <ExternalIcon size={13} />
                          <span className="truncate">{decision.figmaPageName || t("card.sources.figmaPage")}</span>
                        </a>
                      )}
                      {figmaFile && (
                        <a href={figmaFile} target="_blank" rel="noopener noreferrer" className={LINK_CHIP}>
                          <ExternalIcon size={13} />
                          <span className="truncate">{decision.figmaFileName || t("card.sources.figmaFile")}</span>
                        </a>
                      )}
                    </div>
                  </DetailRow>
                )}

                {responsible.length > 0 && (
                  <DetailRow label={t("card.responsible")}>
                    <ul className="flex flex-wrap gap-4">
                      {responsible.map((uid) => {
                        const name = members.find((m) => m.uid === uid)?.displayName || t("card.unknownAuthor");
                        return (
                          <li key={uid} className="inline-flex items-center gap-2 text-sm text-secondary">
                            <Avatar name={name} photoURL={members.find((m) => m.uid === uid)?.photoURL} size="sm" />
                            {name}
                          </li>
                        );
                      })}
                    </ul>
                  </DetailRow>
                )}

                {links.length > 0 && (
                  <DetailRow label={t("card.linksLabel")}>
                    <ul className="flex flex-wrap gap-2">
                      {links.map((url) => (
                        <li key={url}>
                          <a href={url} target="_blank" rel="noopener noreferrer" className={LINK_CHIP}>
                            <ExternalIcon size={13} />
                            <span className="truncate">{hostOf(url)}</span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </DetailRow>
                )}

                {a?.enabled && (
                  <DetailRow label={t("card.alignmentLabel")}>
                    {canVote && (
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          aria-pressed={myVote === "aligned"}
                          onClick={() => onCastVote?.(myVote === "aligned" ? "abstain" : "aligned")}
                          className="cursor-pointer rounded-pill border border-strong bg-surface px-3 py-1.5 text-sm font-semibold text-secondary aria-pressed:border-success aria-pressed:bg-success-subtle aria-pressed:text-success"
                        >
                          {t("card.alignment.aligned")}
                        </button>
                        <button
                          type="button"
                          aria-pressed={myVote === "not_aligned"}
                          onClick={() => onCastVote?.(myVote === "not_aligned" ? "abstain" : "not_aligned")}
                          className="cursor-pointer rounded-pill border border-strong bg-surface px-3 py-1.5 text-sm font-semibold text-secondary aria-pressed:border-danger aria-pressed:bg-danger-subtle aria-pressed:text-danger"
                        >
                          {t("card.alignment.notAligned")}
                        </button>
                      </div>
                    )}
                    {showResults && (
                      <>
                        <div aria-hidden="true" className="flex h-1.75 overflow-hidden rounded-sm bg-sunken">
                          {[
                            ["bg-vote-aligned", a.aligned ?? 0],
                            ["bg-vote-not", a.notAligned ?? 0],
                            ["bg-vote-abstain", Math.max(0, (a.totalVoted ?? 0) - (a.aligned ?? 0) - (a.notAligned ?? 0))],
                          ].map(([color, n]) =>
                            Number(n) > 0 ? (
                              <div key={color} className={String(color)} style={{ width: `${(Number(n) / (a.eligibleVoterCount || 1)) * 100}%` }} />
                            ) : null,
                          )}
                        </div>
                        <p className="mt-2 text-sm text-muted">
                          {t("card.alignment.alignedCount", { count: a.aligned ?? 0 })} · {t("card.alignment.notAlignedCount", { count: a.notAligned ?? 0 })} ·{" "}
                          {t("card.alignment.votingClosed")}
                        </p>
                      </>
                    )}
                    {!canVote && !showResults && (
                      <p className="text-sm text-muted">
                        {t("card.alignment.waiting", { voted: a.totalVoted ?? 0, eligible: a.eligibleVoterCount ?? 0 })}
                      </p>
                    )}
                  </DetailRow>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Action rail. Toggles use aria-pressed, so the label stays the same and the state is announced. */}
        {!readOnly && (
          <div role="group" aria-label={t("card.actionsLabel")} className="flex w-11.5 shrink-0 flex-col items-center gap-0.5 bg-rail py-2.5">
            <button
              type="button"
              aria-pressed={isFavorite}
              aria-label={t("card.actions.favorite")}
              title={t("card.actions.favorite")}
              onClick={() => onToggleFavorite?.(decision.id)}
              className={cx(RAIL_BUTTON, isFavorite && "text-rail-favorite")}
            >
              <HeartIcon size={18} filled={isFavorite} />
            </button>
            <button type="button" aria-label={t("card.actions.copyLink")} title={t("card.actions.copyLink")} onClick={copyLink} className={RAIL_BUTTON}>
              <LinkIcon />
            </button>
            {canEdit && onEdit && (
              <button type="button" aria-label={t("card.actions.editDecision")} title={t("card.actions.editDecision")} onClick={() => onEdit(decision)} className={RAIL_BUTTON}>
                <EditIcon />
              </button>
            )}
            {canPin && onTogglePinned && (
              <button
                type="button"
                aria-pressed={!!pinned}
                aria-label={t("card.actions.pin")}
                title={t("card.actions.pin")}
                onClick={() => onTogglePinned(decision.id, !!pinned)}
                className={cx(RAIL_BUTTON, pinned && "text-rail-pinned")}
              >
                <PinIcon size={17} />
              </button>
            )}
            {!isAuthor && onFollowPerson && (
              <button
                type="button"
                aria-pressed={followsAuthor}
                aria-label={t("card.actions.follow", { name: authorName })}
                title={t("card.actions.follow", { name: authorName })}
                onClick={() => onFollowPerson(decision.authorId, authorName, !followsAuthor)}
                className={cx(RAIL_BUTTON, followsAuthor && "text-rail-following")}
              >
                <FollowIcon />
              </button>
            )}
            {canDelete && onDelete && (
              <button
                type="button"
                aria-label={t("card.actions.deleteDecision")}
                title={t("card.actions.deleteDecision")}
                onClick={() => setConfirmDelete(true)}
                className={cx(RAIL_BUTTON, "hover:bg-danger hover:text-on-solid")}
              >
                <TrashIcon />
              </button>
            )}
          </div>
        )}
      </article>

      <ConfirmModal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => {
          setConfirmDelete(false);
          onDelete?.(decision.id);
        }}
        title={t("card.deleteModal.title")}
        message={t("card.deleteModal.message", { title })}
        confirmLabel={t("card.deleteModal.confirm")}
        danger
      />
    </>
  );
}
