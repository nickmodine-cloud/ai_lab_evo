
from typing import List

from fastapi import APIRouter

from .schemas import Identity

router = APIRouter(prefix="/iam", tags=["iam"])


SAMPLE_DATA = [
    {
        "user_id": "USR-204",
        "name": "Mila Torres",
        "role": "AI_CURATOR"
    }
]


@router.get("/", response_model=List[Identity])
def list_iam() -> List[Identity]:
    """Return curated samples until the persistence layer is wired."""
    return SAMPLE_DATA
