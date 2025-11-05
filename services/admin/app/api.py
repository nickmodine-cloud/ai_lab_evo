
from typing import List

from fastapi import APIRouter

from .schemas import DictionaryItem

router = APIRouter(prefix="/admin", tags=["admin"])


SAMPLE_DATA = [
    {
        "dictionary": "industries",
        "code": "FIN",
        "label": "Financial Services"
    }
]


@router.get("/", response_model=List[DictionaryItem])
def list_admin() -> List[DictionaryItem]:
    """Return curated samples until the persistence layer is wired."""
    return SAMPLE_DATA
