
from typing import List

from fastapi import APIRouter

from .schemas import Dashboard

router = APIRouter(prefix="/dashboards", tags=["dashboards"])


SAMPLE_DATA = [
    {
        "dashboard_id": "CEO",
        "title": "Executive Overview",
        "widgets": 9
    }
]


@router.get("/", response_model=List[Dashboard])
def list_dashboards() -> List[Dashboard]:
    """Return curated samples until the persistence layer is wired."""
    return SAMPLE_DATA
