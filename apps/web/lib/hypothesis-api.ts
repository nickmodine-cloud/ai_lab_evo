import {
  HypothesisActivity,
  HypothesisChecklistItem,
  HypothesisDashboard,
  HypothesisDetail,
  HypothesisItem,
  HypothesisLinkedExperiment,
  HypothesisMilestone,
  HypothesisAttachment,
  HypothesisComment,
  HypothesisApproval,
  HypothesisTask,
  HypothesisStageEvent,
  HypothesisStageKey,
  HypothesisActor,
} from "./hypothesis-data";

const DEFAULT_BASE_URL = "http://localhost:8001";

function resolveBaseUrl() {
  return process.env.NEXT_PUBLIC_HYPOTHESIS_API || process.env.HYPOTHESIS_API_URL || DEFAULT_BASE_URL;
}

function formatRelativeTime(value: string | number | Date | undefined): string {
  if (!value) return "n/a";
  const date = value instanceof Date ? value : new Date(value);
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.round(diffMs / (1000 * 60));

  if (Number.isNaN(diffMinutes)) return "n/a";
  if (diffMinutes < 1) return "just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.round(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatCurrency(value: number | undefined, currency = "USD"): string {
  if (value === undefined || Number.isNaN(value)) return "—";
  try {
    const formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      notation: "compact",
      maximumFractionDigits: 1,
    });
    return formatter.format(value);
  } catch {
    return `$${value.toFixed(0)}`;
  }
}

function mapActor(actor: any): HypothesisActor {
  return {
    name: actor?.name ?? "Unassigned",
    email: actor?.email ?? "unknown@example.com",
    role: actor?.role,
    department: actor?.department,
  };
}

function mapChecklistItem(item: any): HypothesisChecklistItem {
  return {
    id: item?.id ?? undefined,
    label: item?.label ?? "Checklist item",
    status: (item?.status ?? "pending") as HypothesisChecklistItem["status"],
    owner: item?.owner ?? item?.ownerName ?? item?.owner_email ?? null,
    ownerEmail: item?.ownerEmail ?? item?.owner_email ?? null,
    dueAt: item?.dueAt ?? item?.due_at ?? null,
  };
}

function mapExperiment(exp: any): HypothesisLinkedExperiment {
  return {
    id: exp?.id ?? "EXP-UNKNOWN",
    title: exp?.title ?? "Untitled experiment",
    status: exp?.status ?? "PLANNED",
    owner: exp?.owner,
    lastUpdated: exp?.lastUpdated,
  };
}

function mapMilestone(milestone: any, fallbackLabel: string): HypothesisMilestone {
  return {
    label: milestone?.label ?? fallbackLabel,
    due: milestone?.due ?? new Date().toISOString(),
  };
}

function mapActivity(event: any): HypothesisActivity {
  return {
    id: event?.id ?? `act-${Math.random().toString(36).slice(2, 8)}`,
    title: event?.title ?? "Portfolio update",
    actor: event?.actor ?? "System",
    detail: event?.detail ?? "",
    occurredAt: event?.occurredAt ?? new Date().toISOString(),
    stage: (event?.stage ?? "IDEATION") as HypothesisStageKey,
    impact: (event?.impact ?? "neutral") as HypothesisActivity["impact"],
    type: event?.type,
  };
}

function mapStageHistory(event: any): HypothesisStageEvent {
  return {
    stage: (event?.stage ?? "IDEATION") as HypothesisStageEvent["stage"],
    changedAt: event?.changedAt ?? new Date().toISOString(),
    changedBy: event?.changedBy ?? "System",
    notes: event?.notes,
  };
}

function mapAttachment(attachment: any): HypothesisAttachment {
  return {
    id: attachment?.id ?? `file-${Math.random().toString(36).slice(2, 8)}`,
    name: attachment?.name ?? attachment?.fileName ?? "Attachment",
    url: attachment?.url ?? "#",
    version: Number(attachment?.version ?? 1),
    uploadedAt: attachment?.uploadedAt ?? new Date().toISOString(),
    uploadedBy: attachment?.uploadedBy ?? attachment?.uploaded_by ?? null,
    uploadedByEmail: attachment?.uploadedByEmail ?? attachment?.uploaded_by_email ?? null,
  };
}

function mapComment(comment: any): HypothesisComment {
  const replies = Array.isArray(comment?.replies) ? comment.replies.map(mapComment) : [];
  return {
    id: comment?.id ?? `comm-${Math.random().toString(36).slice(2, 8)}`,
    author: comment?.author ?? comment?.authorName ?? "System",
    authorEmail: comment?.authorEmail ?? comment?.author_email ?? null,
    body: comment?.body ?? comment?.text ?? "",
    createdAt: comment?.createdAt ?? comment?.created_at ?? new Date().toISOString(),
    updatedAt: comment?.updatedAt ?? comment?.updated_at ?? null,
    isResolved: Boolean(comment?.isResolved ?? comment?.is_resolved ?? false),
    replies,
  };
}

function mapApproval(approval: any): HypothesisApproval {
  return {
    id: approval?.id ?? `approval-${Math.random().toString(36).slice(2, 8)}`,
    approverName: approval?.approverName ?? approval?.approver_name ?? "Approver",
    approverEmail: approval?.approverEmail ?? approval?.approver_email ?? null,
    approverRole: approval?.approverRole ?? approval?.approver_role ?? null,
    status: (approval?.status ?? "pending") as HypothesisApproval["status"],
    required: Boolean(approval?.required ?? true),
    decidedAt: approval?.decidedAt ?? approval?.decided_at ?? null,
    notes: approval?.notes,
  };
}

function mapHypothesisItem(item: any): HypothesisItem {
  return {
    id: item?.id ?? item?.hypId ?? "HYP-UNKNOWN",
    title: item?.title ?? "Untitled hypothesis",
    owner: item?.owner ?? "Unassigned",
    stage: (item?.stage ?? "IDEATION") as HypothesisStageKey,
    impact: Number(item?.impact ?? item?.impactScore ?? 0),
    feasibility: Number(item?.feasibility ?? item?.feasibilityScore ?? 0),
    confidence: Number(item?.confidence ?? item?.confidenceScore ?? 0),
    nextGate: item?.nextGate ?? "",
    lastUpdated: formatRelativeTime(item?.lastUpdated ?? item?.updatedAt),
    tags: item?.tags ?? [],
  };
}

function mapHypothesisDetail(detail: any): HypothesisDetail {
  const owners = Array.isArray(detail?.owners) ? detail.owners.map(mapActor) : [];
  const sponsors = Array.isArray(detail?.sponsors) ? detail.sponsors.map(mapActor) : [];
  const firstOwner = owners[0]?.name ?? detail?.owner ?? "Unassigned";
  const sponsorName = detail?.sponsor ?? sponsors[0]?.name ?? "No sponsor assigned";
  const stage = (detail?.stage ?? "IDEATION") as HypothesisStageKey;

  const roiEstimate = detail?.roiEstimate ?? {};
  const oneTimeCost = roiEstimate?.oneTimeCost ? Number(roiEstimate.oneTimeCost) : undefined;
  const valueDriver = roiEstimate?.valueDriver;

  return {
    id: detail?.id ?? detail?.hypId ?? "HYP-UNKNOWN",
    title: detail?.title ?? "Untitled hypothesis",
    owner: firstOwner,
    owners,
    sponsor: sponsorName,
    sponsors,
    description: detail?.statement ?? detail?.description ?? "",
    targetValue: detail?.targetValue ?? valueDriver ?? "Target value not set",
    costAvoidance: detail?.costAvoidance ?? formatCurrency(oneTimeCost, roiEstimate?.currency ?? "USD"),
    confidence: Number(detail?.confidence ?? detail?.confidenceScore ?? 0),
    feasibility: Number(detail?.feasibility ?? detail?.feasibilityScore ?? 0),
    impact: Number(detail?.impact ?? detail?.impactScore ?? 0),
    nextMilestone: mapMilestone(detail?.nextMilestone, `${stage.toLowerCase()} milestone`),
    dependencies: detail?.dependencies ?? [],
    linkedExperiments: Array.isArray(detail?.linkedExperiments)
      ? detail.linkedExperiments.map(mapExperiment)
      : [],
    gatingChecklist: Array.isArray(detail?.gatingChecklist)
      ? detail.gatingChecklist.map(mapChecklistItem)
      : [],
    stage,
    stageHealth: detail?.stageHealth ?? "on-track",
    stageHistory: Array.isArray(detail?.stageHistory)
      ? detail.stageHistory.map(mapStageHistory)
      : [],
    roiEstimate: {
      currency: roiEstimate?.currency,
      expectedRoi: roiEstimate?.expectedRoi,
      paybackPeriodWeeks: roiEstimate?.paybackPeriodWeeks,
      oneTimeCost,
      ongoingCostPerPeriod: roiEstimate?.ongoingCostPerPeriod,
      valueDriver,
    },
    notes: detail?.notes,
    labId: detail?.labId,
    attachments: Array.isArray(detail?.attachments) ? detail.attachments.map(mapAttachment) : [],
    comments: Array.isArray(detail?.comments) ? detail.comments.map(mapComment) : [],
    approvals: Array.isArray(detail?.approvals) ? detail.approvals.map(mapApproval) : [],
    tasks: Array.isArray(detail?.tasks) ? detail.tasks.map(mapTask) : [],
    activityDigest: Array.isArray(detail?.activityDigest)
      ? detail.activityDigest.map(mapActivity)
      : [],
  };
}

function mapTask(task: any): HypothesisTask {
  const dueAt = task?.due ?? task?.due_at ?? new Date().toISOString();
  return {
    id: task?.id ?? `task-${Math.random().toString(36).slice(2, 8)}`,
    label: task?.label ?? "Portfolio task",
    owner: task?.owner ?? task?.ownerName ?? "Unassigned",
    dueAt,
    type: (task?.type ?? "governance") as HypothesisTask["type"],
    status: (task?.status ?? "due-soon") as HypothesisTask["status"],
    severity: (task?.severity ?? "medium") as HypothesisTask["severity"],
    relatedStage: (task?.relatedStage ?? "IDEATION") as HypothesisStageKey,
  };
}

function mapDashboard(payload: any): HypothesisDashboard {
  const stages = Array.isArray(payload?.stages) ? payload.stages : [];
  return {
    stages: stages.map((stage: any) => ({
      key: stage?.key ?? "IDEATION",
      title: stage?.title ?? "Stage",
      description: stage?.description ?? "",
      slaHours: stage?.slaHours ?? 72,
      stageOwner: stage?.stageOwner ?? "Unassigned",
      stageHealth: stage?.stageHealth ?? "on-track",
      conversionRate: Number(stage?.conversionRate ?? 0),
      averageDaysInStage: Number(stage?.averageDaysInStage ?? 0),
      items: Array.isArray(stage?.items) ? stage.items.map(mapHypothesisItem) : [],
    })),
    highlights: {
      portfolioValue: payload?.highlights?.portfolioValue ?? "—",
      experimentsInFlight: payload?.highlights?.experimentsInFlight ?? 0,
      avgTimeToValue: payload?.highlights?.avgTimeToValue ?? "n/a",
      governancePending: payload?.highlights?.governancePending ?? 0,
    },
    focusHypothesis: mapHypothesisDetail(payload?.focusHypothesis ?? {}),
    tasks: Array.isArray(payload?.tasks) ? payload.tasks.map(mapTask) : [],
    activity: Array.isArray(payload?.activity) ? payload.activity.map(mapActivity) : [],
  };
}

export async function fetchHypothesisDashboard(): Promise<HypothesisDashboard> {
  const baseUrl = resolveBaseUrl();

  try {
    const response = await fetch(`${baseUrl}/hypotheses/dashboard`, {
      next: { revalidate: 30 },
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Failed to load hypothesis dashboard (${response.status}): ${errorBody}`);
    }

    const payload = await response.json();
    return mapDashboard(payload);
  } catch (error) {
    const details =
      error instanceof Error ? error.message : "unknown network error";
    throw new Error(
      `Unable to reach Hypothesis API at ${baseUrl}. Ensure the backend service is running and accessible. Details: ${details}`,
    );
  }
}

export interface CreateHypothesisInput {
  title: string;
  statement: string;
  labId: string;
  aiType: "LLM" | "CLASSICAL_ML" | "CV" | "NLP" | "RPA" | "ANALYTICS" | "OTHER";
  aiSubtype?: string;
  description?: string;
  impactScore: number;
  feasibilityScore: number;
  confidenceScore?: number;
  complexityScore?: number;
  riskClass?: "LOW" | "MEDIUM" | "HIGH";
  owner: HypothesisActor;
  sponsors?: HypothesisActor[];
  tags?: string[];
  notes?: string;
  dataSources?: string[];
  successMetrics?: Array<{ label: string; target: number; direction?: "INCREASE" | "DECREASE" | "MAINTAIN"; unit?: string }>;
}

export async function createHypothesis(payload: CreateHypothesisInput): Promise<HypothesisDetail> {
  const baseUrl = resolveBaseUrl();

  const body = {
    title: payload.title,
    statement: payload.statement,
    labId: payload.labId,
    aiType: payload.aiType,
    aiSubtype: payload.aiSubtype,
    description: payload.description,
    impactScore: payload.impactScore,
    feasibilityScore: payload.feasibilityScore,
    confidenceScore: payload.confidenceScore ?? 0.5,
    complexityScore: payload.complexityScore,
    riskClass: payload.riskClass ?? "MEDIUM",
    owners: [
      {
        name: payload.owner.name,
        email: payload.owner.email,
        role: payload.owner.role ?? "OWNER",
        department: payload.owner.department,
      },
    ],
    sponsors: payload.sponsors?.map((sponsor) => ({
      name: sponsor.name,
      email: sponsor.email,
      role: sponsor.role ?? "SPONSOR",
      department: sponsor.department,
    })),
    tags: payload.tags ?? [],
    notes: payload.notes,
    dataRequirements: {
      sources: payload.dataSources ?? [],
    },
    successMetrics: payload.successMetrics ?? [],
    stageHealth: "on-track",
  };

  const response = await fetch(`${baseUrl}/hypotheses/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Failed to create hypothesis (${response.status}): ${errorBody}`);
  }

  const detail = await response.json();
  return mapHypothesisDetail(detail);
}

export interface UpdateHypothesisInput {
  stage?: HypothesisStageKey;
  stageHealth?: "on-track" | "warning" | "risk";
  notes?: string;
  updatedBy?: string;
}

export async function updateHypothesis(
  hypId: string,
  payload: UpdateHypothesisInput,
): Promise<HypothesisDetail> {
  const baseUrl = resolveBaseUrl();
  const response = await fetch(`${baseUrl}/hypotheses/${hypId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Failed to update hypothesis (${response.status}): ${errorBody}`);
  }

  const detail = await response.json();
  return mapHypothesisDetail(detail);
}

export interface CommentInput {
  body: string;
  author: HypothesisActor;
  parentId?: string;
}

export async function createComment(
  hypId: string,
  payload: CommentInput,
): Promise<HypothesisComment> {
  const baseUrl = resolveBaseUrl();
  const response = await fetch(`${baseUrl}/hypotheses/${hypId}/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Failed to add comment (${response.status}): ${errorBody}`);
  }
  return mapComment(await response.json());
}

export interface UpdateCommentInput {
  body?: string;
  isResolved?: boolean;
}

export async function updateComment(
  hypId: string,
  commentId: string,
  payload: UpdateCommentInput,
): Promise<HypothesisComment> {
  const baseUrl = resolveBaseUrl();
  const response = await fetch(`${baseUrl}/hypotheses/${hypId}/comments/${commentId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Failed to update comment (${response.status}): ${errorBody}`);
  }
  return mapComment(await response.json());
}

export async function deleteComment(hypId: string, commentId: string): Promise<void> {
  const baseUrl = resolveBaseUrl();
  const response = await fetch(`${baseUrl}/hypotheses/${hypId}/comments/${commentId}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Failed to delete comment (${response.status}): ${errorBody}`);
  }
}

export interface AttachmentInput {
  name: string;
  url: string;
  version?: number;
  uploadedBy?: string;
  uploadedByEmail?: string;
}

export async function createAttachment(
  hypId: string,
  payload: AttachmentInput,
): Promise<HypothesisAttachment> {
  const baseUrl = resolveBaseUrl();
  const response = await fetch(`${baseUrl}/hypotheses/${hypId}/attachments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Failed to add attachment (${response.status}): ${errorBody}`);
  }
  return mapAttachment(await response.json());
}

export interface ChecklistItemInput {
  label: string;
  owner?: string;
  ownerEmail?: string;
  dueAt?: string;
}

export async function createChecklistItem(
  hypId: string,
  payload: ChecklistItemInput,
): Promise<HypothesisDetail> {
  const baseUrl = resolveBaseUrl();
  const response = await fetch(`${baseUrl}/hypotheses/${hypId}/checklist`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Failed to add checklist item (${response.status}): ${errorBody}`);
  }
  return mapHypothesisDetail(await response.json());
}

export interface ChecklistItemUpdateInput {
  label?: string;
  status?: HypothesisChecklistItem["status"];
  owner?: string;
  ownerEmail?: string;
  dueAt?: string;
}

export async function updateChecklistItem(
  hypId: string,
  itemId: string,
  payload: ChecklistItemUpdateInput,
): Promise<HypothesisDetail> {
  const baseUrl = resolveBaseUrl();
  const response = await fetch(`${baseUrl}/hypotheses/${hypId}/checklist/${itemId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Failed to update checklist item (${response.status}): ${errorBody}`);
  }
  return mapHypothesisDetail(await response.json());
}

export async function deleteChecklistItem(
  hypId: string,
  itemId: string,
): Promise<HypothesisDetail> {
  const baseUrl = resolveBaseUrl();
  const response = await fetch(`${baseUrl}/hypotheses/${hypId}/checklist/${itemId}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Failed to delete checklist item (${response.status}): ${errorBody}`);
  }
  return mapHypothesisDetail(await response.json());
}

export interface TaskUpdateInput {
  status?: HypothesisTask["status"];
  severity?: HypothesisTask["severity"];
  dueAt?: string;
  owner?: string;
}

export async function updateTask(
  hypId: string,
  taskId: string,
  payload: TaskUpdateInput,
): Promise<HypothesisDetail> {
  const baseUrl = resolveBaseUrl();
  const response = await fetch(`${baseUrl}/hypotheses/${hypId}/tasks/${taskId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      status: payload.status,
      severity: payload.severity,
      due: payload.dueAt,
      owner: payload.owner,
    }),
  });
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Failed to update task (${response.status}): ${errorBody}`);
  }
  return mapHypothesisDetail(await response.json());
}

export interface ApprovalUpdateInput {
  status?: HypothesisApproval["status"];
  notes?: string;
}

export async function updateApproval(
  hypId: string,
  approvalId: string,
  payload: ApprovalUpdateInput,
): Promise<HypothesisDetail> {
  const baseUrl = resolveBaseUrl();
  const response = await fetch(`${baseUrl}/hypotheses/${hypId}/approvals/${approvalId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Failed to update approval (${response.status}): ${errorBody}`);
  }
  return mapHypothesisDetail(await response.json());
}

export async function fetchHypothesisDetail(hypId: string): Promise<HypothesisDetail> {
  const baseUrl = resolveBaseUrl();
  try {
    const response = await fetch(`${baseUrl}/hypotheses/${hypId}`, {
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Failed to fetch hypothesis ${hypId} (${response.status}): ${errorBody}`);
    }

    const detail = await response.json();
    return mapHypothesisDetail(detail);
  } catch (error) {
    const details =
      error instanceof Error ? error.message : "unknown network error";
    throw new Error(
      `Unable to reach Hypothesis API at ${baseUrl} for ${hypId}. Ensure the backend service is running and accessible. Details: ${details}`,
    );
  }
}
