import { useEffect, useId, useMemo, useRef, useState, type FormEvent } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { useTranslation } from "react-i18next";
import Button from "../atoms/Button";
import ToggleSwitch from "../atoms/ToggleSwitch";
import ConfirmModal from "../molecules/ConfirmModal";
import MentionTextarea from "../molecules/MentionTextarea";
import ScopeField from "./compose/ScopeField";
import OwnerField from "./compose/OwnerField";
import LinksField from "./compose/LinksField";
import { FIELD_ERROR, FIELD_HINT, FIELD_LABEL, TEXT_INPUT } from "./compose/styles";
import { getAllScopes } from "../../lib/scopes";
import { CloseIcon } from "../../lib/icons";
import { cx } from "../../lib/cx";
import { DIALOG_BACKDROP } from "../../lib/dialogStyles";
import type { Decision, Member } from "../../types";

export interface DecisionDraft {
  /** Set when editing an existing decision. */
  id?: string;
  title: string;
  rationale: string;
  scopes: string[];
  responsibleIds: string[];
  links: string[];
  alignment: { votingDays: number; eligibleVoterIds: string[] } | null;
}

export interface ComposeOverlayProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Saves the decision. If it throws, the form stays open with an error and keeps the text. */
  onSubmit: (draft: DecisionDraft) => Promise<void> | void;
  members?: Member[];
  currentUserId?: string;
  /** The room's own scopes and how often each was used. */
  roomScopes?: Record<string, number>;
  /** Pass a decision to edit it instead of writing a new one. */
  initialData?: Decision | null;
  maxScopes?: number;
  maxOwners?: number;
  maxLinks?: number;
}

const TITLE_MAX = 80;
const CONTEXT_MAX = 280;
const PLACEHOLDER_COUNT = 8;

interface Fields {
  title: string;
  rationale: string;
  scopes: string[];
  responsibleIds: string[];
  links: string[];
  alignmentOn: boolean;
  votingDays: number;
}

function fieldsFrom(d?: Decision | null): Fields {
  return {
    title: d?.title ?? "",
    rationale: d?.rationale ?? "",
    scopes: d?.tags ?? [],
    responsibleIds: d?.responsibleIds ?? [],
    links: d?.links ?? [],
    alignmentOn: false,
    votingDays: 3,
  };
}

/** "12/80" on screen, "12 of 80 characters" for screen readers. */
function CharCount({ id, current, max }: { id: string; current: number; max: number }) {
  const { t } = useTranslation("compose");
  return (
    <>
      <span aria-hidden="true" className={cx("text-sm tabular-nums", current >= max ? "text-danger" : "text-muted")}>
        {current}/{max}
      </span>
      <span id={id} className="sr-only">
        {t("fields.charCount", { current, max })}
      </span>
    </>
  );
}

/**
 * Write or edit a decision. A Base UI Dialog: full screen on phones, centered
 * on larger screens. Closing with unsaved text asks first. While saving, the
 * Post button shows progress and the dialog can't be closed. If saving fails,
 * an error explains what happened and the text stays.
 */
export default function ComposeOverlay({
  open,
  onOpenChange,
  onSubmit,
  members = [],
  currentUserId,
  roomScopes,
  initialData = null,
  maxScopes,
  maxOwners,
  maxLinks,
}: ComposeOverlayProps) {
  const { t } = useTranslation(["compose", "common"]);
  const isEdit = !!initialData;
  const [fields, setFields] = useState<Fields>(() => fieldsFrom(initialData));
  const [tried, setTried] = useState(false);
  const [sending, setSending] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  const [confirmDiscard, setConfirmDiscard] = useState(false);

  const titleRef = useRef<HTMLInputElement>(null);
  const contextRef = useRef<HTMLTextAreaElement>(null);
  const ids = {
    title: useId(),
    titleError: useId(),
    titleCount: useId(),
    context: useId(),
    contextError: useId(),
    contextCount: useId(),
    votingWindow: useId(),
  };

  // Each time the dialog opens, start from the decision being edited (or empty)
  useEffect(() => {
    if (!open) return;
    setFields(fieldsFrom(initialData));
    setTried(false);
    setSubmitError(false);
  }, [open, initialData]);

  const example = useMemo(() => Math.floor(Math.random() * PLACEHOLDER_COUNT), [open]);
  const allScopes = useMemo(() => getAllScopes(roomScopes), [roomScopes]);

  const set = <K extends keyof Fields>(key: K, value: Fields[K]) => setFields((f) => ({ ...f, [key]: value }));
  const dirty = JSON.stringify(fields) !== JSON.stringify(fieldsFrom(initialData));
  const titleMissing = !fields.title.trim();
  const contextMissing = !fields.rationale.trim();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setTried(true);
    if (titleMissing) return titleRef.current?.focus();
    if (contextMissing) return contextRef.current?.focus();

    const voters = members.filter((m) => m.uid !== currentUserId).map((m) => m.uid);
    setSending(true);
    setSubmitError(false);
    try {
      await onSubmit({
        ...(isEdit ? { id: initialData.id } : {}),
        title: fields.title.trim(),
        rationale: fields.rationale.trim(),
        scopes: fields.scopes,
        responsibleIds: fields.responsibleIds,
        links: fields.links,
        alignment: !isEdit && fields.alignmentOn && voters.length > 0 ? { votingDays: fields.votingDays, eligibleVoterIds: voters } : null,
      });
      onOpenChange(false);
    } catch {
      setSubmitError(true);
    } finally {
      setSending(false);
    }
  }

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        if (next) return onOpenChange(true);
        if (sending) return;
        // Escape, the backdrop and the close button all land here
        if (dirty) setConfirmDiscard(true);
        else onOpenChange(false);
      }}
    >
      <Dialog.Portal>
        <Dialog.Backdrop className={DIALOG_BACKDROP} />
        <Dialog.Popup
          initialFocus={titleRef}
          className={cx(
            "fixed inset-0 z-(--z-dialog) flex flex-col bg-raised text-primary shadow-lg outline-none",
            "sm:inset-auto sm:top-1/2 sm:left-1/2 sm:max-h-[85vh] sm:w-[min(620px,calc(100vw-2rem))] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-lg sm:border sm:border-default",
            "transition-[opacity,translate,scale] duration-(--duration-base) ease-out",
            "data-starting-style:translate-y-6 data-starting-style:opacity-0 data-ending-style:translate-y-6 data-ending-style:opacity-0",
            "sm:data-starting-style:-translate-y-[calc(50%-1.5rem)] sm:data-ending-style:-translate-y-[calc(50%-1.5rem)]",
          )}
        >
          <div className="flex shrink-0 items-center justify-between border-b border-default px-5 py-4">
            <Dialog.Title className="text-lg font-bold">{isEdit ? t("header.editDecision") : t("header.newDecision")}</Dialog.Title>
            <Dialog.Close
              aria-label={t("common:actions.close")}
              className="inline-flex size-9 cursor-pointer items-center justify-center rounded-md border border-default text-secondary hover:bg-hover hover:text-primary"
            >
              <CloseIcon size={18} />
            </Dialog.Close>
          </div>

          <form noValidate onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
            <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto overscroll-contain px-5 py-5">
              {/* Title */}
              <div>
                <label htmlFor={ids.title} className={FIELD_LABEL}>
                  {t("fields.titleLabel")} <span className="sr-only">({t("fields.required")})</span>
                </label>
                <input
                  ref={titleRef}
                  id={ids.title}
                  type="text"
                  required
                  maxLength={TITLE_MAX}
                  value={fields.title}
                  onChange={(e) => set("title", e.target.value)}
                  placeholder={t("fields.titlePlaceholder", { example: t(`placeholders.${example}.title`) })}
                  aria-invalid={(tried && titleMissing) || undefined}
                  aria-describedby={cx(tried && titleMissing && ids.titleError, ids.titleCount)}
                  className={TEXT_INPUT}
                />
                <div className="mt-1 flex items-start justify-between gap-3">
                  {tried && titleMissing ? (
                    <p id={ids.titleError} className={FIELD_ERROR}>
                      {t("fields.titleRequired")}
                    </p>
                  ) : (
                    <span />
                  )}
                  <CharCount id={ids.titleCount} current={fields.title.length} max={TITLE_MAX} />
                </div>
              </div>

              {/* Context */}
              <div>
                <label htmlFor={ids.context} className={FIELD_LABEL}>
                  {t("fields.contextLabel")} <span className="sr-only">({t("fields.required")})</span>
                </label>
                <MentionTextarea
                  id={ids.context}
                  inputRef={contextRef}
                  value={fields.rationale}
                  onChange={(v) => set("rationale", v)}
                  members={members}
                  currentUserId={currentUserId}
                  maxLength={CONTEXT_MAX}
                  rows={4}
                  placeholder={t("fields.contextPlaceholder", { example: t(`placeholders.${example}.context`) })}
                  aria-invalid={tried && contextMissing}
                  aria-describedby={cx(tried && contextMissing && ids.contextError, ids.contextCount)}
                />
                <div className="mt-1 flex items-start justify-between gap-3">
                  {tried && contextMissing ? (
                    <p id={ids.contextError} className={FIELD_ERROR}>
                      {t("fields.contextRequired")}
                    </p>
                  ) : /https?:|www\./i.test(fields.rationale) && !/\]\(https?:\/\//.test(fields.rationale) ? (
                    <p className={FIELD_HINT}>{t("fields.linkTip")}</p>
                  ) : (
                    <span />
                  )}
                  <CharCount id={ids.contextCount} current={fields.rationale.length} max={CONTEXT_MAX} />
                </div>
              </div>

              <ScopeField value={fields.scopes} onChange={(v) => set("scopes", v)} allScopes={allScopes} max={maxScopes} />

              <OwnerField
                value={fields.responsibleIds}
                onChange={(v) => set("responsibleIds", v)}
                members={members}
                currentUserId={currentUserId}
                max={maxOwners}
              />

              <LinksField value={fields.links} onChange={(v) => set("links", v)} max={maxLinks} />

              {!isEdit && (
                <div className="flex flex-col gap-2">
                  <ToggleSwitch
                    checked={fields.alignmentOn}
                    onCheckedChange={(on) => set("alignmentOn", on)}
                    label={t("alignment.toggleLabel")}
                    detail={fields.alignmentOn ? undefined : t("alignment.toggleDetail")}
                  />
                  {fields.alignmentOn && (
                    <div className="flex items-center gap-3 px-2">
                      <label htmlFor={ids.votingWindow} className="text-sm whitespace-nowrap text-secondary">
                        {t("alignment.votingWindow")}
                      </label>
                      <input
                        id={ids.votingWindow}
                        type="range"
                        min={1}
                        max={10}
                        value={fields.votingDays}
                        aria-valuetext={t("alignment.day", { count: fields.votingDays })}
                        onChange={(e) => set("votingDays", Number(e.target.value))}
                        className="flex-1 accent-(--color-accent-solid)"
                      />
                      <output htmlFor={ids.votingWindow} className="min-w-14 text-right text-sm font-semibold tabular-nums">
                        {t("alignment.day", { count: fields.votingDays })}
                      </output>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="shrink-0 border-t border-default px-5 py-4">
              {submitError && (
                <p role="alert" className="mb-3 rounded-md bg-danger-subtle px-3 py-2 text-sm text-danger">
                  {t("submitError")}
                </p>
              )}
              <Button
                type="submit"
                variant="primary"
                className="w-full"
                loading={sending}
                loadingLabel={isEdit ? t("header.saving") : t("header.posting")}
              >
                {isEdit ? t("header.saveChanges") : t("header.post")}
              </Button>
            </div>
          </form>

          <ConfirmModal
            open={confirmDiscard}
            onClose={() => setConfirmDiscard(false)}
            onConfirm={() => {
              setConfirmDiscard(false);
              onOpenChange(false);
            }}
            title={t("discard.title")}
            message={t("discard.message")}
            confirmLabel={t("discard.confirm")}
            cancelLabel={t("discard.keep")}
            danger
          />
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
