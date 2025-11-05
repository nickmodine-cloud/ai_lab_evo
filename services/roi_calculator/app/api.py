
from typing import List

from fastapi import APIRouter

from .schemas import ROICalculation

router = APIRouter(prefix="/roi", tags=["roi"])


SAMPLE_DATA = [
    {
        "calc_id": "ROI-2023-10-01",
        "hypothesis_id": "HYP-001",
        "roi_percent": 158.0,
        "payback_months": 5
    }
]


@router.get("/", response_model=List[ROICalculation])
def list_roi() -> List[ROICalculation]:
    """Return curated samples until the persistence layer is wired."""
    return SAMPLE_DATA
