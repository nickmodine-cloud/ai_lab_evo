"use client";

import { useMemo, useState } from "react";
import { useTranslations } from 'next-intl';
import { AnimatedModal } from "@/components/ui/animated-modal";
import { HypothesisDetail, HypothesisStageKey } from "@/lib/hypothesis-data";
import { AlertTriangle, CheckCircle2, XCircle, ArrowRight, ShieldCheck, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

const stageOrder: HypothesisStageKey[] = [
  "IDEATION",
  "SCOPING",
  "PRIORITIZATION",
  "EXPERIMENTATION",
  "EVALUATION",
  "SCALING"
];

const stageLabels: Record<HypothesisStageKey, string> = {
  IDEATION: "Ideation",
  SCOPING: "Scoping",
  PRIORITIZATION: "Prioritization",
  EXPERIMENTATION: "Experimentation",
  EVALUATION: "Evaluation",
  SCALING: "Scaling"
};

interface TransitionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hypothesis: HypothesisDetail;
  currentStage: HypothesisStageKey;
  onTransition: (targetStage: HypothesisStageKey) => void;
  isSubmitting?: boolean;
}

interface ReadinessCheck {
  field: string;
  status: "complete" | "incomplete" | "warning";
  message: string;
}

interface ApprovalRequirement {
  approver: string;
  role: string;
  status: "pending" | "approved" | "rejected";
  required: boolean;
}

export function TransitionDialog({
  open,
  onOpenChange,
  hypothesis,
  currentStage,
  onTransition,
  isSubmitting = false
}: TransitionDialogProps) {
  const t = useTranslations('hypotheses.transition');
  const [targetStage, setTargetStage] = useState<HypothesisStageKey | null>(null);

  const currentStageIndex = stageOrder.indexOf(currentStage);
  const nextStage = currentStageIndex < stageOrder.length - 1 ? stageOrder[currentStageIndex + 1] : null;
  const previousStage = currentStageIndex > 0 ? stageOrder[currentStageIndex - 1] : null;

  const readinessChecks = useMemo<ReadinessCheck[]>(() => {
    if (!targetStage) return [];

    const checks: ReadinessCheck[] = [];
    (hypothesis.gatingChecklist ?? []).forEach((item) => {
      if (item.status === "pending") {
        checks.push({
          field: item.label,
          status: "incomplete",
          message: `Required checklist item "${item.label}" is not completed`
        });
      } else if (item.status === "in-progress") {
        checks.push({
          field: item.label,
          status: "warning",
          message: `Checklist item "${item.label}" is in progress`
        });
      }
    });

    if (targetStage === "SCOPING" && !hypothesis.description) {
      checks.push({
        field: "Description",
        status: "incomplete",
        message: "Hypothesis description is required for Scoping stage"
      });
    }

    const targetValueMissing = !hypothesis.targetValue || hypothesis.targetValue.toLowerCase().includes("not set");
    const costAvoidanceMissing = !hypothesis.costAvoidance || hypothesis.costAvoidance.toLowerCase().includes("not set");

    if (targetStage === "PRIORITIZATION" && (targetValueMissing || costAvoidanceMissing)) {
      checks.push({
        field: "ROI Metrics",
        status: "incomplete",
        message: "Target value and cost avoidance are required for Prioritization"
      });
    }

    if (targetStage === "EXPERIMENTATION" && (hypothesis.linkedExperiments ?? []).length === 0) {
      checks.push({
        field: "Experiments",
        status: "warning",
        message: "No experiments linked. Consider adding at least one experiment plan"
      });
    }

    return checks;
  }, [hypothesis.costAvoidance, hypothesis.description, hypothesis.gatingChecklist, hypothesis.linkedExperiments, hypothesis.targetValue, targetStage]);

  const { approvalRequirements, approvalMode } = useMemo(() => {
    if (!targetStage) {
      return { approvalRequirements: [], approvalMode: "single" as const };
    }
    const requirements: ApprovalRequirement[] = [];
    let mode: "single" | "all" | "majority" = "single";

    if (targetStage === "PRIORITIZATION") {
      requirements.push(
        { approver: "Portfolio Council", role: "Portfolio Manager", status: "pending", required: true },
        { approver: "Finance Partner", role: "Finance", status: "pending", required: true }
      );
      mode = "all";
    } else if (targetStage === "EXPERIMENTATION") {
      requirements.push(
        { approver: "Lab Squad Alpha", role: "Tech Lead", status: "pending", required: true }
      );
      mode = "single";
    } else if (targetStage === "EVALUATION") {
      requirements.push(
        { approver: "Governance Office", role: "Governance", status: "pending", required: true },
        { approver: "Ops Data Guild", role: "Data Lead", status: "pending", required: false }
      );
      mode = "majority";
    } else if (targetStage === "SCALING") {
      requirements.push(
        { approver: "Scale Factory", role: "Scale Lead", status: "pending", required: true },
        { approver: "COO — Liam Carter", role: "Executive Sponsor", status: "pending", required: true }
      );
      mode = "all";
    }

    return { approvalRequirements: requirements, approvalMode: mode };
  }, [targetStage]);

  const isReady = readinessChecks.filter((c) => c.status === "incomplete").length === 0;
  const hasWarnings = readinessChecks.filter((c) => c.status === "warning").length > 0;

  const handleTransition = () => {
    if (targetStage && isReady) {
      onTransition(targetStage);
    }
  };

  const getStatusIcon = (status: ReadinessCheck["status"]) => {
    switch (status) {
      case "complete":
        return <CheckCircle2 className="h-4 w-4 text-neon-green" />;
      case "incomplete":
        return <XCircle className="h-4 w-4 text-[rgba(255,120,210,0.9)]" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-[rgba(255,180,71,0.9)]" />;
    }
  };

  const getStatusBadgeClass = (status: ReadinessCheck["status"]) => {
    switch (status) {
      case "complete":
        return "border-[rgba(0,255,136,0.45)] bg-[rgba(0,255,136,0.08)] text-neon-green";
      case "incomplete":
        return "border-[rgba(255,59,241,0.45)] bg-[rgba(255,59,241,0.08)] text-[rgba(255,120,210,0.9)]";
      case "warning":
        return "border-[rgba(255,180,71,0.45)] bg-[rgba(255,180,71,0.08)] text-[rgba(255,200,120,0.9)]";
    }
  };

  return (
    <AnimatedModal
      open={open}
      onOpenChange={onOpenChange}
      title="Transition Hypothesis Stage"
      size="lg"
    >
      <div className="space-y-6">
        {/* Current and Target Stage */}
        <div className="flex items-center justify-between rounded-2xl border border-border/60 bg-surface-muted/70 px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-center">
              <span className="text-xs uppercase tracking-[0.24em] text-text-secondary/60">Current</span>
              <span className="mt-1 text-sm font-semibold text-text-primary">
                {stageLabels[currentStage]}
              </span>
            </div>
            <ArrowRight className="h-5 w-5 text-text-secondary/60" />
            <div className="flex flex-col items-center">
              <span className="text-xs uppercase tracking-[0.24em] text-text-secondary/60">Target</span>
              <select
                value={targetStage || ""}
                onChange={(e) => setTargetStage(e.target.value as HypothesisStageKey)}
                className="mt-1 rounded-lg border border-border/60 bg-surface px-3 py-1.5 text-sm font-semibold text-text-primary focus:border-neon-green/60 focus:outline-none"
              >
                <option value="">Select stage</option>
                {nextStage && (
                  <option value={nextStage}>{stageLabels[nextStage]}</option>
                )}
                {previousStage && (
                  <option value={previousStage}>{stageLabels[previousStage]} (Backward)</option>
                )}
              </select>
            </div>
          </div>
        </div>

        {targetStage && (
          <>
            {/* Readiness Check */}
            <div className="rounded-2xl border border-border/60 bg-surface-muted/70 px-4 py-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-neon-green" />
                  Readiness Check
                </h3>
                {isReady ? (
                  <span className="inline-flex items-center gap-2 rounded-full border border-[rgba(0,255,136,0.45)] bg-[rgba(0,255,136,0.08)] px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-neon-green">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Ready
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2 rounded-full border border-[rgba(255,59,241,0.45)] bg-[rgba(255,59,241,0.08)] px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-[rgba(255,120,210,0.9)]">
                    <XCircle className="h-3.5 w-3.5" />
                    Not Ready
                  </span>
                )}
              </div>

              {readinessChecks.length > 0 ? (
                <ul className="space-y-2">
                  {readinessChecks.map((check, index) => (
                    <li
                      key={index}
                      className={cn(
                        "flex items-start gap-3 rounded-xl border px-3 py-2 text-sm transition duration-200",
                        getStatusBadgeClass(check.status)
                      )}
                    >
                      {getStatusIcon(check.status)}
                      <div className="flex-1">
                        <p className="font-medium">{check.field}</p>
                        <p className="mt-0.5 text-xs opacity-80">{check.message}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="rounded-xl border border-[rgba(0,255,136,0.45)] bg-[rgba(0,255,136,0.08)] px-3 py-3 text-sm text-neon-green">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>All readiness checks passed</span>
                  </div>
                </div>
              )}
            </div>

            {/* Approval Requirements */}
            {approvalRequirements.length > 0 && (
              <div className="rounded-2xl border border-border/60 bg-surface-muted/70 px-4 py-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                    <Clock className="h-4 w-4 text-neon-turquoise" />
                    Approval Requirements
                  </h3>
                  <select
                    value={approvalMode}
                    onChange={(e) => setApprovalMode(e.target.value as "single" | "all" | "majority")}
                    className="rounded-lg border border-border/60 bg-surface px-2 py-1 text-xs text-text-primary focus:border-neon-green/60 focus:outline-none"
                  >
                    <option value="single">Single Approval</option>
                    <option value="all">All Required</option>
                    <option value="majority">Majority</option>
                  </select>
                </div>

                <div className="mb-3 rounded-lg border border-border/60 bg-surface-hover/70 px-3 py-2 text-xs text-text-secondary">
                  <p>
                    Approval mode: <span className="font-semibold text-text-primary">{approvalMode}</span>
                    {approvalMode === "all" && " — All approvers must approve"}
                    {approvalMode === "majority" && " — Majority of approvers must approve"}
                    {approvalMode === "single" && " — Any approver can approve"}
                  </p>
                </div>

                <ul className="space-y-2">
                  {approvalRequirements.map((req, index) => (
                    <li
                      key={index}
                      className="flex items-center justify-between rounded-xl border border-border/60 bg-surface-hover/70 px-3 py-2 text-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full border border-border/60 bg-surface flex items-center justify-center">
                          <span className="text-xs font-semibold text-text-primary">
                            {req.approver.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-text-primary">{req.approver}</p>
                          <p className="text-xs text-text-secondary">{req.role}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {req.required && (
                          <span className="rounded-full border border-[rgba(255,59,241,0.4)] bg-[rgba(255,59,241,0.08)] px-2 py-0.5 text-[10px] uppercase tracking-wide text-[rgba(255,120,210,0.9)]">
                            Required
                          </span>
                        )}
                        <span className="rounded-full border border-border/60 px-2 py-0.5 text-[10px] uppercase tracking-wide text-text-secondary">
                          {req.status}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-border/60">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="px-4 py-2 rounded-full border border-border/80 text-sm font-medium text-text-secondary transition duration-200 ease-soft-spring hover:border-neon-green/60 hover:text-neon-green"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleTransition}
                disabled={!isReady || !targetStage || isSubmitting}
                className={cn(
                  "relative overflow-hidden rounded-full px-4 py-2 text-sm font-semibold text-base shadow-neon transition duration-200 ease-soft-spring",
                  isReady && targetStage && !isSubmitting
                    ? "hover:shadow-neon-hover"
                    : "opacity-50 cursor-not-allowed"
                )}
              >
                <span className="absolute inset-0 bg-[linear-gradient(135deg,rgba(0,255,136,0.9),rgba(64,224,208,0.9))]" />
                <span className="relative flex items-center gap-2">
                  <ArrowRight className="h-4 w-4" />
                  {isSubmitting ? "Submitting..." : isReady ? "Transition" : "Resolve Issues First"}
                </span>
              </button>
            </div>
          </>
        )}
      </div>
    </AnimatedModal>
  );
}

