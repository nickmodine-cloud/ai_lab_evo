"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { AlertTriangle, CheckCircle2, X } from "lucide-react";
import { HypothesisDashboard, HypothesisDetail, HypothesisStageKey } from "@/lib/hypothesis-data";
import {
  fetchHypothesisDashboard,
  fetchHypothesisDetail,
  updateHypothesis,
  createComment,
  updateComment as updateCommentRequest,
  deleteComment as deleteCommentRequest,
  createAttachment,
  createChecklistItem,
  updateChecklistItem as updateChecklistRequest,
  deleteChecklistItem,
  updateTask as updateTaskRequest,
  updateApproval as updateApprovalRequest,
} from "@/lib/hypothesis-api";
import type {
  CommentInput,
  UpdateCommentInput,
  AttachmentInput,
  ChecklistItemInput,
  ChecklistItemUpdateInput,
  TaskUpdateInput,
  ApprovalUpdateInput,
} from "@/lib/hypothesis-api";
import { GlobalHeader } from "@/components/global-header";
import { HypothesisSnapshot } from "./hypothesis-snapshot";
import { HypothesisKanban } from "./hypothesis-kanban";
import { HypothesisDetailPanel } from "./hypothesis-detail";
import { HypothesisMatrix } from "./hypothesis-matrix";
import { HypothesisOperationalInbox } from "./hypothesis-ops";
import { HypothesisActivityTimeline } from "./hypothesis-activity";
import { HypothesisStageSummary } from "@/lib/hypothesis-data";
import { cn } from "@/lib/utils";

interface HypothesisWorkspaceProps {
  initialDashboard: HypothesisDashboard;
}

type ToastVariant = "success" | "error";

interface ToastMessage {
  id: number;
  message: string;
  variant: ToastVariant;
}

function moveCard(
  stages: HypothesisStageSummary[],
  hypId: string,
  fromStage: HypothesisStageKey,
  toStage: HypothesisStageKey,
): HypothesisStageSummary[] {
  const updated = stages.map((stage) => ({
    ...stage,
    items: stage.items.filter((item) => item.id !== hypId),
  }));

  const sourceStage = stages.find((stage) => stage.key === fromStage);
  const targetStage = updated.find((stage) => stage.key === toStage);
  const movedItem = sourceStage?.items.find((item) => item.id === hypId);

  if (movedItem && targetStage) {
    targetStage.items = [{ ...movedItem, stage: toStage }, ...targetStage.items];
  }

  return updated;
}

export function HypothesisWorkspace({ initialDashboard }: HypothesisWorkspaceProps) {
  const [boardState, setBoardState] = useState<HypothesisStageSummary[]>(initialDashboard.stages);
  const [highlights, setHighlights] = useState(initialDashboard.highlights);
  const [tasks, setTasks] = useState(initialDashboard.tasks);
  const [activity, setActivity] = useState(initialDashboard.activity);
  const [activeDetail, setActiveDetail] = useState<HypothesisDetail | null>(
    initialDashboard.focusHypothesis ?? null,
  );
  const [kanbanExpanded, setKanbanExpanded] = useState(false);
  const [detailExpanded, setDetailExpanded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const tToasts = useTranslations("hypotheses.toasts");
  const tStages = useTranslations("hypotheses.stages");
  const tCommon = useTranslations("common");
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const pushToast = useCallback(
    (message: string, variant: ToastVariant = "success") => {
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev, { id, message, variant }]);
      if (typeof window !== "undefined") {
        window.setTimeout(() => dismissToast(id), 4200);
      }
    },
    [dismissToast],
  );

  const stageName = useCallback(
    (stage: HypothesisStageKey) => tStages(stage) ?? tCommon("unknown"),
    [tStages, tCommon],
  );

  const allHypotheses = useMemo(
    () => boardState.flatMap((stage) => stage.items),
    [boardState],
  );

  const refreshDashboard = useCallback(async () => {
    const fresh = await fetchHypothesisDashboard();
    setBoardState(fresh.stages);
    setHighlights(fresh.highlights);
    setTasks(fresh.tasks);
    setActivity(fresh.activity);
    if (!activeDetail) {
      setActiveDetail(fresh.focusHypothesis);
    }
    return fresh;
  }, [activeDetail]);

  const refreshDetail = useCallback(
    async (hypId: string) => {
      const detail = await fetchHypothesisDetail(hypId);
      setActiveDetail(detail);
      return detail;
    },
    [],
  );

  const handleCardDrop = useCallback(
    async (hypId: string, fromStage: HypothesisStageKey, toStage: HypothesisStageKey) => {
      setBusy(true);
      setError(null);
      setBoardState((prev) => moveCard(prev, hypId, fromStage, toStage));

      try {
        await updateHypothesis(hypId, {
          stage: toStage,
          updatedBy: activeDetail?.owner ?? "System",
        });

        const [, fresh] = await Promise.all([refreshDetail(hypId), refreshDashboard()]);
        setActivity(fresh.activity);
        setTasks(fresh.tasks);
        setHighlights(fresh.highlights);
        setDetailExpanded(true);
        pushToast(tToasts("stageMoved", { stage: stageName(toStage) }));
      } catch (err) {
        const fallback = tToasts("stageMoveFailed");
        const message =
          err instanceof Error && err.message && err.message.trim().length > 0
            ? err.message
            : fallback;
        setError(message);
        pushToast(tToasts("stageMoveFailed"), "error");
        await refreshDashboard();
      } finally {
        setBusy(false);
      }
    },
    [activeDetail, pushToast, refreshDashboard, refreshDetail, stageName, tToasts],
  );

  const handleSelectHypothesis = useCallback(
    (hypId: string) => {
      setError(null);
      setDetailExpanded(true);
      setKanbanExpanded(false);
      startTransition(async () => {
        try {
          await refreshDetail(hypId);
        } catch (err) {
          const fallback = tToasts("operationFailed");
          const message =
            err instanceof Error && err.message && err.message.trim().length > 0
              ? err.message
              : fallback;
          setError(message);
          pushToast(message, "error");
        }
      });
    },
    [pushToast, refreshDetail, tToasts],
  );

  const handleStageTransition = useCallback(
    async (hypId: string, targetStage: HypothesisStageKey, actor: string) => {
      setBusy(true);
      setError(null);
      try {
        await updateHypothesis(hypId, { stage: targetStage, updatedBy: actor });
        await Promise.all([refreshDetail(hypId), refreshDashboard()]);
        pushToast(tToasts("stageMoved", { stage: stageName(targetStage) }));
      } catch (err) {
        const message = err instanceof Error ? err.message : tToasts("stageMoveFailed");
        setError(message);
        pushToast(tToasts("stageMoveFailed"), "error");
      } finally {
        setBusy(false);
      }
    },
    [pushToast, refreshDashboard, refreshDetail, stageName, tToasts],
  );

  const withBusy = useCallback(
    async (callback: () => Promise<void>) => {
      setBusy(true);
      setError(null);
      try {
        await callback();
      } catch (err) {
        const fallback = tToasts("operationFailed");
        const message =
          err instanceof Error && err.message && err.message.trim().length > 0
            ? err.message
            : fallback;
        setError(message);
        pushToast(message, "error");
        throw err;
      } finally {
        setBusy(false);
      }
    },
    [pushToast, tToasts],
  );

  const handleCommentCreate = useCallback(
    async (hypId: string, input: CommentInput) => {
      await withBusy(async () => {
        await createComment(hypId, input);
        await refreshDetail(hypId);
      });
      pushToast(tToasts("commentCreated"));
    },
    [pushToast, refreshDetail, tToasts, withBusy],
  );

  const handleCommentUpdate = useCallback(
    async (hypId: string, commentId: string, payload: UpdateCommentInput) => {
      await withBusy(async () => {
        await updateCommentRequest(hypId, commentId, payload);
        await refreshDetail(hypId);
      });
      pushToast(tToasts("commentUpdated"));
    },
    [pushToast, refreshDetail, tToasts, withBusy],
  );

  const handleCommentDelete = useCallback(
    async (hypId: string, commentId: string) => {
      await withBusy(async () => {
        await deleteCommentRequest(hypId, commentId);
        await refreshDetail(hypId);
      });
      pushToast(tToasts("commentDeleted"));
    },
    [pushToast, refreshDetail, tToasts, withBusy],
  );

  const handleAttachmentCreate = useCallback(
    async (hypId: string, payload: AttachmentInput) => {
      await withBusy(async () => {
        await createAttachment(hypId, payload);
        await refreshDetail(hypId);
      });
      pushToast(tToasts("attachmentAdded"));
    },
    [pushToast, refreshDetail, tToasts, withBusy],
  );

  const handleChecklistCreate = useCallback(
    async (hypId: string, payload: ChecklistItemInput) => {
      await withBusy(async () => {
        await createChecklistItem(hypId, payload);
        await refreshDetail(hypId);
      });
      pushToast(tToasts("checklistAdded"));
    },
    [pushToast, refreshDetail, tToasts, withBusy],
  );

  const handleChecklistUpdate = useCallback(
    async (hypId: string, itemId: string, payload: ChecklistItemUpdateInput) => {
      await withBusy(async () => {
        await updateChecklistRequest(hypId, itemId, payload);
        await refreshDetail(hypId);
      });
      pushToast(tToasts("checklistUpdated"));
    },
    [pushToast, refreshDetail, tToasts, withBusy],
  );

  const handleChecklistDelete = useCallback(
    async (hypId: string, itemId: string) => {
      await withBusy(async () => {
        await deleteChecklistItem(hypId, itemId);
        await refreshDetail(hypId);
      });
      pushToast(tToasts("checklistDeleted"));
    },
    [pushToast, refreshDetail, tToasts, withBusy],
  );

  const handleTaskUpdate = useCallback(
    async (hypId: string, taskId: string, payload: TaskUpdateInput) => {
      await withBusy(async () => {
        await updateTaskRequest(hypId, taskId, payload);
        await refreshDetail(hypId);
      });
      pushToast(tToasts("taskUpdated"));
    },
    [pushToast, refreshDetail, tToasts, withBusy],
  );

  const handleApprovalUpdate = useCallback(
    async (hypId: string, approvalId: string, payload: ApprovalUpdateInput) => {
      await withBusy(async () => {
        await updateApprovalRequest(hypId, approvalId, payload);
        await refreshDetail(hypId);
      });
      pushToast(tToasts("approvalUpdated"));
    },
    [pushToast, refreshDetail, tToasts, withBusy],
  );

  const toastStyles: Record<ToastVariant, string> = {
    success: "border-[rgba(0,255,136,0.35)] bg-[rgba(0,255,136,0.08)] text-neon-green",
    error: "border-[rgba(255,59,241,0.4)] bg-[rgba(255,59,241,0.08)] text-[rgba(255,120,210,0.9)]",
  };

  return (
    <div className="relative flex flex-col gap-8">
      <div className="pointer-events-none fixed right-6 top-6 z-50 flex flex-col gap-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              "pointer-events-auto flex items-start gap-3 rounded-2xl border px-4 py-3 shadow-lg backdrop-blur",
              toastStyles[toast.variant],
            )}
          >
            {toast.variant === "success" ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0" />
            ) : (
              <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            )}
            <p className="flex-1 text-sm font-medium leading-snug">{toast.message}</p>
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              className="ml-2 text-xs uppercase tracking-[0.2em] text-current transition hover:opacity-70"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
      {error && (
        <div className="rounded-2xl border border-[rgba(255,59,241,0.4)] bg-[rgba(255,59,241,0.08)] px-4 py-3 text-sm text-[rgba(255,120,210,0.88)]">
          {error}
        </div>
      )}

      <GlobalHeader hypotheses={allHypotheses} />
      <HypothesisSnapshot highlights={highlights} />

      <HypothesisKanban
        stages={boardState}
        onCardDrop={handleCardDrop}
        onCardSelect={handleSelectHypothesis}
        expanded={kanbanExpanded}
        onToggleExpand={setKanbanExpanded}
        busy={busy || isPending}
      />

      {detailExpanded && activeDetail && (
        <HypothesisDetailPanel
          detail={activeDetail}
          activity={activity}
          onClose={() => setDetailExpanded(false)}
          onStageChange={handleStageTransition}
          busy={busy || isPending}
          onCommentCreate={handleCommentCreate}
          onCommentUpdate={handleCommentUpdate}
          onCommentDelete={handleCommentDelete}
          onAttachmentCreate={handleAttachmentCreate}
          onChecklistCreate={handleChecklistCreate}
          onChecklistUpdate={handleChecklistUpdate}
          onChecklistDelete={handleChecklistDelete}
          onTaskUpdate={handleTaskUpdate}
          onApprovalUpdate={handleApprovalUpdate}
        />
      )}

      <div
        className={cn(
          "flex flex-col gap-8 transition duration-200",
          detailExpanded ? "hidden" : "",
          kanbanExpanded ? "pointer-events-none blur-sm opacity-40" : "opacity-100"
        )}
      >
        <HypothesisMatrix stages={boardState} />
        <HypothesisOperationalInbox tasks={tasks} />
        <HypothesisActivityTimeline events={activity} />
      </div>
    </div>
  );
}
