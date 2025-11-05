
from typing import List

from fastapi import APIRouter

from .schemas import Experiment

router = APIRouter(prefix="/experiments", tags=["experiments"])


SAMPLE_DATA = [
    {
        "exp_id": "EXP-101",
        "hypothesis_id": "HYP-001",
        "status": "RUNNING",
        "owner": "Arjun Patel"
    }
]


@router.get("/", response_model=List[Experiment])
def list_experiments() -> List[Experiment]:
    """Return curated samples until the persistence layer is wired."""
    return SAMPLE_DATA
