from __future__ import annotations

from datetime import datetime, timezone
from typing import Dict, List, Optional, Sequence, cast

from fastapi import HTTPException, status

from . import schemas
from .models import (
    HypothesisAttachment,
    HypothesisChecklistItem,
    HypothesisComment,
    HypothesisRecord,
)
from .repositories import HypothesisRepository

STAGE_ORDER: Sequence[schemas.StageLiteral] = (
    "IDEATION",
    "SCOPING",
    "PRIORITIZATION",
    "EXPERIMENTATION",
    "EVALUATION",
    "SCALING",
    "PRODUCTION",
)

STAGE_BASELINE: Dict[schemas.StageLiteral, Dict[str, object]] = {
    "IDEATION": {
        "title": "Ideation",
        "description": "Capture opportunities with business context and desired outcomes.",
        "sla_hours": 72,
        "stage_owner": "Business Analyst Guild",
        "conversion_rate": 0.62,
        "average_days_in_stage": 4,
    },
    "SCOPING": {
        "title": "Scoping",
        "description": "Validate data availability and outline the experiment plan.",
        "sla_hours": 96,
        "stage_owner": "Product Strategy",
        "conversion_rate": 0.48,
        "average_days_in_stage": 6,
    },
    "PRIORITIZATION": {
        "title": "Prioritization",
        "description": "Score for ROI, capacity, and strategic fit.",
        "sla_hours": 48,
        "stage_owner": "Portfolio Council",
        "conversion_rate": 0.54,
        "average_days_in_stage": 3,
    },
    "EXPERIMENTATION": {
        "title": "Experimentation",
        "description": "Prototype, evaluate, and execute experiment backlog.",
        "sla_hours": 168,
        "stage_owner": "Lab Squad Alpha",
        "conversion_rate": 0.41,
        "average_days_in_stage": 10,
    },
    "EVALUATION": {
        "title": "Evaluation",
        "description": "Assess impact, adoption, and risk before scaling.",
        "sla_hours": 72,
        "stage_owner": "Governance Office",
        "conversion_rate": 0.33,
        "average_days_in_stage": 5,
    },
    "SCALING": {
        "title": "Scaling",
        "description": "Handover to product ops and track ROI commitments.",
        "sla_hours": 120,
        "stage_owner": "Scale Factory",
        "conversion_rate": 0.22,
        "average_days_in_stage": 14,
    },
    "PRODUCTION": {
        "title": "Production",
        "description": "Operationalised hypothesis with ROI tracking and observability.",
        "sla_hours": 240,
        "stage_owner": "Operations",
        "conversion_rate": 0.18,
        "average_days_in_stage": 21,
    },
}

NEXT_STAGE_GATE = {
    "IDEATION": "SCOPING_KICKOFF",
    "SCOPING": "PRIORITIZATION_REVIEW",
    "PRIORITIZATION": "EXPERIMENT_KICKOFF",
    "EXPERIMENTATION": "EVALUATION_GATE",
    "EVALUATION": "SCALING_KICKOFF",
    "SCALING": "PRODUCTION_ROLLOUT",
    "PRODUCTION": None,
}


class HypothesisService:
    """Business logic and aggregations for the hypothesis domain."""

    def __init__(self, repository: HypothesisRepository):
        self.repository = repository

    def list_hypotheses(self) -> List[schemas.Hypothesis]:
        records = self.repository.list()
        return [self.repository.record_to_light(record) for record in records]

    def get(self, hyp_id: str) -> schemas.HypothesisDetail:
        record = self._get_active_record(hyp_id)
        return self.repository.record_to_detail(record)

    def create(self, payload: schemas.HypothesisCreatePayload) -> schemas.HypothesisDetail:
        if not payload.owners:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="At least one owner is required.")

        now = datetime.now(timezone.utc)
        stage = payload.initial_stage or "IDEATION"
        hyp_id = self.repository.next_hyp_id()
        owner_name = payload.owners[0].name

        record = self._build_record_from_create_payload(hyp_id, stage, owner_name, now, payload)
        for checklist_item in payload.gating_checklist:
            due_at = checklist_item.due_at
            if due_at and due_at.tzinfo is None:
                due_at = due_at.replace(tzinfo=timezone.utc)
            record.checklist_items.append(
                HypothesisChecklistItem(
                    hypothesis=record,
                    label=checklist_item.label,
                    owner_name=checklist_item.owner,
                    status=checklist_item.status,
                    due_at=due_at,
                )
            )

        self.repository.add_stage_transition(
            record,
            from_stage=None,
            to_stage=stage,
            changed_at=now,
            changed_by=owner_name,
            notes="Initial submission",
        )
        self.repository.log_activity_event(
            record,
            event_type="CREATED",
            title="Hypothesis created",
            actor_name=owner_name,
            occurred_at=now,
            stage=stage,
            impact="positive",
        )
        self._refresh_denormalized_fields(record)
        self.repository.save(record)
        refreshed = self.repository.get_by_hyp_id(record.hyp_id)
        target = refreshed or record
        return self.repository.record_to_detail(target)

    def update(self, hyp_id: str, payload: schemas.HypothesisUpdatePayload) -> schemas.HypothesisDetail:
        record = self._get_active_record(hyp_id)
        update_data = payload.model_dump(exclude_none=True, by_alias=False)
        if not update_data:
            return self.repository.record_to_detail(record)

        now = datetime.now(timezone.utc)
        actor = update_data.pop("updated_by", "System")

        stage_changed = False
        new_stage = update_data.get("stage")
        current_stage = record.stage
        if new_stage and new_stage != current_stage:
            self._assert_stage_transition_allowed(record, current_stage, new_stage)
            stage_changed = True
            self.repository.add_stage_transition(
                record,
                from_stage=current_stage,
                to_stage=new_stage,
                changed_at=now,
                changed_by=actor,
                notes="Stage updated via API",
            )
            record.stage = new_stage

        self._apply_updates(record, update_data)

        record.updated_at = now
        self.repository.log_activity_event(
            record,
            event_type="STAGE_CHANGED" if stage_changed else "UPDATED",
            title=f"Hypothesis moved to {record.stage.title()}"
            if stage_changed
            else "Hypothesis updated",
            actor_name=actor,
            occurred_at=now,
            stage=record.stage,
            impact="positive" if stage_changed else "neutral",
        )
        self._refresh_denormalized_fields(record)

        self.repository.save(record)
        refreshed = self.repository.get_by_hyp_id(record.hyp_id)
        target = refreshed or record
        return self.repository.record_to_detail(target)

    def archive(self, hyp_id: str, actor: str = "System") -> None:
        record = self._get_active_record(hyp_id)
        now = datetime.now(timezone.utc)
        record.archived_at = now
        previous_stage = record.stage
        record.stage = "ARCHIVED"
        self.repository.add_stage_transition(
            record,
            from_stage=previous_stage,
            to_stage="ARCHIVED",
            changed_at=now,
            changed_by=actor,
            notes="Archived via API",
        )
        self.repository.log_activity_event(
            record,
            event_type="UPDATED",
            title="Hypothesis archived",
            actor_name=actor,
            occurred_at=now,
            stage="ARCHIVED",
            impact="neutral",
        )
        record.updated_at = now
        self._refresh_denormalized_fields(record)
        self.repository.save(record)

    def build_dashboard(self) -> schemas.HypothesisDashboard:
        records = self.repository.list()
        if not records:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No hypotheses available.")

        stage_sections: Dict[str, schemas.HypothesisStageSummary] = {}
        for stage in STAGE_ORDER:
            meta = STAGE_BASELINE.get(stage, {})
            stage_sections[stage] = schemas.HypothesisStageSummary(
                key=stage,
                title=str(meta.get("title", stage.title())),
                description=str(meta.get("description", "")),
                sla_hours=int(meta.get("sla_hours", 72)),
                stage_owner=str(meta.get("stage_owner", "Unassigned")),
                stage_health="on-track",
                conversion_rate=float(meta.get("conversion_rate", 0.0)),
                average_days_in_stage=int(meta.get("average_days_in_stage", 0)),
                items=[],
            )

        for record in records:
            target_stage = record.stage if record.stage in stage_sections else "IDEATION"
            summary = self.repository.record_to_summary(record)
            summary.next_gate = NEXT_STAGE_GATE.get(record.stage)
            summary.last_updated = record.updated_at or record.created_at
            stage_sections[target_stage].items.append(summary)

        focus_record = max(records, key=lambda r: r.updated_at or r.created_at)
        focus_detail = self.repository.record_to_detail(focus_record)

        highlights = self._build_highlights(records)
        tasks = self._build_tasks(records)
        activity = self._aggregate_activity(records)

        return schemas.HypothesisDashboard(
            stages=list(stage_sections.values()),
            highlights=highlights,
            focus_hypothesis=focus_detail,
            tasks=tasks,
            activity=activity,
        )

    def _get_active_record(self, hyp_id: str) -> HypothesisRecord:
        record = self.repository.get_by_hyp_id(hyp_id)
        if record is None or record.archived_at is not None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Hypothesis '{hyp_id}' not found.")
        return record

    def _build_record_from_create_payload(
        self,
        hyp_id: str,
        stage: schemas.StageLiteral,
        owner_name: str,
        now: datetime,
        payload: schemas.HypothesisCreatePayload,
    ) -> HypothesisRecord:
        governance_state = "NOT_REQUIRED"
        if stage in {"PRIORITIZATION", "EXPERIMENTATION", "EVALUATION"}:
            governance_state = "PENDING"

        record = HypothesisRecord(
            hyp_id=hyp_id,
            lab_id=payload.lab_id,
            version=1,
            title=payload.title,
            statement=payload.statement,
            description=payload.description,
            ai_type=payload.ai_type,
            ai_subtype=payload.ai_subtype,
            business_category=payload.business_category,
            priority=payload.priority,
            stage=stage,
            stage_health=payload.stage_health,
            stage_history=[],
            impact_score=payload.impact_score,
            feasibility_score=payload.feasibility_score,
            confidence_score=payload.confidence_score,
            complexity_score=payload.complexity_score,
            risk_class=payload.risk_class,
            data_requirements=payload.data_requirements.model_dump(mode="json"),
            roi_estimate=payload.roi_estimate.model_dump(mode="json") if payload.roi_estimate else None,
            time_estimate=payload.time_estimate.model_dump(mode="json") if payload.time_estimate else None,
            success_metrics=[metric.model_dump(mode="json") for metric in payload.success_metrics],
            gating_checklist=[],
            dependencies=payload.dependencies,
            linked_experiments=[exp.model_dump(mode="json") for exp in payload.linked_experiments],
            tags=payload.tags,
            links=[link.model_dump(mode="json") for link in payload.links],
            attachments=[],
            governance_state=governance_state,
            notes=payload.notes,
            owners=[owner.model_dump(mode="json") for owner in payload.owners],
            sponsors=[actor.model_dump(mode="json") for actor in payload.sponsors],
            observers=[actor.model_dump(mode="json") for actor in payload.observers],
            activity_digest=[],
        )
        record.created_at = now
        record.updated_at = now
        return record

    def _apply_updates(self, record: HypothesisRecord, update_data: Dict[str, object]) -> None:
        simple_fields = [
            "title",
            "statement",
            "description",
            "priority",
            "stage_health",
            "impact_score",
            "feasibility_score",
            "confidence_score",
            "complexity_score",
            "risk_class",
            "notes",
            "governance_state",
        ]
        for field in simple_fields:
            if field in update_data:
                setattr(record, field, update_data[field])

        if "owners" in update_data:
            record.owners = list(update_data["owners"])
        if "sponsors" in update_data:
            record.sponsors = list(update_data["sponsors"])
        if "observers" in update_data:
            record.observers = list(update_data["observers"])
        if "tags" in update_data:
            record.tags = list(update_data["tags"])
        if "dependencies" in update_data:
            record.dependencies = list(update_data["dependencies"])
        if "links" in update_data:
            record.links = list(update_data["links"])
        if "linked_experiments" in update_data:
            record.linked_experiments = list(update_data["linked_experiments"])
        if "success_metrics" in update_data:
            record.success_metrics = list(update_data["success_metrics"])
        if "gating_checklist" in update_data:
            incoming_items = list(update_data["gating_checklist"] or [])
            record.gating_checklist = []
            record.checklist_items.clear()
            for item in incoming_items:
                item_payload = item.model_dump(mode="python") if hasattr(item, "model_dump") else dict(item)
                due_at = item_payload.get("due_at")
                if isinstance(due_at, str) and due_at.endswith("Z"):
                    due_at = due_at.replace("Z", "+00:00")
                if isinstance(due_at, str):
                    due_at = datetime.fromisoformat(due_at)
                if due_at and due_at.tzinfo is None:
                    due_at = due_at.replace(tzinfo=timezone.utc)
                record.checklist_items.append(
                    HypothesisChecklistItem(
                        hypothesis=record,
                        label=item_payload.get("label", "Checklist item"),
                        owner_name=item_payload.get("owner"),
                        status=item_payload.get("status", "pending"),
                        due_at=due_at,
                    )
                )
        if "attachments" in update_data:
            record.attachments = list(update_data["attachments"])
        if "data_requirements" in update_data:
            record.data_requirements = dict(update_data["data_requirements"])
        if "roi_estimate" in update_data:
            record.roi_estimate = dict(update_data["roi_estimate"])
        if "time_estimate" in update_data:
            record.time_estimate = dict(update_data["time_estimate"])

    def _assert_stage_transition_allowed(
        self,
        record: HypothesisRecord,
        current_stage: schemas.StageLiteral,
        new_stage: schemas.StageLiteral,
    ) -> None:
        if new_stage == "ARCHIVED":
            return

        try:
            current_index = STAGE_ORDER.index(current_stage)
            target_index = STAGE_ORDER.index(new_stage)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unknown stage transition to '{new_stage}'",
            ) from None

        # Only enforce readiness when moving forward in the lifecycle
        if target_index <= current_index:
            return

        incomplete_items = [
            item.label
            for item in record.checklist_items
            if item.status not in {"complete", "done"}
        ]
        pending_approvals = [
            approval.approver_name
            for approval in record.approval_records
            if approval.required and approval.status != "approved"
        ]

        if incomplete_items:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Checklist items must be completed before moving to {new_stage}: {', '.join(incomplete_items)}",
            )

        if pending_approvals:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Required approvals pending: {', '.join(pending_approvals)}",
            )

    def _refresh_denormalized_fields(self, record: HypothesisRecord) -> None:
        record.gating_checklist = [
            {
                "id": item.id,
                "label": item.label,
                "status": item.status,
                "owner": item.owner_name or item.owner_email or "",
                "owner_email": item.owner_email,
                "due_at": item.due_at.isoformat() if item.due_at else None,
            }
            for item in record.checklist_items
        ]

        record.attachments = [
            {
                "id": attachment.id,
                "name": attachment.file_name,
                "url": attachment.url,
                "version": attachment.version,
                "uploaded_at": attachment.uploaded_at.isoformat() if attachment.uploaded_at else None,
                "uploaded_by": attachment.uploaded_by,
                "uploaded_by_email": attachment.uploaded_by_email,
            }
            for attachment in record.attachment_records
        ]

        sorted_events = sorted(
            record.activity_events,
            key=lambda event: self.repository._ensure_aware(event.occurred_at)
            or datetime.min.replace(tzinfo=timezone.utc),
            reverse=True,
        )
        record.activity_digest = [
            {
                "id": event.id,
                "type": event.event_type,
                "title": event.title,
                "actor": event.actor_name,
                "detail": event.detail,
                "occurred_at": (
                    self.repository._ensure_aware(event.occurred_at).isoformat()
                    if event.occurred_at
                    else None
                ),
                "stage": event.stage or record.stage,
                "impact": event.impact or "neutral",
            }
            for event in sorted_events
        ]

    def _build_highlights(self, records: List[HypothesisRecord]) -> schemas.HypothesisHighlights:
        total_value = 0.0
        experiments = 0
        governance_pending = 0
        total_weeks = 0
        weeks_count = 0

        for record in records:
            roi = record.roi_estimate or {}
            total_value += float(roi.get("one_time_cost") or 0)
            experiments += len(record.linked_experiments or [])
            if record.governance_state == "PENDING":
                governance_pending += 1
            time_estimate = record.time_estimate or {}
            production_weeks = time_estimate.get("production_weeks")
            if production_weeks is not None:
                total_weeks += int(production_weeks)
                weeks_count += 1

        portfolio_value = (
            f"${total_value / 1_000_000:.1f}M potential" if total_value else f"{len(records)} active hypotheses"
        )
        avg_time_to_value = f"{total_weeks // weeks_count} weeks" if weeks_count else "n/a"

        return schemas.HypothesisHighlights(
            portfolio_value=portfolio_value,
            experiments_in_flight=experiments,
            avg_time_to_value=avg_time_to_value,
            governance_pending=governance_pending,
        )

    def _build_tasks(self, records: List[HypothesisRecord]) -> List[schemas.HypothesisTask]:
        tasks: List[schemas.HypothesisTask] = []
        now = datetime.now(timezone.utc)

        for record in records:
            for item in record.checklist_items:
                status = item.status or "pending"
                if status == "complete":
                    continue
                due_dt = item.due_at or (record.updated_at or now)
                if due_dt.tzinfo is None:
                    due_dt = due_dt.replace(tzinfo=timezone.utc)
                label = item.label or "Checklist item"
                owner = item.owner_name or item.owner_email or (record.owners[0]["name"] if record.owners else "Unassigned")
                lower_label = label.lower()
                if due_dt < now:
                    task_status = "at-risk"
                elif (due_dt - now).days <= 2:
                    task_status = "due-soon"
                else:
                    task_status = "blocked" if "approval" in lower_label else "due-soon"

                if "data" in lower_label:
                    task_type = "data"
                elif "approval" in lower_label or "approve" in lower_label:
                    task_type = "approval"
                else:
                    task_type = "governance"

                if task_status == "at-risk":
                    severity = "critical"
                elif task_status == "blocked":
                    severity = "high"
                else:
                    severity = "medium"

                tasks.append(
                    schemas.HypothesisTask(
                        id=f"{record.hyp_id}-{item.id}",
                        label=label,
                        owner=owner,
                        due=due_dt,
                        type=cast(schemas.TaskTypeLiteral, task_type),
                        status=task_status,
                        severity=severity,
                        related_stage=record.stage,
                    )
                )

            for task in record.task_records:
                due_dt = task.due or (record.updated_at or now)
                if due_dt.tzinfo is None:
                    due_dt = due_dt.replace(tzinfo=timezone.utc)
                task_type = task.task_type if task.task_type in {"data", "governance", "approval"} else "governance"
                task_status = (
                    task.status if task.status in {"at-risk", "due-soon", "blocked"} else "due-soon"
                )
                task_severity = (
                    task.severity if task.severity in {"critical", "high", "medium"} else "medium"
                )
                tasks.append(
                    schemas.HypothesisTask(
                        id=task.id,
                        label=task.label,
                        owner=task.owner_name or task.owner_email or "Unassigned",
                        due=due_dt,
                        type=cast(schemas.TaskTypeLiteral, task_type),
                        status=cast(schemas.TaskStatusLiteral, task_status),
                        severity=cast(schemas.TaskSeverityLiteral, task_severity),
                        related_stage=task.related_stage or record.stage,
                    )
                )

        tasks.sort(key=lambda task: task.due)
        return tasks[:20]

    def _aggregate_activity(self, records: List[HypothesisRecord]) -> List[schemas.HypothesisActivity]:
        events: List[schemas.HypothesisActivity] = []
        for record in records:
            for event in record.activity_events:
                occurred_at = event.occurred_at
                if occurred_at.tzinfo is None:
                    occurred_at = occurred_at.replace(tzinfo=timezone.utc)
                event_type = (
                    event.event_type
                    if event.event_type
                    in {
                        "CREATED",
                        "UPDATED",
                        "STAGE_CHANGED",
                        "COMMENTED",
                        "APPROVED",
                        "REJECTED",
                        "ATTACHMENT_ADDED",
                    }
                    else "UPDATED"
                )
                impact = (
                    event.impact if event.impact in {"positive", "neutral", "negative"} else "neutral"
                )
                events.append(
                    schemas.HypothesisActivity(
                        id=event.id,
                        type=cast(schemas.ActivityTypeLiteral, event_type),
                        title=event.title,
                        actor=event.actor_name,
                        detail=event.detail,
                        occurred_at=occurred_at,
                        stage=event.stage or record.stage,
                        impact=cast(schemas.ImpactSentimentLiteral, impact),
                    )
                )

        events.sort(key=lambda activity: activity.occurred_at, reverse=True)
        return events[:25]

    def add_comment(self, hyp_id: str, payload: schemas.CommentCreatePayload) -> schemas.HypothesisComment:
        record = self._get_active_record(hyp_id)
        parent: HypothesisComment | None = None
        if payload.parent_id:
            parent = self._find_comment(record, payload.parent_id)
            if parent is None:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Parent comment not found.")

        comment = HypothesisComment(
            hypothesis=record,
            parent=parent,
            author_name=payload.author.name,
            author_email=payload.author.email,
            body=payload.body,
        )
        if parent is None:
            record.comment_threads.append(comment)
        else:
            parent.replies.append(comment)

        now = datetime.now(timezone.utc)
        self.repository.log_activity_event(
            record,
            event_type="COMMENTED",
            title="New comment added",
            actor_name=payload.author.name,
            actor_email=payload.author.email,
            detail=payload.body[:160],
            stage=record.stage,
            occurred_at=now,
        )
        record.updated_at = now
        self._refresh_denormalized_fields(record)
        self.repository.save(record)
        refreshed = self.repository.get_by_hyp_id(record.hyp_id)
        target_record = refreshed or record
        created = self._find_comment(target_record, comment.id)
        return schemas.HypothesisComment.model_validate(self.repository._comment_to_dict(created))

    def update_comment(
        self,
        hyp_id: str,
        comment_id: str,
        payload: schemas.CommentUpdatePayload,
    ) -> schemas.HypothesisComment:
        record = self._get_active_record(hyp_id)
        comment = self._find_comment(record, comment_id)
        if comment is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Comment not found.")

        if payload.body is not None:
            comment.body = payload.body
        if payload.is_resolved is not None:
            comment.is_resolved = payload.is_resolved

        now = datetime.now(timezone.utc)
        record.updated_at = now
        self.repository.log_activity_event(
            record,
            event_type="UPDATED",
            title="Comment updated",
            actor_name=comment.author_name,
            occurred_at=now,
            stage=record.stage,
            detail=comment.body[:160],
        )
        self._refresh_denormalized_fields(record)
        self.repository.save(record)
        refreshed = self.repository.get_by_hyp_id(record.hyp_id)
        target_record = refreshed or record
        updated = self._find_comment(target_record, comment_id)
        return schemas.HypothesisComment.model_validate(self.repository._comment_to_dict(updated))

    def delete_comment(self, hyp_id: str, comment_id: str) -> None:
        record = self._get_active_record(hyp_id)
        comment = self._find_comment(record, comment_id)
        if comment is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Comment not found.")
        self.repository.session.delete(comment)
        now = datetime.now(timezone.utc)
        record.updated_at = now
        self.repository.log_activity_event(
            record,
            event_type="UPDATED",
            title="Comment removed",
            actor_name="System",
            occurred_at=now,
            stage=record.stage,
        )
        self._refresh_denormalized_fields(record)
        self.repository.save(record)

    def add_attachment(self, hyp_id: str, payload: schemas.AttachmentCreatePayload) -> schemas.HypothesisAttachment:
        record = self._get_active_record(hyp_id)
        attachment = HypothesisAttachment(
            hypothesis=record,
            file_name=payload.name,
            url=payload.url,
            version=payload.version or 1,
            uploaded_by=payload.uploaded_by,
            uploaded_by_email=payload.uploaded_by_email,
        )
        record.attachment_records.append(attachment)
        now = datetime.now(timezone.utc)
        record.updated_at = now
        self.repository.log_activity_event(
            record,
            event_type="ATTACHMENT_ADDED",
            title=f"Attachment added: {payload.name}",
            actor_name=payload.uploaded_by or "System",
            actor_email=payload.uploaded_by_email,
            occurred_at=now,
            stage=record.stage,
        )
        self._refresh_denormalized_fields(record)
        self.repository.save(record)
        refreshed = self.repository.get_by_hyp_id(record.hyp_id)
        target_record = refreshed or record
        created = next(
            (item for item in target_record.attachment_records if item.id == attachment.id),
            attachment,
        )
        return schemas.HypothesisAttachment.model_validate(
            {
                "id": created.id,
                "name": created.file_name,
                "url": created.url,
                "version": created.version,
                "uploaded_at": created.uploaded_at,
                "uploaded_by": created.uploaded_by,
                "uploaded_by_email": created.uploaded_by_email,
            }
        )

    def update_checklist_item(
        self,
        hyp_id: str,
        item_id: str,
        payload: schemas.ChecklistItemUpdatePayload,
    ) -> schemas.HypothesisDetail:
        record = self._get_active_record(hyp_id)
        item = next((entry for entry in record.checklist_items if entry.id == item_id), None)
        if item is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Checklist item not found.")

        if payload.label is not None:
            item.label = payload.label
        if payload.status is not None:
            item.status = payload.status
        if payload.owner is not None:
            item.owner_name = payload.owner
        if payload.owner_email is not None:
            item.owner_email = payload.owner_email
        if payload.due_at is not None:
            due_at = payload.due_at
            if due_at.tzinfo is None:
                due_at = due_at.replace(tzinfo=timezone.utc)
            item.due_at = due_at

        now = datetime.now(timezone.utc)
        record.updated_at = now
        self._refresh_denormalized_fields(record)
        self.repository.save(record)
        refreshed = self.repository.get_by_hyp_id(record.hyp_id)
        return self.repository.record_to_detail(refreshed or record)

    def add_checklist_item(
        self,
        hyp_id: str,
        payload: schemas.ChecklistItemCreatePayload,
    ) -> schemas.HypothesisDetail:
        record = self._get_active_record(hyp_id)
        due_at = payload.due_at
        if due_at and due_at.tzinfo is None:
            due_at = due_at.replace(tzinfo=timezone.utc)
        record.checklist_items.append(
            HypothesisChecklistItem(
                hypothesis=record,
                label=payload.label,
                owner_name=payload.owner,
                owner_email=payload.owner_email,
                due_at=due_at,
            )
        )
        record.updated_at = datetime.now(timezone.utc)
        self._refresh_denormalized_fields(record)
        self.repository.save(record)
        refreshed = self.repository.get_by_hyp_id(record.hyp_id)
        return self.repository.record_to_detail(refreshed or record)

    def remove_checklist_item(self, hyp_id: str, item_id: str) -> schemas.HypothesisDetail:
        record = self._get_active_record(hyp_id)
        item = next((entry for entry in record.checklist_items if entry.id == item_id), None)
        if item is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Checklist item not found.")
        self.repository.session.delete(item)
        record.updated_at = datetime.now(timezone.utc)
        self._refresh_denormalized_fields(record)
        self.repository.save(record)
        refreshed = self.repository.get_by_hyp_id(record.hyp_id)
        return self.repository.record_to_detail(refreshed or record)

    def update_task(
        self,
        hyp_id: str,
        task_id: str,
        payload: schemas.TaskUpdatePayload,
    ) -> schemas.HypothesisDetail:
        record = self._get_active_record(hyp_id)
        task = next((entry for entry in record.task_records if entry.id == task_id), None)
        if task is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found.")

        if payload.status is not None:
            task.status = payload.status
        if payload.severity is not None:
            task.severity = payload.severity
        if payload.due is not None:
            due_at = payload.due
            if due_at.tzinfo is None:
                due_at = due_at.replace(tzinfo=timezone.utc)
            task.due = due_at
        if payload.owner is not None:
            task.owner_name = payload.owner

        record.updated_at = datetime.now(timezone.utc)
        self._refresh_denormalized_fields(record)
        self.repository.save(record)
        refreshed = self.repository.get_by_hyp_id(record.hyp_id)
        return self.repository.record_to_detail(refreshed or record)

    def update_approval(
        self,
        hyp_id: str,
        approval_id: str,
        payload: schemas.ApprovalUpdatePayload,
    ) -> schemas.HypothesisDetail:
        record = self._get_active_record(hyp_id)
        approval = next((entry for entry in record.approval_records if entry.id == approval_id), None)
        if approval is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Approval not found.")

        if payload.status is not None:
            approval.status = payload.status
            approval.decided_at = datetime.now(timezone.utc) if payload.status != "pending" else None
        if payload.notes is not None:
            approval.notes = payload.notes

        record.updated_at = datetime.now(timezone.utc)
        self._refresh_denormalized_fields(record)
        self.repository.save(record)
        refreshed = self.repository.get_by_hyp_id(record.hyp_id)
        return self.repository.record_to_detail(refreshed or record)

    def _find_comment(self, record: HypothesisRecord, comment_id: str) -> HypothesisComment | None:
        stack: List[HypothesisComment] = list(record.comment_threads)
        while stack:
            current = stack.pop()
            if current.id == comment_id:
                return current
            stack.extend(current.replies or [])
        return None
