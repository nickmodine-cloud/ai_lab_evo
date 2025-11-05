
from typing import List

from fastapi import APIRouter

from .schemas import Approval

router = APIRouter(prefix="/governance", tags=["governance"])


SAMPLE_DATA = [
    {
        "approval_id": "APR-9001",
        "hypothesis_id": "HYP-001",
        "status": "PENDING"
    }
]


@router.get("/", response_model=List[Approval])
def list_governance() -> List[Approval]:
    """Return curated samples until the persistence layer is wired."""
    return SAMPLE_DATA
