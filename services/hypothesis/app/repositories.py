from __future__ import annotations

import re
from datetime import datetime, timezone
from typing import Iterable, List, Optional

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from . import schemas
from .models import (
    HypothesisActivityEvent,
    HypothesisAttachment,
    HypothesisChecklistItem,
    HypothesisComment,
    HypothesisRecord,
    HypothesisStageHistoryEntry,
    HypothesisTask,
)

HYP_ID_PATTERN = re.compile(r"^HYP-(\d+)$")


class HypothesisRepository:
    """Persistence layer for reading and writing hypothesis records."""

    def __init__(self, session: Session):
        self.session = session

    @staticmethod
    def _ensure_aware(dt_or_str: datetime | str | None) -> datetime | None:
        """Normalize timestamps to UTC-aware datetimes."""
        if dt_or_str is None:
            return None

        if isinstance(dt_or_str, datetime):
            candidate = dt_or_str
        elif isinstance(dt_or_str, str):
            canonical = dt_or_str.replace("Z", "+00:00")
            try:
                candidate = datetime.fromisoformat(canonical)
            except ValueError:
                return None
        else:
            return None

        if candidate.tzinfo is None:
            return candidate.replace(tzinfo=timezone.utc)
        return candidate.astimezone(timezone.utc)

    def list(self) -> List[HypothesisRecord]:
        """Return active (non-archived) hypotheses ordered by creation date."""
        stmt = (
            select(HypothesisRecord)
            .where(HypothesisRecord.archived_at.is_(None))
            .options(
                selectinload(HypothesisRecord.stage_history_entries),
                selectinload(HypothesisRecord.checklist_items),
                selectinload(HypothesisRecord.task_records),
                selectinload(HypothesisRecord.attachment_records),
                selectinload(HypothesisRecord.approval_records),
                selectinload(HypothesisRecord.activity_events),
            )
            .order_by(HypothesisRecord.created_at.desc())
        )
        return list(self.session.scalars(stmt))

    def list_all(self) -> List[HypothesisRecord]:
        """Return all hypotheses including archived ones."""
        stmt = (
            select(HypothesisRecord)
            .options(
                selectinload(HypothesisRecord.stage_history_entries),
                selectinload(HypothesisRecord.checklist_items),
                selectinload(HypothesisRecord.task_records),
                selectinload(HypothesisRecord.attachment_records),
                selectinload(HypothesisRecord.approval_records),
                selectinload(HypothesisRecord.activity_events),
            )
            .order_by(HypothesisRecord.created_at.desc())
        )
        return list(self.session.scalars(stmt))

    def get_by_hyp_id(self, hyp_id: str) -> Optional[HypothesisRecord]:
        stmt = (
            select(HypothesisRecord)
            .where(HypothesisRecord.hyp_id == hyp_id)
            .options(
                selectinload(HypothesisRecord.stage_history_entries),
                selectinload(HypothesisRecord.checklist_items),
                selectinload(HypothesisRecord.task_records),
                selectinload(HypothesisRecord.attachment_records),
                selectinload(HypothesisRecord.approval_records),
                selectinload(HypothesisRecord.activity_events),
                selectinload(HypothesisRecord.comment_threads).selectinload(
                    HypothesisComment.replies
                ),
            )
        )
        return self.session.scalar(stmt)

    def save(self, record: HypothesisRecord) -> HypothesisRecord:
        self.session.add(record)
        self.session.commit()
        self.session.refresh(record)
        return record

    def remove(self, record: HypothesisRecord) -> None:
        self.session.delete(record)
        self.session.commit()

    def add_stage_transition(
        self,
        record: HypothesisRecord,
        *,
        from_stage: str | None,
        to_stage: str,
        changed_at: datetime,
        changed_by: str,
        notes: str | None = None,
    ) -> HypothesisStageHistoryEntry:
        aware_changed_at = self._ensure_aware(changed_at) or datetime.now(timezone.utc)
        entry = HypothesisStageHistoryEntry(
            hypothesis=record,
            from_stage=from_stage,
            to_stage=to_stage,
            changed_at=aware_changed_at,
            changed_by=changed_by,
            notes=notes,
        )
        record.stage_history_entries.append(entry)
        return entry

    def log_activity_event(
        self,
        record: HypothesisRecord,
        *,
        event_type: str,
        title: str,
        actor_name: str,
        occurred_at: datetime,
        detail: str | None = None,
        stage: str | None = None,
        impact: str | None = None,
        actor_email: str | None = None,
        extra_metadata: dict | None = None,
    ) -> HypothesisActivityEvent:
        aware_occurred_at = self._ensure_aware(occurred_at) or datetime.now(timezone.utc)
        event = HypothesisActivityEvent(
            hypothesis=record,
            event_type=event_type,
            title=title,
            actor_name=actor_name,
            actor_email=actor_email,
            detail=detail,
            stage=stage,
            impact=impact,
            extra_metadata=extra_metadata or {},
            occurred_at=aware_occurred_at,
        )
        record.activity_events.append(event)
        return event

    def _comment_to_dict(self, comment: HypothesisComment) -> dict:
        return {
            "id": comment.id,
            "author": comment.author_name,
            "author_email": comment.author_email,
            "body": comment.body,
            "is_resolved": comment.is_resolved,
            "created_at": self._ensure_aware(comment.created_at),
            "updated_at": self._ensure_aware(comment.updated_at),
            "replies": [self._comment_to_dict(reply) for reply in comment.replies],
        }

    def record_to_detail(self, record: HypothesisRecord) -> schemas.HypothesisDetail:
        payload = record.as_dict()

        existing_history: List[dict] = [
            {
                "stage": item.get("stage"),
                "changed_at": self._ensure_aware(item.get("changed_at")),
                "changed_by": item.get("changed_by"),
                "notes": item.get("notes"),
            }
            for item in payload.get("stage_history", [])
        ]

        combined_history: List[dict] = []
        seen: set[tuple[str | None, datetime | None]] = set()
        for entry in existing_history:
            key = (entry["stage"], entry["changed_at"])
            seen.add(key)
            combined_history.append(entry)

        for entry in record.stage_history_entries:
            normalized_changed_at = self._ensure_aware(entry.changed_at)
            key = (entry.to_stage, normalized_changed_at)
            if key in seen:
                continue
            combined_history.append(
                {
                    "stage": entry.to_stage,
                    "changed_at": normalized_changed_at,
                    "changed_by": entry.changed_by,
                    "notes": entry.notes,
                }
            )

        if combined_history:
            combined_history.sort(
                key=lambda item: item["changed_at"]
                or datetime.min.replace(tzinfo=timezone.utc)
            )
            payload["stage_history"] = combined_history

        checklist = []
        for item in record.checklist_items:
            checklist.append(
                {
                    "id": item.id,
                    "label": item.label,
                    "status": item.status,
                    "owner": item.owner_name or item.owner_email or "",
                    "owner_email": item.owner_email,
                    "due_at": item.due_at,
                }
            )
        if checklist:
            payload["gating_checklist"] = checklist

        attachments = [
            {
                "id": attachment.id,
                "name": attachment.file_name,
                "url": attachment.url,
                "version": attachment.version,
                "uploaded_at": attachment.uploaded_at,
                "uploaded_by": attachment.uploaded_by,
                "uploaded_by_email": attachment.uploaded_by_email,
            }
            for attachment in record.attachment_records
        ]
        if attachments:
            payload["attachments"] = attachments

        approvals = [
            {
                "id": approval.id,
                "approver_name": approval.approver_name,
                "approver_email": approval.approver_email,
                "approver_role": approval.approver_role,
                "status": approval.status,
                "required": approval.required,
                "decided_at": self._ensure_aware(approval.decided_at),
                "notes": approval.notes,
            }
            for approval in record.approval_records
        ]
        if approvals:
            payload["approvals"] = approvals

        comments = [
            self._comment_to_dict(comment)
            for comment in record.comment_threads
            if comment.parent_id is None
        ]
        if comments:
            payload["comments"] = comments

        tasks = []
        for task in record.task_records:
            due_dt = self._ensure_aware(task.due) or record.updated_at or record.created_at
            tasks.append(
                {
                    "id": task.id,
                    "label": task.label,
                    "owner": task.owner_name or task.owner_email or "Unassigned",
                    "due": due_dt,
                    "type": task.task_type if task.task_type in {"data", "governance", "approval"} else "governance",
                    "status": task.status if task.status in {"at-risk", "due-soon", "blocked"} else "due-soon",
                    "severity": task.severity if task.severity in {"critical", "high", "medium"} else "medium",
                    "related_stage": task.related_stage or record.stage,
                }
            )
        if tasks:
            payload["tasks"] = tasks

        sorted_events = sorted(
            record.activity_events,
            key=lambda e: self._ensure_aware(e.occurred_at)
            or datetime.min.replace(tzinfo=timezone.utc),
            reverse=True,
        )

        activity_digest = [
            {
                "id": event.id,
                "type": event.event_type,
                "title": event.title,
                "actor": event.actor_name,
                "detail": event.detail,
                "occurred_at": self._ensure_aware(event.occurred_at),
                "stage": event.stage or record.stage,
                "impact": event.impact or "neutral",
            }
            for event in sorted_events
        ]
        if activity_digest:
            payload["activity_digest"] = activity_digest

        return schemas.HypothesisDetail.model_validate(payload)

    def record_to_summary(self, record: HypothesisRecord) -> schemas.HypothesisSummaryItem:
        tags = record.tags or []
        owner_name = record.owners[0]["name"] if record.owners else "Unassigned"
        latest_transition = max(
            [entry.changed_at for entry in record.stage_history_entries],
            default=None,
        )
        last_updated = latest_transition or record.updated_at or record.created_at
        summary_payload = {
            "id": record.hyp_id,
            "title": record.title,
            "owner": owner_name,
            "stage": record.stage,
            "impact": record.impact_score,
            "feasibility": record.feasibility_score,
            "confidence": record.confidence_score,
            "next_gate": None,
            "last_updated": last_updated,
            "tags": tags,
            "priority": record.priority,
        }
        return schemas.HypothesisSummaryItem.model_validate(summary_payload)

    def record_to_light(self, record: HypothesisRecord) -> schemas.Hypothesis:
        owner_name = record.owners[0]["name"] if record.owners else "Unassigned"
        payload = {
            "hyp_id": record.hyp_id,
            "title": record.title,
            "stage": record.stage,
            "owner": owner_name,
        }
        return schemas.Hypothesis.model_validate(payload)

    def upsert_many(self, records: Iterable[HypothesisRecord]) -> None:
        for record in records:
            self.session.merge(record)
        self.session.commit()

    def next_hyp_id(self) -> str:
        """Generate the next sequential hypothesis identifier."""
        stmt = select(HypothesisRecord.hyp_id)
        max_number = 0
        for hyp_id in self.session.scalars(stmt):
            match = HYP_ID_PATTERN.match(hyp_id)
            if match:
                max_number = max(max_number, int(match.group(1)))
        return f"HYP-{max_number + 1:03d}"
