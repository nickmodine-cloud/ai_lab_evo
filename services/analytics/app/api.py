
from typing import List

from fastapi import APIRouter

from .schemas import Metric

router = APIRouter(prefix="/analytics", tags=["analytics"])


SAMPLE_DATA = [
    {
        "metric_id": "time_in_stage",
        "stage": "PRIORITIZATION",
        "value": 11.3
    }
]


@router.get("/", response_model=List[Metric])
def list_analytics() -> List[Metric]:
    """Return curated samples until the persistence layer is wired."""
    return SAMPLE_DATA
