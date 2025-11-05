module.exports = [
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[project]/apps/web/app/layout.tsx [app-rsc] (ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/apps/web/app/layout.tsx [app-rsc] (ecmascript)"));
}),
"[project]/apps/web/lib/hypothesis-api.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createAttachment",
    ()=>createAttachment,
    "createChecklistItem",
    ()=>createChecklistItem,
    "createComment",
    ()=>createComment,
    "createHypothesis",
    ()=>createHypothesis,
    "deleteChecklistItem",
    ()=>deleteChecklistItem,
    "deleteComment",
    ()=>deleteComment,
    "fetchHypothesisDashboard",
    ()=>fetchHypothesisDashboard,
    "fetchHypothesisDetail",
    ()=>fetchHypothesisDetail,
    "updateApproval",
    ()=>updateApproval,
    "updateChecklistItem",
    ()=>updateChecklistItem,
    "updateComment",
    ()=>updateComment,
    "updateHypothesis",
    ()=>updateHypothesis,
    "updateTask",
    ()=>updateTask
]);
const DEFAULT_BASE_URL = "http://localhost:8001";
function resolveBaseUrl() {
    return process.env.NEXT_PUBLIC_HYPOTHESIS_API || process.env.HYPOTHESIS_API_URL || DEFAULT_BASE_URL;
}
function formatRelativeTime(value) {
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
    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric"
    });
}
function formatCurrency(value, currency = "USD") {
    if (value === undefined || Number.isNaN(value)) return "—";
    try {
        const formatter = new Intl.NumberFormat("en-US", {
            style: "currency",
            currency,
            notation: "compact",
            maximumFractionDigits: 1
        });
        return formatter.format(value);
    } catch  {
        return `$${value.toFixed(0)}`;
    }
}
function mapActor(actor) {
    return {
        name: actor?.name ?? "Unassigned",
        email: actor?.email ?? "unknown@example.com",
        role: actor?.role,
        department: actor?.department
    };
}
function mapChecklistItem(item) {
    return {
        id: item?.id ?? undefined,
        label: item?.label ?? "Checklist item",
        status: item?.status ?? "pending",
        owner: item?.owner ?? item?.ownerName ?? item?.owner_email ?? null,
        ownerEmail: item?.ownerEmail ?? item?.owner_email ?? null,
        dueAt: item?.dueAt ?? item?.due_at ?? null
    };
}
function mapExperiment(exp) {
    return {
        id: exp?.id ?? "EXP-UNKNOWN",
        title: exp?.title ?? "Untitled experiment",
        status: exp?.status ?? "PLANNED",
        owner: exp?.owner,
        lastUpdated: exp?.lastUpdated
    };
}
function mapMilestone(milestone, fallbackLabel) {
    return {
        label: milestone?.label ?? fallbackLabel,
        due: milestone?.due ?? new Date().toISOString()
    };
}
function mapActivity(event) {
    return {
        id: event?.id ?? `act-${Math.random().toString(36).slice(2, 8)}`,
        title: event?.title ?? "Portfolio update",
        actor: event?.actor ?? "System",
        detail: event?.detail ?? "",
        occurredAt: event?.occurredAt ?? new Date().toISOString(),
        stage: event?.stage ?? "IDEATION",
        impact: event?.impact ?? "neutral",
        type: event?.type
    };
}
function mapStageHistory(event) {
    return {
        stage: event?.stage ?? "IDEATION",
        changedAt: event?.changedAt ?? new Date().toISOString(),
        changedBy: event?.changedBy ?? "System",
        notes: event?.notes
    };
}
function mapAttachment(attachment) {
    return {
        id: attachment?.id ?? `file-${Math.random().toString(36).slice(2, 8)}`,
        name: attachment?.name ?? attachment?.fileName ?? "Attachment",
        url: attachment?.url ?? "#",
        version: Number(attachment?.version ?? 1),
        uploadedAt: attachment?.uploadedAt ?? new Date().toISOString(),
        uploadedBy: attachment?.uploadedBy ?? attachment?.uploaded_by ?? null,
        uploadedByEmail: attachment?.uploadedByEmail ?? attachment?.uploaded_by_email ?? null
    };
}
function mapComment(comment) {
    const replies = Array.isArray(comment?.replies) ? comment.replies.map(mapComment) : [];
    return {
        id: comment?.id ?? `comm-${Math.random().toString(36).slice(2, 8)}`,
        author: comment?.author ?? comment?.authorName ?? "System",
        authorEmail: comment?.authorEmail ?? comment?.author_email ?? null,
        body: comment?.body ?? comment?.text ?? "",
        createdAt: comment?.createdAt ?? comment?.created_at ?? new Date().toISOString(),
        updatedAt: comment?.updatedAt ?? comment?.updated_at ?? null,
        isResolved: Boolean(comment?.isResolved ?? comment?.is_resolved ?? false),
        replies
    };
}
function mapApproval(approval) {
    return {
        id: approval?.id ?? `approval-${Math.random().toString(36).slice(2, 8)}`,
        approverName: approval?.approverName ?? approval?.approver_name ?? "Approver",
        approverEmail: approval?.approverEmail ?? approval?.approver_email ?? null,
        approverRole: approval?.approverRole ?? approval?.approver_role ?? null,
        status: approval?.status ?? "pending",
        required: Boolean(approval?.required ?? true),
        decidedAt: approval?.decidedAt ?? approval?.decided_at ?? null,
        notes: approval?.notes
    };
}
function mapHypothesisItem(item) {
    return {
        id: item?.id ?? item?.hypId ?? "HYP-UNKNOWN",
        title: item?.title ?? "Untitled hypothesis",
        owner: item?.owner ?? "Unassigned",
        stage: item?.stage ?? "IDEATION",
        impact: Number(item?.impact ?? item?.impactScore ?? 0),
        feasibility: Number(item?.feasibility ?? item?.feasibilityScore ?? 0),
        confidence: Number(item?.confidence ?? item?.confidenceScore ?? 0),
        nextGate: item?.nextGate ?? "",
        lastUpdated: formatRelativeTime(item?.lastUpdated ?? item?.updatedAt),
        tags: item?.tags ?? []
    };
}
function mapHypothesisDetail(detail) {
    const owners = Array.isArray(detail?.owners) ? detail.owners.map(mapActor) : [];
    const sponsors = Array.isArray(detail?.sponsors) ? detail.sponsors.map(mapActor) : [];
    const firstOwner = owners[0]?.name ?? detail?.owner ?? "Unassigned";
    const sponsorName = detail?.sponsor ?? sponsors[0]?.name ?? "No sponsor assigned";
    const stage = detail?.stage ?? "IDEATION";
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
        linkedExperiments: Array.isArray(detail?.linkedExperiments) ? detail.linkedExperiments.map(mapExperiment) : [],
        gatingChecklist: Array.isArray(detail?.gatingChecklist) ? detail.gatingChecklist.map(mapChecklistItem) : [],
        stage,
        stageHealth: detail?.stageHealth ?? "on-track",
        stageHistory: Array.isArray(detail?.stageHistory) ? detail.stageHistory.map(mapStageHistory) : [],
        roiEstimate: {
            currency: roiEstimate?.currency,
            expectedRoi: roiEstimate?.expectedRoi,
            paybackPeriodWeeks: roiEstimate?.paybackPeriodWeeks,
            oneTimeCost,
            ongoingCostPerPeriod: roiEstimate?.ongoingCostPerPeriod,
            valueDriver
        },
        notes: detail?.notes,
        labId: detail?.labId,
        attachments: Array.isArray(detail?.attachments) ? detail.attachments.map(mapAttachment) : [],
        comments: Array.isArray(detail?.comments) ? detail.comments.map(mapComment) : [],
        approvals: Array.isArray(detail?.approvals) ? detail.approvals.map(mapApproval) : [],
        tasks: Array.isArray(detail?.tasks) ? detail.tasks.map(mapTask) : [],
        activityDigest: Array.isArray(detail?.activityDigest) ? detail.activityDigest.map(mapActivity) : []
    };
}
function mapTask(task) {
    const dueAt = task?.due ?? task?.due_at ?? new Date().toISOString();
    return {
        id: task?.id ?? `task-${Math.random().toString(36).slice(2, 8)}`,
        label: task?.label ?? "Portfolio task",
        owner: task?.owner ?? task?.ownerName ?? "Unassigned",
        dueAt,
        type: task?.type ?? "governance",
        status: task?.status ?? "due-soon",
        severity: task?.severity ?? "medium",
        relatedStage: task?.relatedStage ?? "IDEATION"
    };
}
function mapDashboard(payload) {
    const stages = Array.isArray(payload?.stages) ? payload.stages : [];
    return {
        stages: stages.map((stage)=>({
                key: stage?.key ?? "IDEATION",
                title: stage?.title ?? "Stage",
                description: stage?.description ?? "",
                slaHours: stage?.slaHours ?? 72,
                stageOwner: stage?.stageOwner ?? "Unassigned",
                stageHealth: stage?.stageHealth ?? "on-track",
                conversionRate: Number(stage?.conversionRate ?? 0),
                averageDaysInStage: Number(stage?.averageDaysInStage ?? 0),
                items: Array.isArray(stage?.items) ? stage.items.map(mapHypothesisItem) : []
            })),
        highlights: {
            portfolioValue: payload?.highlights?.portfolioValue ?? "—",
            experimentsInFlight: payload?.highlights?.experimentsInFlight ?? 0,
            avgTimeToValue: payload?.highlights?.avgTimeToValue ?? "n/a",
            governancePending: payload?.highlights?.governancePending ?? 0
        },
        focusHypothesis: mapHypothesisDetail(payload?.focusHypothesis ?? {}),
        tasks: Array.isArray(payload?.tasks) ? payload.tasks.map(mapTask) : [],
        activity: Array.isArray(payload?.activity) ? payload.activity.map(mapActivity) : []
    };
}
async function fetchHypothesisDashboard() {
    const baseUrl = resolveBaseUrl();
    try {
        const response = await fetch(`${baseUrl}/hypotheses/dashboard`, {
            next: {
                revalidate: 30
            },
            headers: {
                "Content-Type": "application/json"
            }
        });
        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`Failed to load hypothesis dashboard (${response.status}): ${errorBody}`);
        }
        const payload = await response.json();
        return mapDashboard(payload);
    } catch (error) {
        const details = error instanceof Error ? error.message : "unknown network error";
        throw new Error(`Unable to reach Hypothesis API at ${baseUrl}. Ensure the backend service is running and accessible. Details: ${details}`);
    }
}
async function createHypothesis(payload) {
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
                department: payload.owner.department
            }
        ],
        sponsors: payload.sponsors?.map((sponsor)=>({
                name: sponsor.name,
                email: sponsor.email,
                role: sponsor.role ?? "SPONSOR",
                department: sponsor.department
            })),
        tags: payload.tags ?? [],
        notes: payload.notes,
        dataRequirements: {
            sources: payload.dataSources ?? []
        },
        successMetrics: payload.successMetrics ?? [],
        stageHealth: "on-track"
    };
    const response = await fetch(`${baseUrl}/hypotheses/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    });
    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Failed to create hypothesis (${response.status}): ${errorBody}`);
    }
    const detail = await response.json();
    return mapHypothesisDetail(detail);
}
async function updateHypothesis(hypId, payload) {
    const baseUrl = resolveBaseUrl();
    const response = await fetch(`${baseUrl}/hypotheses/${hypId}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });
    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Failed to update hypothesis (${response.status}): ${errorBody}`);
    }
    const detail = await response.json();
    return mapHypothesisDetail(detail);
}
async function createComment(hypId, payload) {
    const baseUrl = resolveBaseUrl();
    const response = await fetch(`${baseUrl}/hypotheses/${hypId}/comments`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });
    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Failed to add comment (${response.status}): ${errorBody}`);
    }
    return mapComment(await response.json());
}
async function updateComment(hypId, commentId, payload) {
    const baseUrl = resolveBaseUrl();
    const response = await fetch(`${baseUrl}/hypotheses/${hypId}/comments/${commentId}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });
    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Failed to update comment (${response.status}): ${errorBody}`);
    }
    return mapComment(await response.json());
}
async function deleteComment(hypId, commentId) {
    const baseUrl = resolveBaseUrl();
    const response = await fetch(`${baseUrl}/hypotheses/${hypId}/comments/${commentId}`, {
        method: "DELETE"
    });
    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Failed to delete comment (${response.status}): ${errorBody}`);
    }
}
async function createAttachment(hypId, payload) {
    const baseUrl = resolveBaseUrl();
    const response = await fetch(`${baseUrl}/hypotheses/${hypId}/attachments`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });
    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Failed to add attachment (${response.status}): ${errorBody}`);
    }
    return mapAttachment(await response.json());
}
async function createChecklistItem(hypId, payload) {
    const baseUrl = resolveBaseUrl();
    const response = await fetch(`${baseUrl}/hypotheses/${hypId}/checklist`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });
    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Failed to add checklist item (${response.status}): ${errorBody}`);
    }
    return mapHypothesisDetail(await response.json());
}
async function updateChecklistItem(hypId, itemId, payload) {
    const baseUrl = resolveBaseUrl();
    const response = await fetch(`${baseUrl}/hypotheses/${hypId}/checklist/${itemId}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });
    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Failed to update checklist item (${response.status}): ${errorBody}`);
    }
    return mapHypothesisDetail(await response.json());
}
async function deleteChecklistItem(hypId, itemId) {
    const baseUrl = resolveBaseUrl();
    const response = await fetch(`${baseUrl}/hypotheses/${hypId}/checklist/${itemId}`, {
        method: "DELETE"
    });
    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Failed to delete checklist item (${response.status}): ${errorBody}`);
    }
    return mapHypothesisDetail(await response.json());
}
async function updateTask(hypId, taskId, payload) {
    const baseUrl = resolveBaseUrl();
    const response = await fetch(`${baseUrl}/hypotheses/${hypId}/tasks/${taskId}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            status: payload.status,
            severity: payload.severity,
            due: payload.dueAt,
            owner: payload.owner
        })
    });
    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Failed to update task (${response.status}): ${errorBody}`);
    }
    return mapHypothesisDetail(await response.json());
}
async function updateApproval(hypId, approvalId, payload) {
    const baseUrl = resolveBaseUrl();
    const response = await fetch(`${baseUrl}/hypotheses/${hypId}/approvals/${approvalId}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });
    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Failed to update approval (${response.status}): ${errorBody}`);
    }
    return mapHypothesisDetail(await response.json());
}
async function fetchHypothesisDetail(hypId) {
    const baseUrl = resolveBaseUrl();
    try {
        const response = await fetch(`${baseUrl}/hypotheses/${hypId}`, {
            headers: {
                "Content-Type": "application/json"
            },
            cache: "no-store"
        });
        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`Failed to fetch hypothesis ${hypId} (${response.status}): ${errorBody}`);
        }
        const detail = await response.json();
        return mapHypothesisDetail(detail);
    } catch (error) {
        const details = error instanceof Error ? error.message : "unknown network error";
        throw new Error(`Unable to reach Hypothesis API at ${baseUrl} for ${hypId}. Ensure the backend service is running and accessible. Details: ${details}`);
    }
}
}),
"[project]/apps/web/components/hypotheses/hypothesis-workspace.tsx [app-rsc] (client reference proxy) <module evaluation>", ((__turbopack_context__) => {
"use strict";

// This file is generated by next-core EcmascriptClientReferenceModule.
__turbopack_context__.s([
    "HypothesisWorkspace",
    ()=>HypothesisWorkspace
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.1_@babel+core@7.28.5_react-dom@19.2.0_react@19.2.0__react@19.2.0/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const HypothesisWorkspace = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call HypothesisWorkspace() from the server but HypothesisWorkspace is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/apps/web/components/hypotheses/hypothesis-workspace.tsx <module evaluation>", "HypothesisWorkspace");
}),
"[project]/apps/web/components/hypotheses/hypothesis-workspace.tsx [app-rsc] (client reference proxy)", ((__turbopack_context__) => {
"use strict";

// This file is generated by next-core EcmascriptClientReferenceModule.
__turbopack_context__.s([
    "HypothesisWorkspace",
    ()=>HypothesisWorkspace
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.1_@babel+core@7.28.5_react-dom@19.2.0_react@19.2.0__react@19.2.0/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const HypothesisWorkspace = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call HypothesisWorkspace() from the server but HypothesisWorkspace is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/apps/web/components/hypotheses/hypothesis-workspace.tsx", "HypothesisWorkspace");
}),
"[project]/apps/web/components/hypotheses/hypothesis-workspace.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$hypotheses$2f$hypothesis$2d$workspace$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/apps/web/components/hypotheses/hypothesis-workspace.tsx [app-rsc] (client reference proxy) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$hypotheses$2f$hypothesis$2d$workspace$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__ = __turbopack_context__.i("[project]/apps/web/components/hypotheses/hypothesis-workspace.tsx [app-rsc] (client reference proxy)");
;
__turbopack_context__.n(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$hypotheses$2f$hypothesis$2d$workspace$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__);
}),
"[project]/apps/web/app/hypotheses/page.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>HypothesesPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.1_@babel+core@7.28.5_react-dom@19.2.0_react@19.2.0__react@19.2.0/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$hypothesis$2d$api$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/lib/hypothesis-api.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$hypotheses$2f$hypothesis$2d$workspace$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/components/hypotheses/hypothesis-workspace.tsx [app-rsc] (ecmascript)");
;
;
;
async function HypothesesPage() {
    const dashboard = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$lib$2f$hypothesis$2d$api$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["fetchHypothesisDashboard"])();
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$components$2f$hypotheses$2f$hypothesis$2d$workspace$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["HypothesisWorkspace"], {
        initialDashboard: dashboard
    }, void 0, false, {
        fileName: "[project]/apps/web/app/hypotheses/page.tsx",
        lineNumber: 6,
        columnNumber: 10
    }, this);
}
}),
"[project]/apps/web/app/hypotheses/page.tsx [app-rsc] (ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/apps/web/app/hypotheses/page.tsx [app-rsc] (ecmascript)"));
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__5794c8ed._.js.map