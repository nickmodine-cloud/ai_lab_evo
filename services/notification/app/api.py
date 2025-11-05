
from typing import List

from fastapi import APIRouter

from .schemas import Notification

router = APIRouter(prefix="/notifications", tags=["notifications"])


SAMPLE_DATA = [
    {
        "notification_id": "NTF-778",
        "title": "Approval requested",
        "channel": "app"
    }
]


@router.get("/", response_model=List[Notification])
def list_notifications() -> List[Notification]:
    """Return curated samples until the persistence layer is wired."""
    return SAMPLE_DATA
