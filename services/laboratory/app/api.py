
from typing import List

from fastapi import APIRouter

from .schemas import Lab

router = APIRouter(prefix="/labs", tags=["labs"])


SAMPLE_DATA = [
    {
        "lab_id": "LAB-01",
        "name": "Retail Growth",
        "owner": "Cassie Liu"
    }
]


@router.get("/", response_model=List[Lab])
def list_labs() -> List[Lab]:
    """Return curated samples until the persistence layer is wired."""
    return SAMPLE_DATA
