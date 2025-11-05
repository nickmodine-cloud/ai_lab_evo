from __future__ import annotations

from fastapi import Depends
from sqlalchemy.orm import Session

from .database import get_session
from .repositories import HypothesisRepository
from .services import HypothesisService


def get_repository(session: Session = Depends(get_session)) -> HypothesisRepository:
    return HypothesisRepository(session)


def get_hypothesis_service(
    repository: HypothesisRepository = Depends(get_repository),
) -> HypothesisService:
    return HypothesisService(repository)
