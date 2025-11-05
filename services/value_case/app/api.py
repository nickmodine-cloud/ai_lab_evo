
from typing import List

from fastapi import APIRouter

from .schemas import ValueCase

router = APIRouter(prefix="/value-cases", tags=["value-cases"])


SAMPLE_DATA = [
    {
        "case_id": "VAL-010",
        "title": "Intelligent ticket routing",
        "sponsor": "COO",
        "currency": "USD"
    }
]


@router.get("/", response_model=List[ValueCase])
def list_value_cases() -> List[ValueCase]:
    """Return curated samples until the persistence layer is wired."""
    return SAMPLE_DATA
