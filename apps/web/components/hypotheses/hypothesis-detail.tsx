"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  ArrowRight,
  CalendarClock,
  MessageSquare,
  Paperclip,
  Sparkles,
  X,
  Plus,
  Trash2,
  Loader2,
  CheckCircle2,
  Edit3,
  Reply,
  Send,
} from "lucide-react";
import {
  HypothesisActivity,
  HypothesisDetail,
  HypothesisStageEvent,
  HypothesisStageKey,
  HypothesisChecklistItem,
  HypothesisTask,
  HypothesisApproval,
  HypothesisActor,
  HypothesisComment,
} from "@/lib/hypothesis-data";
import { TransitionDialog } from "./transition-dialog";
import { cn } from "@/lib/utils";
import type {
  CommentInput,
  UpdateCommentInput,
  AttachmentInput,
  ChecklistItemInput,
  ChecklistItemUpdateInput,
  TaskUpdateInput,
  ApprovalUpdateInput,
} from "@/lib/hypothesis-api";

const CHECKLIST_STATUSES: HypothesisChecklistItem["status"][] = [
  "pending",
  "in-progress",
  "complete",
];

const TASK_STATUSES: HypothesisTask["status"][] = ["due-soon", "at-risk", "blocked"];
const TASK_SEVERITIES: HypothesisTask["severity"][] = ["medium", "high", "critical"];

function formatDate(value?: string | null, locale: string = "en-US") {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return parsed.toLocaleString(locale);
}

function formatInputDate(value?: string | null) {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "";
  }
  return parsed.toISOString().slice(0, 10);
}

function StageHistory({
  history,
  toStageLabel,
  locale,
}: {
  history: HypothesisStageEvent[];
  toStageLabel: (stage: HypothesisStageKey | null | undefined) => string;
  locale: string;
}) {
  return (
    <ol className="space-y-3">
      {history.map((event) => (
        <li
          key={`${event.stage}-${event.changedAt}`}
          className="rounded-2xl border border-border/60 bg-surface-muted/60 p-3"
        >
          <div className="flex items-center justify-between text-xs text-text-secondary">
            <span className="uppercase tracking-[0.2em] text-neon-green">
              {toStageLabel(event.stage as HypothesisStageKey | undefined)}
            </span>
            <span>{formatDate(event.changedAt, locale)}</span>
          </div>
          <p className="mt-1.5 text-sm font-medium text-text-primary">{event.changedBy}</p>
          {event.notes && <p className="mt-1 text-sm text-text-secondary">{event.notes}</p>}
        </li>
      ))}
    </ol>
  );
}

interface CommentsSectionProps {
  comments: HypothesisComment[];
  busy?: boolean;
  defaultActor: HypothesisActor;
  locale: string;
  onCreate?: (payload: CommentInput) => Promise<void>;
  onUpdate?: (commentId: string, payload: UpdateCommentInput) => Promise<void>;
  onDelete?: (commentId: string) => Promise<void>;
}

function CommentsSection({
  comments,
  busy = false,
  defaultActor,
  locale,
  onCreate,
  onUpdate,
  onDelete,
}: CommentsSectionProps) {
  const t = useTranslations("hypotheses.detailPanel.comments");
  const tCommon = useTranslations("common");
  const [newComment, setNewComment] = useState("");
  const [activeReply, setActiveReply] = useState<string | null>(null);
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [editing, setEditing] = useState<{ id: string; body: string } | null>(null);

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!newComment.trim() || !onCreate) return;
    try {
      await onCreate({
        body: newComment.trim(),
        author: defaultActor,
      });
      setNewComment("");
    } catch (error) {
      console.error("Failed to create comment", error);
    }
  };

  const handleReplyChange = (commentId: string, value: string) => {
    setReplyDrafts((prev) => ({ ...prev, [commentId]: value }));
  };

  const handleReplySubmit = async (event: FormEvent<HTMLFormElement>, commentId: string) => {
    event.preventDefault();
    const draft = replyDrafts[commentId];
    if (!draft?.trim() || !onCreate) return;
    try {
      await onCreate({
        body: draft.trim(),
        author: defaultActor,
        parentId: commentId,
      });
      setReplyDrafts((prev) => ({ ...prev, [commentId]: "" }));
      setActiveReply(null);
    } catch (error) {
      console.error("Failed to create reply", error);
    }
  };

  const handleToggleResolve = async (comment: HypothesisComment) => {
    if (!onUpdate) return;
    try {
      await onUpdate(comment.id, { isResolved: !comment.isResolved });
    } catch (error) {
      console.error("Failed to toggle resolution", error);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!onDelete) return;
    try {
      await onDelete(commentId);
      setEditing((prev) => (prev?.id === commentId ? null : prev));
      setActiveReply((prev) => (prev === commentId ? null : prev));
    } catch (error) {
      console.error("Failed to delete comment", error);
    }
  };

  const startEdit = (comment: HypothesisComment) => {
    setEditing({ id: comment.id, body: comment.body });
  };

  const handleEditSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editing || !onUpdate) return;
    const trimmed = editing.body.trim();
    if (!trimmed) return;
    try {
      await onUpdate(editing.id, { body: trimmed });
      setEditing(null);
    } catch (error) {
      console.error("Failed to update comment", error);
    }
  };

  const renderComment = (comment: HypothesisComment, depth = 0) => {
    const isEditing = editing?.id === comment.id;
    const replyValue = replyDrafts[comment.id] ?? "";
    const authorLabel = comment.author || tCommon("unknown");
    return (
      <li
        key={comment.id}
        className={cn(
          "rounded-2xl border border-border/60 bg-surface-muted/60 p-4",
          depth > 0 && "ml-4 border-dashed bg-surface-hover/40",
        )}
      >
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-text-secondary">
          <span className="font-semibold text-text-primary">{authorLabel}</span>
          <span>{formatDate(comment.createdAt, locale)}</span>
        </div>

        {isEditing ? (
          <form className="mt-2 space-y-2" onSubmit={handleEditSubmit}>
            <textarea
              className="w-full rounded-xl border border-border/60 bg-surface px-3 py-2 text-sm text-text-primary outline-none focus:border-neon-green"
              value={editing?.body ?? ""}
              onChange={(event) =>
                setEditing((prev) => (prev ? { ...prev, body: event.target.value } : prev))
              }
              rows={3}
              disabled={busy}
            />
            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-full border border-border/60 px-3 py-1.5 text-xs uppercase tracking-[0.2em] text-text-secondary transition duration-200 hover:border-neon-green/60 hover:text-neon-green disabled:opacity-60"
                disabled={busy}
              >
                <Send className="h-3.5 w-3.5" />
                {t("save")}
              </button>
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="inline-flex items-center gap-2 rounded-full border border-border/60 px-3 py-1.5 text-xs uppercase tracking-[0.2em] text-text-secondary/70 transition duration-200 hover:border-border hover:text-text-secondary"
                disabled={busy}
              >
                {t("cancel")}
              </button>
            </div>
          </form>
        ) : (
          <p className="mt-2 text-sm leading-relaxed text-text-primary">{comment.body}</p>
        )}

        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          <button
            type="button"
            onClick={() => startEdit(comment)}
            className="inline-flex items-center gap-1 rounded-full border border-border/60 px-3 py-1.5 uppercase tracking-[0.2em] text-text-secondary transition duration-200 hover:border-neon-green/60 hover:text-neon-green disabled:opacity-60"
            disabled={busy}
          >
            <Edit3 className="h-3.5 w-3.5" />
            {t("edit")}
          </button>
          <button
            type="button"
            onClick={() => handleToggleResolve(comment)}
            className={cn(
              "inline-flex items-center gap-1 rounded-full border px-3 py-1.5 uppercase tracking-[0.2em] transition duration-200",
              comment.isResolved
                ? "border-[rgba(0,255,136,0.4)] text-neon-green hover:border-[rgba(0,255,136,0.6)]"
                : "border-border/60 text-text-secondary hover:border-neon-green/60 hover:text-neon-green",
            )}
            disabled={busy}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            {comment.isResolved ? t("unresolve") : t("resolved")}
          </button>
          <button
            type="button"
            onClick={() => handleDelete(comment.id)}
            className="inline-flex items-center gap-1 rounded-full border border-border/60 px-3 py-1.5 uppercase tracking-[0.2em] text-[rgba(255,120,210,0.88)] transition duration-200 hover:border-[rgba(255,59,241,0.55)] hover:text-[rgba(255,59,241,0.88)] disabled:opacity-60"
            disabled={busy}
          >
            <Trash2 className="h-3.5 w-3.5" />
            {t("delete")}
          </button>
          {depth === 0 && (
            <button
              type="button"
              onClick={() => setActiveReply((prev) => (prev === comment.id ? null : comment.id))}
              className="inline-flex items-center gap-1 rounded-full border border-border/60 px-3 py-1.5 uppercase tracking-[0.2em] text-text-secondary transition duration-200 hover:border-neon-green/60 hover:text-neon-green disabled:opacity-60"
              disabled={busy}
            >
              <Reply className="h-3.5 w-3.5" />
              {t("reply")}
            </button>
          )}
        </div>

        {comment.replies.length > 0 && (
          <ul className="mt-3 space-y-2 border-l border-border/40 pl-3">
            {comment.replies.map((reply) => renderComment(reply, depth + 1))}
          </ul>
        )}

        {activeReply === comment.id && (
          <form
            className="mt-3 space-y-2"
            onSubmit={(event) => handleReplySubmit(event, comment.id)}
          >
            <textarea
              className="w-full rounded-xl border border-border/60 bg-surface px-3 py-2 text-sm text-text-primary outline-none focus:border-neon-green"
              rows={3}
              value={replyValue}
              onChange={(event) => handleReplyChange(comment.id, event.target.value)}
              disabled={busy}
              placeholder={t("replyPlaceholder")}
            />
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-full border border-border/60 px-3 py-1.5 text-xs uppercase tracking-[0.2em] text-text-secondary transition duration-200 hover:border-neon-green/60 hover:text-neon-green disabled:opacity-60"
              disabled={busy || replyValue.trim().length === 0}
            >
              <Send className="h-3.5 w-3.5" />
              {t("sendReply")}
            </button>
          </form>
        )}

        {comment.isResolved && (
          <span className="mt-3 inline-flex items-center gap-2 rounded-full border border-[rgba(0,255,136,0.4)] bg-[rgba(0,255,136,0.08)] px-3 py-1 text-xs uppercase tracking-[0.2em] text-neon-green">
            {t("resolved")}
          </span>
        )}
      </li>
    );
  };

  return (
    <div className="space-y-4">
      {comments.length === 0 && (
        <p className="rounded-2xl border border-dashed border-border/60 bg-surface-hover/40 p-4 text-sm text-text-secondary/70">
          {t("empty")}
        </p>
      )}

      {comments.length > 0 && <ul className="space-y-4">{comments.map((comment) => renderComment(comment))}</ul>}

      <form
        className="space-y-2 rounded-2xl border border-border/60 bg-surface-hover/50 p-4"
        onSubmit={handleCreate}
      >
        <label className="text-xs uppercase tracking-[0.2em] text-text-secondary/70">
          {t("newLabel")}
        </label>
        <textarea
          className="w-full rounded-xl border border-border/60 bg-surface px-3 py-2 text-sm text-text-primary outline-none focus:border-neon-green"
          rows={3}
          value={newComment}
          onChange={(event) => setNewComment(event.target.value)}
          disabled={busy}
          placeholder={t("placeholder")}
        />
        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-full border border-border/60 px-3 py-1.5 text-xs uppercase tracking-[0.2em] text-text-secondary transition duration-200 hover:border-neon-green/60 hover:text-neon-green disabled:opacity-60"
          disabled={busy || newComment.trim().length === 0}
        >
          <Plus className="h-3.5 w-3.5" />
          {t("addButton")}
        </button>
      </form>
    </div>
  );
}

interface HypothesisDetailPanelProps {
  detail: HypothesisDetail;
  activity?: HypothesisActivity[];
  onClose?: () => void;
  onStageChange?: (hypId: string, targetStage: HypothesisStageKey, actor: string) => void;
  busy?: boolean;
  onCommentCreate?: (hypId: string, payload: CommentInput) => Promise<void>;
  onCommentUpdate?: (
    hypId: string,
    commentId: string,
    payload: UpdateCommentInput,
  ) => Promise<void>;
  onCommentDelete?: (hypId: string, commentId: string) => Promise<void>;
  onAttachmentCreate?: (hypId: string, payload: AttachmentInput) => Promise<void>;
  onChecklistCreate?: (hypId: string, payload: ChecklistItemInput) => Promise<void>;
  onChecklistUpdate?: (
    hypId: string,
    itemId: string,
    payload: ChecklistItemUpdateInput,
  ) => Promise<void>;
  onChecklistDelete?: (hypId: string, itemId: string) => Promise<void>;
  onTaskUpdate?: (hypId: string, taskId: string, payload: TaskUpdateInput) => Promise<void>;
  onApprovalUpdate?: (
    hypId: string,
    approvalId: string,
    payload: ApprovalUpdateInput,
  ) => Promise<void>;
}

export function HypothesisDetailPanel({
  detail,
  activity = [],
  onClose,
  onStageChange,
  busy = false,
  onCommentCreate,
  onCommentUpdate,
  onCommentDelete,
  onAttachmentCreate,
  onChecklistCreate,
  onChecklistUpdate,
  onChecklistDelete,
  onTaskUpdate,
  onApprovalUpdate,
}: HypothesisDetailPanelProps) {
  const locale = useLocale();
  const t = useTranslations("hypotheses.detailPanel");
  const tCommon = useTranslations("common");
  const tKanban = useTranslations("hypotheses.kanban");
  const tStages = useTranslations("hypotheses.stages");

  const [transitionOpen, setTransitionOpen] = useState(false);
  const currentStage = (detail.stage as HypothesisStageKey) ?? "IDEATION";

  const stageLabel = (stage?: HypothesisStageKey | null) =>
    stage ? tStages(stage) : tCommon("unknown");

  const stageHealthKeyMap: Record<string, string> = {
    "on-track": "onTrack",
    warning: "warning",
    risk: "risk",
  };

  const stageHealthLabel = detail.stageHealth
    ? tKanban(`health.${stageHealthKeyMap[detail.stageHealth] ?? "warning"}`)
    : tCommon("unknown");

  const stageHistory = useMemo(
    () =>
      [...(detail.stageHistory ?? [])].sort(
        (a, b) => new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime(),
      ),
    [detail.stageHistory],
  );

  const defaultActor = useMemo<HypothesisActor>(() => {
    const primary = detail.owners?.[0];
    return {
      name: primary?.name ?? detail.owner ?? "K2 Team",
      email: primary?.email ?? "team@k2tech.ai",
      role: primary?.role,
      department: primary?.department,
    };
  }, [detail]);

  const [attachmentName, setAttachmentName] = useState("");
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [attachmentVersion, setAttachmentVersion] = useState("1");
  const [checklistDraft, setChecklistDraft] = useState({ label: "", owner: "", due: "" });

  const initialApprovalNotes = useMemo(
    () =>
      Object.fromEntries(
        (detail.approvals ?? []).map((approval) => [approval.id, approval.notes ?? ""]),
      ),
    [detail.approvals],
  );
  const [approvalNotes, setApprovalNotes] = useState<Record<string, string>>(initialApprovalNotes);

  useEffect(() => {
    setApprovalNotes(initialApprovalNotes);
  }, [initialApprovalNotes]);

  const handleStageTransition = (targetStage: HypothesisStageKey) => {
    if (busy) return;
    onStageChange?.(detail.id, targetStage, defaultActor.name);
  };

  const handleAttachmentSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!onAttachmentCreate) return;
    if (!attachmentName.trim() || !attachmentUrl.trim()) return;

    const version = Number.parseInt(attachmentVersion, 10);
    await onAttachmentCreate(detail.id, {
      name: attachmentName.trim(),
      url: attachmentUrl.trim(),
      version: Number.isNaN(version) ? undefined : version,
      uploadedBy: defaultActor.name,
      uploadedByEmail: defaultActor.email,
    });

    setAttachmentName("");
    setAttachmentUrl("");
    setAttachmentVersion("1");
  };

  const handleChecklistSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!onChecklistCreate) return;
    if (!checklistDraft.label.trim()) return;
    await onChecklistCreate(detail.id, {
      label: checklistDraft.label.trim(),
      owner: checklistDraft.owner.trim() || undefined,
      dueAt: checklistDraft.due ? new Date(checklistDraft.due).toISOString() : undefined,
    });
    setChecklistDraft({ label: "", owner: "", due: "" });
  };

  const handleChecklistStatusChange = async (
    item: HypothesisChecklistItem,
    nextStatus: HypothesisChecklistItem["status"],
  ) => {
    if (!onChecklistUpdate || !item.id) return;
    await onChecklistUpdate(detail.id, item.id, { status: nextStatus });
  };

  const handleChecklistDelete = async (item: HypothesisChecklistItem) => {
    if (!onChecklistDelete || !item.id) return;
    await onChecklistDelete(detail.id, item.id);
  };

  const handleTaskStatusChange = async (
    task: HypothesisTask,
    nextStatus: HypothesisTask["status"],
  ) => {
    if (!onTaskUpdate) return;
    await onTaskUpdate(detail.id, task.id, { status: nextStatus });
  };

  const handleTaskSeverityChange = async (
    task: HypothesisTask,
    severity: HypothesisTask["severity"],
  ) => {
    if (!onTaskUpdate) return;
    await onTaskUpdate(detail.id, task.id, { severity });
  };

  const handleTaskDueChange = async (task: HypothesisTask, nextDate: string) => {
    if (!onTaskUpdate || !nextDate) return;
    await onTaskUpdate(detail.id, task.id, { dueAt: new Date(nextDate).toISOString() });
  };

  const handleApprovalStatus = async (
    approval: HypothesisApproval,
    status: HypothesisApproval["status"],
  ) => {
    if (!onApprovalUpdate) return;
    await onApprovalUpdate(detail.id, approval.id, {
      status,
      notes: approvalNotes[approval.id] ?? approval.notes ?? "",
    });
  };

  const handleApprovalNoteSave = async (approval: HypothesisApproval) => {
    if (!onApprovalUpdate) return;
    await onApprovalUpdate(detail.id, approval.id, {
      notes: approvalNotes[approval.id] ?? "",
    });
  };

  return (
    <div className="fixed inset-4 z-50 flex flex-col rounded-3xl border border-border/70 bg-surface/95 shadow-[0_0_64px_rgba(0,0,0,0.45)] backdrop-blur-md">
      <header className="flex items-start justify-between gap-4 border-b border-border/50 px-6 py-5">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] uppercase tracking-[0.32em] text-text-secondary/60">
            {detail.owner}
          </p>
          <h2 className="mt-1.5 text-2xl font-semibold leading-tight text-text-primary">
            {detail.title}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-text-secondary">{detail.description}</p>
        </div>
        <div className="flex flex-col items-end gap-3">
          {busy && (
            <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-neon-green/80">
              <Loader2 className="h-4 w-4 animate-spin" />
              {t("syncing")}
            </span>
          )}
          <button
            type="button"
            onClick={() => setTransitionOpen(true)}
            className={cn(
              "relative overflow-hidden rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-base transition duration-200 ease-soft-spring",
              busy ? "opacity-60" : "shadow-neon hover:shadow-neon-hover",
            )}
            disabled={busy}
          >
            <span className="absolute inset-0 bg-[linear-gradient(135deg,rgba(0,255,136,0.85),rgba(64,224,208,0.85))]" />
            <span className="relative flex items-center gap-2">
              <ArrowRight className="h-4 w-4" />
              {t("advanceStage")}
            </span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/60 text-text-secondary transition duration-200 hover:border-neon-green/60 hover:text-neon-green"
          >
            <X className="h-5 w-5" />
            <span className="sr-only">{t("close")}</span>
          </button>
        </div>
      </header>

      <div className="flex flex-1 gap-6 overflow-hidden px-6 py-5">
        <div className="flex w-2/3 flex-col gap-5 overflow-y-auto pr-2">
          <section className="rounded-3xl border border-border/60 bg-surface-muted/60 p-4">
            <h3 className="text-sm font-semibold text-text-primary">{t("portfolioProfile")}</h3>
            <div className="mt-3 grid grid-cols-2 gap-3 text-sm text-text-secondary">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-text-secondary/60">
                  {t("stage")}
                </p>
                <p className="mt-1 text-base font-semibold text-neon-green">
                  {stageLabel(currentStage)}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-text-secondary/60">
                  {t("stageHealth")}
                </p>
                <p className="mt-1 text-base font-semibold text-text-primary">{stageHealthLabel}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-text-secondary/60">
                  {tCommon("impact")}
                </p>
                <p className="mt-1 text-lg font-semibold text-text-primary">
                  {Number(detail.impact ?? 0).toFixed(1)}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-text-secondary/60">
                  {tCommon("feasibility")}
                </p>
                <p className="mt-1 text-lg font-semibold text-text-primary">
                  {Number(detail.feasibility ?? 0).toFixed(1)}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-text-secondary/60">
                  {tCommon("confidence")}
                </p>
                <p className="mt-1 text-lg font-semibold text-text-primary">
                  {Math.round(Number(detail.confidence ?? 0) * 100)}%
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-text-secondary/60">
                  {t("targetValue")}
                </p>
                <p className="mt-1 text-sm text-text-primary">{detail.targetValue ?? "—"}</p>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-border/60 bg-surface-muted/60 p-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-text-primary">
              <CalendarClock className="h-4 w-4 text-neon-green" />
              {t("historyTitle")}
            </h3>
            {stageHistory.length === 0 ? (
              <p className="mt-3 rounded-xl border border-dashed border-border/60 bg-surface-hover/40 p-4 text-center text-sm text-text-secondary/70">
                {t("historyEmpty")}
              </p>
            ) : (
              <div className="mt-3">
                <StageHistory history={stageHistory} toStageLabel={stageLabel} locale={locale} />
              </div>
            )}
          </section>

          <section className="rounded-3xl border border-border/60 bg-surface-muted/60 p-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-text-primary">
              <CheckCircle2 className="h-4 w-4 text-neon-green" />
              {t("checklist.title")}
            </h3>
            <ul className="mt-3 space-y-3">
              {(detail.gatingChecklist ?? []).map((item) => (
                <li
                  key={item.id ?? item.label}
                  className="rounded-2xl border border-border/60 bg-surface-hover/50 p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-text-primary">{item.label}</p>
                      <p className="text-xs text-text-secondary">
                        {t("checklist.ownerLabel", {
                          owner: item.owner ?? tCommon("unknown"),
                        })}
                      </p>
                      <p className="text-xs text-text-secondary">
                        {t("checklist.dueLabel", {
                          due: item.dueAt ? formatDate(item.dueAt, locale) : "—",
                        })}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2 text-xs">
                      <select
                        className="rounded-md border border-border/60 bg-surface px-2 py-1 text-sm text-text-primary outline-none focus:border-neon-green"
                        value={item.status}
                        onChange={(event) =>
                          handleChecklistStatusChange(
                            item,
                            event.target.value as HypothesisChecklistItem["status"],
                          )
                        }
                        disabled={busy || !item.id}
                      >
                        {CHECKLIST_STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {t(`checklist.status.${status}`)}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => handleChecklistDelete(item)}
                        className="inline-flex items-center gap-1 rounded-full border border-border/60 px-3 py-1.5 uppercase tracking-[0.2em] text-[rgba(255,120,210,0.88)] transition duration-200 hover:border-[rgba(255,59,241,0.55)] hover:text-[rgba(255,59,241,0.88)] disabled:opacity-60"
                        disabled={busy || !item.id}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        {t("checklist.delete")}
                      </button>
                    </div>
                  </div>
                </li>
              ))}
              {(detail.gatingChecklist ?? []).length === 0 && (
                <li className="rounded-xl border border-dashed border-border/60 bg-surface-hover/40 p-4 text-center text-sm text-text-secondary/70">
                  {t("checklist.empty")}
                </li>
              )}
            </ul>

            <form
              className="mt-4 space-y-3 rounded-2xl border border-dashed border-border/50 bg-surface/60 p-4"
              onSubmit={handleChecklistSubmit}
            >
              <p className="text-xs uppercase tracking-[0.2em] text-text-secondary/70">
                {t("checklist.addTitle")}
              </p>
              <div className="grid gap-3 sm:grid-cols-3">
                <input
                  className="rounded-md border border-border/60 bg-surface px-3 py-2 text-sm text-text-primary outline-none focus:border-neon-green"
                  placeholder={t("checklist.labelPlaceholder")}
                  value={checklistDraft.label}
                  onChange={(event) =>
                    setChecklistDraft((prev) => ({ ...prev, label: event.target.value }))
                  }
                  disabled={busy}
                  required
                />
                <input
                  className="rounded-md border border-border/60 bg-surface px-3 py-2 text-sm text-text-primary outline-none focus:border-neon-green"
                  placeholder={t("checklist.ownerPlaceholder")}
                  value={checklistDraft.owner}
                  onChange={(event) =>
                    setChecklistDraft((prev) => ({ ...prev, owner: event.target.value }))
                  }
                  disabled={busy}
                />
                <input
                  type="date"
                  className="rounded-md border border-border/60 bg-surface px-3 py-2 text-sm text-text-primary outline-none focus:border-neon-green"
                  value={checklistDraft.due}
                  onChange={(event) =>
                    setChecklistDraft((prev) => ({ ...prev, due: event.target.value }))
                  }
                  disabled={busy}
                  placeholder={t("checklist.duePlaceholder")}
                />
              </div>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-full border border-border/60 px-3 py-1.5 text-xs uppercase tracking-[0.2em] text-text-secondary transition duration-200 hover:border-neon-green/60 hover:text-neon-green disabled:opacity-60"
                disabled={busy || checklistDraft.label.trim().length === 0}
              >
                <Plus className="h-3.5 w-3.5" />
                {t("checklist.addButton")}
              </button>
            </form>
          </section>

          <section className="rounded-3xl border border-border/60 bg-surface-muted/60 p-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-text-primary">
              <Paperclip className="h-4 w-4 text-neon-green" />
              {t("attachments.title")}
            </h3>
            <ul className="mt-3 space-y-2">
              {(detail.attachments ?? []).map((attachment) => (
                <li
                  key={attachment.id}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-border/60 bg-surface-hover/50 px-3 py-2 text-sm text-text-secondary"
                >
                  <div className="flex flex-col">
                    <a
                      href={attachment.url}
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium text-text-primary underline-offset-2 hover:underline"
                    >
                      {attachment.name}
                    </a>
                    <span className="text-xs text-text-secondary/70">
                      {t("attachments.meta", {
                        owner: attachment.uploadedBy ?? tCommon("unknown"),
                      })}
                    </span>
                  </div>
                  <span className="whitespace-nowrap text-xs text-text-secondary">
                    v{attachment.version} · {formatDate(attachment.uploadedAt, locale)}
                  </span>
                </li>
              ))}
              {(detail.attachments ?? []).length === 0 && (
                <li className="rounded-xl border border-dashed border-border/60 bg-surface-hover/40 p-4 text-center text-sm text-text-secondary/70">
                  {t("attachments.empty")}
                </li>
              )}
            </ul>

            <form
              className="mt-4 space-y-3 rounded-2xl border border-dashed border-border/50 bg-surface/60 p-4"
              onSubmit={handleAttachmentSubmit}
            >
              <p className="text-xs uppercase tracking-[0.2em] text-text-secondary/70">
                {t("attachments.addTitle")}
              </p>
              <div className="grid gap-3 sm:grid-cols-3">
                <input
                  className="rounded-md border border-border/60 bg-surface px-3 py-2 text-sm text-text-primary outline-none focus:border-neon-green"
                  placeholder={t("attachments.namePlaceholder")}
                  value={attachmentName}
                  onChange={(event) => setAttachmentName(event.target.value)}
                  disabled={busy}
                  required
                />
                <input
                  className="rounded-md border border-border/60 bg-surface px-3 py-2 text-sm text-text-primary outline-none focus:border-neon-green"
                  placeholder={t("attachments.urlPlaceholder")}
                  value={attachmentUrl}
                  onChange={(event) => setAttachmentUrl(event.target.value)}
                  disabled={busy}
                  required
                />
                <input
                  className="rounded-md border border-border/60 bg-surface px-3 py-2 text-sm text-text-primary outline-none focus:border-neon-green"
                  placeholder={t("attachments.versionPlaceholder")}
                  value={attachmentVersion}
                  onChange={(event) => setAttachmentVersion(event.target.value)}
                  disabled={busy}
                />
              </div>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-full border border-border/60 px-3 py-1.5 text-xs uppercase tracking-[0.2em] text-text-secondary transition duration-200 hover:border-neon-green/60 hover:text-neon-green disabled:opacity-60"
                disabled={busy || !attachmentName.trim() || !attachmentUrl.trim()}
              >
                <Plus className="h-3.5 w-3.5" />
                {t("attachments.addButton")}
              </button>
            </form>
          </section>

          <section className="rounded-3xl border border-border/60 bg-surface-muted/60 p-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-text-primary">
              <Sparkles className="h-4 w-4 text-neon-green" />
              {t("tasks.title")}
            </h3>
            <ul className="mt-3 space-y-3">
              {(detail.tasks ?? []).map((task) => (
                <li
                  key={task.id}
                  className="rounded-2xl border border-border/60 bg-surface-hover/50 p-4 text-sm"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-text-primary">{task.label}</p>
                      <p className="text-xs text-text-secondary">
                        {t("tasks.ownerLabel", { owner: task.owner ?? tCommon("unknown") })}
                      </p>
                      <p className="text-xs text-text-secondary">
                        {t("tasks.dueLabel", { due: formatDate(task.dueAt, locale) })}
                      </p>
                      <p className="text-xs text-text-secondary">
                        {stageLabel(task.relatedStage)}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <select
                        className="rounded-md border border-border/60 bg-surface px-2 py-1 text-xs uppercase tracking-[0.2em] text-text-primary outline-none focus:border-neon-green"
                        value={task.status}
                        onChange={(event) =>
                          handleTaskStatusChange(task, event.target.value as HypothesisTask["status"])
                        }
                        disabled={busy}
                      >
                        {TASK_STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {t(`tasks.status.${status}`)}
                          </option>
                        ))}
                      </select>
                      <select
                        className="rounded-md border border-border/60 bg-surface px-2 py-1 text-xs uppercase tracking-[0.2em] text-text-primary outline-none focus:border-neon-green"
                        value={task.severity}
                        onChange={(event) =>
                          handleTaskSeverityChange(
                            task,
                            event.target.value as HypothesisTask["severity"],
                          )
                        }
                        disabled={busy}
                      >
                        {TASK_SEVERITIES.map((severity) => (
                          <option key={severity} value={severity}>
                            {t(`tasks.severity.${severity}`)}
                          </option>
                        ))}
                      </select>
                      <input
                        type="date"
                        className="rounded-md border border-border/60 bg-surface px-2 py-1 text-xs text-text-primary outline-none focus:border-neon-green"
                        value={formatInputDate(task.dueAt)}
                        onChange={(event) => handleTaskDueChange(task, event.target.value)}
                        disabled={busy}
                      />
                    </div>
                  </div>
                </li>
              ))}
              {(detail.tasks ?? []).length === 0 && (
                <li className="rounded-xl border border-dashed border-border/60 bg-surface-hover/40 p-4 text-center text-sm text-text-secondary/70">
                  {t("tasks.empty")}
                </li>
              )}
            </ul>
          </section>
        </div>

        <aside className="flex w-1/3 flex-col gap-5 overflow-y-auto pl-2">
          <section className="rounded-3xl border border-border/60 bg-surface-muted/60 p-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-text-primary">
              <Sparkles className="h-4 w-4 text-neon-green" />
              {t("activity.title")}
            </h3>
            <ul className="mt-3 space-y-3">
              {activity.slice(0, 8).map((event) => (
                <li
                  key={event.id}
                  className="rounded-2xl border border-border/60 bg-surface-hover/50 p-3 text-sm"
                >
                  <div className="flex items-center justify-between text-xs text-text-secondary">
                    <span className="uppercase tracking-[0.24em] text-neon-green">
                      {stageLabel(event.stage as HypothesisStageKey | undefined)}
                    </span>
                    <span>{formatDate(event.occurredAt, locale)}</span>
                  </div>
                  <p className="mt-1 text-sm font-semibold text-text-primary">{event.title}</p>
                  {event.detail && (
                    <p className="mt-1 text-xs text-text-secondary">{event.detail}</p>
                  )}
                </li>
              ))}
              {activity.length === 0 && (
                <li className="rounded-xl border border-dashed border-border/60 bg-surface-hover/40 p-4 text-center text-sm text-text-secondary/70">
                  {t("activity.empty")}
                </li>
              )}
            </ul>
          </section>

          <section className="rounded-3xl border border-border/60 bg-surface-muted/60 p-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-text-primary">
              <CheckCircle2 className="h-4 w-4 text-neon-green" />
              {t("approvals.title")}
            </h3>
            <ul className="mt-3 space-y-3">
              {(detail.approvals ?? []).map((approval) => (
                <li
                  key={approval.id}
                  className="rounded-2xl border border-border/60 bg-surface-hover/50 p-3 text-sm"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-text-primary">{approval.approverName}</p>
                      <p className="text-xs text-text-secondary">
                        {approval.approverRole ?? tCommon("unknown")}
                      </p>
                    </div>
                    <span className="rounded-full border border-border/60 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-text-secondary">
                      {t(`approvals.status.${approval.status}`)}
                    </span>
                  </div>
                  <textarea
                    className="mt-3 w-full rounded-xl border border-border/60 bg-surface px-3 py-2 text-xs text-text-primary outline-none focus:border-neon-green"
                    rows={3}
                    placeholder={t("approvals.notesPlaceholder")}
                    value={approvalNotes[approval.id] ?? ""}
                    onChange={(event) =>
                      setApprovalNotes((prev) => ({ ...prev, [approval.id]: event.target.value }))
                    }
                    disabled={busy}
                  />
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => handleApprovalStatus(approval, "approved")}
                      className="inline-flex items-center gap-2 rounded-full border border-border/60 px-3 py-1.5 uppercase tracking-[0.2em] text-neon-green transition duration-200 hover:border-neon-green/60 disabled:opacity-60"
                      disabled={busy}
                    >
                      {t("approvals.actions.approve")}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApprovalStatus(approval, "rejected")}
                      className="inline-flex items-center gap-2 rounded-full border border-border/60 px-3 py-1.5 uppercase tracking-[0.2em] text-[rgba(255,120,210,0.88)] transition duration-200 hover:border-[rgba(255,59,241,0.55)] hover:text-[rgba(255,59,241,0.88)] disabled:opacity-60"
                      disabled={busy}
                    >
                      {t("approvals.actions.reject")}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApprovalStatus(approval, "pending")}
                      className="inline-flex items-center gap-2 rounded-full border border-border/60 px-3 py-1.5 uppercase tracking-[0.2em] text-text-secondary transition duration-200 hover:border-neon-green/60 hover:text-neon-green disabled:opacity-60"
                      disabled={busy}
                    >
                      {t("approvals.actions.pending")}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApprovalNoteSave(approval)}
                      className="inline-flex items-center gap-2 rounded-full border border-border/60 px-3 py-1.5 uppercase tracking-[0.2em] text-text-secondary transition duration-200 hover:border-neon-green/60 hover:text-neon-green disabled:opacity-60"
                      disabled={busy}
                    >
                      {t("approvals.actions.saveNotes")}
                    </button>
                  </div>
                </li>
              ))}
              {(detail.approvals ?? []).length === 0 && (
                <li className="rounded-xl border border-dashed border-border/60 bg-surface-hover/40 p-4 text-center text-sm text-text-secondary/70">
                  {t("approvals.empty")}
                </li>
              )}
            </ul>
          </section>

          <section className="rounded-3xl border border-border/60 bg-surface-muted/60 p-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-text-primary">
              <MessageSquare className="h-4 w-4 text-neon-green" />
              {t("comments.title")}
            </h3>
            <div className="mt-3">
              <CommentsSection
                key={detail.id}
                comments={detail.comments ?? []}
                busy={busy}
                defaultActor={defaultActor}
                locale={locale}
                onCreate={
                  onCommentCreate
                    ? (payload) => onCommentCreate(detail.id, payload)
                    : undefined
                }
                onUpdate={
                  onCommentUpdate
                    ? (commentId, payload) => onCommentUpdate(detail.id, commentId, payload)
                    : undefined
                }
                onDelete={
                  onCommentDelete
                    ? (commentId) => onCommentDelete(detail.id, commentId)
                    : undefined
                }
              />
            </div>
          </section>
        </aside>
      </div>

      <TransitionDialog
        open={transitionOpen}
        onOpenChange={setTransitionOpen}
        hypothesis={detail}
        currentStage={currentStage}
        onTransition={handleStageTransition}
        isSubmitting={busy}
      />
    </div>
  );
}
