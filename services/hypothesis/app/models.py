from __future__ import annotations

from datetime import datetime
from typing import List, Optional
from uuid import uuid4

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String, Text, func
from sqlalchemy.types import JSON
from sqlalchemy.ext.mutable import MutableDict, MutableList
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    pass


def generate_uuid() -> str:
    return str(uuid4())


class HypothesisRecord(Base):
    __tablename__ = "hypotheses"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    hyp_id: Mapped[str] = mapped_column(String(32), unique=True, nullable=False)
    lab_id: Mapped[str] = mapped_column(String(64), nullable=False)
    version: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    title: Mapped[str] = mapped_column(String(160), nullable=False)
    statement: Mapped[str] = mapped_column(Text, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text)
    ai_type: Mapped[str] = mapped_column(String(32), nullable=False, default="OTHER")
    ai_subtype: Mapped[Optional[str]] = mapped_column(String(64))
    business_category: Mapped[Optional[str]] = mapped_column(String(64))
    priority: Mapped[str] = mapped_column(String(16), nullable=False, default="MEDIUM")
    stage: Mapped[str] = mapped_column(String(32), nullable=False, default="IDEATION")
    stage_health: Mapped[str] = mapped_column(String(16), nullable=False, default="on-track")
    stage_history: Mapped[List[dict]] = mapped_column(
        MutableList.as_mutable(JSON), default=list, nullable=False
    )
    impact_score: Mapped[float] = mapped_column(Float, nullable=False)
    feasibility_score: Mapped[float] = mapped_column(Float, nullable=False)
    confidence_score: Mapped[float] = mapped_column(Float, nullable=False)
    complexity_score: Mapped[Optional[float]] = mapped_column(Float)
    risk_class: Mapped[str] = mapped_column(String(16), nullable=False, default="MEDIUM")
    data_requirements: Mapped[dict] = mapped_column(
        MutableDict.as_mutable(JSON), default=dict, nullable=False
    )
    roi_estimate: Mapped[Optional[dict]] = mapped_column(MutableDict.as_mutable(JSON), default=None)
    time_estimate: Mapped[Optional[dict]] = mapped_column(MutableDict.as_mutable(JSON), default=None)
    success_metrics: Mapped[List[dict]] = mapped_column(
        MutableList.as_mutable(JSON), default=list, nullable=False
    )
    gating_checklist: Mapped[List[dict]] = mapped_column(
        MutableList.as_mutable(JSON), default=list, nullable=False
    )
    dependencies: Mapped[List[str]] = mapped_column(
        MutableList.as_mutable(JSON), default=list, nullable=False
    )
    linked_experiments: Mapped[List[dict]] = mapped_column(
        MutableList.as_mutable(JSON), default=list, nullable=False
    )
    tags: Mapped[List[str]] = mapped_column(MutableList.as_mutable(JSON), default=list, nullable=False)
    links: Mapped[List[dict]] = mapped_column(
        MutableList.as_mutable(JSON), default=list, nullable=False
    )
    attachments: Mapped[List[dict]] = mapped_column(
        MutableList.as_mutable(JSON), default=list, nullable=False
    )
    governance_state: Mapped[str] = mapped_column(
        String(16), nullable=False, default="NOT_REQUIRED"
    )
    notes: Mapped[Optional[str]] = mapped_column(Text)
    owners: Mapped[List[dict]] = mapped_column(
        MutableList.as_mutable(JSON), default=list, nullable=False
    )
    sponsors: Mapped[List[dict]] = mapped_column(
        MutableList.as_mutable(JSON), default=list, nullable=False
    )
    observers: Mapped[List[dict]] = mapped_column(
        MutableList.as_mutable(JSON), default=list, nullable=False
    )
    activity_digest: Mapped[List[dict]] = mapped_column(
        MutableList.as_mutable(JSON), default=list, nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )
    archived_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))

    stage_history_entries: Mapped[List["HypothesisStageHistoryEntry"]] = relationship(
        "HypothesisStageHistoryEntry",
        back_populates="hypothesis",
        cascade="all, delete-orphan",
        order_by="HypothesisStageHistoryEntry.changed_at",
        lazy="selectin",
    )
    checklist_items: Mapped[List["HypothesisChecklistItem"]] = relationship(
        "HypothesisChecklistItem",
        back_populates="hypothesis",
        cascade="all, delete-orphan",
        order_by="HypothesisChecklistItem.created_at",
        lazy="selectin",
    )
    task_records: Mapped[List["HypothesisTask"]] = relationship(
        "HypothesisTask",
        back_populates="hypothesis",
        cascade="all, delete-orphan",
        order_by="HypothesisTask.due",
        lazy="selectin",
    )
    comment_threads: Mapped[List["HypothesisComment"]] = relationship(
        "HypothesisComment",
        back_populates="hypothesis",
        cascade="all, delete-orphan",
        primaryjoin="HypothesisRecord.id==HypothesisComment.hypothesis_id",
        lazy="selectin",
    )
    attachment_records: Mapped[List["HypothesisAttachment"]] = relationship(
        "HypothesisAttachment",
        back_populates="hypothesis",
        cascade="all, delete-orphan",
        order_by="HypothesisAttachment.uploaded_at",
        lazy="selectin",
    )
    approval_records: Mapped[List["HypothesisApproval"]] = relationship(
        "HypothesisApproval",
        back_populates="hypothesis",
        cascade="all, delete-orphan",
        order_by="HypothesisApproval.created_at",
        lazy="selectin",
    )
    activity_events: Mapped[List["HypothesisActivityEvent"]] = relationship(
        "HypothesisActivityEvent",
        back_populates="hypothesis",
        cascade="all, delete-orphan",
        order_by="HypothesisActivityEvent.occurred_at.desc()",
        lazy="selectin",
    )

    def as_dict(self) -> dict:
        """Serialize the record into a plain dictionary."""
        return {
            "id": self.hyp_id,
            "hyp_id": self.hyp_id,
            "lab_id": self.lab_id,
            "version": self.version,
            "title": self.title,
            "statement": self.statement,
            "description": self.description,
            "ai_type": self.ai_type,
            "ai_subtype": self.ai_subtype,
            "business_category": self.business_category,
            "priority": self.priority,
            "stage": self.stage,
            "stage_health": self.stage_health,
            "stage_history": self.stage_history,
            "impact_score": self.impact_score,
            "feasibility_score": self.feasibility_score,
            "confidence_score": self.confidence_score,
            "complexity_score": self.complexity_score,
            "risk_class": self.risk_class,
            "data_requirements": self.data_requirements,
            "roi_estimate": self.roi_estimate,
            "time_estimate": self.time_estimate,
            "success_metrics": self.success_metrics,
            "gating_checklist": self.gating_checklist,
            "dependencies": self.dependencies,
            "linked_experiments": self.linked_experiments,
            "tags": self.tags,
            "links": self.links,
            "attachments": self.attachments,
            "governance_state": self.governance_state,
            "notes": self.notes,
            "owners": self.owners,
            "sponsors": self.sponsors,
            "observers": self.observers,
            "activity_digest": self.activity_digest,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
            "archived_at": self.archived_at,
        }



class HypothesisStageHistoryEntry(Base):
    __tablename__ = "hypothesis_stage_history"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    hypothesis_id: Mapped[int] = mapped_column(
        ForeignKey("hypotheses.id", ondelete="CASCADE"), nullable=False, index=True
    )
    from_stage: Mapped[Optional[str]] = mapped_column(String(32))
    to_stage: Mapped[str] = mapped_column(String(32), nullable=False)
    changed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    changed_by: Mapped[str] = mapped_column(String(160), nullable=False)
    notes: Mapped[Optional[str]] = mapped_column(Text)

    hypothesis: Mapped[HypothesisRecord] = relationship(
        HypothesisRecord, back_populates="stage_history_entries"
    )


class HypothesisChecklistItem(Base):
    __tablename__ = "hypothesis_checklist_items"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    hypothesis_id: Mapped[int] = mapped_column(
        ForeignKey("hypotheses.id", ondelete="CASCADE"), nullable=False, index=True
    )
    label: Mapped[str] = mapped_column(String(255), nullable=False)
    owner_name: Mapped[Optional[str]] = mapped_column(String(160))
    owner_email: Mapped[Optional[str]] = mapped_column(String(160))
    status: Mapped[str] = mapped_column(String(16), nullable=False, default="pending")
    due_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    hypothesis: Mapped[HypothesisRecord] = relationship(
        HypothesisRecord, back_populates="checklist_items"
    )


class HypothesisTask(Base):
    __tablename__ = "hypothesis_tasks"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    hypothesis_id: Mapped[int] = mapped_column(
        ForeignKey("hypotheses.id", ondelete="CASCADE"), nullable=False, index=True
    )
    label: Mapped[str] = mapped_column(String(255), nullable=False)
    owner_name: Mapped[Optional[str]] = mapped_column(String(160))
    owner_email: Mapped[Optional[str]] = mapped_column(String(160))
    due: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    task_type: Mapped[str] = mapped_column("type", String(16), nullable=False, default="governance")
    status: Mapped[str] = mapped_column(String(16), nullable=False, default="due-soon")
    severity: Mapped[str] = mapped_column(String(16), nullable=False, default="medium")
    related_stage: Mapped[Optional[str]] = mapped_column(String(32))
    notes: Mapped[Optional[str]] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    hypothesis: Mapped[HypothesisRecord] = relationship(
        HypothesisRecord, back_populates="task_records"
    )


class HypothesisComment(Base):
    __tablename__ = "hypothesis_comments"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    hypothesis_id: Mapped[int] = mapped_column(
        ForeignKey("hypotheses.id", ondelete="CASCADE"), nullable=False, index=True
    )
    parent_id: Mapped[Optional[str]] = mapped_column(
        String(36), ForeignKey("hypothesis_comments.id", ondelete="CASCADE"), nullable=True
    )
    author_name: Mapped[str] = mapped_column(String(160), nullable=False)
    author_email: Mapped[Optional[str]] = mapped_column(String(160))
    body: Mapped[str] = mapped_column(Text, nullable=False)
    is_resolved: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    hypothesis: Mapped[HypothesisRecord] = relationship(
        HypothesisRecord, back_populates="comment_threads"
    )
    parent: Mapped[Optional["HypothesisComment"]] = relationship(
        lambda: HypothesisComment, remote_side="HypothesisComment.id", back_populates="replies"
    )
    replies: Mapped[List["HypothesisComment"]] = relationship(
        lambda: HypothesisComment,
        back_populates="parent",
        cascade="all, delete-orphan",
        lazy="selectin",
    )


class HypothesisAttachment(Base):
    __tablename__ = "hypothesis_attachments"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    hypothesis_id: Mapped[int] = mapped_column(
        ForeignKey("hypotheses.id", ondelete="CASCADE"), nullable=False, index=True
    )
    file_name: Mapped[str] = mapped_column(String(255), nullable=False)
    file_type: Mapped[Optional[str]] = mapped_column(String(64))
    file_size_bytes: Mapped[Optional[int]] = mapped_column(Integer)
    url: Mapped[str] = mapped_column(Text, nullable=False)
    version: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    uploaded_by: Mapped[Optional[str]] = mapped_column(String(160))
    uploaded_by_email: Mapped[Optional[str]] = mapped_column(String(160))
    extra_metadata: Mapped[dict] = mapped_column(MutableDict.as_mutable(JSON), default=dict, nullable=False)
    uploaded_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    hypothesis: Mapped[HypothesisRecord] = relationship(
        HypothesisRecord, back_populates="attachment_records"
    )


class HypothesisApproval(Base):
    __tablename__ = "hypothesis_approvals"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    hypothesis_id: Mapped[int] = mapped_column(
        ForeignKey("hypotheses.id", ondelete="CASCADE"), nullable=False, index=True
    )
    approver_name: Mapped[str] = mapped_column(String(160), nullable=False)
    approver_email: Mapped[Optional[str]] = mapped_column(String(160))
    approver_role: Mapped[Optional[str]] = mapped_column(String(64))
    status: Mapped[str] = mapped_column(String(16), nullable=False, default="pending")
    required: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    decided_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    notes: Mapped[Optional[str]] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    hypothesis: Mapped[HypothesisRecord] = relationship(
        HypothesisRecord, back_populates="approval_records"
    )


class HypothesisActivityEvent(Base):
    __tablename__ = "hypothesis_activity_events"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    hypothesis_id: Mapped[int] = mapped_column(
        ForeignKey("hypotheses.id", ondelete="CASCADE"), nullable=False, index=True
    )
    event_type: Mapped[str] = mapped_column(String(32), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    actor_name: Mapped[str] = mapped_column(String(160), nullable=False)
    actor_email: Mapped[Optional[str]] = mapped_column(String(160))
    detail: Mapped[Optional[str]] = mapped_column(Text)
    stage: Mapped[Optional[str]] = mapped_column(String(32))
    impact: Mapped[Optional[str]] = mapped_column(String(16))
    extra_metadata: Mapped[dict] = mapped_column(MutableDict.as_mutable(JSON), default=dict, nullable=False)
    occurred_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    hypothesis: Mapped[HypothesisRecord] = relationship(
        HypothesisRecord, back_populates="activity_events"
    )
