from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import List

from sqlalchemy.orm import Session

from .models import (
    HypothesisActivityEvent,
    HypothesisApproval,
    HypothesisAttachment,
    HypothesisChecklistItem,
    HypothesisComment,
    HypothesisRecord,
    HypothesisStageHistoryEntry,
    HypothesisTask,
)
from .repositories import HypothesisRepository


def seed_demo_data(session: Session) -> None:
    """Populate the database with curated demo data for local development."""
    repository = HypothesisRepository(session)
    if repository.list():
        return

    records = _build_seed_records()
    session.add_all(records)
    session.commit()




def _build_seed_records() -> List[HypothesisRecord]:
    now = datetime.now(timezone.utc)

    def iso(dt: datetime | None) -> str | None:
        return dt.isoformat() if dt else None

    hyp_001 = HypothesisRecord(
        hyp_id="HYP-001",
        lab_id="LAB-ALPHA",
        title="Predict equipment downtime",
        statement="We believe predictive maintenance on plant assets will reduce unplanned downtime by 18%.",
        description="Combine SCADA telemetry with maintenance logs to forecast failures and schedule proactive intervention.",
        ai_type="CLASSICAL_ML",
        ai_subtype="Time Series Forecasting",
        business_category="Operations",
        priority="HIGH",
        stage="PRIORITIZATION",
        stage_health="on-track",
        stage_history=[],
        impact_score=9.1,
        feasibility_score=7.3,
        confidence_score=0.81,
        complexity_score=6.1,
        risk_class="MEDIUM",
        data_requirements={
            "sources": ["SCADA telemetry", "Maintenance logs", "ERP downtime tickets"],
            "volume": "12M rows/month",
            "quality": "MEDIUM",
            "refresh_cadence": "hourly",
            "governance_notes": "Industrial data zone with restricted access.",
        },
        roi_estimate={
            "currency": "USD",
            "one_time_cost": 450000,
            "ongoing_cost_per_period": 32000,
            "expected_roi": 2.8,
            "payback_period_weeks": 24,
            "value_driver": "Reduced downtime hours and spare parts usage.",
        },
        time_estimate={
            "discovery_weeks": 6,
            "experiment_weeks": 12,
            "production_weeks": 8,
        },
        success_metrics=[
            {"label": "Downtime reduction", "target": 18, "unit": "%", "direction": "DECREASE"},
            {"label": "Maintenance cost avoidance", "target": 1.2, "unit": "MUSD", "direction": "INCREASE"},
        ],
        gating_checklist=[],
        dependencies=["LAB-COMPUTE-CLUSTER"],
        linked_experiments=[
            {
                "id": "EXP-104",
                "title": "Feature engineering pipeline",
                "status": "IN_PROGRESS",
                "owner": "Mila Novak",
                "last_updated": iso(now - timedelta(hours=6)),
            }
        ],
        tags=["Operations", "Prediction", "IoT"],
        links=[
            {
                "label": "Opportunity brief",
                "url": "https://docs.example.com/hyp-001-brief",
                "type": "DOC",
            }
        ],
        attachments=[],
        governance_state="PENDING",
        notes="Awaiting maintenance leadership sign-off for experiment run windows.",
        owners=[
            {
                "name": "Cassie Liu",
                "email": "cassie.liu@example.com",
                "role": "OWNER",
                "department": "Operations",
            }
        ],
        sponsors=[
            {
                "name": "Marta Ivanova",
                "email": "marta.ivanova@example.com",
                "role": "SPONSOR",
                "department": "COO Office",
            }
        ],
        observers=[
            {
                "name": "Eli Thompson",
                "email": "eli.thompson@example.com",
                "role": "OBSERVER",
                "department": "Finance",
            }
        ],
        activity_digest=[],
    )

    stage_history_entries_001 = [
        HypothesisStageHistoryEntry(
            hypothesis=hyp_001,
            from_stage=None,
            to_stage="IDEATION",
            changed_at=now - timedelta(days=21),
            changed_by="Cassie Liu",
            notes="Initial hypothesis submitted with exec sponsor.",
        ),
        HypothesisStageHistoryEntry(
            hypothesis=hyp_001,
            from_stage="IDEATION",
            to_stage="SCOPING",
            changed_at=now - timedelta(days=14),
            changed_by="Arjun Patel",
            notes="Data discovery completed.",
        ),
        HypothesisStageHistoryEntry(
            hypothesis=hyp_001,
            from_stage="SCOPING",
            to_stage="PRIORITIZATION",
            changed_at=now - timedelta(days=3),
            changed_by="Portfolio Council",
            notes="Approved for experiment funding.",
        ),
    ]
    hyp_001.stage_history_entries.extend(stage_history_entries_001)

    checklist_items_001 = [
        HypothesisChecklistItem(
            id="chk-001",
            hypothesis=hyp_001,
            label="Data quality review complete",
            owner_name="Data Engineering",
            status="complete",
            due_at=now - timedelta(days=5),
        ),
        HypothesisChecklistItem(
            id="chk-002",
            hypothesis=hyp_001,
            label="Safety governance approval",
            owner_name="Safety Office",
            status="pending",
            due_at=now + timedelta(days=4),
        ),
    ]
    hyp_001.checklist_items.extend(checklist_items_001)

    hyp_001.task_records.extend(
        [
            HypothesisTask(
                id="task-189",
                hypothesis=hyp_001,
                label="Upload asset failure dataset sample",
                owner_name="Ops Data Guild",
                due=now + timedelta(hours=8),
                task_type="data",
                status="at-risk",
                severity="critical",
                related_stage="SCOPING",
            ),
            HypothesisTask(
                id="task-207",
                hypothesis=hyp_001,
                label="Confirm ROI assumptions with finance",
                owner_name="Finance Partner",
                due=now + timedelta(days=1),
                task_type="governance",
                status="due-soon",
                severity="high",
                related_stage="PRIORITIZATION",
            ),
            HypothesisTask(
                id="task-231",
                hypothesis=hyp_001,
                label="Approve pilot funding package",
                owner_name="Portfolio Council",
                due=now + timedelta(days=2),
                task_type="approval",
                status="due-soon",
                severity="medium",
                related_stage="PRIORITIZATION",
            ),
        ]
    )

    comment_001 = HypothesisComment(
        id="comm-001",
        hypothesis=hyp_001,
        author_name="Cassie Liu",
        author_email="cassie.liu@example.com",
        body="Updated the ROI assumptions based on latest finance data. @FinancePartner can you review?",
        is_resolved=False,
    )
    reply_001 = HypothesisComment(
        id="comm-001-reply-1",
        hypothesis=hyp_001,
        parent=comment_001,
        author_name="Finance Partner",
        author_email="finance.partner@example.com",
        body="@CassieLiu Reviewed and approved. The $3.2M target looks solid.",
        is_resolved=False,
    )
    comment_002 = HypothesisComment(
        id="comm-002",
        hypothesis=hyp_001,
        author_name="Lab Squad Alpha",
        body="We've completed the baseline experiment. Ready to move forward with the prototype.",
        is_resolved=True,
    )
    hyp_001.comment_threads.extend([comment_001, reply_001, comment_002])

    attachment_001 = HypothesisAttachment(
        id="file-001",
        hypothesis=hyp_001,
        file_name="Maintenance data audit.pdf",
        file_type="application/pdf",
        file_size_bytes=2_400_000,
        url="https://files.example.com/file-001",
        version=1,
        uploaded_by="Cassie Liu",
        uploaded_by_email="cassie.liu@example.com",
        extra_metadata={"description": "Baseline dataset audit"},
        uploaded_at=now - timedelta(days=2),
    )
    hyp_001.attachment_records.append(attachment_001)

    hyp_001.approval_records.extend(
        [
            HypothesisApproval(
                id="apr-001",
                hypothesis=hyp_001,
                approver_name="Portfolio Council",
                approver_email="council@example.com",
                approver_role="Portfolio Manager",
                status="pending",
                required=True,
            ),
            HypothesisApproval(
                id="apr-002",
                hypothesis=hyp_001,
                approver_name="Finance Partner",
                approver_email="finance.partner@example.com",
                approver_role="Finance",
                status="pending",
                required=True,
            ),
        ]
    )

    activity_events_001 = [
        HypothesisActivityEvent(
            id="ACT-311",
            hypothesis=hyp_001,
            event_type="STAGE_CHANGED",
            title="Stage advanced to Prioritization",
            actor_name="Cassie Liu",
            actor_email="cassie.liu@example.com",
            detail="Scope dossier signed off with updated ROI assumptions.",
            stage="PRIORITIZATION",
            impact="positive",
            extra_metadata={},
            occurred_at=now - timedelta(days=3),
        ),
        HypothesisActivityEvent(
            id="ACT-309",
            hypothesis=hyp_001,
            event_type="COMMENTED",
            title="Governance flagged outstanding ethics review",
            actor_name="Governance Bot",
            detail="Ethics checklist still missing risk classification for generative outputs.",
            stage="EVALUATION",
            impact="negative",
            extra_metadata={},
            occurred_at=now - timedelta(days=2),
        ),
    ]
    hyp_001.activity_events.extend(activity_events_001)

    hyp_004 = HypothesisRecord(
        hyp_id="HYP-004",
        lab_id="LAB-ALPHA",
        title="Vision defect detection line A",
        statement="Automated vision detection will reduce false rejects by 40% on line A.",
        description="Deploy edge vision models on the packaging line with human-in-the-loop review for edge cases.",
        ai_type="CV",
        ai_subtype="Anomaly Detection",
        business_category="Manufacturing",
        priority="HIGH",
        stage="SCOPING",
        stage_health="warning",
        stage_history=[],
        impact_score=9.2,
        feasibility_score=6.1,
        confidence_score=0.62,
        complexity_score=7.4,
        risk_class="HIGH",
        data_requirements={
            "sources": ["Vision cameras", "Quality inspection logs"],
            "volume": "2 TB/week video",
            "quality": "MEDIUM",
            "refresh_cadence": "real-time streaming",
            "governance_notes": "Requires privacy review for recorded footage.",
        },
        roi_estimate={
            "currency": "USD",
            "one_time_cost": 650000,
            "ongoing_cost_per_period": 54000,
            "expected_roi": 3.4,
            "payback_period_weeks": 32,
            "value_driver": "Reduced scrap, improved throughput.",
        },
        time_estimate={
            "discovery_weeks": 4,
            "experiment_weeks": 10,
            "production_weeks": 12,
        },
        success_metrics=[
            {"label": "False reject rate", "target": 40, "unit": "%", "direction": "DECREASE"},
            {"label": "Inspector assist coverage", "target": 85, "unit": "%", "direction": "INCREASE"},
        ],
        gating_checklist=[],
        dependencies=["GPU-EDGE-CLUSTER"],
        linked_experiments=[],
        tags=["Manufacturing", "Vision"],
        links=[
            {
                "label": "Line A baseline metrics",
                "url": "https://dashboards.example.com/line-a-quality",
                "type": "DATASET",
            }
        ],
        attachments=[],
        governance_state="PENDING",
        notes="Need to resolve privacy concerns before moving to prioritization.",
        owners=[
            {
                "name": "Mila Novak",
                "email": "mila.novak@example.com",
                "role": "OWNER",
                "department": "Manufacturing Engineering",
            }
        ],
        sponsors=[
            {
                "name": "David Romero",
                "email": "david.romero@example.com",
                "role": "SPONSOR",
                "department": "Product",
            }
        ],
        observers=[
            {
                "name": "Nina Petrova",
                "email": "nina.petrova@example.com",
                "role": "OBSERVER",
                "department": "Governance",
            }
        ],
        activity_digest=[],
    )

    stage_history_entries_004 = [
        HypothesisStageHistoryEntry(
            hypothesis=hyp_004,
            from_stage=None,
            to_stage="IDEATION",
            changed_at=now - timedelta(days=18),
            changed_by="Mila Novak",
            notes="Initial discovery with production engineering.",
        ),
        HypothesisStageHistoryEntry(
            hypothesis=hyp_004,
            from_stage="IDEATION",
            to_stage="SCOPING",
            changed_at=now - timedelta(days=7),
            changed_by="Product Strategy",
            notes="Data availability assessment in progress.",
        ),
    ]
    hyp_004.stage_history_entries.extend(stage_history_entries_004)

    checklist_items_004 = [
        HypothesisChecklistItem(
            id="chk-101",
            hypothesis=hyp_004,
            label="Privacy impact assessment",
            owner_name="Legal",
            status="in-progress",
            due_at=now + timedelta(days=7),
        ),
        HypothesisChecklistItem(
            id="chk-102",
            hypothesis=hyp_004,
            label="GPU capacity confirmation",
            owner_name="Platform Ops",
            status="pending",
            due_at=now + timedelta(days=10),
        ),
    ]
    hyp_004.checklist_items.extend(checklist_items_004)

    hyp_004.task_records.append(
        HypothesisTask(
            id="task-304",
            hypothesis=hyp_004,
            label="Resolve privacy concerns with legal",
            owner_name="Legal",
            due=now + timedelta(days=5),
            task_type="governance",
            status="blocked",
            severity="high",
            related_stage="SCOPING",
        )
    )

    comment_101 = HypothesisComment(
        id="comm-101",
        hypothesis=hyp_004,
        author_name="Mila Novak",
        body="Need clarity on camera calibration schedule.",
        is_resolved=False,
    )
    hyp_004.comment_threads.append(comment_101)

    attachment_101 = HypothesisAttachment(
        id="file-101",
        hypothesis=hyp_004,
        file_name="LineA_calibration_plan.pdf",
        file_type="application/pdf",
        file_size_bytes=856000,
        url="https://files.example.com/file-101",
        version=1,
        uploaded_by="Ops Data Guild",
        uploaded_by_email="ops.data@example.com",
        extra_metadata={"category": "calibration"},
        uploaded_at=now - timedelta(days=1),
    )
    hyp_004.attachment_records.append(attachment_101)

    hyp_004.approval_records.append(
        HypothesisApproval(
            id="apr-101",
            hypothesis=hyp_004,
            approver_name="Scale Factory",
            approver_email="scale.factory@example.com",
            approver_role="Scale Lead",
            status="pending",
            required=True,
        )
    )

    activity_events_004 = [
        HypothesisActivityEvent(
            id="ACT-401",
            hypothesis=hyp_004,
            event_type="COMMENTED",
            title="Added note on camera calibration",
            actor_name="Mila Novak",
            detail="Need calibration schedule confirmation from maintenance.",
            stage="SCOPING",
            impact="neutral",
            extra_metadata={},
            occurred_at=now - timedelta(days=2),
        )
    ]
    hyp_004.activity_events.extend(activity_events_004)

    return [hyp_001, hyp_004]
