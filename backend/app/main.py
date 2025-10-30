from __future__ import annotations

import base64
from datetime import datetime
from pathlib import Path
from typing import List, Optional
from uuid import uuid4

from fastapi import Depends, FastAPI, HTTPException, Query, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, HTMLResponse, PlainTextResponse
from fastapi.staticfiles import StaticFiles
from sqlmodel import Session, select

from .database import engine, init_db
from .models import EventLog, OnboardingSession, TranscriptEntry, VoiceArtifact
from .schemas import (
    ChecklistStatusUpdate,
    CompletionRequest,
    EventRead,
    VoiceArtifactRead,
    VoiceEditRequest,
    VoiceInputRequest,
    RoadmapRequest,
    SessionCreate,
    SessionRead,
    SummaryUpdate,
    TextInputRequest,
    TranscriptEntryRead,
)
from .services import (
    apply_voice_command,
    calculate_readiness_score,
    extract_summary_from_text,
    generate_checklist,
    generate_roadmap,
    build_markdown_report,
    merge_summary,
)

app = FastAPI(title="K2Tech AI Lab Onboarding Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

frontend_path = Path(__file__).resolve().parents[2] / "frontend"
if frontend_path.exists():
    app.mount("/app", StaticFiles(directory=frontend_path, html=True), name="frontend")

storage_path = Path(__file__).resolve().parents[2] / "storage"
storage_path.mkdir(exist_ok=True)
app.mount("/storage", StaticFiles(directory=storage_path), name="storage")


def get_session() -> Session:
    with Session(engine) as session:
        yield session


def _fetch_voice_assets(session_id: str, session: Session) -> List[VoiceArtifact]:
    return session.exec(
        select(VoiceArtifact)
        .where(VoiceArtifact.session_id == session_id)
        .order_by(VoiceArtifact.created_at)
    ).all()


def _session_to_read(entity: OnboardingSession, session: Session) -> SessionRead:
    voice_assets = _fetch_voice_assets(entity.id, session)
    payload = entity.dict()
    payload["voice_assets"] = [VoiceArtifactRead(**asset.dict()) for asset in voice_assets]
    return SessionRead(**payload)


@app.on_event("startup")
def on_startup() -> None:
    init_db()


@app.get("/", response_class=HTMLResponse)
def serve_index() -> HTMLResponse:
    index_file = frontend_path / "index.html"
    if index_file.exists():
        return HTMLResponse(index_file.read_text(encoding="utf-8"))
    return HTMLResponse("<h1>K2Tech AI Lab Onboarding Service</h1>")


@app.post("/onboarding/sessions", response_model=SessionRead, status_code=201)
def create_session(payload: SessionCreate, session: Session = Depends(get_session)) -> SessionRead:
    if not payload.policy_consent:
        raise HTTPException(status_code=400, detail="Policy consent is required")

    consent_timestamp = datetime.utcnow()
    entity = OnboardingSession(
        user_id=payload.user_id,
        language=payload.language,
        mode=payload.mode,
        industry=payload.industry,
        consent_given=payload.policy_consent,
        voice_consent=payload.voice_consent,
        consent_timestamp=consent_timestamp,
    )
    session.add(entity)
    session.add(
        EventLog(
            session_id=entity.id,
            event_type="OnboardingSessionCreated",
            payload={
                "language": payload.language,
                "mode": payload.mode,
                "industry": payload.industry,
                "voice_consent": payload.voice_consent,
            },
        )
    )
    session.commit()
    session.refresh(entity)
    return _session_to_read(entity, session)


@app.get("/onboarding/sessions", response_model=List[SessionRead])
def list_sessions(
    language: Optional[str] = Query(default=None),
    status: Optional[str] = Query(default=None),
    mode: Optional[str] = Query(default=None),
    industry: Optional[str] = Query(default=None),
    session: Session = Depends(get_session),
) -> List[SessionRead]:
    statement = select(OnboardingSession).where(OnboardingSession.deleted_at.is_(None))
    if language:
        statement = statement.where(OnboardingSession.language == language)
    if status:
        statement = statement.where(OnboardingSession.status == status)
    if mode:
        statement = statement.where(OnboardingSession.mode == mode)
    if industry:
        statement = statement.where(OnboardingSession.industry == industry)

    sessions = session.exec(statement.order_by(OnboardingSession.created_at.desc())).all()
    return [_session_to_read(item, session) for item in sessions]


@app.get("/onboarding/sessions/{session_id}", response_model=SessionRead)
def get_session_details(session_id: str, session: Session = Depends(get_session)) -> SessionRead:
    entity = session.get(OnboardingSession, session_id)
    if not entity or entity.deleted_at is not None:
        raise HTTPException(status_code=404, detail="Session not found")
    return _session_to_read(entity, session)


@app.post("/onboarding/sessions/{session_id}/voice-input", response_model=SessionRead)
def ingest_voice_input(
    session_id: str,
    payload: VoiceInputRequest,
    session: Session = Depends(get_session),
) -> SessionRead:
    entity = session.get(OnboardingSession, session_id)
    if not entity or entity.deleted_at is not None:
        raise HTTPException(status_code=404, detail="Session not found")

    try:
        audio_bytes = base64.b64decode(payload.audio_base64)
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=400, detail="Invalid audio payload") from exc

    audio_dir = Path("storage") / "voice" / session_id
    audio_dir.mkdir(parents=True, exist_ok=True)
    extension = payload.audio_format.lower().lstrip(".") or "webm"
    file_path = audio_dir / f"{uuid4()}.{extension}"
    file_path.write_bytes(audio_bytes)

    transcript_text = (payload.transcript or "").strip()
    if transcript_text:
        entity.extracted_summary = extract_summary_from_text(transcript_text, entity.extracted_summary)
        session.add(
            TranscriptEntry(session_id=session_id, source="voice", text=transcript_text)
        )

    voice_asset = VoiceArtifact(
        session_id=session_id,
        audio_path=file_path.as_posix(),
        audio_format=extension,
        duration_seconds=payload.duration_seconds,
        transcript_text=transcript_text or None,
    )
    session.add(voice_asset)

    entity.updated_at = datetime.utcnow()
    session.add(
        EventLog(
            session_id=session_id,
            event_type="OnboardingVoiceProcessed",
            payload={
                "audio_format": extension,
                "duration_seconds": payload.duration_seconds,
                "has_transcript": bool(transcript_text),
            },
        )
    )
    session.add(entity)
    session.commit()
    session.refresh(entity)
    return _session_to_read(entity, session)


@app.post("/onboarding/sessions/{session_id}/text-input", response_model=SessionRead)
def ingest_text(session_id: str, payload: TextInputRequest, session: Session = Depends(get_session)) -> SessionRead:
    entity = session.get(OnboardingSession, session_id)
    if not entity or entity.deleted_at is not None:
        raise HTTPException(status_code=404, detail="Session not found")

    entry = TranscriptEntry(session_id=session_id, source=payload.source, text=payload.text)
    session.add(entry)

    summary = extract_summary_from_text(payload.text, entity.extracted_summary)
    entity.extracted_summary = summary
    entity.updated_at = datetime.utcnow()

    session.add(
        EventLog(
            session_id=session_id,
            event_type="OnboardingVoiceProcessed" if payload.source == "voice" else "OnboardingTextProcessed",
            payload={"length": len(payload.text)},
        )
    )
    session.add(entity)
    session.commit()
    session.refresh(entity)
    return _session_to_read(entity, session)


@app.post("/onboarding/sessions/{session_id}/generate-roadmap", response_model=SessionRead)
def generate_session_roadmap(session_id: str, payload: RoadmapRequest, session: Session = Depends(get_session)) -> SessionRead:
    entity = session.get(OnboardingSession, session_id)
    if not entity or entity.deleted_at is not None:
        raise HTTPException(status_code=404, detail="Session not found")

    entity.roadmap = generate_roadmap(entity.extracted_summary, payload.time_horizon_months)
    entity.time_horizon_months = payload.time_horizon_months
    entity.updated_at = datetime.utcnow()

    session.add(
        EventLog(
            session_id=session_id,
            event_type="RoadmapGenerated",
            payload={"time_horizon_months": payload.time_horizon_months},
        )
    )
    session.add(entity)
    session.commit()
    session.refresh(entity)
    return _session_to_read(entity, session)


@app.post("/onboarding/sessions/{session_id}/generate-checklist", response_model=SessionRead)
def generate_session_checklist(session_id: str, payload: RoadmapRequest, session: Session = Depends(get_session)) -> SessionRead:
    entity = session.get(OnboardingSession, session_id)
    if not entity or entity.deleted_at is not None:
        raise HTTPException(status_code=404, detail="Session not found")

    items = generate_checklist(entity.extracted_summary, payload.time_horizon_months)
    entity.checklist = [
        {**item.dict(), "due_date": item.due_date.isoformat()}
        for item in items
    ]
    entity.time_horizon_months = payload.time_horizon_months
    entity.updated_at = datetime.utcnow()

    session.add(
        EventLog(
            session_id=session_id,
            event_type="ChecklistGenerated",
            payload={"items": len(items)},
        )
    )
    session.add(entity)
    session.commit()
    session.refresh(entity)
    return _session_to_read(entity, session)


@app.patch("/onboarding/sessions/{session_id}/summary", response_model=SessionRead)
def update_summary(session_id: str, payload: SummaryUpdate, session: Session = Depends(get_session)) -> SessionRead:
    entity = session.get(OnboardingSession, session_id)
    if not entity or entity.deleted_at is not None:
        raise HTTPException(status_code=404, detail="Session not found")

    manual = {
        "role": [payload.role] if payload.role else [],
        "goals": payload.goals or [],
        "barriers": payload.barriers or [],
        "current_state": [payload.current_state] if payload.current_state else [],
    }
    entity.extracted_summary = merge_summary(entity.extracted_summary, manual)
    entity.updated_at = datetime.utcnow()

    session.add(
        EventLog(
            session_id=session_id,
            event_type="OnboardingSummaryUpdated",
            payload={"fields": [key for key, value in manual.items() if value]},
        )
    )
    session.add(entity)
    session.commit()
    session.refresh(entity)
    return _session_to_read(entity, session)


@app.post("/onboarding/sessions/{session_id}/voice-edit", response_model=SessionRead)
def apply_voice_edit(
    session_id: str,
    payload: VoiceEditRequest,
    session: Session = Depends(get_session),
) -> SessionRead:
    entity = session.get(OnboardingSession, session_id)
    if not entity or entity.deleted_at is not None:
        raise HTTPException(status_code=404, detail="Session not found")

    summary, checklist, horizon, applied = apply_voice_command(
        payload.command,
        entity.extracted_summary,
        entity.checklist,
        entity.time_horizon_months,
    )

    normalized_checklist = []
    for item in checklist:
        normalized = dict(item)
        due_value = normalized.get("due_date")
        if hasattr(due_value, "isoformat"):
            normalized["due_date"] = due_value.isoformat()
        normalized_checklist.append(normalized)

    entity.extracted_summary = summary
    entity.checklist = normalized_checklist
    entity.time_horizon_months = horizon
    entity.readiness_score = calculate_readiness_score(entity.checklist)
    entity.updated_at = datetime.utcnow()

    session.add(TranscriptEntry(session_id=session_id, source="edit", text=payload.command))
    session.add(
        EventLog(
            session_id=session_id,
            event_type="OnboardingVoiceEditApplied",
            payload={"command": payload.command, "applied": applied},
        )
    )
    session.add(entity)
    session.commit()
    session.refresh(entity)
    return _session_to_read(entity, session)


@app.post("/onboarding/sessions/{session_id}/checklist/status", response_model=SessionRead)
def update_checklist_item(session_id: str, payload: ChecklistStatusUpdate, session: Session = Depends(get_session)) -> SessionRead:
    entity = session.get(OnboardingSession, session_id)
    if not entity or entity.deleted_at is not None:
        raise HTTPException(status_code=404, detail="Session not found")

    found = False
    for item in entity.checklist:
        if item["id"] == payload.item_id:
            item["status"] = payload.status
            found = True
            break

    if not found:
        raise HTTPException(status_code=404, detail="Checklist item not found")

    entity.readiness_score = calculate_readiness_score(entity.checklist)
    entity.updated_at = datetime.utcnow()

    session.add(
        EventLog(
            session_id=session_id,
            event_type="ChecklistItemUpdated",
            payload={"item_id": payload.item_id, "status": payload.status},
        )
    )
    session.add(entity)
    session.commit()
    session.refresh(entity)
    return _session_to_read(entity, session)


@app.post("/onboarding/sessions/{session_id}/complete", response_model=SessionRead)
def complete_session(session_id: str, payload: CompletionRequest, session: Session = Depends(get_session)) -> SessionRead:
    entity = session.get(OnboardingSession, session_id)
    if not entity or entity.deleted_at is not None:
        raise HTTPException(status_code=404, detail="Session not found")

    entity.status = "completed"
    entity.readiness_score = calculate_readiness_score(entity.checklist)
    entity.updated_at = datetime.utcnow()

    session.add(
        EventLog(
            session_id=session_id,
            event_type="OnboardingCompleted",
            payload={"notes": payload.notes or ""},
        )
    )
    session.add(entity)
    session.commit()
    session.refresh(entity)
    return _session_to_read(entity, session)


@app.get("/onboarding/sessions/{session_id}/transcript", response_model=List[TranscriptEntryRead])
def get_transcript(session_id: str, session: Session = Depends(get_session)) -> List[TranscriptEntryRead]:
    entries = session.exec(
        select(TranscriptEntry).where(TranscriptEntry.session_id == session_id).order_by(TranscriptEntry.created_at)
    ).all()
    return [TranscriptEntryRead(**entry.dict()) for entry in entries]


@app.get("/onboarding/sessions/{session_id}/events", response_model=List[EventRead])
def get_events(session_id: str, session: Session = Depends(get_session)) -> List[EventRead]:
    entries = session.exec(
        select(EventLog).where(EventLog.session_id == session_id).order_by(EventLog.created_at)
    ).all()
    return [EventRead(**entry.dict()) for entry in entries]


@app.delete("/onboarding/sessions/{session_id}", status_code=204)
def delete_session(
    session_id: str,
    reason: Optional[str] = Query(default=None, max_length=250),
    session: Session = Depends(get_session),
) -> Response:
    entity = session.get(OnboardingSession, session_id)
    if not entity or entity.deleted_at is not None:
        raise HTTPException(status_code=404, detail="Session not found")

    entity.status = "deleted"
    entity.deleted_at = datetime.utcnow()
    entity.updated_at = datetime.utcnow()

    session.add(
        EventLog(
            session_id=session_id,
            event_type="OnboardingSessionDeleted",
            payload={"reason": reason or ""},
        )
    )
    session.add(entity)
    session.commit()
    return Response(status_code=204)


@app.get("/onboarding/sessions/{session_id}/export-pdf")
def export_pdf(session_id: str, session: Session = Depends(get_session)) -> Response:
    entity = session.get(OnboardingSession, session_id)
    if not entity:
        raise HTTPException(status_code=404, detail="Session not found")

    voice_assets = _fetch_voice_assets(session_id, session)
    pdf_path = _generate_pdf(entity, voice_assets)
    return FileResponse(pdf_path, media_type="application/pdf", filename=f"onboarding-{session_id}.pdf")


@app.get("/onboarding/sessions/{session_id}/export-markdown", response_class=PlainTextResponse)
def export_markdown(session_id: str, session: Session = Depends(get_session)) -> PlainTextResponse:
    entity = session.get(OnboardingSession, session_id)
    if not entity:
        raise HTTPException(status_code=404, detail="Session not found")

    voice_assets = _fetch_voice_assets(session_id, session)
    markdown = build_markdown_report(entity, voice_assets)
    return PlainTextResponse(markdown, media_type="text/markdown")


def _generate_pdf(session: OnboardingSession, voice_assets: List[VoiceArtifact]) -> Path:
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.styles import getSampleStyleSheet
    from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer

    output_dir = Path("storage")
    output_dir.mkdir(exist_ok=True)
    pdf_path = output_dir / f"onboarding-{session.id}.pdf"

    doc = SimpleDocTemplate(str(pdf_path), pagesize=A4)
    styles = getSampleStyleSheet()
    story: List[object] = []

    story.append(Paragraph("<b>K2Tech AI Lab Onboarding Summary</b>", styles["Title"]))
    story.append(Spacer(1, 12))
    story.append(Paragraph(f"Language: {session.language} | Mode: {session.mode}", styles["Normal"]))
    story.append(
        Paragraph(
            f"Status: {session.status} | Readiness: {session.readiness_score or 0}% | Time horizon: {session.time_horizon_months}m",
            styles["Normal"],
        )
    )
    if session.industry:
        story.append(Paragraph(f"Industry: {session.industry}", styles["Normal"]))
    story.append(Spacer(1, 12))

    if voice_assets:
        story.append(Paragraph("<b>Voice Artefacts</b>", styles["Heading2"]))
        for asset in voice_assets:
            duration = f" ({asset.duration_seconds:.1f}s)" if asset.duration_seconds else ""
            transcript = asset.transcript_text or "—"
            story.append(
                Paragraph(
                    f"{asset.created_at.isoformat()} — {asset.audio_format}{duration} → {asset.audio_path}",
                    styles["Normal"],
                )
            )
            story.append(Paragraph(f"Transcript: {transcript}", styles["Normal"]))
        story.append(Spacer(1, 12))
    story.append(Spacer(1, 12))

    story.append(Paragraph("<b>Extracted Summary</b>", styles["Heading2"]))
    for key, values in session.extracted_summary.items():
        story.append(Paragraph(f"{key.title()}: {', '.join(values) if values else '—'}", styles["Normal"]))
    story.append(Spacer(1, 12))

    story.append(Paragraph("<b>Roadmap</b>", styles["Heading2"]))
    for phase, items in session.roadmap.items():
        story.append(Paragraph(f"{phase}", styles["Heading3"]))
        for item in items:
            story.append(
                Paragraph(
                    f"- {item['title']} (Due month {item['due_month']})", styles["Normal"]
                )
            )
    story.append(Spacer(1, 12))

    story.append(Paragraph("<b>Checklist</b>", styles["Heading2"]))
    for item in session.checklist:
        story.append(
            Paragraph(
                f"- [{item['status']}] {item['category']}: {item['title']} — due {item['due_date']}",
                styles["Normal"],
            )
        )

    doc.build(story)
    return pdf_path
