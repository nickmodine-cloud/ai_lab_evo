from __future__ import annotations

import itertools
import math
import re
from datetime import date, timedelta
from typing import Dict, Iterable, List, Tuple, TYPE_CHECKING
from uuid import uuid4

from .schemas import ChecklistItem

if TYPE_CHECKING:
    from .models import OnboardingSession, VoiceArtifact


ROLE_PATTERNS = [
    re.compile(pattern, re.IGNORECASE)
    for pattern in [
        r"i am the (?P<role>[a-z\s]+)",
        r"my role is (?P<role>[a-z\s]+)",
        r"as a (?P<role>[a-z\s]+)",
    ]
]

GOAL_PATTERNS = [
    re.compile(pattern, re.IGNORECASE)
    for pattern in [
        r"our goal is (?P<goal>.+?)\.",
        r"we need to (?P<goal>.+?)\.",
        r"i want to (?P<goal>.+?)\.",
    ]
]

BARRIER_PATTERNS = [
    re.compile(pattern, re.IGNORECASE)
    for pattern in [
        r"our barrier is (?P<barrier>.+?)\.",
        r"we struggle with (?P<barrier>.+?)\.",
        r"the main challenge is (?P<barrier>.+?)\.",
    ]
]

STATE_PATTERNS = [
    re.compile(pattern, re.IGNORECASE)
    for pattern in [
        r"current state:? (?P<state>.+?)\.",
        r"today we (?P<state>.+?)\.",
        r"right now (?P<state>.+?)\.",
    ]
]


def extract_summary_from_text(text: str, current_summary: Dict[str, List[str]]) -> Dict[str, List[str]]:
    summary = {key: list(value) for key, value in current_summary.items()}
    summary.setdefault("role", [])
    summary.setdefault("goals", [])
    summary.setdefault("barriers", [])
    summary.setdefault("current_state", [])

    for pattern in ROLE_PATTERNS:
        for match in pattern.finditer(text):
            role = match.group("role").strip().capitalize()
            if role and role not in summary["role"]:
                summary["role"].append(role)

    for pattern in GOAL_PATTERNS:
        for match in pattern.finditer(text):
            goal = match.group("goal").strip().rstrip(".")
            if goal and goal not in summary["goals"]:
                summary["goals"].append(goal)

    for pattern in BARRIER_PATTERNS:
        for match in pattern.finditer(text):
            barrier = match.group("barrier").strip().rstrip(".")
            if barrier and barrier not in summary["barriers"]:
                summary["barriers"].append(barrier)

    for pattern in STATE_PATTERNS:
        for match in pattern.finditer(text):
            state = match.group("state").strip().rstrip(".")
            if state and state not in summary["current_state"]:
                summary["current_state"].append(state)

    return summary


def _phase_window(time_horizon_months: int) -> List[Tuple[str, int]]:
    if time_horizon_months <= 3:
        return [("Discovery", 1), ("Pilot", 2), ("Scale", 3)]
    if time_horizon_months <= 6:
        return [("Discovery", 1), ("Pilot", 3), ("Scale", 6)]
    return [("Discovery", 3), ("Pilot", math.ceil(time_horizon_months / 2)), ("Scale", time_horizon_months)]


def generate_roadmap(summary: Dict[str, List[str]], time_horizon_months: int) -> Dict[str, List[Dict[str, str]]]:
    phases = _phase_window(time_horizon_months)
    roadmap: Dict[str, List[Dict[str, str]]] = {}

    goals = summary.get("goals") or ["Launch AI lab with measurable ROI"]
    barriers = summary.get("barriers") or ["Limited data maturity"]

    for idx, (phase_name, due_month) in enumerate(phases, start=1):
        roadmap[phase_name] = []
        for goal in goals:
            roadmap[phase_name].append(
                {
                    "id": str(uuid4()),
                    "title": f"Phase {idx}: {goal}",
                    "due_month": due_month,
                    "dependency": goals[max(idx - 2, 0)] if len(goals) > 1 and idx > 1 else None,
                    "barrier_focus": barriers[0],
                }
            )

    return roadmap


CHECKLIST_CATEGORIES = [
    ("Команда", "team"),
    ("Данные", "data"),
    ("Инфраструктура", "infrastructure"),
    ("Методология", "methodology"),
    ("Бюджет", "budget"),
]


def _due_date(month_offset: int) -> date:
    return date.today() + timedelta(days=30 * month_offset)


def generate_checklist(summary: Dict[str, List[str]], time_horizon_months: int) -> List[ChecklistItem]:
    items: List[ChecklistItem] = []
    goals = summary.get("goals") or ["Validate 3 AI opportunities"]

    for index, ((title, key), goal) in enumerate(zip(CHECKLIST_CATEGORIES, itertools.cycle(goals)), start=1):
        description = f"Ensure {key} readiness to support goal: {goal}" if goal else f"Ensure {key} readiness"
        due_date = _due_date(min(time_horizon_months, index + 1))
        items.append(
            ChecklistItem(
                id=str(uuid4()),
                category=title,
                title=f"{title} readiness",
                description=description,
                due_date=due_date,
                priority="high" if index <= 2 else "medium",
                status="pending",
            )
        )

    return items


def calculate_readiness_score(checklist: Iterable[Dict[str, str]]) -> int:
    total = 0
    completed = 0
    for item in checklist:
        total += 1
        if item.get("status") == "completed":
            completed += 1
    if total == 0:
        return 0
    return round((completed / total) * 100)


def merge_summary(base: Dict[str, List[str]], override: Dict[str, List[str]]) -> Dict[str, List[str]]:
    merged: Dict[str, List[str]] = {}
    for key in {"role", "goals", "barriers", "current_state"}:
        merged[key] = list(dict.fromkeys((override.get(key) or []) + (base.get(key) or [])))
    return merged


VOICE_ADD_CHECKLIST = re.compile(r"add checklist item (?P<category>[\w\s]+): (?P<title>.+)", re.IGNORECASE)
VOICE_MARK_CHECKLIST = re.compile(
    r"mark (?P<title>.+?) as (?P<status>pending|in progress|completed)", re.IGNORECASE
)
VOICE_ADD_GOAL = re.compile(r"add goal (?P<goal>.+)", re.IGNORECASE)
VOICE_SET_HORIZON = re.compile(r"set horizon (?P<months>\d+)", re.IGNORECASE)

VOICE_STATUS_MAPPING = {
    "pending": "pending",
    "in progress": "in_progress",
    "completed": "completed",
}


def apply_voice_command(
    command: str,
    summary: Dict[str, List[str]],
    checklist: List[Dict[str, str]],
    time_horizon_months: int,
) -> Tuple[Dict[str, List[str]], List[Dict[str, str]], int, Dict[str, object]]:
    """Parse elementary voice commands and mutate onboarding artefacts."""

    updated_summary = {key: list(values) for key, values in summary.items()}
    updated_checklist = [dict(item) for item in checklist]
    updated_horizon = time_horizon_months
    applied: Dict[str, object] = {}

    command = command.strip()

    if match := VOICE_ADD_CHECKLIST.search(command):
        category = match.group("category").strip().title()
        title = match.group("title").strip().rstrip(".")
        due_date = _due_date(min(updated_horizon, len(updated_checklist) + 1))
        new_item = ChecklistItem(
            id=str(uuid4()),
            category=category,
            title=title or f"{category} readiness",
            description=title or f"{category} readiness",
            due_date=due_date,
            priority="high" if category.lower() in {"команда", "team", "данные", "data"} else "medium",
            status="pending",
        )
        updated_checklist.append(new_item.dict())
        applied["added_checklist_item"] = new_item.dict()

    elif match := VOICE_MARK_CHECKLIST.search(command):
        title_fragment = match.group("title").strip().lower()
        status = VOICE_STATUS_MAPPING[match.group("status").lower()]
        for item in updated_checklist:
            if title_fragment in item["title"].lower():
                item["status"] = status
                applied["updated_checklist_item"] = {"id": item["id"], "status": status}
                break

    elif match := VOICE_ADD_GOAL.search(command):
        goal = match.group("goal").strip().rstrip(".")
        if goal and goal not in updated_summary.get("goals", []):
            updated_summary.setdefault("goals", []).append(goal)
            applied["added_goal"] = goal

    elif match := VOICE_SET_HORIZON.search(command):
        months = max(1, min(24, int(match.group("months"))))
        updated_horizon = months
        applied["time_horizon_months"] = months

    readiness = calculate_readiness_score(updated_checklist)
    return updated_summary, updated_checklist, updated_horizon, applied


def build_markdown_report(session: "OnboardingSession", voice_assets: Iterable["VoiceArtifact"]) -> str:
    lines: List[str] = []
    lines.append(f"# K2Tech AI Lab Onboarding — Session {session.id}")
    lines.append("")
    lines.append(f"**User:** {session.user_id} | **Language:** {session.language} | **Mode:** {session.mode}")
    if session.industry:
        lines.append(f"**Industry:** {session.industry}")
    lines.append(
        f"**Status:** {session.status} | **Readiness:** {session.readiness_score or 0}% | **Time Horizon:** {session.time_horizon_months}m"
    )
    lines.append("")

    lines.append("## Extracted Summary")
    for key, values in session.extracted_summary.items():
        label = key.replace("_", " ").title()
        rendered = ", ".join(values) if values else "—"
        lines.append(f"- **{label}:** {rendered}")
    lines.append("")

    lines.append("## Roadmap")
    for phase, items in session.roadmap.items():
        lines.append(f"### {phase}")
        for item in items:
            dependency = item.get("dependency")
            dep_text = f" (depends on {dependency})" if dependency else ""
            lines.append(
                f"- {item['title']} — due month {item['due_month']}{dep_text}"
            )
        lines.append("")

    lines.append("## Readiness Checklist")
    for item in session.checklist:
        lines.append(
            f"- [{item.get('status', 'pending')}] {item.get('category')}: {item.get('title')} — due {item.get('due_date')}"
        )
    lines.append("")

    voice_assets = list(voice_assets)
    if voice_assets:
        lines.append("## Voice Artefacts")
        for asset in voice_assets:
            duration = f" ({asset.duration_seconds:.1f}s)" if asset.duration_seconds else ""
            lines.append(
                f"- {asset.created_at.isoformat()} — {asset.audio_format}{duration} → {asset.audio_path}"
            )
        lines.append("")

    return "\n".join(lines).strip() + "\n"
