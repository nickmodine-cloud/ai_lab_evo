from __future__ import annotations

from datetime import date, datetime
from datetime import date, datetime
from typing import Dict, List, Optional

from pydantic import BaseModel, Field


class SessionCreate(BaseModel):
    user_id: str
    language: str
    mode: str
    industry: Optional[str] = None
    policy_consent: bool = Field(..., description="Согласие с политикой обработки данных")
    voice_consent: bool = Field(..., description="Согласие на запись и обработку голоса")


class SummaryUpdate(BaseModel):
    role: Optional[str] = None
    goals: Optional[List[str]] = None
    barriers: Optional[List[str]] = None
    current_state: Optional[str] = None


class SessionRead(BaseModel):
    id: str
    user_id: str
    language: str
    mode: str
    industry: Optional[str]
    status: str
    readiness_score: Optional[int]
    consent_given: bool
    voice_consent: bool
    consent_timestamp: Optional[datetime]
    time_horizon_months: int
    extracted_summary: Dict[str, object]
    roadmap: Dict[str, List[Dict[str, object]]]
    checklist: List[Dict[str, object]]
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime]
    voice_assets: List["VoiceArtifactRead"] = Field(default_factory=list)


class TextInputRequest(BaseModel):
    text: str
    source: str = Field(default="text", pattern=r"^(voice|text|edit)$")


class VoiceInputRequest(BaseModel):
    audio_base64: str = Field(..., description="base64 представление аудио")
    audio_format: str = Field(default="webm", pattern=r"^[a-z0-9]+$")
    duration_seconds: Optional[float] = Field(default=None, ge=0)
    transcript: Optional[str] = None


class RoadmapRequest(BaseModel):
    time_horizon_months: int = Field(gt=0, le=24)


class ChecklistStatusUpdate(BaseModel):
    item_id: str
    status: str = Field(pattern=r"^(pending|in_progress|completed)$")


class CompletionRequest(BaseModel):
    notes: Optional[str] = None


class VoiceEditRequest(BaseModel):
    command: str = Field(..., min_length=3, max_length=500)


class TranscriptEntryRead(BaseModel):
    id: str
    session_id: str
    source: str
    text: str
    created_at: datetime


class ChecklistItem(BaseModel):
    id: str
    category: str
    title: str
    description: str
    due_date: date
    priority: str
    status: str


class EventRead(BaseModel):
    id: str
    session_id: str
    event_type: str
    payload: Dict[str, object]
    created_at: datetime


class VoiceArtifactRead(BaseModel):
    id: str
    session_id: str
    audio_path: str
    audio_format: str
    duration_seconds: Optional[float]
    transcript_text: Optional[str]
    created_at: datetime
