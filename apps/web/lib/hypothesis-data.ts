export type HypothesisStageKey =
  | "IDEATION"
  | "SCOPING"
  | "PRIORITIZATION"
  | "EXPERIMENTATION"
  | "EVALUATION"
  | "SCALING"
  | "PRODUCTION"
  | "ARCHIVED";

export interface HypothesisActor {
  name: string;
  email: string;
  role?: string;
  department?: string;
}

export interface HypothesisItem {
  id: string;
  title: string;
  owner: string;
  stage: HypothesisStageKey;
  impact: number;
  feasibility: number;
  confidence: number;
  nextGate: string | null;
  lastUpdated: string;
  tags: string[];
  priority?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
}

export interface HypothesisStageSummary {
  key: HypothesisStageKey;
  title: string;
  description: string;
  slaHours: number;
  stageOwner: string;
  stageHealth: "on-track" | "warning" | "risk";
  conversionRate: number;
  averageDaysInStage: number;
  items: HypothesisItem[];
}

export interface HypothesisHighlights {
  portfolioValue: string;
  experimentsInFlight: number;
  avgTimeToValue: string;
  governancePending: number;
}

export interface HypothesisMilestone {
  label: string;
  due: string;
}

export interface HypothesisStageEvent {
  stage: HypothesisStageKey;
  changedAt: string;
  changedBy: string;
  notes?: string | null;
}

export interface HypothesisLinkedExperiment {
  id: string;
  title: string;
  status: string;
  owner?: string | null;
  lastUpdated?: string | null;
}

export interface HypothesisChecklistItem {
  id?: string;
  label: string;
  status: "complete" | "in-progress" | "pending";
  owner?: string | null;
  ownerEmail?: string | null;
  dueAt?: string | null;
}

export interface HypothesisAttachment {
  id: string;
  name: string;
  url: string;
  version: number;
  uploadedAt: string;
  uploadedBy?: string | null;
  uploadedByEmail?: string | null;
}

export interface HypothesisComment {
  id: string;
  author: string;
  authorEmail?: string | null;
  body: string;
  createdAt: string;
  updatedAt?: string | null;
  isResolved: boolean;
  replies: HypothesisComment[];
}

export interface HypothesisApproval {
  id: string;
  approverName: string;
  approverEmail?: string | null;
  approverRole?: string | null;
  status: "pending" | "approved" | "rejected";
  required: boolean;
  decidedAt?: string | null;
  notes?: string | null;
}

export interface HypothesisDetail {
  id: string;
  title: string;
  owner: string;
  owners?: HypothesisActor[];
  sponsor: string;
  sponsors?: HypothesisActor[];
  stage: HypothesisStageKey;
  stageHealth?: "on-track" | "warning" | "risk";
  stageHistory?: HypothesisStageEvent[];
  description: string;
  targetValue: string;
  costAvoidance: string;
  confidence: number;
  feasibility: number;
  impact: number;
  nextMilestone: HypothesisMilestone;
  dependencies: string[];
  linkedExperiments: HypothesisLinkedExperiment[];
  gatingChecklist: HypothesisChecklistItem[];
  roiEstimate?: {
    currency?: string;
    expectedRoi?: number;
    paybackPeriodWeeks?: number;
    oneTimeCost?: number;
    ongoingCostPerPeriod?: number;
    valueDriver?: string;
  };
  notes?: string | null;
  labId?: string;
  attachments?: HypothesisAttachment[];
  comments?: HypothesisComment[];
  approvals?: HypothesisApproval[];
  tasks?: HypothesisTask[];
  activityDigest?: HypothesisActivity[];
}

export interface HypothesisTask {
  id: string;
  label: string;
  owner: string;
  dueAt: string;
  type: "data" | "governance" | "approval";
  status: "at-risk" | "due-soon" | "blocked";
  severity: "critical" | "high" | "medium";
  relatedStage: HypothesisStageKey;
}

export interface HypothesisActivity {
  id: string;
  title: string;
  actor: string;
  detail: string;
  occurredAt: string;
  stage: HypothesisStageKey;
  impact: "positive" | "neutral" | "negative";
  type?: string;
}

export interface HypothesisDashboard {
  stages: HypothesisStageSummary[];
  highlights: HypothesisHighlights;
  focusHypothesis: HypothesisDetail;
  tasks: HypothesisTask[];
  activity: HypothesisActivity[];
}
