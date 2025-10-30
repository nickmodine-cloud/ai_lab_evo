from __future__ import annotations

from datetime import datetime
from typing import Dict, List, Optional
from uuid import uuid4

from sqlalchemy import Column, DateTime, Text
from sqlalchemy.dialects.sqlite import JSON
from sqlmodel import Field, SQLModel


class OnboardingSession(SQLModel, table=True):
    __tablename__ = "onboarding_sessions"

    id: str = Field(default_factory=lambda: str(uuid4()), primary_key=True)
    user_id: str = Field(index=True)
    language: str
    mode: str
    industry: Optional[str] = Field(default=None, index=True)
    status: str = Field(default="active", index=True)
    readiness_score: Optional[int] = Field(default=None)
    consent_given: bool = Field(default=False)
    voice_consent: bool = Field(default=False)
    consent_timestamp: Optional[datetime] = Field(default=None, sa_column=Column(DateTime))
    time_horizon_months: int = Field(default=6)
    extracted_summary: Dict[str, List[str]] = Field(
        default_factory=dict, sa_column=Column(JSON, nullable=False, default={})
    )
    roadmap: Dict[str, List[Dict[str, str]]] = Field(
        default_factory=dict, sa_column=Column(JSON, nullable=False, default={})
    )
    checklist: List[Dict[str, str]] = Field(
        default_factory=list, sa_column=Column(JSON, nullable=False, default=[])
    )
    created_at: datetime = Field(default_factory=datetime.utcnow, sa_column=Column(DateTime))
    updated_at: datetime = Field(default_factory=datetime.utcnow, sa_column=Column(DateTime))
    deleted_at: Optional[datetime] = Field(default=None, sa_column=Column(DateTime))


class VoiceArtifact(SQLModel, table=True):
    __tablename__ = "voice_artifacts"

    id: str = Field(default_factory=lambda: str(uuid4()), primary_key=True)
    session_id: str = Field(foreign_key="onboarding_sessions.id", index=True)
    audio_path: str = Field(sa_column=Column(Text))
    audio_format: str = Field(default="webm")
    duration_seconds: Optional[float] = None
    transcript_text: Optional[str] = Field(default=None, sa_column=Column(Text))
    created_at: datetime = Field(default_factory=datetime.utcnow, sa_column=Column(DateTime))


class TranscriptEntry(SQLModel, table=True):
    __tablename__ = "transcript_entries"

    id: str = Field(default_factory=lambda: str(uuid4()), primary_key=True)
    session_id: str = Field(foreign_key="onboarding_sessions.id", index=True)
    source: str = Field(default="voice")
    text: str = Field(sa_column=Column(Text))
    created_at: datetime = Field(default_factory=datetime.utcnow, sa_column=Column(DateTime))


class EventLog(SQLModel, table=True):
    __tablename__ = "event_logs"

    id: str = Field(default_factory=lambda: str(uuid4()), primary_key=True)
    session_id: str = Field(foreign_key="onboarding_sessions.id", index=True)
    event_type: str = Field(index=True)
    payload: Dict[str, str] = Field(default_factory=dict, sa_column=Column(JSON, nullable=False, default={}))
    created_at: datetime = Field(default_factory=datetime.utcnow, sa_column=Column(DateTime))
