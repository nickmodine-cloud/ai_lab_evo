
from __future__ import annotations

from datetime import datetime
from typing import List, Literal, Optional

from pydantic import BaseModel, EmailStr, Field, ConfigDict


StageLiteral = Literal[
    "IDEATION",
    "SCOPING",
    "PRIORITIZATION",
    "EXPERIMENTATION",
    "EVALUATION",
    "SCALING",
    "PRODUCTION",
    "ARCHIVED",
]
StageHealthLiteral = Literal["on-track", "warning", "risk"]
PriorityLiteral = Literal["LOW", "MEDIUM", "HIGH", "CRITICAL"]
RiskClassLiteral = Literal["LOW", "MEDIUM", "HIGH"]
ChecklistStatusLiteral = Literal["pending", "in-progress", "complete"]
ImpactSentimentLiteral = Literal["positive", "neutral", "negative"]
TaskStatusLiteral = Literal["at-risk", "due-soon", "blocked"]
TaskSeverityLiteral = Literal["critical", "high", "medium"]
TaskTypeLiteral = Literal["data", "governance", "approval"]
ActorRoleLiteral = Literal["OWNER", "TECH_LEAD", "REVIEWER", "OBSERVER", "SPONSOR", "STAKEHOLDER"]
ActivityTypeLiteral = Literal[
    "CREATED",
    "UPDATED",
    "STAGE_CHANGED",
    "COMMENTED",
    "APPROVED",
    "REJECTED",
    "ATTACHMENT_ADDED",
]


def to_camel(string: str) -> str:
    parts = string.split("_")
    return parts[0] + "".join(word.capitalize() for word in parts[1:])


class CamelModel(BaseModel):
    """Base model that serialises using camelCase for JSON responses."""

    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
    )


class Hypothesis(CamelModel):
    hyp_id: str
    title: str
    stage: StageLiteral
    owner: str


class HypothesisActor(CamelModel):
    name: str = Field(..., min_length=1)
    email: EmailStr
    role: ActorRoleLiteral = "OWNER"
    department: Optional[str] = None


class HypothesisStageEvent(CamelModel):
    stage: StageLiteral
    changed_at: datetime
    changed_by: str
    notes: Optional[str] = None


class HypothesisSuccessMetric(CamelModel):
    label: str
    target: float
    direction: Literal["INCREASE", "DECREASE", "MAINTAIN"] = "INCREASE"
    unit: Optional[str] = None
    current_value: Optional[float] = None


class HypothesisChecklistItem(CamelModel):
    id: Optional[str] = None
    label: str
    status: ChecklistStatusLiteral = "pending"
    owner: Optional[str] = None
    owner_email: Optional[str] = None
    due_at: Optional[datetime] = None


class HypothesisLinkedExperiment(CamelModel):
    id: str
    title: str
    status: str
    owner: Optional[str] = None
    last_updated: Optional[datetime] = None


class HypothesisLink(CamelModel):
    label: str
    url: str
    type: Literal["SPEC", "DOC", "DATASET", "EXPERIMENT", "OTHER"] = "OTHER"


class HypothesisAttachment(CamelModel):
    id: str
    name: str
    url: str
    version: int = 1
    uploaded_at: datetime
    uploaded_by: Optional[str] = None
    uploaded_by_email: Optional[str] = None


class HypothesisDataRequirements(CamelModel):
    sources: List[str] = Field(default_factory=list)
    volume: Optional[str] = None
    quality: Literal["UNKNOWN", "LOW", "MEDIUM", "HIGH"] = "UNKNOWN"
    refresh_cadence: Optional[str] = None
    governance_notes: Optional[str] = None


class HypothesisValueEstimate(CamelModel):
    currency: str = Field(..., pattern=r"^[A-Z]{3}$")
    one_time_cost: Optional[float] = Field(default=None, ge=0)
    ongoing_cost_per_period: Optional[float] = Field(default=None, ge=0)
    expected_roi: float
    payback_period_weeks: int = Field(..., ge=0)
    value_driver: Optional[str] = None


class HypothesisTimeEstimate(CamelModel):
    discovery_weeks: Optional[int] = Field(default=None, ge=0)
    experiment_weeks: Optional[int] = Field(default=None, ge=0)
    production_weeks: Optional[int] = Field(default=None, ge=0)


class HypothesisActivity(CamelModel):
    id: str
    type: ActivityTypeLiteral
    title: str
    actor: str
    detail: Optional[str] = None
    occurred_at: datetime
    stage: StageLiteral
    impact: ImpactSentimentLiteral = "neutral"


class HypothesisComment(CamelModel):
    id: str
    author: str
    author_email: Optional[str] = None
    body: str
    is_resolved: bool = False
    created_at: datetime
    updated_at: datetime
    replies: List["HypothesisComment"] = Field(default_factory=list)


class HypothesisApproval(CamelModel):
    id: str
    approver_name: str
    approver_email: Optional[str] = None
    approver_role: Optional[str] = None
    status: Literal["pending", "approved", "rejected"] = "pending"
    required: bool = True
    decided_at: Optional[datetime] = None
    notes: Optional[str] = None


class HypothesisBase(CamelModel):
    hyp_id: str
    lab_id: str
    version: int = 1
    title: str
    statement: str
    description: Optional[str] = None
    ai_type: Literal["LLM", "CLASSICAL_ML", "CV", "NLP", "RPA", "ANALYTICS", "OTHER"] = "OTHER"
    ai_subtype: Optional[str] = None
    business_category: Optional[str] = None
    priority: PriorityLiteral = "MEDIUM"
    stage: StageLiteral = "IDEATION"
    stage_health: StageHealthLiteral = "on-track"
    stage_history: List[HypothesisStageEvent] = Field(default_factory=list)
    impact_score: float = Field(..., ge=0, le=10)
    feasibility_score: float = Field(..., ge=0, le=10)
    confidence_score: float = Field(..., ge=0, le=1)
    complexity_score: Optional[float] = Field(default=None, ge=0, le=10)
    risk_class: RiskClassLiteral = "MEDIUM"
    data_requirements: HypothesisDataRequirements = Field(default_factory=HypothesisDataRequirements)
    roi_estimate: Optional[HypothesisValueEstimate] = None
    time_estimate: Optional[HypothesisTimeEstimate] = None
    success_metrics: List[HypothesisSuccessMetric] = Field(default_factory=list)
    gating_checklist: List[HypothesisChecklistItem] = Field(default_factory=list)
    dependencies: List[str] = Field(default_factory=list)
    linked_experiments: List[HypothesisLinkedExperiment] = Field(default_factory=list)
    tags: List[str] = Field(default_factory=list)
    links: List[HypothesisLink] = Field(default_factory=list)
    attachments: List[HypothesisAttachment] = Field(default_factory=list)
    governance_state: Literal["NOT_REQUIRED", "PENDING", "APPROVED", "REJECTED"] = "NOT_REQUIRED"
    notes: Optional[str] = None
    owners: List[HypothesisActor] = Field(default_factory=list)
    sponsors: List[HypothesisActor] = Field(default_factory=list)
    observers: List[HypothesisActor] = Field(default_factory=list)
    created_at: datetime
    updated_at: datetime
    archived_at: Optional[datetime] = None


class HypothesisSummaryItem(CamelModel):
    id: str
    title: str
    owner: str
    stage: StageLiteral
    impact: float
    feasibility: float
    confidence: float
    next_gate: Optional[str] = None
    last_updated: datetime
    tags: List[str]
    priority: PriorityLiteral = "MEDIUM"


class HypothesisStageSummary(CamelModel):
    key: StageLiteral
    title: str
    description: str
    sla_hours: int
    stage_owner: str
    stage_health: StageHealthLiteral = "on-track"
    conversion_rate: float
    average_days_in_stage: int
    items: List[HypothesisSummaryItem] = Field(default_factory=list)


class HypothesisHighlights(CamelModel):
    portfolio_value: str
    experiments_in_flight: int
    avg_time_to_value: str
    governance_pending: int


class HypothesisMilestone(CamelModel):
    label: str
    due: datetime


class HypothesisDetail(HypothesisBase):
    id: str
    sponsor: Optional[str] = None
    target_value: Optional[str] = None
    cost_avoidance: Optional[str] = None
    next_milestone: Optional[HypothesisMilestone] = None
    activity_digest: List[HypothesisActivity] = Field(default_factory=list)
    comments: List[HypothesisComment] = Field(default_factory=list)
    attachments: List[HypothesisAttachment] = Field(default_factory=list)
    approvals: List[HypothesisApproval] = Field(default_factory=list)
    tasks: List[HypothesisTask] = Field(default_factory=list)


class HypothesisTask(CamelModel):
    id: str
    label: str
    owner: str
    due: datetime
    type: TaskTypeLiteral
    status: TaskStatusLiteral
    severity: TaskSeverityLiteral
    related_stage: StageLiteral


class HypothesisDashboard(CamelModel):
    stages: List[HypothesisStageSummary]
    highlights: HypothesisHighlights
    focus_hypothesis: HypothesisDetail
    tasks: List[HypothesisTask]
    activity: List[HypothesisActivity]


class HypothesisCreatePayload(CamelModel):
    title: str
    statement: str
    lab_id: str
    ai_type: Literal["LLM", "CLASSICAL_ML", "CV", "NLP", "RPA", "ANALYTICS", "OTHER"] = "OTHER"
    ai_subtype: Optional[str] = None
    business_category: Optional[str] = None
    priority: PriorityLiteral = "MEDIUM"
    stage_health: StageHealthLiteral = "on-track"
    impact_score: float = Field(default=5.0, ge=0, le=10)
    feasibility_score: float = Field(default=5.0, ge=0, le=10)
    confidence_score: float = Field(default=0.5, ge=0, le=1)
    complexity_score: Optional[float] = Field(default=None, ge=0, le=10)
    risk_class: RiskClassLiteral = "MEDIUM"
    owners: List[HypothesisActor]
    sponsors: List[HypothesisActor] = Field(default_factory=list)
    observers: List[HypothesisActor] = Field(default_factory=list)
    description: Optional[str] = None
    tags: List[str] = Field(default_factory=list)
    success_metrics: List[HypothesisSuccessMetric] = Field(default_factory=list)
    roi_estimate: Optional[HypothesisValueEstimate] = None
    time_estimate: Optional[HypothesisTimeEstimate] = None
    data_requirements: HypothesisDataRequirements = Field(default_factory=HypothesisDataRequirements)
    gating_checklist: List[HypothesisChecklistItem] = Field(default_factory=list)
    dependencies: List[str] = Field(default_factory=list)
    linked_experiments: List[HypothesisLinkedExperiment] = Field(default_factory=list)
    links: List[HypothesisLink] = Field(default_factory=list)
    notes: Optional[str] = None
    initial_stage: Optional[StageLiteral] = None


class HypothesisUpdatePayload(CamelModel):
    title: Optional[str] = None
    statement: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[PriorityLiteral] = None
    stage: Optional[StageLiteral] = None
    stage_health: Optional[StageHealthLiteral] = None
    impact_score: Optional[float] = Field(default=None, ge=0, le=10)
    feasibility_score: Optional[float] = Field(default=None, ge=0, le=10)
    confidence_score: Optional[float] = Field(default=None, ge=0, le=1)
    complexity_score: Optional[float] = Field(default=None, ge=0, le=10)
    risk_class: Optional[RiskClassLiteral] = None
    owners: Optional[List[HypothesisActor]] = None
    sponsors: Optional[List[HypothesisActor]] = None
    observers: Optional[List[HypothesisActor]] = None
    tags: Optional[List[str]] = None
    success_metrics: Optional[List[HypothesisSuccessMetric]] = None
    roi_estimate: Optional[HypothesisValueEstimate] = None
    time_estimate: Optional[HypothesisTimeEstimate] = None
    data_requirements: Optional[HypothesisDataRequirements] = None
    gating_checklist: Optional[List[HypothesisChecklistItem]] = None
    dependencies: Optional[List[str]] = None
    linked_experiments: Optional[List[HypothesisLinkedExperiment]] = None
    links: Optional[List[HypothesisLink]] = None
    governance_state: Optional[Literal["NOT_REQUIRED", "PENDING", "APPROVED", "REJECTED"]] = None
    notes: Optional[str] = None
    stage_history: Optional[List[HypothesisStageEvent]] = None
    attachments: Optional[List[HypothesisAttachment]] = None
    updated_by: Optional[str] = None


class CommentCreatePayload(CamelModel):
    author: HypothesisActor
    body: str
    parent_id: Optional[str] = None


class CommentUpdatePayload(CamelModel):
    body: Optional[str] = None
    is_resolved: Optional[bool] = None


class AttachmentCreatePayload(CamelModel):
    name: str
    url: str
    version: Optional[int] = None
    uploaded_by: Optional[str] = None
    uploaded_by_email: Optional[str] = None


class ChecklistItemCreatePayload(CamelModel):
    label: str
    owner: Optional[str] = None
    owner_email: Optional[str] = None
    due_at: Optional[datetime] = None


class ChecklistItemUpdatePayload(CamelModel):
    label: Optional[str] = None
    status: Optional[ChecklistStatusLiteral] = None
    owner: Optional[str] = None
    owner_email: Optional[str] = None
    due_at: Optional[datetime] = None


class TaskUpdatePayload(CamelModel):
    status: Optional[TaskStatusLiteral] = None
    severity: Optional[TaskSeverityLiteral] = None
    due: Optional[datetime] = None
    owner: Optional[str] = None


class ApprovalUpdatePayload(CamelModel):
    status: Optional[Literal["pending", "approved", "rejected"]] = None
    notes: Optional[str] = None


HypothesisComment.model_rebuild()
